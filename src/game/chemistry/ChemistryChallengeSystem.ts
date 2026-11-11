/**
 * LAB GUARDIAN - Chemistry Challenge System
 * Real educational progression, multi-step validation, anti-guessing hints, and scoring
 */

import {
  STOICHIOMETRY_REACTIONS,
  calculateDirectedMoleRatiosCount,
  parseRatioOrNumber,
  isNumberClose,
  ReactionDefinition,
} from './stoichiometryData';

export interface ChallengeStep {
  id: string;
  promptAr: string;
  equationDisplay: string;
  guidanceAr: string;
  inputType: 'numeric' | 'ratio' | 'coefficients' | 'multiple_choice';
  targetValue?: number;
  targetRatio?: { numerator: number; denominator: number };
  targetCoefficients?: number[];
  optionsAr?: { text: string; value: string; isCorrect: boolean }[];
  hint1Ar: string;
  hint2Ar: string;
  workedSolutionAr: string;
  timeLimitSeconds?: number; // Configurable per question: default 90s, short conceptual 60s
  recoveryStep?: ChallengeStep;
}

export interface MissionChallenge {
  id: string;
  missionNumber: number;
  titleAr: string;
  subtitleAr: string;
  reaction: ReactionDefinition;
  objectiveAr: string;
  steps: ChallengeStep[];
  currentStepIndex: number;
  isCompleted: boolean;
  attemptsOnCurrentStep: number;
  hintsRevealed: number;
}

export interface ChallengeEvaluationResult {
  isCorrect: boolean;
  scoreAwarded: number;
  comboMultiplier: number;
  feedbackMessageAr: string;
  hintToShow?: string;
  workedSolution?: string;
  isStepCompleted: boolean;
  isMissionCompleted: boolean;
  penaltyStability: number;
}

export class ChemistryChallengeManager {
  private missions: MissionChallenge[] = [];
  private activeMissionIndex: number = 0;
  private totalScore: number = 0;
  private currentCombo: number = 1;
  private maxCombo: number = 1;
  private totalCorrectAnswers: number = 0;
  private totalIncorrectAnswers: number = 0;
  private totalHintsUsed: number = 0;

  constructor() {
    this.initMissions();
  }

