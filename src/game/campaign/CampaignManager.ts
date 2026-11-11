/**
 * LAB GUARDIAN - Campaign Manager
 * Authoritative campaign progression orchestrator:
 * Manages 5 campaign locations: Hub, Stoichiometry Academy, Research Wing, Mass Refinery, Mole Ratio Vault.
 * Enforces strict sequential progression:
 * - Hub & Academy: Open by default.
 * - Research Wing: Open for initial campaign missions.
 * - Mass Refinery: Requires Mission 1 AND Tier 1 Exam Passed!
 * - Mole Ratio Vault: Requires Missions 2 & 3 AND Tier 2 Exam Passed!
 * - Final Boss: Requires Missions 4 & 5 AND Tier 3 Exam Passed!
 * Handles LocalStorage persistence with versioned schema and safe migration.
 */

import { LocationId, LocationDefinition, CampaignSaveData } from './CampaignTypes';
import { ProgressionValidator } from './ProgressionValidator';

const CAMPAIGN_STORAGE_KEY = 'lab_guardian_campaign_save_v2';
const LEGACY_STORAGE_KEY = 'lab_guardian_campaign_save_v1';
const CURRENT_VERSION = 2;

export class CampaignManager {
  private locations: Map<LocationId, LocationDefinition> = new Map();
  private currentLocationId: LocationId = 'hub';
  private completedLocations: Set<LocationId> = new Set();
  private completedMissions: Set<number> = new Set();
  private passedExams: Set<string> = new Set();
  private collectedPickupIds: Set<string> = new Set();
  private isCampaignCompleted: boolean = false;
  private bossDefeatedFlag: boolean = false;
  private playTimeSeconds: number = 0;

  // Listeners
  public onLocationChange?: (location: LocationDefinition) => void;
  public onUnlock?: (locationId: LocationId) => void;
  public onCampaignComplete?: () => void;

  constructor() {
    this.initLocationDefinitions();
    this.loadFromStorage();
  }

