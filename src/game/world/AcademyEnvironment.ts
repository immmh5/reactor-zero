/**
 * LAB GUARDIAN - 3D Stoichiometry Academy Environment
 * Dedicated learning facility connected to Central Laboratory (Hub)
 * Features 3 specialized educational zones:
 * Area A: Interactive Science Gallery (3D molecule displays, reaction chambers, atom conservation)
 * Area B: Training & Practice Room (Worked examples, hints, mole ratio calculations)
 * Area C: Certification Examination Chamber (20-question certification console & progression gate)
 */

import {
  Scene,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Vector3,
  TransformNode,
  Mesh,
  PointLight,
  HemisphericLight,
  GlowLayer,
} from '@babylonjs/core';
import { BoundingCircle, BoundingBox2D } from '../rules/gameRules';
import { InteractiveStation } from '../interaction/InteractionManager';
import { MapBuildResult } from './HubEnvironment';
import { AssetManager } from '../assets/AssetManager';
import { AtomModelFactory } from '../academy/AtomModelFactory';

export class AcademyEnvironment {
  public static build(scene: Scene): MapBuildResult {
    const root = new TransformNode('academy_environment', scene);
    const circles: BoundingCircle[] = [];
    const boxes: BoundingBox2D[] = [];
    const reactorRings: Mesh[] = [];
    const stations: InteractiveStation[] = [];

    // Subtle luminous glow
    let glowLayer = scene.getGlowLayerByName('lab_glow');
    if (!glowLayer) {
      const gl = new GlowLayer('lab_glow', scene);
      gl.intensity = 0.75;
      glowLayer = gl;
    }

    // --- Clean Scientific Lighting ---
    const hemiLight = new HemisphericLight('acad_hemi_light', new Vector3(0, 1, 0), scene);
    hemiLight.diffuse = new Color3(0.4, 0.48, 0.65); // Bright architectural illumination
    hemiLight.groundColor = new Color3(0.12, 0.16, 0.24);
    hemiLight.intensity = 0.95;
    hemiLight.parent = root;

    // Central Hall Azure Light
    const mainLight = new PointLight('acad_main_light', new Vector3(0, 5.0, 0), scene);
    mainLight.diffuse = new Color3(0.1, 0.9, 1.0);
    mainLight.intensity = 1.4;
    mainLight.range = 32;
    mainLight.parent = root;

    // Gallery Light (West)
    const galleryLight = new PointLight('acad_gallery_light', new Vector3(-12, 4.5, 4), scene);
    galleryLight.diffuse = new Color3(0.0, 1.0, 0.7);
    galleryLight.intensity = 1.0;
    galleryLight.range = 20;
    galleryLight.parent = root;

    // Training Room Light (East)
    const trainingLight = new PointLight('acad_training_light', new Vector3(12, 4.5, 4), scene);
    trainingLight.diffuse = new Color3(1.0, 0.75, 0.1);
    trainingLight.intensity = 1.0;
    trainingLight.range = 20;
    trainingLight.parent = root;

    // Exam Chamber Light (North)
    const examLight = new PointLight('acad_exam_light', new Vector3(0, 4.5, 16), scene);
    examLight.diffuse = new Color3(0.7, 0.2, 1.0);
    examLight.intensity = 1.3;
    examLight.range = 22;
    examLight.parent = root;

    // --- Materials ---
    const floorMat = new StandardMaterial('mat_acad_floor', scene);
    floorMat.diffuseColor = new Color3(0.14, 0.18, 0.26);
    floorMat.specularColor = new Color3(0.4, 0.5, 0.65);

    const floorTileMat = new StandardMaterial('mat_acad_tile', scene);
    floorTileMat.diffuseColor = new Color3(0.08, 0.11, 0.17);

    const wallMat = new StandardMaterial('mat_acad_wall', scene);
    wallMat.diffuseColor = new Color3(0.22, 0.28, 0.38);
    wallMat.specularColor = new Color3(0.25, 0.35, 0.45);

    const darkTrimMat = new StandardMaterial('mat_acad_trim', scene);
    darkTrimMat.diffuseColor = new Color3(0.04, 0.07, 0.11);
    darkTrimMat.specularColor = new Color3(0.5, 0.6, 0.7);

    const glassMat = new StandardMaterial('mat_acad_glass', scene);
    glassMat.diffuseColor = new Color3(0.2, 0.45, 0.6);
    glassMat.alpha = 0.35;

    const cyanGlowMat = new StandardMaterial('mat_acad_cyan', scene);
    cyanGlowMat.diffuseColor = new Color3(0.0, 0.4, 0.5);
    cyanGlowMat.emissiveColor = new Color3(0.0, 0.95, 1.0);

    const greenGlowMat = new StandardMaterial('mat_acad_green', scene);
    greenGlowMat.diffuseColor = new Color3(0.0, 0.4, 0.2);
    greenGlowMat.emissiveColor = new Color3(0.0, 1.0, 0.5);

    const amberGlowMat = new StandardMaterial('mat_acad_amber', scene);
    amberGlowMat.diffuseColor = new Color3(0.4, 0.2, 0.0);
    amberGlowMat.emissiveColor = new Color3(1.0, 0.7, 0.1);

    const purpleGlowMat = new StandardMaterial('mat_acad_purple', scene);
    purpleGlowMat.diffuseColor = new Color3(0.3, 0.0, 0.5);
    purpleGlowMat.emissiveColor = new Color3(0.8, 0.2, 1.0);

    // --- 1. Architectural Floor Layout (Cross / T-Hall) ---
    // Central Forum Floor (36m wide x 44m deep)
    const floor = MeshBuilder.CreateBox('acad_floor', { width: 38, height: 0.2, depth: 46 }, scene);
    floor.position = new Vector3(0, -0.1, 0);
    floor.material = floorMat;
    floor.parent = root;

    // Glowing architectural floor ribbons
    for (let z = -18; z <= 18; z += 6) {
      const line = MeshBuilder.CreateBox(`acad_line_${z}`, { width: 32, height: 0.02, depth: 0.12 }, scene);
      line.position = new Vector3(0, 0.01, z);
      line.material = cyanGlowMat;
      line.parent = root;
    }

    // --- 2. Perimeter Walls ---
    // South Wall with Central Gateway back to Hub
    const wallS1 = MeshBuilder.CreateBox('acad_wall_s1', { width: 15, height: 7, depth: 1.2 }, scene);
    wallS1.position = new Vector3(-10.5, 3.5, -22);
    wallS1.material = wallMat;
    wallS1.parent = root;
    boxes.push({ minX: -18, maxX: -3, minZ: -23, maxZ: -21 });

    const wallS2 = MeshBuilder.CreateBox('acad_wall_s2', { width: 15, height: 7, depth: 1.2 }, scene);
    wallS2.position = new Vector3(10.5, 3.5, -22);
    wallS2.material = wallMat;
    wallS2.parent = root;
    boxes.push({ minX: 3, maxX: 18, minZ: -23, maxZ: -21 });

    // North Wall (behind Exam Chamber)
    const wallN = MeshBuilder.CreateBox('acad_wall_n', { width: 38, height: 7, depth: 1.2 }, scene);
    wallN.position = new Vector3(0, 3.5, 22);
    wallN.material = wallMat;
    wallN.parent = root;
    boxes.push({ minX: -19, maxX: 19, minZ: 21, maxZ: 23 });

    // West Wall (behind Gallery)
    const wallW = MeshBuilder.CreateBox('acad_wall_w', { width: 1.2, height: 7, depth: 46 }, scene);
    wallW.position = new Vector3(-18.5, 3.5, 0);
    wallW.material = wallMat;
    wallW.parent = root;
    boxes.push({ minX: -19.5, maxX: -17.5, minZ: -23, maxZ: 23 });

    // East Wall (behind Training Room)
    const wallE = MeshBuilder.CreateBox('acad_wall_e', { width: 1.2, height: 7, depth: 46 }, scene);
    wallE.position = new Vector3(18.5, 3.5, 0);
    wallE.material = wallMat;
    wallE.parent = root;
    boxes.push({ minX: 17.5, maxX: 19.5, minZ: -23, maxZ: 23 });

    // --- 3. ZONE A — INTERACTIVE SCIENCE GALLERY (West Wing: x = -12) ---
    // Gallery Heading Plinth
    const galleryBanner = MeshBuilder.CreateBox('acad_gallery_banner', { width: 10, height: 1.2, depth: 0.4 }, scene);
    galleryBanner.position = new Vector3(-11, 4.8, -4);
    galleryBanner.material = greenGlowMat;
    galleryBanner.parent = root;

    // Display 1: 3D Iron Oxidation Reaction Chamber (4Fe + 3O2 -> 2Fe2O3)
    this.createScienceDisplayPedestal(
      scene,
      root,
      'demo_station_1_iron',
      new Vector3(-12, 0, -12),
      'المعرض 01: أكسدة الحديد وحفظ الذرات',
      greenGlowMat,
      glassMat,
      darkTrimMat,
      boxes
    );
    stations.push({
      id: 'demo_station_1_iron',
      missionNumber: 101,
      nameAr: 'المعرض 01: أكسدة الحديد وحفظ الذرات',
      category: 'equation',
      position: { x: -12, y: 1.0, z: -12 },
      descriptionAr: 'معاينة تفاعل 4 ذرات حديد مع 3 جزيئات أكسجين لتكوين 2 وحدة صيغة من أكسيد الحديد مع حفظ تام للذرات.',
      chemicalInfoAr: '4Fe(s) + 3O2(g) -> 2Fe2O3(s) | قبل: 4Fe و 6O | بعد: 4Fe و 6O',
      equationFormula: '4Fe(s) + 3O2(g) -> 2Fe2O3(s)',
      isCompleted: true,
    });

    // Display 2: 3D Oxygen Diatomic Molecule Chamber (O2)
    this.createScienceDisplayPedestal(
      scene,
      root,
      'demo_station_2_o2',
      new Vector3(-12, 0, -4),
      'المعرض 02: جزيء الأكسجين الثنائي O2',
      cyanGlowMat,
      glassMat,
      darkTrimMat,
      boxes
    );
    stations.push({
      id: 'demo_station_2_o2',
      missionNumber: 102,
      nameAr: 'المعرض 02: جزيء الأكسجين الثنائي O2',
      category: 'equation',
      position: { x: -12, y: 1.0, z: -4 },
      descriptionAr: 'فحص جزيء الأكسجين ثنائي الذرة O2 والتعرف على الرابطة التساهمية ودلالة المعامل على عدد الجزيئات والمولات.',
      chemicalInfoAr: 'الأكسجين الطبيعي جزيء ثنائي الذرة O2. المعامل (3) يعني 3 جزيئات أو 3 مولات.',
      equationFormula: 'O2(g) [Diatomic Oxygen Molecule]',
      isCompleted: true,
    });

    // Display 3: 3D Propane Combustion & Mass Balance Scale (C3H8 + 5O2)
    this.createScienceDisplayPedestal(
      scene,
      root,
      'demo_station_3_propane',
      new Vector3(-12, 0, 4),
      'المعرض 03: احتراق البروبان وميزان حفظ الكتلة',
      amberGlowMat,
      glassMat,
      darkTrimMat,
      boxes
    );
    stations.push({
      id: 'demo_station_3_propane',
      missionNumber: 103,
      nameAr: 'المعرض 03: احتراق البروبان وميزان حفظ الكتلة',
      category: 'mass_balance',
      position: { x: -12, y: 1.0, z: 4 },
      descriptionAr: 'ميزان إلكتروني يقارن كتلة المتفاعلات (204.1g) مع كتلة النواتج (204.11g) عبر الكتل المولية.',
      chemicalInfoAr: 'C3H8 + 5O2 -> 3CO2 + 4H2O | كتلة المتفاعلات 204.1g = كتلة النواتج 204.11g',
      equationFormula: 'C3H8(g) + 5O2(g) -> 3CO2(g) + 4H2O(g)',
      isCompleted: true,
    });

    // Display 4: 3D Potassium Bromide Ionic Crystal Lattice (2K + Br2 -> 2KBr)
    this.createScienceDisplayPedestal(
      scene,
      root,
      'demo_station_4_kbr',
      new Vector3(-12, 0, 12),
      'المعرض 04: بلورة KBr الأيونية والـ 6 نسب مولية',
      purpleGlowMat,
      glassMat,
      darkTrimMat,
      boxes
    );
    stations.push({
      id: 'demo_station_4_kbr',
      missionNumber: 104,
      nameAr: 'المعرض 04: بلورة KBr الأيونية والـ 6 نسب مولية',
      category: 'mole_hunt',
      position: { x: -12, y: 1.0, z: 12 },
      descriptionAr: 'معاينة الشبكة البلورية الأيونية لـ KBr وفهم أن الجسيم الممثل هو وحدة الصيغة، واشتقاق 6 نسب مولية موجهة.',
      chemicalInfoAr: '2K + Br2 -> 2KBr | n = 3 مواد | عدد النسب = 3(3-1) = 6 نسب مولية موجهة',
      equationFormula: '2K(s) + Br2(l) -> 2KBr(s)',
      isCompleted: true,
    });

    // --- 4. ZONE B — TRAINING & PRACTICE ROOM (East Wing: x = +12) ---
    // Practice Console 1: Worked Examples & Interactive Calculations
    this.createAcademyTerminal(
      scene,
      root,
      'acad_training_terminal_1',
      new Vector3(12, 0, -8),
      -Math.PI / 2,
      amberGlowMat,
      wallMat,
      darkTrimMat,
      boxes
    );
    stations.push({
      id: 'acad_training_terminal_1',
      missionNumber: 110,
      nameAr: 'منصة التدريب 01: مسائل الحسابات الكيميائية الموجهة',
      category: 'equation',
      position: { x: 12, y: 1.0, z: -8 },
      descriptionAr: 'تمارين تدريبية غير مقيدة بالوقت مع أمثلة محلولة خطوة بخطوة وتلميحات إرشادية وتفسيرات فورية.',
      chemicalInfoAr: 'تدرب على حسابات المولات، ومعاملات المعادلات، وقانون حفظ الكتلة مع إعادة المحاولة بلا حدود.',
      equationFormula: 'PRACTICE MODULE: GUIDED STOICHIOMETRY',
      isCompleted: true,
    });

    // Practice Console 2: Mole Ratio Builder & Matrix Practice
    this.createAcademyTerminal(
      scene,
      root,
      'acad_training_terminal_2',
      new Vector3(12, 0, 4),
      -Math.PI / 2,
      cyanGlowMat,
      wallMat,
      darkTrimMat,
      boxes
    );
    stations.push({
      id: 'acad_training_terminal_2',
      missionNumber: 111,
      nameAr: 'منصة التدريب 02: بناء النسب المولية ومصفوفة n(n-1)',
      category: 'matrix',
      position: { x: 12, y: 1.0, z: 4 },
      descriptionAr: 'بناء النسب المولية الموجهة وعكسها والتحقق من حساب إجمالي النسب بعلاقة n(n - 1) لتفاعل البيوتان.',
      chemicalInfoAr: 'تطبيق علاقة n(n - 1) على تفاعلات 3 و 4 مواد، والتأكد من استبعاد النسب القطرية الذاتية.',
      equationFormula: '2C4H10(g) + 13O2(g) -> 8CO2(g) + 10H2O(g)',
      isCompleted: true,
    });

    // Display 5 (East Gallery): 3D Butane Combustion Matrix Table (Area A Display 5)
    this.createScienceDisplayPedestal(
      scene,
      root,
      'demo_station_5_butane',
      new Vector3(12, 0, 12),
      'المعرض 05: مصفوفة البيوتان ذات 12 نسبة مولية',
      purpleGlowMat,
      glassMat,
      darkTrimMat,
      boxes
    );
    stations.push({
      id: 'demo_station_5_butane',
      missionNumber: 105,
      nameAr: 'المعرض 05: مصفوفة احتراق البيوتان 12 نسبة مولية',
      category: 'matrix',
      position: { x: 12, y: 1.0, z: 12 },
      descriptionAr: 'معاينة تفاعل احتراق البيوتان الشامل ومصفوفة النسب 4×4 واستبعاد القطر الرئيسي n(n-1)=12.',
      chemicalInfoAr: '2C4H10 + 13O2 -> 8CO2 + 10H2O | n = 4 مواد -> 4 × 3 = 12 نسبة مولية موجهة',
      equationFormula: '2C4H10(g) + 13O2(g) -> 8CO2(g) + 10H2O(g)',
      isCompleted: true,
    });

    // --- 5. ZONE C — CERTIFICATION EXAMINATION CHAMBER (North: z = 14 to 19) ---
    // Raised Examination Dais & Holographic Seal
    const examDais = MeshBuilder.CreateCylinder('acad_exam_dais', { diameter: 10.5, height: 0.35, tessellation: 36 }, scene);
    examDais.position = new Vector3(0, 0.175, 15.5);
    examDais.material = darkTrimMat;
    examDais.parent = root;

    const examRing = MeshBuilder.CreateTorus('acad_exam_ring', { diameter: 10.2, thickness: 0.14, tessellation: 48 }, scene);
    examRing.position = new Vector3(0, 0.36, 15.5);
    examRing.material = purpleGlowMat;
    examRing.parent = root;

    // Visible 3D Certification Exam Console in Center of Dais
    const consoleDesk = MeshBuilder.CreateBox('acad_exam_desk', { width: 3.4, height: 1.15, depth: 1.4 }, scene);
    consoleDesk.position = new Vector3(0, 0.75, 15.5);
    consoleDesk.material = darkTrimMat;
    consoleDesk.parent = root;

    const examScreen = MeshBuilder.CreateBox('acad_exam_screen', { width: 2.6, height: 1.25, depth: 0.12 }, scene);
    examScreen.position = new Vector3(0, 1.8, 15.8);
    examScreen.rotation.x = -0.25;
    examScreen.material = purpleGlowMat;
    examScreen.parent = root;

    const holoExamOrb = MeshBuilder.CreateSphere('acad_holo_orb', { diameter: 0.85, segments: 16 }, scene);
    holoExamOrb.position = new Vector3(0, 2.7, 15.5);
    holoExamOrb.material = cyanGlowMat;
    holoExamOrb.parent = root;
    const holoOrbObs = scene.onBeforeRenderObservable.add(() => {
      if (holoExamOrb.isDisposed()) {
        scene.onBeforeRenderObservable.remove(holoOrbObs);
        return;
      }
      holoExamOrb.rotation.y += 0.02;
    });

    boxes.push({ minX: -2.0, maxX: 2.0, minZ: 14.5, maxZ: 16.5 });

    // Interactive Station for the 20-Question Exam
    stations.push({
      id: 'academy_exam_console',
      missionNumber: 200,
      nameAr: 'منصة اختبارات التأهيل والاعتماد الأكاديمي (20 سؤالاً)',
      category: 'boss_reactor',
      position: { x: 0, y: 1.0, z: 14.0 },
      descriptionAr: 'بدء اختبار التأهيل الشامل المكون من 20 سؤالاً لفتح القطاع التالي في الحملة وشهادات الاعتماد.',
      chemicalInfoAr: 'اجتياز الاختبار بنسبة 80% (16 من 20) مطلوب رسمياً لفتح بوابات القطاعات التالية في المنشأة.',
      equationFormula: 'CERTIFICATION GATEWAY: 20 QUESTIONS ACTIVE',
      isCompleted: false,
    });

    // --- 6. SOUTH TRANSIT GATE BACK TO CENTRAL LAB (HUB) ---
    this.createTransitPortal(scene, root, 'transit_hub_academy', new Vector3(0, 0, -21.0), 0, cyanGlowMat, darkTrimMat, boxes);
    stations.push({
      id: 'transit_hub_academy',
      missionNumber: 0,
      nameAr: 'بوابة العبور: العودة إلى المختبر المركزي (HUB)',
      category: 'matrix',
      position: { x: 0, y: 1.0, z: -19.5 },
      descriptionAr: 'العودة عبر بوابة الأمان الهوائي إلى المقر الرئيسي ومفاعل نقطة الصفر.',
      chemicalInfoAr: 'المقر الرئيسي يتيح التوجه نحو قطاعات العمليات الميدانية والدخول في المهمات.',
      equationFormula: 'RETURN TO REACTOR HUB',
      isCompleted: true,
    });

    // --- 7. Real 3D Structural Columns & Equipment Units ---
    const colLocs = [
      { x: -6, z: -8 },
      { x: 6, z: -8 },
      { x: -6, z: 8 },
      { x: 6, z: 8 },
    ];
    colLocs.forEach((loc, idx) => {
      AssetManager.getInstance().loadAsset('structuralColumn', scene).then(({ node }) => {
        node.name = `acad_col_${idx}`;
        node.position = new Vector3(loc.x, 0, loc.z);
        node.scaling.setAll(1.4);
        node.parent = root;
      }).catch(() => {});
      circles.push({ x: loc.x, z: loc.z, radius: 1.0 });
    });

    // Real 3D Radar Scanner overhead in Academy
    AssetManager.getInstance().loadAsset('radarScanner', scene).then(({ node }) => {
      node.position = new Vector3(0, 6.2, 0);
      node.scaling.setAll(1.3);
      node.parent = root;
      const radarObs = scene.onBeforeRenderObservable.add(() => {
        if (node.isDisposed()) {
          scene.onBeforeRenderObservable.remove(radarObs);
          return;
        }
        node.rotation.y += 0.015;
      });
    }).catch(() => {});

    return {
      rootNode: root,
      circles,
      boxes,
      reactorRings,
      plasmaCore: null,
      mainLight,
      auxLights: [galleryLight, trainingLight, examLight],
      stations,
    };
  }

