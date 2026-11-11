/**
 * LAB GUARDIAN - Item & Pickup System Types
 * Clean Three-Category Object Architecture:
 * CATEGORY A: Functional Collectibles (Health, Energy, Ammo, Access Key)
 * CATEGORY B: Environmental Decorations (Scenery only - no glow, no pickup icons, no prompts)
 * CATEGORY C: Functional Interactable Objects (Consoles, Doors, Terminals, Portals)
 */

import { Mesh, TransformNode, Vector3 } from '@babylonjs/core';

export type FunctionalCollectibleType = 'health' | 'energy' | 'ammo' | 'keycard';

export interface CollectibleDefinition {
  type: FunctionalCollectibleType;
  nameAr: string;
  effectDescriptionAr: string;
  iconName: 'HeartPulse' | 'BatteryCharging' | 'Crosshair' | 'KeyRound';
  assetId: string;
  defaultValue: number;
  collectionRadius: number;
  lifespanSeconds: number; // For enemy drops; 0 = persistent fixed pickup
}

export const COLLECTIBLE_DEFINITIONS: Record<FunctionalCollectibleType, CollectibleDefinition> = {
  health: {
    type: 'health',
    nameAr: 'خلية استعادة الصحة',
    effectDescriptionAr: 'تم استعادة +25 من صحة البذلة الواقية',
    iconName: 'HeartPulse',
    assetId: 'pickupHealth',
    defaultValue: 25,
    collectionRadius: 1.8,
    lifespanSeconds: 50,
  },
  energy: {
    type: 'energy',
    nameAr: 'خلية شحن الطاقة',
    effectDescriptionAr: 'تم شحن +40 من طاقة أنظمة البذلة',
    iconName: 'BatteryCharging',
    assetId: 'pickupEnergy',
    defaultValue: 40,
    collectionRadius: 1.8,
    lifespanSeconds: 50,
  },
  ammo: {
    type: 'ammo',
    nameAr: 'مكثف طاقة البلازما التكتيكي',
    effectDescriptionAr: 'شحن فوري لطاقة السلاح (+50) والتبريد الفوري لأنظمة الإطلاق',
    iconName: 'Crosshair',
    assetId: 'pickupAmmo',
    defaultValue: 50,
    collectionRadius: 1.8,
    lifespanSeconds: 50,
  },
  keycard: {
    type: 'keycard',
    nameAr: 'شريحة استقرار النواة الأيونية',
    effectDescriptionAr: 'تثبيت طاقة المفاعل (+10% استقرار) ومنح +150 نقطة أمان',
    iconName: 'KeyRound',
    assetId: 'pickupKeycard',
    defaultValue: 10,
    collectionRadius: 2.0,
    lifespanSeconds: 0, // Persistent fixed pickup
  },
};

export interface ActiveCollectible {
  id: string;
  type: FunctionalCollectibleType;
  nameAr: string;
  effectDescriptionAr: string;
  iconName: string;
  value: number;
  position: Vector3;
  meshRoot: Mesh | TransformNode;
  isEnemyDrop: boolean;
  lifespanRemaining: number;
  bobTime: number;
}

export interface PickupCollectResult {
  collectedEvent: {
    id: string;
    type: FunctionalCollectibleType;
    nameAr: string;
    value: number;
    icon: string;
    timestamp: number;
    detailAr: string;
  };
  healthBonus: number;
  energyBonus: number;
  ammoBonus: number;
  stabilityBonus: number;
  scoreBonus: number;
}

export interface EnemyDropProbability {
  healthChance: number;
  energyChance: number;
  ammoChance: number;
  noDropChance: number;
}
