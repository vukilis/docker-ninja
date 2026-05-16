import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';

// Interface for type safety
interface App {
    id: string | number;
    slug: string;
    name: string;
    category: string;
    icon_url?: string;
}

interface SearchInputProps {
    apps: App[];
    search: string;
    setSearch: (val: string) => void;
    onAppSelect?: (app: App) => void;
}

export default function SearchInput({ apps = [], search, setSearch, onAppSelect }: SearchInputProps) {
    const [isFocused, setIsFocused] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const activeItemRef = useRef<HTMLButtonElement>(null);

    // Optimized filtering: only recalculates when apps or search string changes
    const dropdownMatches = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return [];
        return apps
            .filter(app => 
                app.name.toLowerCase().includes(query) ||
                app.category?.toLowerCase().includes(query)
            )
            .slice(0, 15);
    }, [apps, search]);

    // Reset keyboard selection index when query changes
    useEffect(() => {
        setSelectedIndex(-1);
    }, [search]);

    // Handle smooth scrolling for keyboard navigation
    useEffect(() => {
        if (selectedIndex !== -1 && activeItemRef.current) {
            activeItemRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });
        }
    }, [selectedIndex]);

    // Close dropdown on click-outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsFocused(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Memoized selection handler to prevent closure staleness
    const handleSelectApp = useCallback((app: App) => {
        setSearch(app.name);
        setIsFocused(false);
        setSelectedIndex(-1);
        onAppSelect?.(app);
    }, [onAppSelect, setSearch]);

    const triggerSearch = useCallback(() => {
        if (selectedIndex >= 0 && dropdownMatches[selectedIndex]) {
            handleSelectApp(dropdownMatches[selectedIndex]);
            return;
        } 
        if (dropdownMatches.length > 0) {
            handleSelectApp(dropdownMatches[0]);
            return;
        } 
        if (search.trim()) {
            const exactMatch = apps.find(a => 
                a.name.toLowerCase() === search.toLowerCase().trim()
            );
            if (exactMatch) handleSelectApp(exactMatch);
        }
    }, [dropdownMatches, handleSelectApp, search, apps, selectedIndex]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        switch (e.key) {
            case 'Enter':
                e.preventDefault();
                triggerSearch();
                break;
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => (prev < dropdownMatches.length - 1 ? prev + 1 : prev));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
                break;
            case 'Escape':
                e.preventDefault();
                setIsFocused(false);
                break;
            case 'Tab':
                setIsFocused(false);
                break;
        }
    };

    const showResults = isFocused && search.trim().length > 0;

    return (
        <div className="w-full max-w-md mx-auto relative" ref={containerRef}>
            <div className="relative group">
                <div className={`absolute -inset-0.5 bg-blue-500/20 rounded-xl blur transition duration-500 ${isFocused ? 'opacity-100' : 'opacity-0'}`} />
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="Search container..." 
                        value={search} 
                        onFocus={() => setIsFocused(true)}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            if (!isFocused) setIsFocused(true);
                        }} 
                        onKeyDown={handleKeyDown}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-blue-600/30 hover:border-blue-500/60 rounded-full border px-10 py-2 text-sm focus:ring-2 ring-blue-500 transition-all outline-none text-slate-900 dark:text-white" 
                    />
                    
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </div>

                    {search && (
                        <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {showResults && (
                <div className="absolute top-full mt-2 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden z-50">
                    <div className="max-h-[320px] overflow-y-auto p-2 scroll-smooth">
                        {dropdownMatches.length > 0 ? (
                            <div className="flex flex-col gap-1">
                                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    Quick Selection
                                </div>
                                {dropdownMatches.map((app, index) => (
                                    <button
                                        key={app.id || app.name}
                                        ref={selectedIndex === index ? activeItemRef : null}
                                        onClick={() => handleSelectApp(app)}
                                        className={`flex items-center gap-3 p-2 rounded-lg transition-colors group text-left w-full ${
                                            selectedIndex === index 
                                            ? 'bg-blue-50 dark:bg-blue-900/40 ring-1 ring-inset ring-blue-500/20' 
                                            : 'hover:bg-blue-50 dark:hover:bg-blue-900/20'
                                        }`}
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700 flex-shrink-0">
                                            {app.icon_url ? (
                                                <img src={app.icon_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-sm font-bold text-slate-400 uppercase">{app.name.charAt(0)}</span>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className={`text-sm font-semibold truncate transition-colors ${
                                                selectedIndex === index ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-slate-100'
                                            } group-hover:text-blue-600 dark:group-hover:text-blue-400`}>
                                                {app.name}
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                                {app.category || 'App'}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="py-6 text-center text-sm text-slate-500 italic">No matches found</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}