/**
 * LAB GUARDIAN - Procedural Fallback 3D Models
 * Provides high-quality geometric models when GLB files are not yet available
 */

import {
  MeshBuilder,
  StandardMaterial,
  Color3,
  Vector3,
  Scene,
  TransformNode,
  Mesh,
} from '@babylonjs/core';

export interface PlayerProceduralHierarchy {
  root: TransformNode;
  head: Mesh;
  torso: Mesh;
  visor: Mesh;
  leftArm: Mesh;
  rightArm: Mesh;
  leftLeg: Mesh;
  rightLeg: Mesh;
  backpack: Mesh;
}

/**
 * Creates an articulated procedural humanoid operative in a futuristic security/science suit
 */
export function createProceduralHumanoidPlayer(
  scene: Scene,
  namePrefix: string = 'player'
): PlayerProceduralHierarchy {
  const root = new TransformNode(`${namePrefix}_root`, scene);

  // Materials
  const suitArmorMat = new StandardMaterial(`${namePrefix}_suit_armor_mat`, scene);
  suitArmorMat.diffuseColor = new Color3(0.08, 0.12, 0.22); // Deep navy armor
  suitArmorMat.specularColor = new Color3(0.3, 0.4, 0.55);

  const suitUnderlayerMat = new StandardMaterial(`${namePrefix}_suit_under_mat`, scene);
  suitUnderlayerMat.diffuseColor = new Color3(0.04, 0.06, 0.1); // Charcoal under-suit

  const visorEmissiveMat = new StandardMaterial(`${namePrefix}_visor_mat`, scene);
  visorEmissiveMat.diffuseColor = new Color3(0.0, 0.2, 0.3);
  visorEmissiveMat.emissiveColor = new Color3(0.0, 0.95, 1.0); // Bright cyan visor glow

  const coreEmissiveMat = new StandardMaterial(`${namePrefix}_core_mat`, scene);
  coreEmissiveMat.diffuseColor = new Color3(0.0, 0.2, 0.3);
  coreEmissiveMat.emissiveColor = new Color3(0.0, 0.8, 1.0);

  const amberStripeMat = new StandardMaterial(`${namePrefix}_amber_mat`, scene);
  amberStripeMat.diffuseColor = new Color3(0.4, 0.25, 0.0);
  amberStripeMat.emissiveColor = new Color3(1.0, 0.6, 0.0);

  // Torso (armored chest & abdomen)
  const torso = MeshBuilder.CreateBox(
    `${namePrefix}_torso`,
    { width: 0.72, height: 0.82, depth: 0.45 },
    scene
  );
  torso.position.y = 1.25;
  torso.material = suitArmorMat;
  torso.parent = root;

  // Chest Reactor Arc / Emblem
  const chestArc = MeshBuilder.CreateCylinder(
    `${namePrefix}_chest_arc`,
    { diameter: 0.22, height: 0.1, tessellation: 16 },
    scene
  );
  chestArc.rotation.x = Math.PI / 2;
  chestArc.position = new Vector3(0, 1.35, -0.24);
  chestArc.material = coreEmissiveMat;
  chestArc.parent = root;

  // Backpack / Atmospheric Life Support & Power Core
  const backpack = MeshBuilder.CreateBox(
    `${namePrefix}_backpack`,
    { width: 0.52, height: 0.65, depth: 0.28 },
    scene
  );
  backpack.position = new Vector3(0, 1.3, 0.28);
  backpack.material = suitUnderlayerMat;
  backpack.parent = root;

  // Small battery cell on backpack
  const cell = MeshBuilder.CreateCylinder(
    `${namePrefix}_cell`,
    { diameter: 0.12, height: 0.45, tessellation: 12 },
    scene
  );
  cell.position = new Vector3(0.14, 1.35, 0.44);
  cell.material = amberStripeMat;
  cell.parent = root;

  // Head & Helmet
  const head = MeshBuilder.CreateBox(
    `${namePrefix}_head`,
    { width: 0.4, height: 0.42, depth: 0.44 },
    scene
  );
  head.position.y = 1.88;
  head.material = suitArmorMat;
  head.parent = root;

  // Helmet visor (curved sleek band)
  const visor = MeshBuilder.CreateBox(
    `${namePrefix}_visor`,
    { width: 0.38, height: 0.14, depth: 0.15 },
    scene
  );
  visor.position = new Vector3(0, 1.88, -0.21);
  visor.material = visorEmissiveMat;
  visor.parent = root;

  // Shoulder Pauldrons
  const leftShoulder = MeshBuilder.CreateBox(
    `${namePrefix}_left_shoulder`,
    { width: 0.24, height: 0.18, depth: 0.32 },
    scene
  );
  leftShoulder.position = new Vector3(-0.48, 1.55, 0);
  leftShoulder.material = suitArmorMat;
  leftShoulder.parent = root;

  const rightShoulder = MeshBuilder.CreateBox(
    `${namePrefix}_right_shoulder`,
    { width: 0.24, height: 0.18, depth: 0.32 },
    scene
  );
  rightShoulder.position = new Vector3(0.48, 1.55, 0);
  rightShoulder.material = suitArmorMat;
  rightShoulder.parent = root;

  // Arms
  const leftArm = MeshBuilder.CreateBox(
    `${namePrefix}_left_arm`,
    { width: 0.18, height: 0.65, depth: 0.2 },
    scene
  );
  leftArm.setPivotPoint(new Vector3(0, 0.3, 0));
  leftArm.position = new Vector3(-0.48, 1.15, 0);
  leftArm.material = suitUnderlayerMat;
  leftArm.parent = root;

  const rightArm = MeshBuilder.CreateBox(
    `${namePrefix}_right_arm`,
    { width: 0.18, height: 0.65, depth: 0.2 },
    scene
  );
  rightArm.setPivotPoint(new Vector3(0, 0.3, 0));
  rightArm.position = new Vector3(0.48, 1.15, 0);
  rightArm.material = suitUnderlayerMat;
  rightArm.parent = root;

  // Forearm Gauntlets with cyan interface strip
  const leftGauntlet = MeshBuilder.CreateBox(
    `${namePrefix}_left_gauntlet`,
    { width: 0.2, height: 0.22, depth: 0.22 },
    scene
  );
  leftGauntlet.position = new Vector3(0, -0.2, -0.02);
  leftGauntlet.material = suitArmorMat;
  leftGauntlet.parent = leftArm;

  const rightGauntlet = MeshBuilder.CreateBox(
    `${namePrefix}_right_gauntlet`,
    { width: 0.2, height: 0.22, depth: 0.22 },
    scene
  );
  rightGauntlet.position = new Vector3(0, -0.2, -0.02);
  rightGauntlet.material = suitArmorMat;
  rightGauntlet.parent = rightArm;

  // Legs (Pivoted at hip height y = 0.85)
  const leftLeg = MeshBuilder.CreateBox(
    `${namePrefix}_left_leg`,
    { width: 0.25, height: 0.82, depth: 0.26 },
    scene
  );
  leftLeg.setPivotPoint(new Vector3(0, 0.41, 0));
  leftLeg.position = new Vector3(-0.21, 0.42, 0);
  leftLeg.material = suitUnderlayerMat;
  leftLeg.parent = root;

  const rightLeg = MeshBuilder.CreateBox(
    `${namePrefix}_right_leg`,
    { width: 0.25, height: 0.82, depth: 0.26 },
    scene
  );
  rightLeg.setPivotPoint(new Vector3(0, 0.41, 0));
  rightLeg.position = new Vector3(0.21, 0.42, 0);
  rightLeg.material = suitUnderlayerMat;
  rightLeg.parent = root;

  // Armored Boots
  const leftBoot = MeshBuilder.CreateBox(
    `${namePrefix}_left_boot`,
    { width: 0.27, height: 0.2, depth: 0.38 },
    scene
  );
  leftBoot.position = new Vector3(0, -0.32, -0.06);
  leftBoot.material = suitArmorMat;
  leftBoot.parent = leftLeg;

  const rightBoot = MeshBuilder.CreateBox(
    `${namePrefix}_right_boot`,
    { width: 0.27, height: 0.2, depth: 0.38 },
    scene
  );
  rightBoot.position = new Vector3(0, -0.32, -0.06);
  rightBoot.material = suitArmorMat;
  rightBoot.parent = rightLeg;

  return {
    root,
    head,
    torso,
    visor,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    backpack,
  };
}

