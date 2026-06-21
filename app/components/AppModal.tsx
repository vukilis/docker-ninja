import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchAppDetail, getComposeContent, getGlobalStats, toggleAppLike, checkHasDeviceLiked } from "../actions";
import SearchInput from "./SearchInput";
import { Counter } from "../utils/Counter";
import { getIcon } from "../hooks/icons";
import { getOrCreateDeviceUUID } from "../utils/Utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CopyButton } from "./CopyButton";
import { ExportButton } from "./ExportButton";
import { ShareButton } from "./ShareButton";
import { CodeExpansionModal } from "./ComposeCodeModal";
import { ReportButton } from "./ReportButton";
import { RequestButton } from "./RequestButton";
import { SurpriseButton } from "./SurpriseButton";
import { useAppsGlobal } from "../context/AppsContext";
import { useShortcutKeys } from "./useShortcutKeys";

// --- CONSTANTS ---
const GITHUB_NEW_ISSUE_URL = "https://github.com/vukilis/docker-ninja/issues/new";
const GITHUB_REQUEST_URL = "https://github.com/vukilis/docker-ninja/discussions/new?category=request-container";

// --- SHARED TYPES ---
export interface AppBase {
	id: string | number;
	slug: string;
	category: string;
	name: string;
	icon_url?: string;
	image?: string;
	description?: string;
	[key: string]: unknown;
}

export interface AppDetail extends AppBase {
	website?: string;
	github?: string;
	docs?: string;
	source?: string;
	run_command?: string;
	cli_update_command?: string;
	bash_command?: string;
	update_command?: string;
	env_file?: string;
	compose_url?: string;
	fallback_compose?: string;
	updated_at?: string;
	version?: string;
	[key: string]: unknown;
}

interface AppModalProps {
	app: AppBase;
	allApps: AppBase[];
	globalLikes?: Record<string, number>;
	onAppChange: (app: AppBase) => void;
	onClose: () => void;
	onLikeUpdate?: (slug: string, newCount: number) => void;
	setIsRequesting?: (val: boolean) => void;
	onRandom: () => void;
}

