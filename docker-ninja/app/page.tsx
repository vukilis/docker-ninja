"use client";
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useApps } from './hooks/useApps';
import './style/globals.css';
import { AppModal, RequestSearchOverlay } from './components/AppModal';
import { AppCard } from './components/AppCard';
import { Counter } from './components/Counter';
import { AISuggestor} from './components/ChatAI';
import { ThemeSwitcher} from './components/ThemeSwitcher';
import { RotatingMessage} from './components/RotatingMessage';
import { NetworkBackground } from './components/NetworkMap';
import SearchInput from './components/SearchInput';
import AboutPage from './components/AboutPage';
import { Sponsoring } from './components/Sponsoring';

// SCROLLBAR ANIMATION
export function useGlobalScrollbar() {
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;
    let activeElement: HTMLElement | null = null;

    const handleGlobalScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target || target === document as any) return;

      if (activeElement && activeElement !== target) {
        activeElement.classList.remove('show-scrollbar');
      }

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

// MAIN DASHBOARD
export default function Home() {
  const { 
    filteredApps, categories, search, setSearch, 
    selectedCategory, setSelectedCategory, apps, getCountByCategory 
  } = useApps();

  const [isMounted, setIsMounted] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'About' | 'Sponsoring'>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [activeSubCategory, setActiveSubCategory] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const scrollContainerRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const hasHydrated = useRef(false);

  const sortedCategories = useMemo(() => {
    return categories
      .filter(c => c !== "All" && c !== "ShowCategories")
      .sort((a, b) => a.localeCompare(b));
  }, [categories]);

  // Load basic UI settings
  useEffect(() => {
    const savedStarted = localStorage.getItem('ninja_isStarted');
    const savedCollapsed = localStorage.getItem('ninja_sidebarCollapsed');
    const savedRecent = localStorage.getItem('docker_ninja_recently_viewed');
    
    if (savedStarted === 'true') setIsStarted(true);
    if (savedCollapsed === 'true') setSidebarCollapsed(true);
    if (savedRecent) {
      try { setRecentlyViewed(JSON.parse(savedRecent)); } catch (e) {}
    }
    
    setIsMounted(true);
  }, []);

  // Handle Shared Links (Ensures background view matches URL)
  useEffect(() => {
    if (isMounted && apps.length > 0 && !hasHydrated.current) {
      const params = new URLSearchParams(window.location.search);
      
      // Restore View (About/Sponsoring)
      const viewParam = params.get('view');
      if (viewParam === 'About' || viewParam === 'Sponsoring') {
        setCurrentView(viewParam as any);
        setIsStarted(true);
      }

      // Restore Category (Even if app is open)
      const catParam = params.get('category');
      if (catParam) {
        setSelectedCategory('ShowCategories');
        if (catParam !== 'ShowCategories' && categories.includes(catParam)) {
            setActiveSubCategory(catParam);
        }
        setIsStarted(true);
      }

      // Restore App Modal
      const appId = params.get('app') || params.get('id');
      if (appId) {
        const foundApp = apps.find(a => 
            String(a.id) === String(appId) || 
            String(a.slug) === String(appId)
        );
        if (foundApp) {
          setSelectedApp(foundApp);
          setIsStarted(true);
        }
      }
      
      hasHydrated.current = true;
    }
  }, [apps, isMounted, categories, setSelectedCategory]);

  // Sync State to URL & Persistence
  useEffect(() => {
    if (!isMounted || !hasHydrated.current) return;
    
    localStorage.setItem('ninja_isStarted', isStarted.toString());
    localStorage.setItem('ninja_sidebarCollapsed', sidebarCollapsed.toString());

    const params = new URLSearchParams();

    if (selectedApp) {
      params.set('app', (selectedApp.slug || selectedApp.id).toString());
    } 

    if (currentView !== 'dashboard') {
      params.set('view', currentView);
    } else if (selectedCategory === 'ShowCategories') {
      params.set('category', activeSubCategory || 'ShowCategories');
    }

    const queryString = params.toString();
    const newUrl = queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname;
    
    window.history.replaceState({ path: newUrl }, '', newUrl);

  }, [isStarted, sidebarCollapsed, currentView, selectedApp, selectedCategory, activeSubCategory, isMounted]);

  // UI Handlers
  useEffect(() => {
    if (selectedCategory === "ShowCategories" && !activeSubCategory && sortedCategories.length > 0) {
      setActiveSubCategory(sortedCategories[0]);
    }
  }, [selectedCategory, sortedCategories, activeSubCategory]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const handleScroll = () => setShowScrollTop(container.scrollTop > 400);
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [isStarted, currentView]);

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

  useGlobalScrollbar();

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateTo = (path) => {
    setSidebarOpen(false);
    if (path === 'landing') {
      setIsStarted(false);
    } else {
      setIsStarted(true);
      setCurrentView('dashboard');
    }
  };

  const handleAppSelect = (app) => {
    if (!app) return;
    setSelectedApp(app);
    if (currentView !== 'dashboard') setCurrentView('dashboard');
    // If the user selects an app, don't force a category change unless they are already in category mode
    if (selectedCategory === 'ShowCategories') {
      setActiveSubCategory(app.category);
    }
  };

  const handleRandomApp = () => {
    if (apps.length === 0) return;
    
    // Pick a random index
    const randomIndex = Math.floor(Math.random() * apps.length);
    const randomApp = apps[randomIndex];
    
    // Open the modal
    setSelectedApp(randomApp);
    
    // Ensure dashboard view
    if (currentView !== 'dashboard') setCurrentView('dashboard');
  };
  
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

        <div className="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 md:gap-4 relative z-0">
          {recentlyViewed.map((app, index) => (
            <div key={`recent-${app.id}`} className="relative group">
              {index < recentlyViewed.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-4 h-[1px] bg-slate-200 dark:bg-slate-800 group-hover:bg-blue-500/50 transition-colors duration-500" />
              )}
              
              <div 
                className="relative z-10 transition-transform duration-300 active:scale-95 cursor-pointer transform scale-95 md:scale-100 origin-top max-md:[&_h3]:hidden max-md:[&_p]:hidden max-md:[&_span:not(.icon-span)]:hidden max-md:flex max-md:justify-center"
                onClick={() => setSelectedApp(app)}
              >
                <AppCard app={app} onClick={() => setSelectedApp(app)} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 md:mt-10 relative">
          <div className="h-[1px] w-full bg-slate-100 dark:bg-slate-800/50" />
        </div>
      </div>
    );
  };

  const renderDashboard = () => {
    if (selectedCategory !== "ShowCategories") {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {filteredApps.map((app) => (
            <AppCard key={app.id} app={app} onClick={() => setSelectedApp(app)} />
          ))}
        </div>
      );
    }
    const categoryApps = filteredApps.filter(a => a.category === activeSubCategory);
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
          {categoryApps.map((app) => (
            <AppCard key={app.id} app={app} onClick={() => setSelectedApp(app)} />
          ))}
        </div>
      </div>
    );
  };

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
          <h1 className="text-7xl md:text-9xl font-black text-slate-900 dark:text-white tracking-tighter">
            DOCKER<br/><span className="text-blue-600">NINJA</span>
          </h1>
          <div className="relative group max-w-2xl mx-auto">
            <RotatingMessage/>
            <div className="mt-8 flex justify-center gap-1.5 opacity-50">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600/40" />
              <div className="w-12 h-1.5 rounded-full bg-gradient-to-r from-blue-600/40 to-transparent" />
            </div>
          </div>
          <div className="pt-10 flex flex-col items-center gap-4">
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
        <div className="mt-20 flex flex-wrap justify-center gap-12 lg:gap-20 uppercase text-[10px] font-black tracking-[0.3em]">
          <div className="group relative text-center">
            <div className="text-slate-900 dark:text-white text-3xl mb-1 tabular-nums">
              <Counter value={apps.length} delay={2000} />
            </div>
            <div className="text-slate-400 dark:text-slate-600 transition-colors group-hover:text-blue-500">Containers</div>
          </div>
          <div className="group relative text-center">
            <div className="text-slate-900 dark:text-white text-3xl mb-1 tabular-nums">
              <Counter value={categories.length} delay={2000} />
            </div>
            <div className="text-slate-400 dark:text-slate-600 transition-colors group-hover:text-blue-500">Categories</div>
          </div>
          <div className="group relative text-center">
            <div className="relative flex items-center justify-center text-blue-600 text-3xl mb-1 font-black text-center">
              <span>ONLINE</span>
            </div>
            <div className="text-slate-400 dark:text-slate-600 transition-colors group-hover:text-blue-500">Systems Ready</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white dark:bg-[#0d1117] text-slate-900 dark:text-slate-100 transition-colors">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />}
      
      <aside className={`fixed lg:relative z-50 h-full bg-slate-50 dark:bg-[#0b0e14] border-l lg:border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out 
        ${sidebarOpen ? 'translate-x-0 w-72 right-0' : 'translate-x-full lg:translate-x-0 right-0 lg:right-auto'} 
        ${sidebarCollapsed ? 'lg:w-24' : 'lg:w-72'}`}
      >
        <div className="p-6 h-full flex flex-col">
          {/* Logo Section */}
          <div onClick={() => navigateTo('landing')} className={`flex items-center cursor-pointer transition-all duration-300 mb-10 ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center border-2 border-blue-600/20 rounded-lg bg-slate-50 dark:bg-slate-900 group">
              <div className="relative flex text-3xl font-black tracking-tighter select-none z-10 leading-none translate-y-[1px]">
                <span className="text-slate-900 dark:text-white group-hover:-translate-y-1 transition-transform duration-300">D</span>
                <span className="text-blue-600 group-hover:translate-y-1 transition-transform duration-300">N</span>
              </div>
            </div>         
            <span className={`font-black text-xl tracking-tighter hover:text-blue-600 transition-all duration-300 origin-left ${sidebarCollapsed ? 'w-0 opacity-0 scale-0 overflow-hidden' : 'w-auto opacity-100 scale-100'}`}>
              DOCKER <span className="text-blue-600 text-xl">NINJA</span>
            </span>
          </div>
          
          <nav className="flex-1 flex flex-col h-full space-y-2 overflow-y-auto scrollbar-hide">
            <button 
              onClick={() => { setSelectedCategory("All"); setCurrentView('dashboard'); setSidebarOpen(false); }}
              className={`w-full flex items-center px-4 py-3 rounded-xl font-bold uppercase text-xs tracking-wider transition-all cursor-pointer ${sidebarCollapsed ? 'justify-center' : 'justify-between'} ${selectedCategory === "All" && currentView === 'dashboard' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
            >
              <div className={`flex items-center ${sidebarCollapsed ? '' : 'gap-3'}`}>
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
                {!sidebarCollapsed && <span>All Containers</span>}
                {!sidebarCollapsed && (
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono ${selectedCategory === "All" ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  {apps.length}
                </span>
              )}
              </div>
            </button>

            <button 
              onClick={() => { setSelectedCategory("ShowCategories"); setCurrentView('dashboard'); setSidebarOpen(false); }}
              className={`w-full flex items-center px-4 py-3 rounded-xl font-bold uppercase text-xs tracking-wider transition-all cursor-pointer ${sidebarCollapsed ? 'justify-center' : 'justify-between'} ${selectedCategory === "ShowCategories" && currentView === 'dashboard' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
            >
              <div className={`flex items-center ${sidebarCollapsed ? '' : 'gap-3'}`}>
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
                {!sidebarCollapsed && <span>Categories</span>}
                {!sidebarCollapsed && (
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono ${selectedCategory === "ShowCategories" ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  {categories.length}
                </span>
              )}
              </div>
            </button>

            <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <button 
                onClick={() => { setCurrentView('About'); setSidebarOpen(false); }}
                className={`w-full flex items-center px-4 py-2 rounded-xl font-bold uppercase text-xs tracking-wider transition-all cursor-pointer ${currentView === 'About' ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'} ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
                {!sidebarCollapsed && <span>About</span>}
              </button>

              <a href="https://github.com/vukilis" target="_blank" className={`w-full flex items-center px-4 py-2 rounded-xl font-bold uppercase text-xs tracking-wider transition-all text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></svg>
                {!sidebarCollapsed && <span>GitHub</span>}
              </a>

              <button 
                onClick={() => { setCurrentView('Sponsoring'); setSidebarOpen(false); }}
                className={`w-full flex items-center px-4 py-2 rounded-xl font-bold uppercase text-xs tracking-wider transition-all cursor-pointer ${currentView === 'Sponsoring' ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'} ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}
              >
                <span className="w-4 h-4 flex items-center justify-center shrink-0">❤️</span>
                {!sidebarCollapsed && <span>Sponsoring</span>}
              </button>
            </div>

            <div className="flex-1" />
            
            <div className="pt-8 mt-auto border-b border-slate-200 dark:border-slate-800 pb-6">
              <button 
                onClick={() => navigateTo('landing')} 
                className="group relative w-full flex items-center justify-center gap-3 px-4 py-4 rounded-2xl cursor-pointer bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/10 to-blue-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                <svg className="w-3 h-3 transform group-hover:-translate-x-1 transition-transform duration-300 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <span className={`relative z-10 transition-all duration-300 ${sidebarCollapsed ? 'w-0 opacity-0 overflow-hidden hidden' : 'w-auto opacity-100'}`}>Back to Landing</span>
              </button>
            </div>
          </nav>
          <div className="pt-6"><ThemeSwitcher collapsed={sidebarCollapsed} /></div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 flex items-center justify-between px-3 md:px-6 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white/50 dark:bg-[#0d1117]/50 backdrop-blur-md z-10">
          {/* 
              SIDEBAR TOGGLE CONTAINER
              Mobile: Positioned last (right)
              Desktop: Positioned first (left)
          */}
          <div className="flex items-center gap-2 md:gap-4 order-last lg:order-first">
            {/* Sidebar Toggle - Desktop */}
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)} 
              className="hidden lg:flex p-2 text-slate-500 hover:text-blue-600 transition-colors bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={sidebarCollapsed ? "rotate-180" : ""}>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="3" x2="9" y2="21"></line>
              </svg>
            </button>
            
            {/* Sidebar Toggle - Mobile */}
            <button 
              onClick={() => setSidebarOpen(true)} 
              className="lg:hidden p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* 
              ACTIONS CONTAINER (Search + Icons)
              Mobile: Positioned first (left)
              Desktop: Positioned last (right)
          */}
          <div className="flex items-center gap-1.5 md:gap-3 flex-1 justify-start lg:justify-end order-first lg:order-last relative">
            {/* MOBILE MENU TRIGGER */}
            <div className="md:hidden">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`relative flex items-center justify-center w-10 h-10 rounded-full border transition-all duration-300 bg-white dark:bg-[#0d1117] cursor-pointer z-[71] ${
                  isMenuOpen ? 'border-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.2)]' : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={isMenuOpen ? "text-blue-600" : "text-slate-500"}>
                  <path d="M12 6a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /><path d="M4 6l8 0" /><path d="M16 6l4 0" />
                  <path d="M6 12a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /><path d="M4 12l2 0" /><path d="M10 12l10 0" />
                  <path d="M15 18a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /><path d="M4 18l11 0" /><path d="M19 18l1 0" />
                </svg>
              </button>

              {/* FULL WIDTH SQUARE MENU - MATCHES HEADER */}
              {isMenuOpen && (
                <>
                  <div className="fixed inset-0 z-60" onClick={() => setIsMenuOpen(false)} />
                  <div className="fixed left-1/2 -translate-x-1/2 top-16 w-[90%] p-3 bg-white dark:bg-[#0B0B11] border border-t-0 border-slate-200 dark:border-blue-600/50 shadow-[0_20px_50px_rgba(0,0,0,0.4)] z-[70] rounded-b-3xl animate-in slide-in-from-top duration-300">                    
                    <div className="grid grid-cols-3 gap-3">
                      
                      {/* Surprise Me*/}
                      <button 
                          onClick={() => { handleRandomApp(); setIsMenuOpen(false); }}
                          className="relative group flex flex-col items-center justify-center gap-2 py-4 rounded-xl border border-slate-200 dark:border-emerald-600/30 bg-white/5 dark:bg-emerald-950/10 cursor-pointer"
                      >
                          <div className="relative shrink-0 text-emerald-400">
                              <svg 
                                  width="18" 
                                  height="18" 
                                  viewBox="0 0 24 24" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  strokeWidth="2.5" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  className="drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]"
                              >
                                  <path d="m15 5 4 4" />
                                  <path d="M11 9 2 18l4 4 9-9" />
                                  <path className="animate-pulse" d="M15 1l.5 1.5L17 3l-1.5.5L15 5l-.5-1.5L13 3l1.5-.5L15 1z" />
                                  <path className="animate-pulse delay-75" d="M22 10l.5 1.5L24 12l-1.5.5L22 14l-.5-1.5L20 12l1.5-.5L22 10z" />
                              </svg>
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Surprise</span>
                      </button>

                      {/* Report Issue */}
                      <a 
                          href="https://github.com/vukilis/docker-ninja/issues"
                          target="_blank"
                          className="relative group flex flex-col items-center justify-center gap-2 py-4 rounded-xl border border-slate-200 dark:border-purple-600/30 bg-white/5 dark:bg-purple-950/10"
                      >
                          <div className="relative shrink-0 text-purple-400">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]">
                                  <rect width="8" height="14" x="8" y="6" rx="4" />
                                  <path d="m19 7-3 2" /><path d="m5 7 3 2" /><path d="m19 19-3-2" /><path d="m5 19 3-2" /><path d="M20 13h-4" /><path d="M4 13h4" /><path d="m10 4 1 2" /><path d="m14 4-1 2" />
                              </svg>
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">Report</span>
                      </a>

                      {/* Request App */}
                      <button 
                          onClick={() => { setIsRequesting(true); setIsMenuOpen(false); }}
                          className="relative group flex flex-col items-center justify-center gap-2 py-4 rounded-xl border border-slate-200 dark:border-amber-600/30 bg-white/5 dark:bg-amber-950/10 cursor-pointer"
                      >
                          <div className="relative shrink-0 text-amber-400">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]">
                                  <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5" />
                                  <path d="M9 18h6" />
                                  <path d="M10 22h4" />
                              </svg>
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Request</span>
                      </button>

                    </div>
                  </div>
                </>
              )}
            </div>

            {/* DESKTOP ACTIONS */}
            <div className="hidden md:flex items-center gap-3">
              {/* Random App Button */}
              <button 
                  onClick={handleRandomApp}
                  className="relative group flex items-center justify-center w-10 h-10 md:w-auto md:min-w-[140px] gap-2 md:px-4 py-3 md:py-4 text-[8px] md:text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-500 overflow-hidden rounded-full border border-slate-200 dark:border-emerald-600/30 hover:border-emerald-500/60 bg-white/5 dark:bg-emerald-950/5 backdrop-blur-sm cursor-pointer"
              >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-600/20 via-green-900/5 to-transparent" />
                  <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent" />
                  
                  <div className="relative flex items-center justify-center gap-2 text-slate-500 dark:text-emerald-400 group-hover:text-emerald-300 transition-colors duration-300">
                      <div className="relative shrink-0 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
                          <svg 
                              width="14" 
                              height="14" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="2.5" 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              className="drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]"
                          >
                              <path d="m15 5 4 4" />
                              <path d="M11 9 2 18l4 4 9-9" />
                              <path className="animate-pulse" d="M15 1l.5 1.5L17 3l-1.5.5L15 5l-.5-1.5L13 3l1.5-.5L15 1z" />
                              <path className="animate-pulse delay-75" d="M22 10l.5 1.5L24 12l-1.5.5L22 14l-.5-1.5L20 12l1.5-.5L22 10z" />
                          </svg>
                          <span className="absolute -top-1 -right-1 flex h-2 w-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-1 w-1 bg-emerald-300"></span>
                          </span>
                      </div>
                      
                      <span className="hidden md:inline tracking-[0.2em] whitespace-nowrap">Surprise Me</span>
                  </div>

                  <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-[inset_0_0_15px_rgba(16,185,129,0.15)]" />
              </button>
              {/* Report Issue Button */}
              <a 
                  href={`https://github.com/vukilis/docker-ninja/issues?q=is%3Aissue+is%3Aopen`}
                  target="_blank"
                  className="relative group flex items-center justify-center w-10 h-10 md:w-auto md:min-w-[140px] gap-2 md:px-4 py-3 md:py-4 text-[8px] md:text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-500 overflow-hidden rounded-full border border-slate-200 dark:border-purple-600/30 hover:border-purple-500/60 bg-white/5 dark:bg-purple-950/5 backdrop-blur-sm"
              >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-600/20 via-fuchsia-900/5 to-transparent" />
                  <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-purple-400/10 to-transparent" />
                  
                  <div className="relative flex items-center justify-center gap-2 text-slate-500 dark:text-purple-400 group-hover:text-fuchsia-400 transition-colors duration-300">
                      <div className="relative shrink-0">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]">
                              <rect width="8" height="14" x="8" y="6" rx="4" />
                              <path d="m19 7-3 2" /><path d="m5 7 3 2" /><path d="m19 19-3-2" /><path d="m5 19 3-2" /><path d="M20 13h-4" /><path d="M4 13h4" /><path d="m10 4 1 2" /><path d="m14 4-1 2" />
                          </svg>
                          <span className="absolute -top-1 -right-1 flex h-2 w-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-1 w-1 bg-fuchsia-300"></span>
                          </span>
                      </div>
                      <span className="hidden md:inline tracking-[0.2em] whitespace-nowrap">Report Issue</span>
                  </div>
                  <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-[inset_0_0_15px_rgba(168,85,247,0.15)]" />
              </a>

              {/* Request App Button */}
              <button 
                  onClick={(e) => {
                      e.preventDefault();
                      setIsRequesting(true);
                  }}
                  className="relative group flex items-center justify-center w-10 h-10 md:w-auto md:min-w-[140px] gap-2 md:px-4 py-3 md:py-4 text-[8px] md:text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-500 overflow-hidden rounded-full border border-slate-200 dark:border-amber-600/30 hover:border-amber-500/60 bg-white/5 dark:bg-amber-950/5 backdrop-blur-sm cursor-pointer"
              >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-600/20 via-yellow-900/5 to-transparent" />
                      <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent" />
                      <div className="relative flex items-center justify-center gap-2 text-slate-500 dark:text-amber-400 group-hover:text-yellow-400 transition-colors duration-300">
                          <div className="relative shrink-0">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]">
                                  <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5" />
                                  <path d="M9 18h6" />
                                  <path d="M10 22h4" />
                              </svg>
                              <span className="absolute -top-1 -right-1 flex h-2 w-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-1 w-1 bg-yellow-300"></span>
                              </span>
                          </div>
                          <span className="hidden md:inline tracking-[0.2em] whitespace-nowrap">Request App</span>
                      </div>
                  <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-[inset_0_0_15px_rgba(245,158,11,0.15)]" />
              </button>
            </div>

            {/* Search Input */}
            <div className="flex max-w-[250px] md:max-w-none lg:order-first">
              <SearchInput apps={apps} search={search} setSearch={setSearch} onAppSelect={handleAppSelect} />
            </div>
          </div>
        </header>

        <section ref={scrollContainerRef} className="flex-1 overflow-y-auto p-0 scroll-smooth" style={{ scrollbarGutter: 'stable' }}>
          {currentView === 'About' ? (
            <AboutPage />
          ) : currentView === 'Sponsoring' ? (
            <Sponsoring />
          ) : (
            <div className="p-6 lg:p-10">
              <div className="max-w-10xl mx-auto">
                {/* <AISuggestor onAppSelect={handleAppSelect} /> */}
                {renderRecentlyViewed()}
                <div className="mb-10 mt-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-black tracking-tight mb-2">
                      {selectedCategory === "ShowCategories" ? "Explore Categories" : "Explore Containers"}
                    </h2>
                    <div className="flex items-center gap-4">
                      <div className="h-1 w-12 bg-blue-600 rounded-full" />
                      <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-black uppercase tracking-widest rounded-full">
                        {selectedCategory === "ShowCategories" 
                          ? `${categories.length} categories · ${apps.length} Containers`
                          : `${apps.length} Containers`
                        }
                      </span>
                    </div>
                  </div>
                </div>
                {renderDashboard()}
              </div>
            </div>
          )}
        </section>

        <button
          onClick={scrollToTop}
          className={`fixed bottom-8 right-8 z-[60] flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-xl shadow-2xl shadow-blue-500/40 hover:bg-blue-700 hover:-translate-y-1 transition-all duration-300 cursor-pointer ${
            showScrollTop ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
          }`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 15l-6-6-6 6"/></svg>
        </button>
      </main>

      {selectedApp && (
          <AppModal 
              app={selectedApp} 
              allApps={apps} 
              onAppChange={setSelectedApp} 
              onClose={() => setSelectedApp(null)}
              onRandom={handleRandomApp}
          />
      )}
      {isRequesting && (
        <RequestSearchOverlay 
          allApps={apps}
          onClose={() => setIsRequesting(false)}
          onAppSelect={(app) => {
            setSelectedApp(app);
            setIsRequesting(false);
          }}
        />
      )}
    </div>
  );
}