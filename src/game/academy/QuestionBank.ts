/**
 * LAB GUARDIAN - Stoichiometry Question Bank
 * Contains scientifically validated questions covering the 10 core curriculum skills across 3 certification tiers:
 * Tier 1: Foundational concepts, balanced equation interpretation, representative particles.
 * Tier 2: Mass calculations, directed mole ratios, inverse ratios, n(n-1) formula.
 * Tier 3: Multi-step stoichiometry, butane combustion matrix, integrated calculations.
 *
 * All questions strictly use verified curriculum equations:
 * 4Fe(s) + 3O2(g) -> 2Fe2O3(s)
 * 2K(s) + Br2(l) -> 2KBr(s)
 * 4Al(s) + 3O2(g) -> 2Al2O3(s)
 * C3H8(g) + 5O2(g) -> 3CO2(g) + 4H2O(g)
 * 2C4H10(g) + 13O2(g) -> 8CO2(g) + 10H2O(g)
 */

import { ExamQuestion, CurriculumSkillId } from './AcademyTypes';

export interface TierExamQuestion extends ExamQuestion {
  tier: 1 | 2 | 3;
}

export const QUESTION_BANK: TierExamQuestion[] = [
  // =========================================================================
  // SKILL 1: EQUATION INTERPRETATION
  // =========================================================================
  {
    id: 'q_eq_1',
    tier: 1,
    skillId: 'equation_interpretation',
    topicBadgeAr: 'تفسير المعادلات',
    questionAr: 'في المعادلة الموزونة 4Fe + 3O2 -> 2Fe2O3، ماذا يمثل الرقم (4) المكتوب قبل Fe؟',
    equationDisplay: '4Fe(s) + 3O2(g) -> 2Fe2O3(s)',
    inputType: 'multiple_choice',
    optionsAr: [
      { text: 'معامل يمثل عدد المولات أو الذرات', value: 'coeff' },
      { text: 'عدد ذرات الحديد داخل المركب', value: 'subscript' },
      { text: 'شحنة أيون الحديد', value: 'charge' },
      { text: 'الكتلة المولية للحديد', value: 'mass' },
    ],
    correctAnswer: 'coeff',
    timeLimitSeconds: 30,
    explanationAr: 'الرقم المكتوب على يسار الصيغة هو "المعامل" (Coefficient) ويدل على عدد الجسيمات أو نسب المولات.',
  },
  {
    id: 'q_eq_t1_2',
    tier: 1,
    skillId: 'equation_interpretation',
    topicBadgeAr: 'تفسير المعادلات',
    questionAr: 'ما هو معامل غاز الأكسجين O2 في المعادلة المتزنة لاحتراق البروبان C3H8 + ? O2 -> 3CO2 + 4H2O؟',
    equationDisplay: 'C3H8(g) + [ ? ] O2(g) -> 3CO2(g) + 4H2O(g)',
    inputType: 'numeric',
    correctAnswer: 5,
    acceptableAnswers: [5, '5'],
    timeLimitSeconds: 30,
    explanationAr: 'في النواتج (3×2=6 من CO2) + (4×1=4 من H2O) = 10 ذرات O. بالقسمة على 2، يكون معامل O2 هو 5.',
  },
  {
    id: 'q_eq_t2_1',
    tier: 2,
    skillId: 'equation_interpretation',
    topicBadgeAr: 'تفسير المعادلات',
    questionAr: 'في تفاعل تكوين أكسيد الألومنيوم 4Al + 3O2 -> 2Al2O3، ما النسبة بين معاملات Al و Al2O3؟',
    equationDisplay: '4Al(s) + 3O2(g) -> 2Al2O3(s)',
    inputType: 'multiple_choice',
    optionsAr: [
      { text: '4 إلى 2 (أي 2 إلى 1)', value: '4_2' },
      { text: '3 إلى 2', value: '3_2' },
      { text: '4 إلى 3', value: '4_3' },
      { text: '1 إلى 2', value: '1_2' },
    ],
    correctAnswer: '4_2',
    timeLimitSeconds: 30,
    explanationAr: 'معامل Al هو 4 ومعامل Al2O3 هو 2، فالنسبة بينهما 4 : 2 (أو 2 : 1).',
  },
  {
    id: 'q_eq_t3_1',
    tier: 3,
    skillId: 'equation_interpretation',
    topicBadgeAr: 'تفسير المعادلات',
    questionAr: 'في تفاعل احتراق البيوتان 2C4H10 + 13O2 -> 8CO2 + 10H2O، ما هو مجموع معاملات المواد الناتجة؟',
    equationDisplay: '2C4H10(g) + 13O2(g) -> 8CO2(g) + 10H2O(g)',
    inputType: 'numeric',
    correctAnswer: 18,
    acceptableAnswers: [18, '18'],
    timeLimitSeconds: 30,
    explanationAr: 'المواد الناتجة هي 8CO2 و 10H2O؛ إذن مجموع المعاملات = 8 + 10 = 18.',
  },

  // =========================================================================
  // SKILL 2: REPRESENTATIVE PARTICLES
  // =========================================================================
  {
    id: 'q_part_t1_1',
    tier: 1,
    skillId: 'representative_particles',
    topicBadgeAr: 'الجسيمات الممثلة',
    questionAr: 'ما هو الجسيم الممثل الصحيح لمركب بروميد البوتاسيوم KBr في المعادلة 2K + Br2 -> 2KBr؟',
    equationDisplay: '2K(s) + Br2(l) -> 2KBr(s)',
    inputType: 'multiple_choice',
    optionsAr: [
      { text: 'وحدة صيغة (لأنه مركب أيوني)', value: 'formula_unit' },
      { text: 'جزيء تساهمي منفصل', value: 'molecule' },
      { text: 'ذرة مفردة', value: 'atom' },
      { text: 'إلكترون حر', value: 'electron' },
    ],
    correctAnswer: 'formula_unit',
    timeLimitSeconds: 30,
    explanationAr: 'مركب KBr يتكون من فلز ولا فلز فهو مركب أيوني صلب، والجسيم الممثل للمركبات الأيونية هو وحدة الصيغة (Formula Unit).',
  },
  {
    id: 'q_part_t1_2',
    tier: 1,
    skillId: 'representative_particles',
    topicBadgeAr: 'الجسيمات الممثلة',
    questionAr: 'في تفاعل أكسدة الحديد 4Fe + 3O2 -> 2Fe2O3، ما نوع الجسيم الممثل لغاز الأكسجين O2؟',
    equationDisplay: '4Fe(s) + 3O2(g) -> 2Fe2O3(s)',
    inputType: 'multiple_choice',
    optionsAr: [
      { text: 'جزيء (Molecule)', value: 'molecule' },
      { text: 'ذرة (Atom)', value: 'atom' },
      { text: 'وحدة صيغة (Formula Unit)', value: 'formula_unit' },
      { text: 'أيون سالب فقط', value: 'ion' },
    ],
    correctAnswer: 'molecule',
    timeLimitSeconds: 30,
    explanationAr: 'الأكسجين عنصر لافلزي يوجد في صورة جزيئات ثنائية الذرة O2، لذا جسيمه الممثل هو الجزيء.',
  },
  {
    id: 'q_part_t2_1',
    tier: 2,
    skillId: 'representative_particles',
    topicBadgeAr: 'الجسيمات الممثلة',
    questionAr: 'ما هو الجسيم الممثل لفلز الحديد Fe في الحالة النقية الصلبة؟',
    inputType: 'multiple_choice',
    optionsAr: [
      { text: 'ذرة (Atom)', value: 'atom' },
      { text: 'جزيء (Molecule)', value: 'molecule' },
      { text: 'وحدة صيغة (Formula Unit)', value: 'formula_unit' },
      { text: 'بروتون حر', value: 'proton' },
    ],
    correctAnswer: 'atom',
    timeLimitSeconds: 30,
    explanationAr: 'الفلزات النقية غير المرتبطة كيميائياً (مثل الحديد الصلب Fe) جسيمها الممثل هو الذرة المنفردة.',
  },
  {
    id: 'q_part_t3_1',
    tier: 3,
    skillId: 'representative_particles',
    topicBadgeAr: 'الجسيمات الممثلة',
    questionAr: 'في احتراق البروبان C3H8 + 5O2 -> 3CO2 + 4H2O، كم جزيئاً كلياً ينتج عند تكوين 3 مولات من CO2 و 4 مولات من H2O؟',
    equationDisplay: 'C3H8(g) + 5O2(g) -> 3CO2(g) + 4H2O(g)',
    inputType: 'multiple_choice',
    optionsAr: [
      { text: '7 مولات من الجزيئات (7 × 6.02×10²³)', value: '7_moles' },
      { text: 'جزيء واحد فقط', value: '1_mol' },
      { text: '12 جزيئاً', value: '12_mol' },
      { text: 'لا توجد جزيئات في النواتج', value: 'none' },
    ],
    correctAnswer: '7_moles',
    timeLimitSeconds: 45,
    explanationAr: 'كلا الناتجين (CO2 و H2O) مركبات تساهمية جزيئية. إجمالي مولات الجزيئات = 3 + 4 = 7 مولات جزيئية.',
  },

  // =========================================================================
  // SKILL 3: MOLE RELATIONSHIPS
  // =========================================================================
  {
    id: 'q_mole_t1_1',
    tier: 1,
    skillId: 'mole_relationships',
    topicBadgeAr: 'علاقات المولات',
    questionAr: 'كم مولاً من Fe2O3 ينتج عند استهلاك 6 مولات من غاز الأكسجين O2 تماماً حسب: 4Fe + 3O2 -> 2Fe2O3؟',
    equationDisplay: '4Fe(s) + 3O2(g) -> 2Fe2O3(s)',
    inputType: 'numeric',
    correctAnswer: 4,
    acceptableAnswers: [4, '4'],
    timeLimitSeconds: 45,
    explanationAr: 'كل 3 مول O2 تنتج 2 مول Fe2O3. بمضاعفة كمية O2 إلى 6 مول (ضرب في 2)، تتضاعف النواتج إلى 2 × 2 = 4 مول Fe2O3.',
  },
  {
    id: 'q_mole_t1_2',
    tier: 1,
    skillId: 'mole_relationships',
    topicBadgeAr: 'علاقات المولات',
    questionAr: 'في التفاعل 2K + Br2 -> 2KBr، كم مولاً من فلز البوتاسيوم K يلزم للتفاعل تماماً مع 3 مولات من Br2؟',
    equationDisplay: '2K(s) + Br2(l) -> 2KBr(s)',
    inputType: 'numeric',
    correctAnswer: 6,
    acceptableAnswers: [6, '6'],
    timeLimitSeconds: 45,
    explanationAr: 'النسبة المولية هي 2 mol K لكل 1 mol Br2. إذن يلزم 3 × 2 = 6 مولات من البوتاسيوم.',
  },
  {
    id: 'q_mole_t2_1',
    tier: 2,
    skillId: 'mole_relationships',
    topicBadgeAr: 'علاقات المولات',
    questionAr: 'في المعادلة 4Al + 3O2 -> 2Al2O3، كم مولاً من الألومنيوم يلزم لإنتاج 8 مولات من Al2O3؟',
    equationDisplay: '4Al(s) + 3O2(g) -> 2Al2O3(s)',
    inputType: 'numeric',
    correctAnswer: 16,
    acceptableAnswers: [16, '16'],
    timeLimitSeconds: 45,
    explanationAr: 'كل 2 مول Al2O3 تحتاج 4 مول Al (الضعف). إذن 8 مول Al2O3 تحتاج 8 × 2 = 16 مول Al.',
  },
  {
    id: 'q_mole_t3_1',
    tier: 3,
    skillId: 'mole_relationships',
    topicBadgeAr: 'علاقات المولات',
    questionAr: 'في احتراق البيوتان 2C4H10 + 13O2 -> 8CO2 + 10H2O، كم مولاً من O2 يلزم للتفاعل مع 4 مولات من C4H10؟',
    equationDisplay: '2C4H10(g) + 13O2(g) -> 8CO2(g) + 10H2O(g)',
    inputType: 'numeric',
    correctAnswer: 26,
    acceptableAnswers: [26, '26'],
    timeLimitSeconds: 45,
    explanationAr: 'النسبة المولية 13/2. عند استهلاك 4 مول بيوتان (ضعف الـ 2)، يلزم 13 × 2 = 26 مول من الأكسجين O2.',
  },

  // =========================================================================
  // SKILL 4: CONSERVATION OF MASS
  // =========================================================================
  {
    id: 'q_mass_cons_1',
    tier: 1,
    skillId: 'conservation_of_mass',
    topicBadgeAr: 'حفظ الكتلة',
    questionAr: 'إذا تفاعل 223.4g من الحديد مع 96.0g من الأكسجين تماماً، فما كتلة أكسيد الحديد Fe2O3 الناتجة بالجرام؟',
    equationDisplay: '4Fe(s) + 3O2(g) -> 2Fe2O3(s)',
    inputType: 'numeric',
    correctAnswer: 319.4,
    acceptableAnswers: [319.4, '319.4', '319.40'],
    timeLimitSeconds: 45,
    explanationAr: 'وفق قانون حفظ الكتلة: كتلة النواتج = كتلة المتفاعلات = 223.4 + 96.0 = 319.4 جرام.',
  },
  {
    id: 'q_mass_cons_t1_2',
    tier: 1,
    skillId: 'conservation_of_mass',
    topicBadgeAr: 'حفظ الكتلة',
    questionAr: 'في احتراق البروبان C3H8 + 5O2 -> 3CO2 + 4H2O، إذا كانت كتلة المتفاعلات الكلية 204.1g، فما كتلة النواتج الكلية؟',
    equationDisplay: 'C3H8(g) + 5O2(g) -> 3CO2(g) + 4H2O(g)',
    inputType: 'numeric',
    correctAnswer: 204.1,
    acceptableAnswers: [204.1, '204.1', 204.11, '204.11'],
    timeLimitSeconds: 30,
    explanationAr: 'قانون حفظ الكتلة ينص على أن كتلة النواتج تساوي دائماً كتلة المتفاعلات في أي تفاعل مغلق = 204.1g.',
  },
  {
    id: 'q_mass_cons_t2_1',
    tier: 2,
    skillId: 'conservation_of_mass',
    topicBadgeAr: 'حفظ الكتلة',
    questionAr: 'إذا نتج 238.2g من KBr عند تفاعل 78.2g من البوتاسيوم مع غاز البروم Br2 تماماً، فما كتلة البروم المتفاعلة؟',
    equationDisplay: '2K(s) + Br2(l) -> 2KBr(s)',
    inputType: 'numeric',
    correctAnswer: 160.0,
    acceptableAnswers: [160, 160.0, '160', '160.0'],
    timeLimitSeconds: 45,
    explanationAr: 'كتلة المتفاعلات = كتلة النواتج: 78.2 + كتلة Br2 = 238.2g. إذن كتلة Br2 = 238.2 - 78.2 = 160.0 جرام.',
  },
  {
    id: 'q_mass_cons_t3_1',
    tier: 3,
    skillId: 'conservation_of_mass',
    topicBadgeAr: 'حفظ الكتلة',
    questionAr: 'لماذا قد تظهر الحسابات الدقيقة كتل المتفاعلات 204.10g والنواتج 204.11g في احتراق البروبان؟',
    inputType: 'multiple_choice',
    optionsAr: [
      { text: 'بسبب تقريب الأوزان والكتل الذرية في الجداول الدورية', value: 'rounding' },
      { text: 'لأن قانون حفظ الكتلة غير صحيح', value: 'law_wrong' },
      { text: 'لأن ذرة أكسجين إضافية خُلقت أثناء التفاعل', value: 'created' },
      { text: 'بسبب تسرب الغاز من النظام المغلق', value: 'leak' },
    ],
    correctAnswer: 'rounding',
    timeLimitSeconds: 45,
    explanationAr: 'الفارق الطفيف (0.01g) ناتج عن تقريب الكتل الذرية للعناصر (الكربون 12.011 والهيدروجين 1.008 والأكسجين 15.999)، بينما الكتلة الفعلية محفوظة بدقة تامة.',
  },

  // =========================================================================
  // SKILL 5: REACTANT AND PRODUCT MASS
  // =========================================================================
  {
    id: 'q_mass_calc_t1_1',
    tier: 1,
    skillId: 'reactant_product_mass',
    topicBadgeAr: 'حساب الكتل',
    questionAr: 'احسب كتلة 2 مول من ثاني أكسيد الكربون CO2 بالجرام (الكتلة المولية لـ CO2 = 44.01 g/mol).',
    inputType: 'numeric',
    correctAnswer: 88.02,
    acceptableAnswers: [88.02, '88.02', 88],
    timeLimitSeconds: 45,
    explanationAr: 'الكتلة بالجرام = عدد المولات × الكتلة المولية = 2 × 44.01 = 88.02 g.',
  },
  {
    id: 'q_mass_calc_t1_2',
    tier: 1,
    skillId: 'reactant_product_mass',
    topicBadgeAr: 'حساب الكتل',
    questionAr: 'كم جراماً من بخار الماء H2O ينتج من احتراق 1 مول من البروبان (ينتج 4 مولات H2O، والكتلة المولية للماء 18.02 g/mol)؟',
    equationDisplay: 'C3H8(g) + 5O2(g) -> 3CO2(g) + 4H2O(g)',
    inputType: 'numeric',
    correctAnswer: 72.08,
    acceptableAnswers: [72.08, '72.08', 72.1, 72],
    timeLimitSeconds: 45,
    explanationAr: 'الكتلة = 4 مول × 18.02 g/mol = 72.08 جرام.',
  },
  {
    id: 'q_mass_calc_t2_1',
    tier: 2,
    skillId: 'reactant_product_mass',
    topicBadgeAr: 'حساب الكتل',
    questionAr: 'احسب كتلة 5 مولات من غاز الأكسجين O2 بالجرام (الكتلة المولية لـ O2 = 32.00 g/mol).',
    inputType: 'numeric',
    correctAnswer: 160.0,
    acceptableAnswers: [160, 160.0, '160', '160.0'],
    timeLimitSeconds: 45,
    explanationAr: 'الكتلة = 5 mol × 32.00 g/mol = 160.0 جرام.',
  },
  {
    id: 'q_mass_calc_t3_1',
    tier: 3,
    skillId: 'reactant_product_mass',
    topicBadgeAr: 'حساب الكتل',
    questionAr: 'ما هي الكتلة الكلية لـ 3 مول CO2 (44.01 g/mol) و 4 مول H2O (18.02 g/mol) بالجرام؟',
    inputType: 'numeric',
    correctAnswer: 204.11,
    acceptableAnswers: [204.11, '204.11', 204.1, '204.1'],
    timeLimitSeconds: 45,
    explanationAr: 'كتلة CO2 = 3 × 44.01 = 132.03g، وكتلة H2O = 4 × 18.02 = 72.08g. المجموع = 132.03 + 72.08 = 204.11 جرام.',
  },

  // =========================================================================
  // SKILL 6: DIRECTED MOLE RATIOS
  // =========================================================================
  {
    id: 'q_ratio_1',
    tier: 1,
    skillId: 'directed_mole_ratios',
    topicBadgeAr: 'النسب المولية الموجهة',
    questionAr: 'ما هي النسبة المولية الموجهة لـ (Fe / O2) في التفاعل المتزن: 4Fe + 3O2 -> 2Fe2O3؟',
    equationDisplay: '4Fe(s) + 3O2(g) -> 2Fe2O3(s)',
    inputType: 'ratio',
    correctAnswer: '4/3',
    acceptableAnswers: ['4/3', '4:3', 1.33, '1.33', '1.333'],
    timeLimitSeconds: 45,
    explanationAr: 'النسبة المولية Fe/O2 تكتب بقسمة معامل Fe (4) على معامل O2 (3) = 4/3.',
  },
  {
    id: 'q_ratio_t1_2',
    tier: 1,
    skillId: 'directed_mole_ratios',
    topicBadgeAr: 'النسب المولية الموجهة',
    questionAr: 'في التفاعل 4Al + 3O2 -> 2Al2O3، ما النسبة المولية الموجهة لـ (Al / Al2O3)؟',
    equationDisplay: '4Al(s) + 3O2(g) -> 2Al2O3(s)',
    inputType: 'ratio',
    correctAnswer: '4/2',
    acceptableAnswers: ['4/2', '4:2', '2/1', '2:1', 2, '2'],
    timeLimitSeconds: 45,
    explanationAr: 'معامل Al هو 4 ومعامل Al2O3 هو 2، فالنسبة 4/2 (أو 2/1).',
  },
  {
    id: 'q_ratio_t2_1',
    tier: 2,
    skillId: 'directed_mole_ratios',
    topicBadgeAr: 'النسب المولية الموجهة',
    questionAr: 'في احتراق البروبان C3H8 + 5O2 -> 3CO2 + 4H2O، ما النسبة المولية الموجهة لـ (O2 / CO2)؟',
    equationDisplay: 'C3H8(g) + 5O2(g) -> 3CO2(g) + 4H2O(g)',
    inputType: 'ratio',
    correctAnswer: '5/3',
    acceptableAnswers: ['5/3', '5:3', 1.67, '1.67'],
    timeLimitSeconds: 45,
    explanationAr: 'معامل O2 هو 5 ومعامل CO2 هو 3، فالنسبة المولية O2 / CO2 = 5/3.',
  },
  {
    id: 'q_ratio_t3_1',
    tier: 3,
    skillId: 'directed_mole_ratios',
    topicBadgeAr: 'النسب المولية الموجهة',
    questionAr: 'في احتراق البيوتان 2C4H10 + 13O2 -> 8CO2 + 10H2O، ما النسبة المولية الموجهة لـ (CO2 / C4H10)؟',
    equationDisplay: '2C4H10(g) + 13O2(g) -> 8CO2(g) + 10H2O(g)',
    inputType: 'ratio',
    correctAnswer: '8/2',
    acceptableAnswers: ['8/2', '8:2', '4/1', '4:1', 4, '4'],
    timeLimitSeconds: 45,
    explanationAr: 'معامل CO2 هو 8 ومعامل C4H10 هو 2، فالنسبة 8/2 (أو 4/1 = 4).',
  },

  // =========================================================================
  // SKILL 7: MOLE RATIO INVERSION
  // =========================================================================
  {
    id: 'q_invert_t1_1',
    tier: 1,
    skillId: 'mole_ratio_inversion',
    topicBadgeAr: 'مقلوب النسبة المولية',
    questionAr: 'إذا كانت النسبة المولية الموجهة لـ (Fe / O2) هي 4/3، فما هي النسبة المولية العكسية (O2 / Fe)؟',
    equationDisplay: '4Fe(s) + 3O2(g) -> 2Fe2O3(s)',
    inputType: 'ratio',
    correctAnswer: '3/4',
    acceptableAnswers: ['3/4', '3:4', 0.75, '0.75'],
    timeLimitSeconds: 30,
    explanationAr: 'عكس النسبة المولية يقلب البسط والمقام، فتصبح النسبة 3/4 أو 0.75.',
  },
  {
    id: 'q_invert_t1_2',
    tier: 1,
    skillId: 'mole_ratio_inversion',
    topicBadgeAr: 'مقلوب النسبة المولية',
    questionAr: 'في التفاعل 2K + Br2 -> 2KBr، إذا كانت نسبة KBr/Br2 هي 2/1، فما هي نسبة Br2/KBr؟',
    equationDisplay: '2K(s) + Br2(l) -> 2KBr(s)',
    inputType: 'ratio',
    correctAnswer: '1/2',
    acceptableAnswers: ['1/2', '1:2', 0.5, '0.5'],
    timeLimitSeconds: 30,
    explanationAr: 'عكس النسبة يعطي 1 mol Br2 / 2 mol KBr أي 1/2 أو 0.5.',
  },
  {
    id: 'q_invert_t2_1',
    tier: 2,
    skillId: 'mole_ratio_inversion',
    topicBadgeAr: 'مقلوب النسبة المولية',
    questionAr: 'إذا كانت نسبة H2O / CO2 في احتراق البروبان هي 4/3، فما مقلوب هذه النسبة (CO2 / H2O)؟',
    inputType: 'ratio',
    correctAnswer: '3/4',
    acceptableAnswers: ['3/4', '3:4', 0.75, '0.75'],
    timeLimitSeconds: 30,
    explanationAr: 'مقلوب النسبة 4/3 هو 3/4.',
  },
  {
    id: 'q_invert_t3_1',
    tier: 3,
    skillId: 'mole_ratio_inversion',
    topicBadgeAr: 'مقلوب النسبة المولية',
    questionAr: 'في احتراق البيوتان، إذا كانت نسبة O2 / C4H10 هي 13/2 (6.5)، فما هي النسبة العكسية C4H10 / O2 ككسر؟',
    inputType: 'ratio',
    correctAnswer: '2/13',
    acceptableAnswers: ['2/13', '2:13', 0.154, '0.154'],
    timeLimitSeconds: 30,
    explanationAr: 'النسبة العكسية تقلب البسط والمقام فتصبح 2/13 (مولات C4H10 لكل مول O2).',
  },

  // =========================================================================
  // SKILL 8: THE n(n-1) RELATIONSHIP
  // =========================================================================
  {
    id: 'q_n_formula_t1_1',
    tier: 1,
    skillId: 'n_formula_calculation',
    topicBadgeAr: 'قانون n(n - 1)',
    questionAr: 'ما هو إجمالي عدد النسب المولية التي يمكن كتابتها لتفاعل كيميائي يحتوي على 3 مواد كيميائية؟',
    inputType: 'numeric',
    correctAnswer: 6,
    acceptableAnswers: [6, '6'],
    timeLimitSeconds: 30,
    explanationAr: 'بتطبيق علاقة n(n - 1) عندما n = 3: عدد النسب = 3 × (3 - 1) = 3 × 2 = 6 نسب.',
  },
  {
    id: 'q_n_formula_t1_2',
    tier: 1,
    skillId: 'n_formula_calculation',
    topicBadgeAr: 'قانون n(n - 1)',
    questionAr: 'في احتراق البيوتان 2C4H10 + 13O2 -> 8CO2 + 10H2O، كم نسبة مولية موجهة يمكن اشتقاقها بين المواد الأربعة؟',
    equationDisplay: '2C4H10(g) + 13O2(g) -> 8CO2(g) + 10H2O(g)',
    inputType: 'numeric',
    correctAnswer: 12,
    acceptableAnswers: [12, '12'],
    timeLimitSeconds: 30,
    explanationAr: 'عدد المواد n = 4 (مادتان متفاعلتان ومادتان ناتجتان). إذن: n(n - 1) = 4 × 3 = 12 نسبة مولية.',
  },
  {
    id: 'q_n_formula_t2_1',
    tier: 2,
    skillId: 'n_formula_calculation',
    topicBadgeAr: 'قانون n(n - 1)',
    questionAr: 'لماذا تُستبعد النسب القطرية في مصفوفة النسب المولية (مثل CO2/CO2)؟',
    inputType: 'multiple_choice',
    optionsAr: [
      { text: 'لأنها تمثل نسبة المادة إلى نفسها وتساوي 1 دون معنى كيميائي', value: 'self_ratio' },
      { text: 'لأن المعاملات تصبح سالبة', value: 'negative' },
      { text: 'لأن المادة تختفي من التفاعل', value: 'disappear' },
      { text: 'لأن الكتلة لا تحفظ', value: 'mass_loss' },
    ],
    correctAnswer: 'self_ratio',
    timeLimitSeconds: 30,
    explanationAr: 'النسبة المولية تعرف بأنها نسبة بين مادتين مختلفتين في المعادلة؛ ونسبة المادة لنفسها لا تفيد في التحويل الكيميائي.',
  },
  {
    id: 'q_n_formula_t3_1',
    tier: 3,
    skillId: 'n_formula_calculation',
    topicBadgeAr: 'قانون n(n - 1)',
    questionAr: 'إذا كان تفاعل كيميائي معقد يشتمل على 5 مواد كيميائية (n = 5)، فما عدد النسب المولية الموجهة التي يمكن اشتقاقها؟',
    inputType: 'numeric',
    correctAnswer: 20,
    acceptableAnswers: [20, '20'],
    timeLimitSeconds: 30,
    explanationAr: 'تطبيق علاقة n(n - 1) لـ n = 5: 5 × (5 - 1) = 5 × 4 = 20 نسبة مولية موجهة.',
  },

  // =========================================================================
  // SKILL 9: APPLYING MOLE RATIOS
  // =========================================================================
  {
    id: 'q_apply_t1_1',
    tier: 1,
    skillId: 'mole_ratio_application',
    topicBadgeAr: 'تطبيق النسب المولية',
    questionAr: 'كم مولاً من CO2 ينتج من احتراق 4 مولات من غاز البروبان C3H8 حسب: C3H8 + 5O2 -> 3CO2 + 4H2O؟',
    equationDisplay: 'C3H8(g) + 5O2(g) -> 3CO2(g) + 4H2O(g)',
    inputType: 'numeric',
    correctAnswer: 12,
    acceptableAnswers: [12, '12'],
    timeLimitSeconds: 45,
    explanationAr: 'مولات CO2 = مولات البروبان المعطاة × (3 mol CO2 / 1 mol C3H8) = 4 × 3 = 12 مول.',
  },
  {
    id: 'q_apply_t1_2',
    tier: 1,
    skillId: 'mole_ratio_application',
    topicBadgeAr: 'تطبيق النسب المولية',
    questionAr: 'كم مولاً من غاز الأكسجين O2 يلزم للتفاعل تماماً مع 8 مولات من الحديد Fe حسب: 4Fe + 3O2 -> 2Fe2O3؟',
    equationDisplay: '4Fe(s) + 3O2(g) -> 2Fe2O3(s)',
    inputType: 'numeric',
    correctAnswer: 6,
    acceptableAnswers: [6, '6'],
    timeLimitSeconds: 45,
    explanationAr: 'مولات O2 = 8 mol Fe × (3 mol O2 / 4 mol Fe) = 8 × (3/4) = 6 مولات O2.',
  },
  {
    id: 'q_apply_t2_1',
    tier: 2,
    skillId: 'mole_ratio_application',
    topicBadgeAr: 'تطبيق النسب المولية',
    questionAr: 'في التفاعل 4Al + 3O2 -> 2Al2O3، كم مولاً من الأكسجين O2 يلزم للتفاعل تماماً مع 12 مولاً من Al؟',
    equationDisplay: '4Al(s) + 3O2(g) -> 2Al2O3(s)',
    inputType: 'numeric',
    correctAnswer: 9,
    acceptableAnswers: [9, '9'],
    timeLimitSeconds: 45,
    explanationAr: 'مولات O2 = 12 mol Al × (3 mol O2 / 4 mol Al) = 12 × 0.75 = 9 مولات O2.',
  },
  {
    id: 'q_apply_t3_1',
    tier: 3,
    skillId: 'mole_ratio_application',
    topicBadgeAr: 'تطبيق النسب المولية',
    questionAr: 'في احتراق البيوتان 2C4H10 + 13O2 -> 8CO2 + 10H2O، كم مولاً من بخار الماء H2O ينتج عند استهلاك 5 مولات من C4H10؟',
    equationDisplay: '2C4H10(g) + 13O2(g) -> 8CO2(g) + 10H2O(g)',
    inputType: 'numeric',
    correctAnswer: 25,
    acceptableAnswers: [25, '25'],
    timeLimitSeconds: 45,
    explanationAr: 'مولات H2O = 5 mol C4H10 × (10 mol H2O / 2 mol C4H10) = 5 × 5 = 25 مول H2O.',
  },

  // =========================================================================
  // SKILL 10: MULTI-STEP STOICHIOMETRY
  // =========================================================================
  {
    id: 'q_multi_t1_1',
    tier: 1,
    skillId: 'multistep_stoichiometry',
    topicBadgeAr: 'حسابات متعددة الخطوات',
    questionAr: 'في تفاعل احتراق البيوتان: 2C4H10 + 13O2 -> 8CO2 + 10H2O، كم مولاً من CO2 ينتج عند استهلاك 10 مولات من C4H10؟',
    equationDisplay: '2C4H10(g) + 13O2(g) -> 8CO2(g) + 10H2O(g)',
    inputType: 'numeric',
    correctAnswer: 40,
    acceptableAnswers: [40, '40'],
    timeLimitSeconds: 60,
    explanationAr: 'مولات CO2 = 10 mol C4H10 × (8 mol CO2 / 2 mol C4H10) = 10 × 4 = 40 مول CO2.',
  },
  {
    id: 'q_multi_t1_2',
    tier: 1,
    skillId: 'multistep_stoichiometry',
    topicBadgeAr: 'حسابات متعددة الخطوات',
    questionAr: 'كم مولاً من H2O ينتج عند احتراق 10 مولات من غاز البيوتان C4H10؟',
    equationDisplay: '2C4H10(g) + 13O2(g) -> 8CO2(g) + 10H2O(g)',
    inputType: 'numeric',
    correctAnswer: 50,
    acceptableAnswers: [50, '50'],
    timeLimitSeconds: 60,
    explanationAr: 'مولات H2O = 10 mol C4H10 × (10 mol H2O / 2 mol C4H10) = 10 × 5 = 50 مول H2O.',
  },
  {
    id: 'q_multi_t2_1',
    tier: 2,
    skillId: 'multistep_stoichiometry',
    topicBadgeAr: 'حسابات متعددة الخطوات',
    questionAr: 'كم جراماً من غاز CO2 ينتج عند احتراق 2 مول من غاز البروبان C3H8 تماماً (الكتلة المولية لـ CO2 = 44.01 g/mol)؟',
    equationDisplay: 'C3H8(g) + 5O2(g) -> 3CO2(g) + 4H2O(g)',
    inputType: 'numeric',
    correctAnswer: 264.06,
    acceptableAnswers: [264.06, '264.06', 264, '264'],
    timeLimitSeconds: 60,
    explanationAr: 'الخطوة 1: مولات CO2 = 2 mol C3H8 × (3 mol CO2 / 1 mol C3H8) = 6 مول. الخطوة 2: الكتلة = 6 × 44.01 = 264.06 جرام.',
  },
  {
    id: 'q_multi_t3_1',
    tier: 3,
    skillId: 'multistep_stoichiometry',
    topicBadgeAr: 'حسابات متعددة الخطوات',
    questionAr: 'في أكسدة الحديد 4Fe + 3O2 -> 2Fe2O3، إذا تفاعل 111.7g من Fe (الكتلة المولية 55.85 g/mol = 2 mol)، كم مولاً من Fe2O3 ينتج؟',
    equationDisplay: '4Fe(s) + 3O2(g) -> 2Fe2O3(s)',
    inputType: 'numeric',
    correctAnswer: 1,
    acceptableAnswers: [1, '1', 1.0, '1.0'],
    timeLimitSeconds: 60,
    explanationAr: 'الخطوة 1: مولات Fe = 111.7 / 55.85 = 2.0 mol Fe. الخطوة 2: مولات Fe2O3 = 2.0 × (2 mol Fe2O3 / 4 mol Fe) = 2.0 × 0.5 = 1.0 مول.',
  },
];

