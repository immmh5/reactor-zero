/**
 * LAB GUARDIAN - Stoichiometry Academy Types
 * Defines data structures for 3D science demonstrations,
 * the 20-question certification exam, and student progress reports.
 */

export type CurriculumSkillId =
  | 'equation_interpretation'
  | 'representative_particles'
  | 'mole_relationships'
  | 'conservation_of_mass'
  | 'reactant_product_mass'
  | 'directed_mole_ratios'
  | 'mole_ratio_inversion'
  | 'n_formula_calculation'
  | 'mole_ratio_application'
  | 'multistep_stoichiometry';

export interface CurriculumSkill {
  id: CurriculumSkillId;
  nameAr: string;
  descriptionAr: string;
}

export const CURRICULUM_SKILLS: Record<CurriculumSkillId, CurriculumSkill> = {
  equation_interpretation: {
    id: 'equation_interpretation',
    nameAr: 'تفسير المعادلات الكيميائية الموزونة',
    descriptionAr: 'قراءة المعاملات ودلالاتها على الجسيمات والمولات.',
  },
  representative_particles: {
    id: 'representative_particles',
    nameAr: 'الجسيمات الممثلة (ذرات، جزيئات، وحدات صيغة)',
    descriptionAr: 'التمييز بين نوع الجسيم الممثل للعناصر والمركبات الجزيئية والأيونية.',
  },
  mole_relationships: {
    id: 'mole_relationships',
    nameAr: 'علاقات المولات المتبادلة',
    descriptionAr: 'الربط المباشر بين نسب المعاملات ومولات المواد.',
  },
  conservation_of_mass: {
    id: 'conservation_of_mass',
    nameAr: 'قانون حفظ الكتلة',
    descriptionAr: 'تساوي كتل المتفاعلات الكلية مع كتل النواتج الكلية.',
  },
  reactant_product_mass: {
    id: 'reactant_product_mass',
    nameAr: 'حساب كتل المتفاعلات والنواتج بالجرامات',
    descriptionAr: 'استخدام الكتل المولية لحساب كتل المواد بالجرام.',
  },
  directed_mole_ratios: {
    id: 'directed_mole_ratios',
    nameAr: 'اشتقاق النسب المولية الموجهة',
    descriptionAr: 'كتابة النسبة المولية بين أي مادتين في المعادلة الموزونة.',
  },
  mole_ratio_inversion: {
    id: 'mole_ratio_inversion',
    nameAr: 'مقلوب النسبة المولية',
    descriptionAr: 'فهم أثر عكس بسط ومقام النسبة المولية على الحسابات.',
  },
  n_formula_calculation: {
    id: 'n_formula_calculation',
    nameAr: 'قانون عدد النسب المولية n(n - 1)',
    descriptionAr: 'حساب إجمالي النسب المولية الممكنة لتفاعل يضم n مادة.',
  },
  mole_ratio_application: {
    id: 'mole_ratio_application',
    nameAr: 'تطبيق النسب المولية في الحسابات الكيميائية',
    descriptionAr: 'إيجاد مولات مادة مجهولة من مولات مادة معلومة.',
  },
  multistep_stoichiometry: {
    id: 'multistep_stoichiometry',
    nameAr: 'المسائل الحسابية متعددة الخطوات',
    descriptionAr: 'الربط المتسلسل بين كتل ومولات المتفاعلات والنواتج.',
  },
};

export type QuestionInputType = 'multiple_choice' | 'numeric' | 'ratio';

export interface ExamQuestion {
  id: string;
  skillId: CurriculumSkillId;
  questionAr: string;
  equationDisplay?: string;
  inputType: QuestionInputType;
  optionsAr?: { text: string; value: string }[];
  correctAnswer: string | number; // Accepted canonical answer
  acceptableAnswers?: (string | number)[]; // Equivalents, e.g. fractions, decimals
  explanationAr: string;
  timeLimitSeconds: number; // 30s conceptual, 45s standard, 60s multi-step
  topicBadgeAr: string;
}

export interface StudentExamAnswer {
  questionId: string;
  studentAnswer: string;
  isCorrect: boolean;
  timeSpentSeconds: number;
  timedOut: boolean;
}

export interface ExamResultReport {
  examId: string;
  examTitleAr: string;
  targetTier: 1 | 2 | 3;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  percentageScore: number;
  passingScorePercent: number; // Default 80% (16/20)
  hasPassed: boolean;
  totalTimeSeconds: number;
  skillBreakdown: {
    skillId: CurriculumSkillId;
    skillNameAr: string;
    total: number;
    correct: number;
    accuracyPercent: number;
  }[];
  weakSkillsAr: string[];
  recommendedReviewsAr: string[];
  unlockedLocationId?: string;
  badgeAwardedAr?: string;
  answers: StudentExamAnswer[];
}

export type CertificationExamReport = ExamResultReport;

export interface Atom3DDefinition {
  element: 'Fe' | 'O' | 'C' | 'H' | 'K' | 'Br' | 'Al';
  symbol: string;
  nameAr: string;
  colorHex: string;
  radius: number;
}

export interface ScienceDemonstration {
  id: string;
  titleAr: string;
  subtitleAr: string;
  reactionFormula: string;
  demonstrationType: 'atom_conservation' | 'molecule_inspection' | 'mass_balance' | 'ionic_lattice' | 'ratio_matrix';
  descriptionAr: string;
  learningTakeawayAr: string;
  substancesAr: string[];
  atomConservation: {
    beforeCounts: Record<string, number>;
    afterCounts: Record<string, number>;
  };
  detailsAr: string[];
  matrixSize?: number;
  matrixData?: { row: string; col: string; ratio: string }[];
}
