/**
 * LAB GUARDIAN - Central Pickup Manager
 * Controls all ground collectibles, prevents clutter and duplicate spawning,
 * enforces sector drop limits, handles lifespan expiration and disposal,
 * and maintains persistent one-time collection across map transitions.
 */

import { Scene, Vector3, TransformNode, Mesh } from '@babylonjs/core';
import {
  ActiveCollectible,
  COLLECTIBLE_DEFINITIONS,
  CollectibleDefinition,
  FunctionalCollectibleType,
  PickupCollectResult,
} from './PickupTypes';
import { AssetManager } from '../assets/AssetManager';
import { LocationId } from '../campaign/CampaignTypes';
import { BoundingCircle, BoundingBox2D } from '../rules/gameRules';
import { sounds } from '../audio/SoundEffects';

export class PickupManager {
  private scene: Scene;
  private activePickups: Map<string, ActiveCollectible> = new Map();
  private collectedPickupIds: Set<string> = new Set();
  private maxEnemyDropsPerSector: number = 3;
  private currentSectorId: LocationId = 'hub';

  // Environmental boundaries for safe spawning
  private boundaryRadius: number = 28;
  private obstacleCircles: BoundingCircle[] = [];
  private obstacleBoxes: BoundingBox2D[] = [];

  constructor(scene: Scene) {
    this.scene = scene;
  }

  public setSectorContext(
    sectorId: LocationId,
    boundaryRadius: number,
    circles: BoundingCircle[] = [],
    boxes: BoundingBox2D[] = []
  ): void {
    this.currentSectorId = sectorId;
    this.boundaryRadius = boundaryRadius;
    this.obstacleCircles = circles;
    this.obstacleBoxes = boxes;
  }

  /**
   * Loads previously collected IDs from persistent save data
   */
  public loadCollectedIds(ids: string[]): void {
    this.collectedPickupIds = new Set(ids);
  }

  /**
   * Returns list of all collected pickup IDs for persistence
   */
  public getCollectedIds(): string[] {
    return Array.from(this.collectedPickupIds);
  }

  public isPickupCollected(id: string): boolean {
    return this.collectedPickupIds.has(id);
  }

  /**
   * Spawns a fixed, persistent collectible in the sector if not already collected.
   */
  public spawnFixedPickup(
    id: string,
    type: FunctionalCollectibleType,
    position: Vector3,
    customValue?: number
  ): boolean {
    // 1. One-time collection check: never respawn on map re-entry if already taken
    if (this.collectedPickupIds.has(id)) {
      return false;
    }

    // 2. Prevent duplicate active instances
    if (this.activePickups.has(id)) {
      return false;
    }

    const def: CollectibleDefinition = COLLECTIBLE_DEFINITIONS[type];
    const val = customValue ?? def.defaultValue;

    // Validate safe coordinate
    const safePos = this.ensureSafeCoordinates(position);

    // Instantiate 3D GLB model
    const pickupRoot = AssetManager.getInstance().instantiateAsset(def.assetId, id, this.scene);
    pickupRoot.position = safePos.clone();

    this.activePickups.set(id, {
      id,
      type,
      nameAr: def.nameAr,
      effectDescriptionAr: def.effectDescriptionAr,
      iconName: def.iconName,
      value: val,
      position: safePos,
      meshRoot: pickupRoot,
      isEnemyDrop: false,
      lifespanRemaining: 0, // 0 = permanent until collected
      bobTime: Math.random() * Math.PI * 2,
    });

    return true;
  }

