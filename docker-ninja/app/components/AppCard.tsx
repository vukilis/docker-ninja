import { getIcon } from '../hooks/icons';

export const AppCard = ({ app, onClick }: { app: any; onClick: () => void }) => {
    const icon = getIcon(app.slug, app.icon_url);
    return (
        <div 
        onClick={onClick} 
        className="group aspect-square max-w-[160px] mx-auto w-full bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-all hover:shadow-2xl hover:shadow-blue-500/10"
        >
        <div className="w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-transform">
            {icon?.type === 'url' ? (
            <img src={icon.src} alt={app.name} className="w-full h-full object-contain" />
            ) : icon?.svg ? (
            <div dangerouslySetInnerHTML={{ __html: icon.svg }} className="w-full h-full fill-slate-400 group-hover:fill-blue-500 transition-colors" />
            ) : (
            <div className="w-full h-full flex items-center justify-center text-[8px] text-slate-500 border border-dashed border-slate-700 rounded uppercase">No Icon</div>
            )}
        </div>
        <p className="mt-3 text-[14px] leading-tight uppercase tracking-tighter text-slate-400 group-hover:text-blue-500 font-bold transition-colors text-center w-full px-1 line-clamp-2 overflow-hidden">
            {app.name}
        </p>
        </div>
    );
};