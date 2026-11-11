/**
 * LAB GUARDIAN - 3D Atom & Molecule Model Factory
 * Generates genuine Babylon.js 3D meshes for atoms, bonds, diatomic molecules,
 * complex hydrocarbons, and ionic crystal lattices.
 *
 * Core Color & Radius Standards:
 * - Fe (Iron): Metallic silver (#cbd5e1), radius 0.38
 * - O (Oxygen): Crimson red (#ef4444), radius 0.30
 * - C (Carbon): Charcoal dark gray (#334155), radius 0.34
 * - H (Hydrogen): Crisp white (#f8fafc), radius 0.20
 * - K (Potassium): Royal purple (#a855f7), radius 0.42
 * - Br (Bromine): Amber orange/brown (#ea580c), radius 0.38
 * - Al (Aluminum): Sky light blue (#38bdf8), radius 0.36
 */

import {
  Scene,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Vector3,
  Quaternion,
  TransformNode,
  Mesh,
} from '@babylonjs/core';

export type AtomElement = 'Fe' | 'O' | 'C' | 'H' | 'K' | 'Br' | 'Al';

export interface AtomConfig {
  element: AtomElement;
  symbol: string;
  nameAr: string;
  color: Color3;
  emissive?: Color3;
  metallic?: boolean;
  radius: number;
}

export const ATOM_SPECS: Record<AtomElement, AtomConfig> = {
  Fe: {
    element: 'Fe',
    symbol: 'Fe',
    nameAr: 'حديد',
    color: new Color3(0.78, 0.82, 0.88),
    metallic: true,
    radius: 0.38,
  },
  O: {
    element: 'O',
    symbol: 'O',
    nameAr: 'أكسجين',
    color: new Color3(0.92, 0.22, 0.22),
    emissive: new Color3(0.25, 0.05, 0.05),
    radius: 0.30,
  },
  C: {
    element: 'C',
    symbol: 'C',
    nameAr: 'كربون',
    color: new Color3(0.20, 0.24, 0.30),
    radius: 0.34,
  },
  H: {
    element: 'H',
    symbol: 'H',
    nameAr: 'هيدروجين',
    color: new Color3(0.96, 0.98, 1.0),
    emissive: new Color3(0.1, 0.1, 0.1),
    radius: 0.20,
  },
  K: {
    element: 'K',
    symbol: 'K',
    nameAr: 'بوتاسيوم',
    color: new Color3(0.65, 0.32, 0.95),
    emissive: new Color3(0.2, 0.08, 0.3),
    radius: 0.42,
  },
  Br: {
    element: 'Br',
    symbol: 'Br',
    nameAr: 'بروم',
    color: new Color3(0.92, 0.38, 0.08),
    emissive: new Color3(0.2, 0.08, 0.02),
    radius: 0.38,
  },
  Al: {
    element: 'Al',
    symbol: 'Al',
    nameAr: 'ألومنيوم',
    color: new Color3(0.25, 0.75, 0.98),
    metallic: true,
    radius: 0.36,
  },
};

export class AtomModelFactory {
  /**
   * Material cache per scene to avoid duplicate shader compilation
   */
  private static getOrCreateMaterial(scene: Scene, element: AtomElement): StandardMaterial {
    const matName = `mat_atom_${element}_${scene.uid}`;
    const existing = scene.getMaterialByName(matName) as StandardMaterial;
    if (existing) return existing;

    const spec = ATOM_SPECS[element];
    const mat = new StandardMaterial(matName, scene);
    mat.diffuseColor = spec.color.clone();

    if (spec.metallic) {
      mat.specularColor = new Color3(0.85, 0.88, 0.92);
      mat.specularPower = 64;
    } else {
      mat.specularColor = new Color3(0.3, 0.3, 0.35);
      mat.specularPower = 32;
    }

    if (spec.emissive) {
      mat.emissiveColor = spec.emissive.clone();
    }

    return mat;
  }

  private static getBondMaterial(scene: Scene): StandardMaterial {
    const matName = `mat_chem_bond_${scene.uid}`;
    const existing = scene.getMaterialByName(matName) as StandardMaterial;
    if (existing) return existing;

    const mat = new StandardMaterial(matName, scene);
    mat.diffuseColor = new Color3(0.55, 0.62, 0.72);
    mat.specularColor = new Color3(0.4, 0.4, 0.4);
    return mat;
  }

