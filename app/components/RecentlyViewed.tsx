"use client";

import { AppCard } from "./AppCard";
import { RecentlyViewedEntry } from "../hooks/useRecentlyViewed";

interface RecentlyViewedProps {
	recentlyViewed: RecentlyViewedEntry[];
	onSelectApp: (app: RecentlyViewedEntry) => void;
	currentView: string;
}

export default function RecentlyViewed({ recentlyViewed, onSelectApp, currentView }: RecentlyViewedProps) {
	if (recentlyViewed.length === 0 || currentView === "categories") return null;

	return (
		<div className="mb-12 relative group/section">
			<div className="flex items-center gap-3 mb-6">
				<div className="relative">
					<div className="p-2 bg-blue-600/5 dark:bg-blue-600/10 rounded-lg border border-blue-500/20">
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-blue-500">
							<path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
					<div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full blur-[2px] shadow-[0_0_8px_#3b82f6]" />
				</div>
				<h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Recently Viewed</h3>
			</div>

			<div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-8 lg:grid-cols-8 xl:grid-cols-8 gap-2 md:gap-4 relative z-0">
				{recentlyViewed.map((app, index) => (
					<div key={`recent-${app.id}`} className="relative group">
						{index < recentlyViewed.length - 1 && (
							<div className="hidden md:block absolute top-1/2 -right-4 w-4 h-[1px] bg-slate-200 dark:bg-slate-800 group-hover:bg-blue-500/50 transition-colors duration-500" />
						)}

						<div
							className="relative z-10 transition-transform duration-300 cursor-pointer transform origin-top max-xl:[&_h3]:hidden max-xl:[&_p]:hidden max-xl:[&_span:not(.icon-span)]:hidden max-md:flex max-md:justify-center"
							onClick={() => onSelectApp(app)}
						>
							<AppCard app={app} onClick={() => onSelectApp(app)} />
						</div>
					</div>
				))}
			</div>
			<div className="mt-6 md:mt-10 relative">
				<div className="h-[1px] w-full bg-[#B7C7CD] dark:bg-slate-800/50" />
			</div>
		</div>
	);
}
