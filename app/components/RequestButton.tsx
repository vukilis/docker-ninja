'use client';

interface RequestButtonProps {
	onClick: () => void;
	className?: string;
	children?: React.ReactNode;
}

export function RequestButton({ onClick, className = "", children }: RequestButtonProps) {
	return (
		<button
			onClick={onClick}
			className={`group flex items-center justify-center w-10 h-10 gap-2 text-[8px] font-black uppercase tracking-[0.15em] transition-all duration-500 overflow-hidden rounded-full border border-amber-600 dark:border-amber-600/30 hover:border-amber-500/60 bg-amber-100 dark:bg-amber-950/5 backdrop-blur-sm cursor-pointer ${className}`}
		>
			<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-600/15 via-transparent to-transparent" />
			<div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent" />
			<div className="relative flex items-center justify-center gap-2 text-slate-500 dark:text-amber-400 group-hover:text-yellow-900 dark:group-hover:text-yellow-400 transition-colors duration-300">
				<div className="flex items-center justify-center shrink-0 relative z-10">
					<div className="relative w-5 h-5 flex items-center justify-center shrink-0 text-slate-500 dark:text-amber-400 group-hover:text-yellow-900 dark:group-hover:text-yellow-400 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
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
				{children}
			</div>
		</button>
	);
}
