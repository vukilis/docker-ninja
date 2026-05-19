"use client";
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApps } from './hooks/useApps';
import './style/globals.css';
import { AppModal, RequestSearchOverlay, DeployedCounter } from './components/AppModal';
import { AppCard } from './components/AppCard';
import { Counter } from './components/Counter';
// import { AISuggestor} from './components/ChatAI';
import { ThemeSwitcher} from './components/ThemeSwitcher';
import { RotatingMessage} from './components/RotatingMessage';
import { NetworkBackground } from './components/NetworkMap';
import SearchInput from './components/SearchInput';
import AboutPage from './components/AboutPage';
import { Sponsoring } from './components/Sponsoring';
import CommunityPage from './components/CommunityPage';
import { Navigation } from './hooks/navigation';
import { Pagination } from './components/Paginations';
import { fetchAllActiveLikes } from './actions';

// --- TYPES ---
export type ViewMode = 'dashboard' | 'About' | 'Sponsoring' | 'Community';

export interface AppData {
  id: string | number;
  slug?: string;
  name: string;
  category: string;
  image?: string;
  description?: string;
  [key: string]: unknown; 
}

// --- HOOKS ---
function useGlobalScrollbar() {
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;
    let activeElement: HTMLElement | null = null;

    const handleGlobalScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target || target === (document as unknown)) return;
      if (activeElement && activeElement !== target) activeElement.classList.remove('show-scrollbar');
      activeElement = target;
      target.classList.add('show-scrollbar');
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (activeElement) {
          activeElement.classList.remove('show-scrollbar');
          activeElement = null;
        }
      }, 1000);
    };

    window.addEventListener('scroll', handleGlobalScroll, true);
    return () => {
      window.removeEventListener('scroll', handleGlobalScroll, true);
      clearTimeout(scrollTimeout);
    };
  }, []);
}