  private static getIonicBondMaterial(scene: Scene): StandardMaterial {
    const matName = `mat_chem_ionic_bond_${scene.uid}`;
    const existing = scene.getMaterialByName(matName) as StandardMaterial;
    if (existing) return existing;

    const mat = new StandardMaterial(matName, scene);
    mat.diffuseColor = new Color3(0.4, 0.5, 0.7);
    mat.alpha = 0.55;
    return mat;
  }

  /**
   * Creates a single spherical 3D atom mesh
   */
  public static createAtomSphere(
    scene: Scene,
    element: AtomElement,
    position: Vector3,
    parent?: TransformNode,
    scale: number = 1.0,
    customName?: string
  ): Mesh {
    const spec = ATOM_SPECS[element];
    const name = customName || `atom_${element}_${Date.now()}_${Math.random()}`;
    const sphere = MeshBuilder.CreateSphere(
      name,
      {
        diameter: spec.radius * 2 * scale,
        segments: 18,
      },
      scene
    );
    sphere.position = position.clone();
    sphere.material = this.getOrCreateMaterial(scene, element);
    if (parent) sphere.parent = parent;
    return sphere;
  }

  /**
   * Creates an oriented 3D bond cylinder connecting two atom centers
   */
  public static createBondCylinder(
    scene: Scene,
    p1: Vector3,
    p2: Vector3,
    diameter: number = 0.08,
    parent?: TransformNode,
    material?: StandardMaterial
  ): Mesh {
    const distance = Vector3.Distance(p1, p2);
    const midPoint = Vector3.Center(p1, p2);

    const cylinder = MeshBuilder.CreateCylinder(
      `bond_${Date.now()}_${Math.random()}`,
      {
        height: distance,
        diameter,
        tessellation: 14,
      },
      scene
    );
    cylinder.position = midPoint;
    cylinder.material = material || this.getBondMaterial(scene);

    // Align cylinder (default along Y-axis) with vector (p2 - p1)
    const dir = p2.subtract(p1).normalize();
    const up = new Vector3(0, 1, 0);
    const dot = Vector3.Dot(up, dir);

    if (Math.abs(dot - 1.0) < 0.0001) {
      // Already aligned with up
    } else if (Math.abs(dot + 1.0) < 0.0001) {
      cylinder.rotationQuaternion = Quaternion.RotationAxis(new Vector3(1, 0, 0), Math.PI);
    } else {
      const axis = Vector3.Cross(up, dir).normalize();
      const angle = Math.acos(Math.max(-1, Math.min(1, dot)));
      cylinder.rotationQuaternion = Quaternion.RotationAxis(axis, angle);
    }

    if (parent) cylinder.parent = parent;
    return cylinder;
  }

  /**
   * Creates a double covalent bond (two parallel cylinders)
   */
  public static createDoubleBond(
    scene: Scene,
    p1: Vector3,
    p2: Vector3,
    offsetDist: number = 0.07,
    parent?: TransformNode
  ): Mesh[] {
    const dir = p2.subtract(p1).normalize();
    // Compute a perpendicular vector
    let perp = Vector3.Cross(dir, new Vector3(0, 1, 0));
    if (perp.lengthSquared() < 0.001) {
      perp = Vector3.Cross(dir, new Vector3(1, 0, 0));
    }
    perp.normalize().scaleInPlace(offsetDist);

    const p1a = p1.add(perp);
    const p2a = p2.add(perp);
    const p1b = p1.subtract(perp);
    const p2b = p2.subtract(perp);

    const b1 = this.createBondCylinder(scene, p1a, p2a, 0.065, parent);
    const b2 = this.createBondCylinder(scene, p1b, p2b, 0.065, parent);
    return [b1, b2];
  }

  // =========================================================================
  // INDIVIDUAL MOLECULE BUILDERS
  // =========================================================================

  /**
   * Oxygen Diatomic Molecule O2 (O=O with double bond)
   */
  public static createO2Molecule(
    scene: Scene,
    center: Vector3 = Vector3.Zero(),
    parent?: TransformNode,
    scale: number = 1.0
  ): TransformNode {
    const root = new TransformNode(`mol_O2_${Date.now()}_${Math.random()}`, scene);
    root.position = center.clone();
    if (parent) root.parent = parent;

    const separation = 0.65 * scale;
    const p1 = new Vector3(-separation, 0, 0);
    const p2 = new Vector3(separation, 0, 0);

    this.createAtomSphere(scene, 'O', p1, root, scale, 'O_1');
    this.createAtomSphere(scene, 'O', p2, root, scale, 'O_2');
    this.createDoubleBond(scene, p1, p2, 0.08 * scale, root);

    return root;
  }

