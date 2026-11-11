/**
 * LAB GUARDIAN - Tactical Mission Briefing Modal
 * Holographic transmission detailing crisis background, objectives, and stoichiometric guidance
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Radio, AlertOctagon, Terminal, X, ArrowLeft, ShieldAlert } from 'lucide-react';

interface BriefingModalProps {
  onClose: () => void;
  onOpenMap: () => void;
}

export const BriefingModal: React.FC<BriefingModalProps> = ({ onClose, onOpenMap }) => {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-2xl bg-[#090e1a]/95 border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(0,229,255,0.2)] text-slate-100 overflow-hidden"
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  اتصال تكتيكي مشفر: الدكتورة سارة
                  <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                    LIVE COMMS
                  </span>
                </h2>
                <p className="text-xs text-slate-400">كبير علماء مجمع الأبحاث الكيميائية المتقدمة</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
              aria-label="إغلاق الإحاطة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Hologram Body */}
          <div className="p-6 space-y-4 text-sm text-slate-200 leading-relaxed max-h-[70vh] overflow-y-auto">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/20 flex gap-3.5">
              <ShieldAlert className="w-6 h-6 text-cyan-400 shrink-0 mt-0.5" />
              <div className="space-y-1.5">
                <div className="font-bold text-white text-base">حالة الطوارئ في مفاعل نقطة الصفر (Reactor Zero)</div>
                <p className="text-xs text-slate-300 leading-normal">
                  «أيها الحارس الميداني، لقد خرجت أنظمة الاحتواء الذاتي عن السيطرة في جميع أجنحة المنشأة إثر خلل في
                  معايرة نسب المواد المتفاعلة. مفاعل نقطة الصفر يوشك على الوصول إلى الانصهار الحراري الحرج إذا لم نعيد
                  ضبط الحسابات المتكافئة بدقة.»
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                خارطة التحرك التكتيكي عبر القطاعات الأربعة:
              </h3>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <span className="font-bold text-white">جناح أبحاث المعادلات (القطاع 01):</span>
                    <span className="text-slate-300 block mt-0.5">
                      تفسير المعاملات الكيميائية في تفاعل أكسدة الحديد الموزون (4Fe + 3O2 -&gt; 2Fe2O3) ودلالاتها على أعداد الجسيمات والمولات.
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <span className="font-bold text-white">مصفاة الكتلة الصناعية (القطاع 02):</span>
                    <span className="text-slate-300 block mt-0.5">
                      التحقق من قانون حفظ الكتلة عبر حساب كتل احتراق البروبان (C3H8 + 5O2 -&gt; 3CO2 + 4H2O) واشتقاق النسب المولية المتبادلة لبروميد البوتاسيوم.
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 font-mono font-bold flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <span className="font-bold text-white">قبو النسب المولية والمفاعل الأخير (القطاع 03):</span>
                    <span className="text-slate-300 block mt-0.5">
                      تطبيق علاقة n(n-1) في مصفوفة الحسابات ومواجهة الزعيم الآلي الثقيل، حيث تُضعف الإجابات الصحيحة لاحتراق البيوتان درعه الحركي حتى قهره تماماً.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-200 flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                تذكر: يمكنك شحن دروعك وطاقتك في أي وقت عند محطة العتاد بالمقر الرئيسي. بالتوفيق، المنشأة تعتمد عليك!
              </span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition-colors"
            >
              إغلاق الإحاطة
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenMap();
              }}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all cursor-pointer active:scale-95"
            >
              <span>فتح خريطة القطاعات</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
