/**
 * LAB GUARDIAN - 3D Science Demonstrations
 * Defines complete data and structural configurations for the 5 interactive Babylon.js educational demonstrations:
 * 1. Iron Oxidation (4Fe + 3O2 -> 2Fe2O3) - Atom conservation before & after
 * 2. Oxygen Molecule (O2) - Diatomic bonding & coefficient interpretation
 * 3. Propane Combustion (C3H8 + 5O2 -> 3CO2 + 4H2O) - Ball-and-stick models & mass conservation
 * 4. Potassium Bromide (2K + Br2 -> 2KBr) - Ionic lattice visualization & 6 directed mole ratios
 * 5. Butane Combustion (2C4H10 + 13O2 -> 8CO2 + 10H2O) - n(n-1)=12 matrix table without diagonals
 */

import { ScienceDemonstration, Atom3DDefinition } from './AcademyTypes';

export const ATOM_DEFINITIONS: Record<string, Atom3DDefinition> = {
  Fe: { element: 'Fe', symbol: 'Fe', nameAr: 'حديد', colorHex: '#94a3b8', radius: 0.38 },
  O: { element: 'O', symbol: 'O', nameAr: 'أكسجين', colorHex: '#ef4444', radius: 0.3 },
  C: { element: 'C', symbol: 'C', nameAr: 'كربون', colorHex: '#334155', radius: 0.34 },
  H: { element: 'H', symbol: 'H', nameAr: 'هيدروجين', colorHex: '#f8fafc', radius: 0.22 },
  K: { element: 'K', symbol: 'K', nameAr: 'بوتاسيوم', colorHex: '#a855f7', radius: 0.42 },
  Br: { element: 'Br', symbol: 'Br', nameAr: 'بروم', colorHex: '#ea580c', radius: 0.38 },
  Al: { element: 'Al', symbol: 'Al', nameAr: 'ألومنيوم', colorHex: '#38bdf8', radius: 0.36 },
};

