/**
 * LAB GUARDIAN - Authoritative Campaign Progression Validator
 * Enforces strict sequential progression across all entry points:
 * Central Laboratory -> Research Wing -> Mass Refinery -> Mole Ratio Vault -> Final Boss
 * A later stage requires:
 * 1. Completing the previous stage's story mission(s).
 * 2. Passing the required 20-question certification assessment in the Stoichiometry Academy.
 */

import { LocationId } from './CampaignTypes';

export type StageLockReason =
  | 'none'
  | 'need_prev_mission'
  | 'need_exam'
  | 'need_boss';

export interface StageStatusResult {
  locationId: LocationId;
  isUnlocked: boolean;
  isCompleted: boolean;
  statusLabelAr: string;
  badgeAr?: string;
  lockReason: StageLockReason;
  lockExplanationAr: string;
  requiredMissions: number[];
  requiredExamId?: string;
}

export class ProgressionValidator {
  /**
   * Evaluates authoritative unlock status for any location
   */
  public static evaluateLocationStatus(
    locationId: LocationId,
    completedMissions: Set<number>,
    passedExams: Set<string>,
    completedLocations: Set<LocationId>,
    bossDefeated: boolean
  ): StageStatusResult {
    // 1. Hub: Always open
    if (locationId === 'hub') {
      const isCompleted = completedLocations.has('hub');
      return {
        locationId: 'hub',
        isUnlocked: true,
        isCompleted,
        statusLabelAr: isCompleted ? 'مكتملة' : 'مفتوحة (المقر الرئيسي)',
        lockReason: 'none',
        lockExplanationAr: 'المقر الرئيسي متاح دائماً للتزود بالطاقة وإدارة العمليات.',
        requiredMissions: [],
      };
    }

    // 2. Stoichiometry Academy: Connected learning facility, accessible from Hub
    if (locationId === 'academy') {
      const isCompleted = passedExams.has('exam_tier_1') && passedExams.has('exam_tier_2') && passedExams.has('exam_tier_3');
      return {
        locationId: 'academy',
        isUnlocked: true,
        isCompleted,
        statusLabelAr: isCompleted ? 'معتمد بالكامل' : 'مفتوحة (أكاديمية التعلم والشهادات)',
        badgeAr: 'الأكاديمية العلمية',
        lockReason: 'none',
        lockExplanationAr: 'أكاديمية الحسابات الكيميائية متاحة للتدريب واجتياز اختبارات التأهيل.',
        requiredMissions: [],
      };
    }

    // 3. Sector 01: Equation Research Wing
    if (locationId === 'research_wing') {
      const isCompleted = completedMissions.has(1) && completedLocations.has('research_wing');
      return {
        locationId: 'research_wing',
        isUnlocked: true, // First combat stage of the campaign
        isCompleted,
        statusLabelAr: isCompleted ? 'مكتملة' : 'مفتوحة',
        badgeAr: 'شهادة أكسدة الحديد 4Fe + 3O2',
        lockReason: 'none',
        lockExplanationAr: 'مفتوح للبدء في الحملة وتفسير معادلات تفاعل أكسدة الحديد.',
        requiredMissions: [1],
      };
    }

    // 4. Sector 02: Mass Industrial Refinery
    // Requires: Mission 1 complete AND Tier 1 Exam Passed!
    if (locationId === 'refinery') {
      const mission1Done = completedMissions.has(1);
      const exam1Done = passedExams.has('exam_tier_1');
      const isCompleted = completedMissions.has(2) && completedMissions.has(3) && completedLocations.has('refinery');

      if (!mission1Done) {
        return {
          locationId: 'refinery',
          isUnlocked: false,
          isCompleted: false,
          statusLabelAr: 'تحتاج إنهاء المهمة السابقة',
          badgeAr: 'شهادة حفظ الكتلة والنسب المولية',
          lockReason: 'need_prev_mission',
          lockExplanationAr: 'يتطلب إكمال مهمة جناح أبحاث المعادلات (المهمة 1) أولاً.',
          requiredMissions: [2, 3],
          requiredExamId: 'exam_tier_1',
        };
      }

      if (!exam1Done) {
        return {
          locationId: 'refinery',
          isUnlocked: false,
          isCompleted: false,
          statusLabelAr: 'تحتاج اجتياز اختبار التأهيل',
          badgeAr: 'شهادة حفظ الكتلة والنسب المولية',
          lockReason: 'need_exam',
          lockExplanationAr: 'يتطلب اجتياز اختبار التأهيل الأول (20 سؤالاً) في أكاديمية الحسابات الكيميائية.',
          requiredMissions: [2, 3],
          requiredExamId: 'exam_tier_1',
        };
      }

      return {
        locationId: 'refinery',
        isUnlocked: true,
        isCompleted,
        statusLabelAr: isCompleted ? 'مكتملة' : 'مفتوحة للعمليات',
        badgeAr: 'شهادة حفظ الكتلة والنسب المولية',
        lockReason: 'none',
        lockExplanationAr: 'تم استيفاء المتطلبات: إنجاز المهمة 1 واجتياز اختبار التأهيل الأول.',
        requiredMissions: [2, 3],
        requiredExamId: 'exam_tier_1',
      };
    }

    // 5. Sector 03: Mole Ratio Vault
    // Requires: Missions 2 & 3 complete AND Tier 2 Exam Passed!
    if (locationId === 'vault') {
      const missions2and3Done = completedMissions.has(2) && completedMissions.has(3);
      const exam2Done = passedExams.has('exam_tier_2');
      const isCompleted = completedMissions.has(4) && completedMissions.has(5) && bossDefeated && completedLocations.has('vault');

      if (!missions2and3Done) {
        return {
          locationId: 'vault',
          isUnlocked: false,
          isCompleted: false,
          statusLabelAr: 'تحتاج إنهاء المهمة السابقة',
          badgeAr: 'شهادة مصفوفة n(n-1) والمفاعل الأخير',
          lockReason: 'need_prev_mission',
          lockExplanationAr: 'يتطلب إكمال مهمات مصفاة الكتلة الصناعية (المهمتان 2 و3) أولاً.',
          requiredMissions: [4, 5],
          requiredExamId: 'exam_tier_2',
        };
      }

      if (!exam2Done) {
        return {
          locationId: 'vault',
          isUnlocked: false,
          isCompleted: false,
          statusLabelAr: 'تحتاج اجتياز اختبار التأهيل',
          badgeAr: 'شهادة مصفوفة n(n-1) والمفاعل الأخير',
          lockReason: 'need_exam',
          lockExplanationAr: 'يتطلب اجتياز اختبار التأهيل الثاني (20 سؤالاً) في الأكاديمية قبل دخول القبو.',
          requiredMissions: [4, 5],
          requiredExamId: 'exam_tier_2',
        };
      }

      return {
        locationId: 'vault',
        isUnlocked: true,
        isCompleted,
        statusLabelAr: isCompleted ? 'مكتملة (تم تحييد الزعيم)' : 'مفتوحة للعمليات',
        badgeAr: 'شهادة مصفوفة n(n-1) والمفاعل الأخير',
        lockReason: 'none',
        lockExplanationAr: 'تم استيفاء المتطلبات: إنجاز مهمات المصفاة واجتياز اختبار التأهيل الثاني.',
        requiredMissions: [4, 5],
        requiredExamId: 'exam_tier_2',
      };
    }

    return {
      locationId,
      isUnlocked: false,
      isCompleted: false,
      statusLabelAr: 'مغلقة',
      lockReason: 'none',
      lockExplanationAr: 'المنطقة غير معرفة.',
      requiredMissions: [],
    };
  }

