/**
 * LAB GUARDIAN - Stoichiometry Curriculum & Data Definitions
 * Course Topic: الحسابات الكيميائية (Stoichiometric Calculations)
 */

export interface SubstanceInfo {
  formula: string;
  nameAr: string;
  coefficient: number;
  state: 's' | 'l' | 'g' | 'aq';
  molarMass: number; // g/mol
  particleTypeAr: 'ذرة' | 'جزيء' | 'وحدة صيغة';
}

export interface ReactionDefinition {
  id: string;
  nameAr: string;
  equationString: string;
  reactants: SubstanceInfo[];
  products: SubstanceInfo[];
  totalReactantMass: number; // g for balanced equation
  totalProductMass: number; // g for balanced equation
}

export const STOICHIOMETRY_REACTIONS: Record<string, ReactionDefinition> = {
  iron: {
    id: 'iron',
    nameAr: 'تفاعل أكسدة الحديد',
    equationString: '4Fe(s) + 3O2(g) -> 2Fe2O3(s)',
    reactants: [
      { formula: 'Fe', nameAr: 'حديد', coefficient: 4, state: 's', molarMass: 55.85, particleTypeAr: 'ذرة' },
      { formula: 'O2', nameAr: 'أكسجين', coefficient: 3, state: 'g', molarMass: 32.0, particleTypeAr: 'جزيء' },
    ],
    products: [
      { formula: 'Fe2O3', nameAr: 'أكسيد الحديد III', coefficient: 2, state: 's', molarMass: 159.7, particleTypeAr: 'وحدة صيغة' },
    ],
    totalReactantMass: 4 * 55.85 + 3 * 32.0, // 223.4 + 96.0 = 319.4g
    totalProductMass: 2 * 159.7, // 319.4g
  },

  potassiumBromide: {
    id: 'potassiumBromide',
    nameAr: 'تفاعل تكوين بروميد البوتاسيوم',
    equationString: '2K(s) + Br2(l) -> 2KBr(s)',
    reactants: [
      { formula: 'K', nameAr: 'بوتاسيوم', coefficient: 2, state: 's', molarMass: 39.1, particleTypeAr: 'ذرة' },
      { formula: 'Br2', nameAr: 'بروم', coefficient: 1, state: 'l', molarMass: 159.8, particleTypeAr: 'جزيء' },
    ],
    products: [
      { formula: 'KBr', nameAr: 'بروميد البوتاسيوم', coefficient: 2, state: 's', molarMass: 119.0, particleTypeAr: 'وحدة صيغة' },
    ],
    totalReactantMass: 2 * 39.1 + 159.8, // 78.2 + 159.8 = 238.0g
    totalProductMass: 2 * 119.0, // 238.0g
  },

  aluminumOxide: {
    id: 'aluminumOxide',
    nameAr: 'تفاعل تكوين أكسيد الألومنيوم',
    equationString: '4Al(s) + 3O2(g) -> 2Al2O3(s)',
    reactants: [
      { formula: 'Al', nameAr: 'ألومنيوم', coefficient: 4, state: 's', molarMass: 26.98, particleTypeAr: 'ذرة' },
      { formula: 'O2', nameAr: 'أكسجين', coefficient: 3, state: 'g', molarMass: 32.0, particleTypeAr: 'جزيء' },
    ],
    products: [
      { formula: 'Al2O3', nameAr: 'أكسيد الألومنيوم', coefficient: 2, state: 's', molarMass: 101.96, particleTypeAr: 'وحدة صيغة' },
    ],
    totalReactantMass: 4 * 26.98 + 3 * 32.0, // 107.92 + 96.0 = 203.92g
    totalProductMass: 2 * 101.96, // 203.92g
  },

  propaneCombustion: {
    id: 'propaneCombustion',
    nameAr: 'تفاعل احتراق البروبان',
    equationString: 'C3H8(g) + 5O2(g) -> 3CO2(g) + 4H2O(g)',
    reactants: [
      { formula: 'C3H8', nameAr: 'بروبان', coefficient: 1, state: 'g', molarMass: 44.1, particleTypeAr: 'جزيء' },
      { formula: 'O2', nameAr: 'أكسجين', coefficient: 5, state: 'g', molarMass: 32.0, particleTypeAr: 'جزيء' },
    ],
    products: [
      { formula: 'CO2', nameAr: 'ثاني أكسيد الكربون', coefficient: 3, state: 'g', molarMass: 44.01, particleTypeAr: 'جزيء' },
      { formula: 'H2O', nameAr: 'بخار الماء', coefficient: 4, state: 'g', molarMass: 18.02, particleTypeAr: 'جزيء' },
    ],
    totalReactantMass: 44.1 + 5 * 32.0, // 44.1 + 160.0 = 204.1g
    totalProductMass: 3 * 44.01 + 4 * 18.02, // 132.03 + 72.08 = 204.11g
  },

  butaneCombustion: {
    id: 'butaneCombustion',
    nameAr: 'تفاعل احتراق البيوتان (المفاعل الأخير)',
    equationString: '2C4H10(g) + 13O2(g) -> 8CO2(g) + 10H2O(g)',
    reactants: [
      { formula: 'C4H10', nameAr: 'بيوتان', coefficient: 2, state: 'g', molarMass: 58.12, particleTypeAr: 'جزيء' },
      { formula: 'O2', nameAr: 'أكسجين', coefficient: 13, state: 'g', molarMass: 32.0, particleTypeAr: 'جزيء' },
    ],
    products: [
      { formula: 'CO2', nameAr: 'ثاني أكسيد الكربون', coefficient: 8, state: 'g', molarMass: 44.01, particleTypeAr: 'جزيء' },
      { formula: 'H2O', nameAr: 'بخار الماء', coefficient: 10, state: 'g', molarMass: 18.02, particleTypeAr: 'جزيء' },
    ],
    totalReactantMass: 2 * 58.12 + 13 * 32.0, // 116.24 + 416.0 = 532.24g
    totalProductMass: 8 * 44.01 + 10 * 18.02, // 352.08 + 180.2 = 532.28g
  },
};

/**
 * Calculates number of directed mole ratios for n substances using n(n - 1)
 */
export function calculateDirectedMoleRatiosCount(substanceCount: number): number {
  if (substanceCount < 2) return 0;
  return substanceCount * (substanceCount - 1);
}

/**
 * Parses user input as a number or fraction (e.g. "4/3", "4:3", "1.33")
 */
export function parseRatioOrNumber(raw: string): number | null {
  if (!raw) return null;
  const cleaned = raw.trim().replace(/،/g, '.').replace(/\s+/g, '');

  // Fraction form: a/b or a:b
  if (cleaned.includes('/') || cleaned.includes(':')) {
    const separator = cleaned.includes('/') ? '/' : ':';
    const parts = cleaned.split(separator);
    if (parts.length === 2) {
      const num = parseFloat(parts[0]);
      const den = parseFloat(parts[1]);
      if (!isNaN(num) && !isNaN(den) && den !== 0) {
        return num / den;
      }
    }
  }

  const val = parseFloat(cleaned);
  return isNaN(val) ? null : val;
}

/**
 * Checks if submitted value matches target within acceptable rounding tolerance
 */
export function isNumberClose(
  actual: number,
  expected: number,
  relativeTolerance: number = 0.025,
  absoluteTolerance: number = 0.5
): boolean {
  const diff = Math.abs(actual - expected);
  if (diff <= absoluteTolerance) return true;
  if (expected !== 0 && diff / Math.abs(expected) <= relativeTolerance) return true;
  return false;
}
