import { useState, useMemo, useEffect } from 'react';
import { fetchAllApps } from '../actions';

/**
 * useApps Hook
 * * Manages the state and filtering for the Docker Ninja dashboard.
 * Now interfaces with Supabase via Server Actions to provide a scalable
 * source of truth for all application metadata.
 */
export function useApps() {
    const [apps, setApps] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        /**
         * Fetches the full list of applications from Supabase.
         * This replaces the local apps.json dependency.
         */
        const loadApps = async () => {
            try {
                setLoading(true);
                const data = await fetchAllApps();
                setApps(data || []);
            } catch (error) {
                console.error("Failed to load apps from Supabase:", error);
            } finally {
                setLoading(false);
            }
        };

        loadApps();
    }, []);

    // Derived state for unique categories found in the database
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

    /**
     * Helper to get count for a specific category
     */
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