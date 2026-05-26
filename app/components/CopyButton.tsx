import { useClipboardCopy } from '../utils/CopyLogic'; 

interface CopyButtonProps {
    text: string;
    shouldTrack?: boolean;
}

export function CopyButton({ text, shouldTrack = false}: CopyButtonProps) {
    const { copied, handleCopy } = useClipboardCopy();

    return (
        <button 
            onClick={() => handleCopy(text, shouldTrack)}
            className={`ml-2 transition-colors cursor-pointer ${copied ? 'text-green-600 dark:text-green-500' : 'text-slate-500 hover:text-green-500'}`}
        >
            <span>{copied ? "[COPIED!]" : "[COPY]"}</span>
        </button>
    );
}