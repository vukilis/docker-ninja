import { useState, useMemo, useEffect } from 'react';
import { fetchAllApps } from '../actions';
import { supabase } from '../../lib/supabase'; 

export function useApps() {
    const [apps, setApps] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [loading, setLoading] = useState(true);

    // 1. Initial Data Fetch
    useEffect(() => {
        const loadApps = async () => {
            try {
                setLoading(true);
                const data = await fetchAllApps();
                setApps(data || []);
            } catch (error) {
                console.error("Failed to load apps:", error);
            } finally {
                setLoading(false);
            }
        };
        loadApps();
    }, []);

    // 2. Realtime Subscription
    useEffect(() => {
        // Generate a unique ID for this specific hook instance
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
            .subscribe((status) => {
                if (status !== 'SUBSCRIBED') {
                    // console.warn("Realtime status:", status);
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const categories = useMemo(() => 
        ["All", ...Array.from(new Set(apps.map(a => a.category)))], 
    [apps]);
    
    // Filtered list based on search query and category selection
    const filteredApps = useMemo(() => {
        return apps.filter((app) =>
            (selectedCategory === "All" || app.category === selectedCategory || selectedCategory === "ShowCategories") &&
            app.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [search, selectedCategory, apps]);


    // Helper to get count for a specific category
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