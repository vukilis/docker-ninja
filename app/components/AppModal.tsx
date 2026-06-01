import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { fetchAppDetail, getComposeContent, getGlobalStats, toggleAppLike, checkHasDeviceLiked } from '../actions';
import SearchInput from './SearchInput';
import { Counter } from '../utils/Counter';
import { getIcon } from '../hooks/icons';
import { getOrCreateDeviceUUID } from '../utils/Utils';
import useSWR from 'swr';
import { CopyButton } from './CopyButton';
import { ShareButton } from './ShareButton';
import { useAppsGlobal } from '../context/AppsContext'


// --- SHARED TYPES ---
interface AppDetail extends App {
    website?: string;
    github?: string;
    docs?: string;
    source?: string;
    description?: string;
    run_command?: string;
    cli_update_command?: string;
    bash_command?: string;
    update_command?: string;
    env_file?: string;
    compose_url?: string;
    fallback_compose?: string;
    updated_at?: string;
}

interface App {
    id: string | number;
    slug: string;
    category: string;
    name: string;
    icon_url?: string;
}

interface AppModalProps {
    app: App;
    allApps: App[];
    globalLikes?: Record<string, number>;
    onAppChange: (app: App) => void;
    onClose: () => void;
    onLikeUpdate?: (slug: string, newCount: number) => void;
    setIsRequesting?: (val: boolean) => void; 
    onRandom?: () => void;
}

// --- OVERLAY COMPONENT ---
export function RequestSearchOverlay({ allApps, onClose, onAppSelect }: { allApps: App[], onClose: () => void, onAppSelect: (app: App) => void }) {
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
                                        href={`https://github.com/vukilis/docker-ninja/discussions/new?category=request-container&title=Container request: ${search}`}
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
                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                    className="mt-12 mx-auto block text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-[0.3em] transition-colors cursor-pointer"
                >
                    [ ESC to Close ]
                </button>
            </div>
        </div>
    );
}

