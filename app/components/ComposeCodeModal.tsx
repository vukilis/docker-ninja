"use client";

import React, { useEffect, useRef } from "react";
import { CopyButton } from "./CopyButton";

interface CodeExpansionModalProps {
	isOpen: boolean;
	onClose: () => void;
	code: string;
	appName: string;
	filename: "compose.yml" | ".env";
}

export function CodeExpansionModal({ isOpen, onClose, code, appName, filename }: CodeExpansionModalProps) {
	const modalRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!isOpen) return;
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				e.preventDefault();
				e.stopPropagation();
				onClose();
			}
			if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
				e.stopPropagation();
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

	const isEnv = filename === ".env";
	const accentColor = isEnv ? "emerald" : "blue";

	return (
		<div
			className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-xl p-3 md:p-6 animate-in fade-in duration-200"
			onClick={onClose}
		>
			<div
				ref={modalRef}
				className="relative w-full max-w-6xl h-[92vh] max-h-[92vh] flex flex-col rounded-3xl border border-slate-300 dark:border-blue-900/50 bg-white dark:bg-[#0d1117] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
				onClick={(e) => e.stopPropagation()}
			>
				{/* HEADER */}
				<div className="flex items-center justify-between px-5 md:px-8 py-4 border-b border-slate-200 dark:border-slate-800/60 bg-slate-300/80 dark:bg-slate-900/60 backdrop-blur-md shrink-0 z-10">
					<div className="flex items-center gap-3 min-w-0">
						<div className={`h-1.5 w-6 rounded-full shrink-0 ${isEnv ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)] dark:bg-emerald-400 dark:shadow-[0_0_16px_rgba(52,211,153,0.6)]" : "bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.4)] dark:bg-blue-400 dark:shadow-[0_0_16px_rgba(96,165,250,0.6)]"}`} />
						<h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 font-mono truncate">
							{filename} — {appName}
						</h2>
					</div>
					<div className="flex items-center gap-2 shrink-0">
						<CopyButton text={code ?? ""} shouldTrack={!isEnv} />
						<button
							onClick={onClose}
							className="group flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 hover:border-red-500 dark:hover:border-red-800 bg-white dark:bg-slate-900 transition-all duration-300 cursor-pointer"
							aria-label="Close expanded code view"
						>
							<svg className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-red-500 dark:group-hover:text-red-400 group-hover:rotate-90 transition-all duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
								<line x1="18" y1="6" x2="6" y2="18" />
								<line x1="6" y1="6" x2="18" y2="18" />
							</svg>
						</button>
					</div>
				</div>

				{/* CODE BODY */}
				<div
					className="flex-1 overflow-auto p-5 md:p-8 bg-slate-50 dark:bg-slate-950/40"
					style={{ scrollbarGutter: "stable" }}
				>
					<pre className={`font-mono text-sm md:text-base whitespace-pre leading-relaxed select-text ${isEnv ? "text-emerald-700 dark:text-emerald-300" : "text-slate-800 dark:text-slate-200"}`}>
						{code ?? "Loading..."}
					</pre>
				</div>

				{/* FOOTER HINT */}
				<div className="px-5 md:px-8 py-3 border-t border-slate-200 dark:border-slate-800/60 bg-slate-300/80 dark:bg-slate-900/60 backdrop-blur-md shrink-0">
					<p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500/60 dark:text-slate-600 text-center select-none">
						[ ESC to Close ] • Scroll to explore
					</p>
				</div>
			</div>
		</div>
	);
}
