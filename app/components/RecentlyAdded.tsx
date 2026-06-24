"use client";

import { AppCard } from "./AppCard";
import { AppRow } from "../actions";

interface RecentlyAddedProps {
	apps: AppRow[];
	onSelectApp: (app: AppRow) => void;
}

function formatDate(dateString?: string): string {
	if (!dateString) return "";
	return new Date(dateString).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

export default function RecentlyAdded({ apps, onSelectApp }: RecentlyAddedProps) {
	if (apps.length === 0) return null;

	return (
		<div className="mb-12 relative group/section">
			<div className="flex items-center gap-3 mb-6">
				<div className="relative">
					<div className="p-2 bg-emerald-600/5 dark:bg-emerald-600/10 rounded-md border border-emerald-500/20">
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 text-emerald-500">
							<path d="M12 3l1.8 5.4L19 10.2l-4.2 4.2 1 6-5.8-3.2-5.8 3.2 1-6L3 10.2l5.2-1.8z" strokeLinejoin="round" strokeLinecap="round" />
						</svg>
					</div>
					<div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full blur-[1px] shadow-[0_0_6px_#10b981]" />
				</div>
				<h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">What's New</h3>
			</div>

			<div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-8 lg:grid-cols-8 xl:grid-cols-8 gap-2 md:gap-4 relative z-0">
				{apps.map((app, index) => (
					<div key={`recently-added-${app.id}`} className="relative group">
						{index < apps.length - 1 && (
							<div className="hidden md:block absolute top-1/2 -right-4 w-4 h-[1px] bg-slate-200 dark:bg-slate-800 group-hover:bg-blue-500/50 transition-colors duration-500" />
						)}

						<div
							className="relative z-10 transition-transform duration-300 cursor-pointer transform origin-top max-xl:[&_h3]:hidden max-xl:[&_p]:hidden max-xl:[&_span:not(.icon-span)]:hidden max-md:flex max-md:justify-center"
							onClick={() => onSelectApp(app)}
						>
							<AppCard app={app} onClick={() => onSelectApp(app)} />
						</div>
						<p className="text-center text-[10px] font-semibold text-slate-400 dark:text-slate-600 mt-1.5">
							{formatDate((app as Record<string, unknown>).created_at as string | undefined)}
						</p>
					</div>
				))}
			</div>
			<div className="mt-6 md:mt-10 relative">
				<div className="h-[1px] w-full bg-[#B7C7CD] dark:bg-slate-800/50" />
			</div>
		</div>
	);
}