  private static createScienceDisplayPedestal(
    scene: Scene,
    root: TransformNode,
    name: string,
    pos: Vector3,
    titleAr: string,
    accentMat: StandardMaterial,
    glassMat: StandardMaterial,
    trimMat: StandardMaterial,
    boxes: BoundingBox2D[]
  ): void {
    const pedestal = new TransformNode(name, scene);
    pedestal.position = pos;
    pedestal.parent = root;

    // Solid base plinth
    const base = MeshBuilder.CreateCylinder(`${name}_base`, { diameter: 2.2, height: 0.9, tessellation: 28 }, scene);
    base.position.y = 0.45;
    base.material = trimMat;
    base.parent = pedestal;

    const ring = MeshBuilder.CreateTorus(`${name}_ring`, { diameter: 2.1, thickness: 0.08, tessellation: 28 }, scene);
    ring.position.y = 0.92;
    ring.material = accentMat;
    ring.parent = pedestal;

    // Protective glass demonstration dome
    const glassDome = MeshBuilder.CreateCylinder(`${name}_dome`, { diameter: 1.8, height: 1.6, tessellation: 24 }, scene);
    glassDome.position.y = 1.75;
    glassDome.material = glassMat;
    glassDome.parent = pedestal;

    // Real 3D interactive atom/molecule demonstration model inside dome
    const displayModel = AtomModelFactory.createPedestalDisplayModel(scene, name, pedestal);
    const obs = scene.onBeforeRenderObservable.add(() => {
      if (displayModel.isDisposed()) {
        scene.onBeforeRenderObservable.remove(obs);
        return;
      }
      displayModel.rotation.y += 0.018;
    });

    // Informational lectern in front of pedestal
    const lectern = MeshBuilder.CreateBox(`${name}_lectern`, { width: 1.1, height: 1.0, depth: 0.6 }, scene);
    lectern.position = new Vector3(0, 0.5, 1.4);
    lectern.rotation.y = Math.PI;
    lectern.material = trimMat;
    lectern.parent = pedestal;

    const lecternScreen = MeshBuilder.CreateBox(`${name}_l_screen`, { width: 0.9, height: 0.5, depth: 0.08 }, scene);
    lecternScreen.position = new Vector3(0, 1.05, 1.4);
    lecternScreen.rotation.x = 0.35;
    lecternScreen.material = accentMat;
    lecternScreen.parent = pedestal;

    boxes.push({
      minX: pos.x - 1.4,
      maxX: pos.x + 1.4,
      minZ: pos.z - 1.2,
      maxZ: pos.z + 1.8,
    });
  }

