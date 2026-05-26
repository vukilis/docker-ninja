'use client';
import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { fetchAllApps, fetchAllActiveLikes } from '../actions';
import { supabase } from '../../lib/supabase';

// Define the App interface
export interface App {
    id: string;
    name: string;
    category: string;
    slug: string;
    description?: string;
    [key: string]: any;
}

// Define the AppsContextType interface
interface AppsContextType {
    apps: App[];
    loading: boolean;
    search: string;
    setSearch: React.Dispatch<React.SetStateAction<string>>;
    filteredApps: App[];
    categories: string[];
    getCountByCategory: (category: string) => number;
    totalCount: number;
    detailsCache: Record<string, any>;
    setDetailsCache: React.Dispatch<React.SetStateAction<Record<string, any>>>;
    composeCache: Record<string, string>;
    setComposeCache: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    likedStatusCache: Record<string, boolean>;
    setLikedStatusCache: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
    globalLikes: Record<string, number>;
    setGlobalLikes: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}

const AppsContext = createContext<AppsContextType | null>(null);

export function AppsProvider({ children }: { children: ReactNode }) {
    const [apps, setApps] = useState<App[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    
    const [detailsCache, setDetailsCache] = useState<Record<string, any>>({});
    const [composeCache, setComposeCache] = useState<Record<string, string>>({});
    const [likedStatusCache, setLikedStatusCache] = useState<Record<string, boolean>>({});
    const [globalLikes, setGlobalLikes] = useState<Record<string, number>>({});

    // Derived Logic
    const totalCount = useMemo(() => apps.length, [apps]);

    const filteredApps = useMemo(() => {
        return apps.filter(app => 
            app.name.toLowerCase().includes(search.toLowerCase()) ||
            app.description?.toLowerCase().includes(search.toLowerCase())
        );
    }, [apps, search]);

    const categories = useMemo(() => 
        Array.from(new Set(apps.map(a => a.category))).sort(), 
    [apps]);

    const getCountByCategory = (category: string) => 
        apps.filter(a => a.category === category).length;

    useEffect(() => {
        async function initializeData() {
            try {
                const [appsData, likesData] = await Promise.all([
                    fetchAllApps(),
                    fetchAllActiveLikes()
                ]);
                setApps(appsData || []);
                setGlobalLikes(likesData || {});
                setLoading(false);
            } catch (err) {
                console.error("Initialization failed:", err);
                setLoading(false);
            }
        }
        initializeData();

        const channel = supabase.channel('apps-sync')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'apps' }, (payload) => {
                setApps(current => {
                    if (payload.eventType === 'INSERT') return [...current, payload.new as App];
                    if (payload.eventType === 'UPDATE') return current.map(a => a.id === payload.new.id ? payload.new as App : a);
                    if (payload.eventType === 'DELETE') return current.filter(a => a.id !== payload.old.id);
                    return current;
                });
            }).subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    // Dependencies included in the dependency array
    const value = useMemo(() => ({ 
        apps, filteredApps, categories, search, setSearch, getCountByCategory, totalCount,
        loading, detailsCache, composeCache, setDetailsCache, setComposeCache, 
        likedStatusCache, setLikedStatusCache, globalLikes, setGlobalLikes
    }), [
        apps, filteredApps, categories, search, totalCount, loading, 
        detailsCache, composeCache, likedStatusCache, globalLikes
    ]);

    return <AppsContext.Provider value={value}>{children}</AppsContext.Provider>;
}

export const useAppsGlobal = (): AppsContextType => {
    const context = useContext(AppsContext);
    if (!context) throw new Error('useAppsGlobal must be used within an AppsProvider');
    return context;
};