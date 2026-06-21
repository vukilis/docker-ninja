"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { getIcon } from "../hooks/icons";

interface RelatedApp {
    id: string | number;
    slug?: string;
    name: string;
    icon_url?: string;
    description?: string;
    [key: string]: unknown;
}

interface RelatedAppsProps {
    apps: RelatedApp[];
    currentSlug?: string;
}

export const RelatedApps: React.FC<RelatedAppsProps> = ({ apps, currentSlug = "" }) => {
    const relatedApps = apps.filter((a) => (a.slug ?? String(a.id)) !== currentSlug);
    const [activeCardId, setActiveCardId] = useState<string | null>(null);
    const [hasScrolled, setHasScrolled] = useState(false);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    
    // Default to vertical grid, state updates on client mount if saved choice exists
    const [mobileLayout, setMobileLayout] = useState<"carousel" | "vertical">("vertical");
    
    const scrollTrackRef = useRef<HTMLDivElement>(null);
    const swipeHintTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

    // Hydrate layout preference from localStorage safely on component mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedLayout = localStorage.getItem("relatedApps_mobileLayout") as "carousel" | "vertical";
            if (savedLayout === "carousel" || savedLayout === "vertical") {
                setMobileLayout(savedLayout);
            }
        }
    }, []);

    // Clean up active card selections if layout shifts, and persist new layout setting
    useEffect(() => {
        setActiveCardId(null);
        if (typeof window !== "undefined") {
            localStorage.setItem("relatedApps_mobileLayout", mobileLayout);
        }
    }, [mobileLayout]);

    const checkScrollability = useCallback(() => {
        const el = scrollTrackRef.current;
        if (!el) return;

        // Check if desktop media query matches
        const isDesktop = typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches;

        // On mobile, if layout is vertical, it cannot be horizontally scrolled. 
        // On desktop, it is always a horizontal carousel, skip this guard.
        if (!isDesktop && mobileLayout === "vertical") {
            setCanScrollLeft(false);
            setCanScrollRight(false);
            return;
        }

        const tolerance = 4;
        setCanScrollLeft(el.scrollLeft > tolerance);
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - tolerance);
    }, [mobileLayout]);

    const scrollRelatedApps = useCallback((direction: "left" | "right") => {
        const el = scrollTrackRef.current;
        if (!el) return;
        
        const scrollAmount = direction === "left" ? -el.clientWidth * 0.75 : el.clientWidth * 0.75;
        el.scrollBy({
            left: scrollAmount,
            behavior: "smooth",
        });
    }, []);

    // Universal Global Keyboard Listener for Arrow Keys
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            const isDesktop = typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches;
            if (!isDesktop && mobileLayout === "vertical") return;

            if (
                document.activeElement?.tagName === "INPUT" ||
                document.activeElement?.tagName === "TEXTAREA"
            ) {
                return;
            }

            if (e.key === "ArrowLeft") {
                e.preventDefault();
                scrollRelatedApps("left");
            } else if (e.key === "ArrowRight") {
                e.preventDefault();
                scrollRelatedApps("right");
            }
        };

        window.addEventListener("keydown", handleGlobalKeyDown);
        return () => {
            window.removeEventListener("keydown", handleGlobalKeyDown);
        };
    }, [mobileLayout, scrollRelatedApps]);

    useEffect(() => {
        const el = scrollTrackRef.current;
        if (!el) return;

        const handleScroll = () => {
            if (!hasScrolled) setHasScrolled(true);
            if (swipeHintTimerRef.current) clearTimeout(swipeHintTimerRef.current);
            checkScrollability();
        };

        const handleTouchStart = () => {
            if (!hasScrolled) setHasScrolled(true);
            if (swipeHintTimerRef.current) clearTimeout(swipeHintTimerRef.current);
        };

        el.addEventListener("scroll", handleScroll, { passive: true });
        el.addEventListener("touchstart", handleTouchStart, { passive: true });

        if (!hasScrolled) {
            swipeHintTimerRef.current = setTimeout(() => {
                setHasScrolled(true);
            }, 4000);
        }

        const resizeObserver = new ResizeObserver(() => checkScrollability());
        resizeObserver.observe(el);

        checkScrollability();

        return () => {
            el.removeEventListener("scroll", handleScroll);
            el.removeEventListener("touchstart", handleTouchStart);
            if (swipeHintTimerRef.current) clearTimeout(swipeHintTimerRef.current);
            resizeObserver.disconnect();
        };
    }, [hasScrolled, checkScrollability, relatedApps, mobileLayout]);

    if (relatedApps.length === 0) return null;

    return (
        <section className="order-4 relative w-full overflow-hidden rounded-2xl border border-slate-200/50 bg-white/70 p-5 mb-20 shadow-xl shadow-slate-200/50 backdrop-blur-xl transition-all dark:border-slate-800/50 dark:bg-slate-950/40 dark:shadow-none sm:p-8 md:mb-20">
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5 dark:from-pink-500/10 dark:to-blue-500/10 rounded-2xl" />
            
            <div className="mb-5 flex items-center justify-between gap-3 md:mb-6">
                <div className="flex items-center gap-3">
                    <div className="h-1.5 w-6 rounded-full bg-pink-500 shadow-[0_0_12px_rgba(211,52,110,0.4)] dark:bg-pink-400 dark:shadow-[0_0_16px_rgba(211,52,110,0.6)]" />
                    <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                        You might also like
                    </h2>
                </div>
                
                {/* Mobile-only View Switcher Interaction */}
                <div className="flex items-center rounded-lg bg-slate-100 p-0.5 dark:bg-slate-900 md:hidden">
                    <button
                        onClick={() => setMobileLayout("carousel")}
                        className={`p-1.5 rounded-md transition-all ${mobileLayout === "carousel" ? "bg-white text-blue-600 shadow-sm dark:bg-slate-800 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`}
                        aria-label="View as horizontal carousel"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2m0 10V7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setMobileLayout("vertical")}
                        className={`p-1.5 rounded-md transition-all ${mobileLayout === "vertical" ? "bg-white text-blue-600 shadow-sm dark:bg-slate-800 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`}
                        aria-label="View as vertical grid"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>

                {/* Desktop-only Navigation Controls */}
                <div className="hidden md:flex items-center gap-3">
                    <button
                        onClick={() => scrollRelatedApps("left")}
                        disabled={!canScrollLeft}
                        className="group/btn inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-md transition-all duration-200 enabled:hover:border-slate-300 enabled:hover:bg-slate-100 enabled:hover:text-blue-600 enabled:active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:enabled:hover:bg-slate-700 dark:enabled:hover:text-blue-400 enabled:cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Scroll left"
                    >
                        <svg className="h-5 w-5 transition-transform duration-200 enabled:group-hover/btn:translate-x-[-2px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                    </button>
                    <button
                        onClick={() => scrollRelatedApps("right")}
                        disabled={!canScrollRight}
                        className="group/btn inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-md transition-all duration-200 enabled:hover:border-slate-300 enabled:hover:bg-slate-100 enabled:hover:text-blue-600 enabled:active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:enabled:hover:bg-slate-700 dark:enabled:hover:text-blue-400 enabled:cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Scroll right"
                    >
                        <svg className="h-5 w-5 transition-transform duration-200 enabled:group-hover/btn:translate-x-[2px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                    </button>
                </div>
            </div>

            <div className="relative">
                <div
                    ref={scrollTrackRef}
                    role="region"
                    aria-label="Related applications carousel"
                    className={`pt-1 transition-all duration-300 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden outline-none rounded-xl
                        ${mobileLayout === "carousel" 
                            ? "flex flex-row gap-4 overflow-x-auto pb-3 snap-x snap-mandatory" 
                            : "flex flex-col gap-3 h-[275px] overflow-y-auto pb-2 snap-y snap-mandatory"
                        } 
                        md:flex md:flex-row md:gap-5 md:pb-4 md:overflow-x-auto md:snap-x md:snap-mandatory md:h-auto`}
                >
                    {relatedApps.map((relatedApp) => {
                        const icon = getIcon(relatedApp.slug ?? "", relatedApp.icon_url);
                        const cardId = String(relatedApp.slug ?? relatedApp.id);
                        const isActive = activeCardId === cardId;
                        
                        return (
                            <Link
                                key={relatedApp.slug ?? relatedApp.id}
                                href={`/app/${encodeURIComponent(cardId)}`}
                                style={{
                                    WebkitTouchCallout: "none",
                                    WebkitTapHighlightColor: "transparent",
                                }}
                                onTouchStart={() => setActiveCardId(cardId)}
                                className={`group relative flex flex-row items-center justify-start gap-4 select-none transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] border p-3.5 shrink-0 snap-start
                                    
                                    /* Dynamic layouts depending on switcher choices */
                                    ${mobileLayout === "carousel" ? "w-[280px] h-[92px] rounded-2xl snap-always" : "w-full h-[84px] rounded-xl"}
                                    
                                    /* Desktop Strict Layout Maintenance */
                                    md:flex-col md:items-center md:justify-between md:gap-0 md:w-[350px] md:h-[210px] md:p-4 md:shrink-0 md:snap-start md:rounded-2xl
                                    
                                    ${isActive
                                        ? "scale-[0.97] border-blue-500/40 bg-blue-500/[0.04] dark:border-blue-400/40 dark:bg-blue-400/[0.04] shadow-inner"
                                        : "border-slate-200/60 bg-white/40 dark:border-slate-800/60 dark:bg-slate-900/30"
                                    }

                                    /* State Interactivity mechanics */
                                    hover:-translate-y-1 hover:border-blue-500/50 dark:hover:border-slate-700
                                    hover:bg-white/80 dark:hover:bg-slate-900/60
                                    hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-none

                                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50`}
                            >
                                {/* App Icon */}
                                <div className={`relative flex shrink-0 items-center justify-center rounded-xl border border-slate-200/70 bg-slate-200 shadow-sm transition-transform duration-300 group-hover:scale-105 dark:border-slate-800 dark:bg-slate-900
                                    ${mobileLayout === "carousel" ? "h-14 w-14 p-2.5" : "h-12 w-12 p-2"}
                                    md:h-16 md:w-16 md:rounded-2xl md:p-3 md:mb-2`}
                                >
                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 dark:from-blue-400/10 dark:to-purple-400/10 md:rounded-2xl" />

                                    {icon?.type === "url" && icon.src ? (
                                        <Image
                                            src={icon.src}
                                            alt={relatedApp.name}
                                            width={44}
                                            height={44}
                                            unoptimized
                                            className="h-full w-full object-contain z-10"
                                        />
                                    ) : icon?.svg ? (
                                        <div
                                            dangerouslySetInnerHTML={{ __html: icon.svg }}
                                            className="h-full w-full fill-slate-700 dark:fill-slate-300 z-10"
                                        />
                                    ) : (
                                        <span className="text-lg font-bold text-slate-700 dark:text-slate-300 z-10 md:text-xl">
                                            {relatedApp.name.charAt(0)}
                                        </span>
                                    )}
                                </div>

                                {/* Content Body Block */}
                                <div className="min-w-0 flex-1 flex flex-col justify-center items-start text-left md:w-full md:items-center md:text-center overflow-hidden">
                                    <h3
                                        className={`text-sm font-bold tracking-tight line-clamp-1 mb-0.5 transition-colors duration-200 w-full md:text-base md:mb-2 md:text-center
                                        ${isActive 
                                            ? "text-blue-600 dark:text-blue-400" 
                                            : "text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                                        }`}
                                    >
                                        {relatedApp.name}
                                    </h3>
                                    <p className={`leading-snug text-slate-500 dark:text-slate-400 text-left line-clamp-3 md:mt-0.5 md:text-[0.8125rem] md:leading-relaxed md:text-slate-700 md:dark:text-slate-500
                                        ${mobileLayout === "carousel" ? "text-[0.75rem]" : "text-[0.715rem]"}`}
                                    >
                                        {relatedApp.description ? String(relatedApp.description) : `Explore ${relatedApp.name}`}
                                    </p>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Mobile Touch Drag Prompt */}
                {!hasScrolled && mobileLayout === "carousel" && (
                    <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white via-white/40 to-transparent dark:from-slate-950 dark:via-slate-950/40 z-10 flex items-center justify-end pr-2 pointer-events-none transition-opacity duration-300 md:hidden">
                        <div className="bg-slate-900/80 backdrop-blur p-1.5 rounded-full shadow dark:bg-slate-800/90 animate-pulse">
                            <svg
                                className="w-3.5 h-3.5 text-white"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M5 12h14" />
                                <path d="M12 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};