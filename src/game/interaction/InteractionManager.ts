/**
 * LAB GUARDIAN - Interaction Manager
 * Coordinates proximity detection with the 5 Stoichiometric Challenge Stations
 */

import { Vector3 } from '@babylonjs/core';
import { GAME_CONFIG } from '../config/gameConfig';
import { sounds } from '../audio/SoundEffects';

export interface InteractiveStation {
  id: string;
  missionNumber: number;
  nameAr: string;
  category: 'equation' | 'mass_balance' | 'mole_hunt' | 'matrix' | 'boss_reactor';
  position: { x: number; y: number; z: number };
  descriptionAr: string;
  chemicalInfoAr: string;
  equationFormula: string;
  isCompleted: boolean;
}

export class InteractionManager {
  private stations: InteractiveStation[] = [
    {
      id: 'station_m1_equation',
      missionNumber: 1,
      nameAr: 'المحطة 1: تفسير المعادلات الكيميائية',
      category: 'equation',
      position: { x: 0, y: 1.0, z: -6.5 },
      descriptionAr: 'تفسير نسب المولات والجسيمات الممثلة في معادلة أكسدة الحديد المتزنة.',
      chemicalInfoAr: 'المعاملات في المعادلة الكيميائية الموزونة تمثل أعداد الجسيمات الممثلة (ذرات، جزيئات، وحدات صيغة) وكذلك نسب المولات.',
      equationFormula: '4Fe(s) + 3O2(g) -> 2Fe2O3(s)',
      isCompleted: false,
    },
    {
      id: 'station_m2_mass_balance',
      missionNumber: 2,
      nameAr: 'المحطة 2: ميزان حفظ الكتلة',
      category: 'mass_balance',
      position: { x: -9.5, y: 1.0, z: -3.5 },
      descriptionAr: 'حساب كتل المتفاعلات والنواتج بالجرام والتحقق من قانون حفظ الكتلة.',
      chemicalInfoAr: 'قانون حفظ الكتلة: الكتلة الكلية للمواد المتفاعلة تساوي دائماً الكتلة الكلية للمواد الناتجة في أي تفاعل كيميائي.',
      equationFormula: 'C3H8(g) + 5O2(g) -> 3CO2(g) + 4H2O(g)',
      isCompleted: false,
    },
    {
      id: 'station_m3_mole_hunt',
      missionNumber: 3,
      nameAr: 'المحطة 3: صائد النسب المولية',
      category: 'mole_hunt',
      position: { x: 9.5, y: 1.0, z: -3.5 },
      descriptionAr: 'اشتقاق النسب المولية بين المواد وحساب قيمة النسبة الموجهة وعكسها.',
      chemicalInfoAr: 'النسبة المولية هي نسبة بين أعداد المولات لأي مادتين في المعادلة الكيميائية الموزونة، وعكس النسبة يغير العلاقة الحسابية.',
      equationFormula: '2K(s) + Br2(l) -> 2KBr(s)',
      isCompleted: false,
    },
    {
      id: 'station_m4_matrix',
      missionNumber: 4,
      nameAr: 'المحطة 4: مصفوفة النسب المولية n(n-1)',
      category: 'matrix',
      position: { x: -7.5, y: 1.0, z: 9.0 },
      descriptionAr: 'تطبيق القانون الرياضي n(n - 1) لحساب إجمالي عدد النسب المولية الموجهة.',
      chemicalInfoAr: 'عدد النسب المولية التي يمكن كتابتها لتفاعل يحتوي على n من المواد يعطى بالعلاقة n(n - 1). إذا كانت 3 مواد فإنها 6 نسب، وإذا 4 مواد فإنها 12 نسبة.',
      equationFormula: '4Al(s) + 3O2(g) -> 2Al2O3(s)',
      isCompleted: false,
    },
    {
      id: 'station_m5_boss',
      missionNumber: 5,
      nameAr: 'المحطة 5: وحدة فك درع المفاعل الأخير',
      category: 'boss_reactor',
      position: { x: 7.5, y: 1.0, z: 9.0 },
      descriptionAr: 'إنجاز حسابات احتراق البيوتان الكمية لتعطيل درع الزعيم وإحكام استقرار المفاعل.',
      chemicalInfoAr: 'الحسابات المتكافئة الشاملة تمكننا من تحديد كميات النواتج المتوقعة بدقة عبر ضرب مولات المادة المعطاة في النسبة المولية المناسبة.',
      equationFormula: '2C4H10(g) + 13O2(g) -> 8CO2(g) + 10H2O(g)',
      isCompleted: false,
    },
  ];

  private activeNearbyStation: InteractiveStation | null = null;
  public onPromptChange?: (station: InteractiveStation | null) => void;
  public onOpenModal?: (station: InteractiveStation) => void;

  public getStations(): InteractiveStation[] {
    return this.stations;
  }

  public setStations(newStations: InteractiveStation[]): void {
    // Preserve completion status if matching
    const completedSet = new Set(
      this.stations.filter((s) => s.isCompleted).map((s) => s.id)
    );

    this.stations = newStations.map((s) => ({
      ...s,
      isCompleted: s.isCompleted || completedSet.has(s.id),
    }));

    this.activeNearbyStation = null;
    if (this.onPromptChange) {
      this.onPromptChange(null);
    }
  }

  public getStation(id: string): InteractiveStation | undefined {
    return this.stations.find((s) => s.id === id);
  }

  public markStationCompleted(missionNumber: number): void {
    const station = this.stations.find((s) => s.missionNumber === missionNumber);
    if (station) {
      station.isCompleted = true;
    }
  }

  public update(playerPos: Vector3): void {
    let nearest: InteractiveStation | null = null;
    let minDistance: number = GAME_CONFIG.INTERACTION.MAX_DISTANCE;

    for (const station of this.stations) {
      const dx = playerPos.x - station.position.x;
      const dz = playerPos.z - station.position.z;
      const dist = Math.hypot(dx, dz);

      if (dist <= minDistance) {
        minDistance = dist;
        nearest = station;
      }
    }

    if (nearest !== this.activeNearbyStation) {
      this.activeNearbyStation = nearest;
      if (this.onPromptChange) {
        this.onPromptChange(nearest);
      }
    }
  }

  public handleInteract(): void {
    if (this.activeNearbyStation) {
      sounds.playInteract();
      if (this.onOpenModal) {
        this.onOpenModal(this.activeNearbyStation);
      }
    }
  }

  public getActiveStation(): InteractiveStation | null {
    return this.activeNearbyStation;
  }
}
