/**
 * LAB GUARDIAN - Location 3: Mass Industrial Refinery
 * Heavy chemical processing facility with elevated catwalks, distillation towers, and giant mechanical balance
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
} from '@babylonjs/core';
import { BoundingCircle, BoundingBox2D } from '../rules/gameRules';
import { InteractiveStation } from '../interaction/InteractionManager';
import { MapBuildResult } from './HubEnvironment';
import { AssetManager } from '../assets/AssetManager';

export class RefineryEnvironment {
  public static build(scene: Scene): MapBuildResult {
    const root = new TransformNode('refinery_environment', scene);
    const circles: BoundingCircle[] = [];
    const boxes: BoundingBox2D[] = [];
    const reactorRings: Mesh[] = [];
    const stations: InteractiveStation[] = [];

    // --- Atmospheric Industrial Amber & Deep Steel Lights ---
    const hemiLight = new HemisphericLight('ref_hemi_light', new Vector3(0, 1, 0), scene);
    hemiLight.diffuse = new Color3(0.28, 0.25, 0.22); // Industrial warm heavy hue
    hemiLight.groundColor = new Color3(0.06, 0.05, 0.04);
    hemiLight.intensity = 0.75;
    hemiLight.parent = root;

    const mainLight = new PointLight('ref_main_light', new Vector3(0, 5.5, 0), scene);
    mainLight.diffuse = new Color3(1.0, 0.65, 0.1); // Warm glowing amber illumination
    mainLight.intensity = 1.4;
    mainLight.range = 30;
    mainLight.parent = root;

    const conduitLight1 = new PointLight('ref_conduit_light1', new Vector3(-12, 4.0, 8), scene);
    conduitLight1.diffuse = new Color3(0.0, 0.85, 1.0); // Cyan coolant contrast
    conduitLight1.intensity = 0.9;
    conduitLight1.range = 18;
    conduitLight1.parent = root;

    const conduitLight2 = new PointLight('ref_conduit_light2', new Vector3(12, 4.0, -8), scene);
    conduitLight2.diffuse = new Color3(1.0, 0.5, 0.0);
    conduitLight2.intensity = 0.9;
    conduitLight2.range = 18;
    conduitLight2.parent = root;

    // --- Heavy Industrial Materials ---
    const gratingFloorMat = new StandardMaterial('mat_ref_grating', scene);
    gratingFloorMat.diffuseColor = new Color3(0.08, 0.09, 0.11);
    gratingFloorMat.specularColor = new Color3(0.4, 0.45, 0.5);

    const darkSteelMat = new StandardMaterial('mat_ref_steel', scene);
    darkSteelMat.diffuseColor = new Color3(0.07, 0.08, 0.1);
    darkSteelMat.specularColor = new Color3(0.5, 0.55, 0.6);

    const industrialOrangeMat = new StandardMaterial('mat_ref_orange', scene);
    industrialOrangeMat.diffuseColor = new Color3(0.7, 0.35, 0.05);
    industrialOrangeMat.specularColor = new Color3(0.3, 0.2, 0.1);

    const amberEmissiveMat = new StandardMaterial('mat_ref_amber_glow', scene);
    amberEmissiveMat.diffuseColor = new Color3(0.5, 0.25, 0.0);
    amberEmissiveMat.emissiveColor = new Color3(1.0, 0.6, 0.0);

    const cyanCoolantMat = new StandardMaterial('mat_ref_cyan_glow', scene);
    cyanCoolantMat.diffuseColor = new Color3(0.0, 0.3, 0.4);
    cyanCoolantMat.emissiveColor = new Color3(0.0, 0.9, 1.0);

    // --- 1. Floor & Catwalk Structure ---
    const floor = MeshBuilder.CreateBox('ref_floor', { width: 42, height: 0.2, depth: 42 }, scene);
    floor.position = new Vector3(0, -0.1, 0);
    floor.material = gratingFloorMat;
    floor.parent = root;

    // Outer Perimeter Walls
    const wallN = MeshBuilder.CreateBox('ref_wall_n', { width: 44, height: 7.0, depth: 1.4 }, scene);
    wallN.position = new Vector3(0, 3.5, 21);
    wallN.material = darkSteelMat;
    wallN.parent = root;
    boxes.push({ minX: -22, maxX: 22, minZ: 20, maxZ: 22 });

    const wallS = MeshBuilder.CreateBox('ref_wall_s', { width: 44, height: 7.0, depth: 1.4 }, scene);
    wallS.position = new Vector3(0, 3.5, -21);
    wallS.material = darkSteelMat;
    wallS.parent = root;
    boxes.push({ minX: -22, maxX: 22, minZ: -22, maxZ: -20 });

    const wallE = MeshBuilder.CreateBox('ref_wall_e', { width: 1.4, height: 7.0, depth: 44 }, scene);
    wallE.position = new Vector3(21, 3.5, 0);
    wallE.material = darkSteelMat;
    wallE.parent = root;
    boxes.push({ minX: 20, maxX: 22, minZ: -22, maxZ: 22 });

    const wallW = MeshBuilder.CreateBox('ref_wall_w', { width: 1.4, height: 7.0, depth: 44 }, scene);
    wallW.position = new Vector3(-21, 3.5, 0);
    wallW.material = darkSteelMat;
    wallW.parent = root;
    boxes.push({ minX: -22, maxX: -20, minZ: -22, maxZ: 22 });

    // --- 2. Central Mechanical Balance Monument (Conservation of Mass) ---
    // Monumental Dual-Pan Scale Structure representing mass equality: Reactants (204.1g) = Products (204.11g)
    const scaleFulcrum = MeshBuilder.CreateCylinder('ref_scale_fulcrum', { diameterTop: 1.2, diameterBottom: 2.6, height: 4.8, tessellation: 24 }, scene);
    scaleFulcrum.position = new Vector3(0, 2.4, 0);
    scaleFulcrum.material = industrialOrangeMat;
    scaleFulcrum.parent = root;
    circles.push({ x: 0, z: 0, radius: 1.8 });

    // Horizontal Balance Beam
    const scaleBeam = MeshBuilder.CreateBox('ref_scale_beam', { width: 12.0, height: 0.5, depth: 0.6 }, scene);
    scaleBeam.position = new Vector3(0, 4.8, 0);
    scaleBeam.material = darkSteelMat;
    scaleBeam.parent = root;

    // Reactant Pan (Left / West: 204.1g)
    const panLeft = MeshBuilder.CreateCylinder('ref_pan_left', { diameter: 3.2, height: 0.35, tessellation: 24 }, scene);
    panLeft.position = new Vector3(-5.2, 2.2, 0);
    panLeft.material = darkSteelMat;
    panLeft.parent = root;

    const panGlowL = MeshBuilder.CreateTorus('ref_pan_glow_l', { diameter: 3.0, thickness: 0.1, tessellation: 24 }, scene);
    panGlowL.position = new Vector3(-5.2, 2.4, 0);
    panGlowL.material = amberEmissiveMat;
    panGlowL.parent = root;
    circles.push({ x: -5.2, z: 0, radius: 1.8 });

    // Product Pan (Right / East: 204.11g)
    const panRight = MeshBuilder.CreateCylinder('ref_pan_right', { diameter: 3.2, height: 0.35, tessellation: 24 }, scene);
    panRight.position = new Vector3(5.2, 2.2, 0);
    panRight.material = darkSteelMat;
    panRight.parent = root;

    const panGlowR = MeshBuilder.CreateTorus('ref_pan_glow_r', { diameter: 3.0, thickness: 0.1, tessellation: 24 }, scene);
    panGlowR.position = new Vector3(5.2, 2.4, 0);
    panGlowR.material = cyanCoolantMat;
    panGlowR.parent = root;
    circles.push({ x: 5.2, z: 0, radius: 1.8 });

    // Central Balance Scale Interactive Terminal
    this.createIndustrialConsole(
      scene,
      root,
      'station_m3b_balance_scale',
      new Vector3(0, 0, -4.5),
      0,
      amberEmissiveMat,
      darkSteelMat,
      boxes
    );
    stations.push({
      id: 'station_m3b_balance_scale',
      missionNumber: 2,
      nameAr: 'منصة ميزان الكتلة المركزي: التحقق من كفتي التفاعل',
      category: 'mass_balance',
      position: { x: 0, y: 1.0, z: -4.5 },
      descriptionAr: 'معايرة ميزان الكتلة الميكانيكي وإثبات التوازن الدقيق بين كتلتي المتفاعلات والنواتج.',
      chemicalInfoAr: 'قانون حفظ الكتلة: كتلة المتفاعلات (204.1 جم) تتساوى تماماً مع كتلة النواتج (204.11 جم). الميزان متكافئ تماماً.',
      equationFormula: 'C3H8(44.1g) + 5O2(160.0g) -> 3CO2(132.03g) + 4H2O(72.08g)',
      isCompleted: false,
    });

    // --- 3. Sector A: Propane Combustion Manifold (East, z = -10) ---
    // Distillation Towers
    [10, 14].forEach((tx, i) => {
      const tower = MeshBuilder.CreateCylinder(`ref_tower_${i}`, { diameter: 2.8, height: 8.5, tessellation: 24 }, scene);
      tower.position = new Vector3(tx, 4.25, -12);
      tower.material = darkSteelMat;
      tower.parent = root;

      const ring = MeshBuilder.CreateTorus(`ref_tower_ring_${i}`, { diameter: 3.0, thickness: 0.15, tessellation: 24 }, scene);
      ring.position = new Vector3(tx, 5.0, -12);
      ring.material = amberEmissiveMat;
      ring.parent = root;

      circles.push({ x: tx, z: -12, radius: 1.7 });
    });

    // Interactive Station M2: Propane Mass Calculations
    this.createIndustrialConsole(
      scene,
      root,
      'station_m2_mass_balance',
      new Vector3(12, 0, -6),
      Math.PI,
      amberEmissiveMat,
      darkSteelMat,
      boxes
    );
    stations.push({
      id: 'station_m2_mass_balance',
      missionNumber: 2,
      nameAr: 'المحطة 2: ميزان حفظ الكتلة (احتراق البروبان)',
      category: 'mass_balance',
      position: { x: 12, y: 1.0, z: -6 },
      descriptionAr: 'حساب كتل المتفاعلات والنواتج بالجرام والتحقق الرياضي من قانون حفظ الكتلة.',
      chemicalInfoAr: 'الكتلة الكلية للمواد المتفاعلة تساوي دائماً الكتلة الكلية للمواد الناتجة في أي تفاعل كيميائي.',
      equationFormula: 'C3H8(g) + 5O2(g) -> 3CO2(g) + 4H2O(g)',
      isCompleted: false,
    });

    // --- 4. Sector B: Potassium Bromide Crystallizer Bay (West, z = 10) ---
    // Pressure Conduits & Tanks
    [-11, -15].forEach((tx, i) => {
      const tank = MeshBuilder.CreateCylinder(`ref_tank_${i}`, { diameter: 2.6, height: 6.0, tessellation: 20 }, scene);
      tank.position = new Vector3(tx, 3.0, 10);
      tank.material = darkSteelMat;
      tank.parent = root;

      circles.push({ x: tx, z: 10, radius: 1.5 });
    });

    // Interactive Station M3: Potassium Bromide Mole Ratios
    this.createIndustrialConsole(
      scene,
      root,
      'station_m3_mole_hunt',
      new Vector3(-13, 0, 4.5),
      0,
      cyanCoolantMat,
      darkSteelMat,
      boxes
    );
    stations.push({
      id: 'station_m3_mole_hunt',
      missionNumber: 3,
      nameAr: 'المحطة 3: صائد النسب المولية (تفاعل بروميد البوتاسيوم)',
      category: 'mole_hunt',
      position: { x: -13, y: 1.0, z: 4.5 },
      descriptionAr: 'اشتقاق النسب المولية المباشرة والمقلوبة بين البوتاسيوم والبروم 2K + Br2 -> 2KBr.',
      chemicalInfoAr: 'النسبة المولية K / Br2 هي 2/1 = 2، وعند عكس النسبة تصبح 1/2 = 0.5.',
      equationFormula: '2K(s) + Br2(l) -> 2KBr(s)',
      isCompleted: false,
    });

    // --- 5. Transit Elevator Back to Hub (North, z = 18) ---
    this.createTransitPortal(
      scene,
      root,
      'transit_hub_refinery',
      new Vector3(0, 0, 18.5),
      Math.PI,
      amberEmissiveMat,
      darkSteelMat,
      boxes
    );
    stations.push({
      id: 'transit_hub_refinery',
      missionNumber: 0,
      nameAr: 'مصعد الشحن الصناعي: العودة إلى المقر الرئيسي (HUB)',
      category: 'matrix',
      position: { x: 0, y: 1.0, z: 17.0 },
      descriptionAr: 'استخدام مصعد المواد الثقيلة للعودة إلى المختبر المركزي بعد إكمال حسابات الكتلة.',
      chemicalInfoAr: 'العودة للمقر تتيح إعادة التزود بالطاقة والاستعداد لفتح قبو المفاعل السفلي.',
      equationFormula: 'CARGO ELEVATOR READY',
      isCompleted: true,
    });

    // Entrance portal from Hub (South-West arrival: x = -16, z = -16)
    this.createTransitPortal(
      scene,
      root,
      'transit_refinery_entrance',
      new Vector3(-16, 0, -18.5),
      0,
      amberEmissiveMat,
      darkSteelMat,
      boxes
    );
    stations.push({
      id: 'transit_refinery_entrance',
      missionNumber: 0,
      nameAr: 'هويس الوصول: العودة إلى المقر الرئيسي',
      category: 'matrix',
      position: { x: -16, y: 1.0, z: -17.0 },
      descriptionAr: 'العودة عبر هويس الضغط إلى المختبر المركزي.',
      chemicalInfoAr: 'هويس الضغط الهيدروليكي يؤمن النقل المباشر للمقر.',
      equationFormula: 'TRANSIT SYSTEM READY',
      isCompleted: true,
    });

    // Overhead Structural Crane Girders
    for (let x = -16; x <= 16; x += 8) {
      const girder = MeshBuilder.CreateBox(`ref_girder_${x}`, { width: 0.8, height: 0.8, depth: 42 }, scene);
      girder.position = new Vector3(x, 6.8, 0);
      girder.material = industrialOrangeMat;
      girder.parent = root;
    }

    // Real 3D Asset: Animated Resource Crates at cargo dock
    AssetManager.getInstance().loadAsset('resourceCrate', scene).then(({ node, animationGroups }) => {
      node.position = new Vector3(-8, 0.05, -14);
      node.scaling.setAll(0.55);
      node.rotation.y = Math.PI * 0.25;
      node.parent = root;
      if (animationGroups && animationGroups.length > 0) {
        animationGroups[0].play(true);
      }
    }).catch(() => {});

    AssetManager.getInstance().loadAsset('resourceCrate', scene).then(({ node, animationGroups }) => {
      node.position = new Vector3(8, 0.05, 14);
      node.scaling.setAll(0.5);
      node.rotation.y = -Math.PI * 0.45;
      node.parent = root;
      if (animationGroups && animationGroups.length > 0) {
        animationGroups[0].play(true);
      }
    }).catch(() => {});

    // Real 3D Khronos Mechanical Dual-Piston Engine (Conservation of Mass calibration core)
    AssetManager.getInstance().loadAsset('refineryEngine', scene).then(({ node, animationGroups }) => {
      node.position = new Vector3(0, 0.4, 2.5);
      node.scaling.setAll(0.016);
      node.parent = root;
      if (animationGroups && animationGroups.length > 0) {
        animationGroups[0].play(true);
      }
    }).catch(() => {});
    boxes.push({ minX: -2.0, maxX: 2.0, minZ: 1.0, maxZ: 4.0 });

    // Real 3D Khronos Heavy Industrial Gearbox Assembly (East reactant processing dock)
    AssetManager.getInstance().loadAsset('refineryGearbox', scene).then(({ node }) => {
      node.position = new Vector3(12, 0.2, 8);
      node.scaling.setAll(0.045);
      node.rotation.y = -Math.PI / 4;
      node.parent = root;
    }).catch(() => {});
    boxes.push({ minX: 10, maxX: 14, minZ: 6, maxZ: 10 });

    // Real 3D Quaternius Chemical Reactant Silos
    const siloLocations = [
      { x: -14, z: -8 },
      { x: -14, z: 8 },
      { x: 14, z: -14 },
    ];
    siloLocations.forEach((loc, idx) => {
      AssetManager.getInstance().loadAsset('refinerySilo', scene).then(({ node }) => {
        node.name = `ref_silo_inst_${idx}`;
        node.parent = root;
        node.position = new Vector3(loc.x, 0, loc.z);
        node.scaling.setAll(2.0);
      }).catch(() => {});
      circles.push({ x: loc.x, z: loc.z, radius: 2.2 });
    });

    // Real 3D Heavy Mobile Transport Crane Rover (Cargo loading bay)
    AssetManager.getInstance().loadAsset('industrialCraneRover', scene).then(({ node }) => {
      node.position = new Vector3(-10, 0, -14);
      node.scaling.setAll(1.4);
      node.rotation.y = Math.PI * 0.4;
      node.parent = root;
    }).catch(() => {});
    boxes.push({ minX: -12.5, maxX: -7.5, minZ: -16.0, maxZ: -12.0 });

    // Real 3D Industrial Catwalk Stairs & Access Ramp
    AssetManager.getInstance().loadAsset('catwalkStairs', scene).then(({ node }) => {
      node.name = 'ref_catwalk_stairs';
      node.parent = root;
      node.position = new Vector3(8, 0, -2);
      node.scaling.setAll(1.6);
      node.rotation.y = -Math.PI / 2;
    }).catch(() => {});

    AssetManager.getInstance().loadAsset('industrialRamp', scene).then(({ node }) => {
      node.name = 'ref_access_ramp';
      node.parent = root;
      node.position = new Vector3(-8, 0, -2);
      node.scaling.setAll(1.6);
      node.rotation.y = Math.PI / 2;
    }).catch(() => {});

    // Real 3D Heavy Structural Columns supporting overhead crane girders
    const refColOffsets = [
      { x: -16, z: -16 },
      { x: 16, z: -16 },
      { x: -16, z: 16 },
      { x: 16, z: 16 },
    ];
    refColOffsets.forEach((pos, idx) => {
      AssetManager.getInstance().loadAsset('structuralColumn', scene).then(({ node }) => {
        node.name = `ref_col_${idx}`;
        node.parent = root;
        node.position = new Vector3(pos.x, 0, pos.z);
        node.scaling.setAll(1.8);
      }).catch(() => {});
      circles.push({ x: pos.x, z: pos.z, radius: 1.2 });
    });

    return {
      rootNode: root,
      circles,
      boxes,
      reactorRings,
      plasmaCore: null,
      mainLight,
      auxLights: [conduitLight1, conduitLight2],
      stations,
    };
  }

  private static createIndustrialConsole(
    scene: Scene,
    root: TransformNode,
    name: string,
    pos: Vector3,
    rotY: number,
    screenMat: StandardMaterial,
    metalMat: StandardMaterial,
    boxes: BoundingBox2D[]
  ): void {
    const station = new TransformNode(name, scene);
    station.position = pos;
    station.rotation.y = rotY;
    station.parent = root;

    const desk = MeshBuilder.CreateBox(`${name}_desk`, { width: 2.8, height: 1.1, depth: 1.3 }, scene);
    desk.position.y = 0.55;
    desk.material = metalMat;
    desk.parent = station;

    const monitor = MeshBuilder.CreateBox(`${name}_screen`, { width: 2.2, height: 1.1, depth: 0.15 }, scene);
    monitor.position = new Vector3(0, 1.5, 0.25);
    monitor.rotation.x = -0.25;
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

    const archTop = MeshBuilder.CreateBox(`${name}_arch_top`, { width: 5.4, height: 0.8, depth: 1.3 }, scene);
    archTop.position.y = 5.2;
    archTop.material = frameMat;
    archTop.parent = portal;

    const postLeft = MeshBuilder.CreateBox(`${name}_post_l`, { width: 0.8, height: 5.2, depth: 1.3 }, scene);
    postLeft.position = new Vector3(-2.3, 2.6, 0);
    postLeft.material = frameMat;
    postLeft.parent = portal;

    const postRight = MeshBuilder.CreateBox(`${name}_post_r`, { width: 0.8, height: 5.2, depth: 1.3 }, scene);
    postRight.position = new Vector3(2.3, 2.6, 0);
    postRight.material = frameMat;
    postRight.parent = portal;

    const membrane = MeshBuilder.CreatePlane(`${name}_membrane`, { width: 3.8, height: 4.6 }, scene);
    membrane.position.y = 2.3;
    membrane.material = glowMat;
    membrane.parent = portal;

    boxes.push({
      minX: pos.x - 2.6,
      maxX: pos.x + 2.6,
      minZ: pos.z - 1.1,
      maxZ: pos.z + 1.1,
    });
  }
}
