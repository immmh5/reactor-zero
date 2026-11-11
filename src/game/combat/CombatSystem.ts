/**
 * LAB GUARDIAN - Combat & Advanced Enemy AI System
 * Handles real 3D ballistics, multi-archetype enemy AI (Scout, Heavy Sentinel, Ranged Guard, Elite Warden, Boss),
 * floating 3D health/shield bars, attack telegraphs, projectile trails, and real 3D pickups.
 */

import {
  Scene,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Vector3,
  TransformNode,
  Mesh,
} from '@babylonjs/core';
import { Projectile, EnemyEntity, PickupNotificationEvent, EnemyType } from './CombatTypes';
import { PickupManager } from '../items/PickupManager';
import { FunctionalCollectibleType } from '../items/PickupTypes';
import { BoundingCircle, BoundingBox2D } from '../rules/gameRules';
import { sounds } from '../audio/SoundEffects';
import { AssetManager } from '../assets/AssetManager';
import { LocationId } from '../campaign/CampaignTypes';
import { createProceduralEnemyDrone } from '../assets/FallbackModels';

export class CombatSystem {
  private scene: Scene;
  private projectiles: Projectile[] = [];
  private enemies: EnemyEntity[] = [];
  private pickupManager: PickupManager;
  private currentLocationId: LocationId = 'hub';

  // Weapon & cooldown properties
  private playerFireCooldown: number = 0;
  private playerInvulnerabilityTimer: number = 0;
  private hasTriggeredCombatTutorial: boolean = false;

  // Shared Materials for Projectiles & FX
  private playerBoltMat: StandardMaterial;
  private scoutBoltMat: StandardMaterial;
  private sentinelBoltMat: StandardMaterial;
  private rangedBoltMat: StandardMaterial;
  private eliteBoltMat: StandardMaterial;
  private bossBoltMat: StandardMaterial;

  // Enemy Visual Materials
  private droneHullMat: StandardMaterial;
  private droneHitMat: StandardMaterial;
  private bossHullMat: StandardMaterial;
  private sentinelHullMat: StandardMaterial;
  private shieldMat: StandardMaterial;
  private hpBarBgMat: StandardMaterial;
  private hpBarGreenMat: StandardMaterial;
  private hpBarShieldMat: StandardMaterial;
  private warningIconMat: StandardMaterial;

  // Pickup Glow Materials
  private healthPickupMat: StandardMaterial;
  private energyPickupMat: StandardMaterial;
  private ammoPickupMat: StandardMaterial;
  private keycardPickupMat: StandardMaterial;

  constructor(scene: Scene) {
    this.scene = scene;
    this.pickupManager = new PickupManager(scene);

    // 1. Projectile Materials
    this.playerBoltMat = new StandardMaterial('mat_p_bolt', scene);
    this.playerBoltMat.emissiveColor = new Color3(0.0, 0.95, 1.0);
    this.playerBoltMat.diffuseColor = new Color3(0.1, 0.8, 1.0);

    this.scoutBoltMat = new StandardMaterial('mat_scout_bolt', scene);
    this.scoutBoltMat.emissiveColor = new Color3(1.0, 0.7, 0.0);
    this.scoutBoltMat.diffuseColor = new Color3(1.0, 0.5, 0.0);

    this.sentinelBoltMat = new StandardMaterial('mat_sentinel_bolt', scene);
    this.sentinelBoltMat.emissiveColor = new Color3(1.0, 0.08, 0.15);
    this.sentinelBoltMat.diffuseColor = new Color3(0.9, 0.05, 0.1);

    this.rangedBoltMat = new StandardMaterial('mat_ranged_bolt', scene);
    this.rangedBoltMat.emissiveColor = new Color3(0.0, 1.0, 0.45);
    this.rangedBoltMat.diffuseColor = new Color3(0.1, 0.8, 0.3);

    this.eliteBoltMat = new StandardMaterial('mat_elite_bolt', scene);
    this.eliteBoltMat.emissiveColor = new Color3(0.85, 0.1, 1.0);
    this.eliteBoltMat.diffuseColor = new Color3(0.7, 0.0, 0.9);

    this.bossBoltMat = new StandardMaterial('mat_boss_bolt', scene);
    this.bossBoltMat.emissiveColor = new Color3(1.0, 0.25, 0.05);
    this.bossBoltMat.diffuseColor = new Color3(1.0, 0.1, 0.0);

    // 2. Enemy Materials
    this.droneHullMat = new StandardMaterial('mat_drone_hull', scene);
    this.droneHullMat.diffuseColor = new Color3(0.12, 0.16, 0.24);
    this.droneHullMat.specularColor = new Color3(0.4, 0.5, 0.6);

    this.sentinelHullMat = new StandardMaterial('mat_sentinel_hull', scene);
    this.sentinelHullMat.diffuseColor = new Color3(0.08, 0.1, 0.15);
    this.sentinelHullMat.specularColor = new Color3(0.3, 0.35, 0.45);

    this.droneHitMat = new StandardMaterial('mat_drone_hit', scene);
    this.droneHitMat.emissiveColor = new Color3(1.0, 0.2, 0.2);
    this.droneHitMat.diffuseColor = new Color3(1.0, 0.8, 0.8);

    this.bossHullMat = new StandardMaterial('mat_boss_hull', scene);
    this.bossHullMat.diffuseColor = new Color3(0.08, 0.1, 0.16);
    this.bossHullMat.specularColor = new Color3(0.6, 0.7, 0.9);

    this.shieldMat = new StandardMaterial('mat_shield_bubble', scene);
    this.shieldMat.diffuseColor = new Color3(0.0, 0.6, 1.0);
    this.shieldMat.emissiveColor = new Color3(0.0, 0.4, 0.9);
    this.shieldMat.alpha = 0.35;

    // 3. Floating HUD Materials
    this.hpBarBgMat = new StandardMaterial('mat_hp_bg', scene);
    this.hpBarBgMat.diffuseColor = new Color3(0.05, 0.08, 0.12);

    this.hpBarGreenMat = new StandardMaterial('mat_hp_green', scene);
    this.hpBarGreenMat.emissiveColor = new Color3(0.0, 0.95, 0.4);
    this.hpBarGreenMat.diffuseColor = new Color3(0.0, 0.8, 0.3);

    this.hpBarShieldMat = new StandardMaterial('mat_hp_shield', scene);
    this.hpBarShieldMat.emissiveColor = new Color3(0.0, 0.85, 1.0);
    this.hpBarShieldMat.diffuseColor = new Color3(0.1, 0.7, 0.9);

    this.warningIconMat = new StandardMaterial('mat_warn_icon', scene);
    this.warningIconMat.emissiveColor = new Color3(1.0, 0.6, 0.0);
    this.warningIconMat.diffuseColor = new Color3(1.0, 0.4, 0.0);

    // 4. Pickup Materials
    this.healthPickupMat = new StandardMaterial('mat_pk_hp', scene);
    this.healthPickupMat.emissiveColor = new Color3(0.0, 1.0, 0.5);

    this.energyPickupMat = new StandardMaterial('mat_pk_en', scene);
    this.energyPickupMat.emissiveColor = new Color3(1.0, 0.75, 0.0);

    this.ammoPickupMat = new StandardMaterial('mat_pk_am', scene);
    this.ammoPickupMat.emissiveColor = new Color3(0.0, 0.9, 1.0);

    this.keycardPickupMat = new StandardMaterial('mat_pk_key', scene);
    this.keycardPickupMat.emissiveColor = new Color3(1.0, 0.85, 0.2);

    this.setupLocationCombat('hub');
  }

