import React from 'react';
import Image from 'next/image';
import { getIcon } from '../hooks/icons';

interface AppCardProps {
    app: {
        id: string | number;
        slug?: string;
        name: string;
        icon_url?: string;
        [key: string]: unknown;
    };
    onClick: () => void;
}

export const AppCard: React.FC<AppCardProps> = ({ app, onClick }) => {
    const icon = getIcon(app.slug || '', app.icon_url);

    return (
        <div 
            onClick={onClick} 
            className="group relative aspect-square max-w-[160px] mx-auto w-full bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-2 md:p-3 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:border-blue-500/50 hover:shadow-[0_20px_40px_rgba(37,99,235,0.15)] hover:-translate-y-1 active:scale-95 overflow-hidden"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative w-11 h-11 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 ease-out">
                {icon?.type === 'url' && icon.src ? (
                    <Image
                        src={icon.src}
                        alt={app.name}
                        width={96}
                        height={96}
                        unoptimized
                        className="w-full h-full object-contain filter dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.1)] group-hover:drop-shadow-[0_0_12px_rgba(37,99,235,0.3)] transition-all"
                    />
                ) : icon?.svg ? (
                    <div 
                        dangerouslySetInnerHTML={{ __html: icon.svg }} 
                        className="w-full h-full fill-slate-400 dark:fill-slate-500 group-hover:fill-blue-500 transition-colors duration-300" 
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[7px] font-black tracking-widest text-slate-400 dark:text-slate-600 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl uppercase p-1">
                        <span>No</span>
                        <span>Icon</span>
                    </div>
                )}
            </div>

            <p className="mt-3 text-[14px] leading-tight uppercase tracking-tighter text-slate-400 group-hover:text-blue-500 font-bold transition-colors text-center w-full line-clamp-2 overflow-hidden overflow-ellipsis">
                {app.name}
            </p>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-1 bg-blue-600 rounded-full transition-all duration-300 group-hover:w-1/3" />
        </div>
    );
};