/**
 * LAB GUARDIAN - 3D Laboratory Environment Builder
 * Constructs a futuristic sci-fi research facility with the central Reactor Zero
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
  Animation,
} from '@babylonjs/core';
import { BoundingCircle, BoundingBox2D } from '../rules/gameRules';
import { GAME_CONFIG } from '../config/gameConfig';
import { AssetManager } from '../assets/AssetManager';

export interface EnvironmentBuildResult {
  rootNode: TransformNode;
  circles: BoundingCircle[];
  boxes: BoundingBox2D[];
  reactorRings: Mesh[];
  plasmaCore: Mesh;
  reactorLight: PointLight;
  amberLights: PointLight[];
}

export class EnvironmentBuilder {
  public static build(scene: Scene): EnvironmentBuildResult {
    const root = new TransformNode('laboratory_environment', scene);
    const circles: BoundingCircle[] = [];
    const boxes: BoundingBox2D[] = [];
    const reactorRings: Mesh[] = [];

    // Enable cinematic bloom/glow for emissive conduits and reactor
    const glowLayer = new GlowLayer('lab_glow', scene);
    glowLayer.intensity = 0.85;

    // --- Atmospheric Lights ---
    // 1. Ambient laboratory ceiling light
    const hemiLight = new HemisphericLight('lab_hemi_light', new Vector3(0, 1, 0), scene);
    hemiLight.diffuse = new Color3(0.18, 0.25, 0.4); // Cool deep slate blue
    hemiLight.groundColor = new Color3(0.04, 0.06, 0.12);
    hemiLight.intensity = 0.75;

    // 2. Central Reactor Core Cyan Light
    const reactorLight = new PointLight('reactor_core_light', new Vector3(0, 3.5, 0), scene);
    reactorLight.diffuse = new Color3(0.0, 0.9, 1.0);
    reactorLight.specular = new Color3(0.1, 0.8, 1.0);
    reactorLight.intensity = 1.4;
    reactorLight.range = 28;

    // 3. Amber Hazard Auxiliary Lights
    const amberLight1 = new PointLight('amber_light_1', new Vector3(-12, 4.0, -8), scene);
    amberLight1.diffuse = new Color3(1.0, 0.65, 0.1);
    amberLight1.intensity = 0.8;
    amberLight1.range = 16;

    const amberLight2 = new PointLight('amber_light_2', new Vector3(12, 4.0, 8), scene);
    amberLight2.diffuse = new Color3(1.0, 0.65, 0.1);
    amberLight2.intensity = 0.8;
    amberLight2.range = 16;

    // --- Shared Materials ---
    // Floor Material (dark metallic composite)
    const floorMat = new StandardMaterial('mat_floor', scene);
    floorMat.diffuseColor = new Color3(0.06, 0.09, 0.16);
    floorMat.specularColor = new Color3(0.2, 0.3, 0.45);

    // Wall Material (reinforced naval titanium)
    const wallMat = new StandardMaterial('mat_wall', scene);
    wallMat.diffuseColor = new Color3(0.09, 0.13, 0.22);
    wallMat.specularColor = new Color3(0.15, 0.22, 0.35);

    // Heavy Trim Material
    const darkMetalMat = new StandardMaterial('mat_dark_metal', scene);
    darkMetalMat.diffuseColor = new Color3(0.03, 0.05, 0.09);
    darkMetalMat.specularColor = new Color3(0.3, 0.35, 0.4);

    // Cyan Emissive Material (energy pipes, terminal screens)
    const cyanEmissiveMat = new StandardMaterial('mat_cyan_emissive', scene);
    cyanEmissiveMat.diffuseColor = new Color3(0.0, 0.3, 0.4);
    cyanEmissiveMat.emissiveColor = new Color3(0.0, 0.92, 1.0);

    // Amber Emissive Material (warning stripes, status monitors)
    const amberEmissiveMat = new StandardMaterial('mat_amber_emissive', scene);
    amberEmissiveMat.diffuseColor = new Color3(0.4, 0.2, 0.0);
    amberEmissiveMat.emissiveColor = new Color3(1.0, 0.6, 0.0);

    // Reactor Plasma Core Material (luminous pulsating cyan)
    const plasmaMat = new StandardMaterial('mat_plasma', scene);
    plasmaMat.diffuseColor = new Color3(0.1, 0.8, 1.0);
    plasmaMat.emissiveColor = new Color3(0.2, 0.95, 1.0);
    plasmaMat.alpha = 0.88;

    // Glass / Containment Tube Material
    const glassMat = new StandardMaterial('mat_containment_glass', scene);
    glassMat.diffuseColor = new Color3(0.1, 0.3, 0.4);
    glassMat.alpha = 0.35;

    // --- 1. Floor & Raised Platforms ---
    const floor = MeshBuilder.CreateDisc(
      'main_floor',
      { radius: GAME_CONFIG.WORLD.ARENA_RADIUS, tessellation: 64 },
      scene
    );
    floor.rotation.x = Math.PI / 2;
    floor.position.y = 0;
    floor.material = floorMat;
    floor.parent = root;

    // Central circular dais under reactor
    const centralDais = MeshBuilder.CreateCylinder(
      'central_dais',
      { diameter: 11.0, height: 0.35, tessellation: 32 },
      scene
    );
    centralDais.position.y = 0.175;
    centralDais.material = darkMetalMat;
    centralDais.parent = root;

    // Outer glow ring on central platform
    const daisRing = MeshBuilder.CreateTorus(
      'dais_ring',
      { diameter: 10.8, thickness: 0.12, tessellation: 48 },
      scene
    );
    daisRing.position.y = 0.36;
    daisRing.material = cyanEmissiveMat;
    daisRing.parent = root;

    // Glowing energy conduits on the floor radiating out from reactor to 4 quadrants
    const conduitDirs = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
    conduitDirs.forEach((angle, idx) => {
      const conduit = MeshBuilder.CreateBox(
        `floor_conduit_${idx}`,
        { width: 0.45, height: 0.08, depth: 18.0 },
        scene
      );
      conduit.rotation.y = angle;
      conduit.position = new Vector3(
        Math.sin(angle) * 14.5,
        0.04,
        Math.cos(angle) * 14.5
      );
      conduit.material = cyanEmissiveMat;
      conduit.parent = root;
    });

    // --- 2. Central Reactor Zero Structure ---
    // Reactor base pedestal
    const reactorBase = MeshBuilder.CreateCylinder(
      'reactor_base',
      { diameterTop: 5.2, diameterBottom: 6.2, height: 1.6, tessellation: 32 },
      scene
    );
    reactorBase.position.y = 0.8 + 0.35;
    reactorBase.material = darkMetalMat;
    reactorBase.parent = root;

    // Reactor Core Plasma Cylinder
    const plasmaCore = MeshBuilder.CreateCylinder(
      'reactor_plasma_core',
      { diameter: 2.2, height: 4.8, tessellation: 32 },
      scene
    );
    plasmaCore.position.y = 3.6;
    plasmaCore.material = plasmaMat;
    plasmaCore.parent = root;

    // Outer Containment Glass Tube
    const containmentGlass = MeshBuilder.CreateCylinder(
      'containment_glass',
      { diameter: 3.4, height: 5.2, tessellation: 32 },
      scene
    );
    containmentGlass.position.y = 3.6;
    containmentGlass.material = glassMat;
    containmentGlass.parent = root;

    // Reactor Upper Coil Cap
    const reactorCap = MeshBuilder.CreateCylinder(
      'reactor_cap',
      { diameterTop: 4.2, diameterBottom: 5.2, height: 1.4, tessellation: 32 },
      scene
    );
    reactorCap.position.y = 6.6;
    reactorCap.material = darkMetalMat;
    reactorCap.parent = root;

    // 3 Rotating Electromagnetic Containment Rings around Core
    const ringYOffsets = [2.2, 3.6, 5.0];
    const ringRadii = [3.8, 4.2, 3.8];
    ringYOffsets.forEach((y, i) => {
      const ring = MeshBuilder.CreateTorus(
        `reactor_ring_${i}`,
        { diameter: ringRadii[i], thickness: 0.22, tessellation: 36 },
        scene
      );
      ring.position.y = y;
      ring.material = i === 1 ? amberEmissiveMat : cyanEmissiveMat;
      ring.parent = root;
      reactorRings.push(ring);
    });

    // 4 Vertical Heavy Stabilizer Columns around Reactor
    const pillarAngles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];
    pillarAngles.forEach((ang, i) => {
      const colX = Math.sin(ang) * 3.6;
      const colZ = Math.cos(ang) * 3.6;
      const col = MeshBuilder.CreateBox(
        `reactor_column_${i}`,
        { width: 0.65, height: 7.2, depth: 0.65 },
        scene
      );
      col.position = new Vector3(colX, 3.6, colZ);
      col.material = wallMat;
      col.parent = root;

      // Emissive energy stripe on each column
      const stripe = MeshBuilder.CreateBox(
        `column_stripe_${i}`,
        { width: 0.12, height: 6.8, depth: 0.67 },
        scene
      );
      stripe.position = new Vector3(colX, 3.6, colZ);
      stripe.material = cyanEmissiveMat;
      stripe.parent = root;
    });

    // Register reactor collision (circular radius 3.8)
    circles.push({ x: 0, z: 0, radius: 3.8 });

    // --- 3. Perimeter Walls & Arched Structural Columns ---
    const wallSegmentCount = 16;
    const wallRadius = GAME_CONFIG.WORLD.ARENA_RADIUS - 0.5;

    for (let i = 0; i < wallSegmentCount; i++) {
      const theta = (i / wallSegmentCount) * Math.PI * 2;
      const wallX = Math.sin(theta) * wallRadius;
      const wallZ = Math.cos(theta) * wallRadius;

      // Heavy industrial column
      const col = MeshBuilder.CreateBox(
        `perimeter_col_${i}`,
        { width: 2.2, height: 9.0, depth: 2.2 },
        scene
      );
      col.position = new Vector3(wallX, 4.5, wallZ);
      col.rotation.y = theta;
      col.material = wallMat;
      col.parent = root;

      // Wall panel between columns
      const nextTheta = ((i + 1) / wallSegmentCount) * Math.PI * 2;
      const midTheta = (theta + nextTheta) / 2;
      const midX = Math.sin(midTheta) * (wallRadius + 0.5);
      const midZ = Math.cos(midTheta) * (wallRadius + 0.5);

      const panel = MeshBuilder.CreateBox(
        `wall_panel_${i}`,
        { width: 8.5, height: 8.5, depth: 0.8 },
        scene
      );
      panel.position = new Vector3(midX, 4.25, midZ);
      panel.rotation.y = midTheta + Math.PI / 2;
      panel.material = darkMetalMat;
      panel.parent = root;

      // Emissive accent trim on panel
      const trim = MeshBuilder.CreateBox(
        `wall_trim_${i}`,
        { width: 7.8, height: 0.15, depth: 0.85 },
        scene
      );
      trim.position = new Vector3(midX, 4.5, midZ);
      trim.rotation.y = midTheta + Math.PI / 2;
      trim.material = i % 2 === 0 ? cyanEmissiveMat : amberEmissiveMat;
      trim.parent = root;
    }

    // --- 4. Interactive Workstations & Consoles ---

    // A. Central Reactor Console Station (North/Front)
    this.createConsoleWorkstation(
      scene,
      root,
      'console_reactor',
      new Vector3(0, 0, -6.5),
      0,
      cyanEmissiveMat,
      wallMat,
      darkMetalMat,
      boxes
    );

    // B. Coolant Cryogenic Station (West)
    this.createCoolantStation(
      scene,
      root,
      'station_coolant',
      new Vector3(-9.5, 0, -3.5),
      Math.PI / 3,
      cyanEmissiveMat,
      wallMat,
      darkMetalMat,
      circles,
      boxes
    );

    // C. Isotope Calibration Synthesizer (East)
    this.createIsotopeStation(
      scene,
      root,
      'station_isotopes',
      new Vector3(9.5, 0, -3.5),
      -Math.PI / 3,
      amberEmissiveMat,
      wallMat,
      darkMetalMat,
      circles,
      boxes
    );

    // D. Magnetic Containment Shield Station (South-West)
    this.createContainmentStation(
      scene,
      root,
      'station_containment',
      new Vector3(-7.5, 0, 9.0),
      (2 * Math.PI) / 3,
      cyanEmissiveMat,
      wallMat,
      darkMetalMat,
      boxes
    );

    // E. Chemistry Knowledge Database Station (South-East)
    this.createConsoleWorkstation(
      scene,
      root,
      'station_database',
      new Vector3(7.5, 0, 9.0),
      (-2 * Math.PI) / 3,
      cyanEmissiveMat,
      wallMat,
      darkMetalMat,
      boxes
    );

    // --- 5. Ceiling Truss Framework ---
    for (let c = -18; c <= 18; c += 9) {
      const beam = MeshBuilder.CreateBox(
        `ceiling_beam_${c}`,
        { width: 48.0, height: 0.6, depth: 0.8 },
        scene
      );
      beam.position = new Vector3(0, 8.5, c);
      beam.material = darkMetalMat;
      beam.parent = root;
    }

    // --- Real 3D Asset Props Integration ---
    // 1. Damaged Operative Helmet Artifact on Laboratory Pedestal
    const helmetPedestal = MeshBuilder.CreateCylinder('helmet_pedestal', { diameter: 1.0, height: 1.0, tessellation: 24 }, scene);
    helmetPedestal.position = new Vector3(-6, 0.5, -12);
    helmetPedestal.material = darkMetalMat;
    helmetPedestal.parent = root;

    AssetManager.getInstance().loadAsset('damagedHelmet', scene).then(({ node }) => {
      node.position = new Vector3(-6, 1.25, -12);
      node.scaling.setAll(0.38);
      node.rotation.y = Math.PI * 0.25;
      node.parent = root;
    }).catch(() => {});

    // 2. Animated Tactical Resource Crate in East Storage Bay
    AssetManager.getInstance().loadAsset('resourceCrate', scene).then(({ node, animationGroups }) => {
      node.position = new Vector3(8.5, 0.05, 10.5);
      node.scaling.setAll(0.55);
      node.rotation.y = -Math.PI * 0.35;
      node.parent = root;
      if (animationGroups && animationGroups.length > 0) {
        animationGroups[0].play(true);
      }
    }).catch(() => {});

    return {
      rootNode: root,
      circles,
      boxes,
      reactorRings,
      plasmaCore,
      reactorLight,
      amberLights: [amberLight1, amberLight2],
    };
  }

  /**
   * Helper: Builds a high-tech laboratory console workstation
   */
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

    // Base desk
    const desk = MeshBuilder.CreateBox(
      `${name}_desk`,
      { width: 2.8, height: 1.1, depth: 1.2 },
      scene
    );
    desk.position.y = 0.55;
    desk.material = metalMat;
    desk.parent = station;

    // Angled Monitor
    const monitor = MeshBuilder.CreateBox(
      `${name}_screen`,
      { width: 2.2, height: 1.0, depth: 0.12 },
      scene
    );
    monitor.position = new Vector3(0, 1.5, 0.25);
    monitor.rotation.x = -0.3;
    monitor.material = screenMat;
    monitor.parent = station;

    // Keyboard / Input Panel
    const keyboard = MeshBuilder.CreateBox(
      `${name}_keyboard`,
      { width: 1.8, height: 0.08, depth: 0.5 },
      scene
    );
    keyboard.position = new Vector3(0, 1.14, -0.2);
    keyboard.material = wallMat;
    keyboard.parent = station;

    // Holographic emitter disc
    const holoDisc = MeshBuilder.CreateCylinder(
      `${name}_holo_emitter`,
      { diameter: 0.6, height: 0.05 },
      scene
    );
    holoDisc.position = new Vector3(0, 1.13, 0.35);
    holoDisc.material = screenMat;
    holoDisc.parent = station;

    // Register box collision
    // Box dimensions 2.8 x 1.2 centered at pos
    boxes.push({
      minX: pos.x - 1.5,
      maxX: pos.x + 1.5,
      minZ: pos.z - 0.8,
      maxZ: pos.z + 0.8,
    });
  }

  /**
   * Helper: Builds the Liquid Nitrogen Cryo-Cooling Station
   */
  private static createCoolantStation(
    scene: Scene,
    root: TransformNode,
    name: string,
    pos: Vector3,
    rotY: number,
    cyanMat: StandardMaterial,
    wallMat: StandardMaterial,
    metalMat: StandardMaterial,
    circles: BoundingCircle[],
    boxes: BoundingBox2D[]
  ): void {
    const station = new TransformNode(name, scene);
    station.position = pos;
    station.rotation.y = rotY;
    station.parent = root;

    // Dual vertical cryo cylinders
    [-0.9, 0.9].forEach((ox, i) => {
      const tank = MeshBuilder.CreateCylinder(
        `${name}_tank_${i}`,
        { diameter: 1.2, height: 3.2, tessellation: 24 },
        scene
      );
      tank.position = new Vector3(ox, 1.6, 0);
      tank.material = metalMat;
      tank.parent = station;

      const band = MeshBuilder.CreateCylinder(
        `${name}_band_${i}`,
        { diameter: 1.24, height: 0.25, tessellation: 24 },
        scene
      );
      band.position = new Vector3(ox, 1.8, 0);
      band.material = cyanMat;
      band.parent = station;
    });

    // Control valve panel
    const panel = MeshBuilder.CreateBox(
      `${name}_valve_panel`,
      { width: 1.6, height: 1.2, depth: 0.4 },
      scene
    );
    panel.position = new Vector3(0, 0.9, -0.7);
    panel.material = wallMat;
    panel.parent = station;

    // Pressure gauge
    const gauge = MeshBuilder.CreateCylinder(
      `${name}_gauge`,
      { diameter: 0.4, height: 0.1 },
      scene
    );
    gauge.rotation.x = Math.PI / 2;
    gauge.position = new Vector3(0, 1.2, -0.92);
    gauge.material = cyanMat;
    gauge.parent = station;

    circles.push({ x: pos.x, z: pos.z, radius: 1.6 });
  }

  /**
   * Helper: Builds the Helium-3 Isotope Calibration Station
   */
  private static createIsotopeStation(
    scene: Scene,
    root: TransformNode,
    name: string,
    pos: Vector3,
    rotY: number,
    amberMat: StandardMaterial,
    wallMat: StandardMaterial,
    metalMat: StandardMaterial,
    circles: BoundingCircle[],
    boxes: BoundingBox2D[]
  ): void {
    const station = new TransformNode(name, scene);
    station.position = pos;
    station.rotation.y = rotY;
    station.parent = root;

    // Spherical centrifuge chamber
    const sphere = MeshBuilder.CreateSphere(
      `${name}_chamber`,
      { diameter: 2.2, segments: 24 },
      scene
    );
    sphere.position = new Vector3(0, 1.8, 0);
    sphere.material = metalMat;
    sphere.parent = station;

    // Glowing inspection port
    const port = MeshBuilder.CreateDisc(
      `${name}_port`,
      { radius: 0.65, tessellation: 24 },
      scene
    );
    port.position = new Vector3(0, 1.8, -1.11);
    port.material = amberMat;
    port.parent = station;

    // Sub-console
    const subConsole = MeshBuilder.CreateBox(
      `${name}_subconsole`,
      { width: 1.8, height: 1.1, depth: 0.6 },
      scene
    );
    subConsole.position = new Vector3(0, 0.55, -1.2);
    subConsole.material = wallMat;
    subConsole.parent = station;

    circles.push({ x: pos.x, z: pos.z, radius: 1.6 });
  }

  /**
   * Helper: Builds the Electromagnetic Containment Switch Station
   */
  private static createContainmentStation(
    scene: Scene,
    root: TransformNode,
    name: string,
    pos: Vector3,
    rotY: number,
    cyanMat: StandardMaterial,
    wallMat: StandardMaterial,
    metalMat: StandardMaterial,
    boxes: BoundingBox2D[]
  ): void {
    const station = new TransformNode(name, scene);
    station.position = pos;
    station.rotation.y = rotY;
    station.parent = root;

    // Pillar unit with coil rings
    const tower = MeshBuilder.CreateBox(
      `${name}_tower`,
      { width: 1.4, height: 3.5, depth: 1.4 },
      scene
    );
    tower.position.y = 1.75;
    tower.material = metalMat;
    tower.parent = station;

    // Magnetic induction torus
    const torus = MeshBuilder.CreateTorus(
      `${name}_torus`,
      { diameter: 2.2, thickness: 0.25, tessellation: 32 },
      scene
    );
    torus.position.y = 3.2;
    torus.material = cyanMat;
    torus.parent = station;

    // Switch console
    const swConsole = MeshBuilder.CreateBox(
      `${name}_switch_box`,
      { width: 1.2, height: 1.1, depth: 0.7 },
      scene
    );
    swConsole.position = new Vector3(0, 0.55, -1.1);
    swConsole.material = wallMat;
    swConsole.parent = station;

    boxes.push({
      minX: pos.x - 1.2,
      maxX: pos.x + 1.2,
      minZ: pos.z - 1.4,
      maxZ: pos.z + 1.2,
    });
  }
}
