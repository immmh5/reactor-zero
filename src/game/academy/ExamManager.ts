/**
 * LAB GUARDIAN - Academy Exam Manager
 * Coordinates the 20-question certification exam:
 * - Sequential question progression (1 to 20)
 * - Individual question timers (30s, 45s, 60s)
 * - Flexible answer evaluation (fractions, decimals, Arabic commas, numbers, options)
 * - 16 / 20 (80%) passing threshold
 * - Generates comprehensive Student Exam Report
 * - Unlimited retries
 */

import {
  ExamQuestion,
  StudentExamAnswer,
  ExamResultReport,
  CurriculumSkillId,
  CURRICULUM_SKILLS,
} from './AcademyTypes';
import { buildCertificationExam } from './QuestionBank';
import { parseRatioOrNumber, isNumberClose } from '../chemistry/stoichiometryData';
import { sounds } from '../audio/SoundEffects';

export interface ExamManagerCallbacks {
  onQuestionChange?: (question: ExamQuestion, questionIndex: number, total: number) => void;
  onTimerTick?: (secondsRemaining: number, progressRatio: number) => void;
  onQuestionTimeout?: (questionId: string) => void;
  onExamFinished?: (report: ExamResultReport) => void;
}

export class ExamManager {
  private currentExamTier: 1 | 2 | 3 = 1;
  private questions: ExamQuestion[] = [];
  private currentQuestionIndex: number = 0;
  private studentAnswers: Map<string, StudentExamAnswer> = new Map();

  // Timer properties
  private questionTimerRemaining: number = 30;
  private questionTotalDuration: number = 30;
  private isExamActive: boolean = false;
  private examStartTime: number = 0;
  private callbacks: ExamManagerCallbacks = {};

  // Configurable passing criteria
  public readonly passingThresholdPercent: number = 80; // 16 / 20 = 80%

  constructor(callbacks?: ExamManagerCallbacks) {
    if (callbacks) this.callbacks = callbacks;
  }

  public setCallbacks(callbacks: ExamManagerCallbacks): void {
    this.callbacks = callbacks;
  }

  /**
   * Starts a fresh 20-question certification attempt
   */
  public startExam(tier: 1 | 2 | 3 = 1): void {
    this.currentExamTier = tier;
    this.questions = buildCertificationExam(tier);
    this.currentQuestionIndex = 0;
    this.studentAnswers.clear();
    this.isExamActive = true;
    this.examStartTime = Date.now();

    this.setupCurrentQuestion();
  }

  public getCurrentQuestion(): ExamQuestion | null {
    if (!this.isExamActive || this.currentQuestionIndex >= this.questions.length) {
      return null;
    }
    return this.questions[this.currentQuestionIndex];
  }

  public getCurrentQuestionIndex(): number {
    return this.currentQuestionIndex;
  }

  public getTotalQuestions(): number {
    return this.questions.length;
  }

  public isRunning(): boolean {
    return this.isExamActive;
  }

  public getTimerRemaining(): number {
    return Math.ceil(this.questionTimerRemaining);
  }

  /**
   * Advances timer during render/simulation loop
   */
  public update(dt: number): void {
    if (!this.isExamActive) return;

    this.questionTimerRemaining -= dt;

    if (this.callbacks.onTimerTick) {
      const progressRatio = Math.max(0, this.questionTimerRemaining / this.questionTotalDuration);
      this.callbacks.onTimerTick(Math.ceil(Math.max(0, this.questionTimerRemaining)), progressRatio);
    }

    if (this.questionTimerRemaining <= 0) {
      this.handleTimeout();
    }
  }

  private setupCurrentQuestion(): void {
    const q = this.questions[this.currentQuestionIndex];
    if (!q) {
      this.finishExam();
      return;
    }

    this.questionTotalDuration = q.timeLimitSeconds || 45;
    this.questionTimerRemaining = this.questionTotalDuration;

    if (this.callbacks.onQuestionChange) {
      this.callbacks.onQuestionChange(q, this.currentQuestionIndex, this.questions.length);
    }
  }

  /**
   * Evaluates and records the student's submitted answer
   */
  public submitAnswer(rawInput: string): { isCorrect: boolean; isExamFinished: boolean } {
    if (!this.isExamActive) return { isCorrect: false, isExamFinished: true };

    const q = this.questions[this.currentQuestionIndex];
    if (!q) return { isCorrect: false, isExamFinished: true };

    const timeSpent = this.questionTotalDuration - this.questionTimerRemaining;
    const isCorrect = this.checkAnswerCorrectness(rawInput, q);

    if (isCorrect) {
      sounds.playSuccess();
    } else {
      sounds.playDamageImpact();
    }

    this.studentAnswers.set(q.id, {
      questionId: q.id,
      studentAnswer: rawInput.trim(),
      isCorrect,
      timeSpentSeconds: Math.round(timeSpent * 10) / 10,
      timedOut: false,
    });

    this.currentQuestionIndex++;
    if (this.currentQuestionIndex >= this.questions.length) {
      this.finishExam();
      return { isCorrect, isExamFinished: true };
    } else {
      this.setupCurrentQuestion();
      return { isCorrect, isExamFinished: false };
    }
  }

  private handleTimeout(): void {
    const q = this.questions[this.currentQuestionIndex];
    if (!q) return;

    sounds.playCriticalAlarm();

    this.studentAnswers.set(q.id, {
      questionId: q.id,
      studentAnswer: 'نفد الوقت',
      isCorrect: false,
      timeSpentSeconds: this.questionTotalDuration,
      timedOut: true,
    });

    if (this.callbacks.onQuestionTimeout) {
      this.callbacks.onQuestionTimeout(q.id);
    }

    this.currentQuestionIndex++;
    if (this.currentQuestionIndex >= this.questions.length) {
      this.finishExam();
    } else {
      this.setupCurrentQuestion();
    }
  }

