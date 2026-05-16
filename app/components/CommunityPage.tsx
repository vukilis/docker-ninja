import React, { useState } from 'react';
import { 
    HelpCircle, 
    ChevronDown, 
    ChevronUp, 
    Heart, 
    Users, 
    MessageSquare, 
    Coffee, 
    Zap,
    ExternalLink
} from 'lucide-react';
import { Navigation } from '../hooks/navigation';

const FAQS = [
    {
        question: "Can I request a specific application stack?",
        answer: "Absolutely. Join our GitHub discussions or open an issue with the 'Request App' button on the page. Our community prioritizes stacks that are high-impact and well-maintained.",
        category: "contributing"
    },
    {
        question: "I found a bug, how can I report it?",
        answer: "Good catch! Click the 'Report Issue' button on the page to let us know what's broken or needs to change, and we'll get it sorted out.",
        category: "security"
    },
    {
        question: "Are these configurations production-ready?",
        answer: "While we aim for high standards, these are 'Lab-First' configurations. They are optimized for homelabs and development. Always perform a security audit before deploying to public-facing production environments.",
        category: "deployment"
    },
    {
        question: "Is this beginner-friendly or meant for advanced users?",
        answer: "It's designed to be beginner-friendly while still offering the flexibility and power needed for more experienced users. The configurations are structured to be easy to understand and modify, but they also support advanced use cases.",
        category: "general"
    }
];

const SHOUTOUTS = [
    {
        name: "LinuxServer.io",
        role: "Image Standardization",
        reason: "For their relentless work in providing high-quality, consistent Docker images for the community.",
        tag: "inspiration",
        link: "https://linuxserver.io"
    },
    {
        name: "selfh.st",
        role: "Icon Provider",
        reason: "All script icons used across the site are sourced from the selfh.st icon library — a collection of 5,000+ icons for self-hosted applications. Support: Sponsor, Ko-fi, or Buy Me a Coffee.",
        tag: "assets",
        link: "https://selfh.st/icons/"
    },
    {
        name: "Community Scripts",
        role: "Project Inspiration",
        reason: "A fundamental inspiration for this project. Their work in streamlining deployments through automated scripts set the standard for modern homelab efficiency.",
        tag: "roots",
        link: "https://community-scripts.org/"
    },
    {
        name: "Self-Hoster Community",
        role: "Beta Testers & Architects",
        reason: "Every person who broke a stack, found a bug, and helped improve the documentation.",
        tag: "core",
        link: "#"
    }
];

interface FAQItemProps {
    faq: typeof FAQS[0];
    isOpen: boolean;
    toggle: () => void;
}

const FAQItem: React.FC<FAQItemProps> = ({ faq, isOpen, toggle }) => (
    <div className={`border-b border-slate-800 transition-all duration-300 ${isOpen ? 'bg-slate-950/40' : ''}`}>
        <button 
            onClick={toggle}
            className="w-full py-6 px-6 flex items-center justify-between text-left group/btn"
        >
            <div className="flex items-start gap-4">
                <div className={`mt-1 p-1.5 rounded-md ${isOpen ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-500'} transition-colors`}>
                    <HelpCircle size={16} />
                </div>
                <div className="font-mono text-sm">
                    <span className="text-[10px] uppercase tracking-widest text-pink-400/60 mb-1 block">
                        {faq.category}:
                    </span>
                    <h3 className="text-base font-bold text-slate-200 group-hover/btn:text-purple-400 transition-colors duration-200">
                        {faq.question}
                    </h3>
                </div>
            </div>
            {isOpen ? <ChevronUp className="text-slate-500" /> : <ChevronDown className="text-slate-500" />}
        </button>
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="pl-16 pr-6 pb-6 text-slate-400 leading-relaxed font-sans text-sm md:text-base">
                <div className="font-mono text-xs text-pink-400 mb-1 opacity-50">output:</div>
                <p className="border-l-2 border-slate-800 pl-4 text-slate-300">
                    {faq.answer}
                </p>
            </div>
        </div>
    </div>
);

