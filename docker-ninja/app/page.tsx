"use client";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTheme } from 'next-themes';
import { getIcon } from './hooks/icons';
import { getComposeContent } from '../app/actions';
import { useApps } from './hooks/useApps';
import './style/globals.css';
import Link from 'next/link';

// MODAL COMPONENT
const AppModal = ({ app, onClose }: { app: any; onClose: () => void }) => {
  const [composeCode, setComposeCode] = useState("Loading...");
  const [copiedYaml, setCopiedYaml] = useState(false);
  const [copiedComposeCmd, setCopiedComposeCmd] = useState(false);
  const [copiedRunCmd, setCopiedRunCmd] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getComposeContent(app)
      .then((data) => {
        setComposeCode(data);
        setLoading(false);
      })
      .catch(() => {
        setComposeCode("Error loading configuration.");
        setLoading(false);
      });
  }, [app]);

  const copyToClipboard = (text: string, setCopied: (val: boolean) => void) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 md:p-4" onClick={onClose}>
      <div 
        className="overflow-y-auto bg-white dark:bg-[#0d1117] border border-slate-300 dark:border-blue-900 w-full max-w-5xl max-h-[90vh] p-4 md:p-8 font-mono shadow-2xl flex flex-col" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl md:text-2xl text-blue-600 dark:text-blue-400 uppercase tracking-widest truncate">{app.name}</h2>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-red-500 cursor-pointer">✕</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 text-slate-900 dark:text-slate-200">
          <div className="space-y-4 overflow-y-auto text-xs md:text-sm">
            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-green-900/30 p-4 rounded-md transition-colors">
              <h3 className="text-slate-500 uppercase text-xs mb-2">App Details</h3>
              <div className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                <p>Website: <a href={app.website} target="_blank" className="text-blue-600 dark:text-blue-400 hover:underline">Link</a></p>
                <p>Docs: <a href={app.docs} target="_blank" className="text-blue-600 dark:text-blue-400 hover:underline">Link</a></p>
                <p>GitHub: <a href={app.github} target="_blank" className="text-blue-600 dark:text-blue-400 hover:underline">Repo</a></p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <h3 className="text-slate-500 uppercase text-xs mb-2">Script Details</h3>
                <div className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                  <p>Category: <span className="text-blue-600 dark:text-green-300 font-semibold">{app.category}</span></p>
                  <p>Source code: <a href={app.source} target="_blank" className="text-blue-600 dark:text-blue-400 hover:underline">View</a></p>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-green-900/30 p-4 rounded-md transition-colors">
              <h3 className="text-blue-600 dark:text-green-500 uppercase text-xs mb-2 tracking-widest font-mono">About</h3>
              <p className="text-sm text-slate-700 dark:text-gray-300 leading-relaxed font-sans">
                {app.description || "No description provided."}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-4 overflow-hidden min-h-[300px]">
            <div className="bg-white dark:bg-black border border-slate-200 dark:border-slate-800 p-3 md:p-4 flex flex-col flex-1 overflow-hidden transition-colors">
              <h3 className="text-blue-600 dark:text-blue-400 mb-2 font-bold flex justify-between text-[10px] md:text-xs uppercase tracking-widest shrink-0">
                docker-compose.yml 
                <button 
                  onClick={() => copyToClipboard(composeCode, setCopiedYaml)} 
                  className={`ml-2 transition-colors cursor-pointer ${copiedYaml ? 'text-green-600 dark:text-green-500' : 'text-slate-500 hover:text-green-500'}`}
                >
                  {copiedYaml ? "[COPIED!]" : "[COPY]"}
                </button>
              </h3>
              <div className="flex-1 overflow-auto bg-slate-50 dark:bg-[#0d1117] rounded p-2">
                <pre className="text-[10px] md:text-xs text-slate-700 dark:text-slate-300 whitespace-pre font-mono">
                  {composeCode}
                </pre>
              </div>
            </div>
            <div className="bg-white dark:bg-black border border-slate-200 dark:border-slate-800 p-3 md:p-4 shrink-0 space-y-4 transition-colors">
              <div className="text-[10px] md:text-xs">
                <h3 className="text-blue-600 dark:text-blue-400 mb-1 font-bold flex justify-between uppercase">Compose Command
                  <button onClick={() => copyToClipboard("docker compose up -d", setCopiedComposeCmd)} className={`cursor-pointer transition-colors ${copiedComposeCmd ? 'text-green-600 dark:text-green-500' : 'text-slate-500 hover:text-green-500'}`}>
                    {copiedComposeCmd ? "[COPIED!]" : "[COPY]"}
                  </button>
                </h3>
                <div className="bg-slate-100 dark:bg-[#0d1117] p-2 rounded font-mono text-slate-800 dark:text-blue-300 border border-slate-200 dark:border-blue-900/50 overflow-x-auto whitespace-nowrap">$ docker compose up -d</div>
              </div>
              <div className="text-[10px] md:text-xs">
                <h3 className="text-blue-600 dark:text-blue-400 mb-1 font-bold flex justify-between uppercase">Docker Run
                  <button onClick={() => copyToClipboard(app.run_command || `docker run -d --name ${app.slug}`, setCopiedRunCmd)} className={`cursor-pointer transition-colors ${copiedRunCmd ? 'text-green-600 dark:text-green-500' : 'text-slate-500 hover:text-green-500'}`}>
                    {copiedRunCmd ? "[COPIED!]" : "[COPY]"}
                  </button>
                </h3>
                <div className="bg-slate-100 dark:bg-[#0d1117] p-2 rounded font-mono text-slate-800 dark:text-blue-300 border border-slate-200 dark:border-blue-900/50 overflow-x-auto whitespace-nowrap">$ {app.run_command || `docker run -d --name ${app.slug}`}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// CARD COMPONENT
