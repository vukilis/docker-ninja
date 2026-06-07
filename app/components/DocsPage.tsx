"use client";
import React, { useState } from "react";

const ToggleSection = ({ title, defaultOpen = true, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="mb-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden transition-all">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-5 py-4 cursor-pointer group select-none"
            >
                <div className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full shrink-0" />
                    <h3 className="text-sm md:text-base font-black uppercase tracking-[0.15em] text-slate-900 dark:text-white">
                        {title}
                    </h3>
                </div>
                <svg
                    className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="3"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            <div
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{ maxHeight: isOpen ? "5000px" : "0px", opacity: isOpen ? 1 : 0 }}
            >
                <div className="px-5 pb-6 space-y-4 border-t border-slate-100 dark:border-slate-800/50">
                    {children}
                </div>
            </div>
        </div>
    );
};

const Badge = ({ children }: { children: React.ReactNode }) => (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-[0.15em] bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-600/20">
        {children}
    </span>
);

const OutboundLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors group"
    >
        {children}
        <svg
            className="w-3 h-3 transition-transform group-hover:translate-x-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="3"
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
        </svg>
    </a>
);

const CodeBox = ({ children, language = "yaml" }: { children: string; language?: string }) => (
    <div className="relative group mt-4">
        <div className="absolute top-3 right-3">
            <Badge>{language}</Badge>
        </div>
        <pre className="overflow-x-auto bg-slate-100 rounded-xl dark:bg-[#0d1117] border border-slate-800 p-5 pt-10 text-[13px] leading-relaxed text-slate-600 dark:text-slate-300 font-mono shadow-2xl shadow-blue-900/10">
            <code>{children}</code>
        </pre>
    </div>
);

const VisualStep = ({ number, title, description }: { number: number; title: string; description: string }) => (
    <div className="flex gap-4 items-start mt-6 first:mt-0">
        <div className="flex flex-col items-center shrink-0">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-black">
                {number}
            </div>
            {number < 6 && <div className="w-px flex-1 bg-slate-200 dark:bg-slate-800 mt-1.5 min-h-[24px]" />}
        </div>
        <div className="flex-1">
            <h4 className="text-sm font-black uppercase tracking-[0.1em] text-slate-900 dark:text-slate-200 mb-1">{title}</h4>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{description}</p>
        </div>
    </div>
);

const FileBox = ({ name, icon, color, children }: { name: string; icon: string; color: string; children: React.ReactNode }) => (
    <div className="flex gap-3 items-start mt-4 first:mt-0">
        <div className="shrink-0 w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-lg">
            {icon}
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm font-black font-mono uppercase tracking-tight text-slate-900 dark:text-white">{name}</span>
                <span className={`w-1.5 h-1.5 rounded-full ${color}`} />
            </div>
            {children}
        </div>
    </div>
);

const InfoCard = ({ children, type = "info" }: { children: React.ReactNode; type?: "info" | "warning" | "success" }) => {
    const styles: Record<string, string> = {
        info: "bg-blue-50 dark:bg-blue-900/10 border-blue-600/20 text-blue-800 dark:text-blue-300",
        warning: "bg-amber-50 dark:bg-amber-900/10 border-amber-600/20 text-amber-800 dark:text-amber-300",
        success: "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-600/20 text-emerald-800 dark:text-emerald-300",
    };
    const icons: Record<string, string> = { info: "ℹ️", warning: "⚠️", success: "✅" };

    return (
        <div className={`rounded-lg border px-4 py-3 text-xs font-bold leading-relaxed ${styles[type]}`}>
            <div className="flex gap-2 items-start">
                <span className="shrink-0">{icons[type]}</span>
                <div>{children}</div>
            </div>
        </div>
    );
};

