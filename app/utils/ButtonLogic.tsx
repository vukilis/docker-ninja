import { useState } from 'react';
import { mutate } from 'swr';
import { incrementCopyCount } from '../actions';

export const copyTextToClipboard = async (text: string): Promise<boolean> => {
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            return successful;
        }
    } catch (err) {
        console.error("Clipboard copy failed:", err);
        return false;
    }
};

export const useClipboardCopy = (duration: number = 2000) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async (text: string, shouldTrack: boolean = false) => {
        const success = await copyTextToClipboard(text);
        
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), duration);

            if (shouldTrack) {
                const newTotal = await incrementCopyCount();
                if (newTotal !== -1) {
                    mutate('global-stats', newTotal, false);
                }
            }
        }
    };

    return { copied, handleCopy };
};

export const downloadTextFile = async (text: string, filename: string): Promise<boolean> => {
    const mimeType = filename === ".env.local" ? "text/plain;charset=utf-8" : "text/yaml;charset=utf-8";
    try {
        const blob = new Blob([text], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return true;
    } catch (err) {
        console.error("File export failed:", err);
        return false;
    }
};

export const useExportFile = (duration: number = 2000) => {
    const [exported, setExported] = useState(false);

    const handleExport = async (text: string, filename: string, shouldTrack: boolean = false) => {
        const success = await downloadTextFile(text, filename);
        
        if (success) {
            setExported(true);
            setTimeout(() => setExported(false), duration);

            if (shouldTrack) {
                const newTotal = await incrementCopyCount();
                if (newTotal !== -1) {
                    mutate('global-stats', newTotal, false);
                }
            }
        }
    };

    return { exported, handleExport };
};