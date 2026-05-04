"use client";
import { useState, useEffect } from 'react';
import { useApps } from './hooks/useApps';
import { getIcon } from './hooks/icons';
import './style/globals.css';
import { getComposeFile } from './actions';
import Link from 'next/link';
import { useTheme } from 'next-themes';

const AppModal = ({ app, onClose }: { app: any; onClose: () => void }) => {
  const [composeCode, setComposeCode] = useState("Loading...");
  const [copiedYaml, setCopiedYaml] = useState(false);
  const [copiedComposeCmd, setCopiedComposeCmd] = useState(false);
  const [copiedRunCmd, setCopiedRunCmd] = useState(false);

  useEffect(() => {
    getComposeFile(app.id).then(setComposeCode);
  }, [app.id]);

  const copyToClipboard = (text: string, setCopied: (val: boolean) => void) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      // Manual fallback
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
        {/* Header */}
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl md:text-2xl text-blue-600 dark:text-blue-400 uppercase tracking-widest truncate">{app.name}</h2>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-red-500 cursor-pointer">✕</button>
        </div>

        {/* Body */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 text-slate-900 dark:text-slate-200">
          {/* Info Section (Right in desktop, Top in mobile) */}
          <div className="space-y-4 overflow-y-auto text-xs md:text-sm">
            {/* App & Script Details Container */}
            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-green-900/30 p-4 rounded-md transition-colors">
              <h3 className="text-slate-500 uppercase text-xs mb-2">App Details</h3>
              <div className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                <p>Version: <span className="text-blue-600 dark:text-green-300 font-semibold">{app.version}</span></p>
                <p>Website: <a href={app.website} target="_blank" className="text-blue-600 dark:text-blue-400 hover:underline">Link</a></p>
                <p>Docs: <a href={app.docs} target="_blank" className="text-blue-600 dark:text-blue-400 hover:underline">Link</a></p>
                <p>GitHub: <a href={app.github} target="_blank" className="text-blue-600 dark:text-blue-400 hover:underline">Repo</a></p>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <h3 className="text-slate-500 uppercase text-xs mb-2">Script Details</h3>
                <div className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                  <p>Category: <span className="text-blue-600 dark:text-green-300 font-semibold">{app.category}</span></p>
                  <p>Source code: <a href={app.source} target="_blank" className="text-blue-600 dark:text-blue-400 hover:underline">View</a></p>
                  <p>Last change: <span className="text-blue-600 dark:text-green-300 font-semibold">{app.lastChange}</span></p>
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-green-900/30 p-4 rounded-md transition-colors">
              <h3 className="text-blue-600 dark:text-green-500 uppercase text-xs mb-2 tracking-widest font-mono">About</h3>
              <p className="text-sm text-slate-700 dark:text-gray-300 leading-relaxed font-sans">
                {app.description || "No description provided."}
              </p>
            </div>
          </div>

          {/* Left Side: Code */}
          <div className="flex flex-col gap-4 overflow-hidden min-h-[300px]">
            {/* YAML Snippet */}
            <div className="bg-white dark:bg-black border border-slate-200 dark:border-slate-800 p-3 md:p-4 flex flex-col flex-1 overflow-hidden transition-colors">
              <h3 className="text-blue-600 dark:text-blue-400 mb-2 font-bold flex justify-between text-[10px] md:text-xs uppercase tracking-widest shrink-0">
                docker-compose.yml 
                <button 
                  onClick={() => copyToClipboard(composeCode, setCopiedYaml)} 
                  className={`ml-2 transition-colors ${copiedYaml ? 'text-green-600 dark:text-green-500' : 'text-slate-500 hover:text-green-500'}`}
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

            {/* Code Snippets */}
            <div className="bg-white dark:bg-black border border-slate-200 dark:border-slate-800 p-3 md:p-4 shrink-0 space-y-4 transition-colors">
              <div className="text-[10px] md:text-xs">
                <h3 className="text-blue-600 dark:text-blue-400 mb-1 font-bold flex justify-between uppercase">Compose Command
                  <button onClick={() => copyToClipboard("docker compose up -d", setCopiedComposeCmd)} className={copiedComposeCmd ? 'text-green-600 dark:text-green-500' : 'text-slate-500'}>
                    {copiedComposeCmd ? "[COPIED!]" : "[COPY]"}
                  </button>
                </h3>
                <div className="bg-slate-100 dark:bg-[#0d1117] p-2 rounded font-mono text-slate-800 dark:text-blue-300 border border-slate-200 dark:border-blue-900/50 overflow-x-auto whitespace-nowrap">$ docker compose up -d</div>
              </div>
              
              <div className="text-[10px] md:text-xs">
                <h3 className="text-blue-600 dark:text-blue-400 mb-1 font-bold flex justify-between uppercase">Docker Run
                  <button onClick={() => copyToClipboard(app.runCommand || `docker run -d --name ${app.id}`, setCopiedRunCmd)} className={copiedRunCmd ? 'text-green-600 dark:text-green-500' : 'text-slate-500'}>
                    {copiedRunCmd ? "[COPIED!]" : "[COPY]"}
                  </button>
                </h3>
                <div className="bg-slate-100 dark:bg-[#0d1117] p-2 rounded font-mono text-slate-800 dark:text-blue-300 border border-slate-200 dark:border-blue-900/50 overflow-x-auto whitespace-nowrap">$ {app.runCommand || `docker run -d --name ${app.id}`}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const modes = [
    { name: 'light', icon: '☀️' },
    { name: 'dark', icon: '🌙' },
    { name: 'system', icon: '💻' }
  ];

  return (
    <div className="flex w-full p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
      {modes.map((mode) => (
        <button
          key={mode.name}
          onClick={() => setTheme(mode.name)}
          className={`
            flex-1 py-2 rounded-md text-xs font-mono uppercase transition-all duration-300 cursor-pointer
            ${theme === mode.name 
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' 
              : 'text-slate-400 hover:text-blue-500'}
          `}
        >
          {mode.icon}
        </button>
      ))}
    </div>
  );
};

export default function Home() {
  const { filteredApps, categories, search, setSearch, selectedCategory, setSelectedCategory, apps, getCountByCategory } = useApps();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // State to manage which category is active when in Categories mode
  const [activeSubCategory, setActiveSubCategory] = useState<string | null>(null);

  // Set default active category when entering Categories mode
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (selectedCategory === "ShowCategories" && !activeSubCategory) {
      const firstCat = categories.find(c => c !== "All");
      if (firstCat) setActiveSubCategory(firstCat);
    }
  }, [selectedCategory, categories, activeSubCategory]);

  if (!mounted) return null;

  const renderContent = () => {
    if (selectedCategory !== "ShowCategories") {
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {filteredApps.map((app) => {
            const icon = getIcon(app.id, app.iconUrl); 
            
            return (
              <div 
                key={app.id} 
                className="ninja-card group p-4 border border-gray-800 hover:border-green-900 cursor-pointer transition-all" 
                onClick={() => setSelectedApp(app)}
              >
                {/* Dynamic rendering based on icon type */}
                {icon?.type === 'url' ? (
                  <img 
                    src={icon.src} 
                    alt={app.name} 
                    className="w-16 h-16 mx-auto group-hover:scale-110 transition-transform object-contain" 
                  />
                ) : icon?.svg ? (
                  <div 
                    className="w-16 h-16 mx-auto fill-blue-500 group-hover:fill-white transition-colors" 
                    dangerouslySetInnerHTML={{ __html: icon.svg }} 
                  />
                ) : (
                  <div className="w-16 h-16 mx-auto bg-gray-800 flex items-center justify-center text-[10px] text-gray-500 font-mono">
                    NO ICON
                  </div>
                )}
                
                <p className="text-center mt-4 text-sm text-blue-300 font-mono truncate">{app.name}</p>
              </div>
            );
          })}
        </div>
      );
    }

    {/* Show Category Browser (Top Nav + App Grid) */}
    return (
      <div className="space-y-6">
        <div className="flex gap-4 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
          {categories.filter(c => c !== "All").map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveSubCategory(cat)}
              className={`px-4 py-2 text-sm font-mono uppercase whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${activeSubCategory === cat ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-blue-500'}`}
            >
              {cat}
              <span className="text-[10px] bg-slate-200 dark:bg-slate-900 px-1.5 rounded">{getCountByCategory(cat)}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {apps.filter(a => a.category === activeSubCategory).map((app) => {
            const icon = getIcon(app.id, app.iconUrl); 
            
            return (
              <div 
                key={app.id} 
                className="ninja-card group p-4 border border-slate-200 dark:border-slate-800 hover:border-blue-500 transition-all cursor-pointer" 
                onClick={() => setSelectedApp(app)}
              >
                {/* Unified Icon Rendering Logic */}
                {icon?.type === 'url' ? (
                  <img 
                    src={icon.src} 
                    alt={app.name} 
                    className="w-16 h-16 mx-auto group-hover:scale-110 transition-transform object-contain" 
                  />
                ) : icon?.svg ? (
                  <div 
                    className="w-16 h-16 mx-auto fill-blue-600 dark:fill-blue-400 group-hover:fill-slate-900 dark:group-hover:fill-white transition-colors" 
                    dangerouslySetInnerHTML={{ __html: icon.svg }} 
                  />
                ) : (
                  <div className="w-16 h-16 mx-auto bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] text-slate-500 font-mono">
                    NO ICON
                  </div>
                )}
                <p className="text-center mt-4 text-sm text-slate-900 dark:text-blue-300 font-mono truncate">{app.name}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <main className="relative flex flex-col h-screen bg-white dark:bg-[#0d1117] text-slate-900 dark:text-slate-200 overflow-hidden transition-colors duration-300">      
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1117] shrink-0 h-16 z-20">
        <button onClick={() => setSidebarOpen(true)} className="cursor-pointer text-blue-600 dark:text-blue-400">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
        </button>
        
        <div className="relative flex-1 mx-4 max-w-md">
          <input 
            type="text" 
            placeholder="Search Docker..." 
            value={search}
            className="w-full p-2 pr-8 bg-slate-100 dark:bg-black border border-slate-300 dark:border-slate-700 text-sm focus:border-blue-500 outline-none" 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
        
        <Link href="/" onClick={() => { setSelectedCategory("All"); setActiveSubCategory(null); }} className="font-bold text-blue-600 dark:text-blue-400 text-xl">DN</Link>
      </header>

      {/* Main Page Content */}
      <section className="flex-1 p-6 md:p-15 overflow-y-auto">
        <div className="mb-4">
          <h1 className="font-mono text-3xl font-bold text-blue-300 uppercase tracking-widest text-center">
            Docker Ninja
          </h1>
          <p className="font-mono text-[10px] md:text-xs mt-4 tracking-widest uppercase border-t border-b border-gray-900 py-2">
            {selectedCategory === "ShowCategories" ? (
              <span className="text-gray-400">
                SELECT A CATEGORY TO BROWSE 
                <span className="text-blue-500 ml-2 font-bold">[{categories.filter(c => c !== "All").length} TOTAL]</span>
              </span>
            ) : (
              <span className="text-gray-500">
                VIEWING: <span className="text-blue-400 font-bold">{selectedCategory.toUpperCase()}</span> 
                <span className="text-gray-700 mx-2">|</span>
                <span className="text-blue-500 font-bold">{filteredApps.length}</span> APPS 
                {selectedCategory !== "All" && (
                  <>
                    <span className="text-gray-700 mx-2">|</span>
                    <span className="text-blue-800 font-bold">{getCountByCategory(selectedCategory)}</span> LOCAL
                  </>
                )}
              </span>
            )}
          </p>
        </div>
        {renderContent()}
      </section>

      {/* Sidebar Overlay */}
      <div className={`fixed inset-0 z-50 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <aside className="relative w-64 h-full bg-white dark:bg-[#0d1117] border-r border-slate-200 dark:border-slate-800 transition-transform flex flex-col">
          <nav className="p-6 flex-1 space-y-4">
            {/* "All" Button */}
            <button 
              onClick={() => { setSelectedCategory("All"); setSidebarOpen(false); }} 
              className={`flex items-center justify-between w-full text-sm font-mono uppercase cursor-pointer ${selectedCategory === "All" ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-blue-500'}`}
            >
              All
              <span className="text-[10px] bg-slate-200 dark:bg-slate-900 px-1.5 rounded">{apps.length}</span>
            </button>
            
            {/* "Categories" Button */}
            <button 
              onClick={() => { setSelectedCategory("ShowCategories"); setSidebarOpen(false); }} 
              className={`flex items-center justify-between w-full text-sm font-mono uppercase cursor-pointer ${selectedCategory === "ShowCategories" ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-blue-500'}`}
            >
              Categories
              <span className="text-[10px] bg-slate-200 dark:bg-slate-900 px-1.5 rounded">{categories.filter(c => c !== "All").length}</span>
            </button>
            
            {/* Links */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
              <a href="#" className="block text-sm font-mono text-slate-500 hover:text-blue-500">About</a>
              <a href="https://github.com/vukilis" target="_blank" className="block text-sm font-mono text-slate-500 hover:text-blue-500">GitHub</a>
              <a href="#" className="block text-sm font-mono text-slate-500 hover:text-blue-500">Sponzoring</a>
            </div>
          </nav>

          {/* Theme Toggle Button */}
          <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1117]">
            <div className="flex w-full gap-2">
              <ThemeSwitcher />
            </div>
          </div>
        </aside>
      </div>

      {selectedApp && <AppModal app={selectedApp} onClose={() => setSelectedApp(null)} />}
    </main>
  );
}