  /**
   * Spawns an enemy-dropped collectible with sector limit, safety checks, and expiration.
   */
  public spawnEnemyDrop(
    type: FunctionalCollectibleType,
    spawnOrigin: Vector3,
    playerPos: Vector3,
    dropValue?: number
  ): boolean {
    // 1. Enforce strict sector limit (Max 3 active enemy drops per sector)
    const currentEnemyDropsCount = this.getActiveEnemyDropsCount();
    if (currentEnemyDropsCount >= this.maxEnemyDropsPerSector) {
      // Remove the oldest enemy drop to prevent clutter
      this.removeOldestEnemyDrop();
    }

    // 2. Prevent dropping directly under the player (offset radially if too close)
    let dropPos = spawnOrigin.clone();
    dropPos.y = 0.8;
    const distToPlayer = Vector3.Distance(new Vector3(dropPos.x, 0, dropPos.z), new Vector3(playerPos.x, 0, playerPos.z));
    if (distToPlayer < 1.8) {
      const away = new Vector3(dropPos.x - playerPos.x, 0, dropPos.z - playerPos.z).normalize();
      if (away.length() < 0.1) {
        away.set(1, 0, 0);
      }
      dropPos.addInPlace(away.scale(2.0));
    }

    // 3. Prevent dropping inside obstacles or outside boundary
    dropPos = this.ensureSafeCoordinates(dropPos);

    // 4. Prevent duplicate drops at identical location (must be at least 1.2m apart)
    for (const active of this.activePickups.values()) {
      if (Vector3.Distance(active.position, dropPos) < 1.2) {
        // Shift slightly in an open direction
        dropPos.x += 1.4;
        dropPos = this.ensureSafeCoordinates(dropPos);
      }
    }

    const def = COLLECTIBLE_DEFINITIONS[type];
    const dropId = `drop_${this.currentSectorId}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const pickupRoot = AssetManager.getInstance().instantiateAsset(def.assetId, dropId, this.scene);
    pickupRoot.position = dropPos.clone();

    this.activePickups.set(dropId, {
      id: dropId,
      type,
      nameAr: def.nameAr,
      effectDescriptionAr: def.effectDescriptionAr,
      iconName: def.iconName,
      value: dropValue ?? def.defaultValue,
      position: dropPos,
      meshRoot: pickupRoot,
      isEnemyDrop: true,
      lifespanRemaining: def.lifespanSeconds,
      bobTime: Math.random() * Math.PI * 2,
    });

    return true;
  }

  /**
   * Main per-frame update loop:
   * - Animates floating/rotation
   * - Checks collection proximity against player
   * - Decrements lifespan of enemy drops and disposes expired ones
   */
  public update(dt: number, playerPos: Vector3): PickupCollectResult[] {
    const results: PickupCollectResult[] = [];
    const idsToRemove: string[] = [];

    for (const [id, pickup] of this.activePickups.entries()) {
      // 1. Bobbing and floating rotation
      pickup.bobTime += dt * 3.0;
      pickup.meshRoot.rotation.y += dt * 2.2;
      pickup.meshRoot.position.y = pickup.position.y + Math.sin(pickup.bobTime) * 0.15;

      // 2. Lifespan check for temporary enemy drops
      if (pickup.isEnemyDrop) {
        pickup.lifespanRemaining -= dt;

        // Visual blinking warning during the final 6 seconds
        if (pickup.lifespanRemaining <= 6.0) {
          const blink = Math.sin(pickup.lifespanRemaining * 12) > 0 ? 0.9 : 0.2;
          this.setNodeVisibility(pickup.meshRoot, blink);
        }

        if (pickup.lifespanRemaining <= 0) {
          idsToRemove.push(id);
          continue;
        }
      }

      // 3. Collection distance check
      const def = COLLECTIBLE_DEFINITIONS[pickup.type];
      const dist = Vector3.Distance(
        new Vector3(playerPos.x, playerPos.y + 0.8, playerPos.z),
        pickup.meshRoot.position
      );

      if (dist <= def.collectionRadius) {
        // Collect!
        sounds.playPickup(pickup.type);
        this.collectedPickupIds.add(id);

        let healthBonus = 0;
        let energyBonus = 0;
        let ammoBonus = 0;
        let stabilityBonus = 0;
        let scoreBonus = 0;

        if (pickup.type === 'health') {
          healthBonus = pickup.value;
        } else if (pickup.type === 'energy') {
          energyBonus = pickup.value;
        } else if (pickup.type === 'ammo') {
          ammoBonus = pickup.value; // +50 Weapon plasma energy & instant cooldown reset
          energyBonus = 0;
        } else if (pickup.type === 'keycard') {
          stabilityBonus = 10;
          scoreBonus = 150;
        }

        results.push({
          collectedEvent: {
            id: pickup.id,
            type: pickup.type,
            nameAr: pickup.nameAr,
            value: pickup.value,
            icon: pickup.iconName,
            timestamp: Date.now(),
            detailAr: pickup.effectDescriptionAr,
          },
          healthBonus,
          energyBonus,
          ammoBonus,
          stabilityBonus,
          scoreBonus,
        });

        idsToRemove.push(id);
      }
    }

    // Dispose and remove collected or expired pickups
    for (const id of idsToRemove) {
      const p = this.activePickups.get(id);
      if (p) {
        p.meshRoot.dispose(false, true);
        this.activePickups.delete(id);
      }
    }

    return results;
  }

  public getActiveCount(): number {
    return this.activePickups.size;
  }

  public getActiveEnemyDropsCount(): number {
    let count = 0;
    for (const p of this.activePickups.values()) {
      if (p.isEnemyDrop) count++;
    }
    return count;
  }

  private removeOldestEnemyDrop(): void {
    let oldestId: string | null = null;
    let minLifespan = Infinity;

    for (const [id, p] of this.activePickups.entries()) {
      if (p.isEnemyDrop && p.lifespanRemaining < minLifespan) {
        minLifespan = p.lifespanRemaining;
        oldestId = id;
      }
    }

    if (oldestId) {
      const p = this.activePickups.get(oldestId);
      if (p) {
        p.meshRoot.dispose(false, true);
        this.activePickups.delete(oldestId);
      }
    }
  }

  /**
   * Clamps position within arena perimeter and adjusts if inside obstacles
   */
  private ensureSafeCoordinates(pos: Vector3): Vector3 {
    const safe = pos.clone();
    const maxRadius = this.boundaryRadius - 1.5;
    const currentDist = Math.hypot(safe.x, safe.z);

    if (currentDist > maxRadius && currentDist > 0) {
      safe.x = (safe.x / currentDist) * maxRadius;
      safe.z = (safe.z / currentDist) * maxRadius;
    }

    // Check cylinder obstacles
    for (const circ of this.obstacleCircles) {
      const dx = safe.x - circ.x;
      const dz = safe.z - circ.z;
      const d = Math.hypot(dx, dz);
      const safeDist = circ.radius + 1.2;
      if (d < safeDist && d > 0) {
        safe.x = circ.x + (dx / d) * safeDist;
        safe.z = circ.z + (dz / d) * safeDist;
      }
    }

    // Check box obstacles
    for (const box of this.obstacleBoxes) {
      if (safe.x >= box.minX && safe.x <= box.maxX && safe.z >= box.minZ && safe.z <= box.maxZ) {
        // Shift outside nearest box face
        const dMinX = Math.abs(safe.x - box.minX);
        const dMaxX = Math.abs(safe.x - box.maxX);
        const dMinZ = Math.abs(safe.z - box.minZ);
        const dMaxZ = Math.abs(safe.z - box.maxZ);
        const minEdge = Math.min(dMinX, dMaxX, dMinZ, dMaxZ);
        if (minEdge === dMinX) safe.x = box.minX - 1.2;
        else if (minEdge === dMaxX) safe.x = box.maxX + 1.2;
        else if (minEdge === dMinZ) safe.z = box.minZ - 1.2;
        else safe.z = box.maxZ + 1.2;
      }
    }

    return safe;
  }

  private setNodeVisibility(node: TransformNode | Mesh, visibility: number): void {
    if (node instanceof Mesh) {
      node.visibility = visibility;
    }
    const children = node.getChildMeshes ? node.getChildMeshes() : [];
    children.forEach((c) => {
      c.visibility = visibility;
    });
  }

  /**
   * Cleans all ground meshes on map transition or reset.
   * Does NOT forget collected IDs.
   */
  public clearActivePickups(): void {
    for (const p of this.activePickups.values()) {
      p.meshRoot.dispose(false, true);
    }
    this.activePickups.clear();
  }

  /**
   * Total reset for New Game
   */
  public resetAll(): void {
    this.clearActivePickups();
    this.collectedPickupIds.clear();
  }

  public dispose(): void {
    this.clearActivePickups();
  }
}
