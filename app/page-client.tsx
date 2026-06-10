"use client";
import React, { useMemo, useState, useEffect, useRef } from "react";
import { useAppsGlobal } from "./context/AppsContext";
import "./style/globals.css";
import { AppModal, RequestSearchOverlay, DeployedCounter } from "./components/AppModal";
import { AppCard } from "./components/AppCard";
import { ThemeSwitcher } from "./components/ThemeSwitcher";
import { RotatingMessage } from "./components/RotatingMessage";
import SearchInput from "./components/SearchInput";
import AboutPage from "./about/AboutPage";
import { Sponsoring } from "./sponsoring/Sponsoring";
import CommunityPage from "./community/CommunityPage";
import DocsPage from "./docs/DocsPage";
import { Navigation } from "./hooks/navigation";
import { Pagination } from "./components/Paginations";
import { ClientMetadataController } from "./components/PageMetadata";
import { Counter } from "./utils/Counter";
import dynamic from 'next/dynamic';
import { useShortcutKeys } from "./components/useShortcutKeys";

const NetworkBackground = dynamic(
	() => import('./components/NetworkMap').then((mod) => mod.NetworkBackground),
	{ ssr: false }
);
// --- TYPES ---
export type ViewMode = "dashboard" | "categories" | "about" | "sponsoring" | "community" | "docs";

export interface AppData {
	id: string | number;
	slug?: string;
	name: string;
	category: string;
	image?: string;
	description?: string;
	[key: string]: unknown;
}

// --- HELPERS ---
const convertToSlug = (text: string): string => {
	return text
		.toLowerCase()
		.replace(/&/g, "and")
		.replace(/[^a-z0-9 -\s]/g, "")
		.replace(/\s+/g, "-")
		.trim();
};

const getInitialViewState = (initialView: ViewMode): ViewMode => {
	if (typeof window === "undefined") return initialView;
	const path = window.location.pathname;
	const validViews: ViewMode[] = ["dashboard", "categories", "about", "sponsoring", "community", "docs"];
	const currentPathView = validViews.find((v) => path.toLowerCase().includes(`/${v.toLowerCase()}`));
	return currentPathView || initialView;
};

// --- HOOKS ---
function useGlobalScrollbar() {
	useEffect(() => {
		let scrollTimeout: ReturnType<typeof setTimeout>;
		let activeElement: HTMLElement | null = null;

		const handleGlobalScroll = (e: Event) => {
			const target = e.target;
			if (!(target instanceof HTMLElement)) return;
			if (activeElement && activeElement !== target) activeElement.classList.remove("show-scrollbar");
			activeElement = target;
			target.classList.add("show-scrollbar");
			clearTimeout(scrollTimeout);
			scrollTimeout = setTimeout(() => {
				if (activeElement) {
					activeElement.classList.remove("show-scrollbar");
					activeElement = null;
				}
			}, 1000);
		};

		window.addEventListener("scroll", handleGlobalScroll, true);
		return () => {
			window.removeEventListener("scroll", handleGlobalScroll, true);
			clearTimeout(scrollTimeout);
		};
	}, []);
}

