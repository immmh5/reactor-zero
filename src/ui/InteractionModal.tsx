/**
 * LAB GUARDIAN - Chemistry Interaction Modal
 * Real educational stoichiometry gameplay: multi-step validation, mass balance, ratio matrix, tiered hints,
 * and robust per-question countdown timer with warning states and consequences.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { InteractiveStation } from '../game/interaction/InteractionManager';
import { ChemistryChallengeManager, ChallengeEvaluationResult } from '../game/chemistry/ChemistryChallengeSystem';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Atom,
  Scale,
  Grid,
  Send,
  Lightbulb,
  BookOpen,
  Timer,
  RotateCcw,
} from 'lucide-react';

interface InteractionModalProps {
  station: InteractiveStation;
  challengeMgr: ChemistryChallengeManager;
  onClose: () => void;
  onSubmitAnswer: (rawInput: string) => ChallengeEvaluationResult;
  onTimeout: () => ChallengeEvaluationResult;
}

export const InteractionModal: React.FC<InteractionModalProps> = ({
  station,
  challengeMgr,
  onClose,
  onSubmitAnswer,
  onTimeout,
}) => {
  // Ensure the challenge manager's active mission matches this station's mission
  const missionIndex = station.missionNumber - 1;
  const mission = challengeMgr.getMissionByIndex(missionIndex) || challengeMgr.getActiveMission();
  const currentStep = mission.steps[mission.currentStepIndex] || mission.steps[0];
  const isMissionCompleted = mission.isCompleted;

  const [inputVal, setInputVal] = useState<string>('');
  const [evalResult, setEvalResult] = useState<ChallengeEvaluationResult | null>(null);

  // Per-question countdown timer state
  const totalDuration = currentStep?.timeLimitSeconds ?? 90;
  const [remainingSeconds, setRemainingSeconds] = useState<number>(totalDuration);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [attemptVersion, setAttemptVersion] = useState<number>(0);

  // Timer tracking refs for monotonic clock, key stability, and mutual exclusion
  const activeQuestionKeyRef = useRef<string>('');
  const timerIdRef = useRef<number | null>(null);
  const hasExpiredFiredRef = useRef<boolean>(false);
  const isSubmittedRef = useRef<boolean>(false);
  const remainingSecondsRef = useRef<number>(totalDuration);
  const tabHiddenTimeRef = useRef<number | null>(null);

  // Format MM:SS
  const formatTime = (seconds: number): string => {
    const s = Math.max(0, Math.ceil(seconds));
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle Timeout Callback safely (mutual exclusion with submission)
  const triggerTimeoutOutcome = useCallback(() => {
    if (hasExpiredFiredRef.current || isSubmittedRef.current || isMissionCompleted) return;
    hasExpiredFiredRef.current = true;
    setIsExpired(true);

    if (timerIdRef.current !== null) {
      clearInterval(timerIdRef.current);
      timerIdRef.current = null;
    }

    challengeMgr.setActiveMissionIndex(missionIndex);
    const result = onTimeout();
    setEvalResult(result);
  }, [challengeMgr, missionIndex, onTimeout, isMissionCompleted]);

  const triggerTimeoutOutcomeRef = useRef(triggerTimeoutOutcome);
  triggerTimeoutOutcomeRef.current = triggerTimeoutOutcome;

  // Question countdown lifecycle: runs on question key change
  const questionKey = `${mission.id}_step_${mission.currentStepIndex}_v_${attemptVersion}`;

  useEffect(() => {
    if (isMissionCompleted || !currentStep) {
      if (timerIdRef.current !== null) {
        clearInterval(timerIdRef.current);
        timerIdRef.current = null;
      }
      return;
    }

    // Prevent resetting timer when re-rendering for the same question
    if (activeQuestionKeyRef.current === questionKey) {
      return;
    }
    activeQuestionKeyRef.current = questionKey;

    // Clean up any existing interval
    if (timerIdRef.current !== null) {
      clearInterval(timerIdRef.current);
      timerIdRef.current = null;
    }

    const duration = currentStep.timeLimitSeconds ?? 90;
    setRemainingSeconds(duration);
    remainingSecondsRef.current = duration;
    setIsExpired(false);
    setIsSubmitted(false);
    isSubmittedRef.current = false;
    hasExpiredFiredRef.current = false;

    let startPerfTime = performance.now();
    let durationAtStart = duration;

    // Window visibility pause/resume listeners
    const handleVisibilityChange = () => {
      if (document.hidden) {
        tabHiddenTimeRef.current = performance.now();
      } else if (tabHiddenTimeRef.current !== null) {
        const hiddenDuration = performance.now() - tabHiddenTimeRef.current;
        // Shift start time so time spent on hidden tab is not counted
        startPerfTime += hiddenDuration;
        tabHiddenTimeRef.current = null;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const intervalId = window.setInterval(() => {
      if (isSubmittedRef.current || hasExpiredFiredRef.current) {
        clearInterval(intervalId);
        timerIdRef.current = null;
        return;
      }

      if (document.hidden) {
        // Paused while tab is backgrounded
        return;
      }

      const elapsed = (performance.now() - startPerfTime) / 1000;
      const left = Math.max(0, durationAtStart - elapsed);
      setRemainingSeconds(left);
      remainingSecondsRef.current = left;

      if (left <= 0.05) {
        clearInterval(intervalId);
        timerIdRef.current = null;
        setRemainingSeconds(0);
        remainingSecondsRef.current = 0;
        triggerTimeoutOutcomeRef.current();
      }
    }, 100);

    timerIdRef.current = intervalId;

    return () => {
      if (timerIdRef.current !== null) {
        clearInterval(timerIdRef.current);
        timerIdRef.current = null;
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [questionKey, isMissionCompleted, currentStep]);

  // Automated testing helper to verify timeout UI state
  useEffect(() => {
    (window as unknown as { __triggerModalTimeout?: () => void }).__triggerModalTimeout = () => {
      triggerTimeoutOutcomeRef.current();
    };
    return () => {
      delete (window as unknown as { __triggerModalTimeout?: () => void }).__triggerModalTimeout;
    };
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputVal.trim() || isMissionCompleted || isExpired || isSubmittedRef.current || hasExpiredFiredRef.current) return;

    // Immediately stop question countdown
    isSubmittedRef.current = true;
    setIsSubmitted(true);
    if (timerIdRef.current !== null) {
      clearInterval(timerIdRef.current);
      timerIdRef.current = null;
    }

    challengeMgr.setActiveMissionIndex(missionIndex);
    const result = onSubmitAnswer(inputVal);
    setEvalResult(result);
    if (result.isCorrect) {
      setInputVal('');
    }
  };

  const handleRetryQuestion = () => {
    setInputVal('');
    setEvalResult(null);
    setIsExpired(false);
    setIsSubmitted(false);
    isSubmittedRef.current = false;
    hasExpiredFiredRef.current = false;
    setAttemptVersion((v) => v + 1);
  };

  // Timer visual thresholds
  const progressPercent = Math.max(0, Math.min(100, (remainingSeconds / totalDuration) * 100));
  const isCriticalWarning = !isExpired && remainingSeconds <= 10;
  const isCautionWarning = !isExpired && remainingSeconds > 10 && remainingSeconds <= 30;

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-[#080d1a] border-2 border-cyan-400/60 rounded-3xl shadow-2xl p-6 sm:p-7 flex flex-col gap-5 text-right max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-cyan-950 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950/70 border border-cyan-500/40 text-cyan-400">
              {station.category === 'mass_balance' ? (
                <Scale className="w-6 h-6 text-sky-400" />
              ) : station.category === 'matrix' ? (
                <Grid className="w-6 h-6 text-amber-400" />
              ) : (
                <Atom className="w-6 h-6 text-cyan-400" />
              )}
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest block">
                الحسابات الكيميائية // STOICHIOMETRY
              </span>
              <h3 className="text-lg font-black text-white">{mission.titleAr}</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="إغلاق المحطة"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chemical Equation Box */}
        <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-3.5 flex flex-col items-center gap-1 shadow-inner">
          <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
            المعادلة الكيميائية الموزونة
          </span>
          <div className="font-mono text-base sm:text-lg font-black text-amber-300 tracking-wide dir-ltr text-center">
            {mission.reaction.equationString}
          </div>
        </div>

        {/* Mission Status / Progress & Question Countdown Bar */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <span>الخطوة الحالية:</span>
              <span className="font-bold text-cyan-400">
                {Math.min(mission.steps.length, mission.currentStepIndex + 1)} من {mission.steps.length}
              </span>
              {isMissionCompleted && (
                <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500 text-emerald-400 text-[10px] font-bold">
                  مكتملة ✓
                </span>
              )}
            </div>

            {/* Prominent Per-Question Digital Countdown Timer */}
            {!isMissionCompleted && (
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border font-mono text-xs font-black transition-colors ${
                  isExpired
                    ? 'bg-rose-950/90 border-rose-500 text-rose-300'
                    : isCriticalWarning
                    ? 'bg-rose-950/70 border-rose-500/80 text-rose-300 animate-pulse'
                    : isCautionWarning
                    ? 'bg-amber-950/70 border-amber-500/80 text-amber-300'
                    : 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300'
                }`}
              >
                <Timer className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {isExpired ? 'انتهى الوقت' : `الوقت المتبقي: ${formatTime(remainingSeconds)}`}
                </span>
              </div>
            )}
          </div>

          {/* Horizontal Timer Progress Bar */}
          {!isMissionCompleted && (
            <div className="w-full bg-slate-950/90 rounded-full h-2 p-0.5 border border-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-150 ease-linear ${
                  isExpired
                    ? 'w-0 bg-transparent'
                    : isCriticalWarning
                    ? 'bg-rose-500 shadow-sm shadow-rose-500'
                    : isCautionWarning
                    ? 'bg-amber-500 shadow-sm shadow-amber-500'
                    : 'bg-gradient-to-l from-cyan-400 to-blue-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}
        </div>

        {/* Step Prompt & Guidance */}
        {!isMissionCompleted && currentStep && (
          <div className="flex flex-col gap-3">
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2">
              <h4 className="text-sm font-bold text-white leading-relaxed">{currentStep.promptAr}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{currentStep.guidanceAr}</p>
            </div>

            {/* Special Visual: Virtual Balance for Mission 2 */}
            {station.category === 'mass_balance' && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 rounded-2xl border border-sky-900/50 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">كتلة المتفاعلات (C3H8 + 5O2)</span>
                  <span className="font-mono text-cyan-400 font-bold text-sm">204.1 جم</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">كتلة النواتج (3CO2 + 4H2O)</span>
                  <span className="font-mono text-emerald-400 font-bold text-sm">204.11 جم</span>
                </div>
                <div className="col-span-2 text-[10px] text-sky-300 font-semibold">
                  قانون حفظ الكتلة: كتلة المواد المتفاعلة = كتلة المواد الناتجة دائماً.
                </div>
              </div>
            )}

            {/* Special Visual: Matrix Diagram for Mission 4 */}
            {station.category === 'matrix' && (
              <div className="p-3 bg-slate-950 rounded-2xl border border-amber-900/50 text-xs flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-[11px] text-amber-300 font-bold">
                  <span>قانون النسب المولية الموجهة:</span>
                  <span className="font-mono">R = n(n - 1)</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  إذا كانت المعادلة تضم 3 مواد: 3(3 - 1) = 6 نسب. وإذا كانت 4 مواد: 4(4 - 1) = 12 نسبة موجهة.
                </p>
              </div>
            )}

            {/* User Input Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  disabled={isExpired || isMissionCompleted}
                  placeholder={
                    isExpired
                      ? 'انتهى وقت السؤال. اضغط على إعادة المحاولة للمتابعة.'
                      : 'أدخل القيمة أو النسبة (مثال: 3 أو 2/1 أو 204.1)...'
                  }
                  className={`flex-1 px-4 py-3 rounded-xl bg-slate-950 border font-mono text-sm focus:outline-none transition-colors ${
                    isExpired
                      ? 'border-rose-900/60 text-slate-500 cursor-not-allowed'
                      : 'border-cyan-500/50 text-white placeholder-slate-500 focus:border-cyan-400'
                  }`}
                  autoFocus={!isExpired}
                />
                {!isExpired ? (
                  <button
                    type="submit"
                    disabled={!inputVal.trim() || isSubmitted}
                    className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-extrabold text-sm shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>تحقق</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleRetryQuestion}
                    className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-extrabold text-sm shadow-lg shadow-amber-600/30 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>إعادة المحاولة</span>
                  </button>
                )}
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-400">
                <span>يمكنك كتابة الأرقام الصحيحة أو العشرية أو الكسور (مثل: 2/1 أو 13:2 أو 0.5).</span>
                {isExpired && (
                  <span className="text-rose-400 font-bold">
                    انتهى الوقت. راجع الشرح ثم اضغط على زر إعادة المحاولة.
                  </span>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Anti-Guessing Feedback / Hints / Solution Display */}
        {evalResult && (
          <div
            className={`p-4 rounded-2xl border text-xs leading-relaxed animate-in fade-in duration-200 ${
              evalResult.isCorrect
                ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300'
                : 'bg-rose-950/40 border-rose-500/60 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2 font-bold mb-1">
              {evalResult.isCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              )}
              <span>{evalResult.feedbackMessageAr}</span>
            </div>

            {/* Score & Combo Notification on Correct */}
            {evalResult.isCorrect && evalResult.scoreAwarded > 0 && (
              <div className="mt-1 font-mono text-[11px] text-cyan-300">
                + {evalResult.scoreAwarded} نقطة! (مضاعف السلسلة: {evalResult.comboMultiplier}x)
              </div>
            )}

            {/* Hint 1 / 2 on Incorrect or Timeout */}
            {evalResult.hintToShow && (
              <div className="mt-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{evalResult.hintToShow}</span>
              </div>
            )}

            {/* Worked Solution on 3+ Incorrect or Timeouts */}
            {evalResult.workedSolution && (
              <div className="mt-2 p-2.5 rounded-xl bg-slate-900 border border-cyan-800/60 text-cyan-200 flex items-start gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>{evalResult.workedSolution}</span>
              </div>
            )}

            {/* Retry Button inside feedback when incorrect without timeout */}
            {!evalResult.isCorrect && !isExpired && (
              <div className="mt-2.5 flex justify-end">
                <button
                  type="button"
                  onClick={handleRetryQuestion}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>حاول مرة أخرى</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Mission Complete Banner */}
        {isMissionCompleted && (
          <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/70 text-emerald-300 text-xs flex flex-col gap-2">
            <div className="flex items-center gap-2 font-black text-sm text-emerald-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>تم إنجاز هذه المحطة الكيميائية بنجاح تام!</span>
            </div>
            <p className="leading-relaxed text-slate-300 text-[11px]">
              استقرار المفاعل الكيميائي ارتفع بمقدار +25%، وتم منح نقاط الإنجاز. توجه الآن إلى المحطات المتبقية لتجهيز المواجهة الحاسمة.
            </p>
          </div>
        )}

        {/* Close Button */}
        <div className="pt-2 border-t border-cyan-950 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs transition-colors"
          >
            العودة للمختبر ومتابعة المهمة
          </button>
        </div>
      </div>
    </div>
  );
};
