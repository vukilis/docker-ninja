interface PaginationProps {
    totalItems: number;
    itemsPerPage: number;
    currentPage: number;
    onPageChange: (page: number) => void;
}

export function Pagination({ totalItems, itemsPerPage, currentPage, onPageChange }: PaginationProps) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (totalPages <= 1) return null;

    const btnStyle = "px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed hover:border-blue-500 dark:hover:border-blue-500 cursor-pointer transition-all font-mono";

    return (
        <div className="flex items-center justify-center gap-2 mt-12 pb-10 select-none">
            {/* First Page Button (<<) */}
            <button 
                onClick={() => onPageChange(1)} 
                disabled={currentPage === 1} 
                className={`${btnStyle} group relative overflow-hidden active:scale-95 disabled:opacity-20`}
                title="Warp to Beginning"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-cyan-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <svg className="w-3.5 h-3.5 relative z-10 text-slate-400 group-hover:text-cyan-400 group-hover:drop-shadow-[0_0_6px_rgba(34,211,238,0.6)] transition-all duration-300" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
                </svg>
            </button>
            {/* Previous Button (<) */}
            <button 
                onClick={() => onPageChange(Math.max(currentPage - 1, 1))} 
                disabled={currentPage === 1} 
                className={`${btnStyle} group relative overflow-hidden active:scale-95 disabled:opacity-20`}
                title="Previous Sector"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <svg className="w-3.5 h-3.5 relative z-10 text-slate-400 group-hover:text-violet-400 group-hover:drop-shadow-[0_0_6px_rgba(167,139,250,0.6)] transition-all duration-300" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
            </button>
            {/* Page Numbers */}
            <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                const isActive = page === currentPage;
                return (
                    <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`w-9 h-9 flex items-center justify-center rounded-xl font-mono text-xs font-bold border transition-all duration-300 relative overflow-hidden active:scale-95 cursor-pointer select-none group ${
                        isActive
                        ? 'bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 border-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                        : 'bg-slate-100 dark:bg-slate-950/60 border-slate-300 dark:border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50'
                    }`}
                    >
                    {!isActive && (
                        <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    )}
                    
                    {isActive && (
                        <div className="absolute inset-0 bg-white/10 animate-pulse pointer-events-none" />
                    )}

                    <span className="relative z-10">{page}</span>
                    </button>
                );
                })}
            </div>

            {/* Next Button (>) */}
            <button 
                onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))} 
                disabled={currentPage === totalPages} 
                className={`${btnStyle} group relative overflow-hidden active:scale-95 disabled:opacity-20`}
                title="Next Sector"
            >
                <div className="absolute inset-0 bg-gradient-to-l from-violet-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <svg className="w-3.5 h-3.5 relative z-10 text-slate-400 group-hover:text-violet-400 group-hover:drop-shadow-[0_0_6px_rgba(167,139,250,0.6)] transition-all duration-300" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
            </button>
            {/* Last Page Button (>>) */}
            <button 
                onClick={() => onPageChange(totalPages)} 
                disabled={currentPage === totalPages} 
                className={`${btnStyle} group relative overflow-hidden active:scale-95 disabled:opacity-20`}
                title="Warp to Horizon"
            >
                <div className="absolute inset-0 bg-gradient-to-l from-violet-600/20 to-cyan-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <svg className="w-3.5 h-3.5 relative z-10 text-slate-400 group-hover:text-cyan-400 group-hover:drop-shadow-[0_0_6px_rgba(34,211,238,0.6)] transition-all duration-300" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" />
                </svg>
            </button>        
        </div>
    );
}