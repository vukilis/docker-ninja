import { useState, useMemo, useEffect } from 'react';
import { fetchAllApps } from '../actions';
import { supabase } from '../../lib/supabase';

export function useApps() {
    const [apps, setApps] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Dashboard");
    const [loading, setLoading] = useState(true);

    // 1. Initial Data Fetch
    useEffect(() => {
        let isMounted = true;
        const loadApps = async () => {
            try {
                setLoading(true);
                const data = await fetchAllApps();
                if (isMounted) setApps(data || []);
            } catch (error) {
                console.error("Failed to load apps:", error);
            } finally {
                setLoading(false);
            }
        };
        loadApps();
        return () => { isMounted = false; };
    }, []);

    // 2. Realtime Subscription
    useEffect(() => {
        const channelId = `realtime-apps-${Math.random()}`;
        const channel = supabase.channel(channelId);

        channel
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'apps' },
                (payload) => {
                    setApps((current) => {
                        if (payload.eventType === 'INSERT') return [...current, payload.new];
                        if (payload.eventType === 'UPDATE') {
                            return current.map((app) => app.id === payload.new.id ? payload.new : app);
                        }
                        if (payload.eventType === 'DELETE') {
                            return current.filter((app) => app.id !== payload.old.id);
                        }
                        return current;
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const categories = useMemo(() => 
        Array.from(new Set(apps.map(a => a.category))), 
    [apps]);

    // 3. Smart Search Logic (Weighted & Fuzzy)
    const filteredApps = useMemo(() => {
        if (!search.trim()) {
            return apps.filter(app => (selectedCategory === "Dashboard" || app.category === selectedCategory || selectedCategory === "categories"));
        }

        const query = search.toLowerCase().trim();
        const queryWords = query.split(/\s+/);

        return apps
            .map(app => {
                let score = 0;
                const name = (app.name || "").toLowerCase();
                const category = (app.category || "").toLowerCase();

                // Exact Name Match (Highest priority)
                if (name === query) score += 200;
                if (name.includes(query)) score += 100;
                if (name.startsWith(query)) score += 50;

                // Keyword scoring across multiple fields
                queryWords.forEach(word => {
                    if (name === word) score += 30;
                    else if (name.includes(word)) score += 10;
                    
                    if (category.includes(word)) score += 5;
                });

                // Simple sequence matching (Typo tolerance)
                if (query.length > 3 && !name.includes(query)) {
                    let matches = 0;
                    let lastIdx = -1;
                    for (const char of query) {
                        const idx = name.indexOf(char, lastIdx + 1);
                        if (idx > -1) { matches++; lastIdx = idx; }
                    }
                    if (matches / query.length > 0.8) score += 10;
                }

                return { ...app, searchScore: score };
            })
            .filter(app => {
                const categoryMatch = (selectedCategory === "Dashboard" || app.category === selectedCategory || selectedCategory === "categories");
                const minThreshold = queryWords.length > 1 ? 25 : 1;
                return categoryMatch && app.searchScore >= minThreshold;
            })
            // Sort by score (best matches first)
            .sort((a, b) => (b.searchScore || 0) - (a.searchScore || 0));
            
    }, [search, selectedCategory, apps]);

    const getCountByCategory = (category: string) => {
        return apps.filter(app => app.category === category).length;
    };

    return { 
        apps, 
        filteredApps, 
        categories, 
        search, 
        setSearch, 
        selectedCategory, 
        setSelectedCategory,
        getCountByCategory,
        loading 
    };
}