  /**
   * Water Molecule H2O (Bent geometry, 104.5 degrees)
   */
  public static createH2OMolecule(
    scene: Scene,
    center: Vector3 = Vector3.Zero(),
    parent?: TransformNode,
    scale: number = 1.0
  ): TransformNode {
    const root = new TransformNode(`mol_H2O_${Date.now()}_${Math.random()}`, scene);
    root.position = center.clone();
    if (parent) root.parent = parent;

    const bondLength = 0.55 * scale;
    const angleRad = (104.5 * Math.PI) / 180;
    const halfAngle = angleRad / 2;

    const pO = Vector3.Zero();
    const pH1 = new Vector3(-Math.sin(halfAngle) * bondLength, -Math.cos(halfAngle) * bondLength, 0);
    const pH2 = new Vector3(Math.sin(halfAngle) * bondLength, -Math.cos(halfAngle) * bondLength, 0);

    this.createAtomSphere(scene, 'O', pO, root, scale, 'O_center');
    this.createAtomSphere(scene, 'H', pH1, root, scale, 'H_1');
    this.createAtomSphere(scene, 'H', pH2, root, scale, 'H_2');

    this.createBondCylinder(scene, pO, pH1, 0.055 * scale, root);
    this.createBondCylinder(scene, pO, pH2, 0.055 * scale, root);

    return root;
  }

  /**
   * Carbon Dioxide Molecule CO2 (Linear O=C=O, double bonds)
   */
  public static createCO2Molecule(
    scene: Scene,
    center: Vector3 = Vector3.Zero(),
    parent?: TransformNode,
    scale: number = 1.0
  ): TransformNode {
    const root = new TransformNode(`mol_CO2_${Date.now()}_${Math.random()}`, scene);
    root.position = center.clone();
    if (parent) root.parent = parent;

    const bondLength = 0.75 * scale;
    const pC = Vector3.Zero();
    const pO1 = new Vector3(-bondLength, 0, 0);
    const pO2 = new Vector3(bondLength, 0, 0);

    this.createAtomSphere(scene, 'C', pC, root, scale, 'C_center');
    this.createAtomSphere(scene, 'O', pO1, root, scale, 'O_left');
    this.createAtomSphere(scene, 'O', pO2, root, scale, 'O_right');

    this.createDoubleBond(scene, pC, pO1, 0.07 * scale, root);
    this.createDoubleBond(scene, pC, pO2, 0.07 * scale, root);

    return root;
  }

  /**
   * Propane Molecule C3H8 (3 Carbons in chain, 8 Hydrogens, tetrahedral bond angles)
   */
  public static createPropaneMolecule(
    scene: Scene,
    center: Vector3 = Vector3.Zero(),
    parent?: TransformNode,
    scale: number = 1.0
  ): TransformNode {
    const root = new TransformNode(`mol_C3H8_${Date.now()}_${Math.random()}`, scene);
    root.position = center.clone();
    if (parent) root.parent = parent;

    // Carbon spine positions: bent chain
    const cSpacing = 0.75 * scale;
    const c1 = new Vector3(-cSpacing, -0.15 * scale, 0);
    const c2 = new Vector3(0, 0.25 * scale, 0);
    const c3 = new Vector3(cSpacing, -0.15 * scale, 0);

    this.createAtomSphere(scene, 'C', c1, root, scale, 'C_1');
    this.createAtomSphere(scene, 'C', c2, root, scale, 'C_2');
    this.createAtomSphere(scene, 'C', c3, root, scale, 'C_3');

    // C-C bonds
    this.createBondCylinder(scene, c1, c2, 0.075 * scale, root);
    this.createBondCylinder(scene, c2, c3, 0.075 * scale, root);

    // Hydrogens for C1 (terminal: 3 H)
    const hDist = 0.52 * scale;
    const h1a = c1.add(new Vector3(-hDist, 0, 0));
    const h1b = c1.add(new Vector3(-0.25 * scale, -hDist, 0.3 * scale));
    const h1c = c1.add(new Vector3(-0.25 * scale, -hDist, -0.3 * scale));

    // Hydrogens for C2 (middle: 2 H)
    const h2a = c2.add(new Vector3(0, hDist * 0.9, 0.4 * scale));
    const h2b = c2.add(new Vector3(0, hDist * 0.9, -0.4 * scale));

    // Hydrogens for C3 (terminal: 3 H)
    const h3a = c3.add(new Vector3(hDist, 0, 0));
    const h3b = c3.add(new Vector3(0.25 * scale, -hDist, 0.3 * scale));
    const h3c = c3.add(new Vector3(0.25 * scale, -hDist, -0.3 * scale));

    const hydrogens = [h1a, h1b, h1c, h2a, h2b, h3a, h3b, h3c];
    const attachedCarbons = [c1, c1, c1, c2, c2, c3, c3, c3];

    hydrogens.forEach((hPos, idx) => {
      this.createAtomSphere(scene, 'H', hPos, root, scale, `H_${idx + 1}`);
      this.createBondCylinder(scene, attachedCarbons[idx], hPos, 0.05 * scale, root);
    });

    return root;
  }

