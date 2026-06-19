"use client";

import React, { useRef } from "react";
import { ThemeSwitcher } from "./ThemeSwitcher";

export type SidebarViewMode = "dashboard" | "categories" | "about" | "sponsoring" | "community" | "docs";

interface SidebarItemProps {
	icon: React.ReactNode;
	label: string;
	count?: number;
	isActive: boolean;
	onClick: () => void;
	collapsed: boolean;
	size?: "large" | "small";
}

interface MainSidebarProps {
	apps: { id: string | number; slug?: string; name: string; category: string; [key: string]: unknown }[];
	categories: string[];
	currentView: SidebarViewMode;
	sidebarOpen: boolean;
	sidebarCollapsed: boolean;
	setSidebarOpen: (open: boolean) => void;
	setSidebarCollapsed: (collapsed: boolean) => void;
	onNavigateView: (view: SidebarViewMode) => void;
	onNavigateLanding: () => void;
	onRandomApp: () => void;
	onRequest: () => void;
}

const REPO = "vukilis/docker-ninja";

export function formatVersion(tag: string) {
	return tag.startsWith("v") || tag.startsWith("V") ? tag.slice(1) : tag;
}

export function useLatestVersion() {
	const [version, setVersion] = React.useState<string | null>(null);
	const mounted = useRef(true);

	React.useEffect(() => {
		mounted.current = true;
		fetch(`https://api.github.com/repos/${REPO}/releases/latest`, {
			headers: { Accept: "application/vnd.github+json" },
		})
			.then((r) => (r.ok ? r.json() : Promise.reject()))
			.then((d) => { if (mounted.current && d.tag_name) setVersion(d.tag_name); })
			.catch(() => {});
		return () => { mounted.current = false; };
	}, []);

	return version;
}

export const Logo = ({ onClick, className = "" }: { onClick?: () => void; className?: string }) => (
	<div
		onClick={onClick}
		className={`relative w-10 h-10 flex-shrink-0 flex cursor-pointer items-center justify-center border-2 border-blue-600/20 rounded-lg my-custom-background group ${className}`}
	>
		<div className="absolute flex text-4xl font-black tracking-tighter select-none z-10 leading-none">
			<span className="text-slate-900 dark:text-white group-hover:-translate-y-1 transition-transform duration-300">D</span>
			<span className="text-blue-600 group-hover:translate-y-1 transition-transform duration-300">N</span>
		</div>
	</div>
);

const SidebarItem = ({ icon, label, count, isActive, onClick, collapsed, size = "large" }: SidebarItemProps) => {
	const heightClass = size === "large" ? "h-10 xl:h-12" : "h-9 xl:h-11";
	const activeClasses = isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100";

	return (
		<button
			onClick={onClick}
			className={`w-full flex items-center ${heightClass} rounded-xl font-bold uppercase text-xs tracking-wider transition-all duration-300 cursor-pointer justify-start overflow-hidden ${activeClasses}`}
		>
			<div className="w-[64px] flex items-center justify-center shrink-0">{icon}</div>
			<div
				className={`flex items-center ${count !== undefined ? "justify-between" : "justify-start"} flex-1 pr-4 min-w-0 transition-all duration-300 ease-in-out xl:${collapsed ? "opacity-0 max-w-0 pointer-events-none" : "opacity-100 max-w-[200px]"} opacity-100 max-w-[200px]`}
			>
				<span className="whitespace-nowrap overflow-hidden text-left">{label}</span>
				{count !== undefined && (
					<span
						className={`px-2 py-0.5 rounded-md text-[10px] lg:text-[11px] font-sans shrink-0 ml-2 ${isActive ? "bg-white/20" : "bg-slate-100 dark:bg-slate-800"}`}
					>
						{count}
					</span>
				)}
			</div>
		</button>
	);
};

