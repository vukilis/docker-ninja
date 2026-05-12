import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getComposeContent } from '../actions';

interface AppModalProps {
    app: any;
    allApps: any[];
    onAppChange: (app: any) => void;
    onClose: () => void;
}

function ModalContent({ 
    app, 
    composeCode, 
    loading, 
    categoryApps, 
    isGhost,
    copiedYaml, setCopiedYaml,
    copiedComposeCmd, setCopiedComposeCmd,
    copiedRunCmd, setCopiedRunCmd,
    copyToClipboard,
    handlePrev, handleNext, onClose,
    stopPropagation
}: any) {
    return (
        <div className={`flex flex-col h-full ${isGhost ? 'opacity-30 blur-[2px] pointer-events-none' : ''}`}>
            {/* HEADER */}
            <div className="flex justify-between items-center p-4 md:p-8 pb-4 border-b border-slate-100 dark:border-slate-800/50 z-30 bg-white dark:bg-[#0d1117] select-none">
                <div className="flex flex-col gap-1 min-w-0">
                    <h2 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter truncate">
                        {app.name}
                    </h2>
                    <div className="flex items-center gap-2">
                        <div className="h-1 w-8 bg-blue-600 rounded-full" />
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em]">
                            {app.category}
                            <span className="ml-1 px-2 py-0.5 rounded-md font-sans bg-slate-100 dark:bg-slate-800">{categoryApps.length}</span>
                        </span>
                    </div>
                </div>

                {!isGhost && (
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center bg-slate-100 dark:bg-slate-900/50 rounded-full p-1 border border-slate-200 dark:border-blue-900/30">
                            <button onClick={handlePrev} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-all text-slate-500 hover:text-blue-600 cursor-pointer">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <div className="w-[1px] h-4 bg-slate-300 dark:bg-slate-700 mx-1" />
                            <button onClick={handleNext} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-all text-slate-500 hover:text-blue-600 cursor-pointer">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="group relative flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 hover:border-red-500/50 hover:bg-red-500/5 transition-all duration-300 cursor-pointer"
                        >
                            <svg className="w-4 h-4 text-slate-500 group-hover:text-red-500 group-hover:rotate-90 transition-all duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            {/* CONTENT BODY */}
            <div className="overflow-y-auto p-4 md:p-8 flex-1 scroll-smooth">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-slate-900 dark:text-slate-200">
                    <div className="space-y-4 text-xs md:text-sm">
                        <div className="flex flex-row-reverse items-start justify-between bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-blue-900/30 p-4 rounded-md">
                            <div className="w-24 h-24 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 ml-4">
                                {app.icon_url ? <img src={app.icon_url} alt="" className="w-full h-full object-cover" /> : <span className="text-sm font-bold text-slate-400">{app.name.charAt(0)}</span>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-slate-500 dark:text-slate-400 uppercase text-xs mb-2 font-black tracking-widest">App Details</h3>
                                <div className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                                    {app.website && <p>Website: <a href={app.website} target="_blank" className="text-blue-600 dark:text-blue-400 hover:underline">Link</a></p>}
                                    {app.github && <p>GitHub: <a href={app.github} target="_blank" className="text-blue-600 dark:text-blue-400 hover:underline">Repo</a></p>}
                                    {app.docs && <p>Docs: <a href={app.docs} target="_blank" className="text-blue-600 dark:text-blue-400 hover:underline">Link</a></p>}
                                    {app.source && <p>Docker Hub: <a href={app.source} target="_blank" className="text-blue-600 dark:text-blue-400 hover:underline">View</a></p>}
                                    <p>Category: <span className="text-blue-600 dark:text-blue-400 font-semibold">{app.category}</span></p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-blue-900/30 p-4 rounded-md">
                            <h3 className="text-slate-500 dark:text-slate-400 uppercase text-xs mb-2 tracking-widest font-black">About</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{app.description || "No description."}</p>
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-4 min-h-[300px]">
                        {/* Use stopPropagation ONLY on the specific code window scroll, not the whole block */}
                        <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-blue-900/30 p-4 flex flex-col flex-1 overflow-hidden">
                            <h3 className="text-blue-600 dark:text-blue-400 mb-2 font-bold flex justify-between text-[10px] md:text-xs uppercase tracking-widest">
                                docker-compose.yml 
                                {!isGhost &&  <button 
                                onClick={() => copyToClipboard(composeCode, setCopiedYaml)} 
                                className={`ml-2 transition-colors cursor-pointer ${copiedYaml ? 'text-green-600 dark:text-green-500' : 'text-slate-500 hover:text-green-500'}`}
                                >
                                {copiedYaml ? "[COPIED!]" : "[COPY]"}
                                </button>}
                            </h3>
                            <div 
                                onTouchStart={stopPropagation} 
                                className="flex-1 overflow-auto bg-slate-50 dark:bg-[#0d1117] rounded p-2 border border-slate-200 dark:border-slate-800"
                            >
                                <pre className="text-[10px] md:text-xs text-slate-700 dark:text-slate-300 whitespace-pre">{loading ? "Loading..." : composeCode}</pre>
                            </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-blue-900/30 p-4 space-y-4">
                            <div className="text-[10px] md:text-xs">
                                <h3 className="text-blue-600 dark:text-blue-400 mb-1 font-bold flex justify-between uppercase">Compose Command
                                    {!isGhost && <button 
                                    onClick={() => copyToClipboard("docker compose up -d", setCopiedComposeCmd)} 
                                    className={`cursor-pointer transition-colors ${copiedComposeCmd ? 'text-green-600 dark:text-green-500' : 'text-slate-500 hover:text-green-500'}`}>
                                    {copiedComposeCmd ? "[COPIED!]" : "[COPY]"}
                                </button>}
                                </h3>
                                <div onTouchStart={stopPropagation} className="bg-slate-100 dark:bg-[#0d1117] p-2 rounded text-slate-800 dark:text-blue-300 border border-slate-200 dark:border-blue-900/50 overflow-x-auto whitespace-nowrap">$ docker compose up -d</div>
                            </div>
                            <div className="text-[10px] md:text-xs">
                                <h3 className="text-blue-600 dark:text-blue-400 mb-1 font-bold flex justify-between uppercase">Docker Run
                                    {!isGhost && <button 
                                    onClick={() => copyToClipboard(app.run_command || `docker run -d --name ${app.slug}`, setCopiedRunCmd)} 
                                    className={`cursor-pointer transition-colors ${copiedRunCmd ? 'text-green-600 dark:text-green-500' : 'text-slate-500 hover:text-green-500'}`}>
                                    {copiedRunCmd ? "[COPIED!]" : "[COPY]"}
                                </button>}
                                </h3>
                                <div onTouchStart={stopPropagation} className="bg-slate-100 dark:bg-[#0d1117] p-2 rounded text-slate-800 dark:text-blue-300 border border-slate-200 dark:border-blue-900/50 overflow-x-auto whitespace-nowrap">$ {app.run_command || `docker run -d --name ${app.slug}`}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function AppModal({ app, allApps, onAppChange, onClose }: AppModalProps) {
    const [composeCode, setComposeCode] = useState("Loading...");
    const [copiedYaml, setCopiedYaml] = useState(false);
    const [copiedComposeCmd, setCopiedComposeCmd] = useState(false);
    const [copiedRunCmd, setCopiedRunCmd] = useState(false);
    const [loading, setLoading] = useState(true);

    const [dragOffset, setDragOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const touchStartPos = useRef({ x: 0, y: 0 });
    const isScrolling = useRef(false);

    const categoryApps = allApps.filter(a => a.category === app.category);
    const currentIndex = categoryApps.findIndex(a => a.id === app.id);
    const nextApp = categoryApps[(currentIndex + 1) % categoryApps.length];
    const prevApp = categoryApps[(currentIndex - 1 + categoryApps.length) % categoryApps.length];
    const peekApp = dragOffset > 0 ? prevApp : nextApp;

    const handleNext = useCallback(() => onAppChange(nextApp), [nextApp, onAppChange]);
    const handlePrev = useCallback(() => onAppChange(prevApp), [prevApp, onAppChange]);

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartPos.current = { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY };
        setIsDragging(true);
        isScrolling.current = false;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging || isScrolling.current) return;
        
        const deltaX = e.targetTouches[0].clientX - touchStartPos.current.x;
        const deltaY = e.targetTouches[0].clientY - touchStartPos.current.y;

        // CRITICAL: If the user moves more vertically than horizontally, 
        // disable swiping immediately so the modal can scroll naturally.
        if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 5) {
            isScrolling.current = true;
            setDragOffset(0);
            return;
        }

        if (Math.abs(deltaX) > 10) {
            // Prevent browser refresh/back while swiping horizontally
            if (e.cancelable) e.preventDefault();
            setDragOffset(deltaX);
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        if (!isScrolling.current) {
            const threshold = 150; // Increase to require a longer swipe, decrease for a shorter swipe

            if (dragOffset < -threshold) {
                handleNext();
            } else if (dragOffset > threshold) {
                handlePrev();
            }
        }
        setDragOffset(0);
    };

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (event.key === 'ArrowRight') handleNext();
        else if (event.key === 'ArrowLeft') handlePrev();
        else if (event.key === 'Escape') onClose();
    }, [handleNext, handlePrev, onClose]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    useEffect(() => {
        setLoading(true);
        getComposeContent(app).then(setComposeCode).finally(() => setLoading(false));
    }, [app]);

    const copyToClipboard = (text: string, setCopied: (val: boolean) => void) => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
        } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!app) return null;

    const stopPropagation = (e: any) => e.stopPropagation();

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 md:p-4 overflow-hidden" onClick={onClose}>
            <div 
                className="bg-white dark:bg-[#0d1117] border border-slate-300 dark:border-blue-900 w-full max-w-5xl max-h-[90vh] font-mono shadow-2xl flex flex-col rounded-2xl relative overflow-auto" 
                onClick={stopPropagation}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* GHOST PREVIEW */}
                {isDragging && Math.abs(dragOffset) > 10 && (
                    <div className="absolute inset-0 z-0">
                        <ModalContent 
                            app={peekApp}
                            isGhost={true}
                            categoryApps={categoryApps}
                            loading={true}
                            composeCode="..."
                        />
                    </div>
                )}

                {/* ACTIVE APP LAYER */}
                <div 
                    className="z-10 flex flex-col h-full bg-white dark:bg-[#0d1117]"
                    style={{
                        transform: !isScrolling.current ? `translateX(${dragOffset}px) rotate(${dragOffset / 70}deg)` : 'none',
                        transition: isDragging ? 'none' : 'transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
                    }}
                >
                    <ModalContent 
                        app={app}
                        composeCode={composeCode}
                        loading={loading}
                        categoryApps={categoryApps}
                        isGhost={false}
                        copiedYaml={copiedYaml} setCopiedYaml={setCopiedYaml}
                        copiedComposeCmd={copiedComposeCmd} setCopiedComposeCmd={setCopiedComposeCmd}
                        copiedRunCmd={copiedRunCmd} setCopiedRunCmd={setCopiedRunCmd}
                        copyToClipboard={copyToClipboard}
                        handlePrev={handlePrev}
                        handleNext={handleNext}
                        onClose={onClose}
                        stopPropagation={stopPropagation}
                    />
                </div>
            </div>
        </div>
    );
}