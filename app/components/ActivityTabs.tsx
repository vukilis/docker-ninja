"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import RecentlyAdded from "./RecentlyAdded";
import RecentlyViewed from "./RecentlyViewed";
import RecentlyUpdated from "./RecentlyUpdated";
import PopularApps from "./PopularApps";
import { AppRow } from "../actions";
import { RecentlyViewedEntry } from "../hooks/useRecentlyViewed";

interface ActivityTabsProps {
	newApps: AppRow[];
	viewed: RecentlyViewedEntry[];
	updatedApps: AppRow[];
	popularApps: AppRow[];
	globalLikes: Record<string, number>;
	onSelectNew: (app: AppRow) => void;
	onSelectViewed: (app: RecentlyViewedEntry) => void;
	onSelectUpdated: (app: AppRow) => void;
	onSelectPopular: (app: AppRow) => void;
}

export default function ActivityTabs({ newApps, viewed, updatedApps, popularApps, globalLikes, onSelectNew, onSelectViewed, onSelectUpdated, onSelectPopular }: ActivityTabsProps) {
	const [activeTab, setActiveTab] = useState<"new" | "viewed" | "updated" | "popular">(() => {
		if (typeof window === "undefined") return "new";
		const raw = localStorage.getItem("docker_ninja_recently_viewed");
		let hasRecentActivity = false;
		try {
			const parsed = raw ? JSON.parse(raw) : [];
			hasRecentActivity = Array.isArray(parsed) && parsed.length > 0;
		} catch {
			hasRecentActivity = false;
		}
		if (!hasRecentActivity) return "new";
		const stored = localStorage.getItem("ninja_activityTab");
		if (stored === "viewed" || stored === "new" || stored === "updated" || stored === "popular") return stored;
		return "new";
	});

	useEffect(() => {
		localStorage.setItem("ninja_activityTab", activeTab);
	}, [activeTab]);

	const prevViewedLengthRef = useRef(viewed.length);

	useEffect(() => {
		const prevLength = prevViewedLengthRef.current;
		prevViewedLengthRef.current = viewed.length;

		if (prevLength === 0 && viewed.length > 0 && activeTab === "new") {
			setActiveTab("viewed");
		}
	}, [viewed.length, activeTab]);

	const resolvedTab = useMemo(() => {
		if (activeTab === "viewed" && viewed.length === 0 && newApps.length > 0) {
			return "new";
		}
		if (activeTab === "updated" && updatedApps.length === 0 && newApps.length > 0) {
			return "new";
		}
		if (activeTab === "popular" && popularApps.length === 0 && newApps.length > 0) {
			return "new";
		}
		return activeTab;
	}, [activeTab, viewed.length, newApps.length, updatedApps.length, popularApps.length]);

	if (newApps.length === 0 && viewed.length === 0 && updatedApps.length === 0 && popularApps.length === 0) return null;

	const hideNew = newApps.length === 0 && resolvedTab === "new";
	const hideViewed = viewed.length === 0 && resolvedTab === "viewed";
	const hideUpdated = updatedApps.length === 0 && resolvedTab === "updated";
	const hidePopular = popularApps.length === 0 && resolvedTab === "popular";

	if (hideNew || hideViewed || hideUpdated || hidePopular) return null;

	return (
		<div className="mb-12 relative group/section">
			{/* Header and Tabs Navigation */}
			<div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
				<div className="flex bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-sm">
				{viewed.length > 0 && (
					<button
						onClick={() => setActiveTab("viewed")}
						className={`px-2.5 py-1.5 sm:px-3 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-150 cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5 ${resolvedTab === "viewed" ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"}`}
					>
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="flex-shrink-0">
							<path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						Viewed
					</button>
				)}
				{popularApps.length > 0 && (
					<button
						onClick={() => setActiveTab("popular")}
						className={`px-2.5 py-1.5 sm:px-3 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-150 cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5 ${
							resolvedTab === "popular" 
								? "bg-red-600 text-white shadow-md shadow-red-600/20" 
								: "text-slate-500 hover:text-red-600 dark:hover:text-red-400"
						}`}
					>
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
							<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
						</svg>
						Popular
					</button>
				)}
				{newApps.length > 0 && (
					<button
						onClick={() => setActiveTab("new")}
						className={`px-2.5 py-1.5 sm:px-3 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-150 cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5 ${resolvedTab === "new" ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"}`}
					>
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
							<path d="M12 3l1.8 5.4L19 10.2l-4.2 4.2 1 6-5.8-3.2-5.8 3.2 1-6L3 10.2l5.2-1.8z" strokeLinejoin="round" strokeLinecap="round" />
						</svg>
						New
					</button>
				)}
				{updatedApps.length > 0 && (
					<button
						onClick={() => setActiveTab("updated")}
						className={`px-2.5 py-1.5 sm:px-3 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-150 cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5 ${resolvedTab === "updated" ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"}`}
					>
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0" >
							<path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
							<path d="M21 3v5h-5" />
							<path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
							<path d="M3 21v-5h5" />
						</svg>
						Updated
					</button>
				)}
				</div>
			</div>

			{/* Tab Content Panels */}
			{resolvedTab === "new" && <RecentlyAdded apps={newApps} onSelectApp={onSelectNew} />}
			{resolvedTab === "viewed" && <RecentlyViewed recentlyViewed={viewed} onSelectApp={onSelectViewed} currentView="dashboard" />}
			{resolvedTab === "updated" && <RecentlyUpdated apps={updatedApps} onSelectApp={onSelectUpdated} />}
			{resolvedTab === "popular" && <PopularApps apps={popularApps} globalLikes={globalLikes} onSelectApp={onSelectPopular} />}
		</div>
	);
}

