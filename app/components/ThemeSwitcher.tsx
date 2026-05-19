import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

export const ThemeSwitcher = ({ collapsed }: { collapsed?: boolean }) => {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            setMounted(true);
        });
        return () => cancelAnimationFrame(frame);
    }, []);

    if (!mounted) return null;

    const handleThemeChange = (newTheme: string) => {
        const disableTransitions = document.createElement('style');
        disableTransitions.innerHTML = `
            * {
                -webkit-transition: none !important;
                -moz-transition: none !important;
                -o-transition: none !important;
                -ms-transition: none !important;
                transition: none !important;
            }
        `;
        document.head.appendChild(disableTransitions);
        setTheme(newTheme);
        window.getComputedStyle(disableTransitions).opacity; 
        setTimeout(() => {
            document.head.removeChild(disableTransitions);
        }, 0);
    };

    const modes = [
        { name: 'light', icon: '☀️', label: 'Light' }, 
        { name: 'dark', icon: '🌑', label: 'Dark' }, 
        { name: 'system', icon: '💻', label: 'System' }
    ];

    return (
        <div 
            className={`
                flex p-1 rounded-xl transition-all duration-300 ease-in-out w-full overflow-hidden
                bg-slate-200/60 dark:bg-slate-900/80 
                backdrop-blur-md 
                border border-slate-300/40 dark:border-slate-800/50
                ${collapsed ? 'flex-col gap-1' : 'flex-row gap-0.5'}
            `}
        >
            {modes.map((mode) => {
                const isActive = theme === mode.name;

                return (
                    <button
                        key={mode.name}
                        onClick={() => handleThemeChange(mode.name)}
                        title={mode.label}
                        className={`
                            flex-1 py-1.5 px-2 rounded-lg text-sm cursor-pointer z-10
                            flex items-center justify-center
                            transition-all duration-300 ease-in-out font-medium
                            ${
                                isActive 
                                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)] border border-slate-200/50 dark:border-slate-700/30 font-semibold' 
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-300/40 dark:hover:bg-slate-800/40'
                            }
                        `}
                    >
                        <span className={`inline-block transition-transform duration-300 shrink-0 ${isActive ? 'scale-110 rotate-3' : 'scale-100 opacity-80'}`}>
                            {mode.icon}
                        </span>
                        <span 
                            className={`
                                text-xs tracking-wide capitalize whitespace-nowrap overflow-hidden
                                transition-all duration-300 ease-in-out
                                ${collapsed 
                                    ? 'max-w-0 opacity-0 ml-0' 
                                    : 'max-w-[60px] opacity-100 ml-2'
                                }
                            `}
                        >
                            {mode.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};