const SidebarFooter = ({ collapsed, onNavigateLanding }: { collapsed: boolean; onNavigateLanding: () => void }) => (
	<div className="pt-5 mt-auto border-b border-slate-200 dark:border-slate-800 pb-3 xl:pt-8 xl:pb-6">
		<button
			onClick={onNavigateLanding}
			className="group relative w-full flex items-center justify-center xl:justify-start h-11 xl:h-14 rounded-2xl cursor-pointer bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 overflow-hidden"
		>
			<div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/10 to-blue-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
			<div className="absolute left-4 xl:left-auto xl:w-[64px] flex items-center justify-center shrink-0 relative z-10">
				<svg className="w-3 h-3 transform group-hover:-translate-x-0.5 transition-transform shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
					<path d="M19 12H5M12 19l-7-7 7-7" />
				</svg>
			</div>
			<div
				className={`flex items-center justify-center xl:justify-start flex-1 xl:pr-4 min-w-0 transition-all duration-300 ease-in-out relative z-10 ${collapsed ? "opacity-0 max-w-0 pointer-events-none" : "opacity-100 max-w-[200px]"}`}
			>
				<span className="whitespace-nowrap overflow-hidden text-center xl:text-left truncate">Back to Landing</span>
			</div>
		</button>
	</div>
);

