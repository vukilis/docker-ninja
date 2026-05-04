// hooks/useTheme.ts
import { useState, useEffect } from 'react';

export const useTheme = () => {
    const [theme, setTheme] = useState('dark');

    useEffect(() => {
        const root = window.document.documentElement;
        const initialColorValue = localStorage.getItem('theme') || 'dark';
        root.classList.toggle('dark', initialColorValue === 'dark');
        setTheme(initialColorValue);
    }, []);

    const toggleTheme = () => {
        const root = window.document.documentElement;
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        root.classList.toggle('dark', newTheme === 'dark');
        localStorage.setItem('theme', newTheme);
        setTheme(newTheme);
    };

    return { theme, toggleTheme };
};