  private initLocationDefinitions(): void {
    // 1. HUB: Central Laboratory (Operations base)
    this.locations.set('hub', {
      id: 'hub',
      nameAr: 'المختبر المركزي: نقطة الصفر',
      nameEn: 'Central Laboratory: Reactor Zero',
      codenameAr: 'المقر الرئيسي (HUB)',
      subtitleAr: 'قاعدة العمليات ومفاعل الطاقة المركزي',
      descriptionAr:
        'القلب العملياتي لمنشأة الأبحاث. يحتوي على مفاعل الصفر، محطة الإحاطة بالأهداف، منصات التجهيز، وبوابات العبور إلى قطاعات المنشأة وأكاديمية الحسابات الكيميائية.',
      educationalFocusAr: 'التدريب التكتيكي، إدارة المهام، ومراجعة سجلات الحسابات الكيميائية.',
      chemicalTopicAr: 'نظام إدارة الاستقرار الكيميائي الشامل للمنشأة',
      unlockRequirementAr: 'مفتوح افتراضياً (المقر الرئيسي)',
      isUnlocked: true,
      isCompleted: false,
      statusLabelAr: 'مفتوحة (المقر الرئيسي)',
      spawnPosition: { x: 0, y: 0.1, z: -14 },
      spawnRotationY: 0,
      boundaryRadius: 28,
      targetMissions: [],
      themeColor: '#00e5ff',
      accentColor: '#00b0ff',
      hazardLevelAr: 'آمن نسبياً (تحت السيطرة الدفاعية)',
    });

    // 2. STOICHIOMETRY ACADEMY: Connected Learning Facility
    this.locations.set('academy', {
      id: 'academy',
      nameAr: 'أكاديمية الحسابات الكيميائية',
      nameEn: 'Stoichiometry Academy',
      codenameAr: 'المنشأة التعليمية المركزية',
      subtitleAr: 'معرض النماذج الجزيئية ثلاثية الأبعاد وقاعة اختبارات التأهيل',
      descriptionAr:
        'منشأة علمية متطورة تضم 5 عروض كيميائية مجسمة (أكسدة الحديد، O2، البروبان، بلورة KBr، مصفوفة البيوتان)، غرف التدريب والمحاكاة، وقاعة اختبارات التأهيل الرسمية المكونة من 20 سؤالاً.',
      educationalFocusAr: 'إتقان المهارات العشر للحسابات الكيميائية، معاينة حفظ الذرات والكتل، واجتياز اختبارات الاعتماد (80%).',
      chemicalTopicAr: 'المنهج الشامل للحسابات الكيميائية والنسب المولية الموجهة',
      unlockRequirementAr: 'مفتوحة افتراضياً ومتصلة بالمقر الرئيسي',
      isUnlocked: true,
      isCompleted: false,
      statusLabelAr: 'مفتوحة (أكاديمية التعلم والشهادات)',
      spawnPosition: { x: 0, y: 0.1, z: -8 },
      spawnRotationY: 0,
      boundaryRadius: 26,
      targetMissions: [],
      themeColor: '#38bdf8',
      accentColor: '#a855f7',
      hazardLevelAr: 'منطقة علمية آمنة ومحمية بالكامل',
    });

    // 3. SECTOR 01: Equation Research Wing
    this.locations.set('research_wing', {
      id: 'research_wing',
      nameAr: 'جناح أبحاث المعادلات الكيميائية',
      nameEn: 'Equation Research Wing',
      codenameAr: 'القطاع 01: المختبرات التحليلية',
      subtitleAr: 'مجمع الأبحاث المجهرية وغرف التفاعل الزجاجية',
      descriptionAr:
        'مجمع متطور يضم غرف التفاعل الكيميائي المحكم، وحاويات الأكسجين النشط، وشاشات العرض الجزيئية ثلاثية الأبعاد، تحرسه طائرات استطلاع آلية سريعة.',
      educationalFocusAr: 'تفسير المعادلات الكيميائية الموزونة بالمولات والجسيمات (أكسدة الحديد 4Fe + 3O2 -> 2Fe2O3 وأكسيد الألومنيوم).',
      chemicalTopicAr: 'المعاملات ودلالاتها على أعداد الجسيمات ونسب المولات',
      unlockRequirementAr: 'مفتوح للبدء في الحملة',
      isUnlocked: true,
      isCompleted: false,
      statusLabelAr: 'مفتوحة للعمليات',
      spawnPosition: { x: 0, y: 0.1, z: -14 },
      spawnRotationY: 0,
      boundaryRadius: 30,
      targetMissions: [1],
      themeColor: '#00f5d4',
      accentColor: '#00bbf9',
      hazardLevelAr: 'متوسط (دوريات روبوتية نشطة)',
    });

    // 4. SECTOR 02: Mass Industrial Refinery
    this.locations.set('refinery', {
      id: 'refinery',
      nameAr: 'مصفاة الكتلة الصناعية',
      nameEn: 'Mass Industrial Refinery',
      codenameAr: 'القطاع 02: مجمع المعايرة الثقيلة',
      subtitleAr: 'أبراج التقطير الكيميائي وموازين حفظ الكتلة',
      descriptionAr:
        'منشأة صناعية ضخمة تضم ممرات معدنية معلقة، أنابيب ضغط الهيدروكربونات، وموازين ميكانيكية عملاقة للتحقق من حفظ الكتلة، تحرسها وحدات حراسة مصفحة وروبوت النخبة.',
      educationalFocusAr: 'التحقق من قانون حفظ الكتلة عبر الكتل المولية (احتراق البروبان C3H8 + 5O2 -> 3CO2 + 4H2O) واشتقاق النسب المولية (2K + Br2 -> 2KBr).',
      chemicalTopicAr: 'قانون حفظ الكتلة واشتقاق النسب المولية المتبادلة',
      unlockRequirementAr: 'يتطلب إكمال جناح الأبحاث (المهمة 1) واجتياز اختبار التأهيل الأول (20 سؤالاً)',
      isUnlocked: false,
      isCompleted: false,
      statusLabelAr: 'تحتاج إنهاء المهمة السابقة',
      spawnPosition: { x: -14, y: 0.1, z: -11 },
      spawnRotationY: Math.PI / 4,
      boundaryRadius: 32,
      targetMissions: [2, 3],
      themeColor: '#ffb703',
      accentColor: '#fb8500',
      hazardLevelAr: 'مرتفع (وحدات حراسة مصفحة + روبوت النخبة)',
    });

    // 5. SECTOR 03: Mole Ratio Vault
    this.locations.set('vault', {
      id: 'vault',
      nameAr: 'قبو النسب المولية والمفاعل الأخير',
      nameEn: 'Mole Ratio Vault: Sub-Reactor',
      codenameAr: 'القطاع 03: قلب المفاعل السفلي',
      subtitleAr: 'غرفة المفاعل الهائجة وحصن حارس المنشأة الأخير',
      descriptionAr:
        'قبو سحيق تحت الأرض محاط بحواجز طاقة كهرومغناطيسية وحلقات احتواء دوارة عملاقة. يضم مصفوفة حسابات n(n-1) وميدان المعركة النهائية مع حارس المختبر الآلي المتوحش.',
      educationalFocusAr: 'حساب عدد النسب المولية بعلاقة n(n - 1) وحسابات احتراق البيوتان الشاملة لاختراق درع الزعيم.',
      chemicalTopicAr: 'علاقة n(n - 1) وحسابات الاحتراق المتكافئة للبيوتان',
      unlockRequirementAr: 'يتطلب إكمال مصفاة الكتلة (المهمتان 2 و3) واجتياز اختبار التأهيل الثاني (20 سؤالاً)',
      isUnlocked: false,
      isCompleted: false,
      statusLabelAr: 'تحتاج إنهاء المهمة السابقة',
      spawnPosition: { x: 0, y: 0.1, z: -13 },
      spawnRotationY: 0,
      boundaryRadius: 32,
      targetMissions: [4, 5],
      themeColor: '#9d4edd',
      accentColor: '#ff007f',
      hazardLevelAr: 'أقصى درجات الخطر (معركة الزعيم وحلقات المفاعل)',
    });

    this.refreshProgressionStatus();
  }