const AppCard = ({ app, onClick }: { app: any; onClick: () => void }) => {
  const icon = getIcon(app.slug, app.icon_url);
  return (
    <div 
      onClick={onClick} 
      className="group aspect-square max-w-[160px] mx-auto w-full bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-all hover:shadow-2xl hover:shadow-blue-500/10"
    >
      <div className="w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-transform">
        {icon?.type === 'url' ? (
          <img src={icon.src} alt={app.name} className="w-full h-full object-contain" />
        ) : icon?.svg ? (
          <div dangerouslySetInnerHTML={{ __html: icon.svg }} className="w-full h-full fill-slate-400 group-hover:fill-blue-500 transition-colors" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[8px] text-slate-500 border border-dashed border-slate-700 rounded uppercase">No Icon</div>
        )}
      </div>
      <p className="mt-3 text-[14px] leading-tight uppercase tracking-tighter text-slate-400 group-hover:text-blue-500 font-bold transition-colors text-center w-full px-1 line-clamp-2 overflow-hidden">
        {app.name}
      </p>
    </div>
  );
};

// THEME SWITCHER
const ThemeSwitcher = ({ collapsed }: { collapsed?: boolean }) => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  const modes = [{ name: 'light', icon: '☀️' }, { name: 'dark', icon: '🌙' }, { name: 'system', icon: '💻' }];
  return (
    <div className={`flex w-full p-1 bg-slate-100 dark:bg-slate-900 border rounded-xl border-slate-200 dark:border-slate-700 ${collapsed ? 'flex-col' : 'flex-row'}`}>
      {modes.map((mode) => (
        <button
          key={mode.name}
          onClick={() => setTheme(mode.name)}
          title={collapsed ? mode.name : ""}
          className={`flex-1 py-2 rounded-md text-xs font-mono uppercase transition-all duration-300 cursor-pointer ${theme === mode.name ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-400 hover:text-blue-500'}`}
        >
          {mode.icon}
        </button>
      ))}
    </div>
  );
};

