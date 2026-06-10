'use client';

import Link from 'next/link';
import { Rocket } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden bg-slate-600 dark:bg-[#0d1117]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="star-layer"></div>
      </div>

      <div className="relative z-10 ninja-card max-w-lg w-full text-center bg-white dark:bg-slate-900 backdrop-blur-md rounded-xl p-10 shadow-lg border-blue-600">
        <div className="flex justify-center mb-6 relative">
          <div className="absolute inline-flex h-24 w-24 rounded-full bg-blue-500/20 animate-ping opacity-30"></div>
          <Rocket
            size={64}
            className="text-blue-500 relative z-10 drop-shadow-[0_0_12px_rgba(59,130,246,0.6)]"
          />
        </div>

        <h1 className="text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-blue-400 to-blue-700 mb-2">
          404
        </h1>

        <h2 className="text-xl uppercase font-bold text-slate-600 dark:text-slate-200 mb-3">
          Lost in the Void
        </h2>

        <p className="text-sm text-slate-600 dark:text-slate-400 mb-8 leading-relaxed font-mono">
          This fragment of the universe has drifted into deep space.
          The coordinates you requested do not match any known registry.
        </p>

        <Link
          href="/"
          className="inline-flex items-center uppercase gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 font-medium shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.65)]"
        >
          <Rocket size={18} />
          Return to Base
        </Link>
      </div>

      <style>{`
        .star-layer {
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(1px 1px at 20px 30px, rgba(255,255,255,0.8), transparent),
            radial-gradient(1px 1px at 40px 70px, rgba(255,255,255,0.6), transparent),
            radial-gradient(1.5px 1.5px at 50px 160px, rgba(255,255,255,0.9), transparent),
            radial-gradient(1px 1px at 90px 40px, rgba(255,255,255,0.5), transparent),
            radial-gradient(1.5px 1.5px at 130px 80px, rgba(255,255,255,0.7), transparent),
            radial-gradient(1px 1px at 160px 120px, rgba(255,255,255,0.6), transparent),
            radial-gradient(1px 1px at 200px 50px, rgba(255,255,255,0.4), transparent),
            radial-gradient(2px 2px at 250px 180px, rgba(255,255,255,0.9), transparent),
            radial-gradient(1px 1px at 300px 90px, rgba(255,255,255,0.5), transparent),
            radial-gradient(1.5px 1.5px at 350px 140px, rgba(255,255,255,0.7), transparent),
            radial-gradient(1px 1px at 400px 30px, rgba(255,255,255,0.6), transparent),
            radial-gradient(1px 1px at 450px 200px, rgba(255,255,255,0.4), transparent),
            radial-gradient(1.5px 1.5px at 500px 100px, rgba(255,255,255,0.8), transparent),
            radial-gradient(1px 1px at 550px 60px, rgba(255,255,255,0.5), transparent),
            radial-gradient(1px 1px at 600px 170px, rgba(255,255,255,0.6), transparent);
          background-size: 650px 220px;
          animation: drift 60s linear infinite;
          opacity: 1;
        }

        @keyframes drift {
          from { transform: translateY(0); }
          to { transform: translateY(-220px); }
        }
      `}</style>
    </div>
  );
}