  /**
   * Refreshes progression status across all locations based on completed missions and exams
   */
  public refreshProgressionStatus(): void {
    const locIds: LocationId[] = ['hub', 'academy', 'research_wing', 'refinery', 'vault'];

    for (const id of locIds) {
      const loc = this.locations.get(id);
      if (!loc) continue;

      const evalRes = ProgressionValidator.evaluateLocationStatus(
        id,
        this.completedMissions,
        this.passedExams,
        this.completedLocations,
        this.bossDefeatedFlag
      );

      loc.isUnlocked = evalRes.isUnlocked;
      loc.isCompleted = evalRes.isCompleted;
      loc.statusLabelAr = evalRes.statusLabelAr;
      loc.lockReasonAr = evalRes.lockExplanationAr;
      loc.badgeAwardedAr = evalRes.badgeAr;
    }
  }

  public getAllLocations(): LocationDefinition[] {
    this.refreshProgressionStatus();
    return Array.from(this.locations.values());
  }

  public getLocation(id: LocationId): LocationDefinition | undefined {
    this.refreshProgressionStatus();
    return this.locations.get(id);
  }

  public getCurrentLocation(): LocationDefinition {
    this.refreshProgressionStatus();
    return this.locations.get(this.currentLocationId) || this.locations.get('hub')!;
  }

  public getCurrentLocationId(): LocationId {
    return this.currentLocationId;
  }

  public isLocationUnlocked(id: LocationId): boolean {
    const check = ProgressionValidator.canTransitionTo(
      id,
      this.completedMissions,
      this.passedExams,
      this.completedLocations,
      this.bossDefeatedFlag
    );
    return check.allowed;
  }

  public isLocationCompleted(id: LocationId): boolean {
    return this.completedLocations.has(id);
  }

  public getCompletedLocationsCount(): number {
    return this.completedLocations.size;
  }

  public getCompletedMissions(): number[] {
    return Array.from(this.completedMissions);
  }

  public isMissionCompleted(missionNum: number): boolean {
    return this.completedMissions.has(missionNum);
  }

  public getPassedExams(): string[] {
    return Array.from(this.passedExams);
  }

  public isExamPassed(examId: string): boolean {
    return this.passedExams.has(examId);
  }

  public isBossDefeated(): boolean {
    return this.bossDefeatedFlag;
  }

  public setBossDefeated(defeated: boolean): void {
    this.bossDefeatedFlag = defeated;
    if (defeated) {
      this.completedLocations.add('vault');
      if (this.completedMissions.has(5) && this.passedExams.has('exam_tier_3')) {
        this.completedLocations.add('hub');
        this.isCampaignCompleted = true;
        if (this.onCampaignComplete) {
          this.onCampaignComplete();
        }
      }
    }
    this.refreshProgressionStatus();
    this.saveToStorage();
  }

