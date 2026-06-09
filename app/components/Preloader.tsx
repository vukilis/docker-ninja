"use client";
import React, { useState, useEffect } from 'react';

export default function Preloader({ onComplete }: { onComplete?: () => void }) {
    const [phase, setPhase] = useState<'connecting' | 'assembling' | 'fade'>('connecting');
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // 1. Connection phase ends
        const t1 = setTimeout(() => setPhase('assembling'), 800);
        
        // 2. Start the fade out animation
        const t2 = setTimeout(() => setPhase('fade'), 2500);
        
        // 3. Final cleanup and unmount
        const t3 = setTimeout(() => {
        setIsVisible(false);
        if (typeof onComplete === 'function') {
            onComplete();
        }
        }, 3000);

        return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        };
    }, [onComplete]);

    if (!isVisible) return null;

    return (
        <div 
        className={`fixed inset-0 my-custom-background z-[200] flex flex-col items-center justify-center transition-opacity duration-500 ease-in-out ${phase === 'fade' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
        <div className="relative flex flex-col items-center">
            
            {/* DN Logo Connection Animation Container */}
            {/* Scaled up container: h-32/w-32 on mobile, h-48/w-48 on desktop */}
            <div className="relative h-32 w-32 md:h-48 md:w-48 mb-16 flex items-center justify-center">
            
            {/* Background Square Frame */}
            <div className={`absolute inset-0 border-[3px] border-blue-500/20 rounded-[2rem] transition-all duration-1000 ${phase !== 'connecting' ? 'scale-100 opacity-100 rotate-0' : 'scale-150 opacity-0 rotate-45'}`} />
            
            {/* Scaled up typography: 7.5rem on mobile, 12rem on desktop */}
            <div className="flex text-[7.5rem] md:text-[12rem] font-black tracking-tighter select-none z-10 leading-none">
                {/* The 'D' part */}
                <div className={`transition-all duration-700 ease-out transform text-white
                ${phase === 'connecting' ? '-translate-x-16 opacity-0' : 'translate-x-0 opacity-100'}`}>
                D
                </div>
                
                {/* The 'N' part */}
                <div className={`transition-all duration-700 ease-out transform text-blue-600
                ${phase === 'connecting' ? 'translate-x-16 opacity-0' : 'translate-x-0 opacity-100'}`}>
                N
                </div>
            </div>

            {/* Impact/Glow Effect on connection */}
            <div className={`absolute inset-0 bg-blue-500/20 blur-[80px] rounded-full transition-opacity duration-500 ${phase === 'assembling' ? 'opacity-100 scale-150' : 'opacity-0 scale-50'}`} />
            </div>

            {/* Brand Name appearing after logo connects */}
            <div className={`text-xs md:text-lg font-black tracking-[0.5em] text-slate-400 mb-8 ml-2 transition-all duration-1000 transform select-none
            ${phase === 'assembling' ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
            DOCKER <span className="text-blue-600">NINJA</span>
            </div>
        </div>
        </div>
    );
}