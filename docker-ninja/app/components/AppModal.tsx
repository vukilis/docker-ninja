import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { getComposeContent } from '../actions';
import SearchInput from './SearchInput';

interface AppModalProps {
    app: any;
    allApps: any[];
    onAppChange: (app: any) => void;
    onClose: () => void;
    setIsRequesting?: (val: boolean) => void; 
    onRandom?: () => void;
}

/**
 * NEW OVERLAY COMPONENT
 * Handles the centered search and the logic for Found (Green) vs Request (Yellow)
 */
export function RequestSearchOverlay({ allApps, onClose, onAppSelect }: { allApps: any[], onClose: () => void, onAppSelect: (app: any) => void }) {
    const [search, setSearch] = useState("");

    const exactMatch = useMemo(() => {
        if (!search.trim()) return null;
        return allApps.find(a => a.name.toLowerCase() === search.toLowerCase().trim());
    }, [search, allApps]);

    return (
        <div 
            className="fixed inset-0 z-[110] flex justify-center p-4 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-500"
            onKeyDown={(e) => { 
                if (e.key === 'Escape') {
                    e.stopPropagation(); 
                    onClose(); 
                }
            }}
            onClick={(e) => {
                e.stopPropagation(); 
                onClose();
            }}
        >
            <div 
                className="relative w-full max-w-xl animate-in zoom-in-95 duration-300 px-2 mt-10 md:mt-50 h-[30vh]"
                onClick={(e) => e.stopPropagation()} 
            >
                {/* Header */}
                <div className="text-center mb-10 select-none">
                    <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">Request App</h2>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">Verify availability in database</p>
                </div>

                <div className="relative">
                    <div className={`absolute -inset-1 rounded-2xl blur-xl transition-all duration-700 opacity-20 ${
                        search ? (exactMatch ? 'bg-green-500' : 'bg-amber-500') : 'bg-blue-600'
                    }`} />
                    
                    <div className={`relative flex items-center gap-2 md:gap-4 p-2 bg-white dark:bg-slate-900 border-2 transition-all duration-500 rounded-2xl shadow-2xl ${
                        search ? (exactMatch ? 'border-green-500/50' : 'border-amber-500/50') : 'border-white/10'
                    }`}>
                        
                        <div className="flex-1 min-w-0 [&_input]:border-none [&_input]:focus:ring-0 [&_div]:border-none">
                            <SearchInput 
                                apps={allApps} 
                                search={search} 
                                setSearch={setSearch} 
                                onAppSelect={(app) => setSearch(app.name)} 
                            />
                        </div>

                        <div className="flex items-center shrink-0 pr-1 md:pr-2">
                            {search && (
                                exactMatch ? (
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onAppSelect(exactMatch);
                                            onClose();
                                        }}
                                        className="flex items-center justify-center gap-2 px-4 md:px-5 py-3 md:py-3 bg-green-600 hover:bg-green-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-green-900/40 cursor-pointer"
                                    >
                                        <span className="hidden md:inline">Open</span>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                ) : (
                                    <a 
                                        href={`https://github.com/vukilis/docker-ninja/discussions/new?category=ideas&title=Request: ${search}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 px-4 md:px-5 py-3 md:py-3 rounded-xl transition-all shadow-lg shadow-amber-900/40 hover:scale-105 active:scale-95 cursor-pointer"
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
                                            <path d="M12 5v14M5 12h14" />
                                        </svg>
                                        <span className="text-[10px] hidden md:inline font-black text-white uppercase tracking-widest">Request</span>
                                    </a>
                                )
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-center gap-8 opacity-40 select-none">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        <span className="text-[12px] font-black text-white uppercase tracking-widest">Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span className="text-[12px] font-black text-white uppercase tracking-widest">Needs Request</span>
                    </div>
                </div>

                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                    }}
                    className="mt-12 mx-auto block text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-[0.3em] transition-colors cursor-pointer"
                >
                    [ ESC to Close ]
                </button>
            </div>
        </div>
    );
}
function ModalContent({ 
    app, composeCode, loading, categoryApps, allApps,
    copiedYaml, setCopiedYaml, copiedComposeCmd, setCopiedComposeCmd,
    copiedRunCmd, setCopiedRunCmd, copyToClipboard,
    handlePrev, handleNext, onClose, stopPropagation,
    handleShare, copiedLink, setIsRequesting, onRandom
}: any) {
    if (!app) return null;

    const currentIndex = categoryApps.findIndex((a: any) => a.id === app.id) + 1;
    const totalApps = categoryApps.length;

    return (
        <div className="flex flex-col h-full">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center p-4 md:p-8 pb-4 border-b border-slate-100 dark:border-slate-800/50 z-30 bg-white dark:bg-[#0d1117] select-none gap-4">
                
                <div className="flex justify-between items-start md:block">
                    <div className="flex flex-col gap-1 min-w-0">
                        <h2 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter truncate">{app.name}</h2>
                        <div className="flex items-center gap-2">
                            <div className="h-1 w-8 bg-blue-600 rounded-full" />
                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em]">
                                {app.category}
                            </span>
                        </div>
                    </div>
                    
                    <button onClick={onClose} className="md:hidden group relative flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 dark:border-red-950">
                        <svg className="w-4 h-4 text-slate-500 dark:text-red-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-2 shrink-0">
                    <div className="flex items-center bg-slate-100 dark:bg-slate-900/50 rounded-full p-1 border border-slate-200 dark:border-blue-900/30">
                        <button onClick={handlePrev} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-all text-slate-500 hover:text-blue-600 cursor-pointer">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        
                        <div className="px-1 flex items-center justify-center min-w-[3.5rem] pt-0.5 font-mono">
                            <span className="text-[12px] font-black text-slate-600 dark:text-slate-400 tabular-nums">
                                {currentIndex} <span className="text-slate-300 dark:text-slate-700 mx-0.5">/</span> {totalApps}
                            </span>
                        </div>

                        <button onClick={handleNext} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-all text-slate-500 hover:text-blue-600 cursor-pointer">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>

                    <a 
                        href={`https://github.com/vukilis/docker-ninja/issues?q=is%3Aissue+is%3Aopen+${encodeURIComponent(app.name)}`}
                        target="_blank"
                        className="relative group flex items-center gap-2 px-3 md:px-5 py-4 text-[8px] md:text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-500 overflow-hidden rounded-full border border-slate-200 dark:border-purple-600/30 hover:border-purple-500/60 bg-white/5 dark:bg-purple-950/5 backdrop-blur-sm"
                        >
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-600/20 via-fuchsia-900/5 to-transparent" />
                        <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-purple-400/10 to-transparent" />
                        <div className="relative flex items-center gap-2 text-slate-500 dark:text-purple-400 group-hover:text-fuchsia-400 transition-colors duration-300">
                            <div className="relative">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]">
                                <rect width="8" height="14" x="8" y="6" rx="4" />
                                <path d="m19 7-3 2" /><path d="m5 7 3 2" /><path d="m19 19-3-2" /><path d="m5 19 3-2" /><path d="M20 13h-4" /><path d="M4 13h4" /><path d="m10 4 1 2" /><path d="m14 4-1 2" />
                            </svg>
                            <span className="absolute -top-1 -right-1 flex h-2 w-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1 w-1 bg-fuchsia-300"></span>
                            </span>
                            </div>
                            <span className="tracking-[0.2em]">Report Issue</span>
                        </div>
                        <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-[inset_0_0_15px_rgba(168,85,247,0.15)]" />
                    </a>

                    <div className="flex items-center gap-2">
                        <button 
                            onClick={handleShare} 
                            className={`group relative flex items-center justify-center w-10 h-10 rounded-full border transition-all duration-300 cursor-pointer 
                                ${copiedLink 
                                    ? 'border-green-500 bg-green-500/10' 
                                    : 'border-slate-200 dark:border-blue-950 md:border-slate-200 md:dark:border-slate-800 md:hover:border-blue-500/50 md:hover:bg-blue-500/5'
                                }`}
                        >
                            {copiedLink ? (
                                <svg className="w-4 h-4 text-green-500 animate-in zoom-in duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 6L9 17l-5-5" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" 
                                    className="w-4 h-4 text-blue-500 md:text-slate-500 md:group-hover:text-blue-500"
                                >
                                    <path d="M3 12a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"></path>
                                    <path d="M15 6a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"></path>
                                    <path d="M15 18a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"></path>
                                    <path d="M8.7 10.7l6.6 -3.4"></path>
                                    <path d="M8.7 13.3l6.6 3.4"></path>
                                </svg>
                            )}
                        </button>

                        <button onClick={onClose} className="hidden md:flex group relative items-center justify-center w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 hover:border-red-500/50 hover:bg-red-500/5 transition-all duration-300 cursor-pointer">
                            <svg className="w-4 h-4 text-slate-500 group-hover:text-red-500 group-hover:rotate-90 transition-all duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* BODY */}
            <div className="overflow-y-auto p-4 md:p-8 flex-1">
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
                        <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-blue-900/30 p-4 flex flex-col flex-1 overflow-hidden">
                            <h3 className="text-blue-600 dark:text-blue-400 mb-2 font-bold flex justify-between text-[10px] md:text-xs uppercase tracking-widest">
                                docker-compose.yml 
                                <button onClick={() => copyToClipboard(composeCode, setCopiedYaml)} className={`ml-2 transition-colors cursor-pointer ${copiedYaml ? 'text-green-600 dark:text-green-500' : 'text-slate-500 hover:text-green-500'}`}>{copiedYaml ? "[COPIED!]" : "[COPY]"}</button>
                            </h3>
                            <div onTouchStart={stopPropagation} className="code-container flex-1 overflow-auto bg-slate-50 dark:bg-[#0d1117] rounded p-2 border border-slate-200 dark:border-slate-800">
                                <pre className="text-[10px] md:text-xs text-slate-700 dark:text-slate-300 whitespace-pre">{loading ? "Loading..." : composeCode}</pre>
                            </div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-blue-900/30 p-4 space-y-4">
                            <div className="text-[10px] md:text-xs">
                                <h3 className="text-blue-600 dark:text-blue-400 mb-1 font-bold flex justify-between uppercase">Compose Command
                                    <button onClick={() => copyToClipboard("docker compose up -d", setCopiedComposeCmd)} className={`cursor-pointer transition-colors ${copiedComposeCmd ? 'text-green-600 dark:text-green-500' : 'text-slate-500 hover:text-green-500'}`}>{copiedComposeCmd ? "[COPIED!]" : "[COPY]"}</button>
                                </h3>
                                <div onTouchStart={stopPropagation} className="code-container bg-slate-100 dark:bg-[#0d1117] p-2 rounded text-slate-800 dark:text-blue-300 border border-slate-200 dark:border-blue-900/50 overflow-x-auto whitespace-nowrap">$ docker compose up -d</div>
                            </div>
                            <div className="text-[10px] md:text-xs">
                                <h3 className="text-blue-600 dark:text-blue-400 mb-1 font-bold flex justify-between uppercase">Docker Run
                                    <button onClick={() => copyToClipboard(app.run_command || `docker run -d --name ${app.slug}`, setCopiedRunCmd)} className={`cursor-pointer transition-colors ${copiedRunCmd ? 'text-green-600 dark:text-green-500' : 'text-slate-500 hover:text-green-500'}`}>{copiedRunCmd ? "[COPIED!]" : "[COPY]"}</button>
                                </h3>
                                <div onTouchStart={stopPropagation} className="code-container bg-slate-100 dark:bg-[#0d1117] p-2 rounded text-slate-800 dark:text-blue-300 border border-slate-200 dark:border-blue-900/50 overflow-x-auto whitespace-nowrap">$ {app.run_command || `docker run -d --name ${app.slug}`}</div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 w-full">
                            <button 
                                onClick={onRandom}
                                className="relative group flex items-center justify-center w-10 h-10 md:w-auto md:min-w-[140px] gap-2 md:px-4 py-3 md:py-4 text-[8px] md:text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-500 overflow-hidden rounded-full border border-slate-200 dark:border-emerald-600/30 hover:border-emerald-500/60 bg-white/5 dark:bg-emerald-950/5 backdrop-blur-sm cursor-pointer"
                            >
                                {/* Animated Shimmer Background */}
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-600/20 via-green-900/5 to-transparent" />
                                <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent" />
                                
                                <div className="relative flex items-center justify-center gap-2 text-slate-500 dark:text-emerald-400 group-hover:text-emerald-300 transition-colors duration-300">
                                    <div className="relative shrink-0 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
                                        <svg 
                                            width="14" 
                                            height="14" 
                                            viewBox="0 0 24 24" 
                                            fill="none" 
                                            stroke="currentColor" 
                                            strokeWidth="2.5" 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            className="drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]"
                                        >
                                            {/* Magic Wand */}
                                            <path d="m15 5 4 4" />
                                            <path d="M11 9 2 18l4 4 9-9" />
                                            {/* Magic Sparkles */}
                                            <path className="animate-pulse" d="M15 1l.5 1.5L17 3l-1.5.5L15 5l-.5-1.5L13 3l1.5-.5L15 1z" />
                                            <path className="animate-pulse delay-75" d="M22 10l.5 1.5L24 12l-1.5.5L22 14l-.5-1.5L20 12l1.5-.5L22 10z" />
                                        </svg>
                                        {/* Mobile-only sparkle ping */}
                                        <span className="absolute -top-1 -right-1 flex h-2 w-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-1 w-1 bg-emerald-300"></span>
                                        </span>
                                    </div>
                                    
                                    {/* Desktop Text */}
                                    <span className="hidden md:inline tracking-[0.2em] whitespace-nowrap">Surprise Me</span>
                                </div>

                                {/* Inset Border Glow */}
                                <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-[inset_0_0_15px_rgba(16,185,129,0.15)]" />
                            </button>
                            <a 
                                href={`https://github.com/vukilis/docker-ninja/issues?q=is%3Aissue+is%3Aopen+${encodeURIComponent(app.name)}`}
                                target="_blank"
                                className="relative group flex items-center justify-center w-10 h-10 md:w-auto md:min-w-[140px] gap-2 md:px-4 py-3 md:py-4 text-[8px] md:text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-500 overflow-hidden rounded-full border border-slate-200 dark:border-purple-600/30 hover:border-purple-500/60 bg-white/5 dark:bg-purple-950/5 backdrop-blur-sm"
                            >
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-600/20 via-fuchsia-900/5 to-transparent" />
                                <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-purple-400/10 to-transparent" />
                                
                                <div className="relative flex items-center justify-center gap-2 text-slate-500 dark:text-purple-400 group-hover:text-fuchsia-400 transition-colors duration-300">
                                    <div className="relative shrink-0">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]">
                                            <rect width="8" height="14" x="8" y="6" rx="4" />
                                            <path d="m19 7-3 2" /><path d="m5 7 3 2" /><path d="m19 19-3-2" /><path d="m5 19 3-2" /><path d="M20 13h-4" /><path d="M4 13h4" /><path d="m10 4 1 2" /><path d="m14 4-1 2" />
                                        </svg>
                                        <span className="absolute -top-1 -right-1 flex h-2 w-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-1 w-1 bg-fuchsia-300"></span>
                                        </span>
                                    </div>
                                    <span className="hidden md:inline tracking-[0.2em] whitespace-nowrap">Report Issue</span>
                                </div>
                                <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-[inset_0_0_15px_rgba(168,85,247,0.15)]" />
                            </a>

                            <button 
                                onClick={(e) => {
                                    e.preventDefault();
                                    setIsRequesting(true);
                                }}
                                className="relative group flex items-center justify-center w-10 h-10 md:w-auto md:min-w-[140px] gap-2 md:px-4 py-3 md:py-4 text-[8px] md:text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-500 overflow-hidden rounded-full border border-slate-200 dark:border-amber-600/30 hover:border-amber-500/60 bg-white/5 dark:bg-amber-950/5 backdrop-blur-sm cursor-pointer"
                            >
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-600/20 via-yellow-900/5 to-transparent" />
                                    <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent" />
                                    <div className="relative flex items-center justify-center gap-2 text-slate-500 dark:text-amber-400 group-hover:text-yellow-400 transition-colors duration-300">
                                        <div className="relative shrink-0">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]">
                                                <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5" />
                                                <path d="M9 18h6" />
                                                <path d="M10 22h4" />
                                            </svg>
                                            <span className="absolute -top-1 -right-1 flex h-2 w-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-1 w-1 bg-yellow-300"></span>
                                            </span>
                                        </div>
                                        <span className="hidden md:inline tracking-[0.2em] whitespace-nowrap">Request App</span>
                                    </div>
                                <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-[inset_0_0_15px_rgba(245,158,11,0.15)]" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function AppModal({ app, allApps, onAppChange, onClose, onRandom }: AppModalProps) {
    const [composeCode, setComposeCode] = useState("Loading...");
    const [copiedYaml, setCopiedYaml] = useState(false);
    const [copiedComposeCmd, setCopiedComposeCmd] = useState(false);
    const [copiedRunCmd, setCopiedRunCmd] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isRequesting, setIsRequesting] = useState(false);

    const [dragOffset, setDragOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [status, setStatus] = useState<'idle' | 'exiting' | 'resetting'>('idle');
    const [direction, setDirection] = useState<'left' | 'right' | null>(null);

    const touchStartPos = useRef({ x: 0, y: 0 });
    const isScrolling = useRef(false);

    const categoryApps = allApps.filter(a => a.category === app.category);
    const currentIndex = categoryApps.findIndex(a => a.id === app.id);
    const nextApp = categoryApps[(currentIndex + 1) % categoryApps.length];
    const prevApp = categoryApps[(currentIndex - 1 + categoryApps.length) % categoryApps.length];

    const navigate = useCallback((dir: 'left' | 'right', targetApp: any) => {
        if (status !== 'idle') return;
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
        if (!isMobile) {
            onAppChange(targetApp);
            return;
        }
        setDirection(dir);
        setStatus('exiting');
        setTimeout(() => {
            onAppChange(targetApp);
            setStatus('resetting');
            requestAnimationFrame(() => {
                setTimeout(() => {
                    setStatus('idle');
                    setDirection(null);
                    setDragOffset(0);
                }, 10);
            });
        }); 
    }, [status, onAppChange]);

    const handleNext = useCallback(() => navigate('right', nextApp), [nextApp, navigate]);
    const handlePrev = useCallback(() => navigate('left', prevApp), [prevApp, navigate]);

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartPos.current = { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY };
        setIsDragging(true);
        isScrolling.current = false;
    };
    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging || isScrolling.current) return;
        const deltaX = e.targetTouches[0].clientX - touchStartPos.current.x;
        const deltaY = e.targetTouches[0].clientY - touchStartPos.current.y;
        if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 5) {
            isScrolling.current = true;
            setDragOffset(0);
            return;
        }
        if (Math.abs(deltaX) > 10) {
            if (e.cancelable) e.preventDefault();
            setDragOffset(deltaX);
        }
    };
    const handleTouchEnd = () => {
        setIsDragging(false);
        if (!isScrolling.current) {
            const threshold = 100;
            if (dragOffset > threshold) handleNext();
            else if (dragOffset < -threshold) handlePrev();
        }
        setDragOffset(0);
    };

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (event.key === 'ArrowRight') handleNext();
        else if (event.key === 'ArrowLeft') handlePrev();
        else if (event.key === 'Escape') {
            if (isRequesting) setIsRequesting(false);
            else onClose();
        }
    }, [handleNext, handlePrev, onClose, isRequesting]);

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

    const handleShare = () => {
        const shareUrl = `${window.location.origin}/?app=${app.slug || app.id}`;
        if (navigator.share) {
            navigator.share({
                title: app.name,
                text: `Check out ${app.name} on the App Store`,
                url: shareUrl,
            }).catch(() => {
                copyToClipboard(shareUrl, setCopiedLink);
            });
        } else {
            copyToClipboard(shareUrl, setCopiedLink);
        }
    };

    const stopPropagation = (e: any) => e.stopPropagation();
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const getTransform = () => {
        if (!isMobile) return 'none';
        if (isDragging) return `translateX(${dragOffset}px) scale(1)`;
        if (status === 'exiting') return direction === 'right' ? 'translateX(100%)' : 'translateX(-100%)';
        if (status === 'resetting') return direction === 'right' ? 'translateX(-100%)' : 'translateX(100%)';
        return 'translateX(0)';
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-2 md:p-4 overflow-hidden" onClick={onClose}>
            <div 
                className="bg-white dark:bg-[#0d1117] border border-slate-300 dark:border-blue-900/50 w-full max-w-5xl h-[90vh] max-h-[90vh] font-mono shadow-2xl flex flex-col rounded-2xl relative overflow-auto" 
                onClick={stopPropagation}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{
                    transform: getTransform(),
                    scrollbarGutter: 'stable',
                    opacity: (isMobile && status === 'resetting') ? 0 : 1,
                    transition: (isMobile && !isDragging && status !== 'resetting') 
                        ? 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.2s' 
                        : 'none',
                }}
            >
                <ModalContent 
                    app={app} composeCode={composeCode} loading={loading} categoryApps={categoryApps}
                    allApps={allApps} // Passed down
                    copiedYaml={copiedYaml} setCopiedYaml={setCopiedYaml}
                    copiedComposeCmd={copiedComposeCmd} setCopiedComposeCmd={setCopiedComposeCmd}
                    copiedRunCmd={copiedRunCmd} setCopiedRunCmd={setCopiedRunCmd}
                    copyToClipboard={copyToClipboard} handlePrev={handlePrev} handleNext={handleNext}
                    onClose={onClose} stopPropagation={stopPropagation}
                    handleShare={handleShare} copiedLink={copiedLink}
                    setIsRequesting={setIsRequesting}
                    onRandom={onRandom}
                />
            </div>

            {/* NEW REQUEST SEARCH OVERLAY */}
            {isRequesting && (
                <RequestSearchOverlay 
                    allApps={allApps} 
                    onClose={() => setIsRequesting(false)} 
                    onAppSelect={onAppChange} 
                />
            )}
        </div>
    );
}