  public getPickupManager(): PickupManager {
    return this.pickupManager;
  }

  public setupLocationCombat(
    locationId: LocationId,
    boundaryRadius: number = 28,
    circles: BoundingCircle[] = [],
    boxes: BoundingBox2D[] = []
  ): void {
    this.currentLocationId = locationId;

    // 1. Clean existing projectiles, enemies, and ground pickups
    this.projectiles.forEach((p) => {
      p.mesh.dispose();
      p.trailMeshes?.forEach((t) => t.dispose());
    });
    this.projectiles = [];

    this.pickupManager.clearActivePickups();
    this.pickupManager.setSectorContext(locationId, boundaryRadius, circles, boxes);

    this.enemies.forEach((e) => {
      e.healthBarMesh?.dispose();
      e.shieldBarMesh?.dispose();
      e.warningIconMesh?.dispose();
      e.node.dispose();
    });
    this.enemies = [];

    // 2. Setup map encounters & non-cluttered intentional collectibles
    if (locationId === 'hub') {
      // Hub: Safe command base with recovery canisters & friendly training drone
      this.pickupManager.spawnFixedPickup('hub_hp_1', 'health', new Vector3(-8, 0.8, -10), 25);
      this.pickupManager.spawnFixedPickup('hub_hp_2', 'health', new Vector3(8, 0.8, -10), 25);
      this.pickupManager.spawnFixedPickup('hub_en_1', 'energy', new Vector3(-10, 0.8, -5), 40);
      this.pickupManager.spawnFixedPickup('hub_en_2', 'energy', new Vector3(10, 0.8, -5), 40);

      // Friendly training robot in equipment bay
      this.createTrainingDrone('hub_training_bot', 'روبوت التدريب التكتيكي (محطة المعايرة)', new Vector3(10, 1.8, 6));
    } else if (locationId === 'academy') {
      // Stoichiometry Academy: Scientific learning zone recovery canisters
      this.pickupManager.spawnFixedPickup('acad_hp_1', 'health', new Vector3(-6, 0.8, -14), 25);
      this.pickupManager.spawnFixedPickup('acad_en_1', 'energy', new Vector3(6, 0.8, -14), 40);
    } else if (locationId === 'research_wing') {
      // Equation Research Wing: 3 Visible First-Stage Patrol Drones + 1 Advanced Scout Drone
      this.createDrone(
        'drone_alpha',
        'طائرة استطلاع أمنية ألفا (نظام الدورية الأول)',
        new Vector3(0, 1.8, -6),
        [new Vector3(0, 1.8, -6), new Vector3(6, 1.8, -6), new Vector3(-6, 1.8, -6)]
      );
      this.createDrone(
        'drone_beta',
        'طائرة استطلاع أمنية بيتا (مختبر التركيب)',
        new Vector3(10, 1.8, 4),
        [new Vector3(10, 1.8, 4), new Vector3(10, 1.8, 12), new Vector3(3, 1.8, 8)]
      );
      this.createDrone(
        'drone_gamma',
        'طائرة استطلاع أمنية غاما (مختبر التحليل)',
        new Vector3(-10, 1.8, 12),
        [new Vector3(-10, 1.8, 12), new Vector3(-10, 1.8, 3), new Vector3(-3, 1.8, 6)]
      );

      this.createSecurityScout(
        'rw_scout_1',
        'كشافة استطلاع سريعة - إيكو',
        new Vector3(0, 2.2, 14),
        [new Vector3(0, 2.2, 14), new Vector3(-6, 2.2, 16), new Vector3(6, 2.2, 16)]
      );

      this.pickupManager.spawnFixedPickup('rw_hp_1', 'health', new Vector3(8, 0.8, -14), 25);
      this.pickupManager.spawnFixedPickup('rw_en_1', 'energy', new Vector3(-8, 0.8, 14), 40);
      this.pickupManager.spawnFixedPickup('rw_am_1', 'ammo', new Vector3(0, 0.8, 8), 50);
    } else if (locationId === 'refinery') {
      // Mass Refinery: Industrial Complex with Heavy Sentinels, Ranged Guard & Elite Security Warden
      this.createHeavySentinel(
        'sentinel_west',
        'سنتينل الحراسة المصفح 01 (صهاريج الكواشف)',
        new Vector3(-10, 1.2, -6),
        [new Vector3(-10, 1.2, -6), new Vector3(-14, 1.2, 2), new Vector3(-8, 1.2, 10)]
      );
      this.createHeavySentinel(
        'sentinel_east',
        'سنتينل الحراسة المصفح 02 (منطقة الطرد)',
        new Vector3(10, 1.2, 0),
        [new Vector3(10, 1.2, 0), new Vector3(14, 1.2, 8), new Vector3(8, 1.2, -8)]
      );
      this.createRangedGuard(
        'ranged_guard_1',
        'حارس الرماية التكتيكي (جسر المراقبة)',
        new Vector3(-6, 1.8, 8),
        [new Vector3(-6, 1.8, 8), new Vector3(-6, 1.8, 14)]
      );
      this.createEliteWarden(
        'ref_elite_warden',
        'روبوت النخبة المدرع - آمر المصفاة',
        new Vector3(0, 1.6, 6)
      );

      this.pickupManager.spawnFixedPickup('ref_hp_1', 'health', new Vector3(-6, 0.8, -12), 30);
      this.pickupManager.spawnFixedPickup('ref_en_1', 'energy', new Vector3(6, 0.8, 12), 40);
      this.pickupManager.spawnFixedPickup('ref_am_1', 'ammo', new Vector3(-12, 0.8, 0), 50);
      this.pickupManager.spawnFixedPickup('ref_key_1', 'keycard', new Vector3(12, 0.8, 4), 10);
    } else if (locationId === 'vault') {
      // Mole Ratio Vault: Final Boss Warden (Reactor Titan) + Automated Security Sentries
      this.createBoss();

      this.createRangedGuard(
        'vault_guard_left',
        'سنتري رماية محيطي - ألفا',
        new Vector3(-12, 1.8, -2),
        [new Vector3(-12, 1.8, -2), new Vector3(-12, 1.8, 4)]
      );
      this.createRangedGuard(
        'vault_guard_right',
        'سنتري رماية محيطي - بيتا',
        new Vector3(12, 1.8, -2),
        [new Vector3(12, 1.8, -2), new Vector3(12, 1.8, 4)]
      );

      this.pickupManager.spawnFixedPickup('vlt_hp_1', 'health', new Vector3(-8, 0.8, 4), 30);
      this.pickupManager.spawnFixedPickup('vlt_hp_2', 'health', new Vector3(8, 0.8, 4), 30);
      this.pickupManager.spawnFixedPickup('vlt_en_1', 'energy', new Vector3(-10, 0.8, -8), 50);
      this.pickupManager.spawnFixedPickup('vlt_en_2', 'energy', new Vector3(10, 0.8, -8), 50);
      this.pickupManager.spawnFixedPickup('vlt_am_1', 'ammo', new Vector3(0, 0.8, -4), 60);
    }
  }

