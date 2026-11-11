/**
 * LAB GUARDIAN - Controls Information Modal
 * Visual diagram of movement, jumping, interaction, and real combat firing
 */

import React from 'react';
import { X, Navigation, FastForward, ArrowUpCircle, Hand, MousePointer, Crosshair } from 'lucide-react';

interface ControlsModalProps {
  onClose: () => void;
}

export const ControlsModal: React.FC<ControlsModalProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#080d1a] border-2 border-cyan-500/50 rounded-3xl shadow-2xl p-6 sm:p-7 flex flex-col gap-5 text-right">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-lg font-black text-white">دليل التحكم وأنظمة البذلة والقتال</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="إغلاق"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Control Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-cyan-950/80 text-cyan-400 shrink-0">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white block mb-0.5">التحرك (WASD / الأسهم)</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                التحرك في اتجاه الكاميرا بسلاسة للأمام والخلف والجانبين.
              </p>
            </div>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-950/80 text-amber-400 shrink-0">
              <FastForward className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white block mb-0.5">الركض السريع (SHIFT)</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                مضاعفة سرعة الحركة للتنقل السريع والمناورة في المعركة.
              </p>
            </div>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-blue-950/80 text-blue-400 shrink-0">
              <ArrowUpCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white block mb-0.5">القفز العمودي (SPACE)</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                القفز لتفادي قذائف الأعداء وتجاوز الأنابيب الأرضية.
              </p>
            </div>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-950/80 text-emerald-400 shrink-0">
              <Hand className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white block mb-0.5">التفاعل مع المحطات (E)</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                فتح محطات الحسابات الكيميائية الخمس وإنجاز التحديات.
              </p>
            </div>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-rose-900/50 flex items-start gap-3 sm:col-span-2">
            <div className="p-2 rounded-xl bg-rose-950/80 text-rose-400 shrink-0">
              <Crosshair className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white block mb-0.5">سلاح البلازما الدفاعي (F)</span>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                إطلاق مقذوفات بلازما حرارية لتدمير طائرات الحراسة وإلحاق الضرر بحارس المفاعل الآلي. يستهلك السلاح 12% من طاقة البدلة لكل طلقة، وتتجدد الطاقة ذاتياً.
              </p>
            </div>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 flex items-start gap-3 sm:col-span-2">
            <div className="p-2 rounded-xl bg-purple-950/80 text-purple-400 shrink-0">
              <MousePointer className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white block mb-0.5">تدوير الكاميرا (الماوس / السحب)</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                سحب الماوس لتدوير الرؤية 360 درجة، وعجلة الماوس لتقريب أو إبعاد الكاميرا. التقريب التام ينقل الرؤية تلقائياً لمنظور الشخص الأول.
              </p>
            </div>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-2xl border border-cyan-800/60 flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-300 font-bold font-mono text-xs">
              L
            </div>
            <div>
              <span className="font-bold text-white block mb-0.5">تثبيت مؤشر التصويب (L)</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                قفل الماوس في منتصف الشاشة للتصويب الاحترافي الحر (اضغط ESC أو L للإلغاء).
              </p>
            </div>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-2xl border border-indigo-800/60 flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-950 text-indigo-300 font-bold font-mono text-xs">
              V
            </div>
            <div>
              <span className="font-bold text-white block mb-0.5">منظور الشخص الأول (V)</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                التبديل الفوري بين منظور الشخص الأول (رؤية مباشرة) والشخص الثالث.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors mt-1"
        >
          فهمت، استكمال المهمة
        </button>
      </div>
    </div>
  );
};