export function MainSidebar({
	apps,
	categories,
	currentView,
	sidebarOpen,
	sidebarCollapsed,
	setSidebarOpen,
	onNavigateView,
	onNavigateLanding,
	onRandomApp,
	onRequest,
}: MainSidebarProps) {
	const latestGithubVersion = useLatestVersion();

	return (
		<>
			{sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm xl:hidden" onClick={() => setSidebarOpen(false)} />}

			<aside
			className={`fixed xl:relative z-50 h-full bg-[#B7C7CD] dark:bg-[#0b0e14] border-l xl:border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out top-0 bottom-0 ${sidebarOpen ? "translate-x-0 w-72 right-0" : "translate-x-full xl:translate-x-0 right-0 xl:right-auto"} ${sidebarCollapsed ? "xl:w-24" : "xl:w-72"}`}
		>
			<div className="p-2.5 xl:p-4 h-full flex flex-col scrollbar-hide">
				<div className="flex items-center mb-6 ml-3 xl:mb-10 justify-between w-full">
					<div className="flex items-center">
						<Logo onClick={onNavigateLanding} />
						<span
							className={`font-black text-xl tracking-tighter cursor-pointer hover:text-blue-600 whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${sidebarCollapsed ? "max-w-0 opacity-0 scale-95 ml-0" : "max-w-[200px] opacity-100 scale-100 ml-3"}`}
						>
							DOCKER <span className="text-blue-600 text-xl">NINJA</span>
						</span>
					</div>

					<button
						onClick={() => setSidebarOpen(false)}
						className="xl:hidden pr-5 text-blue-600 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
					>
						<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={sidebarOpen ? "rotate-180" : ""}>
							<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
							<line x1="9" y1="3" x2="9" y2="21"></line>
						</svg>
					</button>
				</div>

				<nav className="flex-1 flex flex-col space-y-1 xl:space-y-2">
					<SidebarItem
						icon={
							<svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<rect x="3" y="3" width="7" height="7" />
								<rect x="14" y="3" width="7" height="7" />
								<rect x="14" y="14" width="7" height="7" />
								<rect x="3" y="14" width="7" height="7" />
							</svg>
						}
						label="Containers"
						count={apps.length}
						isActive={currentView === "dashboard"}
						onClick={() => onNavigateView("dashboard")}
						collapsed={sidebarCollapsed}
					/>

					<SidebarItem
						icon={
							<svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<line x1="8" y1="6" x2="21" y2="6" />
								<line x1="8" y1="12" x2="21" y2="12" />
								<line x1="8" y1="18" x2="21" y2="18" />
								<line x1="3" y1="6" x2="3.01" y2="6" />
								<line x1="3" y1="12" x2="3.01" y2="12" />
								<line x1="3" y1="18" x2="3.01" y2="18" />
							</svg>
						}
						label="Categories"
						count={categories.length}
						isActive={currentView === "categories"}
						onClick={() => onNavigateView("categories")}
						collapsed={sidebarCollapsed}
					/>

					<SidebarItem
						icon={
							<svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
								<circle cx="9" cy="7" r="4" />
								<path d="M22 21v-2a4 4 0 0 0-3-3.87" />
								<path d="M16 3.13a4 4 0 0 1 0 7.75" />
							</svg>
						}
						label="Community"
						isActive={currentView === "community"}
						onClick={() => onNavigateView("community")}
						collapsed={sidebarCollapsed}
						size="small"
					/>

					<SidebarItem
						icon={
							<svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
								<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
							</svg>
						}
						label="Docs"
						isActive={currentView === "docs"}
						onClick={() => onNavigateView("docs")}
						collapsed={sidebarCollapsed}
						size="small"
					/>

					<SidebarItem
						icon={
							<svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<circle cx="12" cy="12" r="10" />
								<line x1="12" y1="16" x2="12" y2="12" />
								<line x1="12" y1="8" x2="12.01" y2="8" />
							</svg>
						}
						label="About"
						isActive={currentView === "about"}
						onClick={() => onNavigateView("about")}
						collapsed={sidebarCollapsed}
						size="small"
					/>

					<SidebarItem
						icon={
							<div className="w-12 xl:w-[64px] flex items-center justify-center shrink-0 text-base select-none">❤️</div>
						}
						label="Sponsoring"
						isActive={currentView === "sponsoring"}
						onClick={() => onNavigateView("sponsoring")}
						collapsed={sidebarCollapsed}
						size="small"
					/>

					<div className="pt-3 mt-3 xl:pt-4 xl:mt-4 border-t border-slate-200 dark:border-slate-800">
						<div className="grid grid-cols-2 gap-1.5 xl:flex xl:flex-col xl:gap-2">
							<button
								title="Surprise Me"
								onClick={() => {
									onRandomApp();
									setSidebarOpen(false);
								}}
								className={`relative group flex items-center h-9 xl:h-11 rounded-xl font-bold uppercase text-xs tracking-wider hover:bg-slate-200 dark:hover:bg-slate-800 transition-all duration-300 cursor-pointer justify-start overflow-hidden text-slate-500 bg-slate-100/40 dark:bg-slate-900/20 xl:bg-transparent hover:text-emerald-600 dark:hover:text-emerald-400`}
							>
								<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-600/15 via-transparent to-transparent" />
								<div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent" />
								<div className="w-12 xl:w-[64px] flex items-center justify-center shrink-0 relative z-10">
									<div className="relative w-5 h-5 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
										<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]">
											<path d="m15 5 4 4" />
											<path d="M11 9 2 18l4 4 9-9" />
											<path className="animate-pulse" d="M15 1l.5 1.5L17 3l-1.5.5L15 5l-.5-1.5L13 3l1.5-.5L15 1z" />
											<path className="animate-pulse delay-75" d="M22 10l.5 1.5L24 12l-1.5.5L22 14l-.5-1.5L20 12l1.5-.5L22 10z" />
										</svg>
									</div>
								</div>
								<div className="flex items-center flex-1 pr-4 min-w-0 transition-all duration-300 ease-in-out relative z-10">
									<span className="text-[10px] xl:text-xs truncate whitespace-nowrap overflow-hidden text-left">Surprise</span>
								</div>
							</button>

							<button
								title="Request Container"
								onClick={(e) => {
									e.preventDefault();
									onRequest();
									setSidebarOpen(false);
								}}
								className={`relative group flex items-center h-9 xl:h-11 rounded-xl font-bold uppercase text-xs tracking-wider hover:bg-slate-200 dark:hover:bg-slate-800 transition-all duration-300 cursor-pointer justify-start overflow-hidden text-slate-500 bg-slate-100/40 dark:bg-slate-900/20 xl:bg-transparent hover:text-amber-600 dark:hover:text-amber-400`}
							>
								<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-600/15 via-transparent to-transparent" />
								<div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent" />
								<div className="w-12 xl:w-[64px] flex items-center justify-center shrink-0 relative z-10">
									<div className="relative w-5 h-5 flex items-center justify-center shrink-0 text-amber-500 dark:text-amber-400 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
										<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_5px_rgba(245,158,11,0.3)]">
											<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5" />
											<path d="M9 18h6" />
											<path d="M10 22h4" />
										</svg>
										<span className="absolute top-0 right-0 flex h-2 w-2 opacity-0 group-hover:opacity-100 transition-opacity">
											<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
											<span className="relative inline-flex rounded-full h-1 w-1 bg-amber-300" />
										</span>
									</div>
								</div>
								<div className="flex items-center flex-1 pr-4 min-w-0 transition-all duration-300 ease-in-out relative z-10">
									<span className="text-[10px] xl:text-xs truncate whitespace-nowrap overflow-hidden text-left">Request</span>
								</div>
							</button>

							<a
								title="Report Issue"
								href={`https://github.com/vukilis/docker-ninja/issues?q=is%3Aissue+is%3Aopen`}
								target="_blank"
								rel="noreferrer"
								className={`relative group flex items-center h-9 xl:h-11 rounded-xl font-bold uppercase text-xs tracking-wider hover:bg-slate-200 dark:hover:bg-slate-800 transition-all duration-300 justify-start overflow-hidden text-slate-500 bg-slate-100/40 dark:bg-slate-900/20 xl:bg-transparent hover:text-purple-600 dark:hover:text-purple-400`}
							>
								<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-600/15 via-transparent to-transparent" />
								<div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-purple-400/10 to-transparent" />
								<div className="w-12 xl:w-[64px] flex items-center justify-center shrink-0 relative z-10">
									<div className="relative shrink-0 transition-transform duration-500 group-hover:rotate-12">
										<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 dark:text-purple-400 group-hover:text-fuchsia-900 dark:group-hover:text-fuchsia-400 transition-colors duration-300 transition-transform group-hover:scale-110 drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]">
											<rect width="8" height="14" x="8" y="6" rx="4" />
											<path d="m19 7-3 2" />
											<path d="m5 7 3 2" />
											<path d="m19 19-3-2" />
											<path d="m5 19 3-2" />
											<path d="M20 13h-4" />
											<path d="M4 13h4" />
											<path d="m10 4 1 2" />
											<path d="m14 4-1 2" />
										</svg>
										<span className="absolute -top-1 -right-1 flex h-2 w-2 opacity-0 group-hover:opacity-100 transition-opacity">
											<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75"></span>
											<span className="relative inline-flex rounded-full h-1 w-1 bg-fuchsia-300"></span>
										</span>
									</div>
								</div>
								<div className="flex items-center flex-1 pr-4 min-w-0 transition-all duration-300 ease-in-out relative z-10">
									<span className="text-[10px] xl:text-xs truncate whitespace-nowrap overflow-hidden text-left">Report</span>
								</div>
							</a>

							<a
								title="GitHub"
								href="https://github.com/vukilis/docker-ninja"
								target="_blank"
								rel="noreferrer"
								className={`relative group flex items-center h-9 xl:h-11 rounded-xl font-bold uppercase text-xs tracking-wider hover:bg-slate-200 dark:hover:bg-slate-800 transition-all duration-300 justify-start overflow-hidden text-slate-500 bg-slate-100/40 dark:bg-slate-900/20 xl:bg-transparent hover:text-slate-900 dark:hover:text-white`}
							>
								<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/15 via-transparent to-transparent" />
								<div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-indigo-400/10 to-transparent" />
								<div className="w-12 xl:w-[64px] flex items-center justify-center shrink-0 relative z-10">
									<div className="relative w-5 h-5 flex items-center justify-center shrink-0 text-slate-700 dark:text-slate-300 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
										<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-[16px] h-[16px] drop-shadow-[0_0_5px_rgba(99,102,241,0.3)]">
											<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
										</svg>
									</div>
								</div>
								<div className={`flex items-center pr-4 min-w-0 transition-all duration-300 ease-in-out relative z-10 gap-2 ${sidebarCollapsed ? "opacity-0 -translate-x-2 w-0 overflow-hidden" : "opacity-100 translate-x-0 flex-1"}`}>
									<span className="text-[10px] xl:text-xs truncate whitespace-nowrap overflow-hidden text-left font-bold">GitHub</span>
									{latestGithubVersion ? (
										<span className="hidden xl:inline-flex items-center px-1.5 py-0.5 rounded text-[9px] xl:text-[10px] font-semibold leading-none bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 dark:border-indigo-400/20 group-hover:bg-indigo-500/15 transition-colors whitespace-nowrap">
											v{formatVersion(latestGithubVersion)}
										</span>
									) : null}
								</div>
							</a>
						</div>
					</div>
				</nav>

				<SidebarFooter collapsed={sidebarCollapsed} onNavigateLanding={onNavigateLanding} />

				<div className="pt-4 xl:pt-6">
					<ThemeSwitcher collapsed={sidebarCollapsed} />
				</div>
			</div>
		</aside>
		</>
	);
}