  // --- ENEMY BUILDERS ---

  /**
   * First-Stage Security Patrol Drone (Research Wing Alpha, Beta, Gamma)
   */
  private createDrone(id: string, nameAr: string, pos: Vector3, waypoints: Vector3[]): void {
    const root = new TransformNode(id, this.scene);
    root.position = pos.clone();

    // High-fidelity procedural robot model
    const procDrone = createProceduralEnemyDrone(this.scene, id);
    procDrone.parent = root;

    // Load real 3D security drone GLB model
    AssetManager.getInstance()
      .loadAsset('enemyRobot', this.scene)
      .then(({ node, isFallback }) => {
        if (!isFallback && node) {
          const clone = node.clone(`${id}_glb_inst`, root);
          if (clone) {
            clone.position = new Vector3(0, 0, 0);
            clone.scaling.setAll(0.9);
            procDrone.setEnabled(false);
          }
        }
      })
      .catch(() => {});

    const { hpBar, shieldBar, warnIcon } = this.attachEnemyHUD(root, 60, false);

    this.enemies.push({
      id,
      type: 'drone',
      nameAr,
      node: root,
      meshRoot: procDrone,
      health: 60,
      maxHealth: 60,
      position: pos.clone(),
      velocity: new Vector3(0, 0, 0),
      patrolWaypoints: waypoints,
      currentWaypointIndex: 0,
      state: 'patrol',
      attackCooldown: 1.5,
      isShielded: false,
      shieldPercent: 0,
      hitFlashTimer: 0,
      patrolTimer: 0,
      warningTimer: 0,
      bobTime: Math.random() * Math.PI * 2,
      healthBarMesh: hpBar,
      shieldBarMesh: shieldBar,
      warningIconMesh: warnIcon,
    });
  }

  /**
   * ENEMY TYPE 1: SECURITY SCOUT (Fast hovering drone, agile side-strafing, rapid light bolts)
   */
  private createSecurityScout(id: string, nameAr: string, pos: Vector3, waypoints: Vector3[]): void {
    const root = new TransformNode(id, this.scene);
    root.position = pos.clone();

    const procModel = createProceduralEnemyDrone(this.scene, `${id}_proc`);
    procModel.parent = root;
    procModel.scaling.setAll(0.8);

    AssetManager.getInstance()
      .loadAsset('enemyScout', this.scene)
      .then(({ node, isFallback }) => {
        if (!isFallback && node) {
          const clone = node.clone(`${id}_scout_inst`, root);
          if (clone) {
            clone.position = new Vector3(0, 0, 0);
            clone.scaling.setAll(0.85);
            procModel.setEnabled(false);
          }
        }
      })
      .catch(() => {});

    const { hpBar, shieldBar, warnIcon } = this.attachEnemyHUD(root, 50, false);

    this.enemies.push({
      id,
      type: 'scout',
      nameAr,
      node: root,
      meshRoot: procModel,
      health: 50,
      maxHealth: 50,
      position: pos.clone(),
      velocity: new Vector3(0, 0, 0),
      patrolWaypoints: waypoints,
      currentWaypointIndex: 0,
      state: 'patrol',
      attackCooldown: 1.2,
      isShielded: false,
      shieldPercent: 0,
      hitFlashTimer: 0,
      patrolTimer: 0,
      warningTimer: 0,
      evasionTimer: 0,
      bobTime: Math.random() * Math.PI * 2,
      healthBarMesh: hpBar,
      shieldBarMesh: shieldBar,
      warningIconMesh: warnIcon,
    });
  }

  /**
   * ENEMY TYPE 2: HEAVY SENTINEL (Armored ground titan, heavy blast cannon, high health + shield)
   */
  private createHeavySentinel(id: string, nameAr: string, pos: Vector3, waypoints: Vector3[]): void {
    const root = new TransformNode(id, this.scene);
    root.position = pos.clone();

    // Procedural heavy chassis fallback
    const torso = MeshBuilder.CreateBox(`${id}_torso`, { width: 1.8, height: 2.0, depth: 1.4 }, this.scene);
    torso.position.y = 1.0;
    torso.material = this.sentinelHullMat;
    torso.parent = root;

    const shieldPlate = MeshBuilder.CreateBox(`${id}_shield_plate`, { width: 2.0, height: 1.6, depth: 0.3 }, this.scene);
    shieldPlate.position = new Vector3(0, 1.0, -0.8);
    shieldPlate.material = this.droneHullMat;
    shieldPlate.parent = root;

    const cannon = MeshBuilder.CreateCylinder(`${id}_cannon`, { diameter: 0.45, height: 1.4 }, this.scene);
    cannon.rotation.x = Math.PI / 2;
    cannon.position = new Vector3(1.1, 1.1, -0.4);
    cannon.material = this.bossHullMat;
    cannon.parent = root;

    // Load real 3D Quaternius Heavy Sentinel model
    AssetManager.getInstance()
      .loadAsset('enemySentinel', this.scene)
      .then(({ node, isFallback }) => {
        if (!isFallback && node) {
          const clone = node.clone(`${id}_sentinel_inst`, root);
          if (clone) {
            clone.position = new Vector3(0, 0, 0);
            clone.scaling.setAll(1.1);
            torso.visibility = 0.05;
            shieldPlate.visibility = 0.05;
            cannon.visibility = 0.05;
          }
        }
      })
      .catch(() => {});

    const { hpBar, shieldBar, warnIcon } = this.attachEnemyHUD(root, 150, true);

    this.enemies.push({
      id,
      type: 'heavy_sentinel',
      nameAr,
      node: root,
      meshRoot: torso,
      health: 150,
      maxHealth: 150,
      position: pos.clone(),
      velocity: new Vector3(0, 0, 0),
      patrolWaypoints: waypoints,
      currentWaypointIndex: 0,
      state: 'patrol',
      attackCooldown: 2.8,
      isShielded: true,
      shieldPercent: 50,
      hitFlashTimer: 0,
      patrolTimer: 0,
      healthBarMesh: hpBar,
      shieldBarMesh: shieldBar,
      warningIconMesh: warnIcon,
    });
  }