export default function CommunityPage() {
    const [openFaq, setOpenFaq] = useState<number>(0);
    const { navigateTo } = Navigation();

    return (
        <div className="min-h-screen dark:bg-[#0d1117] text-slate-900 dark:text-slate-100 p-4 md:p-20 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-5xl mx-auto pt-10 md:pt-0">
                
                {/* Header Section */}
                <div className="text-center mb-16 relative">
                    <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-xs font-mono uppercase font-medium text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400 rounded-full border border-purple-500/20">
                        <Users size={12} />
                        Uplink: Established
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-4 tracking-tight uppercase italic">
                        The <span className="text-purple-600 dark:text-purple-400">Terminal</span> Core
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto font-mono text-xs tracking-[0.15em] leading-relaxed">
                        $ cat ./core/manifesto.yml
                    </p>
                </div>

                {/* FAQ Section */}
                <section className="mb-24">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-800"></div>
                        <h2 className="text-sm font-mono uppercase tracking-[0.3em] text-slate-500">FAQ</h2>
                        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-800"></div>
                    </div>
                    
                    <div className="bg-slate-900 dark:bg-slate-950 md:px-4 md:pt-6 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl relative group">
                        <div className="absolute -top-12 -right-12 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-all duration-500 pointer-events-none scale-110 group-hover:scale-105">
                            <svg className="w-64 h-64 text-purple-500" fill="none" stroke="currentColor" strokeWidth="0.75" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                            </svg>
                        </div>
                        <div className="bg-slate-950/60 px-6 py-4 border-b border-slate-800/80 flex items-center justify-between font-mono text-sm">
                            <div className="flex gap-2 items-center">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <span className="ml-2 text-slate-500">faq.yml</span>
                            </div>
                        </div>
                        <div className="divide-y divide-slate-800/60 relative">
                            {FAQS.map((faq, index) => (
                                <FAQItem 
                                    key={index} 
                                    faq={faq} 
                                    isOpen={openFaq === index} 
                                    toggle={() => setOpenFaq(openFaq === index ? -1 : index)} 
                                />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Shoutouts Section */}
                <section className="mb-24">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-200 dark:to-slate-800"></div>
                        <h2 className="text-sm font-mono uppercase tracking-[0.3em] text-slate-400">Shoutouts</h2>
                        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-200 dark:to-slate-800"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {SHOUTOUTS.map((shout, index) => (
                            <div 
                                key={index} 
                                className="group relative bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-800 hover:border-purple-500/50 transition-all duration-500 overflow-hidden"
                            >
                                <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-all"></div>
                                
                                <div className="relative">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className="text-[10px] font-mono text-purple-400 uppercase tracking-tighter block mb-1">
                                                @{shout.tag}
                                            </span>
                                            <a 
                                                href={shout.link} 
                                                target={shout.link !== '#' ? "_blank" : undefined} 
                                                rel="noreferrer"
                                                className={`group/link inline-flex items-center gap-2 ${shout.link !== '#' ? 'cursor-pointer' : 'cursor-default'}`}
                                            >
                                                <h3 className="text-xl font-bold text-black/80 dark:text-white group-hover/link:text-purple-400 transition-colors flex items-center gap-2">
                                                    {shout.name}
                                                    {shout.link !== '#' && <ExternalLink size={14} className="opacity-0 group-hover/link:opacity-100 transition-opacity" />}
                                                </h3>
                                            </a>
                                        </div>
                                        <Heart size={18} className="text-slate-700 group-hover:text-pink-500 transition-colors" />
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
                                            <span className="text-emerald-500">role:</span>
                                            <span className="text-slate-600 dark:text-slate-300 italic">"{shout.role}"</span>
                                        </div>
                                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                            {shout.reason}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mt-20 font-mono">
                    <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 max-w-5xl mx-auto mb-10">
                        {/* CTA Section */}
                        <div className="flex-1 bg-slate-900 dark:bg-slate-950/40 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden group transition-all duration-300 hover:border-purple-500/30 flex flex-col justify-between">
                            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent"></div>
                            <div className="absolute top-0 right-0 p-4 opacity-[0.02] group-hover:opacity-[0.05] transition-all duration-500 pointer-events-none scale-110 group-hover:translate-x-1">
                                <svg className="w-48 h-48 text-purple-500" fill="none" stroke="currentColor" strokeWidth="0.75" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9-9a9 9 0 01-9 9m9-9c1.657 0 3 4.03 3 9s-1.343 9-3 9m0-18c-1.657 0-3 4.03-3 9s1.343 9 3 9m-9-9a9 9 0 019-9" />
                                </svg>
                            </div>
                            <div className="relative flex flex-col items-center text-center gap-3 h-full justify-between">
                                <div className="flex flex-col items-center gap-3">
                                    <span className="inline-flex gap-2 px-3 py-1 mb-6 text-[10px] font-bold tracking-[0.2em] text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-full uppercase">
                                        [core_uplink: initialization]
                                    </span>
                                    <h2 className="text-2xl md:text-3xl font-black text-white mb-6 tracking-tighter uppercase italic">
                                        Scale the <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-400">Terminal </span> Network
                                    </h2>
                                    <p className="max-w-md text-[14px] md:text-[16px] text-slate-400 mb-6 leading-relaxed">
                                        Found a bug? Have a stack suggestion? Want to just say hi? Our core is built on open communication and shared curiosity.
                                    </p>
                                </div>
                                <div className="flex flex-wrap justify-center gap-3 w-full mt-auto">
                                    <a 
                                        href="https://github.com/vukilis/docker-ninja/pulls" 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-purple-500 transition-colors shadow-lg shadow-purple-900/20 text-center decoration-none"
                                    >
                                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                                        </svg>
                                        Contribute
                                    </a>
                                    <a 
                                        href="https://github.com/vukilis/docker-ninja/discussions" 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-950/60 border border-slate-800 text-slate-300 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-950 hover:text-white hover:border-slate-700 transition-colors text-center decoration-none"
                                    >
                                        <MessageSquare size={14} className="text-purple-400" />
                                        Discussions
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Sponsorship Section */}
                        <div className="flex-1 bg-slate-900 dark:bg-slate-950/40 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden group/sponsor transition-all duration-300 hover:border-purple-500/30 flex flex-col justify-between">
                            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent"></div>
                            <div className="relative flex flex-col items-center text-center gap-3 h-full justify-between">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="inline-flex gap-2 px-3 py-1 mb-6 text-[10px] font-bold tracking-[0.2em] text-red-500 bg-red-500/10 border border-red-500/20 rounded-full uppercase">
                                        <Heart size={12} className="fill-red-500" /> System Heartbeat: Healthy
                                    </div>
                                    <h1 className="text-2xl md:text-3xl font-black text-white mb-6 tracking-tighter uppercase italic">
                                        Fuel the <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">Project </span>🚀
                                    </h1>
                                    <p className="max-w-md text-[14px] md:text-[16px] text-slate-400 mb-6 leading-relaxed">
                                        Your support keeps the <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">servers running</span> and the code open source.
                                    </p>
                                </div>
                                <div className="w-full mt-auto flex justify-center">
                                    <button 
                                        onClick={() => navigateTo('Sponsoring')}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-950 border border-slate-800 text-slate-300 hover:text-purple-400 hover:border-purple-500/40 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 group-hover/sponsor:shadow-lg group-hover/sponsor:shadow-purple-950/10 cursor-pointer"
                                    >
                                    <span className="w-4 h-4 flex items-center justify-center shrink-0">❤️</span>
                                    Sponsoring
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Signature */}
                    <div className="text-center">
                        <p className="text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-[0.2em]">
                        Built by Vuk1lis &mdash; Powered by the Community
                        </p>
                    </div>
                    </section>
            </div>
        </div>
    );
}