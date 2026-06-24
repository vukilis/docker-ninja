"use client";

import { useState, useEffect, useCallback } from "react";

export interface RecentlyViewedEntry {
	id: string | number;
	slug?: string;
	name: string;
	category: string;
	image?: string;
	description?: string;
	icon_url?: string;
	[key: string]: unknown;
}

const STORAGE_KEY = "docker_ninja_recently_viewed";
const MAX_ITEMS = 8;

function readFromStorage(): RecentlyViewedEntry[] {
	if (typeof window === "undefined") return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}

function writeToStorage(items: RecentlyViewedEntry[]) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function useRecentlyViewed() {
	const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedEntry[]>(() => readFromStorage());

	useEffect(() => {
		writeToStorage(recentlyViewed);
	}, [recentlyViewed]);

	const addToRecentlyViewed = useCallback((app: RecentlyViewedEntry) => {
		setRecentlyViewed((prev) => {
			const filtered = prev.filter((a) => a.id !== app.id);
			const updated = [app, ...filtered].slice(0, MAX_ITEMS);
			writeToStorage(updated);
			return updated;
		});
	}, []);

	return { recentlyViewed, addToRecentlyViewed };
}