  /**
   * ENEMY TYPE 3: RANGED GUARD (Maintains distance, retreats when rushed, snipes with precision beam)
   */
  private createRangedGuard(id: string, nameAr: string, pos: Vector3, waypoints: Vector3[]): void {
    const root = new TransformNode(id, this.scene);
    root.position = pos.clone();

    // Procedural tactical sniper sentry
    const torso = MeshBuilder.CreateCylinder(`${id}_sentry_body`, { diameter: 0.8, height: 1.8 }, this.scene);
    torso.position.y = 0.9;
    torso.material = this.droneHullMat;
    torso.parent = root;

    const sniperRifle = MeshBuilder.CreateCylinder(`${id}_rifle`, { diameter: 0.18, height: 1.8 }, this.scene);
    sniperRifle.rotation.x = Math.PI / 2;
    sniperRifle.position = new Vector3(0, 1.2, -0.9);
    sniperRifle.material = this.bossHullMat;
    sniperRifle.parent = root;

    AssetManager.getInstance()
      .loadAsset('enemyRangedGuard', this.scene)
      .then(({ node, isFallback }) => {
        if (!isFallback && node) {
          const clone = node.clone(`${id}_ranged_inst`, root);
          if (clone) {
            clone.position = new Vector3(0, 0, 0);
            clone.scaling.setAll(0.95);
            torso.visibility = 0.05;
            sniperRifle.visibility = 0.05;
          }
        }
      })
      .catch(() => {});

    const { hpBar, shieldBar, warnIcon } = this.attachEnemyHUD(root, 80, false);

    this.enemies.push({
      id,
      type: 'ranged_guard',
      nameAr,
      node: root,
      meshRoot: torso,
      health: 80,
      maxHealth: 80,
      position: pos.clone(),
      velocity: new Vector3(0, 0, 0),
      patrolWaypoints: waypoints,
      currentWaypointIndex: 0,
      state: 'patrol',
      attackCooldown: 2.0,
      isShielded: false,
      shieldPercent: 0,
      hitFlashTimer: 0,
      patrolTimer: 0,
      repositionTimer: 0,
      healthBarMesh: hpBar,
      shieldBarMesh: shieldBar,
      warningIconMesh: warnIcon,
    });
  }

  /**
   * ENEMY TYPE 4: ELITE SECURITY WARDEN (Multiple attack patterns, high health, distinct telegraph)
   */
  private createEliteWarden(id: string, nameAr: string, pos: Vector3): void {
    const root = new TransformNode(id, this.scene);
    root.position = pos.clone();

    const torso = MeshBuilder.CreateBox(`${id}_torso`, { width: 2.2, height: 2.4, depth: 1.8 }, this.scene);
    torso.position.y = 1.2;
    torso.material = this.bossHullMat;
    torso.parent = root;

    // Load real 3D Boss/Elite GLB model
    AssetManager.getInstance()
      .loadAsset('bossRobot', this.scene)
      .then(({ node, isFallback, animationGroups }) => {
        if (!isFallback && node) {
          const clone = node.clone(`${id}_elite_glb`, root);
          if (clone) {
            clone.position = new Vector3(0, 0, 0);
            clone.scaling.setAll(1.4);
            torso.visibility = 0.05;
            if (animationGroups && animationGroups.length > 0) {
              animationGroups[0].play(true);
            }
          }
        }
      })
      .catch(() => {});

    const { hpBar, shieldBar, warnIcon } = this.attachEnemyHUD(root, 220, true);

    this.enemies.push({
      id,
      type: 'elite_warden',
      nameAr,
      node: root,
      meshRoot: torso,
      health: 220,
      maxHealth: 220,
      position: pos.clone(),
      velocity: new Vector3(0, 0, 0),
      patrolWaypoints: [pos.clone(), new Vector3(pos.x + 6, pos.y, pos.z), new Vector3(pos.x - 6, pos.y, pos.z)],
      currentWaypointIndex: 0,
      state: 'patrol',
      attackCooldown: 1.8,
      isShielded: true,
      shieldPercent: 60,
      hitFlashTimer: 0,
      patrolTimer: 0,
      attackTelegraphTimer: 0,
      healthBarMesh: hpBar,
      shieldBarMesh: shieldBar,
      warningIconMesh: warnIcon,
    });
  }

  /**
   * Final Boss: Automated Containment Warden (Reactor Titan)
   */
  private createBoss(): void {
    const root = new TransformNode('boss_warden', this.scene);
    const bossPos = new Vector3(0, 1.4, 4.2);
    root.position = bossPos.clone();

    const torso = MeshBuilder.CreateBox('boss_torso', { width: 2.4, height: 2.6, depth: 2.0 }, this.scene);
    torso.position.y = 1.3;
    torso.material = this.bossHullMat;
    torso.parent = root;

    // Asynchronously integrate real 3D Containment Warden GLB asset
    AssetManager.getInstance()
      .loadAsset('bossRobot', this.scene)
      .then(({ node, isFallback, animationGroups }) => {
        if (!isFallback && node) {
          const clone = node.clone('boss_glb_inst', root);
          if (clone) {
            clone.position = new Vector3(0, 0, 0);
            clone.scaling.setAll(1.8);
            torso.visibility = 0.05;
            if (animationGroups && animationGroups.length > 0) {
              animationGroups[0].play(true);
            }
          }
        }
      })
      .catch(() => {});

    const { hpBar, shieldBar, warnIcon } = this.attachEnemyHUD(root, 300, true);

    this.enemies.push({
      id: 'boss_warden',
      type: 'boss',
      nameAr: 'حارس الاحتواء الثقيل (المفاعل الأخير)',
      node: root,
      meshRoot: torso,
      health: 300,
      maxHealth: 300,
      position: bossPos.clone(),
      velocity: new Vector3(0, 0, 0),
      patrolWaypoints: [bossPos.clone()],
      currentWaypointIndex: 0,
      state: 'attack',
      attackCooldown: 2.2,
      isShielded: true,
      shieldPercent: 100,
      hitFlashTimer: 0,
      patrolTimer: 0,
      healthBarMesh: hpBar,
      shieldBarMesh: shieldBar,
      warningIconMesh: warnIcon,
    });
  }