  public setCollectedPickupIds(ids: string[]): void {
    this.collectedPickupIds = new Set(ids);
    this.saveToStorage();
  }

  public getCollectedPickupIds(): string[] {
    return Array.from(this.collectedPickupIds);
  }

  /**
   * Authoritative location transition: checks strict progression before allowing
   */
  public setCurrentLocation(id: LocationId): boolean {
    const check = ProgressionValidator.canTransitionTo(
      id,
      this.completedMissions,
      this.passedExams,
      this.completedLocations,
      this.bossDefeatedFlag
    );

    if (!check.allowed) {
      return false;
    }

    const loc = this.locations.get(id);
    if (!loc) return false;

    this.currentLocationId = id;
    this.saveToStorage();

    if (this.onLocationChange) {
      this.onLocationChange(loc);
    }
    return true;
  }

  /**
   * Called when a chemistry mission is completed
   */
  public registerMissionCompletion(missionNumber: number): {
    newUnlocks: LocationId[];
    newLocationCompleted?: LocationId;
    campaignFinished: boolean;
  } {
    this.completedMissions.add(missionNumber);

    if (missionNumber === 1) {
      this.completedLocations.add('research_wing');
    } else if (missionNumber === 3) {
      if (this.completedMissions.has(2)) {
        this.completedLocations.add('refinery');
      }
    } else if (missionNumber === 5) {
      if (this.completedMissions.has(4)) {
        this.completedLocations.add('vault');
      }
    }

    const prevUnlocks = new Set<LocationId>();
    this.locations.forEach((loc, id) => {
      if (loc.isUnlocked) prevUnlocks.add(id);
    });

    this.refreshProgressionStatus();

    const newUnlocks: LocationId[] = [];
    this.locations.forEach((loc, id) => {
      if (loc.isUnlocked && !prevUnlocks.has(id)) {
        newUnlocks.push(id);
        if (this.onUnlock) this.onUnlock(id);
      }
    });

    let campaignFinished = false;
    if (this.completedMissions.has(4) && this.completedMissions.has(5) && this.passedExams.has('exam_tier_3')) {
      this.completedLocations.add('hub');
      this.isCampaignCompleted = true;
      campaignFinished = true;
      if (this.onCampaignComplete) {
        this.onCampaignComplete();
      }
    }

    this.saveToStorage();
    return {
      newUnlocks,
      campaignFinished,
    };
  }

  /**
   * Called when student passes an Academy 20-question certification exam
   */
  public registerExamPassed(examId: string): {
    newUnlocks: LocationId[];
    newLocationCompleted?: LocationId;
    campaignFinished: boolean;
  } {
    this.passedExams.add(examId);

    const prevUnlocks = new Set<LocationId>();
    this.locations.forEach((loc, id) => {
      if (loc.isUnlocked) prevUnlocks.add(id);
    });

    this.refreshProgressionStatus();

    const newUnlocks: LocationId[] = [];
    this.locations.forEach((loc, id) => {
      if (loc.isUnlocked && !prevUnlocks.has(id)) {
        newUnlocks.push(id);
        if (this.onUnlock) this.onUnlock(id);
      }
    });

    let campaignFinished = false;
    if (this.completedMissions.has(5) && this.passedExams.has('exam_tier_3') && this.bossDefeatedFlag) {
      this.isCampaignCompleted = true;
      campaignFinished = true;
      if (this.onCampaignComplete) {
        this.onCampaignComplete();
      }
    }

    this.saveToStorage();
    return {
      newUnlocks,
      campaignFinished,
    };
  }

  public isCampaignFinished(): boolean {
    return this.isCampaignCompleted;
  }

  public addPlayTime(dtSeconds: number): void {
    this.playTimeSeconds += dtSeconds;
  }

  public getPlayTimeSeconds(): number {
    return Math.round(this.playTimeSeconds);
  }

