/**
 * LAB GUARDIAN - Grand Campaign Victory & Completion Report Modal
 * Displays full campaign completion statistics, 4 cleared sectors, and stoichiometric mastery badges
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy,
  CheckCircle2,
  Atom,
  Clock,
  Sparkles,
  RotateCcw,
  Compass,
  Award,
  Zap,
} from 'lucide-react';
import { LocationDefinition } from '../game/campaign/CampaignTypes';

interface CampaignVictoryModalProps {
  score: number;
  comboMax: number;
  accuracyPercent: number;
  totalTimeSeconds: number;
  completedLocations: LocationDefinition[];
  onReturnToHub: () => void;
  onRestartCampaign: () => void;
}

export const CampaignVictoryModal: React.FC<CampaignVictoryModalProps> = ({
  score,
  comboMax,
  accuracyPercent,
  totalTimeSeconds,
  completedLocations,
  onReturnToHub,
  onRestartCampaign,
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const masterySkills = [
    'تفسير المعاملات الكيميائية بالمولات وأعداد الجسيمات الممثلة (4Fe + 3O2 -> 2Fe2O3).',
    'التحقق الكمي من قانون حفظ الكتلة وتساوي كتل المتفاعلات والنواتج بالجرام.',
    'اشتقاق النسب المولية المباشرة والمقلوبة وتأثيرها على العمليات الحسابية (2K + Br2 -> 2KBr).',
    'تطبيق العلاقة الرياضية n(n - 1) لإيجاد إجمالي عدد النسب المولية الموجهة في أي تفاعل.',
    'إجراء الحسابات الكيميائية المتكافئة الشاملة لاحتراق البيوتان وتعطيل درع حارس المفاعل.',
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-lg">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-[#090e1a]/98 border-2 border-cyan-400/60 rounded-3xl shadow-[0_0_80px_rgba(0,229,255,0.35)] text-slate-100 overflow-hidden"
          dir="rtl"
        >
          {/* Header Banner */}
          <div className="relative px-6 py-6 text-center border-b border-slate-800 bg-gradient-to-b from-cyan-950/40 via-slate-900/60 to-transparent">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/15 border-2 border-cyan-400/50 shadow-[0_0_30px_rgba(0,229,255,0.4)] mb-3">
              <Trophy className="w-9 h-9 text-cyan-300 animate-bounce" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-1.5 flex items-center justify-center gap-2">
              اكتملت الحملة بنجاح: تم إنقاذ مفاعل نقطة الصفر!
            </h1>
            <p className="text-xs sm:text-sm text-cyan-300/90 font-medium max-w-xl mx-auto">
              تمت استعادة استقرار قلب المفاعل النووي بالكامل، وتطهير جميع قطاعات المنشأة، وقهر حارس المختبر الآلي.
            </p>
          </div>

          {/* Content Body */}
          <div className="p-6 space-y-5 overflow-y-auto max-h-[62vh]">
            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <div className="text-[11px] text-slate-400 mb-1 flex items-center justify-center gap-1">
                  <Award className="w-3.5 h-3.5 text-cyan-400" />
                  النقاط التراكمية
                </div>
                <div className="text-xl font-black text-cyan-300 font-mono">{score.toLocaleString('ar-EG')}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <div className="text-[11px] text-slate-400 mb-1 flex items-center justify-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  أعلى كومبو
                </div>
                <div className="text-xl font-black text-amber-300 font-mono">x{comboMax}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <div className="text-[11px] text-slate-400 mb-1 flex items-center justify-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  دقة الحسابات
                </div>
                <div className="text-xl font-black text-emerald-300 font-mono">{accuracyPercent}%</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <div className="text-[11px] text-slate-400 mb-1 flex items-center justify-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  الوقت الكلي
                </div>
                <div className="text-xl font-black text-purple-300 font-mono">{formatTime(totalTimeSeconds)}</div>
              </div>
            </div>

            {/* Cleared Sectors Status */}
            <div>
              <h2 className="text-xs font-bold text-slate-300 mb-2.5 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                سجل إنجاز قطاعات المنشأة الأربعة:
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {completedLocations.map((loc) => (
                  <div
                    key={loc.id}
                    className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-white">{loc.nameAr}</div>
                      <div className="text-[11px] text-slate-400">{loc.codenameAr}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold text-[10px]">
                      تم التطهير بنجاح
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mastered Stoichiometric Competencies */}
            <div>
              <h2 className="text-xs font-bold text-cyan-300 mb-2 flex items-center gap-2">
                <Atom className="w-4 h-4 text-cyan-400" />
                الكفايات الكيميائية المتقنة (الحسابات الكيميائية - Stoichiometry):
              </h2>
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                {masterySkills.map((skill, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-normal">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={onRestartCampaign}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>بدء حملة جديدة (New Game+)</span>
            </button>

            <button
              onClick={onReturnToHub}
              className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.4)] cursor-pointer transition-all active:scale-95"
            >
              <Compass className="w-4 h-4" />
              <span>العودة إلى المقر الرئيسي (HUB)</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
