"use client";

import { useEffect, useRef } from "react";
import AnalyticsUmami from '../components/AnalyticsUmami';

interface AnalyticsModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function AnalyticsModal({ isOpen, onClose }: AnalyticsModalProps) {
	const modalRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!isOpen) return;
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				e.preventDefault();
				e.stopPropagation();
				onClose();
			}
		};
		window.addEventListener("keydown", handleKeyDown, true);
		document.body.style.overflow = "hidden";
		return () => {
			window.removeEventListener("keydown", handleKeyDown, true);
			document.body.style.overflow = "unset";
		};
	}, [isOpen, onClose]);

	useEffect(() => {
		if (isOpen && modalRef.current) {
			modalRef.current.scrollTop = 0;
		}
	}, [isOpen]);

	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-xl px-2 py-3 md:p-6 animate-in fade-in duration-200"
			onClick={onClose}
		>
			<div
				ref={modalRef}
				className="relative w-full max-w-6xl h-full max-h-[92vh] flex flex-col rounded-3xl border border-slate-300 dark:border-blue-900/50 bg-white dark:bg-[#0d1117] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
				onClick={(e) => e.stopPropagation()}
			>
				{/* HEADER */}
				<div className="flex items-center justify-between px-5 md:px-8 py-4 border-b border-slate-200 dark:border-slate-800/60 bg-slate-300/80 dark:bg-slate-900/60 backdrop-blur-md shrink-0 z-10">
					<div className="flex items-center gap-3 min-w-0">
						<div className="h-1.5 w-6 rounded-full shrink-0 bg-green-500 shadow-[0_0_12px_rgba(244,114,182,0.6] dark:bg-green-400 dark:shadow-[0_0_16px_rgba(244,114,182,0.6]" />
						<h2 className="text-[9px] md:text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 font-mono truncate">
							analytics — platform traffic
						</h2>
					</div>
					<div className="flex items-center gap-2 shrink-0">
						<button
							onClick={onClose}
							className="group flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 hover:border-red-500 dark:hover:border-red-800 bg-white dark:bg-slate-900 transition-all duration-300 cursor-pointer"
							aria-label="Close analytics view"
						>
							<svg className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-red-500 dark:group-hover:text-red-400 group-hover:rotate-90 transition-all duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
								<line x1="18" y1="6" x2="6" y2="18" />
								<line x1="6" y1="6" x2="18" y2="18" />
							</svg>
						</button>
					</div>
				</div>

				{/* IFRAME BODY */}
				<div className="flex-1 overflow-hidden bg-slate-50 dark:bg-slate-950/40">
					<AnalyticsUmami />
				</div>

				{/* FOOTER HINT */}
				<div className="px-5 md:px-8 py-3 border-t border-slate-200 dark:border-slate-800/60 bg-slate-300/80 dark:bg-slate-900/60 backdrop-blur-md shrink-0">
					<p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500/60 dark:text-slate-600 text-center select-none">
						[ ESC to Close ]
					</p>
				</div>
			</div>
		</div>
	);
}