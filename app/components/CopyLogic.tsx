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

            // Handle optional tracking logic
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