  /**
   * Strict validation check before any map transition.
   * Throws an error or returns false if unauthorized.
   */
  public static canTransitionTo(
    targetLocationId: LocationId,
    completedMissions: Set<number>,
    passedExams: Set<string>,
    completedLocations: Set<LocationId>,
    bossDefeated: boolean
  ): { allowed: boolean; reasonAr: string } {
    const status = this.evaluateLocationStatus(
      targetLocationId,
      completedMissions,
      passedExams,
      completedLocations,
      bossDefeated
    );

    if (status.isUnlocked) {
      return { allowed: true, reasonAr: status.lockExplanationAr };
    }

    return { allowed: false, reasonAr: `${status.statusLabelAr}: ${status.lockExplanationAr}` };
  }

  /**
   * Safely migrates legacy save data, enforcing that no stage is unlocked
   * unless its verified prerequisites (missions + exams) are actually recorded.
   */
  public static sanitizeAndMigrateSave(
    rawUnlocked: LocationId[],
    completedMissions: number[],
    passedExams: string[]
  ): { sanitizedUnlocked: LocationId[]; sanitizedExams: string[] } {
    const missionSet = new Set(completedMissions);
    const examSet = new Set(passedExams);

    const validUnlocked: LocationId[] = ['hub', 'academy', 'research_wing'];

    // Refinery is only valid if mission 1 + exam 1 are done
    if (missionSet.has(1) && examSet.has('exam_tier_1')) {
      validUnlocked.push('refinery');
    }

    // Vault is only valid if missions 2 & 3 + exam 2 are done
    if (missionSet.has(2) && missionSet.has(3) && examSet.has('exam_tier_2')) {
      validUnlocked.push('vault');
    }

    return {
      sanitizedUnlocked: validUnlocked,
      sanitizedExams: Array.from(examSet),
    };
  }
}
