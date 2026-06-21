'use client';

interface SurpriseButtonProps {
	onClick: () => void;
	className?: string;
	children?: React.ReactNode;
}

export function SurpriseButton({ onClick, className = "", children }: SurpriseButtonProps) {
	return (
		<button
			onClick={onClick}
			className={`relative group flex items-center justify-center w-10 h-10 md:w-auto md:min-w-[140px] gap-2 md:px-4 py-3 md:py-4 text-[8px] md:text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-500 overflow-hidden rounded-full border border-emerald-600 dark:border-emerald-600/30 hover:border-emerald-500/60 bg-emerald-100 dark:bg-emerald-950/5 backdrop-blur-sm cursor-pointer ${className}`}
		>
			<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-600/20 via-green-900/5 to-transparent" />
			<div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent" />
			<div className="relative flex items-center justify-center gap-2 text-slate-500 dark:text-emerald-400 group-hover:text-emerald-900 dark:group-hover:text-emerald-300 transition-colors duration-300">
				<div className="relative shrink-0 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]">
						<path d="m15 5 4 4" />
						<path d="M11 9 2 18l4 4 9-9" />
						<path className="animate-pulse" d="M15 1l.5 1.5L17 3l-1.5.5L15 5l-.5-1.5L13 3l1.5-.5L15 1z" />
						<path className="animate-pulse delay-75" d="M22 10l.5 1.5L24 12l-1.5.5L22 14l-.5-1.5L20 12l1.5-.5L22 10z" />
					</svg>
				</div>
				{children}
			</div>
		</button>
	);
}
