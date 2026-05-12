"use client";
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useApps } from './hooks/useApps';
import './style/globals.css';
import { AppModal } from './components/AppModal';
import { AppCard } from './components/AppCard';
import { Counter } from './components/Counter';
import { AISuggestor} from './components/ChatAI';
import { ThemeSwitcher} from './components/ThemeSwitcher';
import { RotatingMessage} from './components/RotatingMessage';
import { NetworkBackground } from './components/NetworkMap';
import SearchInput from './components/SearchInput';
import AboutPage from './components/AboutPage';
import { Sponsoring } from './components/Sponsoring';

// MAIN DASHBOARD
export default function Home() {
  const { 
    filteredApps, categories, search, setSearch, 
    selectedCategory, setSelectedCategory, apps, getCountByCategory 
  } = useApps();

  // Persistence & Hydration Logic
  const [isMounted, setIsMounted] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  
  // View Management
  const [currentView, setCurrentView] = useState<'dashboard' | 'about' | 'Sponsoring'>('dashboard');

  const sortedCategories = useMemo(() => {
    return categories
      .filter(c => c !== "All" && c !== "ShowCategories")
      .sort((a, b) => a.localeCompare(b));
  }, [categories]);
  
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile Drawer
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Desktop Toggle
  const [selectedApp, setSelectedApp] = useState(null);
  const [activeSubCategory, setActiveSubCategory] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollContainerRef = useRef(null);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  // 1. Handle Initialization (Hydration)
  useEffect(() => {
    const savedStarted = localStorage.getItem('ninja_isStarted');
    const savedCollapsed = localStorage.getItem('ninja_sidebarCollapsed');
    
    if (savedStarted === 'true') setIsStarted(true);
    if (savedCollapsed === 'true') setSidebarCollapsed(true);
    
    setIsMounted(true);
  }, []);

  // 2. Handle State Persistence
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('ninja_isStarted', isStarted.toString());
    }
  }, [isStarted, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('ninja_sidebarCollapsed', sidebarCollapsed.toString());
    }
  }, [sidebarCollapsed, isMounted]);

  useEffect(() => {
    if (selectedCategory === "ShowCategories" && !activeSubCategory) {
      const firstCat = sortedCategories[0]; 
      if (firstCat) setActiveSubCategory(firstCat);
    }
  }, [selectedCategory, sortedCategories, activeSubCategory]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (container.scrollTop > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [isStarted, currentView]);

  useEffect(() => {
    const saved = localStorage.getItem('docker_ninja_recently_viewed');
    if (saved) {
      try {
        setRecentlyViewed(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse recent apps", e);
      }
    }
  }, []);

  useEffect(() => {
    if (selectedApp) {
      setRecentlyViewed(prev => {
        // Remove the app if it already exists to move it to the front
        const filtered = prev.filter(a => a.id !== selectedApp.id);
        const updated = [selectedApp, ...filtered].slice(0, 8); // Keep last 8
        localStorage.setItem('docker_ninja_recently_viewed', JSON.stringify(updated));
        return updated;
      });
    }
  }, [selectedApp]);

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
    setSelectedApp(app);
    setCurrentView('dashboard'); 
    if (selectedCategory !== 'All') {
      setSelectedCategory("ShowCategories");
      setActiveSubCategory(app.category);
    }
  };

  const renderRecentlyViewed = () => {
    if (recentlyViewed.length === 0 || selectedCategory === "ShowCategories") {
      return null;
    }

    return (
      <div className="mb-12 relative group/section">
        {/* Header with static neon accent */}
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

        {/* Apps Grid - for smaller mobile cards */}
        <div className="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 md:gap-4 relative">
          {recentlyViewed.map((app, index) => (
            <div key={`recent-${app.id}`} className="relative group">
              {/* Subtle Connection Line */}
              {index < recentlyViewed.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-4 h-[1px] bg-slate-200 dark:bg-slate-800 group-hover:bg-blue-500/50 transition-colors duration-500" />
              )}
              
              <div 
                className="
                  relative z-10 transition-transform duration-300 active:scale-95 cursor-pointer transform scale-95 md:scale-100 origin-top
                  
                  /* HIDE TEXT ONLY ON MOBILE: Target common text elements inside AppCard */
                  max-md:[&_h3]:hidden 
                  max-md:[&_p]:hidden 
                  max-md:[&_span:not(.icon-span)]:hidden
                  
                  /* ADJUST GRID SPACING: Center icons on mobile when text is gone */
                  max-md:flex max-md:justify-center
                "
                onClick={() => setSelectedApp(app)}
              >
                <AppCard 
                  app={app} 
                  onClick={() => setSelectedApp(app)} 
                />
              </div>
            </div>
          ))}
        </div>

        {/* Thin Circuit Divider */}
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
        {/* Category Navigation */}
        <div className="relative">
          <div 
            className="
              /* Mobile: Horizontal scroll with exactly 3 rows */
              flex flex-col flex-wrap h-[145px] overflow-x-auto gap-2 pb-2 scrollbar-hide
              /* Desktop: Switch to standard multi-row wrapping */
              md:flex-row md:h-auto md:flex-wrap md:overflow-visible
            "
          >
            {sortedCategories.map((cat) => {
              const isActive = activeSubCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveSubCategory(cat)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-200 
                    cursor-pointer select-none whitespace-nowrap text-[11px] font-bold uppercase tracking-wider
                    ${isActive 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30' 
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-blue-500 hover:bg-white dark:hover:bg-slate-800'
                    }
                  `}
                >
                  {cat}
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${isActive ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-800'}`}>
                    {getCountByCategory(cat)}
                  </span>
                </button>
              );
            })}
          </div>
          
          {/* Mobile Right-side Fade (indicates horizontal scroll) */}
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white dark:from-[#0d1117] to-transparent pointer-events-none md:hidden" />
        </div>

        {/* App Grid */}
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
              <Counter value={apps.length} delay={3200} />
            </div>
            <div className="text-slate-400 dark:text-slate-600 transition-colors group-hover:text-blue-500">Total Stacks</div>
          </div>
          <div className="group relative text-center">
            <div className="text-slate-900 dark:text-white text-3xl mb-1 tabular-nums">
              <Counter value={categories.length} delay={3300} />
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
      
      <aside className={`fixed lg:relative z-50 h-full bg-slate-50 dark:bg-[#0b0e14] border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out 
        ${sidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'} 
        ${sidebarCollapsed ? 'lg:w-24' : 'lg:w-72'}`}
      >
        <div className="p-6 h-full flex flex-col">
          <div onClick={() => navigateTo('landing')} className={`flex items-center cursor-pointer transition-all duration-300 mb-10 ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center border-2 border-blue-600/20 rounded-lg bg-slate-50 dark:bg-slate-900 group">
              <div className="relative flex text-3xl font-black tracking-tighter select-none z-10 leading-none translate-y-[1px]">
                <span className="text-slate-900 dark:text-white group-hover:-translate-y-1 transition-transform duration-300">D</span>
                <span className="text-blue-600 group-hover:translate-y-1 transition-transform duration-300">N</span>
              </div>
            </div>         
            <span className={`font-black text-xl tracking-tighter hover:text-blue-600 transition-all duration-300 origin-left ${sidebarCollapsed ? 'w-0 opacity-0 scale-0 overflow-hidden' : 'w-auto opacity-100 scale-100'}`}>
              DOCKER NINJA
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
                onClick={() => { setCurrentView('about'); setSidebarOpen(false); }}
                className={`w-full flex items-center px-4 py-2 rounded-xl font-bold uppercase text-xs tracking-wider transition-all cursor-pointer ${currentView === 'about' ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'} ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
                {!sidebarCollapsed && <span>About</span>}
              </button>
              
              <button 
                onClick={() => { setCurrentView('Sponsoring'); setSidebarOpen(false); }}
                className={`w-full flex items-center px-4 py-2 rounded-xl font-bold uppercase text-xs tracking-wider transition-all cursor-pointer ${currentView === 'Sponsoring' ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'} ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}
              >
                <span className="w-4 h-4 flex items-center justify-center shrink-0">❤️</span>
                {!sidebarCollapsed && <span>Sponsoring</span>}
              </button>

              <a href="https://github.com/vukilis" target="_blank" className={`w-full flex items-center px-4 py-2 rounded-xl font-bold uppercase text-xs tracking-wider transition-all text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></svg>
                {!sidebarCollapsed && <span>GitHub</span>}
              </a>
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
        <header className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white/50 dark:bg-[#0d1117]/50 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="hidden lg:flex p-2 text-slate-500 hover:text-blue-600 transition-colors bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={sidebarCollapsed ? "rotate-180" : ""}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
            </button>
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-500"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg></button>
          </div>
          
          <div className="flex-1 max-w-xl mx-4">
            <SearchInput apps={apps} search={search} setSearch={setSearch} onAppSelect={handleAppSelect} />
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 shrink-0" />
        </header>

        <section ref={scrollContainerRef} className="flex-1 overflow-y-auto p-0 scroll-smooth">
          {currentView === 'about' ? (
            <AboutPage />
          ) : currentView === 'Sponsoring' ? (
            <Sponsoring />
          ) : (
            <div className="p-6 lg:p-10">
              <div className="max-w-10xl mx-auto">
                <AISuggestor onAppSelect={setSelectedApp} />
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
              allApps={apps} // Pass your full array of app objects here
              onAppChange={setSelectedApp} 
              onClose={() => setSelectedApp(null)} 
          />
      )}
    </div>
  );
}