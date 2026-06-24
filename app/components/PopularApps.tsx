"use client";

import { AppCard } from "./AppCard";
import { AppRow } from "../actions";
import { FormattingUtils } from "../components/AppModal";

interface PopularAppsProps {
	apps: AppRow[];
	globalLikes: Record<string, number>;
	onSelectApp: (app: AppRow) => void;
}

export default function PopularApps({ apps, globalLikes, onSelectApp }: PopularAppsProps) {
	if (apps.length === 0) return null;

	const getLikes = (slug?: string) => {
		if (!slug) return 0;
		return globalLikes[slug] || 0;
	};

	return (
		<div className="mb-12 relative group/section">
			<div className="flex items-center gap-3 mb-6">
				<div className="relative">
					<div className="p-2 bg-red-600/5 dark:bg-red-600/10 rounded-md border border-red-500/20">
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-red-500">
							<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
						</svg>
					</div>
					<div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full blur-[1px] shadow-[0_0_6px_#f59e0b]" />
				</div>
				<h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Most Popular</h3>
			</div>

			<div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-8 lg:grid-cols-8 xl:grid-cols-8 gap-2 md:gap-4 relative z-0">
				{apps.map((app, index) => {
					const likes = getLikes(app.slug);
					return (
						<div 
							key={`popular-app-${app.id}`} 
							className="relative group/card group transition-all duration-300 ease-out hover:scale-105 active:scale-95 cursor-pointer flex justify-center max-xl:[&_h3]:hidden max-xl:[&_p]:hidden "
							onClick={() => onSelectApp(app)}
						>
							{index < apps.length - 1 && (
								<div className="hidden md:block absolute top-1/2 -right-4 w-4 h-[1px] bg-slate-200 dark:bg-slate-800 group-hover:bg-blue-500/50 transition-colors duration-500" />
							)}
							<AppCard app={app} onClick={() => onSelectApp(app)} />

							{likes > 0 && (
								<div className="
									absolute z-20 inline-flex items-center gap-1 pointer-events-none transition-all duration-300
									/* Mobile / Small Screens Layout (Bottom Center) */
									-bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 shadow-xs backdrop-blur-xs group-hover/card:translate-y-[-13px]
									
									/* Desktop Screens Layout (lg and up - Top Center) */
									lg:top-0 lg:bottom-auto lg:left-1/2 lg:right-auto lg:-translate-x-1/2 lg:-translate-y-1/2 lg:px-2 lg:rounded-full lg:bg-white/80 lg:dark:bg-slate-900/80 lg:border-slate-200/50 lg:dark:border-slate-800/80 lg:text-rose-500 lg:shadow-sm lg:backdrop-blur-md lg:group-hover/card:bg-rose-500 lg:group-hover/card:text-white lg:group-hover/card:border-transparent
								">
									<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
										<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
									</svg>
									<span className="text-[12px] font-bold lg:font-black tracking-tight tabular-nums leading-none">
										{FormattingUtils.formatCompactNumber(likes)}
									</span>
								</div>
							)}
						</div>
					);
				})}
			</div>
			<div className="mt-6 md:mt-10 relative">
				<div className="h-[1px] w-full bg-[#B7C7CD] dark:bg-slate-800/50" />
			</div>
		</div>
	);
}
