import { useState, useMemo } from 'react';
import { useAppsGlobal, App } from '../components/AppsContext';

export function useApps() {
    const { apps, loading } = useAppsGlobal();
    const [search, setSearch] = useState<string>("");
    const [selectedCategory, setSelectedCategory] = useState<string>("Dashboard");

    const totalCount = useMemo(() => apps.length, [apps]);

    const categories = useMemo(() => 
        Array.from(new Set(apps.map((a: App) => a.category))), 
    [apps]);

    const filteredApps = useMemo(() => {
        if (!search.trim()) {
            return apps.filter((app: App) => 
                selectedCategory === "Dashboard" || 
                app.category === selectedCategory || 
                selectedCategory === "categories"
            );
        }

        const query = search.toLowerCase().trim();
        
        return apps
            .map((app: App) => {
                const name = (app.name || "").toLowerCase();
                const score = name.includes(query) ? 100 : 0;
                return { ...app, searchScore: score };
            })
            .filter((app: App) => (app.searchScore ?? 0) > 0)
            .sort((a: App, b: App) => (b.searchScore ?? 0) - (a.searchScore ?? 0));
    }, [search, selectedCategory, apps]);

    const getCountByCategory = (category: string): number => {
        if (category === "Dashboard") return apps.length;
        return apps.filter((app: App) => app.category === category).length;
    };

    return { 
        apps, 
        totalCount, 
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