  /**
   * Butane Molecule C4H10 (4 Carbons in zigzag chain, 10 Hydrogens)
   */
  public static createButaneMolecule(
    scene: Scene,
    center: Vector3 = Vector3.Zero(),
    parent?: TransformNode,
    scale: number = 1.0
  ): TransformNode {
    const root = new TransformNode(`mol_C4H10_${Date.now()}_${Math.random()}`, scene);
    root.position = center.clone();
    if (parent) root.parent = parent;

    // 4 Carbon zigzag spine
    const cSpacing = 0.65 * scale;
    const c1 = new Vector3(-1.5 * cSpacing, -0.2 * scale, 0);
    const c2 = new Vector3(-0.5 * cSpacing, 0.25 * scale, 0);
    const c3 = new Vector3(0.5 * cSpacing, -0.2 * scale, 0);
    const c4 = new Vector3(1.5 * cSpacing, 0.25 * scale, 0);

    const carbons = [c1, c2, c3, c4];
    carbons.forEach((pos, i) => {
      this.createAtomSphere(scene, 'C', pos, root, scale, `C_${i + 1}`);
    });

    this.createBondCylinder(scene, c1, c2, 0.075 * scale, root);
    this.createBondCylinder(scene, c2, c3, 0.075 * scale, root);
    this.createBondCylinder(scene, c3, c4, 0.075 * scale, root);

    // 10 Hydrogens
    const hDist = 0.48 * scale;
    const hydrogens: { pos: Vector3; c: Vector3 }[] = [
      // C1: 3 H
      { pos: c1.add(new Vector3(-hDist, 0, 0)), c: c1 },
      { pos: c1.add(new Vector3(-0.2 * scale, -hDist, 0.3 * scale)), c: c1 },
      { pos: c1.add(new Vector3(-0.2 * scale, -hDist, -0.3 * scale)), c: c1 },
      // C2: 2 H
      { pos: c2.add(new Vector3(0, hDist, 0.35 * scale)), c: c2 },
      { pos: c2.add(new Vector3(0, hDist, -0.35 * scale)), c: c2 },
      // C3: 2 H
      { pos: c3.add(new Vector3(0, -hDist, 0.35 * scale)), c: c3 },
      { pos: c3.add(new Vector3(0, -hDist, -0.35 * scale)), c: c3 },
      // C4: 3 H
      { pos: c4.add(new Vector3(hDist, 0, 0)), c: c4 },
      { pos: c4.add(new Vector3(0.2 * scale, hDist, 0.3 * scale)), c: c4 },
      { pos: c4.add(new Vector3(0.2 * scale, hDist, -0.3 * scale)), c: c4 },
    ];

    hydrogens.forEach((h, idx) => {
      this.createAtomSphere(scene, 'H', h.pos, root, scale, `H_but_${idx + 1}`);
      this.createBondCylinder(scene, h.c, h.pos, 0.048 * scale, root);
    });

    return root;
  }