/**
 * Creates an articulate procedural hovering security robot drone
 */
export function createProceduralEnemyDrone(
  scene: Scene,
  namePrefix: string = 'drone'
): TransformNode {
  const root = new TransformNode(`${namePrefix}_root`, scene);

  // Materials
  const hullMat = new StandardMaterial(`${namePrefix}_hull_mat`, scene);
  hullMat.diffuseColor = new Color3(0.12, 0.16, 0.24);
  hullMat.specularColor = new Color3(0.4, 0.5, 0.65);

  const armorMat = new StandardMaterial(`${namePrefix}_armor_mat`, scene);
  armorMat.diffuseColor = new Color3(0.06, 0.08, 0.13);
  armorMat.specularColor = new Color3(0.5, 0.6, 0.7);

  const eyeMat = new StandardMaterial(`${namePrefix}_eye_mat`, scene);
  eyeMat.diffuseColor = new Color3(0.8, 0.3, 0.0);
  eyeMat.emissiveColor = new Color3(1.0, 0.45, 0.05); // Luminous amber scanner

  const weaponMat = new StandardMaterial(`${namePrefix}_weapon_mat`, scene);
  weaponMat.diffuseColor = new Color3(0.08, 0.1, 0.14);
  weaponMat.specularColor = new Color3(0.7, 0.75, 0.85);

  const thrusterMat = new StandardMaterial(`${namePrefix}_thruster_mat`, scene);
  thrusterMat.diffuseColor = new Color3(0.0, 0.4, 0.5);
  thrusterMat.emissiveColor = new Color3(0.0, 0.95, 1.0); // Cyan ion plume

  // 1. Central Aerodynamic Fuselage
  const mainBody = MeshBuilder.CreateBox(
    `${namePrefix}_fuselage`,
    { width: 0.9, height: 0.45, depth: 1.1 },
    scene
  );
  mainBody.material = hullMat;
  mainBody.parent = root;

  // Upper cockpit canopy
  const canopy = MeshBuilder.CreateBox(
    `${namePrefix}_canopy`,
    { width: 0.7, height: 0.3, depth: 0.7 },
    scene
  );
  canopy.position = new Vector3(0, 0.3, -0.05);
  canopy.material = armorMat;
  canopy.parent = root;

  // Lower avionics keel
  const keel = MeshBuilder.CreateBox(
    `${namePrefix}_keel`,
    { width: 0.55, height: 0.22, depth: 0.8 },
    scene
  );
  keel.position = new Vector3(0, -0.28, 0.0);
  keel.material = armorMat;
  keel.parent = root;

  // Top sensor crest & antenna
  const crest = MeshBuilder.CreateBox(
    `${namePrefix}_crest`,
    { width: 0.1, height: 0.25, depth: 0.4 },
    scene
  );
  crest.position = new Vector3(0, 0.52, -0.05);
  crest.material = hullMat;
  crest.parent = root;

  const antenna = MeshBuilder.CreateCylinder(
    `${namePrefix}_antenna`,
    { diameter: 0.025, height: 0.35, tessellation: 8 },
    scene
  );
  antenna.position = new Vector3(0, 0.75, -0.15);
  antenna.material = weaponMat;
  antenna.parent = root;

  // 2. Front Scanning Eye (Convex lens optic)
  const eyeLens = MeshBuilder.CreateSphere(
    `${namePrefix}_eye_lens`,
    { diameter: 0.42, segments: 14 },
    scene
  );
  eyeLens.position = new Vector3(0, 0.02, 0.52);
  eyeLens.scaling = new Vector3(1.0, 0.75, 0.5);
  eyeLens.material = eyeMat;
  eyeLens.parent = root;

  const eyeHousing = MeshBuilder.CreateTorus(
    `${namePrefix}_eye_housing`,
    { diameter: 0.48, thickness: 0.08, tessellation: 20 },
    scene
  );
  eyeHousing.rotation.x = Math.PI / 2;
  eyeHousing.position = new Vector3(0, 0.02, 0.52);
  eyeHousing.material = armorMat;
  eyeHousing.parent = root;

  // 3. Articulated Stabilizer Wings & Winglets
  // Left Wing
  const leftWing = MeshBuilder.CreateBox(
    `${namePrefix}_wing_l`,
    { width: 0.95, height: 0.08, depth: 0.65 },
    scene
  );
  leftWing.position = new Vector3(-0.9, 0.05, 0.0);
  leftWing.rotation.z = -0.1;
  leftWing.material = hullMat;
  leftWing.parent = root;

  const leftWinglet = MeshBuilder.CreateBox(
    `${namePrefix}_winglet_l`,
    { width: 0.08, height: 0.4, depth: 0.6 },
    scene
  );
  leftWinglet.position = new Vector3(-1.38, 0.2, 0.0);
  leftWinglet.material = armorMat;
  leftWinglet.parent = root;

  // Right Wing
  const rightWing = MeshBuilder.CreateBox(
    `${namePrefix}_wing_r`,
    { width: 0.95, height: 0.08, depth: 0.65 },
    scene
  );
  rightWing.position = new Vector3(0.9, 0.05, 0.0);
  rightWing.rotation.z = 0.1;
  rightWing.material = hullMat;
  rightWing.parent = root;

  const rightWinglet = MeshBuilder.CreateBox(
    `${namePrefix}_winglet_r`,
    { width: 0.08, height: 0.4, depth: 0.6 },
    scene
  );
  rightWinglet.position = new Vector3(1.38, 0.2, 0.0);
  rightWinglet.material = armorMat;
  rightWinglet.parent = root;

  // 4. Underslung Twin Plasma Blasters
  [-0.48, 0.48].forEach((xOffset, i) => {
    const cannon = MeshBuilder.CreateCylinder(
      `${namePrefix}_cannon_${i}`,
      { diameter: 0.12, height: 0.75, tessellation: 12 },
      scene
    );
    cannon.rotation.x = Math.PI / 2;
    cannon.position = new Vector3(xOffset, -0.26, 0.22);
    cannon.material = weaponMat;
    cannon.parent = root;

    const muzzle = MeshBuilder.CreateCylinder(
      `${namePrefix}_muzzle_${i}`,
      { diameter: 0.16, height: 0.1, tessellation: 12 },
      scene
    );
    muzzle.rotation.x = Math.PI / 2;
    muzzle.position = new Vector3(xOffset, -0.26, 0.6);
    muzzle.material = weaponMat;
    muzzle.parent = root;
  });

  // 5. Dual Rear Ion Thrusters with Cyan Exhaust Rings
  [-0.32, 0.32].forEach((xOffset, i) => {
    const nozzle = MeshBuilder.CreateCylinder(
      `${namePrefix}_nozzle_${i}`,
      { diameterTop: 0.22, diameterBottom: 0.28, height: 0.25, tessellation: 16 },
      scene
    );
    nozzle.rotation.x = Math.PI / 2;
    nozzle.position = new Vector3(xOffset, 0.0, -0.6);
    nozzle.material = armorMat;
    nozzle.parent = root;

    const plume = MeshBuilder.CreateCylinder(
      `${namePrefix}_plume_${i}`,
      { diameter: 0.16, height: 0.12, tessellation: 14 },
      scene
    );
    plume.rotation.x = Math.PI / 2;
    plume.position = new Vector3(xOffset, 0.0, -0.74);
    plume.material = thrusterMat;
    plume.parent = root;
  });

  return root;
}
