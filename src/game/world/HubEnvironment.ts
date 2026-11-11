/**
 * LAB GUARDIAN - Location 1: Central Laboratory (Campaign Hub)
 * Preserves the recognized circular laboratory while establishing it as the operational command base
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
import { AssetManager } from '../assets/AssetManager';
import { InteractiveStation } from '../interaction/InteractionManager';

export interface MapBuildResult {
  rootNode: TransformNode;
  circles: BoundingCircle[];
  boxes: BoundingBox2D[];
  reactorRings: Mesh[];
  plasmaCore: Mesh | null;
  mainLight: PointLight | null;
  auxLights: PointLight[];
  stations: InteractiveStation[];
}

export class HubEnvironment {
  public static build(scene: Scene): MapBuildResult {
    const root = new TransformNode('hub_environment', scene);
    const circles: BoundingCircle[] = [];
    const boxes: BoundingBox2D[] = [];
    const reactorRings: Mesh[] = [];
    const stations: InteractiveStation[] = [];

    // Cinematic Glow
    let glowLayer = scene.getGlowLayerByName('lab_glow');
    if (!glowLayer) {
      const gl = new GlowLayer('lab_glow', scene);
      gl.intensity = 0.85;
      glowLayer = gl;
    }

    // --- Atmospheric Lights ---
    const hemiLight = new HemisphericLight('hub_hemi_light', new Vector3(0, 1, 0), scene);
    hemiLight.diffuse = new Color3(0.2, 0.28, 0.44);
    hemiLight.groundColor = new Color3(0.05, 0.07, 0.14);
    hemiLight.intensity = 0.8;
    hemiLight.parent = root;

    const reactorLight = new PointLight('hub_reactor_light', new Vector3(0, 3.5, 0), scene);
    reactorLight.diffuse = new Color3(0.0, 0.9, 1.0);
    reactorLight.intensity = 1.4;
    reactorLight.range = 28;
    reactorLight.parent = root;

    const amberLight1 = new PointLight('hub_amber_1', new Vector3(-12, 4.0, -8), scene);
    amberLight1.diffuse = new Color3(1.0, 0.65, 0.1);
    amberLight1.intensity = 0.8;
    amberLight1.range = 18;
    amberLight1.parent = root;

    const amberLight2 = new PointLight('hub_amber_2', new Vector3(12, 4.0, 8), scene);
    amberLight2.diffuse = new Color3(1.0, 0.65, 0.1);
    amberLight2.intensity = 0.8;
    amberLight2.range = 18;
    amberLight2.parent = root;

    // --- Shared Materials ---
    const floorMat = new StandardMaterial('mat_hub_floor', scene);
    floorMat.diffuseColor = new Color3(0.06, 0.09, 0.16);
    floorMat.specularColor = new Color3(0.2, 0.3, 0.45);

    const wallMat = new StandardMaterial('mat_hub_wall', scene);
    wallMat.diffuseColor = new Color3(0.09, 0.13, 0.22);
    wallMat.specularColor = new Color3(0.15, 0.22, 0.35);

    const darkMetalMat = new StandardMaterial('mat_hub_metal', scene);
    darkMetalMat.diffuseColor = new Color3(0.03, 0.05, 0.09);
    darkMetalMat.specularColor = new Color3(0.3, 0.35, 0.4);

    const cyanMat = new StandardMaterial('mat_hub_cyan', scene);
    cyanMat.diffuseColor = new Color3(0.0, 0.3, 0.4);
    cyanMat.emissiveColor = new Color3(0.0, 0.92, 1.0);

    const amberMat = new StandardMaterial('mat_hub_amber', scene);
    amberMat.diffuseColor = new Color3(0.4, 0.2, 0.0);
    amberMat.emissiveColor = new Color3(1.0, 0.6, 0.0);

    const greenMat = new StandardMaterial('mat_hub_green', scene);
    greenMat.diffuseColor = new Color3(0.0, 0.4, 0.2);
    greenMat.emissiveColor = new Color3(0.0, 1.0, 0.5);

    const plasmaMat = new StandardMaterial('mat_hub_plasma', scene);
    plasmaMat.diffuseColor = new Color3(0.1, 0.8, 1.0);
    plasmaMat.emissiveColor = new Color3(0.2, 0.95, 1.0);
    plasmaMat.alpha = 0.88;

    const glassMat = new StandardMaterial('mat_hub_glass', scene);
    glassMat.diffuseColor = new Color3(0.1, 0.3, 0.4);
    glassMat.alpha = 0.35;

    // --- 1. Floor & Central Platform ---
    const floor = MeshBuilder.CreateDisc('hub_floor', { radius: 28, tessellation: 64 }, scene);
    floor.rotation.x = Math.PI / 2;
    floor.position.y = 0;
    floor.material = floorMat;
    floor.parent = root;

    const centralDais = MeshBuilder.CreateCylinder('hub_central_dais', { diameter: 11.0, height: 0.35, tessellation: 32 }, scene);
    centralDais.position.y = 0.175;
    centralDais.material = darkMetalMat;
    centralDais.parent = root;

    const daisRing = MeshBuilder.CreateTorus('hub_dais_ring', { diameter: 10.8, thickness: 0.12, tessellation: 48 }, scene);
    daisRing.position.y = 0.36;
    daisRing.material = cyanMat;
    daisRing.parent = root;

    // Glowing energy conduits
    [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].forEach((angle, idx) => {
      const conduit = MeshBuilder.CreateBox(`hub_conduit_${idx}`, { width: 0.45, height: 0.08, depth: 18.0 }, scene);
      conduit.rotation.y = angle;
      conduit.position = new Vector3(Math.sin(angle) * 14.5, 0.04, Math.cos(angle) * 14.5);
      conduit.material = cyanMat;
      conduit.parent = root;
    });

    // --- 2. Central Reactor Structure ---
    const reactorBase = MeshBuilder.CreateCylinder('hub_reactor_base', { diameterTop: 5.2, diameterBottom: 6.2, height: 1.6, tessellation: 32 }, scene);
    reactorBase.position.y = 1.15;
    reactorBase.material = darkMetalMat;
    reactorBase.parent = root;

    const plasmaCore = MeshBuilder.CreateCylinder('hub_plasma_core', { diameter: 2.2, height: 4.8, tessellation: 32 }, scene);
    plasmaCore.position.y = 3.6;
    plasmaCore.material = plasmaMat;
    plasmaCore.parent = root;

    const containmentGlass = MeshBuilder.CreateCylinder('hub_glass', { diameter: 3.4, height: 5.2, tessellation: 32 }, scene);
    containmentGlass.position.y = 3.6;
    containmentGlass.material = glassMat;
    containmentGlass.parent = root;

    const reactorCap = MeshBuilder.CreateCylinder('hub_cap', { diameterTop: 4.2, diameterBottom: 5.2, height: 1.4, tessellation: 32 }, scene);
    reactorCap.position.y = 6.6;
    reactorCap.material = darkMetalMat;
    reactorCap.parent = root;

    // Rotating containment rings
    [2.2, 3.6, 5.0].forEach((y, i) => {
      const ring = MeshBuilder.CreateTorus(`hub_ring_${i}`, { diameter: i === 1 ? 4.2 : 3.8, thickness: 0.22, tessellation: 36 }, scene);
      ring.position.y = y;
      ring.material = i === 1 ? amberMat : cyanMat;
      ring.parent = root;
      reactorRings.push(ring);
    });

    // 4 vertical stabilizer columns
    [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4].forEach((ang, i) => {
      const colX = Math.sin(ang) * 3.6;
      const colZ = Math.cos(ang) * 3.6;
      const col = MeshBuilder.CreateBox(`hub_column_${i}`, { width: 0.65, height: 7.2, depth: 0.65 }, scene);
      col.position = new Vector3(colX, 3.6, colZ);
      col.material = wallMat;
      col.parent = root;
    });

    circles.push({ x: 0, z: 0, radius: 3.8 });

    // --- 3. Perimeter Architecture with Sector Transit Gates ---
    const wallSegmentCount = 16;
    const wallRadius = 27.5;

    for (let i = 0; i < wallSegmentCount; i++) {
      const theta = (i / wallSegmentCount) * Math.PI * 2;
      const wallX = Math.sin(theta) * wallRadius;
      const wallZ = Math.cos(theta) * wallRadius;

      // Heavy industrial column
      const col = MeshBuilder.CreateBox(`hub_perim_${i}`, { width: 2.2, height: 9.0, depth: 2.2 }, scene);
      col.position = new Vector3(wallX, 4.5, wallZ);
      col.rotation.y = theta;
      col.material = wallMat;
      col.parent = root;

      const nextTheta = ((i + 1) / wallSegmentCount) * Math.PI * 2;
      const midTheta = (theta + nextTheta) / 2;
      const midX = Math.sin(midTheta) * (wallRadius + 0.5);
      const midZ = Math.cos(midTheta) * (wallRadius + 0.5);

      const panel = MeshBuilder.CreateBox(`hub_panel_${i}`, { width: 8.5, height: 8.5, depth: 0.8 }, scene);
      panel.position = new Vector3(midX, 4.25, midZ);
      panel.rotation.y = midTheta + Math.PI / 2;
      panel.material = darkMetalMat;
      panel.parent = root;
    }

    // --- 4. Three Sector Transit Gates (North, East, West) ---
    // Gate 1: North Transit Gate -> Equation Research Wing
    this.createTransitPortal(scene, root, 'gate_research_wing', new Vector3(0, 0, 25.5), 0, cyanMat, darkMetalMat, boxes);
    stations.push({
      id: 'gate_research_wing',
      missionNumber: 1,
      nameAr: 'بوابة العبور: جناح أبحاث المعادلات (القطاع 01)',
      category: 'equation',
      position: { x: 0, y: 1.0, z: 23.5 },
      descriptionAr: 'الانتقال المباشر إلى جناح أبحاث المعادلات الكيميائية وغرف التحليل المجهرية.',
      chemicalInfoAr: 'يتناول القطاع 01 تفسير المعادلات الكيميائية الموزونة ونسب الجسيمات والمولات (تفاعل أكسدة الحديد 4Fe + 3O2 -> 2Fe2O3).',
      equationFormula: '4Fe(s) + 3O2(g) -> 2Fe2O3(s)',
      isCompleted: false,
    });

    // Gate 2: East Airlock -> Mass Industrial Refinery
    this.createTransitPortal(scene, root, 'gate_refinery', new Vector3(25.5, 0, 0), -Math.PI / 2, amberMat, darkMetalMat, boxes);
    stations.push({
      id: 'gate_refinery',
      missionNumber: 2,
      nameAr: 'هويس العبور: مصفاة الكتلة الصناعية (القطاع 02)',
      category: 'mass_balance',
      position: { x: 23.5, y: 1.0, z: 0 },
      descriptionAr: 'الانتقال إلى منشأة التكرير الصناعية وموازين التحقق من قانون حفظ الكتلة.',
      chemicalInfoAr: 'يتناول القطاع 02 التحقق العملي من حفظ الكتلة عبر الكتل المولية (احتراق البروبان C3H8 + 5O2 -> 3CO2 + 4H2O) واشتقاق النسب المولية المتبادلة.',
      equationFormula: 'C3H8(g) + 5O2(g) -> 3CO2(g) + 4H2O(g)',
      isCompleted: false,
    });

    // Gate 3: West Blast Door -> Mole Ratio Vault
    this.createTransitPortal(scene, root, 'gate_vault', new Vector3(-25.5, 0, 0), Math.PI / 2, greenMat, darkMetalMat, boxes);
    stations.push({
      id: 'gate_vault',
      missionNumber: 4,
      nameAr: 'بوابة العزل الأمني: قبو النسب المولية (القطاع 03)',
      category: 'matrix',
      position: { x: -23.5, y: 1.0, z: 0 },
      descriptionAr: 'الانتقال إلى القبو السحيق ومصفوفة n(n-1) وغرفة معركة الزعيم الآلي والمفاعل الأخير.',
      chemicalInfoAr: 'يتناول القطاع 03 إتقان قانون عدد النسب المولية الموجهة n(n-1) واختراق درع الزعيم الآلي عبر حسابات احتراق البيوتان الشاملة.',
      equationFormula: '2C4H10(g) + 13O2(g) -> 8CO2(g) + 10H2O(g)',
      isCompleted: false,
    });

    // Gate 4: Dedicated Portal -> Stoichiometry Academy
    const purpleMat = new StandardMaterial('mat_hub_purple', scene);
    purpleMat.diffuseColor = new Color3(0.3, 0.0, 0.5);
    purpleMat.emissiveColor = new Color3(0.8, 0.2, 1.0);

    this.createTransitPortal(scene, root, 'gate_academy', new Vector3(16.5, 0, -16.5), -Math.PI / 4, purpleMat, darkMetalMat, boxes);
    stations.push({
      id: 'gate_academy',
      missionNumber: 0,
      nameAr: 'بوابة أكاديمية الحسابات الكيميائية (STOICHIOMETRY ACADEMY)',
      category: 'equation',
      position: { x: 15.0, y: 1.0, z: -15.0 },
      descriptionAr: 'الدخول إلى أكاديمية الحسابات الكيميائية: معرض النماذج الجزيئية 3D، غرف التدريب، وقاعة اختبارات التأهيل (20 سؤالاً).',
      chemicalInfoAr: 'الأكاديمية العلمية تتيح مراجعة العروض التوضيحية واجتياز اختبار التأهيل الإلزامي لفتح القطاعات التالية.',
      equationFormula: 'ACADEMY LEARNING FACILITY OPEN',
      isCompleted: true,
    });

    // --- 5. Interactive Command Terminals in Hub ---
    // A. Mission Briefing Hologram Terminal (South-Center)
    this.createConsoleWorkstation(scene, root, 'hub_briefing', new Vector3(0, 0, -9.0), 0, cyanMat, wallMat, darkMetalMat, boxes);
    stations.push({
      id: 'hub_briefing',
      missionNumber: 0,
      nameAr: 'محطة الإحاطة التكتيكية والاتصال الهولوغرافي',
      category: 'equation',
      position: { x: 0, y: 1.0, z: -9.0 },
      descriptionAr: 'مراجعة خريطة الأزمات في المنشأة والتواصل الهولوغرافي مع الدكتورة سارة لتحديد التوجيهات الحسابية.',
      chemicalInfoAr: 'المهمة الأساسية: السيطرة على قطاعات المنشأة عبر إتقان الحسابات الكيميائية وتثبيت مفاعل نقطة الصفر.',
      equationFormula: 'REACTIVITY INDEX: NORMALIZED',
      isCompleted: true,
    });

    // B. Sector Dispatch Console (South-West)
    this.createConsoleWorkstation(scene, root, 'hub_mission_dispatch', new Vector3(-6.5, 0, -6.5), Math.PI / 4, cyanMat, wallMat, darkMetalMat, boxes);
    stations.push({
      id: 'hub_mission_dispatch',
      missionNumber: 0,
      nameAr: 'شاشة خريطة الحملة وانتقال القطاعات',
      category: 'matrix',
      position: { x: -6.5, y: 1.0, z: -6.5 },
      descriptionAr: 'فتح خريطة المنشأة الشاملة واستعراض حالة القطاعات الأربعة والانتقال السريع للقطاع المطلوب.',
      chemicalInfoAr: 'خريطة القطاعات تتيح التنقل المباشر بين المقر الرئيسي والقطاعات المفتوحة ومتابعة الإنجاز العلمي.',
      equationFormula: 'SECTOR NAVIGATION MATRIX ACTIVE',
      isCompleted: true,
    });

    // C. Equipment & Armor Recharger Station (South-East)
    this.createConsoleWorkstation(scene, root, 'hub_equipment', new Vector3(6.5, 0, -6.5), -Math.PI / 4, greenMat, wallMat, darkMetalMat, boxes);
    stations.push({
      id: 'hub_equipment',
      missionNumber: 0,
      nameAr: 'محطة إعادة شحن البذلة ومعايرة العتاد',
      category: 'mole_hunt',
      position: { x: 6.5, y: 1.0, z: -6.5 },
      descriptionAr: 'استعادة كامل طاقة الدرع الكهروكيميائي وشحن مكثفات سلاح البلازما التكتيكي قبل الانطلاق للمهمات.',
      chemicalInfoAr: 'تستخدم البذلة طاقة الروابط الكيميائية المخزنة لتجديد الدروع وتبريد مصفوفة السلاح.',
      equationFormula: 'SYSTEMS: 100% OPERATIONAL',
      isCompleted: true,
    });

    // --- 6. Real 3D Assets ---
    // Damaged Helmet Artifact on Observation Pedestal
    const helmetPedestal = MeshBuilder.CreateCylinder('hub_helmet_pedestal', { diameter: 1.0, height: 1.0, tessellation: 24 }, scene);
    helmetPedestal.position = new Vector3(-6, 0.5, -12);
    helmetPedestal.material = darkMetalMat;
    helmetPedestal.parent = root;

    AssetManager.getInstance().loadAsset('damagedHelmet', scene).then(({ node }) => {
      node.position = new Vector3(-6, 1.25, -12);
      node.scaling.setAll(0.38);
      node.rotation.y = Math.PI * 0.25;
      node.parent = root;
    }).catch(() => {});

    // Animated Resource Crate (East storage bay)
    AssetManager.getInstance().loadAsset('resourceCrate', scene).then(({ node, animationGroups }) => {
      node.position = new Vector3(8.5, 0.05, 10.5);
      node.scaling.setAll(0.55);
      node.rotation.y = -Math.PI * 0.35;
      node.parent = root;
      if (animationGroups && animationGroups.length > 0) {
        animationGroups[0].play(true);
      }
    }).catch(() => {});

    // Animated Resource Crate (West storage bay)
    AssetManager.getInstance().loadAsset('resourceCrate', scene).then(({ node, animationGroups }) => {
      node.position = new Vector3(-8.5, 0.05, 10.5);
      node.scaling.setAll(0.5);
      node.rotation.y = Math.PI * 0.35;
      node.parent = root;
      if (animationGroups && animationGroups.length > 0) {
        animationGroups[0].play(true);
      }
    }).catch(() => {});

    // Real 3D Structural Columns around Central Reactor
    const columnOffsets = [
      { x: -7.5, z: -7.5 },
      { x: 7.5, z: -7.5 },
      { x: -7.5, z: 7.5 },
      { x: 7.5, z: 7.5 },
    ];
    columnOffsets.forEach((pos, idx) => {
      AssetManager.getInstance().loadAsset('structuralColumn', scene).then(({ node }) => {
        node.name = `hub_col_${idx}`;
        node.parent = root;
        node.position = new Vector3(pos.x, 0, pos.z);
        node.scaling.setAll(1.4);
      }).catch(() => {});
      circles.push({ x: pos.x, z: pos.z, radius: 1.1 });
    });

    // Real 3D Rotating Telemetry Radar Scanner
    AssetManager.getInstance().loadAsset('radarScanner', scene).then(({ node }) => {
      node.position = new Vector3(0, 5.8, -9.0);
      node.scaling.setAll(1.2);
      node.parent = root;
      scene.onBeforeRenderObservable.add(() => {
        node.rotation.y += 0.015;
      });
    }).catch(() => {});

    // Real 3D Telemetry Antenna Spire at Command Dispatch
    AssetManager.getInstance().loadAsset('antennaMast', scene).then(({ node }) => {
      node.position = new Vector3(-6.5, 1.2, -6.5);
      node.scaling.setAll(1.1);
      node.parent = root;
    }).catch(() => {});

    // Real 3D Modular Lab Equipment Unit (Equipment bay)
    AssetManager.getInstance().loadAsset('modularLabUnit', scene).then(({ node }) => {
      node.position = new Vector3(14, 0, 6);
      node.scaling.setAll(1.2);
      node.rotation.y = -Math.PI / 2;
      node.parent = root;
    }).catch(() => {});
    boxes.push({ minX: 12, maxX: 16, minZ: 4, maxZ: 8 });

    return {
      rootNode: root,
      circles,
      boxes,
      reactorRings,
      plasmaCore,
      mainLight: reactorLight,
      auxLights: [amberLight1, amberLight2],
      stations,
    };
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

    // Archway frame
    const archTop = MeshBuilder.CreateBox(`${name}_arch_top`, { width: 5.5, height: 0.8, depth: 1.4 }, scene);
    archTop.position.y = 5.2;
    archTop.material = frameMat;
    archTop.parent = portal;

    const postLeft = MeshBuilder.CreateBox(`${name}_post_l`, { width: 0.8, height: 5.4, depth: 1.4 }, scene);
    postLeft.position = new Vector3(-2.3, 2.7, 0);
    postLeft.material = frameMat;
    postLeft.parent = portal;

    const postRight = MeshBuilder.CreateBox(`${name}_post_r`, { width: 0.8, height: 5.4, depth: 1.4 }, scene);
    postRight.position = new Vector3(2.3, 2.7, 0);
    postRight.material = frameMat;
    postRight.parent = portal;

    // Glowing energy membrane
    const membrane = MeshBuilder.CreatePlane(`${name}_membrane`, { width: 3.8, height: 4.8 }, scene);
    membrane.position.y = 2.4;
    membrane.material = glowMat;
    membrane.parent = portal;

    // Platform step
    const step = MeshBuilder.CreateBox(`${name}_step`, { width: 4.2, height: 0.2, depth: 2.2 }, scene);
    step.position.y = 0.1;
    step.material = frameMat;
    step.parent = portal;

    // Collision boundary behind the portal
    boxes.push({
      minX: pos.x - 2.8,
      maxX: pos.x + 2.8,
      minZ: pos.z - 1.2,
      maxZ: pos.z + 1.2,
    });
  }

  private static createConsoleWorkstation(
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

    const desk = MeshBuilder.CreateBox(`${name}_desk`, { width: 2.6, height: 1.1, depth: 1.2 }, scene);
    desk.position.y = 0.55;
    desk.material = metalMat;
    desk.parent = station;

    const monitor = MeshBuilder.CreateBox(`${name}_screen`, { width: 2.0, height: 1.0, depth: 0.12 }, scene);
    monitor.position = new Vector3(0, 1.5, 0.25);
    monitor.rotation.x = -0.3;
    monitor.material = screenMat;
    monitor.parent = station;

    const holoDisc = MeshBuilder.CreateCylinder(`${name}_holo_emitter`, { diameter: 0.6, height: 0.05 }, scene);
    holoDisc.position = new Vector3(0, 1.13, 0.35);
    holoDisc.material = screenMat;
    holoDisc.parent = station;

    boxes.push({
      minX: pos.x - 1.4,
      maxX: pos.x + 1.4,
      minZ: pos.z - 0.8,
      maxZ: pos.z + 0.8,
    });
  }
}