  private initMissions(): void {
    // MISSION 1: تفسير المعادلات الكيميائية (4Fe + 3O2 -> 2Fe2O3)
    const m1: MissionChallenge = {
      id: 'mission_1',
      missionNumber: 1,
      titleAr: 'المهمة 1: تفسير المعادلات الكيميائية',
      subtitleAr: 'تفسير المعاملات بالمولات والجسيمات',
      reaction: STOICHIOMETRY_REACTIONS.iron,
      objectiveAr: 'تحديد المعاملات وتفسير نسب الجسيمات والمولات في معادلة أكسدة الحديد المتزنة.',
      steps: [
        {
          id: 'm1_step1',
          promptAr: 'حدد المعامل الصحيح لجزيئات الأكسجين O2 في المعادلة الموزونة: 4Fe + [ ? ] O2 -> 2Fe2O3',
          equationDisplay: '4Fe(s) + [ ? ] O2(g) -> 2Fe2O3(s)',
          guidanceAr: 'المعامل هو العدد المكتوب على يسار الصيغة الكيميائية والذي يحدد نسبة المولات أو الجسيمات.',
          inputType: 'numeric',
          targetValue: 3,
          timeLimitSeconds: 30, // Short conceptual question (Prompt 04)
          hint1Ar: 'تلميح 1: تأكد من وزن ذرات الأكسجين؛ في النواتج 2 × 3 = 6 ذرات أكسجين.',
          hint2Ar: 'تلميح 2: لإيجاد المعامل، اقسم 6 ذرات على 2 (ذرتين لكل جزيء O2). المعامل هو 3.',
          workedSolutionAr: 'الحل النموذجي: المعادلة المتزنة هي 4Fe + 3O2 -> 2Fe2O3، إذن معامل O2 هو 3.',
        },
        {
          id: 'm1_step2',
          promptAr: 'كم مولاً من أكسيد الحديد Fe2O3 ينتج عند تفاعل 4 مولات من الحديد Fe تماماً مع الأكسجين؟',
          equationDisplay: '4Fe(s) + 3O2(g) -> 2Fe2O3(s)',
          guidanceAr: 'المعاملات تدل على نسبة المولات المتفاعلة والناتجة مباشرة.',
          inputType: 'numeric',
          targetValue: 2,
          timeLimitSeconds: 30, // Short conceptual question
          hint1Ar: 'تلميح 1: انظر إلى معامل Fe2O3 في المعادلة المتزنة عندما يتفاعل 4 مول من Fe.',
          hint2Ar: 'تلميح 2: النسبة المولية بين Fe و Fe2O3 هي 4 إلى 2، إذن 4 مول ينتج 2 مول.',
          workedSolutionAr: 'الحل النموذجي: بحسب المعاملات، كل 4 مول Fe تنتج 2 مول من Fe2O3.',
        },
        {
          id: 'm1_step3',
          promptAr: 'على مستوى الجسيمات الممثلة: كم وحدة صيغة من Fe2O3 تنتج من تفاعل 4 ذرات حديد؟',
          equationDisplay: '4Fe(s) + 3O2(g) -> 2Fe2O3(s)',
          guidanceAr: 'المعاملات تدل أيضاً على أعداد الجسيمات الممثلة (ذرات، جزيئات، وحدات صيغة للمركبات الأيونية).',
          inputType: 'numeric',
          targetValue: 2,
          timeLimitSeconds: 30, // Short conceptual question
          hint1Ar: 'تلميح 1: المركب Fe2O3 مركب أيوني وجسيمه الممثل هو وحدة الصيغة (Formula Unit).',
          hint2Ar: 'تلميح 2: عدد الجسيمات يتبع نفس نسب المعاملات (4 ذرات Fe تنتج وحدتي صيغة Fe2O3).',
          workedSolutionAr: 'الحل النموذجي: 4 ذرات Fe تتفاعل مع 3 جزيئات O2 لإنتاج وحدتي صيغة (2) من Fe2O3.',
        },
      ],
      currentStepIndex: 0,
      isCompleted: false,
      attemptsOnCurrentStep: 0,
      hintsRevealed: 0,
    };

    // MISSION 2: ميزان الكتلة (C3H8 + 5O2 -> 3CO2 + 4H2O)
    const m2: MissionChallenge = {
      id: 'mission_2',
      missionNumber: 2,
      titleAr: 'المهمة 2: ميزان حفظ الكتلة',
      subtitleAr: 'التحقق من قانون حفظ الكتلة عبر الكتل المولية',
      reaction: STOICHIOMETRY_REACTIONS.propaneCombustion,
      objectiveAr: 'حساب مجموع كتل المتفاعلات ومجموع كتل النواتج لإثبات أن الكتلة لا تفنى ولا تستحدث في التفاعل الكيميائي.',
      steps: [
        {
          id: 'm2_step1',
          promptAr: 'احسب الكتلة الكلية للمتفاعلات بالجرام (C3H8 = 44.1 جم + 5 مول O2 بمعدل 32 جم/مول):',
          equationDisplay: '1 C3H8 (44.1g) + 5 O2 (5 x 32.0g) -> ...',
          guidanceAr: 'كتلة المتفاعلات = كتلة 1 مول بروبان (44.1 جم) + كتلة 5 مول أكسجين (5 × 32.0 = 160.0 جم).',
          inputType: 'numeric',
          targetValue: 204.1,
          timeLimitSeconds: 45, // Standard calculation question
          hint1Ar: 'تلميح 1: احسب كتلة الأكسجين: 5 × 32 = 160 جم، ثم أضف إليها كتلة البروبان 44.1 جم.',
          hint2Ar: 'تلميح 2: المجموع = 44.1 + 160.0 = 204.1 جم.',
          workedSolutionAr: 'الحل النموذجي: كتلة المتفاعلات = 44.1 + (5 × 32) = 204.1 جم.',
        },
        {
          id: 'm2_step2',
          promptAr: 'احسب الكتلة الكلية للنواتج بالجرام (3 مول CO2 بمعدل 44.01 جم/مول + 4 مول H2O بمعدل 18.02 جم/مول):',
          equationDisplay: '... -> 3 CO2 (3 x 44.01g) + 4 H2O (4 x 18.02g)',
          guidanceAr: 'كتلة النواتج = (3 × 44.01) + (4 × 18.02) = 132.03 + 72.08 جم.',
          inputType: 'numeric',
          targetValue: 204.11,
          timeLimitSeconds: 60, // Multi-step calculation question
          hint1Ar: 'تلميح 1: كتلة CO2 = 132.03 جم، وكتلة الماء H2O = 72.08 جم.',
          hint2Ar: 'تلميح 2: اجمع القيمتين: 132.03 + 72.08 = 204.11 جم (مساوية تماماً لكتلة المتفاعلات).',
          workedSolutionAr: 'الحل النموذجي: كتلة النواتج = 132.03 + 72.08 = 204.11 جم. الكتلة محفوظة تماماً!',
        },
      ],
      currentStepIndex: 0,
      isCompleted: false,
      attemptsOnCurrentStep: 0,
      hintsRevealed: 0,
    };

    // MISSION 3: صائد النسب المولية (2K + Br2 -> 2KBr)
    const m3: MissionChallenge = {
      id: 'mission_3',
      missionNumber: 3,
      titleAr: 'المهمة 3: صائد النسب المولية',
      subtitleAr: 'اشتقاق النسب المولية الموجهة وتفسيرها',
      reaction: STOICHIOMETRY_REACTIONS.potassiumBromide,
      objectiveAr: 'اشتقاق النسب المولية بين المواد المتفاعلة والناتجة وفهم أثر عكس النسبة.',
      steps: [
        {
          id: 'm3_step1',
          promptAr: 'اكتب النسبة المولية للبوتاسيوم K إلى البروم Br2 في المعادلة: 2K + Br2 -> 2KBr (اكتبها على صورة 2/1 أو كقيمة 2):',
          equationDisplay: '2K(s) + 1Br2(l) -> 2KBr(s)',
          guidanceAr: 'النسبة المولية لمادة أ إلى مادة ب = معامل أ / معامل ب.',
          inputType: 'ratio',
          targetValue: 2.0,
          targetRatio: { numerator: 2, denominator: 1 },
          timeLimitSeconds: 30, // Short conceptual ratio question
          hint1Ar: 'تلميح 1: معامل K هو 2 ومعامل Br2 هو 1.',
          hint2Ar: 'تلميح 2: اكتب 2/1 أو أدخل القيمة 2.',
          workedSolutionAr: 'الحل النموذجي: النسبة المولية K / Br2 = 2 mol K / 1 mol Br2 = 2.',
        },
        {
          id: 'm3_step2',
          promptAr: 'عند عكس العلاقة: ما النسبة المولية للبروم Br2 إلى البوتاسيوم K؟ (اكتب 1/2 أو 0.5):',
          equationDisplay: '2K(s) + 1Br2(l) -> 2KBr(s)',
          guidanceAr: 'عكس النسبة المولية يقلب البسط والمقام، فيعبر عن كمية البروم المطلوبة لكل مول بوتاسيوم.',
          inputType: 'ratio',
          targetValue: 0.5,
          targetRatio: { numerator: 1, denominator: 2 },
          timeLimitSeconds: 30, // Short conceptual ratio question
          hint1Ar: 'تلميح 1: معامل Br2 في البسط (1) ومعامل K في المقام (2).',
          hint2Ar: 'تلميح 2: النسبة هي 1/2 وتساوي عشرياً 0.5.',
          workedSolutionAr: 'الحل النموذجي: النسبة المولية Br2 / K = 1 mol Br2 / 2 mol K = 0.5.',
        },
      ],
      currentStepIndex: 0,
      isCompleted: false,
      attemptsOnCurrentStep: 0,
      hintsRevealed: 0,
    };

    // MISSION 4: مصفوفة النسب المولية (قانون n(n - 1))
    const m4: MissionChallenge = {
      id: 'mission_4',
      missionNumber: 4,
      titleAr: 'المهمة 4: مصفوفة النسب المولية',
      subtitleAr: 'تطبيق علاقة n(n - 1) لحساب عدد النسب الممكنة',
      reaction: STOICHIOMETRY_REACTIONS.aluminumOxide,
      objectiveAr: 'إتقان حساب عدد النسب المولية الموجهة التي يمكن اشتقاقها من معادلة كيميائية تتضمن n مادة.',
      steps: [
        {
          id: 'm4_step1',
          promptAr: 'في تفاعل تكوين أكسيد الألومنيوم (3 مواد: Al, O2, Al2O3)، كم عدد النسب المولية الموجهة الممكنة باستخدام n(n - 1)؟',
          equationDisplay: '4Al(s) + 3O2(g) -> 2Al2O3(s) [n = 3]',
          guidanceAr: 'عدد المواد n = 3. طبق الصيغة الرياضية: R = n(n - 1).',
          inputType: 'numeric',
          targetValue: 6,
          timeLimitSeconds: 30, // Short conceptual question
          hint1Ar: 'تلميح 1: عوض n = 3 في العلاقة 3 × (3 - 1).',
          hint2Ar: 'تلميح 2: 3 × 2 = 6 نسب مولية موجهة.',
          workedSolutionAr: 'الحل النموذجي: عدد النسب المولية = 3(3 - 1) = 3 × 2 = 6 نسب.',
        },
        {
          id: 'm4_step2',
          promptAr: 'في تفاعل احتراق يتضمن 4 مواد مختلفة (مثل البروبان n = 4)، كم عدد النسب المولية التي يمكن كتابتها؟',
          equationDisplay: 'C3H8 + 5O2 -> 3CO2 + 4H2O [n = 4]',
          guidanceAr: 'كل مادة من الـ 4 يمكن وضعها في بسط النسبة مع 3 مواد أخرى في المقام (4 × 3).',
          inputType: 'numeric',
          targetValue: 12,
          timeLimitSeconds: 30, // Short conceptual question
          hint1Ar: 'تلميح 1: طبق الصيغة: 4 × (4 - 1).',
          hint2Ar: 'تلميح 2: 4 × 3 = 12 نسبة مولية.',
          workedSolutionAr: 'الحل النموذجي: عدد النسب المولية = 4(4 - 1) = 4 × 3 = 12 نسبة مولية موجهة.',
        },
      ],
      currentStepIndex: 0,
      isCompleted: false,
      attemptsOnCurrentStep: 0,
      hintsRevealed: 0,
    };

    // MISSION 5: المفاعل الأخير - احتراق البيوتان وحسابات الكميات (2C4H10 + 13O2 -> 8CO2 + 10H2O)
    const m5: MissionChallenge = {
      id: 'mission_5',
      missionNumber: 5,
      titleAr: 'المهمة 5: المفاعل الأخير (حسابات البيوتان)',
      subtitleAr: 'اختراق درع الزعيم الآلي عبر الحسابات الكيميائية الشاملة',
      reaction: STOICHIOMETRY_REACTIONS.butaneCombustion,
      objectiveAr: 'إتمام الحسابات الكمية الشاملة على احتراق البيوتان لتعطيل درع الزعيم وإحكام استقرار المفاعل.',
      steps: [
        {
          id: 'm5_step1',
          promptAr: 'المرحلة 1: ما عدد النسب المولية الموجهة التي يمكن اشتقاقها من معادلة احتراق البيوتان ذات المواد الـ 4؟',
          equationDisplay: '2C4H10 + 13O2 -> 8CO2 + 10H2O',
          guidanceAr: 'تحتوي المعادلة على 4 مواد (بيوتان، أكسجين، ثاني أكسيد الكربون، ماء).',
          inputType: 'numeric',
          targetValue: 12,
          timeLimitSeconds: 45, // Boss challenge conceptual phase: 45s (conforming to 45-60s for boss challenges)
          hint1Ar: 'تلميح 1: استخدم علاقة n(n - 1) حيث n = 4.',
          hint2Ar: 'تلميح 2: 4 × (4 - 1) = 12 نسبة.',
          workedSolutionAr: 'الحل النموذجي: 4(4 - 1) = 12 نسبة مولية موجهة.',
        },
        {
          id: 'm5_step2',
          promptAr: 'المرحلة 2: ما النسبة المولية للأكسجين O2 إلى البيوتان C4H10؟ (أدخل 13/2 أو 6.5):',
          equationDisplay: '2C4H10 + 13O2 -> 8CO2 + 10H2O',
          guidanceAr: 'معامل الأكسجين مقسوماً على معامل البيوتان.',
          inputType: 'ratio',
          targetValue: 6.5,
          targetRatio: { numerator: 13, denominator: 2 },
          timeLimitSeconds: 45, // Boss standard calculation phase: 45s
          hint1Ar: 'تلميح 1: معامل O2 هو 13 ومعامل C4H10 هو 2.',
          hint2Ar: 'تلميح 2: 13 ÷ 2 = 6.5 (أو 13/2).',
          workedSolutionAr: 'الحل النموذجي: النسبة المولية O2 / C4H10 = 13 / 2 = 6.5.',
        },
        {
          id: 'm5_step3',
          promptAr: 'المرحلة 3: مسألة كمية: إذا احترق 4 مول من البيوتان C4H10 تماماً، كم مولاً من CO2 ينتج؟',
          equationDisplay: '2C4H10 + 13O2 -> 8CO2 + 10H2O',
          guidanceAr: 'استخدم النسبة المولية: (8 مول CO2 / 2 مول C4H10) مضروبة في 4 مول بيوتان.',
          inputType: 'numeric',
          targetValue: 16,
          timeLimitSeconds: 60, // Boss multi-step calculation: 60s
          hint1Ar: 'تلميح 1: كل 2 مول بيوتان ينتج 8 مول CO2، فماذا عن 4 مول بيوتان؟',
          hint2Ar: 'تلميح 2: اضرب 4 في النسبة المولية (8 / 2 = 4): 4 × 4 = 16 مول.',
          workedSolutionAr: 'الحل النموذجي: مولات CO2 = 4 mol C4H10 × (8 mol CO2 / 2 mol C4H10) = 16 mol CO2.',
        },
      ],
      currentStepIndex: 0,
      isCompleted: false,
      attemptsOnCurrentStep: 0,
      hintsRevealed: 0,
    };

    this.missions = [m1, m2, m3, m4, m5];
  }