  /**
   * Persistence: Save to localStorage
   */
  public saveToStorage(
    playerScore: number = 0,
    playerHealth: number = 100,
    playerEnergy: number = 100,
    highestCombo: number = 1
  ): void {
    if (typeof window === 'undefined' || !window.localStorage) return;

    try {
      this.refreshProgressionStatus();
      const unlockedList: LocationId[] = [];
      this.locations.forEach((loc, id) => {
        if (loc.isUnlocked) unlockedList.push(id);
      });

      const data: CampaignSaveData = {
        version: CURRENT_VERSION,
        currentLocationId: this.currentLocationId,
        completedLocationIds: Array.from(this.completedLocations),
        completedMissionNumbers: Array.from(this.completedMissions),
        passedExams: Array.from(this.passedExams),
        collectedPickupIds: Array.from(this.collectedPickupIds),
        playerScore,
        playerHealth,
        playerEnergy,
        highestCombo,
        unlockedLocations: unlockedList,
        campaignCompleted: this.isCampaignCompleted,
        playTimeSeconds: this.playTimeSeconds,
        lastUpdated: Date.now(),
      };

      window.localStorage.setItem(CAMPAIGN_STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.warn('Could not save campaign state to localStorage:', err);
    }
  }

  /**
   * Persistence: Load from localStorage with safe migration
   */
  public loadFromStorage(): CampaignSaveData | null {
    if (typeof window === 'undefined' || !window.localStorage) return null;

    try {
      let raw = window.localStorage.getItem(CAMPAIGN_STORAGE_KEY);
      let isLegacy = false;

      if (!raw) {
        // Try legacy key
        raw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
        isLegacy = true;
      }
      if (!raw) return null;

      const data = JSON.parse(raw) as CampaignSaveData;
      if (!data) return null;

      // Restore completed missions
      if (Array.isArray(data.completedMissionNumbers)) {
        this.completedMissions = new Set(data.completedMissionNumbers);
      }

      // Restore passed exams
      if (Array.isArray(data.passedExams)) {
        this.passedExams = new Set(data.passedExams);
      }

      // Restore collected pickups
      if (Array.isArray(data.collectedPickupIds)) {
        this.collectedPickupIds = new Set(data.collectedPickupIds);
      }

      // Restore completed locations
      if (Array.isArray(data.completedLocationIds)) {
        this.completedLocations = new Set(data.completedLocationIds as LocationId[]);
      }

      // Authoritative Save Sanitization: Strip invalid locks
      const rawUnlocked: LocationId[] = Array.isArray(data.unlockedLocations)
        ? (data.unlockedLocations as LocationId[])
        : (['hub', 'academy', 'research_wing'] as LocationId[]);

      const sanitized = ProgressionValidator.sanitizeAndMigrateSave(
        rawUnlocked,
        Array.from(this.completedMissions),
        Array.from(this.passedExams)
      );

      this.refreshProgressionStatus();

      // Restore current location if verified unlocked
      if (data.currentLocationId && this.locations.has(data.currentLocationId)) {
        const canStay = ProgressionValidator.canTransitionTo(
          data.currentLocationId,
          this.completedMissions,
          this.passedExams,
          this.completedLocations,
          this.bossDefeatedFlag
        );
        if (canStay.allowed) {
          this.currentLocationId = data.currentLocationId;
        } else {
          this.currentLocationId = 'hub';
        }
      }

      this.isCampaignCompleted = !!data.campaignCompleted;
      this.playTimeSeconds = data.playTimeSeconds || 0;

      // Clean up legacy key if migrated
      if (isLegacy) {
        try {
          window.localStorage.removeItem(LEGACY_STORAGE_KEY);
        } catch {}
        this.saveToStorage();
      }

      return data;
    } catch (err) {
      console.warn('Could not load campaign state from localStorage:', err);
      return null;
    }
  }

  /**
   * Reset campaign progress (New Game option)
   */
  public resetCampaign(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem(CAMPAIGN_STORAGE_KEY);
        window.localStorage.removeItem(LEGACY_STORAGE_KEY);
      } catch (e) {
        console.warn('Could not remove campaign storage key:', e);
      }
    }

    this.completedLocations.clear();
    this.completedMissions.clear();
    this.passedExams.clear();
    this.collectedPickupIds.clear();
    this.isCampaignCompleted = false;
    this.bossDefeatedFlag = false;
    this.playTimeSeconds = 0;
    this.currentLocationId = 'hub';

    this.initLocationDefinitions();
    this.saveToStorage();

    if (this.onLocationChange) {
      this.onLocationChange(this.getCurrentLocation());
    }
  }
}
