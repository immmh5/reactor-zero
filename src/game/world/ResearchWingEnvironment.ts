/**
 * LAB GUARDIAN - Location 2: Equation Research Wing
 * Advanced experimental complex with glass reaction vessels, molecular holograms, and analysis chambers
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

export class ResearchWingEnvironment {
  public static build(scene: Scene): MapBuildResult {
    const root = new TransformNode('research_wing_environment', scene);
    const circles: BoundingCircle[] = [];
    const boxes: BoundingBox2D[] = [];
    const reactorRings: Mesh[] = [];
    const stations: InteractiveStation[] = [];

    // --- Atmospheric Clean White & Cyan Lights ---
    const hemiLight = new HemisphericLight('rw_hemi_light', new Vector3(0, 1, 0), scene);
    hemiLight.diffuse = new Color3(0.35, 0.42, 0.55); // Crisp surgical clean illumination
    hemiLight.groundColor = new Color3(0.08, 0.1, 0.15);
    hemiLight.intensity = 0.85;
    hemiLight.parent = root;

    const mainLight = new PointLight('rw_central_light', new Vector3(0, 4.5, 0), scene);
    mainLight.diffuse = new Color3(0.0, 0.95, 1.0);
    mainLight.intensity = 1.3;
    mainLight.range = 26;
    mainLight.parent = root;

    const labLight1 = new PointLight('rw_lab1_light', new Vector3(-10, 3.8, 6), scene);
    labLight1.diffuse = new Color3(0.1, 0.8, 0.9);
    labLight1.intensity = 0.9;
    labLight1.range = 16;
    labLight1.parent = root;

    const labLight2 = new PointLight('rw_lab2_light', new Vector3(10, 3.8, -6), scene);
    labLight2.diffuse = new Color3(0.0, 1.0, 0.6);
    labLight2.intensity = 0.9;
    labLight2.range = 16;
    labLight2.parent = root;

    // --- High-Tech Clean Materials ---
    const floorMat = new StandardMaterial('mat_rw_floor', scene);
    floorMat.diffuseColor = new Color3(0.12, 0.16, 0.22);
    floorMat.specularColor = new Color3(0.35, 0.45, 0.6);

    const wallWhiteMat = new StandardMaterial('mat_rw_wall_white', scene);
    wallWhiteMat.diffuseColor = new Color3(0.2, 0.26, 0.35);
    wallWhiteMat.specularColor = new Color3(0.3, 0.4, 0.5);

    const darkTrimMat = new StandardMaterial('mat_rw_dark_trim', scene);
    darkTrimMat.diffuseColor = new Color3(0.05, 0.08, 0.12);
    darkTrimMat.specularColor = new Color3(0.4, 0.5, 0.6);

    const glassMat = new StandardMaterial('mat_rw_glass', scene);
    glassMat.diffuseColor = new Color3(0.1, 0.35, 0.5);
    glassMat.alpha = 0.38;

    const cyanGlowMat = new StandardMaterial('mat_rw_cyan_glow', scene);
    cyanGlowMat.diffuseColor = new Color3(0.0, 0.4, 0.5);
    cyanGlowMat.emissiveColor = new Color3(0.0, 0.95, 1.0);

    const greenGlowMat = new StandardMaterial('mat_rw_green_glow', scene);
    greenGlowMat.diffuseColor = new Color3(0.0, 0.4, 0.2);
    greenGlowMat.emissiveColor = new Color3(0.0, 1.0, 0.5);

    const reagentOrangeMat = new StandardMaterial('mat_rw_reagent_orange', scene);
    reagentOrangeMat.diffuseColor = new Color3(0.8, 0.3, 0.0);
    reagentOrangeMat.emissiveColor = new Color3(1.0, 0.45, 0.0);
    reagentOrangeMat.alpha = 0.85;

    // --- 1. Floor Plan (Navigable T-Shape Layout) ---
    // Central research atrium floor (32 x 44)
    const floor = MeshBuilder.CreateBox('rw_floor', { width: 34, height: 0.2, depth: 46 }, scene);
    floor.position = new Vector3(0, -0.1, 0);
    floor.material = floorMat;
    floor.parent = root;

    // Grid Floor Inlays (clean luminous floor paths)
    for (let z = -18; z <= 18; z += 6) {
      const line = MeshBuilder.CreateBox(`rw_floor_grid_${z}`, { width: 28, height: 0.02, depth: 0.15 }, scene);
      line.position = new Vector3(0, 0.01, z);
      line.material = cyanGlowMat;
      line.parent = root;
    }

    // --- 2. Perimeter Walls ---
    // South Wall (Entrance)
    const wallS1 = MeshBuilder.CreateBox('rw_wall_s1', { width: 14, height: 6.5, depth: 1.2 }, scene);
    wallS1.position = new Vector3(-9.5, 3.25, -22.5);
    wallS1.material = wallWhiteMat;
    wallS1.parent = root;
    boxes.push({ minX: -17, maxX: -2, minZ: -23.5, maxZ: -21.5 });

    const wallS2 = MeshBuilder.CreateBox('rw_wall_s2', { width: 14, height: 6.5, depth: 1.2 }, scene);
    wallS2.position = new Vector3(9.5, 3.25, -22.5);
    wallS2.material = wallWhiteMat;
    wallS2.parent = root;
    boxes.push({ minX: 2, maxX: 17, minZ: -23.5, maxZ: -21.5 });

    // North Wall (Extraction & Exit)
    const wallN = MeshBuilder.CreateBox('rw_wall_n', { width: 34, height: 6.5, depth: 1.2 }, scene);
    wallN.position = new Vector3(0, 3.25, 22.5);
    wallN.material = wallWhiteMat;
    wallN.parent = root;
    boxes.push({ minX: -17, maxX: 17, minZ: 21.5, maxZ: 23.5 });

    // West Wall
    const wallW = MeshBuilder.CreateBox('rw_wall_w', { width: 1.2, height: 6.5, depth: 46 }, scene);
    wallW.position = new Vector3(-16.5, 3.25, 0);
    wallW.material = wallWhiteMat;
    wallW.parent = root;
    boxes.push({ minX: -17.5, maxX: -15.5, minZ: -23, maxZ: 23 });

    // East Wall
    const wallE = MeshBuilder.CreateBox('rw_wall_e', { width: 1.2, height: 6.5, depth: 46 }, scene);
    wallE.position = new Vector3(16.5, 3.25, 0);
    wallE.material = wallWhiteMat;
    wallE.parent = root;
    boxes.push({ minX: 15.5, maxX: 17.5, minZ: -23, maxZ: 23 });

    // --- 3. Interior Partition Walls & Specialized Chambers ---
    // Chamber A Partition (East - Chemical Synthesis Lab)
    const partE = MeshBuilder.CreateBox('rw_part_e', { width: 1.0, height: 5.5, depth: 18 }, scene);
    partE.position = new Vector3(5.5, 2.75, -8);
    partE.material = wallWhiteMat;
    partE.parent = root;
    boxes.push({ minX: 4.8, maxX: 6.2, minZ: -17, maxZ: 1 });

    // Chamber B Partition (West - Molecular Analysis Lab)
    const partW = MeshBuilder.CreateBox('rw_part_w', { width: 1.0, height: 5.5, depth: 18 }, scene);
    partW.position = new Vector3(-5.5, 2.75, 8);
    partW.material = wallWhiteMat;
    partW.parent = root;
    boxes.push({ minX: -6.2, maxX: -4.8, minZ: -1, maxZ: 17 });

    // --- 4. Room 1: Chemical Synthesis Lab (East) ---
    // Glass Reagent Containment Vessel Tower
    const reagentVessel = MeshBuilder.CreateCylinder('rw_reagent_vessel', { diameter: 2.2, height: 4.5, tessellation: 24 }, scene);
    reagentVessel.position = new Vector3(11, 2.25, -12);
    reagentVessel.material = glassMat;
    reagentVessel.parent = root;

    const reagentCore = MeshBuilder.CreateCylinder('rw_reagent_core', { diameter: 1.6, height: 3.8, tessellation: 24 }, scene);
    reagentCore.position = new Vector3(11, 2.0, -12);
    reagentCore.material = reagentOrangeMat;
    reagentCore.parent = root;
    circles.push({ x: 11, z: -12, radius: 1.5 });

    // Laboratory Benches
    const bench1 = MeshBuilder.CreateBox('rw_bench_1', { width: 4.5, height: 1.0, depth: 1.4 }, scene);
    bench1.position = new Vector3(11, 0.5, -4);
    bench1.material = darkTrimMat;
    bench1.parent = root;
    boxes.push({ minX: 8.5, maxX: 13.5, minZ: -4.9, maxZ: -3.1 });

    // Interactive Station M1: Equation Interpretation (Iron Oxidation)
    this.createResearchTerminal(
      scene,
      root,
      'station_m1_equation',
      new Vector3(11, 0, -8),
      -Math.PI / 2,
      cyanGlowMat,
      wallWhiteMat,
      darkTrimMat,
      boxes
    );
    stations.push({
      id: 'station_m1_equation',
      missionNumber: 1,
      nameAr: 'المحطة 1: تفسير المعادلات الكيميائية (أكسدة الحديد)',
      category: 'equation',
      position: { x: 11, y: 1.0, z: -8 },
      descriptionAr: 'تفسير نسب المولات والجسيمات الممثلة في معادلة أكسدة الحديد المتزنة 4Fe + 3O2 -> 2Fe2O3.',
      chemicalInfoAr: 'المعاملات في المعادلة الكيميائية الموزونة تمثل أعداد الجسيمات الممثلة (ذرات، جزيئات، وحدات صيغة) وكذلك نسب المولات.',
      equationFormula: '4Fe(s) + 3O2(g) -> 2Fe2O3(s)',
      isCompleted: false,
    });

    // --- 5. Room 2: Molecular Analysis Lab (West) ---
    // Central Holographic Molecular Model
    const holoPedestal = MeshBuilder.CreateCylinder('rw_holo_pedestal', { diameter: 2.2, height: 0.8, tessellation: 24 }, scene);
    holoPedestal.position = new Vector3(-11, 0.4, 6);
    holoPedestal.material = darkTrimMat;
    holoPedestal.parent = root;

    // Molecular model nodes (Fe2O3 cluster simulation)
    const molCenter = MeshBuilder.CreateSphere('rw_mol_center', { diameter: 0.9, segments: 16 }, scene);
    molCenter.position = new Vector3(-11, 2.2, 6);
    molCenter.material = reagentOrangeMat;
    molCenter.parent = root;

    [-0.8, 0.8].forEach((ox, i) => {
      const atom = MeshBuilder.CreateSphere(`rw_mol_atom_${i}`, { diameter: 0.65, segments: 14 }, scene);
      atom.position = new Vector3(-11 + ox, 2.6, 6 + (i === 0 ? -0.5 : 0.5));
      atom.material = cyanGlowMat;
      atom.parent = root;
    });
    circles.push({ x: -11, z: 6, radius: 1.6 });

    // Interactive Station M1B: Aluminum Oxide Practice
    this.createResearchTerminal(
      scene,
      root,
      'station_m1b_practice',
      new Vector3(-11, 0, 11),
      Math.PI,
      greenGlowMat,
      wallWhiteMat,
      darkTrimMat,
      boxes
    );
    stations.push({
      id: 'station_m1b_practice',
      missionNumber: 1,
      nameAr: 'وحدة التحليل الإضافية: أكسيد الألومنيوم المتزن',
      category: 'equation',
      position: { x: -11, y: 1.0, z: 11 },
      descriptionAr: 'معايرة تفاعل تكوين أكسيد الألومنيوم 4Al + 3O2 -> 2Al2O3 وتأكيد نسب المعاملات.',
      chemicalInfoAr: 'كل 4 مولات من الألومنيوم تتفاعل مع 3 مولات من غاز الأكسجين لإنتاج مولين من أكسيد الألومنيوم الصلب.',
      equationFormula: '4Al(s) + 3O2(g) -> 2Al2O3(s)',
      isCompleted: false,
    });

    // --- 6. Room 3: Security & Extraction Airlock (North) ---
    // Exit elevator / return portal to Hub
    this.createTransitPortal(
      scene,
      root,
      'transit_hub_research',
      new Vector3(0, 0, 19.5),
      Math.PI,
      cyanGlowMat,
      darkTrimMat,
      boxes
    );
    stations.push({
      id: 'transit_hub_research',
      missionNumber: 0,
      nameAr: 'مصعد النقل السريع: العودة إلى المقر الرئيسي (HUB)',
      category: 'matrix',
      position: { x: 0, y: 1.0, z: 18.0 },
      descriptionAr: 'استخدام المصعد الأمني للعودة المباشرة إلى المختبر المركزي بعد إنهاء الأهداف.',
      chemicalInfoAr: 'العودة للمقر تتيح إعادة التزود بالطاقة واختيار القطاع الصناعي التالي.',
      equationFormula: 'RETURN TRANSIT ACTIVE',
      isCompleted: true,
    });

    // Entrance gate back to hub at South
    this.createTransitPortal(
      scene,
      root,
      'transit_hub_entrance',
      new Vector3(0, 0, -21.5),
      0,
      cyanGlowMat,
      darkTrimMat,
      boxes
    );
    stations.push({
      id: 'transit_hub_entrance',
      missionNumber: 0,
      nameAr: 'بوابة الخروج الجنوبي: العودة إلى المقر',
      category: 'matrix',
      position: { x: 0, y: 1.0, z: -20.0 },
      descriptionAr: 'العودة عبر بوابة العزل الهوائي إلى المختبر المركزي.',
      chemicalInfoAr: 'بوابة العزل الهوائي تؤمن الاتصال بالمقر المركزي.',
      equationFormula: 'AIRLOCK READY',
      isCompleted: true,
    });

    // Ceiling Beams
    for (let z = -18; z <= 18; z += 9) {
      const beam = MeshBuilder.CreateBox(`rw_beam_${z}`, { width: 34, height: 0.5, depth: 0.8 }, scene);
      beam.position = new Vector3(0, 6.2, z);
      beam.material = darkTrimMat;
      beam.parent = root;
    }

    // Real 3D Asset: Damaged Operative Helmet Artifact on Research Specimen Pedestal
    const helmetPedestal = MeshBuilder.CreateCylinder('rw_helmet_pedestal', { diameter: 1.1, height: 1.0, tessellation: 24 }, scene);
    helmetPedestal.position = new Vector3(-11, 0.5, -4);
    helmetPedestal.material = darkTrimMat;
    helmetPedestal.parent = root;
    boxes.push({ minX: -11.8, maxX: -10.2, minZ: -4.8, maxZ: -3.2 });

    AssetManager.getInstance().loadAsset('damagedHelmet', scene).then(({ node }) => {
      node.position = new Vector3(-11, 1.25, -4);
      node.scaling.setAll(0.38);
      node.rotation.y = -Math.PI * 0.35;
      node.parent = root;
    }).catch(() => {});

    // Real 3D Asset: Chemical Supply Resource Crate in East Lab Alcove
    AssetManager.getInstance().loadAsset('resourceCrate', scene).then(({ node, animationGroups }) => {
      node.position = new Vector3(11, 0.05, -16.5);
      node.scaling.setAll(0.55);
      node.rotation.y = Math.PI * 0.2;
      node.parent = root;
      if (animationGroups && animationGroups.length > 0) {
        animationGroups[0].play(true);
      }
    }).catch(() => {});
    boxes.push({ minX: 10.2, maxX: 11.8, minZ: -17.3, maxZ: -15.7 });

    // Detailed Chemical Apparatus: Centrifuge Drum & Reagent Tube Rack
    const centrifuge = MeshBuilder.CreateCylinder('rw_centrifuge', { diameter: 1.4, height: 0.9, tessellation: 20 }, scene);
    centrifuge.position = new Vector3(-11, 0.45, 0);
    centrifuge.material = darkTrimMat;
    centrifuge.parent = root;

    const cfRotor = MeshBuilder.CreateTorus('rw_cf_rotor', { diameter: 1.1, thickness: 0.08, tessellation: 20 }, scene);
    cfRotor.position = new Vector3(-11, 0.92, 0);
    cfRotor.material = greenGlowMat;
    cfRotor.parent = root;
    scene.onBeforeRenderObservable.add(() => {
      cfRotor.rotation.y += 0.05;
    });
    boxes.push({ minX: -11.9, maxX: -10.1, minZ: -0.9, maxZ: 0.9 });

    // Reagent Tube Racks (4 glowing test vials on bench)
    [-0.3, -0.1, 0.1, 0.3].forEach((xOff, i) => {
      const tube = MeshBuilder.CreateCylinder(`rw_vial_${i}`, { diameter: 0.08, height: 0.45, tessellation: 12 }, scene);
      tube.position = new Vector3(11 + xOff, 1.25, -4);
      tube.material = i % 2 === 0 ? cyanGlowMat : reagentOrangeMat;
      tube.parent = root;
    });

    // Real 3D Modular Clean-Room Research Bays (East & West)
    AssetManager.getInstance().loadAsset('modularLabUnit', scene).then(({ node }) => {
      node.name = 'rw_cleanroom_east';
      node.position = new Vector3(12, 0, 8);
      node.scaling.setAll(1.4);
      node.rotation.y = -Math.PI / 2;
      node.parent = root;
    }).catch(() => {});

    AssetManager.getInstance().loadAsset('modularLabUnit', scene).then(({ node }) => {
      node.name = 'rw_cleanroom_west';
      node.position = new Vector3(-12, 0, -10);
      node.scaling.setAll(1.4);
      node.rotation.y = Math.PI / 2;
      node.parent = root;
    }).catch(() => {});
    boxes.push({ minX: 10, maxX: 15, minZ: 6, maxZ: 10 });
    boxes.push({ minX: -15, maxX: -10, minZ: -12, maxZ: -8 });

    // Real 3D Structural Truss Columns framing Central Research Corridor
    const rwColPositions = [
      { x: -4.5, z: -14 },
      { x: 4.5, z: -14 },
      { x: -4.5, z: 0 },
      { x: 4.5, z: 0 },
      { x: -4.5, z: 14 },
      { x: 4.5, z: 14 },
    ];
    rwColPositions.forEach((pos, idx) => {
      AssetManager.getInstance().loadAsset('structuralColumn', scene).then(({ node }) => {
        node.name = `rw_truss_${idx}`;
        node.position = new Vector3(pos.x, 0, pos.z);
        node.scaling.setAll(1.5);
        node.parent = root;
      }).catch(() => {});
      circles.push({ x: pos.x, z: pos.z, radius: 0.9 });
    });

    // Real 3D Overhead Airflow Filtration Ventilation Ducts
    [-10, 0, 10].forEach((zPos, idx) => {
      AssetManager.getInstance().loadAsset('ventilationDuct', scene).then(({ node }) => {
        node.name = `rw_vent_l_${idx}`;
        node.position = new Vector3(-8, 5.2, zPos);
        node.scaling.setAll(1.5);
        node.parent = root;
      }).catch(() => {});
      AssetManager.getInstance().loadAsset('ventilationDuct', scene).then(({ node }) => {
        node.name = `rw_vent_r_${idx}`;
        node.position = new Vector3(8, 5.2, zPos);
        node.scaling.setAll(1.5);
        node.rotation.y = Math.PI;
        node.parent = root;
      }).catch(() => {});
    });

    // Real 3D Modular Corridor Airway at South Entrance & North Exit
    AssetManager.getInstance().loadAsset('modularCorridor', scene).then(({ node }) => {
      node.name = 'rw_airway_south';
      node.position = new Vector3(0, 0, -22.5);
      node.scaling.setAll(1.4);
      node.parent = root;
    }).catch(() => {});
    AssetManager.getInstance().loadAsset('modularCorridor', scene).then(({ node }) => {
      node.name = 'rw_airway_north';
      node.position = new Vector3(0, 0, 21.0);
      node.scaling.setAll(1.4);
      node.rotation.y = Math.PI;
      node.parent = root;
    }).catch(() => {});

    // Real 3D Rotating Molecular Telemetry Radar Scanner
    AssetManager.getInstance().loadAsset('radarScanner', scene).then(({ node }) => {
      node.position = new Vector3(0, 5.8, 0);
      node.scaling.setAll(1.3);
      node.parent = root;
      scene.onBeforeRenderObservable.add(() => {
        node.rotation.y += 0.02;
      });
    }).catch(() => {});

    return {
      rootNode: root,
      circles,
      boxes,
      reactorRings,
      plasmaCore: null,
      mainLight,
      auxLights: [labLight1, labLight2],
      stations,
    };
  }

  private static createResearchTerminal(
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

    const holoDisc = MeshBuilder.CreateCylinder(`${name}_holo_emitter`, { diameter: 0.6, height: 0.05 }, scene);
    holoDisc.position = new Vector3(0, 1.13, 0.35);
    holoDisc.material = screenMat;
    holoDisc.parent = station;

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
    membrane.material = glowMat;
    membrane.parent = portal;

    boxes.push({
      minX: pos.x - 2.5,
      maxX: pos.x + 2.5,
      minZ: pos.z - 1.0,
      maxZ: pos.z + 1.0,
    });
  }
}
