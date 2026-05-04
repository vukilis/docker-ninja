import { useState, useMemo } from 'react';
import apps from '../../data/apps.json';

export function useApps() {
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    const categories = useMemo(() => ["All", ...Array.from(new Set(apps.map(a => a.category)))], []);
    
    const appsByCategory = useMemo(() => {
        const map: Record<string, typeof apps> = {};
        categories.forEach(cat => {
        if (cat !== "All") map[cat] = apps.filter(a => a.category === cat);
        });
        return map;
    }, [categories]);

    const filteredApps = useMemo(() => {
        return apps.filter((app) =>
        (selectedCategory === "All" || app.category === selectedCategory) &&
        app.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [search, selectedCategory]);

    // Helper to get count for a category
    const getCountByCategory = (category: string) => {
        return apps.filter(app => app.category === category).length;
    };

    return { apps, appsByCategory, filteredApps, categories, search, setSearch, selectedCategory, setSelectedCategory, getCountByCategory };
}