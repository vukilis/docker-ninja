import { useClipboardCopy } from '../utils/CopyLogic'; 

interface ShareButtonProps {
    app: {
        slug?: string;
        id: string | number;
        name: string;
    };
    shouldTrack?: boolean;
}

export function ShareButton({ app, shouldTrack = false }: ShareButtonProps) {
    const { copied, handleCopy } = useClipboardCopy();

    const handleShareClick = async () => {
        const appSlug = app.slug || app.id;
        const cleanShareUrl = `${window.location.origin}/app/${appSlug}`;

        if (navigator.share) {
            try {
                await navigator.share({ 
                    title: app.name, 
                    text: `Check out ${app.name} on Docker Ninja`, 
                    url: cleanShareUrl 
                });
            } catch (err) {
                console.warn("Native share failed, falling back to copy:", err);
                handleCopy(cleanShareUrl, shouldTrack); 
            }
        } else {
            handleCopy(cleanShareUrl, shouldTrack);
        }
    };

    return (
        <button 
            onClick={handleShareClick} 
            className={`group relative flex items-center justify-center w-10 h-10 rounded-full border cursor-pointer 
                transition-all duration-300 ease-out active:scale-90
                ${copied 
                    ? 'border-green-500 bg-green-500/10' 
                    : 'border-blue-500 dark:border-blue-950 md:border-slate-200 md:dark:border-slate-800 md:hover:border-blue-500/50 md:hover:bg-blue-500/5'
                }`}
        >
            {copied ? (
                <svg className="w-4 h-4 text-green-500 animate-in zoom-in spin-in-12 duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-blue-500 md:text-slate-500 md:group-hover:text-blue-500 transition-transform duration-200 group-hover:scale-110">
                    <path d="M3 12a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"></path>
                    <path d="M15 6a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"></path>
                    <path d="M15 18a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"></path>
                    <path d="M8.7 10.7l6.6 -3.4"></path>
                    <path d="M8.7 13.3l6.6 3.4"></path>
                </svg>
            )}
        </button>
    );
}