// --- MAIN DASHBOARD ---
export default function Home() {

  // --- STATE & DATA ---
  const { navigateTo } = Navigation();
  const [paginationState, setPaginationState] = useState<Record<string, number>>({ 'all-apps': 1 });
  const [appsPerPage, setAppsPerPage] = useState(64);
  const [sortBy, setSortBy] = useState<'A-Z' | 'Z-A' | 'Favorites'>('A-Z');
  const [globalLikes, setGlobalLikes] = useState<Record<string, number>>({});

  const { 
    filteredApps, categories, search, setSearch, 
    selectedCategory, setSelectedCategory, apps, getCountByCategory 
  } = useApps();

  const searchParams = useSearchParams();

  // STATE INITIALIZATION (Using Lazy Initializers for SSR safety)
  const [isMounted, setIsMounted] = useState(false);
  
  const [isStarted, setIsStarted] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('ninja_isStarted') === 'true';
  });

  const [currentView, setCurrentView] = useState<ViewMode>(() => {
    if (typeof window === 'undefined') return 'dashboard';
    const view = new URLSearchParams(window.location.search).get('view');
    return (view === 'About' || view === 'Sponsoring' || view === 'Community') ? view : 'dashboard';
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('ninja_sidebarCollapsed') === 'true';
  });

  const [activeSubCategory, setActiveSubCategory] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('ninja_activeSubCategory');
  });

  const [recentlyViewed, setRecentlyViewed] = useState<AppData[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('docker_ninja_recently_viewed');
    try { return saved ? JSON.parse(saved) : []; } catch { return []; }
  });

  // UI States
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<AppData | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const hasHydrated = useRef(false);

  // URL SYNC: Listen to navigation and sync URL params to state
  useEffect(() => {
    const handleLocationChange = () => {
      const params = new URLSearchParams(window.location.search);
      const view = params.get('view') as ViewMode | null;
      const isStartedLoc = localStorage.getItem('ninja_isStarted') === 'true';

      setIsStarted(isStartedLoc);
      
      if (!isStartedLoc) {
        setSelectedApp(null);
        setCurrentView('dashboard');
      } else if (view === 'About' || view === 'Sponsoring' || view === 'Community') {
        setCurrentView(view);
      } else {
        setCurrentView('dashboard');
      }
    };

    handleLocationChange();

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, [setSelectedApp]);

  // MOUNT & INITIAL HYDRATION (Sync URL params to state once)
  useEffect(() => {
    if (hasHydrated.current || apps.length === 0) return;
    const appId = searchParams.get('app') || searchParams.get('id');
    const catParam = searchParams.get('category');
    if (appId) {
        const found = apps.find(a => String(a.id) === String(appId) || a.slug === appId);
        if (found) {
            setSelectedApp(found);
            setIsStarted(true); 
        }
    }
    if (catParam) {
        setSelectedCategory('ShowCategories');
        if (catParam !== 'ShowCategories' && categories.includes(catParam)) {
            setActiveSubCategory(catParam);
        }
        setIsStarted(true);
    }
    setIsMounted(true);
    hasHydrated.current = true;
  }, [apps, searchParams, categories, setSelectedCategory]); 

  // URL SYNC & PERSISTENCE
  useEffect(() => {
    if (!isMounted) return;

    localStorage.setItem('ninja_isStarted', isStarted.toString());
    localStorage.setItem('ninja_sidebarCollapsed', sidebarCollapsed.toString());
    if (activeSubCategory) localStorage.setItem('ninja_activeSubCategory', activeSubCategory);

    if (!isStarted) {
      window.history.replaceState({}, '', window.location.pathname);
    } else {
      const params = new URLSearchParams();
      if (selectedApp) params.set('app', (selectedApp.slug || selectedApp.id).toString());
      if (currentView !== 'dashboard') params.set('view', currentView);
      else if (selectedCategory === 'ShowCategories') {
        params.set('category', activeSubCategory || 'ShowCategories');
      }
      const qs = params.toString();
      const newUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
      window.history.replaceState({ path: newUrl }, '', newUrl);
    }
  }, [isStarted, sidebarCollapsed, currentView, selectedApp, selectedCategory, activeSubCategory, isMounted]);

  // UI LOGIC & HANDLERS
  const sortedCategories = useMemo(() => {
    return categories
      .filter(c => c !== "All" && c !== "ShowCategories")
      .sort((a, b) => a.localeCompare(b));
  }, [categories]);

  // DYNAMIC SORTING INTERCEPTOR FOR THE DASHBOARD LISTS
  const processedApps = useMemo(() => {
    const items = [...filteredApps];

    if (sortBy === 'A-Z') {
      return items.sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sortBy === 'Z-A') {
      return items.sort((a, b) => b.name.localeCompare(a.name));
    }
    if (sortBy === 'Favorites') {
      return items.sort((a, b) => {
        const countA = globalLikes[a.slug || ''] || 0;
        const countB = globalLikes[b.slug || ''] || 0;

        // Sort descending: Highest likes count comes first
        if (countB !== countA) {
          return countB - countA;
        }
        // Fallback to alphabetical order if likes are equal
        return a.name.localeCompare(b.name);
      });
    }
    return items;
  }, [filteredApps, sortBy, globalLikes]);

  // Ensure a subcategory is always active when "ShowCategories" is selected
  useEffect(() => {
    if (selectedCategory === "ShowCategories" && !activeSubCategory && sortedCategories.length > 0) {
      setActiveSubCategory(sortedCategories[0]);
    }
  }, [selectedCategory, sortedCategories, activeSubCategory]);

  // --- DYNAMIC VIEW PORT NAVIGATION  ---
  const activePageForScroll = selectedCategory !== "ShowCategories" 
    ? (paginationState['all-apps'] || 1) 
    : (paginationState[activeSubCategory] || 1);

  // SCROLL MECHANISM: Handles page resets, view shifts, and page flips seamlessly
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollTop = 0;
    const handleScroll = () => setShowScrollTop(container.scrollTop > 400);
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [isStarted, currentView, isMounted, selectedCategory, activeSubCategory, activePageForScroll]);

  // Automatically reset pagination when the user types a search query
  useEffect(() => {
    if (search.trim() !== "") {
      const currentKey = selectedCategory !== "ShowCategories" ? 'all-apps' : activeSubCategory;
      
      setPaginationState(prev => {
        // Only trigger state update if we aren't already on page 1 (prevents infinite re-render loops)
        if (prev[currentKey || 'all-apps'] === 1) return prev;
        
        return {
          ...prev,
          [currentKey || 'all-apps']: 1
        };
      });
    }
  }, [search, selectedCategory, activeSubCategory]);
  
  // RECENTLY VIEWED PERSISTENCE
  useEffect(() => {
    if (selectedApp) {
      document.body.style.overflow = 'hidden';
      setRecentlyViewed(prev => {
        const filtered = prev.filter(a => a.id !== selectedApp.id);
        const updated = [selectedApp, ...filtered].slice(0, 8);
        localStorage.setItem('docker_ninja_recently_viewed', JSON.stringify(updated));
        return updated;
      });
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [selectedApp]);

  // Sync device's locally liked records for instant client-side favorites sorting
  useEffect(() => {
    if (apps.length === 0 || Object.keys(globalLikes).length > 0) return;

    async function loadDashboardLikes() {
      try {
        const activeLikesMap = await fetchAllActiveLikes();
        setGlobalLikes(activeLikesMap);
      } catch (err) {
        console.error("Error setting active dashboard likes:", err);
      }
    }

    loadDashboardLikes();
  }, [apps]);

  // DYNAMIC PAGINATION PER BREAKPOINT
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1536) {       // 2xl breakpoint
        setAppsPerPage(64);
      } else if (width >= 1280) { // xl breakpoint
        setAppsPerPage(64);
      } else if (width >= 1024) { // lg breakpoint
        setAppsPerPage(64);
      } else if (width >= 768) {  // md breakpoint
        setAppsPerPage(64);
      } else if (width >= 640) {  // sm breakpoint
        setAppsPerPage(64);
      } else {                    // Mobile layout
        setAppsPerPage(63);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // GLOBAL SCROLL LOCK (e.g. when modal is open or sidebar is open on mobile)
  useEffect(() => {
    document.body.style.overflow = sidebarOpen || isRequesting ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen, isRequesting]);

  useGlobalScrollbar();

  // SCROLL TO TOP FUNCTION
  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAppSelect = (app: AppData) => {
    setSelectedApp(app);
    if (currentView !== 'dashboard') setCurrentView('dashboard');
    if (selectedCategory === 'ShowCategories') setActiveSubCategory(app.category);
  };

  const handleRandomApp = () => {
    if (apps.length === 0) return;
    const randomApp = apps[Math.floor(Math.random() * apps.length)];
    handleAppSelect(randomApp);
  };

  // --- RENDER HELPERS ---
  const renderRecentlyViewed = () => {
    if (recentlyViewed.length === 0 || selectedCategory === "ShowCategories") {
      return null;
    }

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
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
            Recent Activity
          </h3>
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

  // --- RENDER DASHBOARD ---
  const renderDashboard = () => {
    // Fetch the contextual page number dynamically based on the active view
    const activePage = selectedCategory !== "ShowCategories" 
      ? (paginationState['all-apps'] || 1) 
      : (paginationState[activeSubCategory] || 1);
    
    const indexOfLastApp = activePage * appsPerPage;
    const indexOfFirstApp = indexOfLastApp - appsPerPage;

    const handlePageChange = (pageNumber: number) => {
      const currentKey = selectedCategory !== "ShowCategories" ? 'all-apps' : activeSubCategory;
      setPaginationState(prev => ({
        ...prev,
        [currentKey]: pageNumber
      }));
    };

    // --- VIEW 1: ALL CONTAINERS ---
    if (selectedCategory !== "ShowCategories") {
      const paginatedApps = processedApps.slice(indexOfFirstApp, indexOfLastApp);
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-3 2x1:grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3 sm:gap-4">
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
    const categoryApps = processedApps.filter(a => a.category === activeSubCategory);
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
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-200 cursor-pointer select-none whitespace-nowrap text-[11px] font-bold uppercase tracking-wider ${isActive ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-blue-500 hover:bg-white dark:hover:bg-slate-800'}`}
                >
                  {cat}
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${isActive ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-800'}`}>
                    {getCountByCategory(cat)}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white dark:from-[#0d1117] to-transparent pointer-events-none md:hidden" />
        </div>
        
        <div className="grid grid-cols-3 2x1:grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3 sm:gap-4">
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
  };

  // --- FINAL RENDER GUARD & LANDING ---
  if (!isMounted) return <div className="min-h-screen bg-white dark:bg-[#0d1117]" />;

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0d1117] flex flex-col items-center justify-center p-6 transition-colors duration-700">
        <NetworkBackground apps={apps} />
        <div className="max-w-4xl w-full text-center space-y-8 z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-bold tracking-widest uppercase">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            V1.0 Live Now
          </div>
          <h1 className="text-7xl md:text-9xl font-black text-white dark:text-white tracking-tighter">
            DOCKER<br/><span className="text-blue-600">NINJA</span>
          </h1>
          <div className="relative group max-w-2xl mx-auto">
            <RotatingMessage/>
            <div className="mt-8 flex justify-center gap-1.5 opacity-50">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600/40" />
              <div className="w-12 h-1.5 rounded-full bg-gradient-to-r from-blue-600/40 to-transparent" />
            </div>
          </div>
          <div className="pt-2 md:pt-10 flex flex-col items-center gap-4">
            <button 
              onClick={() => navigateTo('dashboard')}
              className="group relative px-10 py-5 bg-blue-600 text-white font-black text-xl rounded-2xl shadow-2xl shadow-blue-500/40 hover:bg-blue-700 hover:-translate-y-1 active:scale-95 transition-all cursor-pointer uppercase tracking-[0.2em] overflow-hidden"
            >
              <div className="relative z-10 flex items-center gap-4">
                <span>Initiate Warp</span>
                <svg className="w-6 h-6 transform transition-transform duration-300 group-hover:translate-x-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            </button>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-500 animate-pulse">
              Explore the Infinite Stack
            </p>
          </div>
        </div>
        <div className="mt-10 md:mt-20 flex flex-wrap justify-center gap-5 lg:gap-20 uppercase text-[10px] font-black tracking-[0.3em]">
          <div className="group relative text-center">
            <div className="text-white dark:text-white text-3xl mb-1 tabular-nums">
              <Counter value={apps.length} delay={2000} />
            </div>
            <div className="text-slate-400 dark:text-slate-600 transition-colors group-hover:text-blue-500">Containers</div>
          </div>
          <div className="group relative text-center">
            <DeployedCounter />
          </div>
          <div className="group relative text-center">
            <div className="text-white dark:text-white text-3xl mb-1 tabular-nums">
              <Counter value={categories.length} delay={2000} />
            </div>
            <div className="text-slate-400 dark:text-slate-600 transition-colors group-hover:text-blue-500">Categories</div>
          </div>
        </div>
      </div>
    );
  }

  // --- RESPONSIVE MAIN APP LAYOUT ---
  return (
    <div className="flex h-screen dark:bg-[#0d1117] text-slate-900 dark:text-slate-100 transition-colors overflow-hidden">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm xl:hidden" onClick={() => setSidebarOpen(false)} />}
      
      <aside className={`fixed xl:relative z-50 h-full bg-[#B7C7CD] dark:bg-[#0b0e14] border-l xl:border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out top-0 bottom-0
        ${sidebarOpen ? 'translate-x-0 w-72 right-0' : 'translate-x-full xl:translate-x-0 right-0 xl:right-auto'} 
        ${sidebarCollapsed ? 'xl:w-24' : 'xl:w-72'}`}
      >
        <div className="p-4 h-full flex flex-col scrollbar-hide">
          {/* LOGO SECTION */}
          <div 
            onClick={() => navigateTo('landing')} 
            className={`flex items-center cursor-pointer transition-all duration-300 mb-10 ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}
          >
            <div className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center border-2 border-blue-600/20 rounded-lg my-custom-background group">
              <div className="absolute flex text-4xl font-black tracking-tighter select-none z-10 leading-none">
                <span className="text-slate-900 dark:text-white group-hover:-translate-y-1 transition-transform duration-300">
                  D
                </span>
                <span className="text-blue-600 group-hover:translate-y-1 transition-transform duration-300">
                  N
                </span>
              </div>
            </div>         
            <span className={`font-black text-xl tracking-tighter hover:text-blue-600 transition-all duration-300 origin-left ${sidebarCollapsed ? 'w-0 opacity-0 scale-0 overflow-hidden hidden' : 'w-auto opacity-100 scale-100'}`}>
              DOCKER <span className="text-blue-600 text-xl">NINJA</span>
            </span>
          </div>
          
          {/* NAVIGATION LINKS */}
          <nav className={`flex-1 flex flex-col space-y-2
            ${sidebarCollapsed ? 'p-2' : 'p-0'}`
          }>
            <button 
              onClick={() => { setSelectedCategory("All"); setCurrentView('dashboard'); setSidebarOpen(false); }}
              className={`w-full flex items-center px-4 py-3 rounded-xl font-bold uppercase text-xs tracking-wider transition-all cursor-pointer ${sidebarCollapsed ? 'justify-center' : 'justify-between'} ${selectedCategory === "All" && currentView === 'dashboard' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
            >
              <div className={`flex items-center ${sidebarCollapsed ? '' : 'gap-3'}`}>
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
                {!sidebarCollapsed && <span>Containers</span>}
              </div>
              {!sidebarCollapsed && (
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono ${selectedCategory === "All" ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  {apps.length}
                </span>
              )}
            </button>

            <button 
              onClick={() => { setSelectedCategory("ShowCategories"); setCurrentView('dashboard'); setSidebarOpen(false); }}
              className={`w-full flex items-center px-4 py-3 rounded-xl font-bold uppercase text-xs tracking-wider transition-all cursor-pointer ${sidebarCollapsed ? 'justify-center' : 'justify-between'} ${selectedCategory === "ShowCategories" && currentView === 'dashboard' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
            >
              <div className={`flex items-center ${sidebarCollapsed ? '' : 'gap-3'}`}>
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
                {!sidebarCollapsed && <span>Categories</span>}
              </div>
              {!sidebarCollapsed && (
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono ${selectedCategory === "ShowCategories" ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  {categories.length}
                </span>
              )}
            </button>

            {/* ABOUT BUTTON */}
            <button 
              onClick={() => { setCurrentView('About'); setSidebarOpen(false); }}
              className={`w-full flex items-center px-4 py-2 rounded-xl font-bold uppercase text-xs tracking-wider transition-all cursor-pointer ${currentView === 'About' ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'} ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}
            >
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
              </div>
              {!sidebarCollapsed && <span>About</span>}
            </button>

            {/* COMMUNITY BUTTON */}
            <button 
              onClick={() => { setCurrentView('Community'); setSidebarOpen(false); }}
              className={`w-full flex items-center px-4 py-2 rounded-xl font-bold uppercase text-xs tracking-wider transition-all cursor-pointer ${currentView === 'Community' ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'} ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}
            >
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
              </div>
              {!sidebarCollapsed && <span>Community</span>}
            </button>

            {/* SPONSORING BUTTON */}
            <button 
              onClick={() => { setCurrentView('Sponsoring'); setSidebarOpen(false); }}
              className={`w-full flex items-center px-4 py-2 rounded-xl font-bold uppercase text-xs tracking-wider transition-all cursor-pointer ${currentView === 'Sponsoring' ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'} ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}
            >
              <div className="w-5 h-5 flex items-center justify-center shrink-0 text-base select-none">
                ❤️
              </div>
              {!sidebarCollapsed && <span>Sponsoring</span>}
            </button>

            {/* UTILITIES & EXTERNAL LINKS SEGMENT */}
            <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
              <div className={`grid gap-2 ${
                sidebarCollapsed 
                  ? 'grid-cols-1' 
                  : 'grid-cols-2 xl:flex xl:flex-col'
              }`}>
                
                {/* 1. SURPRISE ME BUTTON */}
                <button 
                  title="Surprise Me"
                  onClick={(e) => { handleRandomApp(); setSidebarOpen(false); }}
                  className={`relative group flex items-center rounded-xl font-bold uppercase text-xs tracking-wider hover:bg-slate-200 dark:hover:bg-slate-800 ${
                    sidebarCollapsed 
                      ? 'justify-center px-4 py-3' 
                      : 'justify-start px-3 py-3 xl:px-4 xl:py-2.5 bg-slate-100/40 dark:bg-slate-900/20 xl:bg-transparent'
                  } text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 overflow-hidden cursor-pointer`}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-600/15 via-transparent to-transparent" />
                  <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent" />
                  
                  <div className={`flex items-center relative z-10 ${sidebarCollapsed ? 'justify-center' : 'gap-3 w-full'}`}>
                    <div className="relative w-5 h-5 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_5px_rgba(16,185,129,0.3)]">
                        <path d="m15 5 4 4" /><path d="M11 9 2 18l4 4 9-9" />
                        <path className="animate-pulse" d="M15 1l.5 1.5L17 3l-1.5.5L15 5l-.5-1.5L13 3l1.5-.5L15 1z" />
                        <path className="animate-pulse delay-75" d="M22 10l.5 1.5L24 12l-1.5.5L22 14l-.5-1.5L20 12l1.5-.5L22 10z" />
                      </svg>
                    </div>
                    {!sidebarCollapsed && <span className="text-[10px] xl:text-xs truncate">Surprise</span>}
                  </div>
                </button>

                {/* 2. REQUEST CONTAINER BUTTON */}
                <button 
                  title="Request Container"
                  onClick={(e) => {
                      e.preventDefault();
                      setIsRequesting(true);
                      setSidebarOpen(false);
                  }}
                  className={`relative group flex items-center rounded-xl font-bold uppercase text-xs tracking-wider hover:bg-slate-200 dark:hover:bg-slate-800 ${
                    sidebarCollapsed 
                      ? 'justify-center px-4 py-3' 
                      : 'justify-start px-3 py-3 xl:px-4 xl:py-2.5 bg-slate-100/40 dark:bg-slate-900/20 xl:bg-transparent'
                  } text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 overflow-hidden cursor-pointer`}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-600/15 via-transparent to-transparent" />
                  <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent" />
                  
                  <div className={`flex items-center relative z-10 ${sidebarCollapsed ? 'justify-center' : 'gap-3 w-full'}`}>
                    <div className="relative w-5 h-5 flex items-center justify-center shrink-0 text-amber-500 dark:text-amber-400 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_5px_rgba(245,158,11,0.3)]">
                        <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5" />
                        <path d="M9 18h6" />
                        <path d="M10 22h4" />
                      </svg>
                      <span className="absolute top-0 right-0 flex h-2 w-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1 w-1 bg-amber-300"></span>
                      </span>
                    </div>
                    {!sidebarCollapsed && <span className="text-[10px] xl:text-xs truncate">Request</span>}
                  </div>
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-[inset_0_0_15px_rgba(245,158,11,0.1)]" />
                </button>

                {/* 3. REPORT ISSUE LINK */}
                <a 
                  title="Report Issue"
                  href={`https://github.com/vukilis/docker-ninja/issues?q=is%3Aissue+is%3Aopen`}
                  target="_blank"
                  rel="noreferrer"
                  className={`relative group flex items-center rounded-xl font-bold uppercase text-xs tracking-wider hover:bg-slate-200 dark:hover:bg-slate-800 ${
                    sidebarCollapsed 
                      ? 'justify-center px-4 py-3' 
                      : 'justify-start xl:justify-between px-3 py-3 xl:px-4 xl:py-2.5 bg-slate-100/40 dark:bg-slate-900/20 xl:bg-transparent'
                  } text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 overflow-hidden`}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-600/15 via-transparent to-transparent" />
                  <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-purple-400/10 to-transparent" />
                  
                  <div className={`flex items-center relative z-10 min-w-0 ${sidebarCollapsed ? 'justify-center' : 'gap-3 w-full'}`}>
                    <div className="relative w-5 h-5 flex items-center justify-center shrink-0 text-purple-600 dark:text-purple-400 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_5px_rgba(168,85,247,0.3)]">
                        <rect width="8" height="14" x="8" y="6" rx="4" />
                        <path d="m19 7-3 2" /><path d="m5 7 3 2" /><path d="m19 19-3-2" /><path d="m5 19 3-2" /><path d="M20 13h-4" /><path d="M4 13h4" /><path d="m10 4 1 2" /><path d="m14 4-1 2" />
                      </svg>
                      <span className="absolute top-0 right-0 flex h-2 w-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1 w-1 bg-purple-300"></span>
                      </span>
                    </div>
                    {!sidebarCollapsed && <span className="text-[10px] xl:text-xs truncate">Report</span>}
                  </div>
                  
                  {!sidebarCollapsed && (
                    <svg className="w-3 h-3 text-slate-400 opacity-60 relative z-10 transition-transform group-hover:translate-x-0.5 hidden xl:block shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  )}
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-[inset_0_0_15px_rgba(168,85,247,0.1)]" />
                </a>

                {/* 4. GITHUB LINK */}
                <a 
                  title="GitHub"
                  href="https://github.com/vukilis" 
                  target="_blank" 
                  rel="noreferrer" 
                  className={`relative group flex items-center rounded-xl font-bold uppercase text-xs tracking-wider hover:bg-slate-200 dark:hover:bg-slate-800 ${
                    sidebarCollapsed 
                      ? 'justify-center px-4 py-3' 
                      : 'justify-start xl:justify-between px-3 py-3 xl:px-4 xl:py-2.5 bg-slate-100/40 dark:bg-slate-900/20 xl:bg-transparent'
                  } text-slate-500 hover:text-slate-900 dark:hover:text-white overflow-hidden`}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/15 via-transparent to-transparent" />
                  <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-indigo-400/10 to-transparent" />
                  
                  <div className={`flex items-center relative z-10 min-w-0 ${sidebarCollapsed ? 'justify-center' : 'gap-3 w-full'}`}>
                    <div className="relative w-5 h-5 flex items-center justify-center shrink-0 text-slate-700 dark:text-slate-300 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
                      <svg 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="w-[16px] h-[16px] drop-shadow-[0_0_5px_rgba(99,102,241,0.3)]"
                      >
                        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                      </svg>
                    </div>
                    {!sidebarCollapsed && <span className="text-[10px] xl:text-xs truncate">GitHub</span>}
                  </div>
                  
                  {!sidebarCollapsed && (
                    <svg className="w-3 h-3 text-slate-400 opacity-60 relative z-10 transition-transform group-hover:translate-x-0.5 hidden xl:block shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  )}
                </a>

              </div>
            </div>
            
            {/* BOTTOM ACTION REGION */}
            <div className="pt-8 mt-auto border-b border-slate-200 dark:border-slate-800 pb-6">
              <button 
                onClick={() => navigateTo('landing')} 
                className="group relative w-full flex items-center justify-center gap-3 px-4 py-4 rounded-2xl cursor-pointer bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/10 to-blue-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                <svg className="w-3 h-3 transform group-hover:-translate-x-1 transition-transform flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <span className={`relative z-10 transition-all ${sidebarCollapsed ? 'w-0 opacity-0 overflow-hidden hidden' : 'w-auto opacity-100'}`}>Back to Landing</span>
              </button>
            </div>
          </nav>
          
          <div className="pt-6"><ThemeSwitcher collapsed={sidebarCollapsed} /></div>
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
              onClick={() => setSidebarOpen(true)} 
              className="xl:hidden p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-3 md:gap-3 flex-1 justify-start xl:justify-end order-first xl:order-last relative">
            {/* LOGO SECTION: Shows on mobile, hides on desktop */}
            <div 
              onClick={() => navigateTo('landing')} 
              className="flex xl:hidden items-center cursor-pointer transition-all duration-300"
            >
              <div className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center border-2 border-blue-600/20 rounded-lg my-custom-background group">
                <div className="absolute flex text-4xl font-black tracking-tighter select-none z-10 leading-none">
                  <span className="text-slate-900 dark:text-white group-hover:-translate-y-1 transition-transform duration-300">
                    D
                  </span>
                  <span className="text-blue-600 group-hover:translate-y-1 transition-transform duration-300">
                    N
                  </span>
                </div>
              </div>   
            </div>

            {/* SEARCH SECTION */}
            <div className="flex max-w-[250px] md:max-w-none xl:order-first">
              <SearchInput apps={apps} search={search} setSearch={setSearch} onAppSelect={handleAppSelect} />
            </div>
          </div>
        </header>

        <section ref={scrollContainerRef} className="flex-1 overflow-y-auto p-0 scroll-smooth" style={{ scrollbarGutter: 'stable' }}>
          {currentView === 'About' ? (
            <AboutPage />
          ) : currentView === 'Sponsoring' ? (
            <Sponsoring />
          ) : currentView === 'Community' ? (
            <CommunityPage />
          ) : (
            <div className="p-4 sm:p-6 lg:p-10">
              <div className="max-w-[1600px] mx-auto">
                {renderRecentlyViewed()}
                <div className="mb-6 mt-4 sm:mb-10 sm:mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex flex-row items-center justify-between w-full gap-4 mb-6">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight mb-1.5 truncate">
                        {selectedCategory === "ShowCategories" ? "Explore Categories" : "Explore Containers"}
                      </h2>
                      <div className="flex items-center gap-3">
                        <div className="h-1 w-8 bg-blue-600 rounded-full" />
                        <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-full whitespace-nowrap">
                          {selectedCategory === "ShowCategories" 
                            ? `${categories.length} categories · ${apps.length} Containers`
                            : `${apps.length} Containers`
                          }
                        </span>
                      </div>
                    </div>
                    {selectedCategory !== "ShowCategories" && (
                      <div className="flex items-center gap-2 shrink-0 self-center">
                        <span className="hidden md:inline text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          Sort By:
                        </span>
                        <div className="inline-flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-sm">
                          {(['A-Z', 'Z-A', 'Favorites'] as const).map((option) => {
                            const isActive = sortBy === option;
                            return (
                              <button
                                key={option}
                                onClick={() => {
                                  setSortBy(option);
                                  setPaginationState(prev => ({ ...prev, 'all-apps': 1 }));
                                }}
                                className={`px-2.5 py-1.5 sm:px-3 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-150 cursor-pointer whitespace-nowrap ${
                                  isActive 
                                    ? 'bg-blue-600 text-white shadow-sm' 
                                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                                }`}
                              >
                                {option === 'Favorites' ? '❤️ Favs' : option}
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

        <button onClick={scrollToTop} className={`fixed bottom-8 right-8 z-[60] flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-xl shadow-2xl shadow-blue-500/40 hover:bg-blue-700 hover:-translate-y-1 transition-all duration-300 cursor-pointer ${showScrollTop ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 15l-6-6-6 6"/></svg>
        </button>
      </main>

      {selectedApp && (
          <AppModal app={selectedApp} allApps={apps} onAppChange={setSelectedApp} onClose={() => setSelectedApp(null)} onRandom={handleRandomApp} 
            onLikeUpdate={(slug: string, newCount: number) => {
                setGlobalLikes(prev => ({
                  ...prev,
                  [slug]: newCount
                }));
              }}
            likesCount={globalLikes[selectedApp.slug || ''] || 0}
          />
      )}
      {isRequesting && (
        <RequestSearchOverlay allApps={apps} onClose={() => setIsRequesting(false)} onAppSelect={(app: AppData) => { setSelectedApp(app); setIsRequesting(false); }} />
      )}
    </div>
  );
}