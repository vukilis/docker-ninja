import { useEffect, RefObject } from "react";

interface ShortcutConfig {
    searchRef?: RefObject<HTMLInputElement | null>;
    warpButtonRef?: RefObject<HTMLButtonElement | null>;
    isStarted?: boolean;
}

export const useShortcutKeys = ({ searchRef, warpButtonRef, isStarted = false }: ShortcutConfig) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const tag = document.activeElement?.tagName.toLowerCase();
            const isTyping = tag === "input" || tag === "textarea" || tag === "select";

            // 1. Mod+K (Only runs if searchRef is provided)
            if (searchRef?.current) {
                const isMac = /Mac|iPhone|iPod|iPad/i.test(
                    (navigator as { userAgentData?: { platform?: string } }).userAgentData?.platform || navigator.platform || ""
                );
                const isModifierPressed = isMac ? e.metaKey : e.ctrlKey;
                
                if (isModifierPressed && e.key.toLowerCase() === "k") {
                    e.preventDefault();
                    searchRef.current.focus();
                    return; 
                }
            }

            // If user is typing in an input, stop processing other global shortcuts (like Space)
            if (isTyping) return;

            // 2. Spacebar (Only runs if warpButtonRef is provided)
            if (warpButtonRef?.current && !isStarted) {
                if (e.code === "Space") {
                    e.preventDefault();
                    warpButtonRef.current.click();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [searchRef, warpButtonRef, isStarted]);
};