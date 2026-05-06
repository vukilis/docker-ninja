import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

export const ThemeSwitcher = ({ collapsed }: { collapsed?: boolean }) => {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();
    useEffect(() => setMounted(true), []);
    if (!mounted) return null;
    const modes = [{ name: 'light', icon: '☀️' }, { name: 'dark', icon: '🌙' }, { name: 'system', icon: '💻' }];
    return (
        <div className={`flex w-full p-1 bg-slate-100 dark:bg-slate-900 border rounded-xl border-slate-200 dark:border-slate-700 ${collapsed ? 'flex-col' : 'flex-row'}`}>
        {modes.map((mode) => (
            <button
            key={mode.name}
            onClick={() => setTheme(mode.name)}
            title={collapsed ? mode.name : ""}
            className={`flex-1 py-2 rounded-md text-xs font-mono uppercase transition-all duration-300 cursor-pointer ${theme === mode.name ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-400 hover:text-blue-500'}`}
            >
            {mode.icon}
            </button>
        ))}
        </div>
    );
};