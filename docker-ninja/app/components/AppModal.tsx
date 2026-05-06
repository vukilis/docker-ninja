import React, { useState, useEffect} from 'react';
import { getComposeContent } from '../actions';

/**
 * AppModal Component
 * Displays detailed information about a selected Docker application,
 * including YAML configuration and deployment commands.
 */
export function AppModal({ app, onClose }: { app: any; onClose: () => void }) {
    const [composeCode, setComposeCode] = useState("Loading...");
    const [copiedYaml, setCopiedYaml] = useState(false);
    const [copiedComposeCmd, setCopiedComposeCmd] = useState(false);
    const [copiedRunCmd, setCopiedRunCmd] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        getComposeContent(app)
        .then((data) => {
            setComposeCode(data);
            setLoading(false);
        })
        .catch(() => {
            setComposeCode("Error loading configuration.");
            setLoading(false);
        });
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

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 md:p-4" onClick={onClose}>
            <div 
                className="overflow-y-auto bg-white dark:bg-[#0d1117] border border-slate-300 dark:border-blue-900 w-full max-w-5xl max-h-[90vh] p-4 md:p-8 font-mono shadow-2xl flex flex-col scale-in" 
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/50">
                <div className="flex flex-col gap-1">
                    <h2 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter truncate">
                    {app.name}
                    </h2>
                    <div className="flex items-center gap-2">
                    <div className="h-1 w-8 bg-blue-600 rounded-full" />
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em]">
                        {app.category}
                    </span>
                    </div>
                </div>

                <button 
                    onClick={onClose} 
                    className="group relative flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 hover:border-red-500/50 hover:bg-red-500/5 transition-all duration-300 cursor-pointer"
                    aria-label="Close"
                >
                    <svg 
                    className="w-4 h-4 text-slate-500 group-hover:text-red-500 group-hover:rotate-90 transition-all duration-500" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    <div className="absolute inset-0 rounded-full bg-red-500/0 group-hover:bg-red-500/10 blur-md transition-all duration-300" />
                </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 text-slate-900 dark:text-slate-200">
                    <div className="space-y-4 overflow-y-auto text-xs md:text-sm">
                        <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-blue-900/30 p-4 rounded-md transition-colors">
                        <h3 className="text-slate-500 dark:text-slate-400 uppercase text-xs mb-2 font-black tracking-widest">App Details</h3>
                        <div className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                            <p>Website: <a href={app.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Link</a></p>
                            <p>Docs: <a href={app.docs} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Link</a></p>
                            <p>GitHub: <a href={app.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Repo</a></p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                            <h3 className="text-slate-500 dark:text-slate-400 uppercase text-xs mb-2 font-black tracking-widest">Script Details</h3>
                            <div className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                            <p>Category: <span className="text-blue-600 dark:text-green-300 font-semibold">{app.category}</span></p>
                            <p>Source code: <a href={app.source} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">View</a></p>
                            </div>
                        </div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-blue-900/30 p-4 rounded-md transition-colors">
                        <h3 className="text-slate-500 dark:text-slate-400 uppercase text-xs mb-2 tracking-widest font-mono font-black">About</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium tracking-tight antialiased">
                            {app.description || "No description provided."}
                        </p>
                        </div>
                    </div>
                    
                    <div className="max-h-[90vh] flex flex-col gap-4 overflow-hidden min-h-[300px]">
                        <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-blue-900/30 p-3 md:p-4 flex flex-col flex-1 overflow-hidden transition-colors">
                            <h3 className="text-blue-600 dark:text-blue-400 mb-2 font-bold flex justify-between text-[10px] md:text-xs uppercase tracking-widest shrink-0">
                                docker-compose.yml 
                                <button 
                                onClick={() => copyToClipboard(composeCode, setCopiedYaml)} 
                                className={`ml-2 transition-colors cursor-pointer ${copiedYaml ? 'text-green-600 dark:text-green-500' : 'text-slate-500 hover:text-green-500'}`}
                                >
                                {copiedYaml ? "[COPIED!]" : "[COPY]"}
                                </button>
                            </h3>
                            <div className="flex-1 overflow-auto bg-slate-50 dark:bg-[#0d1117] rounded p-2 border border-slate-200 dark:border-slate-800">
                                <pre className="text-[10px] md:text-xs text-slate-700 dark:text-slate-300 whitespace-pre font-mono">
                                {loading ? "Decrypting configuration..." : composeCode}
                                </pre>
                            </div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-blue-900/30 p-3 md:p-4 shrink-0 space-y-4 transition-colors">
                            <div className="text-[10px] md:text-xs">
                                <h3 className="text-blue-600 dark:text-blue-400 mb-1 font-bold flex justify-between uppercase">Compose Command
                                <button onClick={() => copyToClipboard("docker compose up -d", setCopiedComposeCmd)} className={`cursor-pointer transition-colors ${copiedComposeCmd ? 'text-green-600 dark:text-green-500' : 'text-slate-500 hover:text-green-500'}`}>
                                    {copiedComposeCmd ? "[COPIED!]" : "[COPY]"}
                                </button>
                                </h3>
                                <div className="bg-slate-100 dark:bg-[#0d1117] p-2 rounded font-mono text-slate-800 dark:text-blue-300 border border-slate-200 dark:border-blue-900/50 overflow-x-auto whitespace-nowrap">$ docker compose up -d</div>
                            </div>
                            <div className="text-[10px] md:text-xs">
                                <h3 className="text-blue-600 dark:text-blue-400 mb-1 font-bold flex justify-between uppercase">Docker Run
                                <button onClick={() => copyToClipboard(app.run_command || `docker run -d --name ${app.slug}`, setCopiedRunCmd)} className={`cursor-pointer transition-colors ${copiedRunCmd ? 'text-green-600 dark:text-green-500' : 'text-slate-500 hover:text-green-500'}`}>
                                    {copiedRunCmd ? "[COPIED!]" : "[COPY]"}
                                </button>
                                </h3>
                                <div className="bg-slate-100 dark:bg-[#0d1117] p-2 rounded font-mono text-slate-800 dark:text-blue-300 border border-slate-200 dark:border-blue-900/50 overflow-x-auto whitespace-nowrap">$ {app.run_command || `docker run -d --name ${app.slug}`}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
    }

    /**
     * Primary Export: App Component (Home / page.tsx logic)
     */
    export default function Home() {
    const [isStarted, setIsStarted] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('docker_ninja_started');
        return saved === 'true';
        }
        return false;
    });

    const [selectedApp, setSelectedApp] = useState<any | null>(null);

    useEffect(() => {
        localStorage.setItem('docker_ninja_started', isStarted.toString());
    }, [isStarted]);

    return (
        <div className="flex h-screen bg-white dark:bg-[#0d1117] text-slate-900 dark:text-slate-100 transition-colors">
            {!isStarted ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6">
                <div className="relative group">
                    <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" />
                    <h1 className="relative text-6xl md:text-8xl font-black tracking-tighter uppercase italic">
                    Docker <span className="text-blue-600 not-italic">Ninja</span>
                    </h1>
                </div>
                <p className="max-w-md text-slate-500 font-medium uppercase tracking-widest text-[10px]">
                The ultimate stack library for container mastery.
                </p>
                <button 
                onClick={() => setIsStarted(true)} 
                className="group relative px-12 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl uppercase tracking-[0.2em] transition-all overflow-hidden shadow-xl shadow-blue-600/20 active:scale-95"
                >
                <span className="relative z-10">Initiate Warp</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </button>
            </div>
            ) : (
            <div className="flex-1 p-6 md:p-12 overflow-y-auto">
                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-3xl font-black uppercase italic">Dashboard <span className="text-blue-600">Ready</span></h1>
                    <button 
                    onClick={() => setIsStarted(false)} 
                    className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors"
                    >
                    Terminate Session
                    </button>
                </div>
                
                {/* Simple Grid Placeholder for Demo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50 dark:bg-slate-900/50 hover:border-blue-600/50 transition-all cursor-pointer group">
                    <div className="h-10 w-10 bg-blue-600 rounded-xl mb-4" />
                    <h3 className="text-xl font-bold mb-2">Example Stack</h3>
                    <p className="text-sm text-slate-500 mb-6">Explore how deployment configurations are handled in this environment.</p>
                    <button 
                        onClick={() => setSelectedApp({ name: "Example Stack", category: "Core", slug: "example", description: "This is an example entry to showcase the new AppModal layout." })}
                        className="text-xs font-black text-blue-600 uppercase tracking-widest"
                    >
                        View Manifest
                    </button>
                </div>
                </div>
            </div>
            )}

            {selectedApp && <AppModal app={selectedApp} onClose={() => setSelectedApp(null)} />}
        </div>
    );
}