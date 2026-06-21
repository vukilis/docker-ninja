'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { fetchAllApps, fetchAppDetail, getComposeContent, toggleAppLike, checkHasDeviceLiked } from "../../actions";
import { getIcon } from "../../hooks/icons";
import { getOrCreateDeviceUUID } from "../../utils/Utils";
import { useAppsGlobal } from "../../context/AppsContext";
import { CopyButton } from "../../components/CopyButton";
import { ExportButton } from "../../components/ExportButton";
import { ShareButton } from "../../components/ShareButton";
import { TabButton, FormattingUtils, AppBase, AppDetail, RequestSearchOverlay, WarningNotice } from "../../components/AppModal";
import { CodeExpansionModal } from "../../components/ComposeCodeModal";
import { ScrollToTop } from "../../components/ScrollToTop";
import { ThemeSwitcher } from "../../components/ThemeSwitcher";
import { RelatedApps } from "../../components/RelatedApps";
import { ReportButton } from "../../components/ReportButton";
import { RequestButton } from "../../components/RequestButton";

const GITHUB_NEW_ISSUE_URL = "https://github.com/vukilis/docker-ninja/issues/new";

const findAppBySlug = (apps: AppBase[], slug: string) => {
    const normalizedSlug = slug.toLowerCase();
    return apps.find((a) => a.slug === slug || a.slug.toLowerCase() === normalizedSlug || String(a.id) === slug) || null;
};