  public finishExam(): ExamResultReport {
    this.isExamActive = false;
    const report = this.generateReport();

    if (report.hasPassed) {
      sounds.playSuccess();
    } else {
      sounds.playDefeat();
    }

    if (this.callbacks.onExamFinished) {
      this.callbacks.onExamFinished(report);
    }

    return report;
  }

  /**
   * Flexible scientific validation for numbers, fractions, options, and Arabic formatting
   */
  public checkAnswerCorrectness(rawInput: string, q: ExamQuestion): boolean {
    if (!rawInput) return false;
    const cleaned = rawInput.trim().replace(/،/g, '.').replace(/\s+/g, '');

    // 1. Multiple choice check
    if (q.inputType === 'multiple_choice') {
      return cleaned.toLowerCase() === String(q.correctAnswer).toLowerCase();
    }

    // 2. Numeric or Ratio input check
    const userVal = parseRatioOrNumber(cleaned);
    const targetVal = parseRatioOrNumber(String(q.correctAnswer));

    if (userVal !== null && targetVal !== null) {
      if (isNumberClose(userVal, targetVal, 0.03, 0.2)) {
        return true;
      }
    }

    // Check acceptable answers list
    if (q.acceptableAnswers) {
      for (const acceptable of q.acceptableAnswers) {
        const acceptableVal = parseRatioOrNumber(String(acceptable));
        if (userVal !== null && acceptableVal !== null) {
          if (isNumberClose(userVal, acceptableVal, 0.03, 0.2)) {
            return true;
          }
        }
        if (cleaned.toLowerCase() === String(acceptable).trim().replace(/\s+/g, '').toLowerCase()) {
          return true;
        }
      }
    }

    return false;
  }

  public generateReport(): ExamResultReport {
    const total = this.questions.length || 20;
    let correct = 0;
    const answerList: StudentExamAnswer[] = [];

    const skillStats = new Map<CurriculumSkillId, { total: number; correct: number }>();

    for (const q of this.questions) {
      if (!skillStats.has(q.skillId)) {
        skillStats.set(q.skillId, { total: 0, correct: 0 });
      }
      const s = skillStats.get(q.skillId)!;
      s.total++;

      const ans = this.studentAnswers.get(q.id);
      if (ans && ans.isCorrect) {
        correct++;
        s.correct++;
      }
      if (ans) {
        answerList.push(ans);
      } else {
        answerList.push({
          questionId: q.id,
          studentAnswer: 'لم يتم الإجابة',
          isCorrect: false,
          timeSpentSeconds: 0,
          timedOut: true,
        });
      }
    }

    const percentage = Math.round((correct / total) * 100);
    const hasPassed = percentage >= this.passingThresholdPercent; // 16 / 20 = 80%

    // Calculate skill breakdowns & weak skills
    const skillBreakdown = Array.from(skillStats.entries()).map(([skillId, stat]) => {
      const accuracy = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
      return {
        skillId,
        skillNameAr: CURRICULUM_SKILLS[skillId]?.nameAr || skillId,
        total: stat.total,
        correct: stat.correct,
        accuracyPercent: accuracy,
      };
    });

    const weakSkills = skillBreakdown.filter((s) => s.accuracyPercent < 70).map((s) => s.skillNameAr);

    const recommendedReviews = weakSkills.map((w) => `راجع نماذج العرض ثلاثية الأبعاد الخاصة بـ: ${w}`);

    let examTitleAr = 'اختبار التأهيل الأول: أكسدة الحديد والجسيمات';
    let unlockedLocationId: string | undefined;
    let badgeAwardedAr: string | undefined;

    if (this.currentExamTier === 1) {
      examTitleAr = 'اختبار التأهيل الأول: تفسير المعادلات والجسيمات الممثلة';
      if (hasPassed) {
        unlockedLocationId = 'refinery';
        badgeAwardedAr = 'وسام الكيميائي التكتيكي - المستوى 1';
      }
    } else if (this.currentExamTier === 2) {
      examTitleAr = 'اختبار التأهيل الثاني: حفظ الكتلة والنسب المولية المتبادلة';
      if (hasPassed) {
        unlockedLocationId = 'vault';
        badgeAwardedAr = 'وسام مهندس الكتلة والنسب - المستوى 2';
      }
    } else {
      examTitleAr = 'اختبار الاعتماد الشامل: مصفوفة n(n-1) وحسابات البيوتان';
      if (hasPassed) {
        badgeAwardedAr = 'وسام حارس المختبر الأعلى - خبير الحسابات الكيميائية';
      }
    }

    const totalTimeSeconds = Math.round((Date.now() - this.examStartTime) / 1000);

    return {
      examId: `exam_tier_${this.currentExamTier}`,
      examTitleAr,
      targetTier: this.currentExamTier,
      totalQuestions: total,
      correctCount: correct,
      incorrectCount: total - correct,
      percentageScore: percentage,
      passingScorePercent: this.passingThresholdPercent,
      hasPassed,
      totalTimeSeconds,
      skillBreakdown,
      weakSkillsAr: weakSkills,
      recommendedReviewsAr: recommendedReviews,
      unlockedLocationId,
      badgeAwardedAr,
      answers: answerList,
    };
  }

  public cancelExam(): void {
    this.isExamActive = false;
  }
}
