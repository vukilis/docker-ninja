import React, { useState } from 'react';
import { 
    Heart, 
    Coffee,
    ShieldCheck,
    QrCode,
    ExternalLink,
    Lock,
    Copy,
    Check
} from 'lucide-react';

const PayPalIcon = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.32a.641.641 0 0 1 .633-.54h7.19c3.275 0 5.4 1.488 5.617 4.285.011.135.017.272.017.407 0 3.342-2.146 5.565-5.32 5.565h-1.393a.641.641 0 0 0-.633.54l-.79 5.01a.641.641 0 0 1-.633.54l-.56.01zm11.236-12.783c-.006-.118-.016-.236-.027-.354C18.064 5.373 15.82 4.01 12.764 4.01H6.183L3.197 22.996h4.606l.791-5.01a1.442 1.442 0 0 1 1.424-1.215h1.393c3.96 0 7.04-1.606 7.91-5.914.37-1.84.14-3.414-.908-4.303z"/>
        <path d="M12.764 4.01c3.056 0 5.3 1.363 5.525 4.192.011.118.021.236.027.354 1.05 0.89 1.28 2.463.908 4.303-.87 4.308-3.95 5.914-7.91 5.914H9.92a1.442 1.442 0 0 0-1.424 1.215l-.79 5.01h4.606l.791-5.01a.641.641 0 0 1 .633-.54h1.393c3.174 0 5.32-2.223 5.32-5.565 0-.135-.006-.272-.017-.407-.217-2.797-2.342-4.285-5.617-4.285h-7.19a.641.641 0 0 0-.633.54l-.234 1.488h6.183z" opacity=".5"/>
    </svg>
);

// Official Monero SVG
const MoneroIcon = ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0C5.373 0 0 5.373 0 12C0 18.627 5.373 24 12 24C18.627 24 24 18.627 24 12C24 5.373 18.627 0 12 0ZM18.42 16.32V18.12H5.58V16.32H3.78V12.96L5.58 11.16V14.52H8.28V7.56L12 11.28L15.72 7.56V14.52H18.42V11.16L20.22 12.96V16.32H18.42Z" fill="#FF6600"/>
    </svg>
);

