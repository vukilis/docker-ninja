'use client';

interface ReportButtonProps {
	href: string;
	className?: string;
	children?: React.ReactNode;
}

export function ReportButton({ href, className = "", children }: ReportButtonProps) {
	return (
		<a
			href={href}
			target="_blank"
			rel="noreferrer"
			className={`relative group flex items-center justify-center w-10 h-10 text-[8px] font-black uppercase tracking-[0.15em] transition-all duration-500 overflow-hidden rounded-full border border-purple-600 dark:border-purple-600/30 hover:border-purple-500/60 bg-purple-100 dark:bg-purple-950/5 backdrop-blur-sm ${className}`}
		>
			<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-600/20 via-fuchsia-900/5 to-transparent" />
			<div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-purple-400/10 to-transparent" />
			<div className="relative flex items-center justify-center gap-2 text-slate-500 dark:text-purple-400 group-hover:text-fuchsia-900 dark:group-hover:text-fuchsia-400 transition-colors duration-300">
				<div className="relative shrink-0 transition-transform duration-500 group-hover:rotate-12">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_5px_rgba(168,85,247,0.5)] transition-transform group-hover:scale-110">
						<rect width="8" height="14" x="8" y="6" rx="4" />
						<path d="m19 7-3 2" />
						<path d="m5 7 3 2" />
						<path d="m19 19-3-2" />
						<path d="m5 19 3-2" />
						<path d="M20 13h-4" />
						<path d="M4 13h4" />
						<path d="m10 4 1 2" />
						<path d="m14 4-1 2" />
					</svg>
					<span className="absolute -top-1 -right-1 flex h-2 w-2 opacity-0 group-hover:opacity-100 transition-opacity">
						<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75"></span>
						<span className="relative inline-flex rounded-full h-1 w-1 bg-fuchsia-300"></span>
					</span>
				</div>
				{children}
			</div>
			<div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-[inset_0_0_15px_rgba(168,85,247,0.15)]" />
		</a>
	);
}
