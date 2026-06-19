import { useClipboardCopy } from '../utils/ButtonLogic';

interface CopyButtonProps {
    text: string;
    shouldTrack?: boolean;
    className?: string;
}

const defaultButton = "relative group inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-all duration-300 hover:border-blue-500 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-blue-500/60 dark:hover:text-blue-400 cursor-pointer";
const successButton = "relative group inline-flex h-8 w-8 items-center justify-center rounded-full border border-green-500 bg-green-50 text-green-600 transition-all duration-300 hover:border-green-600 hover:text-green-700 dark:border-green-500 dark:bg-green-950/30 dark:text-green-400 dark:hover:border-green-400 dark:hover:text-green-300 cursor-pointer";

export function CopyButton({ text, shouldTrack = false, className = "" }: CopyButtonProps) {
    const { copied, copying, handleCopy } = useClipboardCopy();
    const isSuccess = copied || copying;

    return (
        <button
            onClick={() => handleCopy(text, shouldTrack)}
            className={`${isSuccess ? successButton : defaultButton} ${className}`}
            aria-label="Copy"
        >
            {isSuccess ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                </svg>
            ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
            )}
        </button>
    );
}
