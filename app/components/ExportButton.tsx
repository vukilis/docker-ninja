import { useExportFile } from '../utils/ButtonLogic';

interface ExportButtonProps {
    text: string;
    filename?: string;
    shouldTrack?: boolean;
    className?: string;
}

const defaultButton = "relative group inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-all duration-300 hover:border-blue-500 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-blue-500/60 dark:hover:text-blue-400 cursor-pointer";
const successButton = "relative group inline-flex h-8 w-8 items-center justify-center rounded-full border border-green-500 bg-green-50 text-green-600 transition-all duration-300 hover:border-green-600 hover:text-green-700 dark:border-green-500 dark:bg-green-950/30 dark:text-green-400 dark:hover:border-green-400 dark:hover:text-green-300 cursor-pointer";

export function ExportButton({ text, filename = "compose.yml", shouldTrack = false, className = "" }: ExportButtonProps) {
    const { exported, exporting, handleExport } = useExportFile();
    const isSuccess = exported || exporting;

    return (
        <button
            onClick={() => handleExport(text, filename, shouldTrack)}
            className={`${isSuccess ? successButton : defaultButton} ${className}`}
            aria-label="Export"
        >
            {isSuccess ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                </svg>
            ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <path d="M7 10l5 5 5-5" />
                    <path d="M12 15V3" />
                </svg>
            )}
        </button>
    );
}
