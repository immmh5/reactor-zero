/**
 * LAB GUARDIAN - Scientific Visual Companion Component
 * Renders scientifically meaningful, domain-specific visual diagrams and models
 * next to examination questions based on the active curriculum skill.
 */

import React from 'react';
import { CurriculumSkillId, ExamQuestion } from '../game/academy/AcademyTypes';
import { Scale, Atom, GitCompare, Grid, ArrowLeftRight, Layers, Calculator, Binary } from 'lucide-react';

interface QuestionVisualCompanionProps {
  question: ExamQuestion;
}

export const QuestionVisualCompanion: React.FC<QuestionVisualCompanionProps> = ({ question }) => {
  const { skillId, equationDisplay } = question;

  return (
    <div className="w-full h-full min-h-[220px] rounded-2xl bg-gradient-to-b from-slate-950/90 to-slate-900/90 border border-purple-500/30 p-4 flex flex-col justify-between select-none">
      {/* Skill Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2 text-xs">
        <span className="font-bold text-purple-300 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-purple-400" />
          <span>المساعد البصري التوضيحي</span>
        </span>
        <span className="font-mono text-[10px] text-slate-400">{question.topicBadgeAr}</span>
      </div>

      {/* Visual Body based on curriculum skill */}
      <div className="flex-1 flex flex-col justify-center items-center py-2">
        {/* 1. EQUATION INTERPRETATION */}
        {skillId === 'equation_interpretation' && (
          <div className="w-full space-y-3 text-center">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-cyan-500/30 font-mono text-cyan-300 font-bold text-xs" dir="ltr">
              {equationDisplay || '4Fe(s) + 3O2(g) -> 2Fe2O3(s)'}
            </div>
            <div className="grid grid-cols-2 gap-2 text-right text-[11px]">
              <div className="p-2 rounded-lg bg-cyan-950/40 border border-cyan-500/40">
                <span className="font-bold text-cyan-300 block mb-0.5">المعامل (على اليسار):</span>
                <span className="text-slate-300 text-[10px]">يدل على عدد المولات أو الجسيمات المتفاعلة.</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-700">
                <span className="font-bold text-slate-300 block mb-0.5">الرقم السفلي (Subscript):</span>
                <span className="text-slate-400 text-[10px]">يدل على عدد ذرات العنصر داخل الصيغة الكيميائية.</span>
              </div>
            </div>
          </div>
        )}

        {/* 2. REPRESENTATIVE PARTICLES */}
        {skillId === 'representative_particles' && (
          <div className="w-full space-y-2.5">
            <div className="text-center text-xs font-bold text-slate-200 flex items-center justify-center gap-1.5">
              <Atom className="w-4 h-4 text-cyan-400" />
              <span>أنواع الجسيمات الممثلة للمواد</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
              <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-700 flex flex-col items-center">
                <span className="w-5 h-5 rounded-full bg-slate-400 border border-white flex items-center justify-center font-bold text-slate-950 text-[9px] mb-1">
                  Fe
                </span>
                <span className="font-bold text-slate-200">الذرة (Atom)</span>
                <span className="text-slate-400 text-[9px] mt-0.5">للفلزات النقية</span>
              </div>
              <div className="p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex flex-col items-center">
                <span className="flex items-center gap-0.5 mb-1">
                  <span className="w-4 h-4 rounded-full bg-rose-500 border border-white" />
                  <span className="w-4 h-4 rounded-full bg-rose-500 border border-white" />
                </span>
                <span className="font-bold text-cyan-300">الجزيء (Molecule)</span>
                <span className="text-slate-400 text-[9px] mt-0.5">للمركبات التساهمية</span>
              </div>
              <div className="p-2 rounded-xl bg-purple-950/40 border border-purple-500/30 flex flex-col items-center">
                <span className="flex items-center gap-0.5 mb-1">
                  <span className="w-4 h-4 rounded-full bg-purple-500" />
                  <span className="w-4 h-4 rounded-full bg-amber-600" />
                </span>
                <span className="font-bold text-purple-300">وحدة صيغة</span>
                <span className="text-slate-400 text-[9px] mt-0.5">للمركبات الأيونية</span>
              </div>
            </div>
          </div>
        )}

        {/* 3. MOLE RELATIONSHIPS */}
        {skillId === 'mole_relationships' && (
          <div className="w-full space-y-2 text-center">
            <div className="p-2 rounded-xl bg-slate-900 border border-purple-500/30 text-xs font-mono text-purple-300" dir="ltr">
              {equationDisplay || '4Fe + 3O2 -> 2Fe2O3'}
            </div>
            <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 flex items-center justify-around text-xs">
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-slate-400">المتفاعلات</span>
                <span className="font-bold font-mono text-cyan-300">المعاملات</span>
              </div>
              <ArrowLeftRight className="w-4 h-4 text-purple-400" />
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-slate-400">النسبة المباشرة</span>
                <span className="font-bold font-mono text-amber-300">نسب المولات</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400">مضاعفة أو تنصيف أي مادة يغير سائر المواد بنفس النسبة المتكافئة.</p>
          </div>
        )}

        {/* 4. CONSERVATION OF MASS */}
        {skillId === 'conservation_of_mass' && (
          <div className="w-full space-y-2 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-300">
              <Scale className="w-4 h-4 text-amber-400" />
              <span>ميزان قانون حفظ الكتلة</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/30 flex items-center justify-between text-xs font-mono">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-sans">كتلة المتفاعلات</span>
                <span className="text-cyan-300 font-bold">∑ m(Reactants)</span>
              </div>
              <span className="text-xl font-bold text-amber-400">=</span>
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block font-sans">كتلة النواتج</span>
                <span className="text-emerald-300 font-bold">∑ m(Products)</span>
              </div>
            </div>
            <div className="text-[10px] text-slate-300 leading-tight">
              الكتلة لا تفنى ولا تستحدث أثناء التفاعل الكيميائي.
            </div>
          </div>
        )}

        {/* 5. REACTANT AND PRODUCT MASS */}
        {skillId === 'reactant_product_mass' && (
          <div className="w-full space-y-2 text-center">
            <div className="text-xs font-bold text-cyan-300 flex items-center justify-center gap-1.5">
              <Calculator className="w-4 h-4 text-cyan-400" />
              <span>قانون التحويل بين المول والكتلة</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-cyan-500/30 font-mono text-xs text-white">
              <span className="text-cyan-300 font-bold">m (g)</span> = <span className="text-amber-300 font-bold">n (mol)</span> × <span className="text-purple-300 font-bold">M (g/mol)</span>
            </div>
            <div className="text-[10px] text-slate-300">
              الكتلة بالجرام = عدد المولات × الكتلة المولية للمادة.
            </div>
          </div>
        )}

        {/* 6. DIRECTED MOLE RATIOS */}
        {skillId === 'directed_mole_ratios' && (
          <div className="w-full space-y-2 text-center">
            <div className="text-xs font-bold text-purple-300 flex items-center justify-center gap-1.5">
              <GitCompare className="w-4 h-4 text-purple-400" />
              <span>النسبة المولية الموجهة</span>
            </div>
            <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 flex items-center justify-center gap-3">
              <div className="flex flex-col items-center">
                <span className="font-mono text-xs font-bold text-cyan-300 pb-1 border-b border-purple-400">معامل المادة A</span>
                <span className="font-mono text-xs font-bold text-amber-300 pt-1">معامل المادة B</span>
              </div>
              <span className="text-xs text-slate-300 font-sans">= النسبة المولية (A / B)</span>
            </div>
            <p className="text-[10px] text-slate-400">النسبة موجهة وتعتمد على ترتيب المادتين في البسط والمقام.</p>
          </div>
        )}

        {/* 7. MOLE RATIO INVERSION */}
        {skillId === 'mole_ratio_inversion' && (
          <div className="w-full space-y-2 text-center">
            <div className="text-xs font-bold text-amber-300 flex items-center justify-center gap-1.5">
              <ArrowLeftRight className="w-4 h-4 text-amber-400" />
              <span>مقلوب النسبة المولية</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/30 flex items-center justify-center gap-4 text-xs font-mono">
              <span className="text-cyan-300 font-bold text-sm">4 / 3</span>
              <ArrowLeftRight className="w-4 h-4 text-amber-400" />
              <span className="text-emerald-300 font-bold text-sm">3 / 4 (0.75)</span>
            </div>
            <p className="text-[10px] text-slate-300">قلب البسط والمقام يعطي مقلوب النسبة لتحويل الحساب بالاتجاه المعاكس.</p>
          </div>
        )}

        {/* 8. THE n(n-1) RELATIONSHIP */}
        {skillId === 'n_formula_calculation' && (
          <div className="w-full space-y-2 text-center">
            <div className="text-xs font-bold text-indigo-300 flex items-center justify-center gap-1.5">
              <Grid className="w-4 h-4 text-indigo-400" />
              <span>قانون مصفوفة النسب n(n - 1)</span>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 font-mono text-xs text-white">
              <span>عدد النسب = </span>
              <span className="text-indigo-300 font-bold">n × (n - 1)</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300">
              <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                <span>3 مواد: 3(2) = </span>
                <span className="font-bold text-cyan-300">6 نسب</span>
              </div>
              <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                <span>4 مواد: 4(3) = </span>
                <span className="font-bold text-purple-300">12 نسبة</span>
              </div>
            </div>
            <p className="text-[9px] text-slate-400">تُستبعد النسب الذاتية القطرية مثل (A/A = 1).</p>
          </div>
        )}

        {/* 9. APPLYING MOLE RATIOS */}
        {skillId === 'mole_ratio_application' && (
          <div className="w-full space-y-2 text-center">
            <div className="text-xs font-bold text-emerald-300 flex items-center justify-center gap-1.5">
              <Binary className="w-4 h-4 text-emerald-400" />
              <span>معامل التحويل المولي</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-emerald-500/30 font-mono text-[11px] text-slate-200">
              <span className="text-cyan-300">مولات المعلوم</span> ×
              <span className="text-amber-300"> (معامل المطلوب / معامل المعلوم)</span>
              <span> = </span>
              <span className="text-emerald-400 font-bold">مولات المطلوب</span>
            </div>
          </div>
        )}

        {/* 10. MULTI-STEP STOICHIOMETRY */}
        {skillId === 'multistep_stoichiometry' && (
          <div className="w-full space-y-2 text-center">
            <div className="text-xs font-bold text-amber-300 flex items-center justify-center gap-1.5">
              <Calculator className="w-4 h-4 text-amber-400" />
              <span>المخطط المتسلسل للحسابات</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-amber-500/30 flex items-center justify-between text-[10px] font-mono">
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">كتلة A (g)</span>
              <span className="text-amber-400">➔</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300">مولات A</span>
              <span className="text-amber-400">➔</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-purple-300">مولات B</span>
              <span className="text-amber-400">➔</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-emerald-300">كتلة B (g)</span>
            </div>
            <p className="text-[10px] text-slate-300">استخدم الكتلة المولية ثم النسبة المولية من المعادلة الموزونة.</p>
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="text-[10px] text-slate-500 text-center pt-1 border-t border-slate-800/80">
        الزمن المحدد: {question.timeLimitSeconds} ثانية | 80% درجة الاجتياز المطلوبة
      </div>
    </div>
  );
};