  /**
   * Friendly Calibration Training Robot (Hub Base)
   */
  private createTrainingDrone(id: string, nameAr: string, pos: Vector3): void {
    const root = new TransformNode(id, this.scene);
    root.position = pos.clone();

    const procDrone = createProceduralEnemyDrone(this.scene, id);
    procDrone.parent = root;

    AssetManager.getInstance()
      .loadAsset('enemyRobot', this.scene)
      .then(({ node, isFallback }) => {
        if (!isFallback && node) {
          const clone = node.clone(`${id}_glb_inst`, root);
          if (clone) {
            clone.position = new Vector3(0, 0, 0);
            clone.scaling.setAll(0.9);
            procDrone.setEnabled(false);
          }
        }
      })
      .catch(() => {});

    const { hpBar } = this.attachEnemyHUD(root, 80, false);

    this.enemies.push({
      id,
      type: 'training_drone',
      nameAr,
      node: root,
      meshRoot: procDrone,
      health: 80,
      maxHealth: 80,
      position: pos.clone(),
      velocity: new Vector3(0, 0, 0),
      patrolWaypoints: [pos.clone()],
      currentWaypointIndex: 0,
      state: 'patrol',
      attackCooldown: 9999, // Never attacks
      isShielded: false,
      shieldPercent: 0,
      hitFlashTimer: 0,
      patrolTimer: 0,
      isTraining: true,
      bobTime: 0,
      healthBarMesh: hpBar,
    });
  }

  /**
   * Attaches clean 3D floating billboard health and shield indicator bars
   */
  private attachEnemyHUD(
    parent: TransformNode,
    maxHp: number,
    hasShield: boolean
  ): { hpBar: Mesh; shieldBar?: Mesh; warnIcon?: Mesh } {
    const barHolder = new TransformNode('hp_holder', this.scene);
    barHolder.position.y = 2.4;
    barHolder.billboardMode = Mesh.BILLBOARDMODE_ALL;
    barHolder.parent = parent;

    // Background bar
    const bg = MeshBuilder.CreatePlane('hp_bg', { width: 1.2, height: 0.12 }, this.scene);
    bg.material = this.hpBarBgMat;
    bg.parent = barHolder;

    // Health Fill Bar
    const hpBar = MeshBuilder.CreatePlane('hp_fill', { width: 1.16, height: 0.08 }, this.scene);
    hpBar.material = this.hpBarGreenMat;
    hpBar.position.z = -0.01;
    hpBar.parent = barHolder;

    // Shield Bar (if armored)
    let shieldBar: Mesh | undefined;
    if (hasShield) {
      shieldBar = MeshBuilder.CreatePlane('shield_fill', { width: 1.16, height: 0.04 }, this.scene);
      shieldBar.material = this.hpBarShieldMat;
      shieldBar.position.y = 0.08;
      shieldBar.position.z = -0.02;
      shieldBar.parent = barHolder;
    }

    // Warning Indicator Triangle (Appears during attack telegraph)
    const warnIcon = MeshBuilder.CreateDisc('warn_icon', { radius: 0.22, tessellation: 3 }, this.scene);
    warnIcon.rotation.z = Math.PI; // Inverted exclamation triangle
    warnIcon.position.y = 0.32;
    warnIcon.material = this.warningIconMat;
    warnIcon.setEnabled(false);
    warnIcon.parent = barHolder;

    return { hpBar, shieldBar, warnIcon };
  }

  // --- PICKUPS DELEGATION ---
  public createPickup(id: string, type: FunctionalCollectibleType, pos: Vector3, val?: number): boolean {
    return this.pickupManager.spawnFixedPickup(id, type, pos, val);
  }

  // --- PLAYER COMBAT ---

  public firePlayerWeapon(
    playerPos: Vector3,
    playerRotationY: number,
    currentEnergy: number
  ): { fired: boolean; newEnergy: number } {
    if (this.playerFireCooldown > 0 || currentEnergy < 12) {
      return { fired: false, newEnergy: currentEnergy };
    }

    this.playerFireCooldown = 0.26;
    sounds.playLaserFire();

    // Direction vector from player yaw
    const dirX = Math.sin(playerRotationY);
    const dirZ = Math.cos(playerRotationY);
    const direction = new Vector3(dirX, 0, dirZ).normalize();

    const spawnPos = new Vector3(playerPos.x + dirX * 0.8, playerPos.y + 1.25, playerPos.z + dirZ * 0.8);

    // High-visibility cyan energy bolt
    const bolt = MeshBuilder.CreateSphere(
      `p_bolt_${Date.now()}_${Math.random()}`,
      { diameter: 0.38, segments: 8 },
      this.scene
    );
    bolt.position = spawnPos.clone();
    bolt.material = this.playerBoltMat;

    // Glowing motion trail
    const trail = MeshBuilder.CreateCylinder(`p_trail_${Date.now()}`, { diameter: 0.18, height: 0.8 }, this.scene);
    trail.rotation.x = Math.PI / 2;
    trail.position = new Vector3(0, 0, -0.4);
    trail.material = this.playerBoltMat;
    trail.parent = bolt;

    this.projectiles.push({
      id: `p_${Date.now()}`,
      source: 'player',
      mesh: bolt,
      position: spawnPos,
      velocity: direction.scale(28.0),
      damage: 22,
      lifespan: 1.2,
      radius: 0.45,
      trailMeshes: [trail],
    });

    return { fired: true, newEnergy: Math.max(0, currentEnergy - 12) };
  }

  // --- MAIN COMBAT SIMULATION LOOP ---