  private static createAcademyTerminal(
    scene: Scene,
    root: TransformNode,
    name: string,
    pos: Vector3,
    rotY: number,
    screenMat: StandardMaterial,
    wallMat: StandardMaterial,
    metalMat: StandardMaterial,
    boxes: BoundingBox2D[]
  ): void {
    const station = new TransformNode(name, scene);
    station.position = pos;
    station.rotation.y = rotY;
    station.parent = root;

    const desk = MeshBuilder.CreateBox(`${name}_desk`, { width: 2.8, height: 1.1, depth: 1.2 }, scene);
    desk.position.y = 0.55;
    desk.material = metalMat;
    desk.parent = station;

    const monitor = MeshBuilder.CreateBox(`${name}_screen`, { width: 2.2, height: 1.0, depth: 0.12 }, scene);
    monitor.position = new Vector3(0, 1.5, 0.25);
    monitor.rotation.x = -0.3;
    monitor.material = screenMat;
    monitor.parent = station;

    boxes.push({
      minX: pos.x - 1.5,
      maxX: pos.x + 1.5,
      minZ: pos.z - 0.8,
      maxZ: pos.z + 0.8,
    });
  }

  private static createTransitPortal(
    scene: Scene,
    root: TransformNode,
    name: string,
    pos: Vector3,
    rotY: number,
    glowMat: StandardMaterial,
    frameMat: StandardMaterial,
    boxes: BoundingBox2D[]
  ): void {
    const portal = new TransformNode(name, scene);
    portal.position = pos;
    portal.rotation.y = rotY;
    portal.parent = root;

    const archTop = MeshBuilder.CreateBox(`${name}_arch_top`, { width: 5.2, height: 0.8, depth: 1.2 }, scene);
    archTop.position.y = 5.0;
    archTop.material = frameMat;
    archTop.parent = portal;

    const postLeft = MeshBuilder.CreateBox(`${name}_post_l`, { width: 0.7, height: 5.0, depth: 1.2 }, scene);
    postLeft.position = new Vector3(-2.2, 2.5, 0);
    postLeft.material = frameMat;
    postLeft.parent = portal;

    const postRight = MeshBuilder.CreateBox(`${name}_post_r`, { width: 0.7, height: 5.0, depth: 1.2 }, scene);
    postRight.position = new Vector3(2.2, 2.5, 0);
    postRight.material = frameMat;
    postRight.parent = portal;

    const membrane = MeshBuilder.CreatePlane(`${name}_membrane`, { width: 3.6, height: 4.4 }, scene);
    membrane.position.y = 2.2;
    const membraneMat = glowMat.clone(`${name}_membrane_mat`);
    membraneMat.alpha = 0.45;
    membraneMat.backFaceCulling = false;
    membrane.material = membraneMat;
    membrane.isPickable = false;
    membrane.parent = portal;

    boxes.push({
      minX: pos.x - 2.5,
      maxX: pos.x + 2.5,
      minZ: pos.z - 1.0,
      maxZ: pos.z + 1.0,
    });
  }
}