// --- EXTRACTED UI COMPONENTS ---
const Logo = ({ onClick, className = "" }: { onClick?: () => void; className?: string }) => (
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

const SidebarItem = ({
	icon,
	label,
	count,
	isActive,
	onClick,
	collapsed,
	size = "large",
}: {
	icon: React.ReactNode;
	label: string;
	count?: number;
	isActive: boolean;
	onClick: () => void;
	collapsed: boolean;
	size?: "large" | "small";
}) => {
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

const SidebarFooter = ({ collapsed, navigateTo }: { collapsed: boolean; navigateTo: (path: "landing") => void }) => (
	<div className="pt-5 mt-auto border-b border-slate-200 dark:border-slate-800 pb-3 xl:pt-8 xl:pb-6">
		<button
			onClick={() => navigateTo("landing")}
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

const REPO = "vukilis/docker-ninja";

function useLatestVersion() {
	const [version, setVersion] = useState<string | null>(null);
	const mounted = useRef(true);

	useEffect(() => {
		mounted.current = true;
		fetch(`https://api.github.com/repos/${REPO}/releases/latest`, {
			headers: { Accept: "application/vnd.github+json" },
		})
			.then((r) => r.ok ? r.json() : Promise.reject())
			.then((d) => { if (mounted.current && d.tag_name) setVersion(d.tag_name); })
			.catch(() => {});
		return () => { mounted.current = false; };
	}, []);

	return version;
}

function formatVersion(tag: string) {
	return tag.startsWith("v") || tag.startsWith("V") ? tag.slice(1) : tag;
}

// --- MAIN DASHBOARD ---
export default function Home({ initialView = "dashboard", initialAppSlug }: { initialView?: ViewMode; initialAppSlug?: string }) {
	// --- GLOBAL CONTEXT & NAVIGATION ---
	const { navigateTo } = Navigation();
	const [paginationState, setPaginationState] = useState<Record<string, number>>({ "all-apps": 1 });
	const [appsPerPage, setAppsPerPage] = useState(64);
	const [sortBy, setSortBy] = useState<"A-Z" | "Z-A" | "Favorites">("A-Z");

	const { filteredApps, categories, search, setSearch, apps, getCountByCategory, globalLikes } = useAppsGlobal();

	// STATE INITIALIZATION
	const [isMounted, setIsMounted] = useState(false);
	const initialSelectedApp = useMemo(() => {
		if (!initialAppSlug || apps.length === 0) return null;
		return apps.find((a) => a.slug === initialAppSlug) || null;
	}, [apps, initialAppSlug]);
	const [isStarted, setIsStarted] = useState(() => {
		if (typeof window === "undefined") return false;
		const hasInitialApp = !!initialSelectedApp;
		return localStorage.getItem("ninja_isStarted") === "true" || hasInitialApp;
	});

	const [currentView, setCurrentView] = useState<ViewMode>(() => getInitialViewState(initialView));

	const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
		if (typeof window === "undefined") return false;
		return localStorage.getItem("ninja_sidebarCollapsed") === "true";
	});

	const [activeSubCategory, setActiveSubCategory] = useState<string | null>(() => {
		if (typeof window === "undefined") return null;
		return localStorage.getItem("ninja_activeSubCategory");
	});

	const [recentlyViewed, setRecentlyViewed] = useState<AppData[]>(() => {
		if (typeof window === "undefined") return [];
		const saved = localStorage.getItem("docker_ninja_recently_viewed");
		try {
			return saved ? JSON.parse(saved) : [];
		} catch {
			return [];
		}
	});

	// UI States
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [selectedApp, setSelectedApp] = useState<AppData | null>(initialSelectedApp);
	const [isRequesting, setIsRequesting] = useState(false);
	const [showScrollTop, setShowScrollTop] = useState(false);
	const handleWarpClick = () => !isStarted && navigateTo("dashboard");
	// BUTTON REFS FOR SHORTCUTS
	const warpButtonRef = useRef<HTMLButtonElement>(null);
	const searchRef = useRef<HTMLInputElement>(null);
	useShortcutKeys({ searchRef, warpButtonRef });

	const latestGithubVersion = useLatestVersion();

	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const hasHydrated = useRef(false);

	// URL SYNC: Listen to navigation and sync URL params to state
	useEffect(() => {
		const handleLocationChange = () => {
			const rawPath = window.location.pathname;
			const path = rawPath.replace(/^\//, "");
			const isStartedLoc = localStorage.getItem("ninja_isStarted") === "true";

			setIsStarted(isStartedLoc);

			if (!isStartedLoc || path === "" || path === "/") {
				setCurrentView("dashboard");
			} else if (path.startsWith("app/")) {
				const slug = path.split("/")[1];
				const redirectUrl = `/containers?preview=${encodeURIComponent(slug)}`;
				window.history.replaceState(null, "", redirectUrl);
				setCurrentView("dashboard");
				setIsStarted(true);
			} else {
			const validViews: ViewMode[] = ["categories", "about", "sponsoring", "community", "docs"];
			const matchedView = validViews.find((v) => path.toLowerCase() === v.toLowerCase());
			setCurrentView(matchedView || "dashboard");
			}
		};

		handleLocationChange();

		window.addEventListener("popstate", handleLocationChange);
		return () => window.removeEventListener("popstate", handleLocationChange);
	}, [setIsStarted, setCurrentView]);

	// MOUNT & INITIAL HYDRATION (Sync URL params to state once)
	useEffect(() => {
		if (hasHydrated.current || !apps || apps.length === 0) return;

		const rawPath = window.location.pathname;
		const normalizedPath = rawPath.replace(/^\//, "");
		const searchParams = new URLSearchParams(window.location.search);
		const appId = searchParams.get("preview") || searchParams.get("app") || searchParams.get("id");
		let shouldStart = false;

		// Handle Routes (About, Sponsoring, Community)
		const validViews: ViewMode[] = ["categories", "about", "sponsoring", "community", "docs"];
		const currentPathView = validViews.find((v) => normalizedPath.toLowerCase() === v.toLowerCase());
		if (currentPathView) {
			setCurrentView(currentPathView);
			shouldStart = true;
		}

		// Handle /app/{slug} -> /containers?preview={slug} redirect
		const slugFromPath = rawPath.startsWith("/app/") ? rawPath.split("/app/")[1] : null;
		if (slugFromPath) {
			const redirectUrl = `/containers?preview=${encodeURIComponent(slugFromPath)}`;
			window.history.replaceState(null, "", redirectUrl);
			setCurrentView("dashboard");
			setIsStarted(true);
			shouldStart = true;
		}

		// Handle Modal from query params
		const lookupId = appId;

		if (lookupId) {
			const found = apps.find((a) => String(a.id) === String(lookupId) || a.slug === lookupId);
			if (found) {
				setSelectedApp(found);
				setIsStarted(true);
				setCurrentView("dashboard");
				shouldStart = true;
			}
		}

		if (shouldStart) setIsStarted(true);

		setIsMounted(true);
		hasHydrated.current = true;
	}, [apps]);

	useEffect(() => {
		if (!isMounted) return;

		localStorage.setItem("ninja_isStarted", isStarted.toString());
		localStorage.setItem("ninja_sidebarCollapsed", sidebarCollapsed.toString());
		if (activeSubCategory) localStorage.setItem("ninja_activeSubCategory", activeSubCategory);

		let newPath = !isStarted ? "/" : "/containers";
		const params = new URLSearchParams(window.location.search);

		switch (currentView?.toLowerCase()) {
			case "about":      newPath = "/about"; break;
			case "sponsoring": newPath = "/sponsoring"; break;
			case "community":  newPath = "/community"; break;
			case "categories": newPath = "/categories"; break;
			case "docs":       newPath = "/docs"; break;
		}

		if (selectedApp) {
			const appValue = selectedApp.slug || selectedApp.id.toString();
			params.set("preview", convertToSlug(appValue));
		} else {
			params.delete("preview");
		}

		if (currentView === "categories" && activeSubCategory) {
			params.set("category", convertToSlug(activeSubCategory));
		} else {
			params.delete("category");
		}

		const qs = params.toString();
		const newUrl = qs ? `${newPath}?${qs}` : newPath;

		const currentUrl = window.location.pathname + window.location.search;
		if (currentUrl === newUrl) return;
		window.history.replaceState({ path: newUrl }, "", newUrl);
	}, [isStarted, sidebarCollapsed, currentView, selectedApp, activeSubCategory, isMounted]);

	// UI LOGIC & HANDLERS
	const sortedCategories = useMemo(() => {
		return categories.filter((c) => c !== "Dashboard" && c !== "categories").sort((a, b) => a.localeCompare(b));
	}, [categories]);

	const processedApps = useMemo(() => {
		const items = [...filteredApps];

		switch (sortBy) {
			case "A-Z":
				return items.sort((a, b) => a.name.localeCompare(b.name));
			case "Z-A":
				return items.sort((a, b) => b.name.localeCompare(a.name));
			case "Favorites":
				return items.sort((a, b) => {
					const countA = globalLikes[a.slug || ""] || 0;
					const countB = globalLikes[b.slug || ""] || 0;
					if (countB !== countA) return countB - countA;
					return a.name.localeCompare(b.name);
				});
			default:
				return items;
		}
	}, [filteredApps, sortBy]);

	// Ensure a subcategory is always active when "categories" is selected
	useEffect(() => {
		if (currentView === "categories" && !activeSubCategory && sortedCategories.length > 0) {
			setActiveSubCategory(sortedCategories[0]);
		}
	}, [currentView, sortedCategories, activeSubCategory]);

	// --- DYNAMIC VIEW PORT NAVIGATION ---
	const activePageForScroll = currentView !== "categories" ? paginationState["all-apps"] || 1 : paginationState[activeSubCategory || ""] || 1;

	// SCROLL MECHANISM
	useEffect(() => {
		const container = scrollContainerRef.current;
		if (!container) return;
		container.scrollTop = 0;
		const handleScroll = () => setShowScrollTop(container.scrollTop > 400);
		container.addEventListener("scroll", handleScroll);
		return () => container.removeEventListener("scroll", handleScroll);
	}, [isStarted, currentView, isMounted, activeSubCategory, activePageForScroll]);

	// Automatically reset pagination when the user types a search query
	useEffect(() => {
		if (search.trim() !== "") {
			const currentKey = currentView !== "categories" ? "all-apps" : activeSubCategory;

			setPaginationState((prev) => {
				if (prev[currentKey || "all-apps"] === 1) return prev;
				return {
					...prev,
					[currentKey || "all-apps"]: 1,
				};
			});
		}
	}, [search, currentView, activeSubCategory]);

	// RECENTLY VIEWED PERSISTENCE
	useEffect(() => {
		if (selectedApp) {
			document.body.style.overflow = "hidden";
			setRecentlyViewed((prev) => {
				const filtered = prev.filter((a) => a.id !== selectedApp.id);
				const updated = [selectedApp, ...filtered].slice(0, 8);
				localStorage.setItem("docker_ninja_recently_viewed", JSON.stringify(updated));
				return updated;
			});
		} else {
			document.body.style.overflow = "unset";
		}
	}, [selectedApp]);

	// DYNAMIC PAGINATION PER BREAKPOINT
	useEffect(() => {
		if (typeof window === "undefined") return;
		const handleResize = () => {
			const width = window.innerWidth;
			if (width >= 1536) setAppsPerPage(64);
			else if (width >= 1280) setAppsPerPage(60);
			else if (width >= 1024) setAppsPerPage(60);
			else if (width >= 768) setAppsPerPage(60);
			else if (width >= 640) setAppsPerPage(64);
			else setAppsPerPage(63);
		};
		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	// GLOBAL SCROLL LOCK (when modal is open or sidebar is open on mobile)
	useEffect(() => {
		document.body.style.overflow = sidebarOpen || isRequesting ? "hidden" : "unset";
		return () => {
			document.body.style.overflow = "unset";
		};
	}, [sidebarOpen, isRequesting]);

	useGlobalScrollbar();

	// SCROLL TO TOP FUNCTION
	const scrollToTop = () => {
		scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
	};

	const handleAppSelect = (app: AppData) => {
		setSelectedApp(app);
		if (["about", "community", "sponsoring", "docs"].includes(currentView)) {
			setCurrentView("dashboard");
		}
		if (app.category) {
			setActiveSubCategory(app.category);
		}
	};

	const handleRandomApp = () => {
		if (apps.length === 0) return;
		const randomApp = apps[Math.floor(Math.random() * apps.length)];
		handleAppSelect(randomApp);
	};

	// --- RENDER HELPERS ---
	const renderRecentlyViewed = () => {
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
					<h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Recent Activity</h3>
				</div>

				<div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-8 lg:grid-cols-8 xl:grid-cols-8 gap-2 md:gap-4 relative z-0">
					{recentlyViewed.map((app, index) => (
						<div key={`recent-${app.id}`} className="relative group">
							{index < recentlyViewed.length - 1 && (
								<div className="hidden md:block absolute top-1/2 -right-4 w-4 h-[1px] bg-slate-200 dark:bg-slate-800 group-hover:bg-blue-500/50 transition-colors duration-500" />
							)}

							<div
								className="relative z-10 transition-transform duration-300 cursor-pointer transform origin-top max-xl:[&_h3]:hidden max-xl:[&_p]:hidden max-xl:[&_span:not(.icon-span)]:hidden max-md:flex max-md:justify-center"
								onClick={() => setSelectedApp(app)}
							>
								<AppCard app={app} onClick={() => setSelectedApp(app)} />
							</div>
						</div>
					))}
				</div>
				<div className="mt-6 md:mt-10 relative">
					<div className="h-[1px] w-full bg-[#B7C7CD] dark:bg-slate-800/50" />
				</div>
			</div>
		);
	};

	const renderDashboard = () => {
		const categoryKey = currentView === "categories" ? (activeSubCategory ?? "categories") : "all-apps";
		const activePage = paginationState[categoryKey] || 1;
		const indexOfLastApp = activePage * appsPerPage;
		const indexOfFirstApp = indexOfLastApp - appsPerPage;

		const handlePageChange = (pageNumber: number) => {
			setPaginationState((prev) => ({
				...prev,
				[categoryKey]: pageNumber,
			}));
		};

		// --- VIEW 1: ALL CONTAINERS ---
		if (currentView === "dashboard") {
			const paginatedApps = processedApps.slice(indexOfFirstApp, indexOfLastApp);
			return (
				<div className="space-y-6">
					<div className="grid grid-cols-3 2xl:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-6 2xl:grid-cols-8 gap-3 sm:gap-4">
						{paginatedApps.map((app) => (
							<AppCard key={app.id} app={app} onClick={() => handleAppSelect(app)} />
						))}
					</div>
					<Pagination
						totalItems={processedApps.length}
						itemsPerPage={appsPerPage}
						currentPage={activePage}
						onPageChange={handlePageChange}
					/>
				</div>
			);
		}

		// --- VIEW 2: CATEGORIES DASHBOARD ---
		if (currentView === "categories") {
			const categoryApps = processedApps.filter((a) => a.category === activeSubCategory);
			const paginatedCategoryApps = categoryApps.slice(indexOfFirstApp, indexOfLastApp);
			return (
				<div className="space-y-8">
					<div className="relative">
						<div className="flex flex-col flex-wrap h-[145px] overflow-x-auto gap-2 pb-2 scrollbar-hide md:flex-row md:h-auto md:flex-wrap md:overflow-visible">
							{sortedCategories.map((cat) => {
								const isActive = activeSubCategory === cat;
								return (
									<button
										key={cat}
										onClick={() => setActiveSubCategory(cat)}
										className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-200 cursor-pointer select-none whitespace-nowrap text-[11px] font-bold uppercase tracking-wider ${isActive ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30" : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-blue-500 hover:bg-white dark:hover:bg-slate-800"}`}
									>
										{cat}
										<span
											className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${isActive ? "bg-white/20" : "bg-slate-200 dark:bg-slate-800"}`}
										>
											{getCountByCategory(cat)}
										</span>
									</button>
								);
							})}
						</div>
						<div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white dark:from-[#0d1117] to-transparent pointer-events-none md:hidden" />
					</div>

					<div className="grid grid-cols-3 2xl:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-6 2xl:grid-cols-8 gap-3 sm:gap-4">
						{paginatedCategoryApps.map((app) => (
							<AppCard key={app.id} app={app} onClick={() => handleAppSelect(app)} />
						))}
					</div>

					<Pagination
						totalItems={categoryApps.length}
						itemsPerPage={appsPerPage}
						currentPage={activePage}
						onPageChange={handlePageChange}
					/>
				</div>
			);
		}

		return null;
	};

	// --- FINAL RENDER GUARD & LANDING ---
	if (!isMounted) return <div className="min-h-screen bg-white dark:bg-[#0d1117]" />;

	return (
		<>
			<ClientMetadataController 	isStarted={isStarted} currentView={currentView} selectedApp={selectedApp} />
			{!isStarted ? (
				/* --- LANDING VIEW --- */
				<div className="min-h-screen bg-white dark:bg-[#0d1117] flex flex-col items-center justify-center p-6 transition-colors duration-700">
					<NetworkBackground apps={apps as AppData[]} />
					<div className="max-w-4xl w-full text-center space-y-8 z-10">
						<div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-bold tracking-widest uppercase">
							<span className="relative flex h-2 w-2">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
								<span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
							</span>
							V1.0 Live Now
						</div>
						<h1 className="text-7xl md:text-9xl font-black text-white dark:text-white tracking-tighter">
							DOCKER
							<br />
							<span className="text-blue-600">NINJA</span>
						</h1>
						<div className="relative group max-w-2xl mx-auto">
							<RotatingMessage />
							<div className="mt-8 flex justify-center gap-1.5 opacity-50">
								<div className="w-1.5 h-1.5 rounded-full bg-blue-600/40" />
								<div className="w-12 h-1.5 rounded-full bg-gradient-to-r from-blue-600/40 to-transparent" />
							</div>
						</div>
						<div className="pt-2 md:pt-10 flex flex-col items-center gap-4">
							<div className="relative">
								<button
									ref={warpButtonRef}
									onClick={handleWarpClick}
									className="group relative px-10 py-5 bg-blue-600 text-white font-black text-xl rounded-2xl shadow-2xl shadow-blue-500/40 hover:bg-blue-700 hover:-translate-y-1 active:scale-95 transition-all duration-200 cursor-pointer uppercase tracking-[0.2em] overflow-hidden outline-none focus-visible:ring-4 focus-visible:ring-blue-400"
								>
									<div className="relative z-10 flex items-center gap-4">
										<span>Initiate Warp</span>
										<svg 
											className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-2" 
											viewBox="0 0 24 24" 
											fill="none" 
											stroke="currentColor" 
											strokeWidth="3" 
											strokeLinecap="round" 
											strokeLinejoin="round"
											aria-hidden="true"
										>
											<line x1="5" y1="12" x2="19" y2="12" />
											<polyline points="12 5 19 12 12 19" />
										</svg>
									</div>
									<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
								</button>
							</div>
							<p className="flex flex-wrap items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400 animate-pulse">
								<span className="hidden md:inline">Press</span>
								<kbd className="hidden md:inline-flex items-center justify-center px-2 py-0.5 min-w-14 h-5 rounded bg-slate-900 border border-slate-700 text-white text-[12px] font-bold tracking-normal normal-case shadow-lg">
									SPACE
								</kbd>
								<span className="hidden md:inline">to</span>
								<span>explore the Infinite Stack</span>
							</p>
						</div>
					</div>
					<div className="mt-10 md:mt-20 flex flex-wrap justify-center gap-5 lg:gap-20 uppercase text-[10px] font-black tracking-[0.3em]">
						<div className="group relative text-center">
							<div className="text-white dark:text-white text-3xl mb-1 tabular-nums">
								<Counter value={apps.length} />
							</div>
							<div className="text-slate-400 dark:text-slate-600 transition-colors group-hover:text-blue-500">Containers</div>
						</div>
						<div className="group relative text-center">
							<DeployedCounter />
						</div>
						<div className="group relative text-center">
							<div className="text-white dark:text-white text-3xl mb-1 tabular-nums">
								<Counter value={categories.length} />
							</div>
							<div className="text-slate-400 dark:text-slate-600 transition-colors group-hover:text-blue-500">Categories</div>
						</div>
					</div>
				</div>
			) : (
				/* --- RESPONSIVE MAIN APP LAYOUT --- */
				<div className="flex h-screen dark:bg-[#0d1117] text-slate-900 dark:text-slate-100 transition-colors overflow-hidden">
					{sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm xl:hidden" onClick={() => setSidebarOpen(false)} />}

					<aside
						className={`fixed xl:relative z-50 h-full bg-[#B7C7CD] dark:bg-[#0b0e14] border-l xl:border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out top-0 bottom-0 ${sidebarOpen ? "translate-x-0 w-72 right-0" : "translate-x-full xl:translate-x-0 right-0 xl:right-auto"} ${sidebarCollapsed ? "xl:w-24" : "xl:w-72"}`}
					>
						<div className="p-2.5 xl:p-4 h-full flex flex-col scrollbar-hide">
							<div className="flex items-center mb-6 ml-3 xl:mb-10 justify-between w-full">
								<div className="flex items-center">
									<Logo onClick={() => navigateTo("landing")} />
									<span
										onClick={() => navigateTo("landing")}
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

							{/* NAVIGATION LINKS */}
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
									onClick={() => {
										setCurrentView("dashboard");
										setSidebarOpen(false);
									}}
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
									onClick={() => {
										setCurrentView("categories");
										setSidebarOpen(false);
									}}
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
									onClick={() => {
										setCurrentView("community");
										setSidebarOpen(false);
									}}
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
									onClick={() => {
										setCurrentView("docs");
										setSidebarOpen(false);
									}}
									collapsed={sidebarCollapsed}
									size="small"
								/>

								<SidebarItem
									icon={
										<svg 
											className="w-4 h-4 shrink-0" 
											viewBox="0 0 24 24" 
											fill="none" 
											stroke="currentColor" 
											strokeWidth="2" 
											strokeLinecap="round" 
											strokeLinejoin="round"
										>
											<circle cx="12" cy="12" r="10" />
											<line x1="12" y1="16" x2="12" y2="12" />
											<line x1="12" y1="8" x2="12.01" y2="8" />
										</svg>
									}
									label="About"
									isActive={currentView === "about"}
									onClick={() => {
										setCurrentView("about");
										setSidebarOpen(false);
									}}
									collapsed={sidebarCollapsed}
									size="small"
								/>

								<SidebarItem
									icon={
										<div className="w-12 xl:w-[64px] flex items-center justify-center shrink-0 text-base select-none">❤️</div>
									}
									label="Sponsoring"
									isActive={currentView === "sponsoring"}
									onClick={() => {
										setCurrentView("sponsoring");
										setSidebarOpen(false);
									}}
									collapsed={sidebarCollapsed}
									size="small"
								/>

							{/* UTILITIES LINKS */}
							<div className="pt-3 mt-3 xl:pt-4 xl:mt-4 border-t border-slate-200 dark:border-slate-800">
								<div className="grid grid-cols-2 gap-1.5 xl:flex xl:flex-col xl:gap-2">
									<button
										title="Surprise Me"
										onClick={() => {
											handleRandomApp();
											setSidebarOpen(false);
										}}
										className={`relative group flex items-center h-9 xl:h-11 rounded-xl font-bold uppercase text-xs tracking-wider hover:bg-slate-200 dark:hover:bg-slate-800 transition-all duration-300 cursor-pointer justify-start overflow-hidden text-slate-500 bg-slate-100/40 dark:bg-slate-900/20 xl:bg-transparent hover:text-emerald-600 dark:hover:text-emerald-400`}
									>
										<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-600/15 via-transparent to-transparent" />
										<div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent" />
										<div className="w-12 xl:w-[64px] flex items-center justify-center shrink-0 relative z-10">
											<div className="relative w-5 h-5 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
												<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
													<path d="m15 5 4 4" />
													<path d="M11 9 2 18l4 4 9-9" />
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
											setIsRequesting(true);
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
											<div className="relative w-5 h-5 flex items-center justify-center shrink-0 text-purple-600 dark:text-purple-400 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
												<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_5px_rgba(168,85,247,0.3)]">
													<rect width="8" height="14" x="8" y="6" rx="4" />
													<path d="m19 7-3 2" />
													<path d="m5 7 3 2" />
													<path d="m19 19-3-2" />
													<path d="m5 19 3-2" />
												</svg>
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

							<SidebarFooter collapsed={sidebarCollapsed} navigateTo={navigateTo} />
						</nav>

						{/* THEME SWITCHER */}
						<div className="pt-4 xl:pt-6">
							<ThemeSwitcher collapsed={sidebarCollapsed} />
						</div>
					</div>
				</aside>

				<main className="flex-1 flex flex-col overflow-hidden relative">
					<header className="h-16 flex items-center justify-between px-3 md:px-6 bg-[#b7c7cd] border-b border-slate-200 dark:border-slate-800 shrink-0 dark:bg-[#0d1117]/50 backdrop-blur-md z-10">
						<div className="flex items-center md:ml-3 xl:mr-5 gap-2 md:gap-4 order-last xl:order-first">
							<button
								onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
								className="hidden xl:flex p-2 text-slate-500 hover:text-blue-600 transition-colors bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer"
							>
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={sidebarCollapsed ? "rotate-180" : ""}>
									<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
									<line x1="9" y1="3" x2="9" y2="21"></line>
								</svg>
							</button>
								<button
									onClick={() => {
										setSidebarOpen(true);
										if (sidebarCollapsed) {
											localStorage.removeItem("ninja_sidebarCollapsed");
											setSidebarCollapsed(false);
										}
									}}
									className="xl:hidden p-2 text-blue-600 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
								>
									<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={sidebarCollapsed ? "rotate-180" : ""}>
										<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
										<line x1="9" y1="3" x2="9" y2="21"></line>
									</svg>
								</button>
							</div>

							<div className="flex items-center gap-3 md:gap-3 flex-1 justify-start xl:justify-end order-first xl:order-last relative">
								<Logo
									onClick={() => navigateTo("landing")}
									className="flex xl:hidden items-center cursor-pointer transition-all duration-300"
								/>

								<div className="flex max-w-[250px] md:max-w-none xl:order-first">
									<SearchInput apps={apps} search={search} setSearch={setSearch} onAppSelect={(app) => handleAppSelect(app as AppData)} inputRef={searchRef as React.RefObject<HTMLInputElement>} />
								</div>
							</div>
						</header>

						<section ref={scrollContainerRef} className="flex-1 overflow-y-auto p-0 scroll-smooth" style={{ scrollbarGutter: "stable" }}>
							{currentView === "about" ? (
								<AboutPage />
							) : currentView === "docs" ? (
								<DocsPage />
							) : currentView === "sponsoring" ? (
								<Sponsoring />
							) : currentView === "community" ? (
								<CommunityPage />
							) : (
								<div className="p-4 sm:p-6 lg:p-10">
									<div className="max-w-[1600px] mx-auto">
										{currentView === "dashboard" && renderRecentlyViewed()}
										<div className="mb-6 mt-4 sm:mb-10 sm:mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
											<div className="flex flex-row items-center justify-between w-full gap-4 mb-6">
												<div className="flex-1 min-w-0">
													<h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight mb-1.5 truncate">
														{currentView === "categories" ? "Explore Categories" : "Explore Containers"}
													</h2>
													<div className="flex flex-wrap items-center gap-3">
														<div className="h-1 w-8 bg-blue-600 rounded-full shrink-0" />
														<span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[9px] sm:text-xs font-black uppercase tracking-wider rounded-full whitespace-normal sm:whitespace-nowrap leading-tight">
															{currentView === "categories" ? (
																<span className="flex flex-wrap gap-1.5 justify-center">
																	<span>{categories.length} Categories</span>
																	<span className="hidden sm:inline">·</span>
																	<span>{apps.length} Containers</span>
																</span>
															) : (
																`${apps.length} Containers`
															)}
														</span>
													</div>
												</div>
												{(currentView === "dashboard" || currentView === "categories") && (
													<div className="flex items-center gap-2 shrink-0 self-center">
														<span className="hidden md:inline text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Sort By:</span>
														<div className="inline-flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-sm">
															{((["A-Z", "Z-A", "Favorites"] as const)).map((option) => {
																const isActive = sortBy === option;
																return (
																	<button
																		key={option}
																		onClick={() => {
																			setSortBy(option);
																			setPaginationState((prev) => ({ ...prev, "all-apps": 1 }));
																		}}
																		className={`px-2.5 py-1.5 sm:px-3 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-150 cursor-pointer whitespace-nowrap ${isActive ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"}`}
																	>
																		{option === "Favorites" ? "❤️ Favs" : option}
																	</button>
																);
															})}
														</div>
													</div>
												)}
											</div>
										</div>
										{renderDashboard()}
									</div>
								</div>
							)}
						</section>

						<button
							onClick={scrollToTop}
							className={`fixed bottom-8 right-8 z-[60] flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-xl shadow-2xl shadow-blue-500/40 hover:bg-blue-700 hover:-translate-y-1 transition-all duration-300 cursor-pointer ${showScrollTop ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"}`}
						>
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
								<path d="M18 15l-6-6-6 6" />
							</svg>
						</button>
					</main>

					{selectedApp && (
						<AppModal
							key={selectedApp.slug || "default"}
							app={{
								...selectedApp,
								slug: selectedApp.slug || "",
							}}
							allApps={apps}
							onAppChange={(app) => setSelectedApp(app as AppData)}
							onClose={() => setSelectedApp(null)}
							onRandom={handleRandomApp}
						/>
					)}
					{isRequesting && (
						<RequestSearchOverlay
							allApps={apps}
							onClose={() => setIsRequesting(false)}
							onAppSelect={(app) => {
								setSelectedApp(app as AppData);
								setIsRequesting(false);
							}}
						/>
					)}
				</div>
			)}
		</>
	);
}
