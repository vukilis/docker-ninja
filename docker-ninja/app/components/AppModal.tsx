// src/components/AppModal.tsx
export default function AppModal({ app, onClose }: { app: any; onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="bg-gray-900 border border-green-800 w-full max-w-2xl p-8 font-mono shadow-2xl shadow-green-900/20">
            <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl text-green-500 uppercase">{app.name}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-8 text-sm">
            <div>
                <h3 className="text-gray-500 mb-2 underline">App Details</h3>
                <p>Website: <a href={app.website} className="text-blue-400 hover:underline">Link</a></p>
                <p>Docs: <a href={app.docs} className="text-blue-400 hover:underline">Link</a></p>
                <p>GitHub: <a href={app.github} className="text-blue-400 hover:underline">Repo</a></p>
            </div>
            <div>
                <h3 className="text-gray-500 mb-2 underline">Script Details</h3>
                <p>Category: <span className="text-green-300">{app.category}</span></p>
                <p>Source: <a href="#" className="text-blue-400 hover:underline">View</a></p>
                <p>Runs in: <span className="text-green-300">{app.runsIn || 'PVE/LXC'}</span></p>
            </div>
            </div>
        </div>
        </div>
    );
}