  public getMissions(): MissionChallenge[] {
    return this.missions;
  }

  public getActiveMission(): MissionChallenge {
    return this.missions[this.activeMissionIndex] || this.missions[0];
  }

  public getMissionByIndex(index: number): MissionChallenge | undefined {
    return this.missions[index];
  }

  public setActiveMissionIndex(index: number): void {
    if (index >= 0 && index < this.missions.length) {
      this.activeMissionIndex = index;
    }
  }

  public getTotalScore(): number {
    return this.totalScore;
  }

  public getCombo(): number {
    return this.currentCombo;
  }

  public getStats() {
    return {
      score: this.totalScore,
      combo: this.currentCombo,
      maxCombo: this.maxCombo,
      correct: this.totalCorrectAnswers,
      incorrect: this.totalIncorrectAnswers,
      hintsUsed: this.totalHintsUsed,
    };
  }

  /**
   * Submits an answer for the current step in the active mission
   */
  public submitAnswer(rawInput: string): ChallengeEvaluationResult {
    const mission = this.getActiveMission();
    const step = mission.steps[mission.currentStepIndex];
    if (!step) {
      return {
        isCorrect: false,
        scoreAwarded: 0,
        comboMultiplier: this.currentCombo,
        feedbackMessageAr: 'تم إكمال جميع خطوات هذه المهمة!',
        isStepCompleted: true,
        isMissionCompleted: mission.isCompleted,
        penaltyStability: 0,
      };
    }

    const parsed = parseRatioOrNumber(rawInput);
    let isCorrect = false;

    if (parsed !== null && step.targetValue !== undefined) {
      isCorrect = isNumberClose(parsed, step.targetValue);
    } else if (parsed !== null && step.targetRatio !== undefined) {
      const expectedRatio = step.targetRatio.numerator / step.targetRatio.denominator;
      isCorrect = isNumberClose(parsed, expectedRatio);
    }

    if (isCorrect) {
      this.totalCorrectAnswers++;
      const basePoints = 120;
      const stepScore = Math.round(basePoints * this.currentCombo);
      this.totalScore += stepScore;

      // Increase combo
      this.currentCombo = Math.min(4.0, +(this.currentCombo + 0.5).toFixed(1));
      if (this.currentCombo > this.maxCombo) {
        this.maxCombo = this.currentCombo;
      }

      mission.currentStepIndex++;
      mission.attemptsOnCurrentStep = 0;
      mission.hintsRevealed = 0;

      const isMissionCompleted = mission.currentStepIndex >= mission.steps.length;
      if (isMissionCompleted) {
        mission.isCompleted = true;
        this.totalScore += 250; // Mission completion bonus
      }

      return {
        isCorrect: true,
        scoreAwarded: stepScore,
        comboMultiplier: this.currentCombo,
        feedbackMessageAr: isMissionCompleted
          ? 'إجابة ممتازة! تم إنجاز المهمة بنجاح.'
          : 'إجابة صحيحة ودقيقة! انتقل للخطوة التالية.',
        isStepCompleted: true,
        isMissionCompleted,
        penaltyStability: 0,
      };
    } else {
      this.totalIncorrectAnswers++;
      this.currentCombo = 1.0; // Reset combo on error
      mission.attemptsOnCurrentStep++;

      let hint: string | undefined;
      let workedSolution: string | undefined;
      let penalty = 4; // Minor reactor stability penalty

      if (mission.attemptsOnCurrentStep === 1) {
        hint = step.hint1Ar;
        this.totalHintsUsed++;
      } else if (mission.attemptsOnCurrentStep === 2) {
        hint = step.hint2Ar;
        this.totalHintsUsed++;
        penalty = 6;
      } else {
        workedSolution = step.workedSolutionAr;
        penalty = 8;
      }

      return {
        isCorrect: false,
        scoreAwarded: 0,
        comboMultiplier: 1.0,
        feedbackMessageAr:
          mission.attemptsOnCurrentStep >= 3
            ? 'الإجابة غير صحيحة. راجع خطوات الحل النموذجي ثم أعد المحاولة لتثبيت الفهم.'
            : 'الإجابة غير صحيحة، راجع التلميح وحاول مرة أخرى.',
        hintToShow: hint,
        workedSolution,
        isStepCompleted: false,
        isMissionCompleted: false,
        penaltyStability: penalty,
      };
    }
  }