export default function AppPageClient({ slug, initialApp }: { slug: string; initialApp?: AppBase | null }) {
	const {
		likedStatusCache,
		setLikedStatusCache,
		globalLikes,
		setGlobalLikes,
		detailsCache,
		setDetailsCache,
		composeCache,
		setComposeCache,
	} = useAppsGlobal();

	const [composeTab, setComposeTab] = useState<"run" | "update" | "env">("run");
	const [cliTab, setCliTab] = useState<"cli" | "update" | "bash">("cli");
	const [showWarning, setShowWarning] = useState(true);
	const [showExpandedCompose, setShowExpandedCompose] = useState(false);
	const [showEnvCode, setShowEnvCode] = useState(false);
	useEffect(() => {
		setShowWarning(localStorage.getItem("docker_ninja_warning") !== "true");
	}, []);
	const [isSyncing, setIsSyncing] = useState(false);
	const [isRequesting, setIsRequesting] = useState(false);
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const [mounted] = useState(() => typeof window !== 'undefined');

	const appsQuery = useQuery({
		queryKey: ["all-apps-for-slug-page"],
		queryFn: () => fetchAllApps(),
		staleTime: 1000 * 60 * 5,
	});

	const detailQuery = useQuery({
		queryKey: ["appDetail", slug],
		queryFn: () => fetchAppDetail(slug),
		enabled: !!slug,
		staleTime: 1000 * 60 * 5,
	});

	const composeQuery = useQuery({
		queryKey: ["compose", slug],
		queryFn: () => getComposeContent(slug),
		enabled: !!slug,
		staleTime: 1000 * 60 * 5,
	});

	const allApps = appsQuery.data || [];
	const baseApp = initialApp || findAppBySlug(allApps, slug);

	const likeQueryKey = ["like-status", slug];
	const likeStatusQuery = useQuery({
		queryKey: likeQueryKey,
		queryFn: async () => {
			const browserUuid = getOrCreateDeviceUUID();
			const hasLiked = await checkHasDeviceLiked(slug, browserUuid);
			return hasLiked;
		},
		enabled: !!slug && likedStatusCache[slug] === undefined,
		staleTime: 1000 * 60 * 5,
	});

	const isLiked = slug ? likedStatusCache[slug] ?? likeStatusQuery.data ?? false : false;
	const likesCount = slug ? globalLikes[slug] ?? 0 : 0;
	const app = useMemo<AppDetail>(() => ({
		...(baseApp || {}),
		...(detailQuery.data || {}),
	}), [baseApp, detailQuery.data]);

	const safeCategory = (app?.category ?? (baseApp?.category as string | undefined) ?? "").trim();

	useEffect(() => {
		if (!app?.id || typeof window === 'undefined') return;

		const key = "docker_ninja_recently_viewed";
		let stored: unknown[] = [];
		try {
			const raw = localStorage.getItem(key);
			if (raw) stored = JSON.parse(raw);
		} catch {
			stored = [];
		}

		const entry = {
			id: app.id,
			slug: app.slug,
			name: app.name,
			category: app.category || safeCategory || "",
			icon_url: app.icon_url,
			description: app.description,
		};

		const filtered = stored.filter((a) => String((a as { id: unknown }).id) !== String(entry.id));
		const updated = [entry, ...filtered].slice(0, 8);
		localStorage.setItem(key, JSON.stringify(updated));
	}, [app?.id, app?.slug, app?.name, app?.category, safeCategory, app?.icon_url, app?.description]);

	const categoryAppsQuery = useQuery({
		queryKey: ["category-apps-for-slug-page", safeCategory],
		queryFn: () => fetchAllApps(safeCategory),
		enabled: !!safeCategory,
		staleTime: 1000 * 60 * 5,
	});

	useEffect(() => {
		if (!slug) return;
		window.scrollTo({ top: 0, behavior: "smooth" });
		requestAnimationFrame(() => {
			scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
		});
		if (composeQuery.data && !composeCache[slug]) {
			setComposeCache((prev) => ({ ...prev, [slug]: composeQuery.data }));
		}
		if (detailQuery.data && !detailsCache[slug]) {
			setDetailsCache((prev) => ({ ...prev, [slug]: detailQuery.data }));
		}
	}, [slug, composeQuery.data, detailQuery.data, composeCache, detailsCache, setComposeCache, setDetailsCache]);

	const queryClient = useQueryClient();

	const allCategoryApps = useMemo(() => {
		const normalizedCategory = safeCategory.toLowerCase();
		const appsFromQuery = categoryAppsQuery.data || [];
		const appsFromAll = allApps.filter((a) => (a.category ?? "").trim().toLowerCase() === normalizedCategory);
		const combinedApps = [...appsFromQuery, ...appsFromAll];
		const uniqueApps = Array.from(new Map(combinedApps.map((a) => [String(a.id), a])).values());
		return uniqueApps.length > 0 ? uniqueApps : [{ ...app, category: safeCategory }];
	}, [allApps, app.category, categoryAppsQuery.data, app, safeCategory]);

	const relatedApps = useMemo(() => {
		const others = allCategoryApps.filter((a) => a.slug !== app.slug);
		return others;
	}, [allCategoryApps, app.slug]);

	const likeMutation = useMutation({
		mutationFn: async ({ appSlug, liked, deviceUuid }: { appSlug: string; liked: boolean; deviceUuid: string }) => {
			const total = await toggleAppLike(appSlug, liked, deviceUuid);
			if (total === -1) throw new Error("Failed to toggle like");
			return total;
		},
		onMutate: async ({ appSlug, liked }) => {
			await queryClient.cancelQueries({ queryKey: likeQueryKey });
			const previousLiked = likedStatusCache[slug] ?? likeStatusQuery.data ?? false;
			setLikedStatusCache((prev) => ({ ...prev, [appSlug]: liked }));
			setGlobalLikes((prev) => {
				const current = prev[appSlug] ?? 0;
				return { ...prev, [appSlug]: liked ? current + 1 : Math.max(0, current - 1) };
			});
			return { previousLiked };
		},
		onError: (_err, _vars, context) => {
			if (context?.previousLiked !== undefined) {
				setLikedStatusCache((prev) => ({ ...prev, [slug]: context.previousLiked }));
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
		await likeMutation.mutateAsync({ appSlug: slug, liked: futureLikedState, deviceUuid: browserUuid });
		setIsSyncing(false);
	};

	const runCommand = app.run_command?.replace(/\\\s*\n/g, "\\\n").trim() || "";
	const bashCommand = app.bash_command?.trim() || "";
	const updateCommand = app.update_command?.trim() || "";
	const cliUpdateCommand = app.cli_update_command?.trim() || "";
	const envFile = app.env_file?.trim() || "";

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

	const toggleWarning = () => {
		setShowWarning((prev) => {
			const nextState = !prev;
			localStorage.setItem("docker_ninja_warning", (!nextState).toString());
			return nextState;
		});
	};

	const currentIndex = allCategoryApps.findIndex((a) => a.id === app.id || a.slug === app.slug);
	const nextApp = allCategoryApps[(currentIndex + 1) % allCategoryApps.length];
	const prevApp = allCategoryApps[(currentIndex - 1 + allCategoryApps.length) % allCategoryApps.length];
	const prevHref = prevApp ? `/app/${encodeURIComponent(prevApp.slug || String(prevApp.id))}` : null;
	const nextHref = nextApp ? `/app/${encodeURIComponent(nextApp.slug || String(nextApp.id))}` : null;

	const icon = getIcon(app.slug, app.icon_url);
	const reportHref = `${GITHUB_NEW_ISSUE_URL}?template=issue-report.md&title=${encodeURIComponent(`[BUG] ${app.name}`)}&labels=bug`;

	return (
		<div className="relative flex h-screen overflow-hidden dark:bg-[#0d1117] text-slate-100">
			<main ref={scrollContainerRef} className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto">
				<div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
					<header className="relative overflow-hidden rounded-2xl border border-slate-200/50 bg-white/70 p-2 shadow-xl shadow-slate-200/50 backdrop-blur-xl transition-all dark:border-slate-800/50 dark:bg-slate-950/40 dark:shadow-none sm:p-3">
						<div className="flex justify-between gap-4">
							<div className="flex gap-4">
								<Link 
									href="/containers" 
									className="group inline-flex h-10 w-10 md:w-auto md:px-4 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-all active:scale-95 hover:bg-blue-300/20 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
									aria-label="Back to containers"
								>
									<svg 
										className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5" 
										viewBox="0 0 24 24" 
										fill="none" 
										stroke="currentColor" 
										strokeWidth="2.5" 
										strokeLinecap="round" 
										strokeLinejoin="round"
									>
										<path d="M15 19l-7-7 7-7" />
									</svg>
									<span className="hidden md:inline-flex ml-2 text-xs font-bold uppercase tracking-wider font-sans">
										Containers
									</span>
								</Link>
							</div> 
							<div>
								<ThemeSwitcher />
							</div>
						</div>
					</header>

					<div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
						<div className="order-1 min-w-0 space-y-6">
							<section className="relative overflow-hidden rounded-2xl border border-slate-200/50 bg-white/70 p-5 shadow-xl shadow-slate-200/50 backdrop-blur-xl transition-all dark:border-slate-800/50 dark:bg-slate-950/40 dark:shadow-none sm:p-8">
								<div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 dark:from-blue-500/10 dark:to-purple-500/10" />
								<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
									<div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:gap-6 sm:text-left">
										
										<div className="flex items-center gap-3">
											{/* LEFT SIDE BUTTONS */}
											<div className="flex lg:hidden flex-col gap-4.5">
												<ReportButton href={reportHref} />
												<RequestButton onClick={() => setIsRequesting(true)} />
											</div>

											{/* APP ICON CONTAINER */}
											<div className="relative flex h-25 w-25 shrink-0 items-center justify-center rounded-2xl border border-slate-200/60 bg-slate-200 p-3.5 shadow-md shadow-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none sm:h-24 sm:w-24 sm:rounded-2xl">
												<div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 dark:from-blue-400/10 dark:to-purple-400/10" />
												<div className="relative h-full w-full flex items-center justify-center">
													{icon?.type === "url" && icon.src ? (
														<Image src={icon.src} alt={app.name} width={96} height={96} unoptimized className="h-full w-full object-contain" />
													) : icon?.svg ? (
														<div dangerouslySetInnerHTML={{ __html: icon.svg }} className="h-full w-full fill-slate-800 dark:fill-slate-100" />
													) : (
														<span className="text-3xl font-black text-slate-800 dark:text-white">{app.name.charAt(0)}</span>
													)}
												</div>
											</div>

											{/* RIGHT SIDE BUTTONS */}
											<div className="flex lg:hidden flex-col gap-4.5">
												<ShareButton app={app} shouldTrack={false} />
												<WarningNotice show={showWarning} onClick={toggleWarning} />
											</div>
										</div>

										{/* Title & Category info */}
										<div className="space-y-2.5">
											<div className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50/50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:border-blue-900/30 dark:bg-blue-500/10 dark:text-blue-400">
												<span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
												<span className="max-w-[12rem] truncate sm:max-w-none">{app.category}</span>
											</div>

											<h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl lg:text-4xl">
												{app.name}
											</h1>
										</div>
									</div>

									{/* Likes & Pagination */}
									<div className="flex flex-row items-center justify-center gap-3 border-t border-slate-200 pt-4 mt-4 dark:border-slate-900 sm:w-auto sm:justify-end lg:border-t-0 lg:pt-0">
										<button
											onClick={handleLikeToggle}
											className={`inline-flex h-10 items-center justify-center gap-2 rounded-full border px-4 transition-all duration-200 active:scale-95 select-none text-sm font-medium ${
												isLiked 
													? "border-rose-100 bg-rose-50 text-rose-600 dark:border-rose-950/50 dark:bg-rose-950/30 dark:text-rose-400" 
													: "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
											} ${isSyncing ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
											disabled={isSyncing}
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 24 24"
												fill={isLiked ? "currentColor" : "none"}
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
												className={`w-4 h-4 transition-transform ${isLiked ? "scale-110" : ""}`}
											>
												<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
											</svg>
											<span className="tabular-nums font-semibold">
												{likesCount !== null ? FormattingUtils.formatCompactNumber(likesCount) : "0"}
											</span>
										</button>

										<div className="inline-flex h-10 items-center rounded-full border border-slate-200 bg-white/80 p-0.5 dark:border-slate-800 dark:bg-slate-900/80">
											{prevHref ? (
												<Link href={prevHref} className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100" aria-label="Previous app">
													<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
														<path d="M15 19l-7-7 7-7" />
													</svg>
												</Link>
											) : (
												<span className="flex h-8 w-8 items-center justify-center rounded-full text-slate-300 dark:text-slate-700" aria-hidden="true">
													<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
														<path d="M15 19l-7-7 7-7" />
													</svg>
												</span>
											)}
											
											<span className="px-3 font-sans text-xs font-bold text-slate-500 dark:text-slate-400 tabular-nums">
												{currentIndex + 1}<span className="text-slate-300 dark:text-slate-700 mx-1">/</span>{allCategoryApps.length}
											</span>

											{nextHref ? (
												<Link href={nextHref} className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100" aria-label="Next app">
													<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
														<path d="M9 5l7 7-7 7" />
													</svg>
												</Link>
											) : (
												<span className="flex h-8 w-8 items-center justify-center rounded-full text-slate-300 dark:text-slate-700" aria-hidden="true">
													<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
														<path d="M9 5l7 7-7 7" />
													</svg>
												</span>
											)}
										</div>
									</div>
								</div>
							</section>

							{showWarning && (
								<div className="flex items-start justify-between gap-3 rounded-md border border-amber-200 bg-amber-50/50 p-4 text-xs md:text-sm text-amber-800 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-300 transition-all duration-300">
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

							<section className="relative overflow-hidden rounded-2xl border border-slate-200/50 bg-white/70 p-6 shadow-xl shadow-slate-200/50 backdrop-blur-xl transition-all dark:border-slate-800/50 dark:bg-slate-950/40 dark:shadow-none sm:p-8">
								<div className="mb-4 flex items-center gap-3">
									<div className="h-1.5 w-6 rounded-full bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.4)] dark:bg-purple-400 dark:shadow-[0_0_16px_rgba(192,132,252,0.6)]" />
									<h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
										About
									</h2>
								</div>
								<p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base sm:leading-relaxed">
									{app.description || "No description available for this application."}
								</p>
							</section>

							<section className="relative overflow-hidden rounded-2xl border border-slate-200/50 bg-white/70 p-5 shadow-xl shadow-slate-200/50 backdrop-blur-xl transition-all dark:border-slate-800/50 dark:bg-slate-950/40 dark:shadow-none sm:p-6 flex flex-col gap-5 max-h-[700px]">
								<div className="flex items-center justify-between gap-4 shrink-0">
									<div className="flex items-center gap-3">
										<div className="h-1.5 w-6 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.4)] dark:bg-blue-400 dark:shadow-[0_0_16px_rgba(96,165,250,0.6)]" />
										<h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 font-mono">
											compose.yml
										</h2>
									</div>
									<div className="flex items-center gap-1.5">
										<ExportButton text={composeQuery.data ?? "Loading..."} shouldTrack={true} />
										<CopyButton text={composeQuery.data ?? "Loading..."} shouldTrack={true} />
									</div>
								</div>

								<div className="group relative flex-1 min-h-[180px] max-h-[300px] overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800/80 dark:bg-slate-900/40">
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
										{composeQuery.isLoading || detailQuery.isLoading ? (
											<span className="text-slate-400 dark:text-slate-500 animate-pulse">Loading...</span>
										) : (
											composeQuery.data ?? "..."
										)}
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
									<div className="max-h-[160px] overflow-auto bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl text-xs text-slate-700 dark:text-blue-300 border border-slate-200 dark:border-slate-800/80 whitespace-pre font-mono leading-relaxed select-text">
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
							</section>
							
							{runCommand && (
								<section className="relative overflow-hidden rounded-2xl border border-slate-200/50 bg-white/70 p-5 shadow-xl shadow-slate-200/50 backdrop-blur-xl transition-all dark:border-slate-800/50 dark:bg-slate-950/40 dark:shadow-none sm:p-6 flex flex-col gap-5">
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
										<div className="max-h-[200px] overflow-auto bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl text-xs text-slate-700 dark:text-blue-300 border border-slate-200 dark:border-slate-800/80 font-mono leading-relaxed select-text">
											<div className="flex gap-2 items-start">
												<span className="text-blue-800 dark:text-blue-300 select-none">$</span>
												<span className="text-blue-800 dark:text-blue-300 break-all whitespace-pre">
													{getCliText()}
												</span>
											</div>
										</div>
									</div>
								</section>
							)}
						</div>

						<aside className="order-3 block lg:order-2 lg:sticky lg:top-6 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden space-y-4">
							<div className="relative overflow-hidden rounded-2xl border border-slate-200/50 bg-white/70 p-5 shadow-xl shadow-slate-200/50 backdrop-blur-xl transition-all dark:border-slate-800/50 dark:bg-slate-950/40 dark:shadow-none sm:p-6">
								<div className="mb-5 flex items-center gap-3">
									<div className="h-1.5 w-6 rounded-full bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.4)] dark:bg-orange-400 dark:shadow-[0_0_16px_rgba(251,146,60,0.6)]" />
									<h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
										App Details
									</h2>
								</div>
								<dl className="space-y-4 text-sm">
									{app.website && (
										<div className="flex items-center justify-between gap-4">
											<dt className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Website</dt>
											<dd>
												<a href={app.website} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-1 font-semibold text-blue-600 transition hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
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
														className="shrink-0 transition-transform duration-200 group-hover:scale-110 opacity-85"
													>
														<path d="M15 3h6v6" />
														<path d="M10 14 21 3" />
														<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
													</svg>
												</a>
											</dd>
										</div>
									)}
									
									{app.github && (
										<div className="flex items-center justify-between gap-4">
											<dt className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">GitHub</dt>
											<dd>
												<a href={app.github} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-1 font-semibold text-blue-600 transition hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
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
														className="shrink-0 transition-transform duration-200 group-hover:scale-110 opacity-85"
													>
														<path d="M15 3h6v6" />
														<path d="M10 14 21 3" />
														<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
													</svg>
												</a>
											</dd>
										</div>
									)}

									{app.docs && (
										<div className="flex items-center justify-between gap-4">
											<dt className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Docs</dt>
											<dd>
												<a href={app.docs} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-1 font-semibold text-blue-600 transition hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
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
														className="shrink-0 transition-transform duration-200 group-hover:scale-110 opacity-85"
													>
														<path d="M15 3h6v6" />
														<path d="M10 14 21 3" />
														<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
													</svg>
												</a>
											</dd>
										</div>
									)}

									{app.source && (
										<div className="flex items-center justify-between gap-4">
											<dt className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Docker Hub</dt>
											<dd>
												<a href={app.source} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-1 font-semibold text-blue-600 transition hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
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
														className="shrink-0 transition-transform duration-200 group-hover:scale-110 opacity-85"
													>
														<path d="M15 3h6v6" />
														<path d="M10 14 21 3" />
														<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
													</svg>
												</a>
											</dd>
										</div>
									)}

									<div className="py-2.5">
										<div className="h-[2px] w-2/3 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-transparent dark:from-cyan-400 dark:via-blue-600 opacity-80 shadow-[0_0_8px_rgba(34,211,238,0.3)]" />
									</div>

									{app.version && (
										<div className="flex items-center justify-between gap-4">
											<dt className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Version</dt>
											<dd className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 font-mono text-xs font-bold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
												{FormattingUtils.formatVersion(app.version)}
											</dd>
										</div>
									)}

									{app.updated_at && (
										<div className="flex items-center justify-between gap-4">
											<dt className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Latest Change</dt>
											<dd className="font-medium text-emerald-700 dark:text-emerald-300">
												{new Date(app.updated_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
											</dd>
										</div>
									)}

									<div className="flex items-center justify-between gap-4">
										<dt className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Category</dt>
										<dd className="font-semibold text-slate-700 dark:text-slate-300">
											{app.category}
										</dd>
									</div>
								</dl>
							</div>

							<div className="hidden lg:flex relative overflow-hidden rounded-2xl border border-slate-200/50 bg-white/70 p-5 shadow-xl shadow-slate-200/50 backdrop-blur-xl transition-all dark:border-slate-800/50 dark:bg-slate-950/40 dark:shadow-none items-center justify-center gap-8 sm:p-6">
								<div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-500/5 to-transparent dark:from-slate-400/5" />
								<ReportButton href={reportHref}/>
								<RequestButton onClick={() => setIsRequesting(true)}/>
								<WarningNotice show={showWarning} onClick={toggleWarning} />
								<ShareButton app={app} shouldTrack={false} />
							</div>
						</aside>
					</div>
					<RelatedApps apps={relatedApps} currentSlug={app.slug} />
				</div>
			</main>

			{isRequesting && (
				<RequestSearchOverlay
					allApps={allApps}
					onClose={() => setIsRequesting(false)}
					onAppSelect={(app) => {
						setIsRequesting(false);
						window.location.href = `/app/${encodeURIComponent(app.slug || String(app.id))}`;
					}}
				/>
			)}
			<CodeExpansionModal
				isOpen={showExpandedCompose}
				onClose={() => setShowExpandedCompose(false)}
				code={composeQuery.data ?? "Loading..."}
				appName={app.name}
				filename="compose.yml"
			/>
			{showEnvCode && app.env_file && (
				<CodeExpansionModal
					isOpen={showEnvCode}
					onClose={() => setShowEnvCode(false)}
					code={app.env_file}
					appName={app.name}
					filename=".env"
				/>
			)}
			<ScrollToTop containerRef={scrollContainerRef} />
		</div>
	);
}
