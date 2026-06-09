'use client';
import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { fetchAllApps, fetchAllActiveLikes } from '../actions';
import { createBrowserClient } from '@supabase/ssr';
// import { createBrowserClient } from '@supabase/ssr';

// --- TYPES ---
export interface App {
	id: string | number;
	slug: string;
	name: string;
	category: string;
	description?: string;
	icon_url?: string;
	[key: string]: unknown;
}

interface AppsContextType {
	apps: App[];
	loading: boolean;
	search: string;
	setSearch: React.Dispatch<React.SetStateAction<string>>;
	filteredApps: App[];
	categories: string[];
	getCountByCategory: (category: string) => number;
	totalCount: number;
	detailsCache: Record<string, unknown>;
	setDetailsCache: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
	composeCache: Record<string, string>;
	setComposeCache: React.Dispatch<React.SetStateAction<Record<string, string>>>;
	likedStatusCache: Record<string, boolean>;
	setLikedStatusCache: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
	globalLikes: Record<string, number>;
	setGlobalLikes: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}

const AppsContext = createContext<AppsContextType | null>(null);

function isAppRecord(value: unknown): value is App {
	if (!value || typeof value !== 'object') return false;
	const record = value as Record<string, unknown>;
	return (
		typeof record.id === 'string' || typeof record.id === 'number'
	) && typeof record.name === 'string' && typeof record.category === 'string' && typeof record.slug === 'string';
}

export function AppsProvider({ children, initialApps = [], initialGlobalLikes = {} }: { children: ReactNode; initialApps?: App[]; initialGlobalLikes?: Record<string, number> }) {
	const [apps, setApps] = useState<App[]>(initialApps);
	const [loading, setLoading] = useState(false);
	const [search, setSearch] = useState('');

	const [detailsCache, setDetailsCache] = useState<Record<string, unknown>>({});
	const [composeCache, setComposeCache] = useState<Record<string, string>>({});
	const [likedStatusCache, setLikedStatusCache] = useState<Record<string, boolean>>({});
	const [globalLikes, setGlobalLikes] = useState<Record<string, number>>(initialGlobalLikes);

	const totalCount = useMemo(() => apps.length, [apps]);

	const filteredApps = useMemo(() => {
		return apps.filter((app) => app.name.toLowerCase().includes(search.toLowerCase()) || app.description?.toLowerCase().includes(search.toLowerCase()));
	}, [apps, search]);

	const categories = useMemo(() => Array.from(new Set(apps.map((a) => a.category))).sort(), [apps]);

	const getCountByCategory = (category: string) => apps.filter((a) => a.category === category).length;

	useEffect(() => {
		if (initialApps.length > 0 || Object.keys(initialGlobalLikes).length > 0) {
			return;
		}

		let cancelled = false;

		async function initializeData() {
			try {
				const [appsData, likesData] = await Promise.all([fetchAllApps(), fetchAllActiveLikes()]);

				if (cancelled) return;

				const normalizedApps = (Array.isArray(appsData) ? appsData.filter(isAppRecord) : []) as App[];
				setApps(normalizedApps);
				setGlobalLikes(likesData && typeof likesData === 'object' ? likesData : {});
				setLoading(false);
			} catch (err) {
				if (!cancelled) {
					console.error('Initialization failed:', err);
					setLoading(false);
				}
			}
		}

		initializeData();

		return () => {
			cancelled = true;
		};
	}, []);

	useEffect(() => {
		if (typeof window === 'undefined') return;

		const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
		const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
		if (!supabaseUrl || !supabaseKey) return;

		const client = createBrowserClient(supabaseUrl, supabaseKey);

		const channel = client
			.channel('apps-sync')
			.on('postgres_changes', { event: '*', schema: 'public', table: 'apps' }, (payload) => {
				setApps((current) => {
					if (payload.eventType === 'INSERT') {
						const next = payload.new as unknown;
						if (isAppRecord(next)) return [...current, next];
						return current;
					}
					if (payload.eventType === 'UPDATE') {
						const next = payload.new as unknown;
						if (isAppRecord(next)) return current.map((a) => (a.id === next.id ? next : a));
						return current;
					}
					if (payload.eventType === 'DELETE') return current.filter((a) => a.id !== payload.old.id);
					return current;
				});
			})
			.subscribe();

		return () => {
			client.removeChannel(channel);
		};
	}, []);

	const value = useMemo(
		() => ({
			apps,
			filteredApps,
			categories,
			search,
			setSearch,
			getCountByCategory,
			totalCount,
			loading,
			detailsCache,
			composeCache,
			setDetailsCache,
			setComposeCache,
			likedStatusCache,
			setLikedStatusCache,
			globalLikes,
			setGlobalLikes,
		}),
		[apps, filteredApps, categories, search, totalCount, loading, detailsCache, composeCache, likedStatusCache, globalLikes]
	);

	return <AppsContext.Provider value={value}>{children}</AppsContext.Provider>;
}

export const useAppsGlobal = (): AppsContextType => {
	const context = useContext(AppsContext);
	if (!context) throw new Error('useAppsGlobal must be used within an AppsProvider');
	return context;
};
