'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface ScrollToTopProps {
    containerRef?: React.RefObject<HTMLElement | null>;
    threshold?: number;
}

export function ScrollToTop({ containerRef, threshold = 400 }: ScrollToTopProps) {
    const [showScrollTop, setShowScrollTop] = useState(false);
    const targetRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (containerRef) {
            targetRef.current = containerRef.current;
        } else {
            targetRef.current = document.documentElement;
        }
    }, [containerRef]);

    useEffect(() => {
        const target = targetRef.current;
        if (!target) return;

        const handleScroll = () => {
            const scrollTop = target instanceof Window ? target.scrollY : target.scrollTop;
            setShowScrollTop(scrollTop > threshold);
        };

        target.addEventListener('scroll', handleScroll, true);
        return () => target.removeEventListener('scroll', handleScroll, true);
    }, [threshold]);

    const scrollToTop = useCallback(() => {
        const target = targetRef.current;
        if (!target) return;
        target.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    return (
        <button
            onClick={scrollToTop}
            className={`
                fixed bottom-8 right-8 z-[60] flex items-center justify-center w-12 h-12 
                bg-blue-600 text-white rounded-xl shadow-2xl shadow-blue-500/40 
                hover:bg-blue-700 hover:-translate-y-1 cursor-pointer
                transition-all duration-300 ease-in-out
                ${showScrollTop 
                    ? 'opacity-100 translate-y-0 pointer-events-auto' 
                    : 'opacity-0 translate-y-4 pointer-events-none'
                }
            `}
            aria-label="Scroll to top"
        >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M18 15l-6-6-6 6" />
            </svg>
        </button>
    );
}