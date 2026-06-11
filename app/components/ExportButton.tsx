import { useExportFile } from '../utils/ButtonLogic'; 

interface ExportButtonProps {
    text: string;
    filename?: string;
    shouldTrack?: boolean;
    className?: string;
}

export function ExportButton({ text, filename = "compose.yml", shouldTrack = false, className = "" }: ExportButtonProps) {
    const { exported, handleExport } = useExportFile();

    return (
        <button 
            onClick={() => handleExport(text, filename, shouldTrack)}
            className={`ml-2 transition-colors cursor-pointer ${exported ? 'text-green-600 dark:text-green-500' : 'text-slate-500 hover:text-green-500'} ${className}`}
        >
            <span>{exported ? "[EXPORTED!]" : "[EXPORT]"}</span>
        </button>
    );
}