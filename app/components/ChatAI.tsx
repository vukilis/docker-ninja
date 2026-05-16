'use client';

import { useState, useMemo } from 'react';
import { Terminal, Zap, ArrowRight, Sparkles, Bot } from 'lucide-react';
import { useApps } from '../hooks/useApps';

// const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

export const callGemini = async (prompt: string, systemInstruction: string) => {
    // We call our internal API route, NOT OpenAI directly
    const response = await fetch('../api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, systemInstruction })
    });

    if (!response.ok) {
        throw new Error('Server error handling AI request');
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content;
};

export const AISuggestor = ({ onAppSelect }: { onAppSelect: (app: any) => void }) => {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [suggestion, setSuggestion] = useState<string | null>(null);
    
    // Access the apps list from the custom hook to provide context to Gemini
    const { apps } = useApps();

    const recommendedApp = useMemo(() => {
        if (!suggestion) return null;
        return apps.find(app => 
        suggestion.toLowerCase().includes(app.name.toLowerCase())
        );
    }, [suggestion, apps]);

    const handleAsk = async () => {
        if (!input.trim()) return;
        setIsLoading(true);
        setSuggestion(null);

        try {
            const availableApps = apps.map(app => app.name);
            if (availableApps.length === 0) {
                setSuggestion("I don't see any apps in your library yet!");
                setIsLoading(false);
                return;
            }

            const appListString = availableApps.join(', ');
            const systemPrompt = `You are a Docker Expert. Based on the user's needs, suggest the best app from this list: ${appListString}. Explain why in 2 sentences. Format: "I recommend [App Name]. [Reasoning]"`;
            
            // 1. Call your internal API
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    prompt: `I want to: ${input}`, 
                    systemInstruction: systemPrompt 
                })
            });

            const data = await response.json();

            // 2. PARSE OPENAI STRUCTURE
            // OpenAI uses: data.choices[0].message.content
            const result = data.choices?.[0]?.message?.content;

            if (result) {
                setSuggestion(result);
            } else {
                console.error("Unexpected Data Structure:", data);
                setSuggestion("The AI responded, but the data format was unexpected.");
            }

        } catch (err) {
            console.error("AI Error:", err);
            setSuggestion("Sorry, I couldn't connect to the AI service.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ display: "block" }} className="group relative bg-[#0f172a] rounded-[2.5rem] p-1 mb-10 overflow-hidden shadow-2xl shadow-blue-500/10 z-1">
            {/* Animated Background Mesh */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute inset-[-100%] bg-[radial-gradient(circle_at_center,_#2563eb_0%,_transparent_20%)] animate-[pulse_8s_infinite] mix-blend-screen" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
            </div>

            <div className="relative z-10 bg-gradient-to-br from-slate-900/90 to-blue-900/40 backdrop-blur-xl rounded-[2.3rem] p-6 md:p-10 border border-white/5">
                
                {/* Floating Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 text-left">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
                        <Terminal size={12} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400/80">AI NINJA</span>
                    </div>
                    <h3 className="text-2xl md:text-4xl font-black tracking-tighter text-white uppercase italic leading-tight">
                    Ninja <span className="text-blue-500 not-italic">Intelligence</span>
                    </h3>
                </div>
                
                <div className="hidden lg:flex items-center gap-4 px-4 py-2 bg-white/5 rounded-2xl border border-white/10">
                    <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                            <Bot size={14} className="text-blue-400" />
                        </div>
                    ))}
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 leading-none">
                    <span className="text-white">PROCESSED</span><br />
                    {apps.length} STACKS
                    </p>
                </div>
                </div>
                
                {/* Input Terminal */}
                <div className="relative group/input">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl blur opacity-20 group-focus-within/input:opacity-40 transition duration-500" />
                <div className="relative flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                    <input 
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Describe your project goal..."
                        className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-6 py-4 md:py-5 outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600 text-white font-mono text-sm"
                        onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                    />
                    <Zap className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isLoading ? 'text-yellow-400 animate-pulse' : 'text-slate-700'}`} />
                    </div>
                    <button 
                    onClick={handleAsk}
                    disabled={isLoading}
                    className="relative overflow-hidden cursor-pointer bg-blue-600 hover:bg-blue-500 text-white px-8 md:px-10 py-4 md:py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs transition-all disabled:opacity-50 group/btn active:scale-95"
                    >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        {isLoading ? "Analyzing..." : "Initiate Suggestion"}
                        <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                    </button>
                </div>
                </div>

                {suggestion && (
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    {/* AI Reasoning Panel */}
                    <div className="lg:col-span-7 p-5 md:p-6 bg-blue-500/5 rounded-3xl border border-blue-500/10 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-600/50" />
                        <div className="flex items-start gap-3 md:gap-4 text-left">
                        <Sparkles className="w-5 h-5 text-blue-400 shrink-0 mt-1" />
                        <p className="text-xs md:text-sm font-medium text-slate-300 leading-relaxed italic">
                            "{suggestion}"
                        </p>
                        </div>
                    </div>

                    {/* Recommended App Card (High-Tech Style) - Now stacked properly on mobile */}
                    {recommendedApp && (
                    <div className="lg:col-span-5 relative group/card">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur opacity-20 group-hover/card:opacity-40 transition" />
                        <button
                        onClick={() => onAppSelect(recommendedApp)}
                        className="relative w-full flex items-center cursor-pointer justify-between p-4 md:p-5 bg-slate-950 border border-white/10 rounded-3xl hover:border-blue-500/50 transition-all duration-300 group"
                        >
                        <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                            {/* DN Styled Icon */}
                            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-inner group-hover/card:scale-105 transition-transform">
                            {recommendedApp.icon_url ? (
                                <img 
                                src={recommendedApp.icon_url} 
                                alt={recommendedApp.name} 
                                className="w-8 h-8 md:w-10 md:h-10 object-contain drop-shadow-lg"
                                />
                            ) : (
                                <div className="flex text-xl md:text-2xl font-black tracking-tighter leading-none translate-y-[1px]">
                                <span className="text-white">D</span>
                                <span className="text-blue-500">N</span>
                                </div>
                            )}
                            </div>
                            
                            <div className="flex flex-col items-start text-left truncate">
                            <div className="flex items-center gap-1.5 mb-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-blue-400">Match Found</span>
                            </div>
                            <span className="text-base md:text-xl font-black text-white truncate w-full uppercase tracking-tight">
                                {recommendedApp.name}
                            </span>
                            </div>
                        </div>
                        
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-blue-600 group-hover:border-blue-600 transition-all shrink-0 ml-2">
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                        </button>
                    </div>
                    )}
                </div>
                )}
            </div>
        </div>
    );
};