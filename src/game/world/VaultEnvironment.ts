/**
 * LAB GUARDIAN - Location 4: Mole Ratio Vault (Sub-Reactor Boss Arena)
 * Underground experimental vault with n(n-1) matrix data bank, massive subterranean reactor, and Boss arena
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

export class VaultEnvironment {
  public static build(scene: Scene): MapBuildResult {
    const root = new TransformNode('vault_environment', scene);
    const circles: BoundingCircle[] = [];
    const boxes: BoundingBox2D[] = [];
    const reactorRings: Mesh[] = [];
    const stations: InteractiveStation[] = [];

    // --- Atmospheric Dark Purple & High-Energy Electric Violet Lights ---
    const hemiLight = new HemisphericLight('vault_hemi_light', new Vector3(0, 1, 0), scene);
    hemiLight.diffuse = new Color3(0.22, 0.15, 0.35); // Deep subterranean cosmic purple
    hemiLight.groundColor = new Color3(0.04, 0.02, 0.08);
    hemiLight.intensity = 0.8;
    hemiLight.parent = root;

    const mainLight = new PointLight('vault_reactor_light', new Vector3(0, 4.0, 8), scene);
    mainLight.diffuse = new Color3(0.7, 0.2, 1.0); // Vibrant plasma purple
    mainLight.intensity = 1.6;
    mainLight.range = 35;
    mainLight.parent = root;

    const bossLight = new PointLight('vault_boss_light', new Vector3(0, 5.0, 10), scene);
    bossLight.diffuse = new Color3(1.0, 0.0, 0.45); // Hostile crimson-magenta
    bossLight.intensity = 1.1;
    bossLight.range = 24;
    bossLight.parent = root;

    const matrixLight = new PointLight('vault_matrix_light', new Vector3(-12, 3.5, -6), scene);
    matrixLight.diffuse = new Color3(0.0, 0.95, 1.0); // Bright cyan data glow
    matrixLight.intensity = 0.9;
    matrixLight.range = 18;
    matrixLight.parent = root;

    // --- Specialized Materials ---
    const abyssFloorMat = new StandardMaterial('mat_vault_floor', scene);
    abyssFloorMat.diffuseColor = new Color3(0.05, 0.04, 0.09);
    abyssFloorMat.specularColor = new Color3(0.3, 0.2, 0.5);

    const darkBasaltMat = new StandardMaterial('mat_vault_basalt', scene);
    darkBasaltMat.diffuseColor = new Color3(0.04, 0.03, 0.07);
    darkBasaltMat.specularColor = new Color3(0.2, 0.15, 0.3);

    const purpleGlowMat = new StandardMaterial('mat_vault_purple_glow', scene);
    purpleGlowMat.diffuseColor = new Color3(0.5, 0.1, 0.8);
    purpleGlowMat.emissiveColor = new Color3(0.75, 0.15, 1.0);

    const cyanGlowMat = new StandardMaterial('mat_vault_cyan_glow', scene);
    cyanGlowMat.diffuseColor = new Color3(0.0, 0.3, 0.5);
    cyanGlowMat.emissiveColor = new Color3(0.0, 0.95, 1.0);

    const magentaGlowMat = new StandardMaterial('mat_vault_magenta_glow', scene);
    magentaGlowMat.diffuseColor = new Color3(0.6, 0.0, 0.3);
    magentaGlowMat.emissiveColor = new Color3(1.0, 0.0, 0.5);

    const plasmaCoreMat = new StandardMaterial('mat_vault_plasma', scene);
    plasmaCoreMat.diffuseColor = new Color3(0.6, 0.1, 1.0);
    plasmaCoreMat.emissiveColor = new Color3(0.8, 0.2, 1.0);
    plasmaCoreMat.alpha = 0.9;

    // --- 1. Floor Layout: Dual Arena connected by Bridge over Abyss ---
    // Sector A: Arrival & Data Matrix Vault Floor (South: z = -14, size 26 x 18)
    const southPlat = MeshBuilder.CreateBox('vault_south_plat', { width: 28, height: 0.3, depth: 18 }, scene);
    southPlat.position = new Vector3(0, -0.15, -14);
    southPlat.material = abyssFloorMat;
    southPlat.parent = root;

    // Connecting Reinforced Energy Bridge (width 6, length 12)
    const bridge = MeshBuilder.CreateBox('vault_bridge', { width: 6.4, height: 0.3, depth: 12 }, scene);
    bridge.position = new Vector3(0, -0.15, 0);
    bridge.material = darkBasaltMat;
    bridge.parent = root;

    // Glowing Bridge Edge Conduits
    [-3.2, 3.2].forEach((bx, i) => {
      const rail = MeshBuilder.CreateBox(`vault_bridge_rail_${i}`, { width: 0.2, height: 1.1, depth: 12 }, scene);
      rail.position = new Vector3(bx, 0.45, 0);
      rail.material = purpleGlowMat;
      rail.parent = root;
    });

    // Sector B: Final Boss Combat Dais (North: z = 10, circular diameter 24m)
    const bossDais = MeshBuilder.CreateCylinder('vault_boss_dais', { diameter: 24, height: 0.35, tessellation: 48 }, scene);
    bossDais.position = new Vector3(0, -0.1, 10);
    bossDais.material = abyssFloorMat;
    bossDais.parent = root;

    const daisOuterRing = MeshBuilder.CreateTorus('vault_dais_ring', { diameter: 23.6, thickness: 0.18, tessellation: 48 }, scene);
    daisOuterRing.position = new Vector3(0, 0.1, 10);
    daisOuterRing.material = magentaGlowMat;
    daisOuterRing.parent = root;

    // --- 2. Subterranean Sub-Reactor & Containment Rings ---
    const reactorCore = MeshBuilder.CreateCylinder('vault_reactor_core', { diameter: 3.2, height: 6.0, tessellation: 32 }, scene);
    reactorCore.position = new Vector3(0, 3.0, 10);
    reactorCore.material = plasmaCoreMat;
    reactorCore.parent = root;

    // 3 Sub-Reactor Electromagnetic Rings
    [1.8, 3.2, 4.6].forEach((y, i) => {
      const ring = MeshBuilder.CreateTorus(`vault_sub_ring_${i}`, { diameter: i === 1 ? 5.4 : 4.8, thickness: 0.24, tessellation: 36 }, scene);
      ring.position = new Vector3(0, y, 10);
      ring.material = i === 1 ? cyanGlowMat : purpleGlowMat;
      ring.parent = root;
      reactorRings.push(ring);
    });

    // 4 Heavy Fortified Blast Pylons around Boss Arena
    [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4].forEach((ang, i) => {
      const px = Math.sin(ang) * 9.5;
      const pz = 10 + Math.cos(ang) * 9.5;

      const pylon = MeshBuilder.CreateBox(`vault_pylon_${i}`, { width: 1.8, height: 8.0, depth: 1.8 }, scene);
      pylon.position = new Vector3(px, 4.0, pz);
      pylon.material = darkBasaltMat;
      pylon.parent = root;

      const stripe = MeshBuilder.CreateBox(`vault_pylon_stripe_${i}`, { width: 0.25, height: 7.5, depth: 1.85 }, scene);
      stripe.position = new Vector3(px, 4.0, pz);
      stripe.material = purpleGlowMat;
      stripe.parent = root;

      boxes.push({
        minX: px - 1.2,
        maxX: px + 1.2,
        minZ: pz - 1.2,
        maxZ: pz + 1.2,
      });
    });

    circles.push({ x: 0, z: 10, radius: 2.8 });

    // --- 3. Perimeter Cavern Barriers ---
    // South Wall
    const wallS = MeshBuilder.CreateBox('vault_wall_s', { width: 30, height: 7.0, depth: 1.5 }, scene);
    wallS.position = new Vector3(0, 3.5, -23.5);
    wallS.material = darkBasaltMat;
    wallS.parent = root;
    boxes.push({ minX: -15, maxX: 15, minZ: -24.5, maxZ: -22.5 });

    // West Wall
    const wallW = MeshBuilder.CreateBox('vault_wall_w', { width: 1.5, height: 7.0, depth: 48 }, scene);
    wallW.position = new Vector3(-15, 3.5, 0);
    wallW.material = darkBasaltMat;
    wallW.parent = root;
    boxes.push({ minX: -16, maxX: -14, minZ: -24, maxZ: 24 });

    // East Wall
    const wallE = MeshBuilder.CreateBox('vault_wall_e', { width: 1.5, height: 7.0, depth: 48 }, scene);
    wallE.position = new Vector3(15, 3.5, 0);
    wallE.material = darkBasaltMat;
    wallE.parent = root;
    boxes.push({ minX: 14, maxX: 16, minZ: -24, maxZ: 24 });

    // North Wall (Behind Boss Dais)
    const wallN = MeshBuilder.CreateBox('vault_wall_n', { width: 30, height: 7.0, depth: 1.5 }, scene);
    wallN.position = new Vector3(0, 3.5, 23.5);
    wallN.material = darkBasaltMat;
    wallN.parent = root;
    boxes.push({ minX: -15, maxX: 15, minZ: 22.5, maxZ: 24.5 });

    // --- 4. Interactive Station M4: n(n-1) Matrix Bank (South-West) ---
    this.createVaultTerminal(
      scene,
      root,
      'station_m4_matrix',
      new Vector3(-9.5, 0, -12),
      Math.PI / 4,
      cyanGlowMat,
      darkBasaltMat,
      boxes
    );
    stations.push({
      id: 'station_m4_matrix',
      missionNumber: 4,
      nameAr: 'المحطة 4: مصفوفة النسب المولية n(n-1)',
      category: 'matrix',
      position: { x: -9.5, y: 1.0, z: -12 },
      descriptionAr: 'تطبيق القانون الرياضي n(n - 1) لحساب إجمالي عدد النسب المولية الموجهة في التفاعلات المتعددة.',
      chemicalInfoAr: 'عدد النسب المولية التي يمكن كتابتها لتفاعل يحتوي على n من المواد يعطى بالعلاقة n(n - 1). إذا كانت 3 مواد فإنها 6 نسب، وإذا 4 مواد فإنها 12 نسبة.',
      equationFormula: '4Al(s) + 3O2(g) -> 2Al2O3(s) [n = 3] & C3H8 + 5O2 -> 3CO2 + 4H2O [n = 4]',
      isCompleted: false,
    });

    // --- 5. Interactive Station M5: Butane Combustion Reactor Core (In Boss Arena) ---
    this.createVaultTerminal(
      scene,
      root,
      'station_m5_boss',
      new Vector3(0, 0, 5.0),
      0,
      magentaGlowMat,
      darkBasaltMat,
      boxes
    );
    stations.push({
      id: 'station_m5_boss',
      missionNumber: 5,
      nameAr: 'المحطة 5: وحدة فك درع المفاعل ومعايرة البيوتان',
      category: 'boss_reactor',
      position: { x: 0, y: 1.0, z: 5.0 },
      descriptionAr: 'إنجاز حسابات احتراق البيوتان الكمية لتعطيل درع الزعيم وإحكام استقرار قلب المفاعل السفلي.',
      chemicalInfoAr: 'الحسابات المتكافئة الشاملة تمكننا من تحديد كميات النواتج المتوقعة بدقة عبر ضرب مولات المادة المعطاة في النسبة المولية المناسبة.',
      equationFormula: '2C4H10(g) + 13O2(g) -> 8CO2(g) + 10H2O(g)',
      isCompleted: false,
    });

    // --- 6. Return Transit Gate & Extraction Portal (South: z = -20) ---
    this.createTransitPortal(
      scene,
      root,
      'transit_hub_vault',
      new Vector3(0, 0, -21.0),
      0,
      purpleGlowMat,
      darkBasaltMat,
      boxes
    );
    stations.push({
      id: 'transit_hub_vault',
      missionNumber: 0,
      nameAr: 'بوابة العبور الآمنة: العودة إلى المقر الرئيسي (HUB)',
      category: 'matrix',
      position: { x: 0, y: 1.0, z: -19.5 },
      descriptionAr: 'استخدام بوابة النقل اللحظي للعودة إلى المختبر المركزي.',
      chemicalInfoAr: 'تتيح البوابة الانسحاب التكتيكي وإعادة شحن البذلة أو الاحتفال بنصر الحملة.',
      equationFormula: 'QUANTUM GATEWAY ONLINE',
      isCompleted: true,
    });

    // Real 3D Asset: Animated Tactical Resource Crate on Arrival Platform
    AssetManager.getInstance().loadAsset('resourceCrate', scene).then(({ node, animationGroups }) => {
      node.position = new Vector3(8.5, 0.05, -14);
      node.scaling.setAll(0.55);
      node.rotation.y = Math.PI * 0.35;
      node.parent = root;
      if (animationGroups && animationGroups.length > 0) {
        animationGroups[0].play(true);
      }
    }).catch(() => {});

    // Quad Energy Capacitor Pylons guarding the Boss Arena
    const pylonCoords = [
      { x: -7, z: -2 },
      { x: 7, z: -2 },
      { x: -7, z: 10 },
      { x: 7, z: 10 },
    ];
    pylonCoords.forEach((pt, i) => {
      const pylon = MeshBuilder.CreateCylinder(`vlt_pylon_${i}`, { diameterTop: 0.6, diameterBottom: 1.0, height: 4.5, tessellation: 16 }, scene);
      pylon.position = new Vector3(pt.x, 2.25, pt.z);
      pylon.material = darkBasaltMat;
      pylon.parent = root;

      const pylonCap = MeshBuilder.CreateSphere(`vlt_pylon_cap_${i}`, { diameter: 0.8 }, scene);
      pylonCap.position = new Vector3(pt.x, 4.6, pt.z);
      pylonCap.material = purpleGlowMat;
      pylonCap.parent = root;

      circles.push({ x: pt.x, z: pt.z, radius: 0.8 });
    });

    // Real 3D Structural Columns around Vault Arena Perimeter
    const vltColOffsets = [
      { x: -10, z: 4 },
      { x: 10, z: 4 },
      { x: -10, z: 16 },
      { x: 10, z: 16 },
    ];
    vltColOffsets.forEach((pos, idx) => {
      AssetManager.getInstance().loadAsset('structuralColumn', scene).then(({ node }) => {
        node.name = `vlt_col_${idx}`;
        node.parent = root;
        node.position = new Vector3(pos.x, 0, pos.z);
        node.scaling.setAll(1.9);
      }).catch(() => {});
      circles.push({ x: pos.x, z: pos.z, radius: 1.2 });
    });

    // Real 3D Rotating Telemetry Radar Scanner above n(n-1) Data Bank
    AssetManager.getInstance().loadAsset('radarScanner', scene).then(({ node }) => {
      node.position = new Vector3(-12, 4.8, -6);
      node.scaling.setAll(1.3);
      node.parent = root;
      scene.onBeforeRenderObservable.add(() => {
        node.rotation.y += 0.018;
      });
    }).catch(() => {});

    // Real 3D Sub-Reactor Containment Machinery
    AssetManager.getInstance().loadAsset('refineryGearbox', scene).then(({ node }) => {
      node.position = new Vector3(0, 0.2, 17.5);
      node.scaling.setAll(0.04);
      node.rotation.y = Math.PI;
      node.parent = root;
    }).catch(() => {});
    boxes.push({ minX: -2.5, maxX: 2.5, minZ: 16.0, maxZ: 19.0 });

    // Real 3D Quantum Gateway Archway Frame
    AssetManager.getInstance().loadAsset('modularCorridor', scene).then(({ node }) => {
      node.name = 'vlt_portal_arch';
      node.parent = root;
      node.position = new Vector3(0, 0, -20.5);
      node.scaling.setAll(1.5);
    }).catch(() => {});

    return {
      rootNode: root,
      circles,
      boxes,
      reactorRings,
      plasmaCore: reactorCore,
      mainLight,
      auxLights: [bossLight, matrixLight],
      stations,
    };
  }

  private static createVaultTerminal(
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

    const holoDisc = MeshBuilder.CreateCylinder(`${name}_holo_emitter`, { diameter: 0.7, height: 0.06 }, scene);
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

    const archTop = MeshBuilder.CreateBox(`${name}_arch_top`, { width: 5.6, height: 0.9, depth: 1.4 }, scene);
    archTop.position.y = 5.2;
    archTop.material = frameMat;
    archTop.parent = portal;

    const postLeft = MeshBuilder.CreateBox(`${name}_post_l`, { width: 0.9, height: 5.2, depth: 1.4 }, scene);
    postLeft.position = new Vector3(-2.35, 2.6, 0);
    postLeft.material = frameMat;
    postLeft.parent = portal;

    const postRight = MeshBuilder.CreateBox(`${name}_post_r`, { width: 0.9, height: 5.2, depth: 1.4 }, scene);
    postRight.position = new Vector3(2.35, 2.6, 0);
    postRight.material = frameMat;
    postRight.parent = portal;

    const membrane = MeshBuilder.CreatePlane(`${name}_membrane`, { width: 3.8, height: 4.6 }, scene);
    membrane.position.y = 2.3;
    membrane.material = glowMat;
    membrane.parent = portal;

    boxes.push({
      minX: pos.x - 2.8,
      maxX: pos.x + 2.8,
      minZ: pos.z - 1.2,
      maxZ: pos.z + 1.2,
    });
  }
}
