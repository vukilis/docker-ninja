'use client';
import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { fetchAllApps, fetchAllActiveLikes } from '../actions';
import { supabase } from '../../lib/supabase';

export interface App {
    id: string;
    name: string;
    category: string;
    slug: string;
    [key: string]: any;
}

interface AppsContextType {
    apps: App[];
    loading: boolean;
    // Global caches
    detailsCache: Record<string, any>;
    composeCache: Record<string, string>;
    setDetailsCache: React.Dispatch<React.SetStateAction<Record<string, any>>>;
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
    
    // Persistent caches
    const [detailsCache, setDetailsCache] = useState<Record<string, any>>({});
    const [composeCache, setComposeCache] = useState<Record<string, string>>({});
    const [likedStatusCache, setLikedStatusCache] = useState<Record<string, boolean>>({});
    const [globalLikes, setGlobalLikes] = useState<Record<string, number>>({});

    useEffect(() => {
        fetchAllApps().then((data: App[] = []) => {
            setApps(data);
            setLoading(false);
        });

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

    useEffect(() => {
        async function loadLikes() {
            const data = await fetchAllActiveLikes(); // Your function to get likes from DB
            setGlobalLikes(data);
        }
        loadLikes();
    }, []);

    const value = useMemo(() => ({ 
        apps, loading, detailsCache, composeCache, setDetailsCache, setComposeCache, 
        likedStatusCache, setLikedStatusCache, globalLikes, setGlobalLikes
    }), [apps, loading, detailsCache, composeCache, likedStatusCache, setLikedStatusCache, globalLikes, setGlobalLikes]);

    return <AppsContext.Provider value={value}>{children}</AppsContext.Provider>;
}

export const useAppsGlobal = (): AppsContextType => {
    const context = useContext(AppsContext);
    if (!context) throw new Error('useAppsGlobal must be used within an AppsProvider');
    return context;
};