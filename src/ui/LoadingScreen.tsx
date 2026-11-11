/**
 * LAB GUARDIAN - Loading Screen Component
 */

import React from 'react';
import { Atom } from 'lucide-react';

interface LoadingScreenProps {
  progressPercent: number;
  statusText?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  progressPercent,
  statusText = 'جاري تهيئة محرك المحاكاة ثلاثية الأبعاد والمواد...',
}) => {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-6 bg-[#050811] text-white select-none">
      <div className="w-full max-w-sm flex flex-col items-center gap-6 text-center">
        {/* Animated Core Logo */}
        <div className="relative flex items-center justify-center w-20 h-20">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-ping" />
          <div className="absolute inset-0 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
          <div className="w-12 h-12 rounded-full bg-cyan-950/80 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow-xl shadow-cyan-500/30">
            <Atom className="w-7 h-7" />
          </div>
        </div>

        {/* Title */}
        <div>
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-white font-sans">
            LAB GUARDIAN
          </h2>
          <span className="text-xs font-mono font-bold text-amber-400 tracking-widest block mt-0.5">
            REACTOR ZERO // المفاعل صفر
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full flex flex-col gap-2">
          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-cyan-950">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-200 rounded-full"
              style={{ width: `${Math.max(5, Math.min(100, progressPercent))}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 px-1">
            <span>{statusText}</span>
            <span className="text-cyan-400 font-bold">{progressPercent}%</span>
          </div>
        </div>

        {/* Educational Tip */}
        <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl text-[11px] text-slate-400 leading-relaxed mt-2">
          <span className="text-cyan-400 font-bold block mb-0.5">إرشاد كيميائي:</span>
          في الحسابات الكيميائية، تُحدد المعاملات في المعادلة الموزونة نسب أعداد المولات والجسيمات الممثلة، وتخضع دائماً لقانون حفظ الكتلة.
        </div>
      </div>
    </div>
  );
};