// --- MODAL CONTENT COMPONENT ---
function ModalContent({ 
    app, composeCode, loading, categoryApps,
    handlePrev, handleNext, onClose, stopPropagation,
    setIsRequesting, onRandom, handleLikeToggle,
    isLiked, likesCount, isSyncing
}: any) {
    // State Hooks for Tabs
    const [composeTab, setComposeTab] = useState<'run' | 'update' | 'env'>('run');
    const [cliTab, setCliTab] = useState<'cli' | 'update' | 'bash'>('cli');

    if (!app) return null;

    // Find the current app's index within its category for pagination display
    const currentIndex = categoryApps.findIndex((a: App) => a.id === app.id) + 1;
    const totalApps = categoryApps.length;
    const icon = getIcon(app.slug, app.icon_url);

    // Helper to format large numbers in a compact form (e.g., 1.2K, 3.4M)
    const formatCompactNumber = (number: number) => {
        if (isNaN(number)) return "0";
        if (number < 1000) return number.toString();
        
        return new Intl.NumberFormat('en-US', {
            notation: 'compact',
            maximumFractionDigits: 1
        }).format(number);
    };
    
    // Removes 'version/', 'v', or 'release/' prefix, case-insensitive
    const formatVersion = (tag) => {
        if (!tag) return "";
        return tag.replace(/^(version\/|v|release\/)/i, '');
    };

    // Show/Hide warning message
    const [showWarning, setShowWarning] = useState(() => 
        typeof window !== 'undefined' ? localStorage.getItem('docker_ninja_warning') !== 'true' : true
    );

    const toggleWarning = () => {
        setShowWarning(prev => {
            const nextState = !prev;
            localStorage.setItem('docker_ninja_warning', (!nextState).toString());
            return nextState;
        });
    };

    // --- Added Tab String Variables ---
    const runCommand = app.run_command?.replace(/\\\s*\n/g, '\\\n').trim() || '';
    const bashCommand = app.bash_command?.trim() || '';
    const updateCommand = app.update_command?.trim() || '';
    const cliUpdateCommand = app.cli_update_command?.trim() || '';
    const envFile = app.env_file?.trim() || '';

    // Reusable styles for tab buttons
    const tabBtnStyle = (isActive: boolean) => `
        px-2.5 py-0.5 text-[9px] md:text-[11px] font-black uppercase tracking-wider rounded border transition-all duration-200 font-sans
        ${isActive 
            ? 'bg-blue-600 border-blue-600 text-white dark:bg-blue-500/20 dark:border-blue-500/40 dark:text-blue-400' 
            : 'bg-slate-100 border-slate-200 text-slate-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
        }
    `;

    return (
        <div className="flex flex-col h-full">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center p-4 md:p-8 pb-4 border-b border-[#B7C7CD] dark:border-slate-800/50 z-30 dark:bg-[#0d1117] select-none gap-4">
                <div className="flex justify-between items-start md:block">
                    <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap max-w-full">
                            <h2 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter truncate">
                                {app.name}
                            </h2>
                            
                            {/* LIKE BUTTON */}
                            <button
                                onClick={handleLikeToggle}
                                className={`group inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold transition-all duration-300 transform active:scale-95 cursor-pointer select-none ${
                                    isLiked 
                                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' 
                                        : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-rose-500/40 hover:text-rose-500'
                                } ${isSyncing ? 'opacity-80' : ''}`}
                            >
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    viewBox="0 0 24 24" 
                                    fill={isLiked ? "currentColor" : "none"} 
                                    stroke="currentColor" 
                                    strokeWidth="2.5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    className={`w-3.5 h-3.5 shrink-0 transition-transform duration-300 ${
                                        isLiked ? 'animate-in zoom-in-75 duration-200 scale-110' : 'group-hover:scale-110'
                                    }`}
                                >
                                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                                </svg>
                                <span className="tabular-nums font-sans text-[12px] font-black leading-none inline-flex items-center">
                                    {likesCount !== null ? formatCompactNumber(likesCount) : ""}
                                </span>
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-1 w-8 bg-blue-600 rounded-full" />
                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em]">
                                {app.category}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 md:hidden">
                        <button 
                            onClick={toggleWarning}
                            className={`relative flex items-center justify-center w-10 h-10 rounded-full border transition-all cursor-pointer
                                ${showWarning 
                                    ? 'border-orange-500 bg-orange-500 text-slate-200 dark:text-orange-500 dark:bg-orange-600/20' 
                                    : 'border-orange-500 dark:border-orange-500/20 text-orange-500 hover:border-orange-500/50 dark:bg-orange-950/10 hover:bg-orange-500/5 hover:text-orange-500'}`}
                            aria-label={showWarning ? "Hide security notice" : "Show security notice"}
                        >
                            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                        </button>
                        <button onClick={onClose} className="group relative flex items-center justify-center w-10 h-10 rounded-full border border-red-700 dark:border-red-950">
                            <svg className="w-4 h-4 text-red-700 dark:text-red-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-2 shrink-0">
                    <div className="flex items-center bg-slate-100 dark:bg-slate-900/50 rounded-full px-1 py-0.5 border border-slate-200 dark:border-blue-900/30">
                        <button onClick={handlePrev} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-all text-slate-500 hover:text-blue-600 cursor-pointer">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <div className="px-1 flex items-center justify-center min-w-[3.5rem] sm:pt-0.5 font-mono">
                            <span className="text-[12px] font-black text-slate-600 dark:text-slate-400 tabular-nums">
                                {currentIndex} <span className="text-slate-300 dark:text-slate-700 mx-0.5">/</span> {totalApps}
                            </span>
                        </div>
                        <button onClick={handleNext} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-all text-slate-500 hover:text-blue-600 cursor-pointer">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <a 
                            href={`https://github.com/vukilis/docker-ninja/issues/new?template=issue-report.md&title=${encodeURIComponent(`[BUG] ${app.name}`)}&labels=bug`}
                            target="_blank"
                            className="relative group flex items-center gap-2 px-7 md:px-5 py-3 text-[10px] md:text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-500 overflow-hidden rounded-full border border-slate-200 dark:border-purple-600/30 hover:border-purple-500/60 bg-purple-100 dark:bg-purple-950/5 backdrop-blur-sm"
                            >
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-600/20 via-fuchsia-900/5 to-transparent" />
                            <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-purple-400/10 to-transparent" />
                            <div className="relative flex items-center gap-2 text-slate-500 dark:text-purple-400 group-hover:text-fuchsia-900 dark:group-hover:text-fuchsia-400 transition-colors duration-300">
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
                                <span className="tracking-[0.2em] font-sans">Report</span>
                            </div>
                            <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-[inset_0_0_15px_rgba(168,85,247,0.15)]" />
                        </a>
                        <button 
                            onClick={toggleWarning}
                            className={`hidden md:flex items-center justify-center w-10 h-10 rounded-full border transition-all cursor-pointer
                                ${showWarning 
                                    ? 'border-orange-500 bg-orange-500 text-slate-200 dark:text-orange-500 dark:bg-orange-600/20' 
                                    : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-orange-500/5 hover:bg-orange-500/5 text-slate-500 hover:text-orange-500'}`}
                            aria-label={showWarning ? "Hide security notice" : "Show security notice"}
                        >
                            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                        </button>
                        <ShareButton app={app} shouldTrack={false} />
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
                {showWarning && (
                    <div className="mb-6 flex items-start justify-between gap-3 rounded-md border border-amber-200 bg-amber-50/50 p-4 text-xs md:text-sm text-amber-800 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-300 transition-all duration-300">
                        <div className="flex items-start gap-3">
                            <svg className="h-5 w-5 shrink-0 text-orange-500 dark:text-orange-400 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                            <div>
                                <span className="font-bold uppercase tracking-wide text-orange-900 dark:text-orange-400 block mb-0.5">Be Aware:</span>
                                Don't blindly run commands. Always inspect the code, understand what it does, and verify it fits your environment before executing.
                            </div>
                        </div>
                    </div>
                )}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-slate-900 dark:text-slate-200">
                    <div className="space-y-4 text-xs md:text-sm">
                        <div className="relative bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-blue-900/30 p-4 rounded-md">
                            <div className="absolute top-4 right-4 w-24 h-24 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                {icon?.type === 'url' && icon.src ? (
                                    <img 
                                        src={icon.src} 
                                        alt={app.name} 
                                        width={96} 
                                        height={96} 
                                        className="w-full h-full object-contain filter dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]" 
                                    />
                                ) : icon?.svg ? (
                                    <div 
                                        dangerouslySetInnerHTML={{ __html: icon.svg }} 
                                        className="w-full h-full fill-slate-400 dark:fill-slate-500" 
                                    />
                                ) : (
                                    <span className="text-sm font-bold text-slate-400">{app.name.charAt(0)}</span>
                                )}
                            </div>
                            <div className="w-full">
                                <h3 className="font-bold text-slate-900 dark:text-slate-400 uppercase text-xs mb-2 font-black tracking-widest">App Details</h3>
                                <div className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                                    {app.website && <p>Website: <a href={app.website} target="_blank" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">Link</a></p>}
                                    {app.github && <p>GitHub: <a href={app.github} target="_blank" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">Repo</a></p>}
                                    {app.docs && <p>Docs: <a href={app.docs} target="_blank" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">Link</a></p>}
                                    {app.source && <p>Docker Hub: <a href={app.source} target="_blank" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">Link</a></p>}
                                    <div className="py-2.5">
                                        <div className="h-[2px] w-2/3 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-transparent dark:from-cyan-400 dark:via-blue-600 opacity-80 shadow-[0_0_8px_rgba(34,211,238,0.3)]" />
                                    </div>
                                    {app.version && (<p>Version:{" "}
                                        <span className="font-semibold text-green-700 dark:text-green-300">
                                        {formatVersion(app.version)}</span></p>
                                    )}
                                    {app.updated_at && (
                                        <p>
                                            Latest Change: <span className="font-semibold text-green-700 dark:text-green-300">
                                                {new Date(app.updated_at).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </p>
                                    )}
                                    <p>Category: <span className="text-blue-600 dark:text-blue-400 font-semibold">{app.category}</span></p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-blue-900/30 p-4 rounded-md">
                            <h3 className="font-bold text-slate-900 dark:text-slate-400 uppercase text-xs mb-2 tracking-widest font-black">About</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{app.description || "No description."}</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 min-h-[300px]">
                        <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-blue-900/30 p-4 flex flex-col flex-1 max-h-[400px] overflow-y-auto">
                            <h3 className="text-blue-600 dark:text-blue-400 mb-2 font-bold flex justify-between text-[10px] md:text-xs uppercase tracking-widest">
                                docker-compose.yml 
                                <CopyButton 
                                    text={composeCode} 
                                    shouldTrack={true}
                                />
                            </h3>
                            <div onTouchStart={stopPropagation} className="code-container flex-1 overflow-auto bg-[#f6f4f0]/50 dark:bg-[#0d1117] rounded p-2 border border-slate-200 dark:border-slate-800">
                                <pre className="text-[10px] md:text-xs text-slate-700 dark:text-slate-300 whitespace-pre">{loading ? "Loading..." : composeCode}</pre>
                            </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-blue-900/30 p-4 space-y-4 rounded-md">
                            
                            {/* Compose Command */}
                            <div className="text-[10px] md:text-xs space-y-2">
                                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800/60 pb-1.5">
                                    <div className="flex gap-1.5">
                                        <button 
                                            onClick={() => setComposeTab('run')} 
                                            className={tabBtnStyle(composeTab === 'run')}
                                        >
                                            Run
                                        </button>
                                        {updateCommand && (
                                            <button 
                                                onClick={() => setComposeTab('update')} 
                                                className={tabBtnStyle(composeTab === 'update')}
                                            >
                                                Update
                                            </button>
                                        )}
                                        {envFile && (
                                            <button 
                                                onClick={() => setComposeTab('env')} 
                                                className={tabBtnStyle(composeTab === 'env')}
                                            >
                                                .env
                                            </button>
                                        )}
                                    </div>
                                    <CopyButton 
                                        text={
                                            (composeTab === 'update' && updateCommand) ? updateCommand : 
                                            (composeTab === 'env' && envFile) ? envFile : 
                                            "docker compose up -d"
                                        }  
                                        shouldTrack={false}
                                    />
                                </div>
                                
                                <div 
                                    onTouchStart={stopPropagation} 
                                    className="code-container max-h-[200px] overflow-y-auto overflow-x-auto bg-[#f6f4f0]/50 dark:bg-[#0d1117] p-3 rounded text-slate-800 dark:text-blue-300 border border-slate-200 dark:border-blue-900/50 whitespace-pre font-mono leading-relaxed"
                                >
                                    {/* active tab */}
                                    {composeTab === 'update' && updateCommand ? (
                                        <span>
                                            {updateCommand.split('\n').map((line, idx) => (
                                                <span key={idx} className="block">$ {line}</span>
                                            ))}
                                        </span>
                                    ) : composeTab === 'env' && envFile ? (
                                        <span>
                                            {envFile}
                                        </span>
                                    ) : (
                                        <span>$ docker compose up -d</span>
                                    )}
                                </div>
                            </div>

                            {/* Docker CLI Section */}
                            {runCommand && (
                                <div className="text-[10px] md:text-xs space-y-2">
                                    <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800/60 pb-1.5">
                                        {/* Tabs Navigation */}
                                        <div className="flex gap-1.5">
                                            <button 
                                                onClick={() => setCliTab('cli')} 
                                                className={tabBtnStyle(cliTab === 'cli')}
                                            >
                                                Docker CLI
                                            </button>
                                            {bashCommand && (
                                                <button 
                                                    onClick={() => setCliTab('bash')} 
                                                    className={tabBtnStyle(cliTab === 'bash')}
                                                >
                                                    Bash
                                                </button>
                                            )}
                                            {cliUpdateCommand && (
                                                <button 
                                                    onClick={() => setCliTab('update')} 
                                                    className={tabBtnStyle(cliTab === 'update')}
                                                >
                                                    Update
                                                </button>
                                            )}
                                        </div>
                                        <CopyButton 
                                            text={
                                                (cliTab === 'bash' && bashCommand) ? bashCommand :
                                                (cliTab === 'update' && cliUpdateCommand) ? cliUpdateCommand : 
                                                runCommand
                                            } 
                                            shouldTrack={false}
                                        />
                                    </div>
                                    
                                    {/* Dynamic Content Display */}
                                    <div 
                                        onTouchStart={stopPropagation} 
                                        className="code-container max-h-[200px] overflow-y-auto overflow-x-auto bg-[#f6f4f0]/50 dark:bg-[#0d1117] p-3 rounded text-slate-800 dark:text-blue-300 border border-slate-200 dark:border-blue-900/50 whitespace-pre font-mono leading-relaxed"
                                    >
                                        $ {
                                            (cliTab === 'bash' && bashCommand) ? bashCommand :
                                            (cliTab === 'update' && cliUpdateCommand) ? cliUpdateCommand : 
                                            runCommand
                                        }
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-3 w-full">
                            <button 
                                onClick={onRandom}
                                className="relative group flex items-center justify-center w-10 h-10 md:w-auto md:min-w-[140px] gap-2 md:px-4 py-3 md:py-4 text-[8px] md:text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-500 overflow-hidden rounded-full border border-slate-200 dark:border-emerald-600/30 hover:border-emerald-500/60 bg-emerald-100 dark:bg-emerald-950/5 backdrop-blur-sm cursor-pointer"
                            >
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-600/20 via-green-900/5 to-transparent" />
                                <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent" />
                                <div className="relative flex items-center justify-center gap-2 text-slate-500 dark:text-emerald-400 group-hover:text-emerald-900 dark:group-hover:text-emerald-300 transition-colors duration-300">
                                    <div className="relative shrink-0 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]">
                                            <path d="m15 5 4 4" /><path d="M11 9 2 18l4 4 9-9" />
                                            <path className="animate-pulse" d="M15 1l.5 1.5L17 3l-1.5.5L15 5l-.5-1.5L13 3l1.5-.5L15 1z" />
                                            <path className="animate-pulse delay-75" d="M22 10l.5 1.5L24 12l-1.5.5L22 14l-.5-1.5L20 12l1.5-.5L22 10z" />
                                        </svg>
                                    </div>
                                    <span className="hidden md:inline tracking-[0.2em] whitespace-nowrap font-sans">Surprise</span>
                                </div>
                            </button>

                            <a 
                                href={`https://github.com/vukilis/docker-ninja/issues/new?template=issue-report.md&title=${encodeURIComponent(`[BUG] ${app.name}`)}&labels=bug`}
                                target="_blank"
                                className="relative group flex items-center justify-center w-10 h-10 md:w-auto md:min-w-[140px] gap-2 md:px-4 py-3 md:py-4 text-[8px] md:text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-500 overflow-hidden rounded-full border border-slate-200 dark:border-purple-600/30 hover:border-purple-500/60 bg-purple-100 dark:bg-purple-950/5 backdrop-blur-sm"
                            >
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-600/20 via-fuchsia-900/5 to-transparent" />
                                <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-purple-400/10 to-transparent" />
                                
                                <div className="relative flex items-center justify-center gap-2 text-slate-500 dark:text-purple-400 group-hover:text-fuchsia-900 dark:group-hover:text-fuchsia-400 transition-colors duration-300">
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
                                    <span className="hidden md:inline tracking-[0.2em] whitespace-nowrap font-sans">Report</span>
                                </div>
                                <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-[inset_0_0_15px_rgba(168,85,247,0.15)]" />
                            </a>
                            
                            <button 
                                onClick={(e) => { e.preventDefault(); setIsRequesting(true); }}
                                className="relative group flex items-center justify-center w-10 h-10 md:w-auto md:min-w-[140px] gap-2 md:px-4 py-3 md:py-4 text-[8px] md:text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-500 overflow-hidden rounded-full border border-slate-200 dark:border-amber-600/30 hover:border-amber-500/60 bg-amber-100 dark:bg-amber-950/5 backdrop-blur-sm cursor-pointer"
                            >
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-600/20 via-yellow-900/5 to-transparent" />
                                    <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent" />
                                    <div className="relative flex items-center justify-center gap-2 text-slate-500 dark:text-amber-400 group-hover:text-yellow-900 dark:group-hover:text-yellow-400 transition-colors duration-300">
                                        <div className="relative shrink-0">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]">
                                                <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5" /><path d="M9 18h6" /><path d="M10 22h4" />
                                            </svg>
                                        </div>
                                        <span className="hidden md:inline tracking-[0.2em] whitespace-nowrap font-sans">Request</span>
                                    </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- MAIN EXPORT ---
export function AppModal({ app, allApps, onAppChange, onClose, onRandom}: AppModalProps) {
    // Consume global caches from the provider
    const { detailsCache, composeCache, setDetailsCache, 
        setComposeCache, likedStatusCache, setLikedStatusCache, 
        globalLikes, setGlobalLikes 
    } = useAppsGlobal();
    
    // Derived state directly from global cache
    const details = detailsCache[app?.slug] ?? {};
    const composeCode = composeCache[app?.slug] ?? "Loading...";
    
    // Loading state is determined by whether the cache has data for the current slug
    const [loading, setLoading] = useState(!detailsCache[app?.slug]);
    const [isRequesting, setIsRequesting] = useState(false);

    // Drag state
    const [dragOffset, setDragOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [status, setStatus] = useState<'idle' | 'exiting' | 'resetting'>('idle');
    const [direction, setDirection] = useState<'left' | 'right' | null>(null);

    // Refs for touch handling
    const touchStartPos = useRef({ x: 0, y: 0 });
    const isScrolling = useRef(false);

    // Get apps in the same category for navigation
    const categoryApps = useMemo(() => allApps.filter(a => a.category === app.category), [allApps, app.category]);
    const currentIndex = categoryApps.findIndex(a => a.id === app.id);
    const nextApp = categoryApps[(currentIndex + 1) % categoryApps.length];
    const prevApp = categoryApps[(currentIndex - 1 + categoryApps.length) % categoryApps.length];

    // Like state
    const [isLiked, setIsLiked] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const likesCount = globalLikes[app.slug] ?? 0;
    
    const navigate = useCallback((dir: 'left' | 'right', targetApp: App) => {
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

    // Fetch logic: Only runs if data is missing from global context
    useEffect(() => {
        if (!app?.slug || detailsCache[app.slug]) {
            setLoading(false);
            return;
        }
        
        async function loadFullData() {
            setLoading(true);
            try {
                const [yamlCode, fullDetails] = await Promise.all([
                    getComposeContent(app.slug),
                    fetchAppDetail(app.slug)
                ]);
                
                // Save to Global context caches
                setComposeCache(prev => ({ ...prev, [app.slug]: yamlCode }));
                setDetailsCache(prev => ({ ...prev, [app.slug]: fullDetails }));
            } catch (err) {
                console.error("Failed loading app details:", err);
            } finally {
                setLoading(false);
            }
        }
        
        loadFullData();
    }, [app?.slug]);

    const displayApp = useMemo(() => ({ ...app, ...details }), [app, details]);

    const stopPropagation = (e: any) => e.stopPropagation();
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const getTransform = () => {
        if (!isMobile) return 'none';
        if (isDragging) return `translateX(${dragOffset}px) scale(1)`;
        if (status === 'exiting') return direction === 'right' ? 'translateX(100%)' : 'translateX(-100%)';
        if (status === 'resetting') return direction === 'right' ? 'translateX(-100%)' : 'translateX(100%)';
        return 'translateX(0)';
    };

    useEffect(() => {
        if (!app?.slug) return;
        if (likedStatusCache[app.slug] !== undefined) {
            setIsLiked(likedStatusCache[app.slug]);
            return;
        }

        async function fetchStatus() {
            const browserUuid = getOrCreateDeviceUUID();
            const hasLikedBefore = await checkHasDeviceLiked(app.slug, browserUuid);
            setIsLiked(hasLikedBefore);
            setLikedStatusCache(prev => ({ ...prev, [app.slug]: hasLikedBefore }));
        }
        fetchStatus();
    }, [app.slug]);

    const handleLikeToggle = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isSyncing) return;

        const browserUuid = getOrCreateDeviceUUID();
        const futureLikedState = !isLiked;
        
        // Update UI immediately (Optimistic update)
        setIsLiked(futureLikedState);
        
        // Update Global Cache immediately so it's consistent everywhere
        setLikedStatusCache(prev => ({ ...prev, [app.slug]: futureLikedState }));
        
        setIsSyncing(true);
        const updatedTotal = await toggleAppLike(app.slug, futureLikedState, browserUuid);

        if (updatedTotal !== -1) {
            // Update global likes count
            setGlobalLikes(prev => ({ ...prev, [app.slug]: updatedTotal }));
        } else {
            // Rollback if server failed
            const rollbackState = !futureLikedState;
            setIsLiked(rollbackState);
            setLikedStatusCache(prev => ({ ...prev, [app.slug]: rollbackState }));
        }
        setIsSyncing(false);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-2 md:p-4 overflow-hidden" onClick={onClose}>
            <div 
                className="my-custom-background dark:bg-[#0d1117] border border-slate-300 dark:border-blue-900/50 w-full max-w-5xl h-[90vh] max-h-[90vh] font-mono shadow-2xl flex flex-col rounded-2xl relative overflow-auto" 
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
                    app={displayApp as AppDetail} composeCode={composeCode} 
                    loading={loading} categoryApps={categoryApps}
                    handlePrev={handlePrev} handleNext={handleNext}
                    onClose={onClose} stopPropagation={stopPropagation}
                    setIsRequesting={setIsRequesting}
                    onRandom={onRandom} DeployedCounter={DeployedCounter}
                    handleLikeToggle={handleLikeToggle} isLiked={isLiked}
                    likesCount={likesCount}
                />
            </div>
            {isRequesting && (
                <RequestSearchOverlay allApps={allApps} onClose={() => setIsRequesting(false)} onAppSelect={onAppChange} />
            )}
        </div>
    );
}

export function DeployedCounter() {
    // Automatically handles the fetch and caching
    const { data: stats, isLoading } = useSWR('global-stats', getGlobalStats);

    if (isLoading) return <div>...</div>;

    return (
        <div>
            <div className="relative flex items-center justify-center text-blue-600 text-3xl mb-1 font-black text-center">
                <span><Counter value={stats || 0}/></span>
            </div>
            <div className="text-slate-400 dark:text-slate-600 transition-colors group-hover:text-blue-500">Deployed</div>
        </div>
    );
}