  public update(
    dt: number,
    playerPos: Vector3
  ): {
    playerDamageTaken: number;
    healthRecovered: number;
    energyRecovered: number;
    stabilityBonus: number;
    scoreBonus: number;
    bossDefeated: boolean;
    pickupsCollected: PickupNotificationEvent[];
  } {
    let playerDamageTaken = 0;
    let healthRecovered = 0;
    let energyRecovered = 0;
    let stabilityBonus = 0;
    let scoreBonus = 0;
    let bossDefeated = false;
    const pickupsCollected: PickupNotificationEvent[] = [];

    if (this.playerFireCooldown > 0) {
      this.playerFireCooldown = Math.max(0, this.playerFireCooldown - dt);
    }
    if (this.playerInvulnerabilityTimer > 0) {
      this.playerInvulnerabilityTimer = Math.max(0, this.playerInvulnerabilityTimer - dt);
    }

    // 1. Update Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.lifespan -= dt;
      p.position.addInPlace(p.velocity.scale(dt));
      p.mesh.position.copyFrom(p.position);

      let hasHit = false;

      // Projectile vs Player
      if (p.source !== 'player') {
        const distToPlayer = Vector3.Distance(p.position, new Vector3(playerPos.x, playerPos.y + 1.0, playerPos.z));
        if (distToPlayer < p.radius + 0.6) {
          hasHit = true;
          if (this.playerInvulnerabilityTimer <= 0) {
            playerDamageTaken += p.damage;
            this.playerInvulnerabilityTimer = 0.8;
            sounds.playPlayerHit();
          }
        }
      }

      // Projectile vs Enemies
      if (p.source === 'player') {
        for (const enemy of this.enemies) {
          if (enemy.state === 'defeated') continue;

          const distToEnemy = Vector3.Distance(
            p.position,
            new Vector3(enemy.position.x, enemy.position.y + 1.0, enemy.position.z)
          );

          const hitRadius = enemy.type === 'boss' ? 2.2 : (enemy.type === 'heavy_sentinel' || enemy.type === 'elite_warden' ? 1.5 : 1.0);

          if (distToEnemy < p.radius + hitRadius) {
            hasHit = true;
            sounds.playImpact();

            // Shield mitigation
            if (enemy.isShielded && enemy.shieldPercent > 0) {
              enemy.health -= Math.round(p.damage * 0.2);
              enemy.shieldPercent = Math.max(0, enemy.shieldPercent - 10);
            } else {
              enemy.health -= p.damage;
            }

            // Material hit flash
            enemy.hitFlashTimer = 0.15;
            if (enemy.meshRoot instanceof Mesh) {
              enemy.meshRoot.material = this.droneHitMat;
            }

            // Update floating health bar
            if (enemy.healthBarMesh) {
              const hpRatio = Math.max(0, enemy.health / enemy.maxHealth);
              enemy.healthBarMesh.scaling.x = hpRatio;
            }
            if (enemy.shieldBarMesh) {
              enemy.shieldBarMesh.scaling.x = Math.max(0, enemy.shieldPercent / 100);
            }

            // Defeat check
            if (enemy.health <= 0) {
              if (enemy.isTraining) {
                // Friendly training drone recovers instantly
                enemy.health = enemy.maxHealth;
                if (enemy.healthBarMesh) enemy.healthBarMesh.scaling.x = 1.0;
                sounds.playSuccess();
                scoreBonus += 25;
                energyRecovered += 20;
                pickupsCollected.push({
                  id: `train_${Date.now()}`,
                  type: 'energy',
                  nameAr: 'تمت معايرة السلاح التكتيكي بنجاح!',
                  value: 25,
                  icon: 'BatteryCharging',
                  timestamp: Date.now(),
                  detailAr: 'أصبت هدف التدريب. السلاح يعمل بكفاءة 100%.',
                });
              } else {
                enemy.health = 0;
                enemy.state = 'defeated';
                enemy.node.setEnabled(false);
                sounds.playImpact();

                // Dynamic destruction shockwave ring
                try {
                  const ring = MeshBuilder.CreateTorus(
                    `exp_${Date.now()}`,
                    { diameter: 0.8, thickness: 0.12, tessellation: 20 },
                    this.scene
                  );
                  ring.position = enemy.position.clone();
                  ring.material = this.droneHitMat;
                  let ringScale = 1.0;
                  const ringObs = this.scene.onBeforeRenderObservable.add(() => {
                    ringScale += 0.25;
                    ring.scaling.set(ringScale, ringScale, ringScale);
                    ring.visibility = Math.max(0, 1.0 - (ringScale - 1.0) / 2.5);
                    if (ringScale > 3.5) {
                      this.scene.onBeforeRenderObservable.remove(ringObs);
                      ring.dispose();
                    }
                  });
                } catch {}

                // Spawn reward pickup with controlled limits via PickupManager
                const dropType: FunctionalCollectibleType = Math.random() > 0.4 ? (Math.random() > 0.5 ? 'health' : 'energy') : 'ammo';
                this.pickupManager.spawnEnemyDrop(
                  dropType,
                  enemy.position,
                  playerPos,
                  enemy.type === 'boss' ? 50 : 25
                );

                if (enemy.type === 'boss') {
                  bossDefeated = true;
                }
              }
            }
            break;
          }
        }
      }

      // Check arena boundary collision
      const distFromCenter = Math.hypot(p.position.x, p.position.z);
      if (distFromCenter > 28.5) {
        hasHit = true;
      }

      // Clean up
      if (hasHit || p.lifespan <= 0) {
        p.mesh.dispose();
        p.trailMeshes?.forEach((t) => t.dispose());
        this.projectiles.splice(i, 1);
      }
    }