  /**
   * Handles question timeout when countdown expires
   */
  public handleTimeout(): ChallengeEvaluationResult {
    const mission = this.getActiveMission();
    const step = mission.steps[mission.currentStepIndex];
    if (!step) {
      return {
        isCorrect: false,
        scoreAwarded: 0,
        comboMultiplier: this.currentCombo,
        feedbackMessageAr: 'تم إكمال جميع خطوات هذه المهمة!',
        isStepCompleted: true,
        isMissionCompleted: mission.isCompleted,
        penaltyStability: 0,
      };
    }

    this.totalIncorrectAnswers++;
    this.currentCombo = 1.0;
    mission.attemptsOnCurrentStep++;

    let hint: string | undefined;
    let workedSolution: string | undefined;
    let penalty = 6;

    if (mission.attemptsOnCurrentStep === 1) {
      hint = step.hint1Ar;
      this.totalHintsUsed++;
    } else if (mission.attemptsOnCurrentStep === 2) {
      hint = step.hint2Ar;
      this.totalHintsUsed++;
      penalty = 8;
    } else {
      workedSolution = step.workedSolutionAr;
      penalty = 10;
    }

    return {
      isCorrect: false,
      scoreAwarded: 0,
      comboMultiplier: 1.0,
      feedbackMessageAr:
        mission.attemptsOnCurrentStep >= 3
          ? 'انتهى الوقت المخصص للإجابة! راجع خطوات الحل النموذجي ثم أعد المحاولة لتثبيت المفهوم.'
          : 'انتهى الوقت المخصص للإجابة! راجع التلميح وحاول مرة أخرى.',
      hintToShow: hint,
      workedSolution,
      isStepCompleted: false,
      isMissionCompleted: false,
      penaltyStability: penalty,
    };
  }

  public resetAll(): void {
    this.totalScore = 0;
    this.currentCombo = 1;
    this.maxCombo = 1;
    this.totalCorrectAnswers = 0;
    this.totalIncorrectAnswers = 0;
    this.totalHintsUsed = 0;
    this.activeMissionIndex = 0;
    this.initMissions();
  }
}
