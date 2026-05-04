"use client";
import { useState, useEffect } from 'react';

export default function Preloader() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mimic boot-up time
        const timer = setTimeout(() => setLoading(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    if (!loading) return null;

    return (
        <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="font-mono text-blue-500 animate-pulse">
            INITIALIZING DOCKER-NINJA...
        </div>
        </div>
    );
}