import { useState, useEffect } from 'react';

export const RotatingMessage = () => {
    const [index, setIndex] = useState(0);

    const messages = [
        <p key={0} className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed tracking-tight transition-colors duration-500">
            Master your <span className="relative inline-block text-slate-900 dark:text-white font-bold group-hover:text-blue-600 transition-colors duration-300">
            containerization universe
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-600/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </span> with official <span className="italic font-serif text-blue-500/80">compose</span> stacks for any application, <span className="relative inline-block text-slate-900 dark:text-white font-bold group-hover:text-blue-600 transition-colors duration-300">all in one place
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-600/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </span>
        </p>,

        <p key={1} className="text-[18px] md:text-2xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed tracking-tight transition-all duration-500">
        Dive into a <span className="relative inline-block text-slate-900 dark:text-white font-bold group-hover:text-blue-600 transition-colors duration-300">hub perfectly crafted</span> for both absolute beginners and <span className="italic font-serif text-blue-500/80">seasoned experts</span> in the vast <span className="relative inline-block text-slate-900 dark:text-white font-bold group-hover:text-blue-600 transition-colors duration-300">containerization ecosystem</span>
        </p>
    ];

    useEffect(() => {
        const timer = setInterval(() => {
        setIndex((prev) => (prev + 1) % messages.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="h-24 md:h-20 overflow-hidden relative">
        {messages.map((msg, i) => (
            <div 
            key={i}
            className={`absolute transition-all duration-700 ease-in-out w-full ${index === i ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            >
            {msg}
            </div>
        ))}
        </div>
    );
};