export default function DocsPage() {
    return (
        <div className="min-h-screen dark:bg-[#0d1117] dark:text-slate-300 text-slate-300 font-sans p-4 md:p-0">
            <div className="max-w-5xl mx-auto pt-10 md:pt-20">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-block px-3 py-1 mb-5 text-xs font-mono uppercase font-medium text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 rounded-full border border-blue-500/20">
                        SECTOR: DOCUMENTATION
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-4 tracking-tight uppercase italic">
                        Docker & <span className="text-blue-600 dark:text-blue-400">Compose</span>
                        <br />
                        <span className="text-blue-600 dark:text-blue-400">Setup Guide</span>
                    </h1>
                    <p className="text-slate-900 dark:text-slate-400 max-w-xl mx-auto font-mono text-xs tracking-[0.15em] leading-relaxed">
                        $ cat ./docker-docs.md
                    </p>
                </div>

                <div className="space-y-3">
                    {/* Docker Engine Section */}
                    <ToggleSection title="Docker Engine">
                        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                            Docker Engine is the underlying runtime that builds and runs containers. It is a prerequisite for any container-based workflow, including local development, CI/CD pipelines, and production deployments.
                        </p>

                        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg mt-4">
                            <div className="px-4 py-2.5 bg-slate-50 dark:bg-[#161b22] border-b border-slate-200 dark:border-slate-800">
                                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Installation Overview</span>
                            </div>
                            <div className="p-5 space-y-0">
                                <VisualStep number={1} title="Check Prerequisites" description="Verify your OS and kernel version. Docker requires a 64-bit OS and a Linux kernel ≥ 3.10 (most modern distros meet this out of the box)." />
                                <VisualStep number={2} title="Install Docker Engine" description="Use the official convenience script or your OS package manager (apt, dnf, yum, pacman). The official method is strongly recommended." />
                                <VisualStep number={3} title="Start & Enable Service" description="Run: sudo systemctl start docker && sudo systemctl enable docker. Verify with: docker run hello-world." />
                                <VisualStep number={4} title="Post-Install Steps" description="Add your user to the docker group to run commands without sudo. Apply group changes: newgrp docker or log out and back in." />
                                <VisualStep number={5} title="Verify Installation" description="Run docker --version and docker compose version to confirm both are installed and accessible." />
                            </div>
                        </div>

                        <InfoCard type="info" className="mt-4">Official Docker Engine installation guide with OS-specific instructions:</InfoCard>
                        <OutboundLink href="https://docs.docker.com/engine/install/">docs.docker.com/engine/install/</OutboundLink>
                        <InfoCard type="warning">Avoid using convenience scripts in production or untrusted environments.</InfoCard>
                    </ToggleSection>

                    {/* Docker Compose Section */}
                    <ToggleSection title="Docker Compose" defaultOpen={true}>
                        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                            Docker Compose is a tool for defining and running multi-container applications. With a single YAML file, you configure services, networks, volumes, environment variables, and deployment rules.
                        </p>

                        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg mt-4">
                            <div className="px-4 py-2.5 bg-slate-50 dark:bg-[#161b22] border-b border-slate-200 dark:border-slate-800">
                                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Compose v2 Installation</span>
                            </div>
                            <div className="p-5 space-y-0">
                                <VisualStep number={1} title="Install via Docker Desktop (Recommended)" description="Docker Desktop for Windows, Mac, and Linux includes Compose v2 out of the box. Download from docker.com/products/docker-desktop." />
                                <VisualStep number={2} title="Install on Linux (Standalone)" description="Compose v2 is distributed as a Docker CLI plugin. Follow the official Linux install guide for your distribution." />
                                <VisualStep number={3} title="Verify" description="Run docker compose version to confirm the plugin is registered with the Docker CLI." />
                            </div>
                        </div>

                        <OutboundLink href="https://docs.docker.com/compose/install/" className="mt-4 inline-block">docs.docker.com/compose/install/</OutboundLink>
                    </ToggleSection>

                    {/* File Structure Section */}
                    <ToggleSection title="File Structure" defaultOpen={true}>
                        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                            A typical Docker Compose project follows a minimal, predictable structure. Place your compose file at the project root alongside environment files and any application assets.
                        </p>

                        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg mt-4">
                            <div className="px-4 py-2.5 bg-slate-50 dark:bg-[#161b22] border-b border-slate-200 dark:border-slate-800">
                                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Project Layout</span>
                            </div>
                            <div className="p-5 space-y-0">
                                <FileBox name="compose.yml" icon="📋" color="bg-blue-600">
                                    <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">The primary declaration file. Defines services, networks, volumes, and their relationships.</p>
                                </FileBox>
                                <FileBox name=".env" icon="🔐" color="bg-emerald-600">
                                    <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">Environment variables injected into all services. Never commit secrets stored here.</p>
                                </FileBox>
                                <FileBox name=".env.example" icon="📝" color="bg-slate-400">
                                    <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">A template showing required environment variables. Safe to commit. Copy to .env locally.</p>
                                </FileBox>
                                <FileBox name="Dockerfile" icon="🐳" color="bg-amber-600">
                                    <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">Build instructions for a custom service image. Required only when building from source.</p>
                                </FileBox>
                            </div>
                        </div>

                        <InfoCard type="success" className="mt-4">
                            Compose automatically reads the <code className="font-mono">.env</code> file in the same directory as your compose file — no extra configuration required.
                        </InfoCard>
                    </ToggleSection>

                    {/* compose.yml Breakdown */}
                    <ToggleSection title="compose.yml Breakdown" defaultOpen={true}>
                        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                            Below is the actual compose file used by this project, annotated for clarity. The file is written in YAML — indentation is significant.
                        </p>

                        <CodeBox>{`services:
  web:
    container_name: docker-ninja-web    # Human-readable container label
    build:
    context: .                        # Build context directory
    dockerfile: Dockerfile            # Dockerfile to use
    ports:
    - "3000:3000"                     # host:container port mapping
    environment:
    - NODE_ENV=production             # Inline environment variable
    env_file:
    - .env.local                      # External env file(s)
    restart: unless-stopped             # Restart policy`}</CodeBox>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                            <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
                                <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-900 dark:text-white mb-2">services</h4>
                                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">Top-level key. Each child is a container service. At least one service is required.</p>
                            </div>
                            <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
                                <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-900 dark:text-white mb-2">container_name</h4>
                                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">Optional. Assigns a fixed name. Helpful for scripting and logging. Omit to let Compose generate a name.</p>
                            </div>
                            <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
                                <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-900 dark:text-white mb-2">build / image</h4>
                                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">Use build for source-built images. Use image to pull from a registry. Do not mix both.</p>
                            </div>
                            <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
                                <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-900 dark:text-white mb-2">ports</h4>
                                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">Format: "HOST:CONTAINER". Maps a host port to the container port. Can be a range or short syntax.</p>
                            </div>
                            <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
                                <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-900 dark:text-white mb-2">environment</h4>
                                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">Inline key-value pairs. Lower priority than variables from env_file or shell environment.</p>
                            </div>
                            <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
                                <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-900 dark:text-white mb-2">env_file</h4>
                                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">Path(s) to one or more .env files. Loaded in order; later files override earlier ones.</p>
                            </div>
                            <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
                                <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-900 dark:text-white mb-2">restart</h4>
                                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">Controls restart behavior. unless-stopped restarts on boot unless manually stopped. no, always, on-failure also valid.</p>
                            </div>
                        </div>
                    </ToggleSection>

                    {/* .env File Guide */}
                    <ToggleSection title=".env File Guide" defaultOpen={true}>
                        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                            Environment files keep secrets and configuration out of version control. They are key-value pairs source-loaded before the container starts.
                        </p>

                        <CodeBox language="bash">{`# Database configuration
DB_USER=admin
DB_PASSWORD=s3cureP@ss!
DB_NAME=app_production

# Application settings
NODE_ENV=production
APP_URL=https://example.com
PORT=3000

# Secrets (never commit!)
API_SECRET=abc123xyz
JWT_SECRET=very-secret-key-2026`}</CodeBox>

                        <div className="space-y-3 mt-4">
                            <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
                                <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-900 dark:text-white mb-2">Naming Rules</h4>
                                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">Keys are uppercase letters, digits, and underscores only. Values are strings with no quotes unless the value contains spaces or special characters.</p>
                            </div>
                            <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
                                <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-900 dark:text-white mb-2">Variable Interpolation</h4>
                                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">Reference other variables with <code className="font-mono text-blue-600 dark:text-blue-400">${'{'}VARIABLE{'}'}</code> syntax. Useful for composing URLs or paths.</p>
                            </div>
                            <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
                                <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-900 dark:text-white mb-2">Git Ignore</h4>
                                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">Add <code className="font-mono text-blue-600 dark:text-blue-400">.env</code> to <code className="font-mono text-blue-600 dark:text-blue-400">.gitignore</code> immediately. Use <code className="font-mono text-blue-600 dark:text-blue-400">.env.example</code> as a safe template.</p>
                            </div>
                        </div>
                    </ToggleSection>

                    {/* Quick Command Reference */}
                    <ToggleSection title="Quick Command Reference">
                        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg">
                            <div className="px-4 py-2.5 bg-slate-50 dark:bg-[#161b22] border-b border-slate-200 dark:border-slate-800">
                                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Essential Commands</span>
                            </div>
                            <div className="p-4 space-y-2 font-mono text-[13px]">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 place-content-between rounded-lg bg-slate-100 dark:bg-[#0d1117] border border-slate-800 px-4 py-2.5">
                                    <span className="text-slate-700 dark:text-slate-400 shrink-0">docker --version</span>
                                    <span className="text-[10px] md:text-xs text-slate-500">Show engine version</span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 place-content-between rounded-lg bg-slate-100 dark:bg-[#0d1117] border border-slate-800 px-4 py-2.5">
                                    <span className="text-slate-700 dark:text-slate-400 shrink-0">docker compose version</span>
                                    <span className="text-[10px] md:text-xs text-slate-500">Show compose version</span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 place-content-between rounded-lg bg-slate-100 dark:bg-[#0d1117] border border-slate-800 px-4 py-2.5">
                                    <span className="text-emerald-700 dark:text-emerald-400 shrink-0">docker compose up -d</span>
                                    <span className="text-[10px] md:text-xs text-slate-500">Start all services detached</span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 place-content-between rounded-lg bg-slate-100 dark:bg-[#0d1117] border border-slate-800 px-4 py-2.5">
                                    <span className="text-amber-700 dark:text-amber-400 shrink-0">docker compose down</span>
                                    <span className="text-[10px] md:text-xs text-slate-500">Stop and remove containers</span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 place-content-between rounded-lg bg-slate-100 dark:bg-[#0d1117] border border-slate-800 px-4 py-2.5">
                                    <span className="text-purple-700 dark:text-purple-400 shrink-0">docker compose logs -f</span>
                                    <span className="text-[10px] md:text-xs text-slate-500">Tail service logs</span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 place-content-between rounded-lg bg-slate-100 dark:bg-[#0d1117] border border-slate-800 px-4 py-2.5">
                                    <span className="text-blue-700 dark:text-blue-400 shrink-0">docker compose ps</span>
                                    <span className="text-[10px] md:text-xs text-slate-500">List running containers</span>
                                </div>
                            </div>
                        </div>
                    </ToggleSection>

                    {/* Official Documentation */}
                    <ToggleSection title="Official Documentation" defaultOpen={true}>
                        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                            The following are the authoritative sources. Consult them when in doubt, contributing upstream, or auditing security practices.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                            <a
                                href="https://docs.docker.com/engine/"
                                target="_blank"
                                rel="noreferrer"
                                className="group flex items-start gap-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 hover:border-blue-600/50 transition-colors"
                            >
                                <div className="text-2xl leading-none">🐳</div>
                                <div>
                                    <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">Docker Engine</h4>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">Installation, architecture, and runtime configuration.</p>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mt-2 block">docs.docker.com/engine/</span>
                                </div>
                            </a>
                            <a
                                href="https://docs.docker.com/compose/"
                                target="_blank"
                                rel="noreferrer"
                                className="group flex items-start gap-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 hover:border-blue-600/50 transition-colors"
                            >
                                <div className="text-2xl leading-none">📦</div>
                                <div>
                                    <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">Docker Compose</h4>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">File reference, CLI, overrides, and multi-file setups.</p>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mt-2 block">docs.docker.com/compose/</span>
                                </div>
                            </a>
                            <a
                                href="https://docs.docker.com/build/"
                                target="_blank"
                                rel="noreferrer"
                                className="group flex items-start gap-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 hover:border-blue-600/50 transition-colors"
                            >
                                <div className="text-2xl leading-none">🔨</div>
                                <div>
                                    <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">Docker Build</h4>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">Dockerfile syntax, build context, cache, and BuildKit.</p>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mt-2 block">docs.docker.com/build/</span>
                                </div>
                            </a>
                            <a
                                href="https://docs.docker.com/config/"
                                target="_blank"
                                rel="noreferrer"
                                className="group flex items-start gap-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 hover:border-blue-600/50 transition-colors"
                            >
                                <div className="text-2xl leading-none">⚙️</div>
                                <div>
                                    <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">Docker Config</h4>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">daemon.json, storage, logging, and runtime tuning.</p>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mt-2 block">docs.docker.com/config/</span>
                                </div>
                            </a>
                        </div>

                        <InfoCard type="info" className="mt-4">
                            These links form the canonical knowledge base for all Docker Ninja compose stacks. All templates in this project follow these specifications unless explicitly noted.
                        </InfoCard>
                    </ToggleSection>
                </div>

                {/* Footer note */}
                <div className="pt-8 pb-4 text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-600 border-t border-slate-200 dark:border-slate-800 mt-8">
                    Referenced from official Docker documentation
                </div>
            </div>
        </div>
    );
}
