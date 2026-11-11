/**
 * LAB GUARDIAN - Stoichiometry Academy Interactive UI Modal
 * Accommodates the 3 Dedicated Academy Zones:
 * Area A: 3D Interactive Science Gallery (5 Demonstrations with rotate, zoom, before/after, atom counters)
 * Area B: Training & Practice Room (Worked examples, practice challenges, hints, explanations)
 * Area C: 20-Question Certification Examination Chamber (Timer, progress, submission, full student report)
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Atom,
  GraduationCap,
  Award,
  BookOpen,
  RotateCw,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  Scale,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { SCIENCE_DEMONSTRATIONS, ATOM_DEFINITIONS } from '../game/academy/ScienceDemonstrations';
import { ExamManager } from '../game/academy/ExamManager';
import { ExamQuestion, ExamResultReport, ScienceDemonstration } from '../game/academy/AcademyTypes';
import { sounds } from '../game/audio/SoundEffects';
import { AtomViewerCanvas } from './AtomViewerCanvas';
import { QuestionVisualCompanion } from './QuestionVisualCompanion';

export type AcademyMode = 'gallery' | 'training' | 'exam';

interface AcademyModalProps {
  initialMode: AcademyMode;
  initialStationId?: string;
  onClose: () => void;
  onCertificationSuccess?: (report: ExamResultReport) => void;
}

export const AcademyModal: React.FC<AcademyModalProps> = ({
  initialMode,
  initialStationId,
  onClose,
  onCertificationSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<AcademyMode>(initialMode);

  // --- AREA A: SCIENCE GALLERY STATE ---
  const [selectedDemoIndex, setSelectedDemoIndex] = useState<number>(() => {
    if (initialStationId === 'demo_station_2_o2') return 1;
    if (initialStationId === 'demo_station_3_propane') return 2;
    if (initialStationId === 'demo_station_4_kbr') return 3;
    if (initialStationId === 'demo_station_5_butane') return 4;
    return 0; // Default: Iron Oxidation
  });
  const [reactionStage, setReactionStage] = useState<'reactants' | 'products'>('reactants');
  const [modelRotationY, setModelRotationY] = useState<number>(0);
  const [zoomScale, setZoomScale] = useState<number>(1.0);
  const [isRotatingAuto, setIsRotatingAuto] = useState<boolean>(true);

  // --- AREA B: TRAINING ROOM STATE ---
  const [trainingExerciseIndex, setTrainingExerciseIndex] = useState<number>(0);
  const [trainingInput, setTrainingInput] = useState<string>('');
  const [trainingFeedback, setTrainingFeedback] = useState<{ isCorrect: boolean; messageAr: string } | null>(null);
  const [showTrainingHint, setShowTrainingHint] = useState<boolean>(false);
  const [showTrainingSolution, setShowTrainingSolution] = useState<boolean>(false);

  // --- AREA C: 20-QUESTION CERTIFICATION EXAM STATE ---
  const examMgrRef = useRef<ExamManager | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<ExamQuestion | null>(null);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(20);
  const [timerSeconds, setTimerSeconds] = useState<number>(30);
  const [timerProgress, setTimerProgress] = useState<number>(1.0);
  const [examInput, setExamInput] = useState<string>('');
  const [examReport, setExamReport] = useState<ExamResultReport | null>(null);
  const [isExamRunning, setIsExamRunning] = useState<boolean>(false);
  const [examTier, setExamTier] = useState<1 | 2 | 3>(1);

  // Initialize Exam Manager
  useEffect(() => {
    const mgr = new ExamManager({
      onQuestionChange: (q, qIdx, total) => {
        setCurrentQuestion(q);
        setQuestionIndex(qIdx);
        setTotalQuestions(total);
        setExamInput('');
      },
      onTimerTick: (secs, progress) => {
        setTimerSeconds(secs);
        setTimerProgress(progress);
      },
      onQuestionTimeout: () => {
        sounds.playImpact();
      },
      onExamFinished: (report) => {
        setIsExamRunning(false);
        setExamReport(report);
        if (report.hasPassed && onCertificationSuccess) {
          onCertificationSuccess(report);
        }
      },
    });

    examMgrRef.current = mgr;

    if (initialMode === 'exam') {
      mgr.startExam(1);
      setIsExamRunning(true);
    }

    return () => {
      mgr.cancelExam();
    };
  }, [initialMode, onCertificationSuccess]);

  // Tick exam timer in background
  useEffect(() => {
    if (!isExamRunning) return;
    const interval = setInterval(() => {
      examMgrRef.current?.update(0.2);
    }, 200);
    return () => clearInterval(interval);
  }, [isExamRunning]);

  // Auto-rotate 3D visualizer
  useEffect(() => {
    if (!isRotatingAuto || activeTab !== 'gallery') return;
    const interval = setInterval(() => {
      setModelRotationY((prev) => (prev + 0.03) % (Math.PI * 2));
    }, 50);
    return () => clearInterval(interval);
  }, [isRotatingAuto, activeTab]);

  const activeDemo: ScienceDemonstration = SCIENCE_DEMONSTRATIONS[selectedDemoIndex];

  // --- TRAINING PRACTICE EXERCISES ---
  const TRAINING_EXERCISES = useMemo(
    () => [
      {
        id: 't_1',
        titleAr: 'تمرين 1: تحديد معاملات المعادلة الموزونة',
        promptAr: 'في المعادلة: 4Al + 3O2 -> 2Al2O3، كم مولاً من الأكسجين O2 يتفاعل مع 4 مولات من الألومنيوم Al؟',
        equationAr: '4Al(s) + 3O2(g) -> 2Al2O3(s)',
        targetAnswer: '3',
        hintAr: 'انظر مباشرة إلى معامل O2 المكتوب في المعادلة الموزونة عندما يكون معامل Al هو 4.',
        solutionAr: 'المعاملات تدل على نسبة المولات المتفاعلة مباشرة؛ 4 مول Al تتفاعل مع 3 مول O2 لإنتاج 2 مول Al2O3.',
      },
      {
        id: 't_2',
        titleAr: 'تمرين 2: اشتقاق النسبة المولية وعكسها',
        promptAr: 'ما هي النسبة المولية الموجهة لـ (Al / O2) في تفاعل تكوين أكسيد الألومنيوم؟',
        equationAr: '4Al(s) + 3O2(g) -> 2Al2O3(s)',
        targetAnswer: '4/3',
        hintAr: 'النسبة المولية Al / O2 = (معامل Al) مقسوماً على (معامل O2).',
        solutionAr: 'النسبة هي 4/3. وعكسها هو 3/4 (مولات O2 لكل مولات Al).',
      },
      {
        id: 't_3',
        titleAr: 'تمرين 3: قانون حفظ الكتلة عبر الكتل المولية',
        promptAr: 'إذا كانت كتلة البروبان 44.1g وتفاعل مع 160.0g من الأكسجين، فما الكتلة الكلية للنواتج المتوقعة بالجرام؟',
        equationAr: 'C3H8 + 5O2 -> 3CO2 + 4H2O',
        targetAnswer: '204.1',
        hintAr: 'قانون حفظ الكتلة: كتلة النواتج الكلية = كتلة المتفاعلات الكلية (44.1 + 160.0).',
        solutionAr: 'مجموع كتل المتفاعلات = 44.1 + 160.0 = 204.1g، وهي تساوي تماماً كتلة النواتج.',
      },
      {
        id: 't_4',
        titleAr: 'تمرين 4: علاقة عدد النسب المولية n(n-1)',
        promptAr: 'كم نسبة مولية موجهة يمكن كتابتها لتفاعل بروميد البوتاسيوم المشتمل على 3 مواد كيميائية (2K + Br2 -> 2KBr)؟',
        equationAr: '2K(s) + Br2(l) -> 2KBr(s)',
        targetAnswer: '6',
        hintAr: 'طبق القانون n(n - 1) حيث n = 3.',
        solutionAr: 'عدد النسب = 3 × (3 - 1) = 3 × 2 = 6 نسب مولية موجهة.',
      },
    ],
    []
  );

  const handleStartExam = (tier: 1 | 2 | 3) => {
    setExamTier(tier);
    setExamReport(null);
    examMgrRef.current?.startExam(tier);
    setIsExamRunning(true);
    sounds.playInteract();
  };

  const handleExamSubmit = (answer: string) => {
    if (!examMgrRef.current || !isExamRunning) return;
    examMgrRef.current.submitAnswer(answer);
  };

  const handleTrainingCheck = () => {
    const ex = TRAINING_EXERCISES[trainingExerciseIndex];
    const cleanedUser = trainingInput.trim().replace(/،/g, '.').replace(/\s+/g, '');
    const cleanedTarget = ex.targetAnswer.trim().replace(/،/g, '.').replace(/\s+/g, '');

    const isMatch = cleanedUser === cleanedTarget || parseFloat(cleanedUser) === parseFloat(cleanedTarget);

    if (isMatch) {
      sounds.playSuccess();
      setTrainingFeedback({
        isCorrect: true,
        messageAr: 'إجابة صحيحة ومتقنة! أحسنت تطبيق المفهوم العلمي.',
      });
    } else {
      sounds.playDamageImpact();
      setTrainingFeedback({
        isCorrect: false,
        messageAr: 'إجابة غير دقيقة. راجع التلميح أو الحل النموذجي ثم أعد المحاولة.',
      });
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-5xl h-[92vh] flex flex-col bg-[#090e1a]/95 border border-cyan-500/40 rounded-2xl shadow-[0_0_60px_rgba(0,229,255,0.2)] text-slate-100 overflow-hidden"
          dir="rtl"
        >
          {/* Header & Navigation Tabs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-slate-900/80 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  أكاديمية الحسابات الكيميائية
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                    STOICHIOMETRY ACADEMY
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  منشأة التدريب العلمي، النماذج الجزيئية 3D، واختبارات التأهيل والاعتماد
                </p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-950/70 border border-slate-800 rounded-xl">
              <button
                onClick={() => {
                  setActiveTab('gallery');
                  sounds.playInteract();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'gallery'
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(0,229,255,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Atom className="w-3.5 h-3.5" />
                <span>المعرض 3D</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('training');
                  sounds.playInteract();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'training'
                    ? 'bg-amber-500 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>غرفة التدريب</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('exam');
                  sounds.playInteract();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'exam'
                    ? 'bg-purple-500 text-slate-950 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>اختبار التأهيل (20)</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer self-end sm:self-auto"
              aria-label="إغلاق الأكاديمية"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {/* ================= AREA A: 3D SCIENCE GALLERY ================= */}
            {activeTab === 'gallery' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
                {/* Left: Demo Selector List */}
                <div className="lg:col-span-4 flex flex-col gap-2.5">
                  <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Layers className="w-4 h-4" />
                    <span>العروض التفاعلية الخمسة المعتمدة:</span>
                  </div>

                  {SCIENCE_DEMONSTRATIONS.map((demo, idx) => (
                    <button
                      key={demo.id}
                      onClick={() => {
                        setSelectedDemoIndex(idx);
                        setReactionStage('reactants');
                        sounds.playInteract();
                      }}
                      className={`text-right p-3.5 rounded-xl border transition-all cursor-pointer ${
                        selectedDemoIndex === idx
                          ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_15px_rgba(0,229,255,0.2)]'
                          : 'border-slate-800/80 bg-slate-900/40 hover:bg-slate-900 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold text-white mb-1">{demo.titleAr}</div>
                      <div className="text-[11px] font-mono text-cyan-300 font-semibold mb-1" dir="ltr">
                        {demo.reactionFormula}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{demo.subtitleAr}</div>
                    </button>
                  ))}

                  {/* Atom Legend Card */}
                  <div className="mt-auto p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                      <Atom className="w-3.5 h-3.5 text-cyan-400" />
                      <span>دليل الذرات والجسيمات الممثلة:</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                      {Object.values(ATOM_DEFINITIONS).map((atom) => (
                        <div key={atom.element} className="flex items-center gap-1.5 text-slate-300">
                          <span
                            className="w-3 h-3 rounded-full border border-white/20 shrink-0"
                            style={{ backgroundColor: atom.colorHex }}
                          />
                          <span className="font-mono font-bold">{atom.symbol}</span>
                          <span className="text-[10px] text-slate-400">({atom.nameAr})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: 3D Visualization Arena & Scientific Data */}
                <div className="lg:col-span-8 flex flex-col gap-4">
                  {/* Top Bar for Demonstration Title & Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
                    <div>
                      <h3 className="text-base font-bold text-white">{activeDemo.titleAr}</h3>
                      <p className="text-xs text-cyan-300 font-mono" dir="ltr">
                        {activeDemo.reactionFormula}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Reactants vs Products toggle */}
                      {activeDemo.demonstrationType === 'atom_conservation' && (
                        <div className="flex items-center p-1 bg-slate-950 rounded-lg border border-slate-800">
                          <button
                            onClick={() => {
                              setReactionStage('reactants');
                              sounds.playInteract();
                            }}
                            className={`px-2.5 py-1 rounded text-xs font-bold cursor-pointer transition-colors ${
                              reactionStage === 'reactants' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'
                            }`}
                          >
                            المتفاعلات (قبل)
                          </button>
                          <button
                            onClick={() => {
                              setReactionStage('products');
                              sounds.playInteract();
                            }}
                            className={`px-2.5 py-1 rounded text-xs font-bold cursor-pointer transition-colors ${
                              reactionStage === 'products' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'
                            }`}
                          >
                            النواتج (بعد)
                          </button>
                        </div>
                      )}

                      {/* Rotation Toggle */}
                      <button
                        onClick={() => setIsRotatingAuto(!isRotatingAuto)}
                        className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                          isRotatingAuto
                            ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                        title="تبديل الدوران التلقائي"
                      >
                        <RotateCw className="w-4 h-4" />
                      </button>

                      {/* Zoom Controls */}
                      <button
                        onClick={() => setZoomScale((z) => Math.min(1.4, z + 0.1))}
                        className="px-2 py-1 rounded bg-slate-800 text-xs font-bold text-slate-300 hover:text-white"
                      >
                        +
                      </button>
                      <button
                        onClick={() => setZoomScale((z) => Math.max(0.7, z - 0.1))}
                        className="px-2 py-1 rounded bg-slate-800 text-xs font-bold text-slate-300 hover:text-white"
                      >
                        -
                      </button>
                    </div>
                  </div>

                  {/* 3D Visualizer Canvas Box with Babylon.js WebGL */}
                  <div className="relative flex-1 min-h-[280px] max-h-[350px] rounded-2xl bg-[#060c18] border border-cyan-500/40 overflow-hidden flex items-center justify-center">
                    <AtomViewerCanvas
                      demoId={activeDemo.id}
                      reactionStage={reactionStage}
                      isAutoRotating={isRotatingAuto}
                      className="w-full h-full"
                    />

                    {/* Bottom Indicator Overlay */}
                    <div className="absolute bottom-2.5 right-3 px-3 py-1 rounded-lg bg-slate-950/85 border border-slate-800 text-[11px] text-cyan-300 font-mono pointer-events-none flex items-center gap-2">
                      <span>نموذج تفاعلي ثلاثي الأبعاد (Babylon.js 3D)</span>
                      <span className="text-slate-500">|</span>
                      <span>اسحب للتدوير · عجلات للتقريب</span>
                    </div>
                  </div>

                  {/* Atom Conservation Counters & Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {/* Conservation Box */}
                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <div className="text-xs font-bold text-cyan-400 mb-2 flex items-center gap-1.5">
                        <Scale className="w-3.5 h-3.5" />
                        <span>ميزان حفظ الذرات في التفاعل:</span>
                      </div>
                      <div className="space-y-1.5 text-xs text-slate-300">
                        <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                          <span>المتفاعلات (قبل):</span>
                          <span className="font-mono font-bold text-cyan-300">
                            {Object.entries(activeDemo.atomConservation.beforeCounts)
                              .map(([el, c]) => `${c} ${el}`)
                              .join(' + ')}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span>النواتج (بعد):</span>
                          <span className="font-mono font-bold text-emerald-300">
                            {Object.entries(activeDemo.atomConservation.afterCounts)
                              .map(([el, c]) => `${c} ${el}`)
                              .join(' + ')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Scientific Takeaway */}
                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <div className="text-xs font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>الخلاصة العلمية المركزة:</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{activeDemo.learningTakeawayAr}</p>
                    </div>
                  </div>

                  {/* Matrix Table (if demonstration 5) */}
                  {activeDemo.matrixData && (
                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <div className="text-xs font-bold text-purple-400 mb-2">
                        مصفوفة النسب المولية الموجهة 4×4 (استبعاد القطر الذاتي):
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 text-xs">
                        {activeDemo.matrixData.map((m, idx) => (
                          <div
                            key={idx}
                            className="p-2 rounded bg-slate-900 border border-purple-500/30 text-center"
                          >
                            <div className="text-[10px] text-slate-400">
                              {m.row} / {m.col}
                            </div>
                            <div className="font-mono font-bold text-purple-300">{m.ratio}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ================= AREA B: TRAINING & PRACTICE ROOM ================= */}
            {activeTab === 'training' && (
              <div className="max-w-3xl mx-auto flex flex-col gap-5 py-2">
                {/* Header Callout */}
                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-3">
                  <BookOpen className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-amber-300">غرفة التدريب والتمارين الاستباقية</h3>
                    <p className="text-xs text-slate-300 mt-1">
                      تدرب بحرية مع إمكانية عرض التلميحات والحلول النموذجية. هذه التمارين مخصصة للتعلم ولا تؤثر على نتائج
                      اختبارات التأهيل.
                    </p>
                  </div>
                </div>

                {/* Exercise Selector */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {TRAINING_EXERCISES.map((ex, idx) => (
                    <button
                      key={ex.id}
                      onClick={() => {
                        setTrainingExerciseIndex(idx);
                        setTrainingInput('');
                        setTrainingFeedback(null);
                        setShowTrainingHint(false);
                        setShowTrainingSolution(false);
                        sounds.playInteract();
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        trainingExerciseIndex === idx
                          ? 'border-amber-400 bg-amber-950/40 text-amber-300'
                          : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white'
                      }`}
                    >
                      {ex.titleAr.split(':')[0]}
                    </button>
                  ))}
                </div>

                {/* Active Exercise Box */}
                {(() => {
                  const ex = TRAINING_EXERCISES[trainingExerciseIndex];
                  return (
                    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-4">
                      <div>
                        <div className="text-xs text-amber-400 font-mono mb-1">{ex.titleAr}</div>
                        <h4 className="text-base font-bold text-white mb-2 leading-relaxed">{ex.promptAr}</h4>
                        <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 font-mono text-cyan-300 text-center font-bold text-sm" dir="ltr">
                          {ex.equationAr}
                        </div>
                      </div>

                      {/* Interactive Answer Input */}
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={trainingInput}
                          onChange={(e) => setTrainingInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleTrainingCheck()}
                          placeholder="اكتب الإجابة (رقم أو كسر مثل 4/3)"
                          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 font-mono text-sm focus:outline-none focus:border-amber-400"
                        />
                        <button
                          onClick={handleTrainingCheck}
                          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm cursor-pointer transition-colors shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                        >
                          تحقق من الإجابة
                        </button>
                      </div>

                      {/* Feedback Toast */}
                      {trainingFeedback && (
                        <div
                          className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-semibold ${
                            trainingFeedback.isCorrect
                              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                              : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                          }`}
                        >
                          {trainingFeedback.isCorrect ? (
                            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                          ) : (
                            <XCircle className="w-4 h-4 shrink-0 text-rose-400" />
                          )}
                          <span>{trainingFeedback.messageAr}</span>
                        </div>
                      )}

                      {/* Action buttons: Hints & Worked Solution */}
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
                        <button
                          onClick={() => setShowTrainingHint(!showTrainingHint)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                        >
                          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                          <span>{showTrainingHint ? 'إخفاء التلميح' : 'عرض التلميح'}</span>
                        </button>

                        <button
                          onClick={() => setShowTrainingSolution(!showTrainingSolution)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{showTrainingSolution ? 'إخفاء الحل النموذجي' : 'عرض الحل النموذجي'}</span>
                        </button>
                      </div>

                      {showTrainingHint && (
                        <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200">
                          {ex.hintAr}
                        </div>
                      )}

                      {showTrainingSolution && (
                        <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-200 leading-relaxed">
                          <strong className="block mb-1 text-cyan-300">الحل والشرح النموذجي:</strong>
                          {ex.solutionAr}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ================= AREA C: 20-QUESTION CERTIFICATION EXAMINATION ================= */}
            {activeTab === 'exam' && (
              <div className="max-w-3xl mx-auto flex flex-col gap-4 py-2">
                {/* 1. Exam Report Screen (if finished) */}
                {examReport ? (
                  <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-5">
                    {/* Header Banner */}
                    <div className="text-center pb-4 border-b border-slate-800">
                      <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center border shadow-lg">
                        {examReport.hasPassed ? (
                          <div className="bg-emerald-500/20 border-emerald-500 text-emerald-400 p-3 rounded-2xl">
                            <ShieldCheck className="w-10 h-10" />
                          </div>
                        ) : (
                          <div className="bg-rose-500/20 border-rose-500 text-rose-400 p-3 rounded-2xl">
                            <RotateCcw className="w-10 h-10" />
                          </div>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-white mb-1">
                        {examReport.hasPassed
                          ? 'تهانينا! لقد اجتزت اختبار التأهيل بنجاح تام'
                          : 'لم تصل لنسبة الاجتياز المطلوبة (80%)'}
                      </h3>
                      <p className="text-xs text-slate-400">{examReport.examTitleAr}</p>
                    </div>

                    {/* Vitals Summary Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                        <div className="text-[11px] text-slate-400">النتيجة النهائية</div>
                        <div className={`text-2xl font-bold font-mono ${examReport.hasPassed ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {examReport.percentageScore}%
                        </div>
                        <div className="text-[10px] text-slate-500">مطلوب 80%</div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                        <div className="text-[11px] text-slate-400">الإجابات الصحيحة</div>
                        <div className="text-2xl font-bold font-mono text-emerald-400">
                          {examReport.correctCount} / {examReport.totalQuestions}
                        </div>
                        <div className="text-[10px] text-slate-500">16 كحد أدنى</div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                        <div className="text-[11px] text-slate-400">الإجابات الخاطئة</div>
                        <div className="text-2xl font-bold font-mono text-rose-400">{examReport.incorrectCount}</div>
                        <div className="text-[10px] text-slate-500">تشمل نفاد الوقت</div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                        <div className="text-[11px] text-slate-400">زمن الإنجاز</div>
                        <div className="text-2xl font-bold font-mono text-cyan-400">{examReport.totalTimeSeconds}s</div>
                        <div className="text-[10px] text-slate-500">إجمالي الاختبار</div>
                      </div>
                    </div>

                    {/* Badge or Unlock Notification */}
                    {examReport.hasPassed && examReport.badgeAwardedAr && (
                      <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 flex items-center gap-3">
                        <Award className="w-8 h-8 text-emerald-400 shrink-0" />
                        <div>
                          <div className="text-xs font-bold text-emerald-300">تم منح وسام الاعتماد وفتح القطاع!</div>
                          <div className="text-sm font-bold text-white">{examReport.badgeAwardedAr}</div>
                          {examReport.unlockedLocationId && (
                            <div className="text-xs text-emerald-200 mt-0.5">
                              تم تفعيل تصاريح الدخول إلى القطاع بنجاح في خريطة المنشأة.
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Skill Breakdown */}
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                      <div className="text-xs font-bold text-slate-300 mb-3">تقييم المهارات الكيميائية العشر:</div>
                      <div className="space-y-2">
                        {examReport.skillBreakdown.map((s) => (
                          <div key={s.skillId} className="flex flex-col gap-1 text-xs">
                            <div className="flex justify-between items-center text-slate-300">
                              <span>{s.skillNameAr}</span>
                              <span className="font-mono font-bold text-cyan-300">
                                {s.correct}/{s.total} ({s.accuracyPercent}%)
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  s.accuracyPercent >= 80 ? 'bg-emerald-400' : s.accuracyPercent >= 50 ? 'bg-amber-400' : 'bg-rose-500'
                                }`}
                                style={{ width: `${s.accuracyPercent}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Retry Button */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                      <button
                        onClick={() => handleStartExam(examReport.targetTier)}
                        className="px-5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>إعادة محاولة الاختبار</span>
                      </button>

                      <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer"
                      >
                        إغلاق التقرير والعودة
                      </button>
                    </div>
                  </div>
                ) : !isExamRunning ? (
                  /* 2. Exam Launch Screen */
                  <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-5 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 mx-auto flex items-center justify-center">
                      <Award className="w-8 h-8" />
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">
                        اختبار التأهيل الرسمي والاعتماد الأكاديمي
                      </h3>
                      <p className="text-xs text-slate-400 max-w-lg mx-auto">
                        يتكون كل اختبار من 20 سؤالاً علمياً موزعاً على المهارات العشر للحسابات الكيميائية. مطلوب الحصول على 16
                        إجابة صحيحة على الأقل (80%) لفتح القطاع التالي في الحملة.
                      </p>
                    </div>

                    {/* Tier Selection Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-right">
                      <div className="p-4 rounded-xl border border-cyan-500/40 bg-cyan-950/20 flex flex-col justify-between">
                        <div>
                          <div className="text-[11px] font-mono text-cyan-400">TIER 01</div>
                          <h4 className="text-sm font-bold text-white mb-1">تأهيل جناح الأبحاث</h4>
                          <p className="text-[11px] text-slate-300 mb-3">
                            تفسير المعادلات والجسيمات الممثلة (يفتح مصفاة الكتلة).
                          </p>
                        </div>
                        <button
                          onClick={() => handleStartExam(1)}
                          className="w-full py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer shadow-[0_0_12px_rgba(0,229,255,0.3)] transition-all"
                        >
                          بدء الاختبار 1 (20 سؤالاً)
                        </button>
                      </div>

                      <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-950/20 flex flex-col justify-between">
                        <div>
                          <div className="text-[11px] font-mono text-amber-400">TIER 02</div>
                          <h4 className="text-sm font-bold text-white mb-1">تأهيل مصفاة الكتلة</h4>
                          <p className="text-[11px] text-slate-300 mb-3">
                            حفظ الكتلة واشتقاق النسب المولية (يفتح قبو النسب المولية).
                          </p>
                        </div>
                        <button
                          onClick={() => handleStartExam(2)}
                          className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-[0_0_12px_rgba(245,158,11,0.3)] transition-all"
                        >
                          بدء الاختبار 2 (20 سؤالاً)
                        </button>
                      </div>

                      <div className="p-4 rounded-xl border border-purple-500/40 bg-purple-950/20 flex flex-col justify-between">
                        <div>
                          <div className="text-[11px] font-mono text-purple-400">TIER 03</div>
                          <h4 className="text-sm font-bold text-white mb-1">الاعتماد الشامل للمفاعل</h4>
                          <p className="text-[11px] text-slate-300 mb-3">
                            مصفوفة n(n-1) وحسابات احتراق البيوتان لاختراق الزعيم النهائي.
                          </p>
                        </div>
                        <button
                          onClick={() => handleStartExam(3)}
                          className="w-full py-2 rounded-lg bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs cursor-pointer shadow-[0_0_12px_rgba(168,85,247,0.3)] transition-all"
                        >
                          بدء الاختبار 3 (20 سؤالاً)
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* 3. Live 20-Question Examination Runner */
                  <div className="p-6 rounded-2xl bg-slate-900/80 border border-purple-500/40 shadow-[0_0_30px_rgba(168,85,247,0.15)] flex flex-col gap-5">
                    {/* Progress & Countdown Header */}
                    <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 font-bold text-xs border border-purple-500/30">
                          السؤال {questionIndex + 1} من {totalQuestions}
                        </span>
                        <span className="text-xs text-slate-400">{currentQuestion?.topicBadgeAr}</span>
                      </div>

                      {/* Per-Question Timer */}
                      <div className="flex items-center gap-2 font-mono font-bold text-sm">
                        <Clock className={`w-4 h-4 ${timerSeconds <= 8 ? 'text-rose-400 animate-ping' : 'text-amber-400'}`} />
                        <span className={timerSeconds <= 8 ? 'text-rose-400' : 'text-slate-200'}>{timerSeconds} ثانية</span>
                      </div>
                    </div>

                    {/* Animated Timer Progress Bar */}
                    <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-200 ${
                          timerSeconds <= 8 ? 'bg-rose-500' : 'bg-gradient-to-r from-purple-500 to-cyan-400'
                        }`}
                        style={{ width: `${timerProgress * 100}%` }}
                      />
                    </div>

                    {/* Two-Column Responsive Exam Grid: Question & Inputs alongside Scientific Visual Companion */}
                    {currentQuestion && (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch mt-1">
                        {/* Question and Answering Column */}
                        <div className="lg:col-span-7 flex flex-col justify-between gap-3">
                          <div className="space-y-3">
                            <h4 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                              {currentQuestion.questionAr}
                            </h4>

                            {currentQuestion.equationDisplay && (
                              <div
                                className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 font-mono text-cyan-300 font-bold text-center text-sm tracking-wide"
                                dir="ltr"
                              >
                                {currentQuestion.equationDisplay}
                              </div>
                            )}
                          </div>

                          {/* Input Handling: Multiple Choice vs Text/Ratio Input */}
                          {currentQuestion.inputType === 'multiple_choice' && currentQuestion.optionsAr ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                              {currentQuestion.optionsAr.map((opt) => (
                                <button
                                  key={opt.value}
                                  onClick={() => handleExamSubmit(opt.value)}
                                  className="text-right p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 hover:border-purple-400 hover:bg-purple-950/40 text-xs font-semibold text-slate-200 transition-all cursor-pointer active:scale-98"
                                >
                                  {opt.text}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2">
                              <input
                                type="text"
                                value={examInput}
                                onChange={(e) => setExamInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && examInput.trim() && handleExamSubmit(examInput)}
                                placeholder="اكتب الإجابة ثم اضغط تأكيد (مثل: 4 أو 4/3 أو 319.4)"
                                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 font-mono text-sm focus:outline-none focus:border-purple-400"
                                autoFocus
                              />
                              <button
                                onClick={() => examInput.trim() && handleExamSubmit(examInput)}
                                disabled={!examInput.trim()}
                                className="px-6 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 disabled:opacity-40 text-slate-950 font-bold text-xs cursor-pointer transition-colors shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                              >
                                تأكيد الإجابة
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Scientific Visual Companion Column */}
                        <div className="lg:col-span-5 flex flex-col">
                          <QuestionVisualCompanion question={currentQuestion} />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
