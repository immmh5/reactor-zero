/**
 * LAB GUARDIAN - Combat System Types
 * Expanded enemy archetypes, projectile ballistics, floating health bars, and combat readability
 */

import { Mesh, TransformNode, Vector3 } from '@babylonjs/core';

export interface Projectile {
  id: string;
  source: 'player' | 'drone' | 'scout' | 'sentinel' | 'ranged_guard' | 'boss' | 'elite';
  mesh: Mesh;
  position: Vector3;
  velocity: Vector3;
  damage: number;
  lifespan: number; // remaining seconds
  radius: number;
  trailMeshes?: Mesh[];
}

export type EnemyType =
  | 'drone'
  | 'scout'
  | 'heavy_sentinel'
  | 'heavy_guard'
  | 'ranged_guard'
  | 'elite_warden'
  | 'boss'
  | 'training_drone';

export interface EnemyEntity {
  id: string;
  type: EnemyType;
  nameAr: string;
  node: TransformNode;
  meshRoot: Mesh | TransformNode;
  health: number;
  maxHealth: number;
  position: Vector3;
  velocity: Vector3;
  patrolWaypoints: Vector3[];
  currentWaypointIndex: number;
  state: 'patrol' | 'chase' | 'attack' | 'reposition' | 'evade' | 'defeated';
  attackCooldown: number;
  isShielded: boolean;
  shieldPercent: number;
  hitFlashTimer: number;
  patrolTimer: number;
  warningTimer?: number;
  attackTelegraphTimer?: number;
  evasionTimer?: number;
  repositionTimer?: number;
  isTraining?: boolean;
  bobTime?: number;
  visualModel?: TransformNode;
  healthBarMesh?: Mesh;
  shieldBarMesh?: Mesh;
  warningIconMesh?: Mesh;
  isTargeted?: boolean;
}

export type PickupType = 'health' | 'energy' | 'ammo' | 'keycard';

export interface NanoPickup {
  id: string;
  type: PickupType;
  nameAr: string;
  descriptionAr: string;
  icon: string;
  mesh: Mesh | TransformNode;
  position: Vector3;
  value: number;
  lifespan: number;
  bobTime: number;
}

export interface PickupNotificationEvent {
  id: string;
  type: PickupType;
  nameAr: string;
  value: number;
  icon: string;
  timestamp: number;
  detailAr?: string;
}
