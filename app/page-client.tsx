"use client";
import React, { useMemo, useState, useEffect, useRef } from "react";
import { useAppsGlobal } from "./context/AppsContext";
import "./style/globals.css";
import { AppModal, RequestSearchOverlay, DeployedCounter } from "./components/AppModal";
import { AppCard } from "./components/AppCard";
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
import { ScrollToTop } from "./components/ScrollToTop";
import { MainSidebar, SidebarViewMode, formatVersion, useLatestVersion, Logo } from "./components/MainSidebar";
import { useRecentlyViewed, RecentlyViewedEntry } from "./hooks/useRecentlyViewed";
import ActivityTabs from "./components/ActivityTabs"

const NetworkBackground = dynamic(
	() => import('./components/NetworkMap').then((mod) => mod.NetworkBackground),
	{ ssr: false }
);
// --- TYPES ---
export type ViewMode = SidebarViewMode;

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

	const { recentlyViewed, addToRecentlyViewed } = useRecentlyViewed();

	// UI States
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [selectedApp, setSelectedApp] = useState<AppData | null>(initialSelectedApp);
	const [isRequesting, setIsRequesting] = useState(false);
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

	// RECENTLY VIEWED PERSISTENCE
	useEffect(() => {
		if (selectedApp) {
			addToRecentlyViewed({
				...selectedApp,
				category: selectedApp.category || "",
			} as RecentlyViewedEntry);
		}
	}, [selectedApp, addToRecentlyViewed]);

	// Ensure a subcategory is always active when "categories" is selected
	useEffect(() => {
		if (currentView === "categories" && !activeSubCategory && sortedCategories.length > 0) {
			setActiveSubCategory(sortedCategories[0]);
		}
	}, [currentView, sortedCategories, activeSubCategory]);

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

	useEffect(() => {
		window.scrollTo({ top: 0, behavior: "smooth" });
		requestAnimationFrame(() => {
			scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
		});
	}, [currentView, activeSubCategory, paginationState]);

	useGlobalScrollbar();

	const recentlyAdded = useMemo(() => {
		return [...apps]
			.filter((a): a is typeof a & { created_at: string } => typeof (a as Record<string, unknown>).created_at === 'string')
			.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
			.slice(0, 8);
	}, [apps]);

	const recentlyUpdated = useMemo(() => {
		return [...apps]
			.filter((a): a is typeof a & { updated_at: string } => typeof (a as Record<string, unknown>).updated_at === 'string')
			.sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || ''))
			.slice(0, 8);
	}, [apps]);

	const popularApps = useMemo(() => {
		return [...apps]
			.filter((a) => (globalLikes[a.slug || ""] || 0) > 0)
			.sort((a, b) => {
				const countA = globalLikes[a.slug || ""] || 0;
				const countB = globalLikes[b.slug || ""] || 0;
				if (countB !== countA) return countB - countA;
				return a.name.localeCompare(b.name);
			})
			.slice(0, 8);
	}, [apps, globalLikes]);

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

	const handleNavigateView = (view: SidebarViewMode) => {
		setCurrentView(view);
		setSidebarOpen(false);
	};

	const handleNavigateLanding = () => {
		navigateTo("landing");
		setSidebarOpen(false);
	};

	// --- RENDER HELPERS ---
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
							{latestGithubVersion ? (
								<span>
									v{formatVersion(latestGithubVersion)} Live Now
								</span>
							) : null}
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
					<MainSidebar
						apps={apps}
						categories={categories}
						currentView={currentView}
						sidebarOpen={sidebarOpen}
						sidebarCollapsed={sidebarCollapsed}
						setSidebarOpen={setSidebarOpen}
						setSidebarCollapsed={setSidebarCollapsed}
						onNavigateView={handleNavigateView}
						onNavigateLanding={handleNavigateLanding}
						onRandomApp={handleRandomApp}
						onRequest={() => setIsRequesting(true)}
					/>

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
								<Logo className="xl:hidden" onClick={handleNavigateLanding} />

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
									{currentView === "dashboard" && (
							<ActivityTabs
								newApps={recentlyAdded}
								viewed={recentlyViewed}
								updatedApps={recentlyUpdated}
								popularApps={popularApps}
								globalLikes={globalLikes}
								onSelectNew={handleAppSelect}
								onSelectViewed={setSelectedApp as (app: RecentlyViewedEntry) => void}
								onSelectUpdated={handleAppSelect}
								onSelectPopular={handleAppSelect}
							/>
									)}
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

						<ScrollToTop containerRef={scrollContainerRef} />
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