  /**
   * Genuine 3D Alternating K+ / Br- Ionic Crystal Lattice (3x3x3 unit cube or 2x2x2)
   */
  public static createKBrLattice(
    scene: Scene,
    center: Vector3 = Vector3.Zero(),
    gridSize: number = 2, // 2 = 2x2x2 (8 ions), 3 = 3x3x3 (27 ions)
    parent?: TransformNode,
    scale: number = 1.0
  ): TransformNode {
    const root = new TransformNode(`lattice_KBr_${Date.now()}_${Math.random()}`, scene);
    root.position = center.clone();
    if (parent) root.parent = parent;

    const spacing = 0.72 * scale;
    const offset = ((gridSize - 1) * spacing) / 2;
    const ionicMat = this.getIonicBondMaterial(scene);

    const positions: Vector3[][][] = [];

    for (let x = 0; x < gridSize; x++) {
      positions[x] = [];
      for (let y = 0; y < gridSize; y++) {
        positions[x][y] = [];
        for (let z = 0; z < gridSize; z++) {
          const px = x * spacing - offset;
          const py = y * spacing - offset;
          const pz = z * spacing - offset;
          const pos = new Vector3(px, py, pz);
          positions[x][y][z] = pos;

          // Alternating ionic pattern: (x+y+z)%2===0 -> K+ (purple), else Br- (orange/brown)
          const isK = (x + y + z) % 2 === 0;
          const elem: AtomElement = isK ? 'K' : 'Br';
          this.createAtomSphere(scene, elem, pos, root, scale * (isK ? 0.95 : 0.85), `ion_${elem}_${x}_${y}_${z}`);
        }
      }
    }

    // Connect nearest neighbor lattice edges with translucent ionic rods
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        for (let z = 0; z < gridSize; z++) {
          const p = positions[x][y][z];
          if (x + 1 < gridSize) {
            this.createBondCylinder(scene, p, positions[x + 1][y][z], 0.038 * scale, root, ionicMat);
          }
          if (y + 1 < gridSize) {
            this.createBondCylinder(scene, p, positions[x][y + 1][z], 0.038 * scale, root, ionicMat);
          }
          if (z + 1 < gridSize) {
            this.createBondCylinder(scene, p, positions[x][y][z + 1], 0.038 * scale, root, ionicMat);
          }
        }
      }
    }

    return root;
  }

  // =========================================================================
  // THE 5 COMPREHENSIVE SCIENCE DEMONSTRATIONS (REACTANTS vs PRODUCTS)
  // =========================================================================

  /**
   * Demonstration 1: Iron Oxidation 4Fe + 3O2 -> 2Fe2O3
   */
  public static createIronOxidationModel(
    scene: Scene,
    stage: 'reactants' | 'products' = 'reactants',
    scale: number = 1.0
  ): TransformNode {
    const root = new TransformNode(`demo_iron_root_${stage}_${Date.now()}`, scene);

    if (stage === 'reactants') {
      // 4 Fe separate metallic atoms
      const feCoords = [
        new Vector3(-1.6 * scale, 0.4 * scale, -0.6 * scale),
        new Vector3(-0.6 * scale, 0.8 * scale, -0.6 * scale),
        new Vector3(-1.6 * scale, -0.5 * scale, -0.6 * scale),
        new Vector3(-0.6 * scale, -0.7 * scale, -0.6 * scale),
      ];
      feCoords.forEach((pos, idx) => {
        this.createAtomSphere(scene, 'Fe', pos, root, scale, `Fe_${idx + 1}`);
      });

      // 3 O2 diatomic molecules
      const o2Coords = [
        new Vector3(1.1 * scale, 0.8 * scale, 0.2 * scale),
        new Vector3(1.1 * scale, 0.0 * scale, 0.2 * scale),
        new Vector3(1.1 * scale, -0.8 * scale, 0.2 * scale),
      ];
      o2Coords.forEach((pos) => {
        this.createO2Molecule(scene, pos, root, scale * 0.85);
      });
    } else {
      // 2 Fe2O3 Formula Units
      // Unit 1 at -1.1, Unit 2 at +1.1
      [-1.1 * scale, 1.1 * scale].forEach((xOffset, uIdx) => {
        const uNode = new TransformNode(`fe2o3_unit_${uIdx}`, scene);
        uNode.position = new Vector3(xOffset, 0, 0);
        uNode.parent = root;

        // 2 Fe atoms
        const fe1 = new Vector3(0, 0.55 * scale, 0);
        const fe2 = new Vector3(0, -0.55 * scale, 0);
        this.createAtomSphere(scene, 'Fe', fe1, uNode, scale, `Fe_u${uIdx}_1`);
        this.createAtomSphere(scene, 'Fe', fe2, uNode, scale, `Fe_u${uIdx}_2`);

        // 3 O atoms in bridging coordination
        const o1 = new Vector3(-0.55 * scale, 0, 0.3 * scale);
        const o2 = new Vector3(0.55 * scale, 0, 0.3 * scale);
        const o3 = new Vector3(0, 0, -0.5 * scale);

        this.createAtomSphere(scene, 'O', o1, uNode, scale, `O_u${uIdx}_1`);
        this.createAtomSphere(scene, 'O', o2, uNode, scale, `O_u${uIdx}_2`);
        this.createAtomSphere(scene, 'O', o3, uNode, scale, `O_u${uIdx}_3`);

        // Coordinate ionic connectors
        const ionicMat = this.getIonicBondMaterial(scene);
        [o1, o2, o3].forEach((oPos) => {
          this.createBondCylinder(scene, fe1, oPos, 0.045 * scale, uNode, ionicMat);
          this.createBondCylinder(scene, fe2, oPos, 0.045 * scale, uNode, ionicMat);
        });

        // Bounding formula unit wire cage
        const cage = MeshBuilder.CreateBox(`cage_${uIdx}`, { size: 1.6 * scale }, scene);
        cage.material = ionicMat;
        cage.parent = uNode;
      });
    }

    return root;
  }

  /**
   * Demonstration 2: Diatomic Oxygen Molecule (O=O)
   */
  public static createOxygenInspectionModel(scene: Scene, scale: number = 1.0): TransformNode {
    return this.createO2Molecule(scene, Vector3.Zero(), undefined, scale * 1.3);
  }

  /**
   * Demonstration 3: Propane Combustion C3H8 + 5O2 -> 3CO2 + 4H2O
   */
  public static createPropaneCombustionModel(
    scene: Scene,
    stage: 'reactants' | 'products' = 'reactants',
    scale: number = 1.0
  ): TransformNode {
    const root = new TransformNode(`demo_propane_root_${stage}_${Date.now()}`, scene);

    if (stage === 'reactants') {
      // 1 C3H8 Propane Molecule
      this.createPropaneMolecule(scene, new Vector3(-1.2 * scale, 0, 0), root, scale * 0.9);

      // 5 O2 Molecules
      const o2Offsets = [
        new Vector3(1.2 * scale, 0.9 * scale, 0.4 * scale),
        new Vector3(1.2 * scale, 0.45 * scale, -0.4 * scale),
        new Vector3(1.2 * scale, 0.0 * scale, 0.4 * scale),
        new Vector3(1.2 * scale, -0.45 * scale, -0.4 * scale),
        new Vector3(1.2 * scale, -0.9 * scale, 0.4 * scale),
      ];
      o2Offsets.forEach((pos) => {
        this.createO2Molecule(scene, pos, root, scale * 0.7);
      });
    } else {
      // 3 CO2 Molecules
      const co2Offsets = [
        new Vector3(-1.1 * scale, 0.75 * scale, 0),
        new Vector3(-1.1 * scale, 0, 0),
        new Vector3(-1.1 * scale, -0.75 * scale, 0),
      ];
      co2Offsets.forEach((pos) => {
        this.createCO2Molecule(scene, pos, root, scale * 0.85);
      });

      // 4 H2O Molecules
      const h2oOffsets = [
        new Vector3(1.1 * scale, 0.9 * scale, 0.3 * scale),
        new Vector3(1.1 * scale, 0.3 * scale, -0.3 * scale),
        new Vector3(1.1 * scale, -0.3 * scale, 0.3 * scale),
        new Vector3(1.1 * scale, -0.9 * scale, -0.3 * scale),
      ];
      h2oOffsets.forEach((pos) => {
        this.createH2OMolecule(scene, pos, root, scale * 0.85);
      });
    }

    return root;
  }

  /**
   * Demonstration 4: Potassium Bromide 2K + Br2 -> 2KBr
   */
  public static createPotassiumBromideModel(
    scene: Scene,
    stage: 'reactants' | 'products' = 'products',
    scale: number = 1.0
  ): TransformNode {
    const root = new TransformNode(`demo_kbr_root_${stage}_${Date.now()}`, scene);

    if (stage === 'reactants') {
      // 2 K metallic atoms
      this.createAtomSphere(scene, 'K', new Vector3(-1.0 * scale, 0.5 * scale, 0), root, scale * 1.1, 'K_1');
      this.createAtomSphere(scene, 'K', new Vector3(-1.0 * scale, -0.5 * scale, 0), root, scale * 1.1, 'K_2');

      // 1 Br2 diatomic molecule
      const brRoot = new TransformNode('mol_Br2', scene);
      brRoot.position = new Vector3(1.0 * scale, 0, 0);
      brRoot.parent = root;

      const p1 = new Vector3(-0.45 * scale, 0, 0);
      const p2 = new Vector3(0.45 * scale, 0, 0);
      this.createAtomSphere(scene, 'Br', p1, brRoot, scale, 'Br_1');
      this.createAtomSphere(scene, 'Br', p2, brRoot, scale, 'Br_2');
      this.createBondCylinder(scene, p1, p2, 0.08 * scale, brRoot);
    } else {
      // 3D Ionic Crystal Lattice (3x3x3 = 27 ions)
      this.createKBrLattice(scene, Vector3.Zero(), 3, root, scale * 0.75);
    }

    return root;
  }

  /**
   * Demonstration 5: Butane Combustion Matrix (2C4H10 + 13O2 -> 8CO2 + 10H2O)
   */
  public static createButaneCombustionModel(
    scene: Scene,
    stage: 'reactants' | 'products' = 'reactants',
    scale: number = 1.0
  ): TransformNode {
    const root = new TransformNode(`demo_butane_root_${stage}_${Date.now()}`, scene);

    if (stage === 'reactants') {
      // 2 Butane C4H10 molecules
      this.createButaneMolecule(scene, new Vector3(-1.0 * scale, 0.7 * scale, 0), root, scale * 0.75);
      this.createButaneMolecule(scene, new Vector3(-1.0 * scale, -0.7 * scale, 0), root, scale * 0.75);

      // Representative cluster of O2 molecules (13 O2)
      for (let i = 0; i < 7; i++) {
        const y = (i - 3) * 0.38 * scale;
        this.createO2Molecule(scene, new Vector3(1.2 * scale, y, 0), root, scale * 0.55);
      }
    } else {
      // 8 CO2 and 10 H2O representative product cluster
      for (let i = 0; i < 4; i++) {
        const y = (i - 1.5) * 0.55 * scale;
        this.createCO2Molecule(scene, new Vector3(-1.0 * scale, y, 0), root, scale * 0.65);
      }
      for (let i = 0; i < 5; i++) {
        const y = (i - 2.0) * 0.45 * scale;
        this.createH2OMolecule(scene, new Vector3(1.0 * scale, y, 0), root, scale * 0.65);
      }
    }

    return root;
  }

  /**
   * Creates the visual 3D model for the in-game Academy pedestals
   */
  public static createPedestalDisplayModel(
    scene: Scene,
    stationId: string,
    parent?: TransformNode
  ): TransformNode {
    const root = new TransformNode(`${stationId}_model_root`, scene);
    if (parent) root.parent = parent;
    root.position.y = 1.75; // Inside glass dome

    switch (stationId) {
      case 'demo_station_1_iron': {
        // Fe atoms + O2 molecule inside dome
        this.createAtomSphere(scene, 'Fe', new Vector3(-0.4, 0.2, 0), root, 0.65);
        this.createAtomSphere(scene, 'Fe', new Vector3(-0.4, -0.2, 0), root, 0.65);
        this.createO2Molecule(scene, new Vector3(0.4, 0, 0), root, 0.6);
        break;
      }
      case 'demo_station_2_o2': {
        // Diatomic O2
        this.createO2Molecule(scene, Vector3.Zero(), root, 0.85);
        break;
      }
      case 'demo_station_3_propane': {
        // Ball-and-stick Propane C3H8
        this.createPropaneMolecule(scene, Vector3.Zero(), root, 0.65);
        break;
      }
      case 'demo_station_4_kbr': {
        // 3D KBr Crystal Lattice 2x2x2
        this.createKBrLattice(scene, Vector3.Zero(), 2, root, 0.7);
        break;
      }
      case 'demo_station_5_butane': {
        // Butane C4H10 Molecule
        this.createButaneMolecule(scene, Vector3.Zero(), root, 0.6);
        break;
      }
      default: {
        this.createAtomSphere(scene, 'Al', Vector3.Zero(), root, 0.8);
        break;
      }
    }

    return root;
  }
}