// --- OVERLAY COMPONENT ---
export function RequestSearchOverlay({ allApps, onClose, onAppSelect }: { allApps: AppBase[]; onClose: () => void; onAppSelect: (app: AppBase) => void }) {
	const [search, setSearch] = useState("");
	const searchRef = useRef<HTMLInputElement>(null);
	useShortcutKeys({ searchRef });

	useEffect(() => {
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
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [onClose]);

	const exactMatch = useMemo(
		() => {
			if (!search.trim()) return null;
			return allApps.find((a) => a.name.toLowerCase() === search.toLowerCase().trim());
		},
		[search, allApps]
	);

	return (
		<div
			className="fixed inset-0 z-[110] flex justify-center p-4 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-500"
			onClick={(e) => {
				e.stopPropagation();
				onClose();
			}}
		>
			<div
				className="relative w-full max-w-xl animate-in zoom-in-95 duration-300 px-2 mt-10 md:mt-50 h-[30vh]"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="text-center mb-10 select-none">
					<h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">Request App</h2>
					<p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">Verify availability in database</p>
				</div>

				<div className="relative">
					<div
						className={`absolute -inset-1 rounded-2xl blur-xl transition-all duration-700 opacity-20 ${
							search ? (exactMatch ? "bg-green-500" : "bg-amber-500") : "bg-blue-600"
						}`}
					/>
					<div
						className={`relative flex items-center gap-2 md:gap-4 p-2 bg-white dark:bg-slate-900 border-2 transition-all duration-500 rounded-2xl shadow-2xl ${
							search ? (exactMatch ? "border-green-500/50" : "border-amber-500/50") : "border-white/10"
						}`}
					>
						<div className="flex-1 min-w-0 [&_input]:border-none [&_input]:focus:ring-0 [&_div]:border-none">
							<SearchInput apps={allApps} search={search} setSearch={setSearch} onAppSelect={(app) => setSearch(app.name)} inputRef={searchRef as React.RefObject<HTMLInputElement>} />
						</div>

						<div className="flex items-center shrink-0 pr-1 md:pr-2">
							{search &&
								(exactMatch ? (
									<button
										onClick={(e) => {
											e.stopPropagation();
											onAppSelect(exactMatch);
											onClose();
										}}
										className="flex items-center justify-center gap-2 px-4 md:px-5 py-3 bg-green-600 hover:bg-green-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-green-900/40 cursor-pointer"
									>
										<span className="hidden md:inline">Open</span>
										<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
											<path d="M5 12h14M12 5l7 7-7 7" />
										</svg>
									</button>
								) : (
									<a
										href={`${GITHUB_REQUEST_URL}&title=Container request: ${search}`}
										target="_blank"
										rel="noopener noreferrer"
										onClick={(e) => e.stopPropagation()}
										className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 px-4 md:px-5 py-3 rounded-xl transition-all shadow-lg shadow-amber-900/40 hover:scale-105 active:scale-95 cursor-pointer"
									>
										<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
											<path d="M12 5v14M5 12h14" />
										</svg>
										<span className="text-[10px] hidden md:inline font-black text-white uppercase tracking-widest">Request</span>
									</a>
								))}
						</div>
					</div>
				</div>

				<div className="mt-8 flex justify-center gap-8 opacity-40 select-none">
					<div className="flex items-center gap-2">
						<div className="w-1.5 h-1.5 rounded-full bg-green-500" />
						<span className="text-[12px] font-black text-white uppercase tracking-widest">Available</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
						<span className="text-[12px] font-black text-white uppercase tracking-widest">Needs Request</span>
					</div>
				</div>

				<button
					onClick={(e) => {
						e.stopPropagation();
						onClose();
					}}
					className="mt-12 mx-auto block text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-[0.3em] transition-colors cursor-pointer"
				>
					[ ESC to Close ]
				</button>
			</div>
		</div>
	);
}

// --- EXTRACTED COMPONENTS ---
export const WarningNotice = ({ show, onClick, className = "", label }: { show: boolean; onClick: () => void; className?: string; label?: string }) => {
	const warningState = show
		? "border-orange-500 bg-orange-500 text-slate-200 dark:text-orange-500 dark:bg-orange-600/20"
		: "group md:border-slate-400 border-orange-500 dark:border-orange-500/20 md:dark:border-slate-500/20 text-orange-500 md:text-slate-500 hover:border-orange-500/50 md:dark:bg-slate-950/10 hover:bg-orange-500/5 hover:text-orange-500";

	return (
		<button
			onClick={onClick}
			className={`relative flex items-center justify-center w-10 h-10 rounded-full border transition-all cursor-pointer ${warningState} ${className}`}
			aria-label={show ? "Hide security notice" : "Show security notice"}
		>
		<svg className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
			<path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
		</svg>
		{label && <span className="hidden lg:inline whitespace-nowrap">{label}</span>}
	</button>
	);
};

const CloseButton = ({ onClick, className = "", children }: { onClick: () => void; className?: string; children?: React.ReactNode }) => (
	<button
		onClick={onClick}
		className={`group relative flex items-center justify-center w-10 h-10 rounded-full border transition-all duration-300 cursor-pointer ${className}`}
	>
		{children || (
			<svg className="w-4 h-4 text-slate-500 group-hover:text-red-500 group-hover:rotate-90 group-hover:scale-110 transition-all duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
				<line x1="18" y1="6" x2="6" y2="18" />
				<line x1="6" y1="6" x2="18" y2="18" />
			</svg>
		)}
	</button>
);

const TabButton = ({ isActive, onClick, children }: { isActive: boolean; onClick: () => void; children: React.ReactNode }) => (
	<button
		onClick={onClick}
		className={`px-2.5 py-0.5 text-[9px] md:text-[11px] font-black uppercase tracking-wider rounded border transition-all duration-200 font-sans ${
			isActive
				? "bg-blue-600 border-blue-600 text-white dark:bg-blue-500/20 dark:border-blue-500/40 dark:text-blue-400"
				: "bg-slate-100 border-slate-200 text-slate-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
		}`}
	>
		{children}
	</button>
);

export { TabButton };

const FormattingUtils = {
	formatCompactNumber: (number: number): string => {
		if (isNaN(number)) return "0";
		if (number < 1000) return number.toString();
		return new Intl.NumberFormat("en-US", {
			notation: "compact",
			maximumFractionDigits: 1,
		}).format(number);
	},

	formatVersion: (tag: string | undefined): string => {
		if (!tag) return "";
		return tag.replace(/^(version\/|v|release\/)/i, "");
	},
};

export { FormattingUtils };

// --- MODAL CONTENT COMPONENT ---
interface ModalContentProps {
	app: AppDetail;
	composeCode: string;
	loading: boolean;
	categoryApps: AppBase[];
	handlePrev: () => void;
	handleNext: () => void;
	onClose: () => void;
	stopPropagation: (e: React.SyntheticEvent) => void;
	setIsRequesting: (val: boolean) => void;
	onRandom: () => void;
	handleLikeToggle: (e: React.MouseEvent) => void;
	isLiked: boolean;
	likesCount: number;
	isSyncing: boolean;
	showExpandedCompose: boolean;
	setShowExpandedCompose: (val: boolean) => void;
	showEnvCode: boolean;
	setShowEnvCode: (val: boolean) => void;
}

function ModalContent({
	app,
	composeCode,
	loading,
	categoryApps,
	handlePrev,
	handleNext,
	onClose,
	stopPropagation,
	setIsRequesting,
	onRandom,
	handleLikeToggle,
	isLiked,
	likesCount,
	isSyncing,
	setShowEnvCode,
	setShowExpandedCompose,
}: ModalContentProps) {
	const [composeTab, setComposeTab] = useState<"run" | "update" | "env">("run");
	const [cliTab, setCliTab] = useState<"cli" | "update" | "bash">("cli");
	const [showWarning, setShowWarning] = useState(true);
	useEffect(() => {
		setShowWarning(localStorage.getItem("docker_ninja_warning") !== "true");
	}, []);

	if (!app) return null;

	const currentIndex = categoryApps.findIndex((a) => a.id === app.id) + 1;
	const totalApps = categoryApps.length;
	const icon = getIcon(app.slug, app.icon_url);

	const toggleWarning = () => {
		setShowWarning((prev) => {
			const nextState = !prev;
			localStorage.setItem("docker_ninja_warning", (!nextState).toString());
			return nextState;
		});
	};

	const runCommand = app.run_command?.replace(/\\\s*\n/g, "\\\n").trim() || "";
	const bashCommand = app.bash_command?.trim() || "";
	const updateCommand = app.update_command?.trim() || "";
	const cliUpdateCommand = app.cli_update_command?.trim() || "";
	const rawEnv = typeof app.env_file === "string" ? app.env_file : "";
	const envFile = rawEnv.trim();

	const getCopyText = () => {
		if (composeTab === "update" && updateCommand) return updateCommand;
		if (composeTab === "env" && envFile) return envFile;
		return "docker compose up -d";
	};

	const getCliText = () => {
		if (cliTab === "bash" && bashCommand) return bashCommand;
		if (cliTab === "update" && cliUpdateCommand) return cliUpdateCommand;
		return runCommand;
	};

	return (
		<div className="flex flex-col h-full">
			{/* HEADER */}
			<div className="flex flex-col md:flex-row md:justify-between md:items-center p-4 md:p-8 pb-4 border-b border-[#B7C7CD] dark:border-slate-800/50 z-30 dark:bg-[#0d1117] select-none gap-4">
                <div className="flex justify-between items-start md:block">
                    <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap max-w-full">
                            <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter truncate">
                                {app.name}
                            </h2>

                            {/* LIKE BUTTON */}
                            <button
                                onClick={handleLikeToggle}
                                className={`inline-flex items-center justify-center gap-1 transition-all duration-200 cursor-pointer select-none ${
                                    isLiked ? "text-rose-500" : "text-slate-500 dark:text-slate-400 hover:text-rose-500"
                                } ${isSyncing ? "opacity-80" : ""} ${isSyncing ? "" : "cursor-pointer"}`}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill={isLiked ? "currentColor" : "none"}
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className={`w-4 h-4 md:w-4.5 md:h-4.5 pb-0.5 shrink-0 transition-transform duration-300 ${
                                        isLiked ? "animate-in zoom-in-75 duration-200 scale-110" : "group-hover:scale-110"
                                    }`}
                                >
                                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                                </svg>
                                <span className="tabular-nums text-[14px] font-black leading-none inline-flex items-center">
                                    {likesCount !== null ? FormattingUtils.formatCompactNumber(likesCount) : ""}
                                </span>
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-1 w-8 bg-blue-600 rounded-full" />
                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em]">{app.category}</span>
                        </div>
                    </div>
                <div className="flex items-center gap-2 md:hidden">
                    <CloseButton onClick={onClose} className="border-red-700 dark:border-red-950">
                        <svg className="w-4 h-4 text-red-700 dark:text-red-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </CloseButton>
                </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-2 shrink-0">
                    <div className="flex items-center bg-slate-100 dark:bg-slate-900/50 rounded-full px-1 py-0.5 border border-slate-200 dark:border-blue-900/30">
                        <button
                            onClick={handlePrev}
                            className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-all text-slate-500 hover:text-blue-600 cursor-pointer"
                        >
                            <svg className="w-4 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                                <path d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div className="flex items-center justify-center min-w-[3.5rem] sm:pt-0.5 font-mono">
                            <span className="text-[12px] font-black text-slate-600 dark:text-slate-400 tabular-nums">
                                {currentIndex} <span className="text-slate-300 dark:text-slate-700 mx-0.5">/</span> {totalApps}
                            </span>
                        </div>
                        <button
                            onClick={handleNext}
                            className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-all text-slate-500 hover:text-blue-600 cursor-pointer"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                                <path d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <ReportButton
							href={`${GITHUB_NEW_ISSUE_URL}?template=issue-report.md&title=${encodeURIComponent(`[BUG] ${app.name}`)}&labels=bug`}>
						</ReportButton>

                        <WarningNotice show={showWarning} onClick={toggleWarning} />
						
                        <ShareButton app={app} shouldTrack={false} />

                        <Link
                            href={`/app/${app.slug}`}
                            className="group flex items-center justify-center gap-2 h-10 w-10 rounded-full border border-emerald-600 md:border-slate-400 dark:border-slate-800 hover:border-emerald-600 hover:dark:border-emerald-800 dark:bg-emerald-950/5 hover:dark:bg-emerald-950/20 hover:bg-emerald-200/20 md:bg-transparent dark:md:bg-transparent text-emerald-600 dark:text-emerald-600 md:text-slate-500 md:dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-300 backdrop-blur-sm transition-all duration-300 cursor-pointer"
                            title="Open full page"
                        >
                            <span className="hidden font-bold text-xs tracking-tight whitespace-nowrap">
                                Open full page
                            </span>
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="15" 
                                height="15" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2.5" 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                className="shrink-0 transition-transform duration-200 group-hover:scale-110"
                            >
                                <path d="M15 3h6v6" />
                                <path d="M10 14 21 3" />
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            </svg>
                        </Link>

                        <CloseButton onClick={onClose} className="hidden md:flex border-slate-400 dark:border-slate-800 hover:border-red-600 dark:hover:border-red-800" />
                    </div>
                </div>
            </div>

			{/* BODY */}
			<div className="overflow-y-auto p-4 md:p-8 flex-1">
				{showWarning && (
					<div className="mb-6 flex items-start justify-between gap-3 rounded-md border border-amber-200 bg-amber-50/50 p-4 text-xs md:text-sm text-amber-800 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-300 transition-all duration-300">
						<div className="flex items-start gap-3">
							<svg
								className="h-5 w-5 shrink-0 text-orange-500 dark:text-orange-400 mt-0.5"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth="2.5"
								stroke="currentColor"
							>
								<path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
							</svg>
							<div>
								<span className="font-bold uppercase tracking-wide text-orange-900 dark:text-orange-400 block mb-0.5">Be Aware:</span>
								<span>Don't blindly run commands. Always inspect the code, understand what it does, and verify it fits your environment before executing.</span>
							</div>
						</div>
					</div>
				)}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-slate-900 dark:text-slate-200">
					<div className="space-y-4 text-xs md:text-sm">
						<div className="relative overflow-hidden rounded-2xl border border-slate-200/50 bg-white/70 p-5 shadow-xl shadow-slate-200/50 backdrop-blur-xl transition-all dark:border-slate-800/50 dark:bg-slate-950/40 dark:shadow-none sm:p-6">
							<div className="absolute top-4 right-4 w-24 h-24 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0 bg-slate-200 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/60 p-3">
								{icon?.type === "url" && icon.src ? (
									<Image
										src={icon.src}
										alt={app.name}
										width={96}
										height={96}
										unoptimized
										className="w-full h-full object-contain filter dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]"
									/>
								) : icon?.svg ? (
									<div dangerouslySetInnerHTML={{ __html: icon.svg }} className="w-full h-full fill-slate-400 dark:fill-slate-500" />
								) : (
									<span className="text-sm font-bold text-slate-400">{app.name.charAt(0)}</span>
								)}
							</div>
							<div className="w-full">
								{/* Flex container holding the blue glowing bar right before the heading text */}
								<div className="flex items-center gap-3 mb-2">
									<div className="h-1.5 w-6 rounded-full bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.4)] dark:bg-orange-400 dark:shadow-[0_0_16px_rgba(251,146,60,0.6)]" />
									<h3 className="font-bold text-slate-500 dark:text-slate-400 uppercase text-xs font-black tracking-widest">
										App Details
									</h3>
								</div>
								
								<div className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
									{app.website && (
										<p className="flex items-center gap-1.5">
											<span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Website:</span>{" "}
											<a href={app.website} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline">
												Link
												<svg 
													xmlns="http://www.w3.org/2000/svg" 
													width="13" 
													height="13" 
													viewBox="0 0 24 24" 
													fill="none" 
													stroke="currentColor" 
													strokeWidth="2.5" 
													strokeLinecap="round" 
													strokeLinejoin="round" 
													className="shrink-0 transition-transform duration-200 group-hover:scale-110 opacity-80"
												>
													<path d="M15 3h6v6" />
													<path d="M10 14 21 3" />
													<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
												</svg>
											</a>
										</p>
									)}

									{app.github && (
										<p className="flex items-center gap-1.5">
											<span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Github:</span>{" "}
											<a href={app.github} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline">
												Repo
												<svg 
													xmlns="http://www.w3.org/2000/svg" 
													width="13" 
													height="13" 
													viewBox="0 0 24 24" 
													fill="none" 
													stroke="currentColor" 
													strokeWidth="2.5" 
													strokeLinecap="round" 
													strokeLinejoin="round" 
													className="shrink-0 transition-transform duration-200 group-hover:scale-110 opacity-80"
												>
													<path d="M15 3h6v6" />
													<path d="M10 14 21 3" />
													<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
												</svg>
											</a>
										</p>
									)}

									{app.docs && (
										<p className="flex items-center gap-1.5">
											<span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Docs:</span>{" "}
											<a href={app.docs} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline">
												Link
												<svg 
													xmlns="http://www.w3.org/2000/svg" 
													width="13" 
													height="13" 
													viewBox="0 0 24 24" 
													fill="none" 
													stroke="currentColor" 
													strokeWidth="2.5" 
													strokeLinecap="round" 
													strokeLinejoin="round" 
													className="shrink-0 transition-transform duration-200 group-hover:scale-110 opacity-80"
												>
													<path d="M15 3h6v6" />
													<path d="M10 14 21 3" />
													<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
												</svg>
											</a>
										</p>
									)}

									{app.source && (
										<p className="flex items-center gap-1.5">
											<span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Docker Hub:</span>{" "}
											<a href={app.source} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline">
												Link
												<svg 
													xmlns="http://www.w3.org/2000/svg" 
													width="13" 
													height="13" 
													viewBox="0 0 24 24" 
													fill="none" 
													stroke="currentColor" 
													strokeWidth="2.5" 
													strokeLinecap="round" 
													strokeLinejoin="round" 
													className="shrink-0 transition-transform duration-200 group-hover:scale-110 opacity-80"
												>
													<path d="M15 3h6v6" />
													<path d="M10 14 21 3" />
													<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
												</svg>
											</a>
										</p>
									)}
									<div className="py-2.5">
										<div className="h-[2px] w-2/3 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-transparent dark:from-cyan-400 dark:via-blue-600 opacity-80 shadow-[0_0_8px_rgba(34,211,238,0.3)]" />
									</div>
									{app.version && (
										<p>
											<span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Version: </span>
											<span className="font-semibold text-green-700 dark:text-green-300">{FormattingUtils.formatVersion(app.version)}</span>
										</p>
									)}
									{app.updated_at && (
										<p>
											<span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Last Changed:</span> <span className="font-semibold text-green-700 dark:text-green-300">
												{new Date(app.updated_at).toLocaleDateString(undefined, {
													year: "numeric",
													month: "short",
													day: "numeric",
												})}
											</span>
										</p>
									)}
									<p>
										<span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Category:</span> <span className="font-semibold text-slate-700 dark:text-slate-300">{app.category}</span>
									</p>
								</div>
							</div>
						</div>
						<div className="relative overflow-hidden rounded-2xl border border-slate-200/50 bg-white/70 p-5 shadow-xl shadow-slate-200/50 backdrop-blur-xl transition-all dark:border-slate-800/50 dark:bg-slate-950/40 dark:shadow-none sm:p-6">
							<div className="flex items-center gap-3 mb-2">
								<div className="h-1.5 w-6 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(211,52,110,0.4)] dark:bg-pink-400 dark:shadow-[0_0_16px_rgba(211,52,110,0.6)]" />
								<h3 className="font-bold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-widest font-black">
									About
								</h3>
							</div>
							<p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
								{app.description || "No description."}
							</p>
						</div>
					</div>

					<div className="flex flex-col gap-4 min-h-[300px]">
							{/* Compose Command */}
							<div className="relative overflow-hidden rounded-2xl border border-slate-200/50 bg-white/70 p-5 shadow-xl shadow-slate-200/50 backdrop-blur-xl transition-all dark:border-slate-800/50 dark:bg-slate-950/40 dark:shadow-none sm:p-6 flex flex-col gap-5 max-h-[700px]">
								<div className="flex items-center justify-between gap-4 shrink-0">
									<div className="flex items-center gap-3">
										<div className="h-1.5 w-6 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.4)] dark:bg-blue-400 dark:shadow-[0_0_16px_rgba(96,165,250,0.6)]" />
										<h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 font-mono">
											compose.yml
										</h2>
									</div>
									<div className="flex items-center gap-1.5">
										<ExportButton text={composeCode ?? ""} shouldTrack={true} />
										<CopyButton text={composeCode ?? ""} shouldTrack={true} />
									</div>
								</div>

								<div onTouchStart={stopPropagation} className="group relative flex-1 min-h-[180px] max-h-[300px] overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800/80 dark:bg-slate-900/40">
									<button
										onClick={() => setShowExpandedCompose(true)}
										className="absolute top-3 right-3 z-10 inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5 text-gray-600 dark:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
										aria-label="Expand compose code in full screen"
									>
										<svg 
											xmlns="http://www.w3.org/2000/svg" 
											fill="none" 
											viewBox="0 0 24 24" 
											strokeWidth={2.5} 
											stroke="currentColor" 
											className="h-4 w-4"
										>
											<path 
												strokeLinecap="round" 
												strokeLinejoin="round" 
												d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" 
											/>
										</svg>
									</button>
									<pre className="font-mono text-xs text-slate-700 dark:text-slate-300 whitespace-pre leading-relaxed select-text">
										{composeCode ?? "Loading..."}
									</pre>
								</div>

								<div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-900">
									<div className="flex justify-between items-center gap-4">
										<div className="inline-flex items-center p-0.5 rounded-lg gap-1">
											{envFile && (
												<TabButton isActive={composeTab === "env"} onClick={() => setComposeTab("env")}>
													.env
												</TabButton>
											)}
											<TabButton isActive={composeTab === "run"} onClick={() => setComposeTab("run")}>
												Run
											</TabButton>
											{updateCommand && (
												<TabButton isActive={composeTab === "update"} onClick={() => setComposeTab("update")}>
													Update
												</TabButton>
											)}
										</div>
										<div className="flex items-center gap-1">
											{composeTab === "env" && envFile && <ExportButton text={envFile} filename=".env" shouldTrack={false} />}
											<CopyButton text={getCopyText()} shouldTrack={false} />
										</div>
									</div>

									<div
										onTouchStart={stopPropagation}
										className="max-h-[160px] overflow-auto bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl text-xs text-slate-700 dark:text-blue-300 border border-slate-200 dark:border-slate-800/80 whitespace-pre font-mono leading-relaxed select-text"
									>
										{composeTab === "update" && updateCommand ? (
											<div className="space-y-1">
												{updateCommand.split("\n").map((line, idx) => (
													<div key={idx} className="flex gap-2">
														<span className="text-blue-800 dark:text-blue-300 select-none">$</span>
														<span className="text-blue-800 dark:text-blue-300">{line}</span>
													</div>
												))}
											</div>
										) : composeTab === "env" && envFile ? (
											<div className="group relative">
												<button
													onClick={() => setShowEnvCode(true)}
													className="absolute -top-2 -right-2 z-10 inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1 text-gray-600 dark:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
													aria-label="Expand .env code in full screen"
												>
													<svg 
														xmlns="http://www.w3.org/2000/svg" 
														fill="none" 
														viewBox="0 0 24 24" 
														strokeWidth={2.5} 
														stroke="currentColor" 
														className="h-4 w-4"
													>
														<path 
															strokeLinecap="round" 
															strokeLinejoin="round" 
															d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" 
														/>
													</svg>
												</button>
												<div className="text-emerald-700 dark:text-emerald-400">{envFile}</div>
											</div>
										) : (
											<div className="flex gap-2">
												<span className="text-blue-800 dark:text-blue-300 select-none">$</span>
												<span className="text-blue-800 dark:text-blue-300">docker compose up -d</span>
											</div>
										)}
									</div>
								</div>
							</div>

							{/* Docker CLI Section */}
							{runCommand && (
								<div className="relative overflow-hidden rounded-2xl border border-slate-200/50 bg-white/70 p-5 shadow-xl shadow-slate-200/50 backdrop-blur-xl transition-all dark:border-slate-800/50 dark:bg-slate-950/40 dark:shadow-none sm:p-6 flex flex-col gap-5">
									<div className="flex items-center gap-3 shrink-0">
										<div className="h-1.5 w-6 rounded-full bg-sky-500 shadow-[0_0_12px_rgba(14,165,233,0.4)] dark:bg-sky-400 dark:shadow-[0_0_16px_rgba(56,189,248,0.6)]" />
										<h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 font-mono">
											Docker CLI
										</h2>
									</div>
									<div className="space-y-3">
										<div className="flex justify-between items-center gap-4">
											<div className="inline-flex items-center p-0.5 rounded-lg gap-1">
												{bashCommand && (
													<TabButton isActive={cliTab === "bash"} onClick={() => setCliTab("bash")}>
														Bash
													</TabButton>
												)}
												<TabButton isActive={cliTab === "cli"} onClick={() => setCliTab("cli")}>
													Docker CLI
												</TabButton>
												{cliUpdateCommand && (
													<TabButton isActive={cliTab === "update"} onClick={() => setCliTab("update")}>
														Update
													</TabButton>
												)}
											</div>
											<div className="flex items-center">
												<CopyButton text={getCliText()} shouldTrack={false} />
											</div>
										</div>
										<div 
											onTouchStart={stopPropagation}
											className="max-h-[200px] overflow-auto bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl text-xs text-slate-700 dark:text-blue-300 border border-slate-200 dark:border-slate-800/80 font-mono leading-relaxed select-text"
										>
											<div className="flex gap-2 items-start">
												<span className="text-blue-800 dark:text-blue-300 select-none">$</span>
												<span className="text-blue-800 dark:text-blue-300 break-all whitespace-pre">
													{getCliText()}
												</span>
											</div>
										</div>
									</div>
								</div>
							)}


						<div className="flex items-center justify-end gap-3 w-full">
							<SurpriseButton onClick={() => onRandom()} className="md:w-auto md:min-w-[140px] gap-2 md:px-4 py-3 md:py-4 text-[8px] md:text-[10px]">
								<span className="hidden lg:inline tracking-[0.2em] whitespace-nowrap font-sans">Surprise</span>
							</SurpriseButton>

							<ReportButton
								href={`${GITHUB_NEW_ISSUE_URL}?template=issue-report.md&title=${encodeURIComponent(`[BUG] ${app.name}`)}&labels=bug`}
								className="md:w-auto md:min-w-[140px] gap-2 md:px-4 py-3 md:py-4 text-[8px] md:text-[10px]">
								<span className="hidden lg:inline tracking-[0.2em] whitespace-nowrap font-sans">Report</span>
							</ReportButton>

							<RequestButton
								onClick={() => setIsRequesting(true)}
								className="md:w-auto md:min-w-[140px] gap-2 md:px-4 py-3 md:py-4 text-[8px] md:text-[10px]">
								<span className="hidden lg:inline tracking-[0.2em] whitespace-nowrap font-sans">Request</span>
							</RequestButton>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

// --- MAIN EXPORT ---
export function AppModal({ app, allApps, onAppChange, onClose, onRandom }: AppModalProps) {
	const { detailsCache, composeCache, setDetailsCache, setComposeCache, likedStatusCache, setLikedStatusCache, globalLikes, setGlobalLikes } = useAppsGlobal();
	const queryClient = useQueryClient();

	const details = detailsCache[app?.slug] ?? {};
	const composeCode = composeCache[app?.slug] ?? "Loading...";
	const [loading, setLoading] = useState(!detailsCache[app?.slug]);
	const [isRequesting, setIsRequesting] = useState(false);
	const [showExpandedCompose, setShowExpandedCompose] = useState(false);
	const [showEnvCode, setShowEnvCode] = useState(false);

	const [dragOffset, setDragOffset] = useState(0);
	const [isDragging, setIsDragging] = useState(false);
	const [status, setStatus] = useState<"idle" | "exiting" | "entry-ready" | "entering">("idle");
	const [swipeDir, setSwipeDir] = useState<"left" | "right" | null>(null);

	const SWIPE_ANIM_MS = 160;

	const touchStartPos = useRef({ x: 0, y: 0 });
	const isScrolling = useRef(false);
	const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

	const categoryApps = useMemo(() => allApps.filter((a) => a.category === app.category), [allApps, app.category]);
	const currentIndex = categoryApps.findIndex((a) => a.id === app.id);
	const nextApp = categoryApps[(currentIndex + 1) % categoryApps.length];
	const prevApp = categoryApps[(currentIndex - 1 + categoryApps.length) % categoryApps.length];

	const likeQueryKey = ["like-status", app.slug];
	const likeStatusQuery = useQuery({
		queryKey: likeQueryKey,
		queryFn: async () => {
			const browserUuid = getOrCreateDeviceUUID();
			const hasLiked = await checkHasDeviceLiked(app.slug, browserUuid);
			return hasLiked;
		},
		enabled: !!app.slug && likedStatusCache[app.slug] === undefined,
		staleTime: 1000 * 60 * 5,
	});

	const isLiked = likedStatusCache[app.slug] ?? likeStatusQuery.data ?? false;
	const [isSyncing, setIsSyncing] = useState(false);
	const likesCount = globalLikes[app.slug] ?? 0;

	const likeMutation = useMutation({
		mutationFn: async ({ appSlug, liked, deviceUuid }: { appSlug: string; liked: boolean; deviceUuid: string }) => {
			const total = await toggleAppLike(appSlug, liked, deviceUuid);
			if (total === -1) throw new Error("Failed to toggle like");
			return total;
		},
		onMutate: async ({ appSlug, liked }) => {
			await queryClient.cancelQueries({ queryKey: likeQueryKey });
			const previousLiked = likedStatusCache[appSlug] ?? likeStatusQuery.data ?? false;
			setLikedStatusCache((prev) => ({ ...prev, [appSlug]: liked }));
			setGlobalLikes((prev) => {
				const current = prev[appSlug] ?? 0;
				return { ...prev, [appSlug]: liked ? current + 1 : Math.max(0, current - 1) };
			});
			return { previousLiked };
		},
		onError: (_err, _vars, context) => {
			if (context?.previousLiked !== undefined) {
				setLikedStatusCache((prev) => ({ ...prev, [app.slug]: context.previousLiked }));
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: likeQueryKey });
		},
	});

	const handleLikeToggle = async (e: React.MouseEvent) => {
		e.stopPropagation();
		if (isSyncing || likeMutation.isPending) return;
		const browserUuid = getOrCreateDeviceUUID();
		const futureLikedState = !isLiked;
		setIsSyncing(true);
		await likeMutation.mutateAsync({ appSlug: app.slug, liked: futureLikedState, deviceUuid: browserUuid });
		setIsSyncing(false);
	};

	const navigate = useCallback(
		(exitDir: "left" | "right", entryDir: "left" | "right", targetApp: AppBase) => {
			if (status !== "idle") return;
			if (!isMobile) {
				onAppChange(targetApp);
				return;
			}
			setSwipeDir(exitDir);
			setStatus("exiting");

			setTimeout(() => {
				setSwipeDir(entryDir);
				onAppChange(targetApp);
				setStatus("entering");
			}, SWIPE_ANIM_MS);

			setTimeout(() => {
				setStatus("idle");
				setSwipeDir(null);
				setDragOffset(0);
			}, SWIPE_ANIM_MS * 2 + 50);
		},
		[status, isMobile, onAppChange]
	);

	const handleNext = useCallback(() => navigate("right", "right", nextApp), [nextApp, navigate]);
	const handlePrev = useCallback(() => navigate("left", "left", prevApp), [prevApp, navigate]);

	const handleTouchStart = (e: React.TouchEvent) => {
		touchStartPos.current = { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY };
		setIsDragging(true);
		isScrolling.current = false;
	};
	const handleTouchMove = (e: React.TouchEvent) => {
		if (!isDragging || isScrolling.current) return;
		const deltaX = e.targetTouches[0].clientX - touchStartPos.current.x;
		const deltaY = e.targetTouches[0].clientY - touchStartPos.current.y;
		if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 5) {
			isScrolling.current = true;
			setDragOffset(0);
			return;
		}
		if (Math.abs(deltaX) > 10) {
			if (e.cancelable) e.preventDefault();
			setDragOffset(deltaX);
		}
	};
	const handleTouchEnd = () => {
		setIsDragging(false);
		if (!isScrolling.current) {
			const threshold = window.innerWidth / 3;
			if (dragOffset > threshold) handleNext();
			else if (dragOffset < -threshold) handlePrev();
		}
		setDragOffset(0);
	};

	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			if (isRequesting) return;
			if (event.key === "ArrowRight") handleNext();
			else if (event.key === "ArrowLeft") handlePrev();
			else if (event.key === "Escape") onClose();
		},
		[handleNext, handlePrev, onClose, isRequesting]
	);

	useEffect(() => {
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [handleKeyDown]);

	const composeQueryKey = ["compose", app.slug];
	const detailsQueryKey = ["appDetail", app.slug];
	const composeQuery = useQuery({
		queryKey: composeQueryKey,
		queryFn: () => getComposeContent(app.slug),
		enabled: !!app.slug,
		staleTime: 1000 * 60 * 5,
	});
	const detailsQuery = useQuery({
		queryKey: detailsQueryKey,
		queryFn: () => fetchAppDetail(app.slug),
		enabled: !!app.slug,
		staleTime: 1000 * 60 * 5,
	});

	useEffect(() => {
		if (!app?.slug) return;
		const yamlCode = composeQuery.data;
		const fullDetails = detailsQuery.data;
		if (yamlCode && !composeCache[app.slug]) {
			setComposeCache((prev) => ({ ...prev, [app.slug]: yamlCode }));
		}
		if (fullDetails && !detailsCache[app.slug]) {
			setDetailsCache((prev) => ({ ...prev, [app.slug]: fullDetails }));
		}
		if (composeQuery.isLoading || detailsQuery.isLoading) {
			setLoading(true);
		} else {
			setLoading(false);
		}
	}, [app?.slug, composeQuery.data, detailsQuery.data, composeCache, detailsCache, setComposeCache, setDetailsCache]);

	const displayApp = useMemo(() => ({ ...app, ...details }), [app, details]);

	const stopPropagation = (e: React.SyntheticEvent) => e.stopPropagation();

	const getTransform = useCallback(() => {
		if (!isMobile) return "none";
		if (isDragging) return `translateX(${dragOffset}px) scale(1)`;
		if (status === "exiting") return swipeDir === "right" ? "translateX(100%)" : "translateX(-100%)";
		if (status === "entering") return swipeDir === "right" ? "translateX(-100%)" : "translateX(100%)";
		return "translateX(0)";
	}, [isMobile, isDragging, dragOffset, status, swipeDir]);

	useEffect(() => {
		if (!app?.slug) return;
		if (likedStatusCache[app.slug] !== undefined) {
			return;
		}

		async function fetchStatus() {
			const browserUuid = getOrCreateDeviceUUID();
			const hasLikedBefore = await checkHasDeviceLiked(app.slug, browserUuid);
			setLikedStatusCache((prev) => ({ ...prev, [app.slug]: hasLikedBefore }));
		}
		fetchStatus();
	}, [app.slug]);

	return (
		<div
			className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-2 md:p-4 overflow-hidden"
			onClick={onClose}
		>
			<div
				className="my-custom-background dark:bg-[#0d1117] border border-slate-300 dark:border-blue-900/50 w-full max-w-5xl h-[90vh] max-h-[90vh] font-mono shadow-2xl flex flex-col rounded-2xl relative overflow-auto"
				onClick={stopPropagation}
				onTouchStart={handleTouchStart}
				onTouchMove={handleTouchMove}
				onTouchEnd={handleTouchEnd}
				style={{
					transform: getTransform(),
					scrollbarGutter: "stable",
					opacity: isMobile && status === "entering" ? 0 : 1,
					transition: isMobile && !isDragging && status !== "entering" ? "transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.2s" : "none",
				}}
			>
				<ModalContent
					app={displayApp as AppDetail}
					composeCode={composeQuery.data ?? composeCode}
					loading={composeQuery.isLoading || detailsQuery.isLoading}
					categoryApps={categoryApps}
					handlePrev={handlePrev}
					handleNext={handleNext}
					onClose={onClose}
					stopPropagation={stopPropagation}
					setIsRequesting={setIsRequesting}
					onRandom={onRandom}
					handleLikeToggle={handleLikeToggle}
					isLiked={isLiked}
					likesCount={likesCount}
					isSyncing={isSyncing}
					showExpandedCompose={showExpandedCompose}
					setShowExpandedCompose={setShowExpandedCompose}
					showEnvCode={showEnvCode}
					setShowEnvCode={setShowEnvCode}
				/>
				<CodeExpansionModal
					isOpen={showExpandedCompose}
					onClose={() => setShowExpandedCompose(false)}
					code={composeQuery.data ?? composeCode}
					appName={displayApp.name}
					filename="compose.yml"
				/>
				<CodeExpansionModal
					isOpen={showEnvCode}
					onClose={() => setShowEnvCode(false)}
					code={typeof detailsQuery.data?.env_file === "string" ? detailsQuery.data.env_file : ""}
					appName={displayApp.name}
					filename=".env"
				/>
				{isRequesting && <RequestSearchOverlay allApps={allApps} onClose={() => setIsRequesting(false)} onAppSelect={onAppChange} />}
			</div>
		</div>
	);
}

export function DeployedCounter() {
	const { data: stats, isLoading} = useQuery({
		queryKey: ["global-stats"],
		queryFn: getGlobalStats,
		staleTime: 0,
		gcTime: 0,
	});

	if (isLoading) return <div>...</div>;

	return (
		<div>
			<div className="relative flex items-center justify-center text-blue-600 text-3xl mb-1 font-black text-center">
				<span>
					<Counter value={stats || 0} />
				</span>
			</div>
			<div className="text-slate-400 dark:text-slate-600 transition-colors group-hover:text-blue-500">Deployed</div>
		</div>
	);
}
