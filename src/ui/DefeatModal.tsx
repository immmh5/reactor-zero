/**
 * LAB GUARDIAN - Defeat Modal Component
 * Displays mission failure cause, stats summary, and retry actions
 */

import React from 'react';
import { Skull, RotateCcw, Home, AlertOctagon } from 'lucide-react';
import { sounds } from '../game/audio/SoundEffects';

interface DefeatModalProps {
  reasonAr: string;
  score: number;
  completedMissions: number;
  totalMissions: number;
  incorrectAnswers: number;
  onRestart: () => void;
  onReturnToMenu: () => void;
}

export const DefeatModal: React.FC<DefeatModalProps> = ({
  reasonAr,
  score,
  completedMissions,
  totalMissions,
  incorrectAnswers,
  onRestart,
  onReturnToMenu,
}) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none animate-in zoom-in-95 duration-200">
      <div className="w-full max-w-md bg-[#080d1a] border-2 border-rose-600 rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col gap-6 text-right text-slate-100">
        {/* Skull / Failure Badge */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-950/80 border-2 border-rose-500 flex items-center justify-center text-rose-400 shadow-xl shadow-rose-600/30">
          <Skull className="w-9 h-9" />
        </div>

        {/* Title */}
        <div className="text-center">
          <span className="text-[11px] font-mono font-bold text-rose-400 uppercase tracking-widest block mb-1">
            فشلت العملية // MISSION TERMINATED
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            انهيار أمان المختبر!
          </h2>
        </div>

        {/* Failure Cause */}
        <div className="bg-rose-950/40 border border-rose-800/60 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs text-rose-200">
          <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-rose-300 block mb-0.5">سبب الفشل:</span>
            <p className="leading-relaxed">{reasonAr || 'نفدت طاقة البذلة أو انهار استقرار المفاعل الكيميائي.'}</p>
          </div>
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-3 gap-2.5 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 text-center">
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5">النقاط</span>
            <span className="font-mono text-base font-black text-cyan-300">{score}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5">المهمات</span>
            <span className="font-mono text-base font-black text-emerald-400">
              {completedMissions} / {totalMissions}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5">الأخطاء</span>
            <span className="font-mono text-base font-black text-rose-400">{incorrectAnswers}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => {
              sounds.playSuccess();
              onRestart();
            }}
            className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold text-sm shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>إعادة المحاولة فوراً</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playInteract();
              onReturnToMenu();
            }}
            className="py-3 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-sm border border-slate-700 flex items-center justify-center gap-2 transition-colors"
          >
            <Home className="w-4 h-4 text-slate-400" />
            <span>القائمة الرئيسية</span>
          </button>
        </div>
      </div>
    </div>
  );
};