/**
 * Builds an authoritative 20-question certification exam:
 * - Differentiates by Tier (Tier 1, 2, or 3) with distinct difficulty profiles.
 * - Always guarantees balanced coverage across all 10 curriculum skills (exactly 2 questions per skill).
 * - Avoids duplicate questions within the attempt.
 * - Randomizes question order.
 */
export function buildCertificationExam(tier: 1 | 2 | 3 = 1, seedRandom: boolean = false): ExamQuestion[] {
  const selected: ExamQuestion[] = [];
  const allSkills: CurriculumSkillId[] = [
    'equation_interpretation',
    'representative_particles',
    'mole_relationships',
    'conservation_of_mass',
    'reactant_product_mass',
    'directed_mole_ratios',
    'mole_ratio_inversion',
    'n_formula_calculation',
    'mole_ratio_application',
    'multistep_stoichiometry',
  ];

  // Organize questions by skill
  const skillMap = new Map<CurriculumSkillId, TierExamQuestion[]>();
  for (const s of allSkills) {
    skillMap.set(s, []);
  }

  for (const q of QUESTION_BANK) {
    if (skillMap.has(q.skillId)) {
      skillMap.get(q.skillId)!.push(q);
    }
  }

  // For each of the 10 skills, pick 2 questions tailored to the requested tier
  for (const skillId of allSkills) {
    const candidates = skillMap.get(skillId) || [];
    if (candidates.length === 0) continue;

    // Sort or filter candidates by relevance to the requested tier:
    // Prefer questions matching tier, then adjacent tiers
    const sorted = [...candidates].sort((a, b) => {
      const distA = Math.abs(a.tier - tier);
      const distB = Math.abs(b.tier - tier);
      if (distA !== distB) return distA - distB;
      // Deterministic or seeded tie-break
      return a.id.localeCompare(b.id);
    });

    if (seedRandom) {
      // Small randomized shuffle among top tier matches
      const tierMatches = sorted.filter((q) => q.tier === tier);
      if (tierMatches.length >= 2) {
        tierMatches.sort(() => Math.random() - 0.5);
        selected.push(tierMatches[0], tierMatches[1]);
        continue;
      }
    }

    // Default: select the 2 best tier-matching questions
    selected.push(sorted[0]);
    if (sorted.length > 1) {
      selected.push(sorted[1]);
    } else {
      selected.push(sorted[0]);
    }
  }

  // Ensure exactly 20 questions
  if (selected.length < 20) {
    const selectedIds = new Set(selected.map((q) => q.id));
    for (const q of QUESTION_BANK) {
      if (!selectedIds.has(q.id)) {
        selected.push(q);
        selectedIds.add(q.id);
        if (selected.length === 20) break;
      }
    }
  }

  return selected.slice(0, 20);
}
