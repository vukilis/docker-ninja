import React from 'react';
import { useApps } from '../hooks/useApps';

// AboutPage Component
export default function AboutPage() {

    const { 
        apps
    } = useApps();
    
    const initiatives = [
        {
            service: "central-registry",
            image: "universal-hub:latest",
            description: "A high-performance hub engineered for rapid deployment. Access the official collection of battle-tested docker-compose.yml files. No more scouring the web, just deploy, scale, and launch.",
            volumes: ["latency: ultra-low", "source: verified"],
            color: "text-blue-500"
        },
        {
            service: "entry-protocol",
            image: "learning-stream:stable",
            description: "Engineered for simplicity, built for scale. From beginners to elite architects, I provide curated stacks that eliminate the friction of starting. Learn the core of containerization through official, trusted code.",
            volumes: ["difficulty: easy", "syntax: clean"],
            color: "text-purple-500"
        },
        {
            service: "edge-optimization",
            image: "homelab-core:optimized",
            description: "Precision configurations for the self-hosted ecosystem. Architected specifically for low-resource environments like Raspberry Pi clusters and homelab servers without sacrificing performance.",
            volumes: ["arch: arm64/x64", "footprint: light"],
            color: "text-emerald-500"
        }
    ];

    return (
        <div className="min-h-screen dark:bg-[#0d1117] text-slate-900 dark:text-slate-100 p-4 md:p-20 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-5xl mx-auto pt-10 md:pt-0">
                {/* Header Section */}
                <div className="text-center mb-16">
                    <div className="inline-block px-3 py-1 mb-4 text-xs font-mono uppercase font-medium text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 rounded-full border border-blue-500/20">
                        maintainer: Vuk1lis
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-4 tracking-tight uppercase italic">
                        The <span className="text-blue-600 dark:text-blue-400">Compose</span> Commons
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto font-mono text-xs tracking-[0.15em] leading-relaxed">
                        $ cat ./why-i-built-this.md
                    </p>
                </div>

                {/* Main Mission Block */}
                <div className="bg-slate-900 dark:bg-slate-950 rounded-3xl p-6 md:p-10 mb-16 shadow-2xl border border-slate-800 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                        <svg className="w-48 h-48 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M13.983 11.078h2.119c.695 0 1.259.562 1.259 1.257v2.117c0 .695-.564 1.258-1.259 1.258h-2.119a1.257 1.257 0 0 1-1.257-1.258v-2.117c0-.695.562-1.257 1.257-1.257zM19.012 11.078h2.118c.695 0 1.259.562 1.259 1.257v2.117c0 .695-.564 1.258-1.259 1.258h-2.118a1.257 1.257 0 0 1-1.258-1.258v-2.117c0-.695.563-1.257 1.258-1.257zM16.486 8.54h2.117c.695 0 1.258.562 1.258 1.257v2.117c0 .695-.563 1.258-1.258 1.258h-2.117a1.257 1.257 0 0 1-1.257-1.258V9.797c0-.695.562-1.257 1.257-1.257zM13.983 8.54h2.119c.695 0 1.259.562 1.259 1.257v2.117c0 .695-.564 1.258-1.259 1.258h-2.119a1.257 1.257 0 0 1-1.257-1.258V9.797c0-.695.562-1.257 1.257-1.257zM11.458 8.54h2.117c.695 0 1.258.562 1.258 1.257v2.117c0 .695-.563 1.258-1.258 1.258h-2.117a1.257 1.257 0 0 1-1.257-1.258V9.797c0-.695.562-1.257 1.257-1.257zM8.934 8.54h2.117c.695 0 1.258.562 1.258 1.257v2.117c0 .695-.563 1.258-1.258 1.258H8.934a1.257 1.257 0 0 1-1.257-1.258V9.797c0-.695.562-1.257 1.257-1.257zM11.458 11.078h2.117c.695 0 1.258.562 1.258 1.257v2.117c0 .695-.563 1.258-1.258 1.258h-2.117a1.257 1.257 0 0 1-1.257-1.258v-2.117c0-.695.562-1.257 1.257-1.257zM8.934 11.078h2.117c.695 0 1.258.562 1.258 1.257v2.117c0 .695-.563 1.258-1.258 1.258H8.934a1.257 1.257 0 0 1-1.257-1.258v-2.117c0-.695.562-1.257 1.257-1.257zM6.409 11.078h2.117c.695 0 1.258.562 1.258 1.257v2.117c0 .695-.563 1.258-1.258 1.258H6.409a1.257 1.257 0 0 1-1.257-1.258v-2.117c0-.695.562-1.257 1.257-1.257z" />
                        </svg>
                    </div>

                    <div className="relative font-mono text-sm leading-relaxed">
                        <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-4">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span className="ml-2 text-slate-500">manifesto.yml</span>
                        </div>
                        
                        <p className="text-pink-400">vision: <span className="text-emerald-400">'unlocking-the-self-hosted-life'</span></p>
                        <p className="text-pink-400 mt-4 text-xs uppercase tracking-widest opacity-50 underline">background:</p>
                        <div className="ml-4 space-y-3 mt-2 text-slate-300">
                            <p className="max-w-3xl">
                                Containerization redefined my reality, yet I constantly hit a ceiling. I grew tired of the fragmented search for reliable infrastructure code and the endless scouring for inspiration.
                            </p>
                            <p className="max-w-3xl">
                                I built this universe to collapse the hurdles. Whether you are a student exploring the basics, a tinkerer building a homelab or a pro architecting a stack, this is the perfect place for you.
                            </p>
                            <p className="text-pink-400 font-bold italic border-l-2 border-pink-400 pl-4 mt-6">
                                "My goal is simple: helping people self-host their digital lives, one stack at a time."
                            </p>
                        </div>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    {initiatives.map((item, index) => (
                        <div key={index} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-500/50 transition-all group">
                            <div className="font-mono text-[11px] mb-4 flex justify-between items-center opacity-70">
                                <span className={item.color}>{item.service}:</span>
                                <span className="text-emerald-500">[healthy]</span>
                            </div>
                            <div className="space-y-2 font-mono text-[13px]">
                                <p className="text-slate-400 text-[11px]">image: <span className="text-slate-600 dark:text-slate-300">{item.image}</span></p>
                                <p className="text-slate-700 dark:text-slate-300 leading-relaxed min-h-[80px]">
                                    {item.description}
                                </p>
                                <div className="pt-4 mt-2">
                                    <p className="text-pink-500 text-[11px]">volumes:</p>
                                    {item.volumes.map(vol => (
                                        <p key={vol} className="text-slate-500 dark:text-slate-500 ml-2 text-[11px]">- {vol}</p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Stats / Impact Board */}
                <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 border border-slate-800 shadow-inner overflow-hidden relative">
                    {/* Decorative Grid background */}
                    <div 
                        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                        style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }}
                    ></div>
                    
                    {/* Header: Centered on mobile */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 mb-12 relative">
                        <div className="px-3 py-1 rounded bg-green-500/10 text-green-500 font-mono text-[10px] border border-green-500/20 tracking-tighter">
                            REAL-TIME-FEED
                        </div>
                        <h3 className="text-slate-400 font-mono text-[12px] uppercase tracking-[0.3em]">
                            Platform Impact
                        </h3>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-8 relative">
                        <div className="group flex justify-center sm:justify-start">
                            <div className="inline-flex flex-col items-start">
                                <div className="text-6xl sm:text-5xl font-black text-white self-center group-hover:text-blue-400 transition-colors tracking-tighter italic uppercase">
                                    {Math.floor(apps.length / 10) * 10}+
                                </div>
                                <div className="text-[10px] text-slate-500 uppercase font-mono mt-3 tracking-[0.2em] font-bold">
                                    Verified Templates
                                </div>
                                <div className="mt-4 h-1.5 w-12 bg-blue-500 rounded-full group-hover:w-20 transition-all duration-500"></div>
                            </div>
                        </div>
                        <div className="group flex justify-center sm:justify-start">
                            <div className="inline-flex flex-col items-start">
                                <div className="text-6xl sm:text-5xl font-black text-white self-center group-hover:text-purple-400 transition-colors tracking-tighter italic uppercase">
                                    Zero
                                </div>
                                <div className="text-[10px] text-slate-500 uppercase font-mono mt-3 tracking-[0.2em] font-bold">
                                    Paywalled Content
                                </div>
                                <div className="mt-4 h-1.5 w-12 bg-purple-500 rounded-full group-hover:w-20 transition-all duration-500"></div>
                            </div>
                        </div>
                        <div className="group flex justify-center sm:justify-start">
                            <div className="inline-flex flex-col items-start">
                                <div className="text-6xl sm:text-5xl font-black text-white self-center group-hover:text-purple-400 transition-colors tracking-tighter italic uppercase">
                                    Fast
                                </div>
                                <div className="text-[10px] text-slate-500 uppercase font-mono mt-3 tracking-[0.2em] font-bold">
                                    Time to 'Up -d'
                                </div>
                                <div className="mt-4 h-1.5 w-12 bg-emerald-500 rounded-full group-hover:w-20 transition-all duration-500"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Personal Signature */}
                <div className="mt-20 text-center font-mono">
                    <p className="text-slate-400 dark:text-slate-500 text-xs italic mb-4">
                        "If you find this useful, share a compose file or fuel the project"
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] text-slate-500 uppercase tracking-tighter">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                        Active Maintainer Mode
                    </div>
                </div>
            </div>
        </div>
    );
}