export const SCIENCE_DEMONSTRATIONS: ScienceDemonstration[] = [
  // DEMONSTRATION 1 — IRON OXIDATION
  {
    id: 'demo_iron_oxidation',
    titleAr: 'العرض 01: أكسدة الحديد وحفظ الذرات',
    subtitleAr: 'تفسير المعادلة الموزونة على المستوى الذري',
    reactionFormula: '4Fe(s) + 3O2(g) -> 2Fe2O3(s)',
    demonstrationType: 'atom_conservation',
    descriptionAr:
      'توضيح بصري ثلاثي الأبعاد يُظهر تفاعل 4 ذرات حديد منفصلة مع 3 جزيئات أكسجين ثنائية الذرة لتشكيل وحدتي صيغة من مركب أكسيد الحديد III الأيوني.',
    learningTakeawayAr:
      'الذرات لا تفنى ولا تستحدث أثناء التفاعل الكيميائي؛ عدد ذرات كل عنصر في المواد المتفاعلة (4Fe و 6O) يساوي تماماً عددها في المواد الناتجة.',
    substancesAr: ['4Fe (حديد صلب)', '3O2 (غاز أكسجين)', '2Fe2O3 (أكسيد الحديد III)'],
    atomConservation: {
      beforeCounts: { Fe: 4, O: 6 },
      afterCounts: { Fe: 4, O: 6 },
    },
    detailsAr: [
      'قبل التفاعل: 4 ذرات حديد Fe منفردة + 3 جزيئات O2 (كل جزيء يحوي ذرتي أكسجين = 6 ذرات O).',
      'بعد التفاعل: وحدتا صيغة من Fe2O3 (كل وحدة تحتوي على ذرتي Fe و 3 ذرات O = 4 ذرات Fe و 6 ذرات O).',
      'المعاملات تدل على نسبة المولات: 4 مول Fe تتفاعل مع 3 مول O2 لإنتاج 2 مول Fe2O3.',
    ],
  },

  // DEMONSTRATION 2 — OXYGEN MOLECULE
  {
    id: 'demo_oxygen_molecule',
    titleAr: 'العرض 02: جزيء الأكسجين وثنائية الذرة',
    subtitleAr: 'الجسيم الممثل للعناصر اللافلزية الغازية',
    reactionFormula: 'O2(g)',
    demonstrationType: 'molecule_inspection',
    descriptionAr:
      'نموذج مجسم لجزيء الأكسجين ثنائي الذرة (O=O). يُمكن للطالب تدوير الجزيء ومعاينة الرابطة التساهمية الثنائية وفهم لماذا يُمثل الجزيء جسيماً مستقلاً.',
    learningTakeawayAr:
      'الأكسجين يوجد في الحالة الطبيعية كجزيء ثنائي الذرة O2. المعامل (3) في معادلة مثل 3O2 يعني 3 جزيئات أو 3 مولات من O2 (أي 6 ذرات أكسجين).',
    substancesAr: ['O2 (جزيء أكسجين ثنائي الذرة)'],
    atomConservation: {
      beforeCounts: { O: 2 },
      afterCounts: { O: 2 },
    },
    detailsAr: [
      'الجسيم الممثل للأكسجين هو "الجزيء" (Molecule) وليس الذرة المنفردة.',
      'الرابطة بين ذرتي الأكسجين تساهمية ثنائية تشارك فيها كل ذرة بزوجين من الإلكترونات.',
      'المول الواحد من O2 يحتوي على عدد أفوجادرو (6.02 × 10²³) من جزيئات O2.',
    ],
  },

  // DEMONSTRATION 3 — PROPANE COMBUSTION
  {
    id: 'demo_propane_combustion',
    titleAr: 'العرض 03: احتراق البروبان وميزان حفظ الكتلة',
    subtitleAr: 'التحقق الكمي من قانون حفظ الكتلة عبر الكتل المولية',
    reactionFormula: 'C3H8(g) + 5O2(g) -> 3CO2(g) + 4H2O(g)',
    demonstrationType: 'mass_balance',
    descriptionAr:
      'نموذج كروي وعصوي (Ball-and-Stick) لغاز البروبان والأكسجين ونواتج الاحتراق التام، مع ميزان رقمي يعرض الكتل بالجرام للمتفاعلات والنواتج.',
    learningTakeawayAr:
      'كتلة المتفاعلات الكلية (204.1g) تساوي تماماً كتلة النواتج الكلية (204.11g) تطبيقاً لقانون حفظ الكتلة.',
    substancesAr: [
      'C3H8 (بروبان: 44.1 g/mol)',
      '5O2 (أكسجين: 5 × 32.0 = 160.0 g)',
      '3CO2 (ثاني أكسيد الكربون: 3 × 44.01 = 132.03 g)',
      '4H2O (بخار الماء: 4 × 18.02 = 72.08 g)',
    ],
    atomConservation: {
      beforeCounts: { C: 3, H: 8, O: 10 },
      afterCounts: { C: 3, H: 8, O: 10 },
    },
    detailsAr: [
      'كتلة المتفاعلات = 1 mol C3H8 (44.1g) + 5 mol O2 (160.0g) = 204.10g.',
      'كتلة النواتج = 3 mol CO2 (132.03g) + 4 mol H2O (72.08g) = 204.11g.',
      'تتطابق الذرات تماماً: 3 ذرات كربون، 8 ذرات هيدروجين، و 10 ذرات أكسجين في كلا الطرفين.',
    ],
  },

  // DEMONSTRATION 4 — POTASSIUM BROMIDE
  {
    id: 'demo_potassium_bromide',
    titleAr: 'العرض 04: بروميد البوتاسيوم والشبكة البلورية الأيونية',
    subtitleAr: 'التمييز بين الجزيء ووحدة الصيغة واشتقاق 6 نسب مولية',
    reactionFormula: '2K(s) + Br2(l) -> 2KBr(s)',
    demonstrationType: 'ionic_lattice',
    descriptionAr:
      'عرض تفاعلي لبلورة بروميد البوتاسيوم الأيونية ثلاثية الأبعاد، موضحاً التناوب بين أيونات البوتاسيوم K+ والبروميد Br- في شبكة متراصة، واشتقاق النسب المولية الستة.',
    learningTakeawayAr:
      'مركب KBr مركب أيوني صلب لا يتكون من جزيئات منفصلة بل من شبكة بلورية ممتدة، والجسيم الممثل له هو "وحدة الصيغة" بنسبة 1:1. التفاعل يضم 3 مواد مما يعطي 3(3-1) = 6 نسب مولية.',
    substancesAr: ['2K (ذرات بوتاسيوم)', 'Br2 (جزيء بروم سائل)', '2KBr (وحدات صيغة أيونية)'],
    atomConservation: {
      beforeCounts: { K: 2, Br: 2 },
      afterCounts: { K: 2, Br: 2 },
    },
    detailsAr: [
      'النسبة المولية K / Br2 = 2 mol K / 1 mol Br2 (وعكسها 1 mol Br2 / 2 mol K).',
      'النسبة المولية K / KBr = 2 mol K / 2 mol KBr = 1 (وعكسها 2 mol KBr / 2 mol K).',
      'النسبة المولية Br2 / KBr = 1 mol Br2 / 2 mol KBr (وعكسها 2 mol KBr / 1 mol Br2).',
      'إجمالي النسب المولية الممكنة = 3 مواد × (3 - 1) = 6 نسب مولية موجهة.',
    ],
  },

  // DEMONSTRATION 5 — BUTANE COMBUSTION
  {
    id: 'demo_butane_matrix',
    titleAr: 'العرض 05: احتراق البيوتان ومصفوفة النسب المولية n(n-1)',
    subtitleAr: 'المصفوفة الكاملة ذات 12 نسبة مولية موجهة واستثناء القطر',
    reactionFormula: '2C4H10(g) + 13O2(g) -> 8CO2(g) + 10H2O(g)',
    demonstrationType: 'ratio_matrix',
    descriptionAr:
      'عرض تحليلي لتفاعل احتراق غاز البيوتان الكامل المشتمل على 4 مواد كيميائية، مع جدول مصفوفي تفاعلي 4×4 يوضح الـ 12 نسبة مولية الموجهة بعد استبعاد النسب الذاتية القطرية.',
    learningTakeawayAr:
      'عند وجود n = 4 مواد، يكون عدد النسب المولية الممكنة: n(n - 1) = 4(4 - 1) = 12 نسبة موجهة. القطر الرئيسي (نسبة المادة إلى نفسها) يُستبعد دائماً لأنه غير ذي دلالة كيميائية.',
    substancesAr: [
      'C4H10 (بيوتان)',
      'O2 (أكسجين)',
      'CO2 (ثاني أكسيد الكربون)',
      'H2O (بخار الماء)',
    ],
    atomConservation: {
      beforeCounts: { C: 8, H: 20, O: 26 },
      afterCounts: { C: 8, H: 20, O: 26 },
    },
    matrixSize: 4,
    matrixData: [
      // Row 1: C4H10
      { row: 'C4H10', col: 'O2', ratio: '2 / 13' },
      { row: 'C4H10', col: 'CO2', ratio: '2 / 8' },
      { row: 'C4H10', col: 'H2O', ratio: '2 / 10' },
      // Row 2: O2
      { row: 'O2', col: 'C4H10', ratio: '13 / 2' },
      { row: 'O2', col: 'CO2', ratio: '13 / 8' },
      { row: 'O2', col: 'H2O', ratio: '13 / 10' },
      // Row 3: CO2
      { row: 'CO2', col: 'C4H10', ratio: '8 / 2' },
      { row: 'CO2', col: 'O2', ratio: '8 / 13' },
      { row: 'CO2', col: 'H2O', ratio: '8 / 10' },
      // Row 4: H2O
      { row: 'H2O', col: 'C4H10', ratio: '10 / 2' },
      { row: 'H2O', col: 'O2', ratio: '10 / 13' },
      { row: 'H2O', col: 'CO2', ratio: '10 / 8' },
    ],
    detailsAr: [
      'عدد المواد n = 4، وعدد النسب = 4 × 3 = 12 نسبة.',
      'كل مادة تشكل 3 نسب موجهة مع المواد الثلاث الأخرى (3 × 4 = 12).',
      'النسب القطرية مثل C4H10/C4H10 مستبعدة لأنها نسبة المادة لنفسها.',
    ],
  },
];