    // 2. Update Enemies AI
    for (const enemy of this.enemies) {
      if (enemy.state === 'defeated') continue;

      // Handle hit flash material reset
      if (enemy.hitFlashTimer > 0) {
        enemy.hitFlashTimer -= dt;
        if (enemy.hitFlashTimer <= 0 && enemy.meshRoot instanceof Mesh) {
          enemy.meshRoot.material =
            enemy.type === 'boss'
              ? this.bossHullMat
              : enemy.type === 'heavy_sentinel'
              ? this.sentinelHullMat
              : this.droneHullMat;
        }
      }

      const dx = playerPos.x - enemy.position.x;
      const dz = playerPos.z - enemy.position.z;
      const distToPlayer = Math.hypot(dx, dz);

      enemy.attackCooldown -= dt;

      // Update attack telegraph warning icon
      if (enemy.attackCooldown < 0.6 && enemy.attackCooldown > 0 && distToPlayer < 18.0 && !enemy.isTraining) {
        enemy.warningIconMesh?.setEnabled(true);
      } else {
        enemy.warningIconMesh?.setEnabled(false);
      }

      // AI Archetype Behaviors:

      // A) First-Stage Patrol Drone (Research Wing Alpha, Beta, Gamma)
      if (enemy.type === 'drone') {
        enemy.bobTime = (enemy.bobTime ?? 0) + dt * 3.5;
        const hoverY = enemy.position.y + Math.sin(enemy.bobTime) * 0.15;

        // Tutorial trigger on first encounter
        if (!this.hasTriggeredCombatTutorial && enemy.id === 'drone_alpha' && distToPlayer < 11.0) {
          this.hasTriggeredCombatTutorial = true;
          enemy.warningTimer = 2.0;
          sounds.playCriticalAlarm();
          pickupsCollected.push({
            id: `tut_${Date.now()}`,
            type: 'ammo',
            nameAr: 'تنبيه أمني: تم رصد طائرة حراسة أمنية معطلة!',
            value: 0,
            icon: 'Crosshair',
            timestamp: Date.now(),
            detailAr: 'اضغط F لإطلاق البلازما، وتجنب مقذوفات الطاقة المعادية.',
          });
        }

        if (enemy.warningTimer && enemy.warningTimer > 0) {
          enemy.warningTimer -= dt;
          enemy.node.rotation.y = Math.atan2(dx, dz);
          enemy.node.position.set(enemy.position.x, hoverY, enemy.position.z);
          continue;
        }

        if (distToPlayer < 14.0) {
          enemy.state = 'chase';
          const targetAngle = Math.atan2(dx, dz);
          enemy.node.rotation.y = targetAngle;
          enemy.node.rotation.z = Math.sin(enemy.bobTime) * 0.08;

          if (distToPlayer > 6.0) {
            const moveDir = new Vector3(dx, 0, dz).normalize();
            enemy.position.addInPlace(moveDir.scale(3.2 * dt));
          } else if (distToPlayer < 3.5) {
            const moveDir = new Vector3(-dx, 0, -dz).normalize();
            enemy.position.addInPlace(moveDir.scale(2.5 * dt));
          }

          if (enemy.attackCooldown <= 0) {
            enemy.attackCooldown = 2.2;
            this.spawnEnemyProjectile(enemy.position, playerPos, 12, 'drone');
          }
        } else {
          enemy.state = 'patrol';
          this.stepWaypoints(enemy, dt, 2.2);
        }
        enemy.node.position.set(enemy.position.x, hoverY, enemy.position.z);
      }

      // B) ENEMY TYPE 1: SECURITY SCOUT (Agile hover, evasive side-strafe, rapid light bolts)
      else if (enemy.type === 'scout') {
        enemy.bobTime = (enemy.bobTime ?? 0) + dt * 4.5;
        const hoverY = enemy.position.y + Math.sin(enemy.bobTime) * 0.22;
        enemy.evasionTimer = (enemy.evasionTimer ?? 0) - dt;

        if (distToPlayer < 16.0) {
          enemy.state = 'chase';
          const targetAngle = Math.atan2(dx, dz);
          enemy.node.rotation.y = targetAngle;

          // Evasive maneuver: strafe laterally when close
          if (enemy.evasionTimer! <= 0) {
            enemy.evasionTimer = 1.8;
          }
          const strafeDir = new Vector3(-dz, 0, dx).normalize().scale(Math.sin(enemy.bobTime * 2) * 3.5 * dt);
          enemy.position.addInPlace(strafeDir);

          if (distToPlayer > 5.5) {
            const moveDir = new Vector3(dx, 0, dz).normalize();
            enemy.position.addInPlace(moveDir.scale(4.0 * dt));
          } else if (distToPlayer < 4.0) {
            const moveDir = new Vector3(-dx, 0, -dz).normalize();
            enemy.position.addInPlace(moveDir.scale(3.0 * dt));
          }

          if (enemy.attackCooldown <= 0) {
            enemy.attackCooldown = 1.4; // Rapid light bursts
            this.spawnEnemyProjectile(enemy.position, playerPos, 9, 'scout');
          }
        } else {
          enemy.state = 'patrol';
          this.stepWaypoints(enemy, dt, 3.2);
        }
        enemy.node.position.set(enemy.position.x, hoverY, enemy.position.z);
      }

      // C) ENEMY TYPE 2: HEAVY SENTINEL (Armored ground titan, slow heavy movement, high impact cannon)
      else if (enemy.type === 'heavy_sentinel' || enemy.type === 'heavy_guard') {
        const targetAngle = Math.atan2(dx, dz);
        enemy.node.rotation.y = targetAngle;

        if (distToPlayer < 16.0) {
          enemy.state = 'chase';
          // Heavy slow advance
          if (distToPlayer > 5.0) {
            const moveDir = new Vector3(dx, 0, dz).normalize();
            enemy.position.addInPlace(moveDir.scale(1.5 * dt));
          }

          if (enemy.attackCooldown <= 0) {
            enemy.attackCooldown = 3.0; // Slow, high-damage heavy bolt
            this.spawnEnemyProjectile(enemy.position, playerPos, 22, 'sentinel');
          }
        } else {
          enemy.state = 'patrol';
          this.stepWaypoints(enemy, dt, 1.4);
        }
        enemy.node.position.copyFrom(enemy.position);
      }

      // D) ENEMY TYPE 3: RANGED GUARD (Maintains distance, retreats when approached, snipes)
      else if (enemy.type === 'ranged_guard') {
        const targetAngle = Math.atan2(dx, dz);
        enemy.node.rotation.y = targetAngle;

        if (distToPlayer < 20.0) {
          enemy.state = 'chase';

          // Actively back away if player rushes in closer than 8.0m!
          if (distToPlayer < 8.0) {
            const retreatDir = new Vector3(-dx, 0, -dz).normalize();
            enemy.position.addInPlace(retreatDir.scale(3.5 * dt));
          } else if (distToPlayer > 14.0) {
            const advanceDir = new Vector3(dx, 0, dz).normalize();
            enemy.position.addInPlace(advanceDir.scale(2.0 * dt));
          }

          if (enemy.attackCooldown <= 0) {
            enemy.attackCooldown = 2.4;
            this.spawnEnemyProjectile(enemy.position, playerPos, 14, 'ranged_guard');
          }
        } else {
          enemy.state = 'patrol';
          this.stepWaypoints(enemy, dt, 1.8);
        }
        enemy.node.position.copyFrom(enemy.position);
      }

      // E) ENEMY TYPE 4: ELITE SECURITY WARDEN (Multiple attack patterns: twin shot & 3-way spread)
      else if (enemy.type === 'elite_warden') {
        const targetAngle = Math.atan2(dx, dz);
        enemy.node.rotation.y = targetAngle;

        if (distToPlayer < 20.0) {
          enemy.state = 'chase';
          if (distToPlayer > 6.0) {
            const moveDir = new Vector3(dx, 0, dz).normalize();
            enemy.position.addInPlace(moveDir.scale(2.6 * dt));
          }

          if (enemy.attackCooldown <= 0) {
            enemy.attackCooldown = 2.2;
            // Alternating Attack Patterns:
            const pattern = Math.random() > 0.4 ? 'spread' : 'twin';
            if (pattern === 'spread') {
              // 3-way spread pattern
              const forward = new Vector3(dx, 0, dz).normalize();
              const leftAngle = targetAngle - 0.25;
              const rightAngle = targetAngle + 0.25;
              const leftDir = new Vector3(Math.sin(leftAngle), 0, Math.cos(leftAngle));
              const rightDir = new Vector3(Math.sin(rightAngle), 0, Math.cos(rightAngle));

              this.spawnDirectedBolt(enemy.position, forward, 15, 'elite');
              this.spawnDirectedBolt(enemy.position, leftDir, 12, 'elite');
              this.spawnDirectedBolt(enemy.position, rightDir, 12, 'elite');
            } else {
              // Twin heavy blasts
              this.spawnEnemyProjectile(new Vector3(enemy.position.x - 1.0, enemy.position.y + 1.2, enemy.position.z), playerPos, 16, 'elite');
              this.spawnEnemyProjectile(new Vector3(enemy.position.x + 1.0, enemy.position.y + 1.2, enemy.position.z), playerPos, 16, 'elite');
            }
          }
        } else {
          enemy.state = 'patrol';
          this.stepWaypoints(enemy, dt, 1.8);
        }
        enemy.node.position.copyFrom(enemy.position);
      }

      // F) FINAL BOSS: Automated Containment Warden (Reactor Titan)
      else if (enemy.type === 'boss') {
        const targetAngle = Math.atan2(dx, dz);
        enemy.node.rotation.y = targetAngle;

        if (enemy.attackCooldown <= 0 && distToPlayer < 24.0) {
          // Boss phase mechanics:
          const isPhase2 = enemy.health < enemy.maxHealth * 0.5;
          enemy.attackCooldown = isPhase2 ? 1.8 : 2.5;

          // Twin plasma blasts
          this.spawnEnemyProjectile(
            new Vector3(enemy.position.x - 1.2, enemy.position.y + 1.4, enemy.position.z),
            playerPos,
            isPhase2 ? 20 : 16,
            'boss'
          );
          this.spawnEnemyProjectile(
            new Vector3(enemy.position.x + 1.2, enemy.position.y + 1.4, enemy.position.z),
            playerPos,
            isPhase2 ? 20 : 16,
            'boss'
          );

          // Phase 2: additional overcharged central blast
          if (isPhase2) {
            setTimeout(() => {
              try {
                this.spawnEnemyProjectile(
                  new Vector3(enemy.position.x, enemy.position.y + 1.8, enemy.position.z),
                  playerPos,
                  24,
                  'boss'
                );
              } catch {}
            }, 250);
          }
        }
      }

      // G) Peaceful Hub Training Drone
      else if (enemy.type === 'training_drone') {
        enemy.bobTime = (enemy.bobTime ?? 0) + dt * 2.5;
        const hoverY = enemy.position.y + Math.sin(enemy.bobTime) * 0.12;
        enemy.node.rotation.y += dt * 0.6;
        enemy.node.position.set(enemy.position.x, hoverY, enemy.position.z);
      }
    }

