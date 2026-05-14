import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

export const ThemeSwitcher = ({ collapsed }: { collapsed?: boolean }) => {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const handleThemeChange = (newTheme: string) => {
        // Create a style element to disable all transitions
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
        // Inject it into the head
        document.head.appendChild(disableTransitions);
        // Swap the theme
        setTheme(newTheme);
        // Use a tiny timeout or requestAnimationFrame to ensure the DOM has updated
        window.getComputedStyle(disableTransitions).opacity; // Force a reflow
        setTimeout(() => {
            document.head.removeChild(disableTransitions);
        }, 0);
    };

    const modes = [
        { name: 'light', icon: '☀️' }, 
        { name: 'dark', icon: '🌙' }, 
        { name: 'system', icon: '💻' }
    ];

    return (
        <div className={`flex w-full p-1 bg-slate-100 dark:bg-slate-900 border rounded-xl border-slate-200 dark:border-slate-700 ${collapsed ? 'flex-col' : 'flex-row'}`}>
            {modes.map((mode) => (
                <button
                    key={mode.name}
                    onClick={() => handleThemeChange(mode.name)}
                    title={collapsed ? mode.name : ""}
                    className={`flex-1 py-2 rounded-md text-xs font-mono uppercase cursor-pointer z-10 ${
                        theme === mode.name 
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                        : 'text-slate-400 hover:text-blue-500'
                    }`}
                >
                    {mode.icon}
                </button>
            ))}
        </div>
    );
};