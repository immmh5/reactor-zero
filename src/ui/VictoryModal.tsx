/**
 * LAB GUARDIAN - Victory / Mission Success Modal
 * Celebrates complete mastery of Stoichiometric Calculations (الحسابات الكيميائية) and Boss Defeat
 */

import React from 'react';
import { Award, CheckCircle2, RotateCcw, Home, Sparkles, Scale, Atom, Grid, Flame } from 'lucide-react';
import { sounds } from '../game/audio/SoundEffects';

interface VictoryModalProps {
  score: number;
  comboMax: number;
  onRestart: () => void;
  onReturnToMenu: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  score,
  comboMax,
  onRestart,
  onReturnToMenu,
}) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none animate-in zoom-in-95 duration-300">
      <div className="w-full max-w-lg bg-[#080d1a] border-2 border-emerald-500 rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col gap-6 text-right text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Trophy / Victory Badge */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-950/80 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/30">
          <Award className="w-9 h-9" />
        </div>

        {/* Title */}
        <div className="text-center">
          <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-widest block mb-1">
            تمت المهمة بنجاح // STOICHIOMETRIC MASTERY
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            استقرار المفاعل صفر وهزيمة الحارس الآلي!
          </h2>
        </div>

        {/* Score & Combo Summary */}
        <div className="grid grid-cols-2 gap-3 bg-slate-900/90 p-3.5 rounded-2xl border border-emerald-900/50 text-center">
          <div>
            <span className="text-[11px] text-slate-400 block mb-0.5">مجموع النقاط</span>
            <span className="font-mono text-xl font-black text-cyan-300">{score}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block mb-0.5">أعلى مضاعف سلسلة</span>
            <span className="font-mono text-xl font-black text-amber-300">{comboMax}x</span>
          </div>
        </div>

        {/* Real Curriculum Learning Objectives Mastered */}
        <div className="bg-slate-900/90 rounded-2xl p-4 border border-emerald-900/40 flex flex-col gap-2.5 text-xs">
          <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block border-b border-emerald-900/60 pb-1">
            الأهداف التعليمية المحققة في الحسابات الكيميائية:
          </span>

          <div className="flex items-start gap-2 text-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>تفسير المعادلات الموزونة:</strong> الربط الصحيح بين المعاملات والجسيمات الممثلة (ذرات، جزيئات، وحدات صيغة) والمولات (4Fe + 3O2 → 2Fe2O3).
            </span>
          </div>

          <div className="flex items-start gap-2 text-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>قانون حفظ الكتلة:</strong> إثبات أن كتلة المتفاعلات تساوي كتلة النواتج في احتراق البروبان (204.1 جم = 204.11 جم).
            </span>
          </div>

          <div className="flex items-start gap-2 text-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>النسب المولية الموجهة:</strong> اشتقاق النسب بين المواد بدقة وفهم أثر عكس النسبة (2K + Br2 → 2KBr).
            </span>
          </div>

          <div className="flex items-start gap-2 text-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>قانون مصفوفة النسب n(n - 1):</strong> حساب عدد النسب المولية الممكنة لتفاعلات تشمل 3 مواد (6 نسب) و 4 مواد (12 نسبة).
            </span>
          </div>

          <div className="flex items-start gap-2 text-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>الحسابات الكمية الشاملة:</strong> اختراق درع الزعيم وهزيمته عبر حساب كميات النواتج المتوقعة في احتراق البيوتان.
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => {
              sounds.playSuccess();
              onRestart();
            }}
            className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>إعادة التحدي</span>
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