    // 3. Update Ground Collectibles via Central PickupManager
    const collectedPickups = this.pickupManager.update(dt, playerPos);
    for (const pRes of collectedPickups) {
      healthRecovered += pRes.healthBonus;
      energyRecovered += pRes.energyBonus;
      if (pRes.ammoBonus > 0) {
        energyRecovered += pRes.ammoBonus;
        this.playerFireCooldown = 0;
      }
      stabilityBonus += pRes.stabilityBonus;
      scoreBonus += pRes.scoreBonus;
      pickupsCollected.push(pRes.collectedEvent);
    }

    return {
      playerDamageTaken,
      healthRecovered,
      energyRecovered,
      stabilityBonus,
      scoreBonus,
      bossDefeated,
      pickupsCollected,
    };
  }

  private stepWaypoints(enemy: EnemyEntity, dt: number, speed: number): void {
    if (enemy.patrolWaypoints.length === 0) return;
    const targetWP = enemy.patrolWaypoints[enemy.currentWaypointIndex];
    const toWP = targetWP.subtract(enemy.position);
    toWP.y = 0;
    const distWP = toWP.length();

    if (distWP < 0.6) {
      enemy.currentWaypointIndex = (enemy.currentWaypointIndex + 1) % enemy.patrolWaypoints.length;
    } else {
      const moveDir = toWP.normalize();
      enemy.position.addInPlace(moveDir.scale(speed * dt));
      enemy.node.rotation.y = Math.atan2(moveDir.x, moveDir.z);
    }
  }

  private spawnEnemyProjectile(
    from: Vector3,
    target: Vector3,
    damage: number,
    source: 'drone' | 'scout' | 'sentinel' | 'ranged_guard' | 'boss' | 'elite'
  ): void {
    sounds.playLaserFire();
    const spawnPos = new Vector3(from.x, from.y + 0.5, from.z);
    const targetCenter = new Vector3(target.x, target.y + 1.0, target.z);
    const direction = targetCenter.subtract(spawnPos).normalize();
    this.spawnDirectedBolt(spawnPos, direction, damage, source);
  }

  private spawnDirectedBolt(
    spawnPos: Vector3,
    direction: Vector3,
    damage: number,
    source: 'drone' | 'scout' | 'sentinel' | 'ranged_guard' | 'boss' | 'elite'
  ): void {
    let mat = this.scoutBoltMat;
    let diam = 0.4;
    let speed = 16.0;

    if (source === 'sentinel') {
      mat = this.sentinelBoltMat;
      diam = 0.55;
      speed = 14.0;
    } else if (source === 'ranged_guard') {
      mat = this.rangedBoltMat;
      diam = 0.38;
      speed = 22.0;
    } else if (source === 'elite') {
      mat = this.eliteBoltMat;
      diam = 0.5;
      speed = 18.0;
    } else if (source === 'boss') {
      mat = this.bossBoltMat;
      diam = 0.65;
      speed = 17.0;
    }

    const bolt = MeshBuilder.CreateSphere(
      `e_bolt_${Date.now()}_${Math.random()}`,
      { diameter: diam, segments: 8 },
      this.scene
    );
    bolt.position = spawnPos.clone();
    bolt.material = mat;

    // Glowing trail
    const trail = MeshBuilder.CreateCylinder(`e_trail_${Date.now()}`, { diameter: diam * 0.45, height: 0.8 }, this.scene);
    trail.rotation.x = Math.PI / 2;
    trail.position = new Vector3(0, 0, -0.4);
    trail.material = mat;
    trail.parent = bolt;

    this.projectiles.push({
      id: `e_${Date.now()}`,
      source,
      mesh: bolt,
      position: spawnPos,
      velocity: direction.scale(speed),
      damage,
      lifespan: 2.2,
      radius: diam * 0.6,
      trailMeshes: [trail],
    });
  }

  public setBossShieldLevel(percent: number): void {
    const boss = this.enemies.find((e) => e.type === 'boss');
    if (boss) {
      boss.shieldPercent = Math.max(0, Math.min(100, percent));
      boss.isShielded = boss.shieldPercent > 0;
      if (boss.shieldBarMesh) {
        boss.shieldBarMesh.scaling.x = boss.shieldPercent / 100;
      }
    }
  }

  public getBossInfo(): { health: number; maxHealth: number; shieldPercent: number; isDefeated: boolean } | null {
    const boss = this.enemies.find((e) => e.type === 'boss');
    if (!boss) return null;
    return {
      health: boss.health,
      maxHealth: boss.maxHealth,
      shieldPercent: boss.shieldPercent,
      isDefeated: boss.state === 'defeated',
    };
  }

  public getEnemies(): EnemyEntity[] {
    return this.enemies;
  }

  public reset(): void {
    this.projectiles.forEach((p) => {
      p.mesh.dispose();
      p.trailMeshes?.forEach((t) => t.dispose());
    });
    this.projectiles = [];

    this.pickupManager.clearActivePickups();

    this.enemies.forEach((e) => {
      e.healthBarMesh?.dispose();
      e.shieldBarMesh?.dispose();
      e.warningIconMesh?.dispose();
      e.node.dispose();
    });
    this.enemies = [];

    this.setupLocationCombat(this.currentLocationId);
    this.playerFireCooldown = 0;
    this.playerInvulnerabilityTimer = 0;
  }

  public dispose(): void {
    this.projectiles.forEach((p) => {
      p.mesh.dispose();
      p.trailMeshes?.forEach((t) => t.dispose());
    });
    this.projectiles = [];

    this.pickupManager.dispose();

    this.enemies.forEach((e) => {
      e.healthBarMesh?.dispose();
      e.shieldBarMesh?.dispose();
      e.warningIconMesh?.dispose();
      e.node.dispose();
    });
    this.enemies = [];
  }
}