{/* Updated Helper Component with Session Intelligence */}
const Counter = ({ value, delay = 0 }) => {
  const [count, setCount] = React.useState(0);
  React.useEffect(() => {
    // Check if the preloader has already finished in this session
    const isFirstLoad = !window.__dn_preloader_finished;
    const actualDelay = isFirstLoad ? delay : 100;

    let timer;
    const startTimeout = setTimeout(() => {
      window.__dn_preloader_finished = true;

      let start = 0;
      const end = parseInt(value);
      if (isNaN(end) || end <= 0) {
        setCount(value);
        return;
      }

      const totalMiliseconds = 800;
      const incrementTime = Math.max(totalMiliseconds / end, 10);

      timer = setInterval(() => {
        start += 1;
        setCount(start);
        if (start >= end) {
          clearInterval(timer);
        }
      }, incrementTime);
    }, actualDelay);

    return () => {
      clearTimeout(startTimeout);
      if (timer) clearInterval(timer);
    };
  }, [value, delay]);

  return <>{count}</>;
};

// MAIN DASHBOARD
export default function Home() {
  const { 
    filteredApps, categories, search, setSearch, 
    selectedCategory, setSelectedCategory, apps, getCountByCategory 
  } = useApps();

  const [isStarted, setIsStarted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile Drawer
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Desktop Toggle
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [activeSubCategory, setActiveSubCategory] = useState<string | null>(null);

  const navigateTo = (path: 'landing' | 'dashboard') => {
    setSidebarOpen(false);
    if (path === 'landing') setIsStarted(false);
    else setIsStarted(true);
  };
  
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollContainerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (selectedCategory === "ShowCategories" && !activeSubCategory) {
      const firstCat = categories.find(c => c !== "All" && c !== "ShowCategories");
      if (firstCat) setActiveSubCategory(firstCat);
    }
  }, [selectedCategory, categories, activeSubCategory]);

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
  }, [isStarted]);

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
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
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
          {categories.filter(c => c !== "All" && c !== "ShowCategories").map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveSubCategory(cat)}
              className={`px-5 py-2.5 text-[12px] font-sans font-bold uppercase tracking-wider whitespace-nowrap border rounded-xl transition-all flex items-center gap-3 cursor-pointer ${activeSubCategory === cat ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-blue-500'}`}
            >
              {cat}
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono ${activeSubCategory === cat ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                {getCountByCategory(cat)}
              </span>
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
          {categoryApps.map((app) => (
            <AppCard key={app.id} app={app} onClick={() => setSelectedApp(app)} />
          ))}
        </div>
      </div>
    );
  };

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0d1117] flex flex-col items-center justify-center p-6 transition-colors duration-700">
        <div className="max-w-4xl w-full text-center space-y-8">
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
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed tracking-tight transition-colors duration-500">
              Master your <span className="relative inline-block text-slate-900 dark:text-white font-bold group-hover:text-blue-600 transition-colors duration-300">
                containerization universe
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-600/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </span> with official <span className="italic font-serif text-blue-500/80">compose</span> stacks for any application, <span className="relative inline-block text-slate-900 dark:text-white font-bold group-hover:text-blue-600 transition-colors duration-300">all in one place
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-600/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </span>
            </p>
            
            {/* Subtle accent underline */}
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
                <svg 
                  className="w-6 h-6 transform transition-transform duration-300 group-hover:translate-x-2" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="3" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
              
              {/* Animated Sweep Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            </button>
            
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-500 animate-pulse">
              Explore the Infinite Stack
            </p>
          </div>

          <style jsx>{`
            @keyframes shimmer {
              100% {
                transform: translateX(100%);
              }
            }
          `}</style>
        </div>
        <div className="mt-20 flex flex-wrap justify-center gap-12 lg:gap-20 uppercase text-[10px] font-black tracking-[0.3em]">
          {/* Apps Counter */}
          <div className="group relative text-center">
            <div className="text-slate-900 dark:text-white text-3xl mb-1 tabular-nums animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <Counter value={apps.length} delay={3200} />
            </div>
            <div className="text-slate-400 dark:text-slate-600 transition-colors group-hover:text-blue-500">Total Stacks</div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-500" />
          </div>

          {/* Categories Counter */}
          <div className="group relative text-center">
            <div className="text-slate-900 dark:text-white text-3xl mb-1 tabular-nums animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-100">
              <Counter value={categories.length - 2} delay={3300} />
            </div>
            <div className="text-slate-400 dark:text-slate-600 transition-colors group-hover:text-blue-500">Categories</div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-500" />
          </div>

          {/* Status / Uptime */}
          <div className="group relative text-center">
            <div className="relative flex items-center justify-center text-blue-600 text-3xl mb-1 font-black animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
              <span className="relative">
                ONLINE
                <span className="absolute -top-1 -right-4 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
              </span>
            </div>
            <div className="text-slate-400 dark:text-slate-600 transition-colors group-hover:text-blue-500">Systems Ready</div>
            
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 bg-blue-600/10 blur-2xl rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white dark:bg-[#0d1117] text-slate-900 dark:text-slate-100 transition-colors">
      {/* Mobile Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />}
      
      {/* Sidebar with Desktop Toggle Logic */}
      <aside className={`fixed lg:relative z-50 h-full bg-slate-50 dark:bg-[#0b0e14] border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out 
        ${sidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'} 
        ${sidebarCollapsed ? 'lg:w-24' : 'lg:w-72'}`}
      >
        <div className="p-6 h-full flex flex-col">
          {/* Logo Section responding to Collapse */}
          <div onClick={() => navigateTo('landing')} className={`flex items-center cursor-pointer transition-all duration-300 mb-10 ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center border-2 border-blue-600/20 rounded-lg bg-slate-50 dark:bg-slate-900 group">
              <div className="relative flex text-3xl font-black tracking-tighter select-none z-10 leading-none translate-y-[1px]">
                <span className="text-slate-900 dark:text-white group-hover:-translate-y-1 transition-transform duration-300">
                  D
                </span>
                <span className="text-blue-600 group-hover:translate-y-1 transition-transform duration-300">
                  N
                </span>
              </div>
              <div className="absolute inset-0 bg-blue-600/5 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>         
            <span className={`font-black text-xl tracking-tighter hover:text-blue-600 transition-all duration-300 origin-left ${sidebarCollapsed ? 'w-0 opacity-0 scale-0 overflow-hidden' : 'w-auto opacity-100 scale-100'}`}>
              DOCKER NINJA
            </span>
          </div>
          
          <nav className="flex-1 flex flex-col h-full space-y-2 overflow-y-auto scrollbar-hide">
            <button 
              onClick={() => { setSelectedCategory("All"); setSidebarOpen(false); }}
              title={sidebarCollapsed ? "All Applications" : ""}
              className={`w-full flex items-center px-4 py-3 rounded-xl font-bold uppercase text-xs tracking-wider transition-all cursor-pointer ${sidebarCollapsed ? 'justify-center' : 'justify-between'} ${selectedCategory === "All" ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
            >
              <div className={`flex items-center ${sidebarCollapsed ? '' : 'gap-3'}`}>
                <svg 
                  className="w-4 h-4 shrink-0" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
                {!sidebarCollapsed && <span>All Applications</span>}
              </div>
              {!sidebarCollapsed && (
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono ${selectedCategory === "All" ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  {apps.length}
                </span>
              )}
            </button>

            <button 
              onClick={() => { setSelectedCategory("ShowCategories"); setSidebarOpen(false); }}
              title={sidebarCollapsed ? "Categories" : ""}
              className={`w-full flex items-center px-4 py-3 rounded-xl font-bold uppercase text-xs tracking-wider transition-all cursor-pointer ${sidebarCollapsed ? 'justify-center' : 'justify-between'} ${selectedCategory === "ShowCategories" ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
            >
              <div className={`flex items-center ${sidebarCollapsed ? '' : 'gap-3'}`}>
                <svg 
                  className="w-4 h-4 shrink-0" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
                {!sidebarCollapsed && <span>Categories</span>}
              </div>
              {!sidebarCollapsed && (
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono ${selectedCategory === "ShowCategories" ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  {categories.length - 2}
                </span>
              )}
            </button>

            <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <a 
                href="#" 
                className={`w-full flex items-center px-4 py-2 rounded-xl font-bold uppercase text-xs tracking-wider transition-all text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}
                title={sidebarCollapsed ? "About" : ""}
              >
                <svg 
                  className="w-4 h-4 shrink-0" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
                {!sidebarCollapsed && <span>About</span>}
              </a>

              <a 
                href="https://github.com/vukilis" 
                target="_blank" 
                className={`w-full flex items-center px-4 py-2 rounded-xl font-bold uppercase text-xs tracking-wider transition-all text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}
                title={sidebarCollapsed ? "GitHub" : ""}
              >
                <svg 
                  className="w-4 h-4 shrink-0" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                </svg>
                {!sidebarCollapsed && <span>GitHub</span>}
              </a>

              <a 
                href="#" 
                className={`w-full flex items-center px-4 py-2 rounded-xl font-bold uppercase text-xs tracking-wider transition-all text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}
                title={sidebarCollapsed ? "Sponsoring" : ""}
              >
                <span className="w-4 h-4 flex items-center justify-center shrink-0">❤️</span>
                {!sidebarCollapsed && <span>Sponsoring</span>}
              </a>
            </div>

            <div className="flex-1" />
            
            <div className="pt-8 mt-auto border-b border-slate-200 dark:border-slate-800 pb-6">
              <button 
                onClick={() => navigateTo('landing')} 
                className="group relative w-full flex items-center justify-center gap-3 px-4 py-4 rounded-2xl cursor-pointer bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/10 to-blue-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                <svg 
                  className="w-3 h-3 transform group-hover:-translate-x-1 transition-transform duration-300 flex-shrink-0" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="3"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <span className={`relative z-10 transition-all duration-300 ${sidebarCollapsed ? 'w-0 opacity-0 overflow-hidden hidden' : 'w-auto opacity-100'}`}>Back to Landing</span>
                <div className="absolute inset-0 border border-blue-500/0 group-hover:border-blue-500/30 rounded-2xl transition-colors duration-300" />
              </button>
            </div>
          </nav>
          <div className="pt-6"><ThemeSwitcher collapsed={sidebarCollapsed} /></div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white/50 dark:bg-[#0d1117]/50 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            {/* Desktop Panel Toggle */}
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)} 
              className="hidden lg:flex p-2 text-slate-500 hover:text-blue-600 transition-colors bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer"
              title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={sidebarCollapsed ? "rotate-180 transition-transform" : "transition-transform"}>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="3" x2="9" y2="21"></line>
              </svg>
            </button>

            {/* Mobile Menu Toggle */}
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-500">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
          </div>
          
          <div className="flex-1 max-w-xl mx-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search stacks..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-xl px-10 py-2.5 text-sm focus:ring-2 ring-blue-500 transition-all outline-none"
              />
              <svg className="absolute left-3 top-3 text-slate-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
              <div className="hidden md:block h-8 w-[1px] bg-slate-200 dark:border-slate-800 mx-2" />
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600" />
          </div>
        </header>

        <section ref={scrollContainerRef} className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth">
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black tracking-tight mb-2">
                {selectedCategory === "ShowCategories" ? "Explore Categories" : "Explore Containers"}
              </h2>
              <div className="h-1 w-12 bg-blue-600 rounded-full" />
            </div>
          </div>
          {renderDashboard()}
        </section>

        {/* Scroll to Top Button */}
        <button
          onClick={scrollToTop}
          className={`fixed bottom-8 right-8 z-[60] flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-xl shadow-2xl shadow-blue-500/40 hover:bg-blue-700 hover:-translate-y-1 transition-all duration-300 cursor-pointer ${
            showScrollTop ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
          }`}
          title="Scroll to top"
        >
          <svg 
            width="24" height="24" viewBox="0 0 24 24" fill="none" 
            stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="M18 15l-6-6-6 6"/>
          </svg>
        </button>
      </main>

      {selectedApp && <AppModal app={selectedApp} onClose={() => setSelectedApp(null)} />}
    </div>
  );
}