export const Sponsoring = () => {
    const [copied, setCopied] = useState(false);
    const [amount, setAmount] = useState('10');
    const [customAmount, setCustomAmount] = useState('');
    
    const XMR_ADDRESS = "44AFFq5kSiGBoZ4NMD244AFFq5kSiGBoZ4NMD244AFFq5kSiGBoZ4NMD2";
    const KOFI_USERNAME = "yourusername";
    const PAYPAL_EMAIL = "your@email.com";

    const handleCopy = (text) => {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Fallback copy failed', err);
        }
        
        document.body.removeChild(textArea);
    };

    const handleAction = (platform) => {
        const final = amount === 'custom' ? customAmount : amount;
        if (platform === 'kofi') window.open(`https://ko-fi.com/${KOFI_USERNAME}/?amount=${final}`, '_blank');
        if (platform === 'paypal') window.open(`https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=${encodeURIComponent(PAYPAL_EMAIL)}&amount=${final}`, '_blank');
    };

    return (
        <div className="min-h-screen dark:bg-[#0d1117] dark:text-slate-300 text-slate-300 font-sans p-4 md:p-20">
            <div className="max-w-5xl mx-auto space-y-8 pt-10 md:pt-0">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex gap-2 px-3 py-1 mb-6 text-[10px] font-mono font-bold tracking-[0.2em] text-red-500 bg-red-500/10 border border-red-500/20 rounded-full uppercase">
                        <Heart size={12} className="fill-red-500" /> System Heartbeat: Healthy
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter uppercase italic">
                        Fuel the <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">Project </span>🚀
                    </h1>
                    <p className="text-slate-900 dark:text-slate-400 max-w-xl mx-auto font-mono text-xs tracking-[0.15em] leading-relaxed">
                        $ ./initiate-support --mode=independent-creator
                    </p>
                </div>
                
                {/* 1. CONTRIBUTION MANIFEST */}
                <section className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    <div className="bg-slate-900 dark:bg-slate-950 rounded-3xl p-6 md:p-10 mb-16 shadow-2xl border border-slate-800 relative overflow-hidden group">
                        {/* Decorative Background Icon */}
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                            <svg className="w-48 h-48 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                        </div>

                        <div className="relative font-mono text-sm leading-relaxed">
                            <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-4">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <span className="ml-2 text-slate-500">funding.lock</span>
                            </div>
                            
                            <p className="text-pink-400">"fuel_source": <span className="text-emerald-400">"community_sponsorship"</span></p>                            
                            <p className="text-pink-400 mt-4 text-xs uppercase tracking-widest opacity-50 underline">deployment_notes:</p>

                            <div className="ml-4 space-y-3 mt-2 text-slate-300">
                                <p className="max-w-3xl">
                                    If these <span className="text-blue-400">compose files</span> saved you hours of debugging or 
                                    helped you learn something new, consider sending a one-time 
                                    donation to keep the lights on and the registry growing.
                                </p>
                                <p className="max-w-3xl">
                                    Your support keeps the <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">servers running</span> and the code open source. Choose your preferred method below.
                                </p>
                                <p className="text-pink-400 font-bold italic border-l-2 border-pink-400 pl-4 mt-6">
                                    "Individual contributions ensure a decentralized future for self-hosters."
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. KOFI AND PAYPAL */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-100 dark:bg-[#ddeeffeb] rounded-2xl p-6 flex flex-col justify-between items-start group cursor-pointer hover:ring-4 ring-blue-400/20 transition-all" onClick={() => handleAction('paypal')}>
                        <div className="flex justify-between w-full mb-8">
                            <div className="text-[#0070ba]">
                                <PayPalIcon size={32} />
                            </div>
                            <ExternalLink size={18} className="text-slate-600 group-hover:text-[#0070ba] transition-colors" />
                        </div>
                        <div>
                            <h3 className="text-[#003087] font-black text-xl uppercase italic">PayPal</h3>
                            <p className="text-slate-500 text-xs font-mono mt-1">SECURE INSTANT TRANSFER</p>
                        </div>
                    </div>

                    <div className="bg-red-300 rounded-2xl p-6 flex flex-col justify-between items-start group cursor-pointer hover:ring-4 ring-white/20 transition-all" onClick={() => handleAction('kofi')}>
                        <div className="flex justify-between w-full mb-8">
                            <div className="bg-white p-2 rounded-lg">
                                <Coffee size={24} className="text-orange-600" />
                            </div>
                            <ExternalLink size={18} className="text-slate-500 group-hover:text-orange-800 transition-colors" />
                        </div>
                        <div>
                            <h3 className="text-orange-800 font-black text-xl uppercase italic">Ko-fi</h3>
                            <p className="text-slate-500 text-xs font-mono mt-1">BUY A COFFEE UNIT</p>
                        </div>
                    </div>
                </section>

                {/* 3. MONERO AND QR CODE */}
                <section className="bg-[#1a1b1e] rounded-3xl border border-orange-500/30 p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                        <MoneroIcon size={200} />
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-center gap-10 relative">
                        <div className="flex-shrink-0 bg-white p-4 rounded-2xl shadow-[0_0_50px_rgba(255,102,0,0.2)] group relative">
                            {/* SVG Placeholder for QR Code */}
                            <div className="w-40 h-40 bg-slate-100 flex items-center justify-center relative overflow-hidden rounded-lg">
                                <QrCode size={120} className="text-slate-900 opacity-20" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                        <MoneroIcon size={48} />
                                </div>
                            </div>
                            <div className="absolute inset-0 bg-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                                <span className="bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full">SCAN TO PAY</span>
                            </div>
                        </div>

                        <div className="flex-grow min-w-0 space-y-4 w-full text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-3">
                                <MoneroIcon size={32} />
                                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Monero (XMR)</h2>
                            </div>
                            
                            <p className="text-slate-400 font-mono text-xs leading-relaxed max-w-md mx-auto md:mx-0">
                                The gold standard for private transactions. Supports the project without leaving a digital footprint.
                            </p>

                            <div className="bg-black/40 border border-slate-800 rounded-2xl p-2 pl-4 flex items-left gap-2 group max-w-full items-center">
                                <div className="flex-grow min-w-0 wrap-break-word custom-scrollbar py-2 text-left">
                                    <code className="text-[12px] md:text-xs text-orange-500 font-mono pr-4">
                                        {XMR_ADDRESS}
                                    </code>
                                </div>
                                <button 
                                    onClick={() => handleCopy(XMR_ADDRESS)}
                                    className={`
                                        flex-shrink-0 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 h-10
                                        ${copied 
                                            ? 'bg-emerald-500 text-white' 
                                            : 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20'
                                        }
                                    `}
                                >
                                    {copied ? <Check size={14} /> : <Copy size={14} />}
                                    <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. PRIVACY GUARANTEE */}
                <section className="bg-emerald-500/5 border border-emerald-500 dark:border-emerald-500/20 rounded-2xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="mt-1">
                            <ShieldCheck className="text-emerald-500" size={24} />
                        </div>
                        <div>
                            <h4 className="text-emerald-600 dark:text-emerald-400 font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                                Privacy Protocol Active <Lock size={12} />
                            </h4>
                            <p className="mt-2 text-slate-600 dark:text-slate-400 text-sm leading-relaxed italic">
                                "I respect your privacy. Monero donations are fully anonymous — I never collect names, emails, or any identifying information. Your support remains as private as your browsing should be."
                            </p>
                        </div>
                    </div>
                </section>

                {/* Footer Metadata */}
                <div className="text-center pt-8 border-t border-slate-900 font-mono">
                    <div className="inline-flex items-center gap-4 text-xs text-slate-600 uppercase tracking-[0.3em]">
                        <span>Secure SSL</span>
                        <div className="w-1 h-1 rounded-full bg-slate-800" />
                        <span>No Cookies</span>
                        <div className="w-1 h-1 rounded-full bg-slate-800" />
                        <span>Direct Support</span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Sponsoring;