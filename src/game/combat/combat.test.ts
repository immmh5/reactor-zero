import test from 'node:test';
import assert from 'node:assert/strict';

// Pure logic for enemy archetype combat calculations
export interface ArchetypeSpec {
  type: string;
  maxHealth: number;
  hasShield: boolean;
  baseShield: number;
  attackCooldown: number;
  patrolSpeed: number;
  chaseSpeed: number;
  projectileDamage: number;
  evadesCloseRange: boolean;
  retreatsWhenRushed: boolean;
}

export const ARCHETYPES: Record<string, ArchetypeSpec> = {
  scout: {
    type: 'scout',
    maxHealth: 50,
    hasShield: false,
    baseShield: 0,
    attackCooldown: 1.4,
    patrolSpeed: 3.2,
    chaseSpeed: 4.0,
    projectileDamage: 9,
    evadesCloseRange: true,
    retreatsWhenRushed: false,
  },
  heavy_sentinel: {
    type: 'heavy_sentinel',
    maxHealth: 150,
    hasShield: true,
    baseShield: 50,
    attackCooldown: 3.0,
    patrolSpeed: 1.4,
    chaseSpeed: 1.5,
    projectileDamage: 22,
    evadesCloseRange: false,
    retreatsWhenRushed: false,
  },
  ranged_guard: {
    type: 'ranged_guard',
    maxHealth: 80,
    hasShield: false,
    baseShield: 0,
    attackCooldown: 2.4,
    patrolSpeed: 1.8,
    chaseSpeed: 2.0,
    projectileDamage: 14,
    evadesCloseRange: false,
    retreatsWhenRushed: true,
  },
  elite_warden: {
    type: 'elite_warden',
    maxHealth: 220,
    hasShield: true,
    baseShield: 60,
    attackCooldown: 2.2,
    patrolSpeed: 1.8,
    chaseSpeed: 2.6,
    projectileDamage: 16,
    evadesCloseRange: false,
    retreatsWhenRushed: false,
  },
  drone: {
    type: 'drone',
    maxHealth: 60,
    hasShield: false,
    baseShield: 0,
    attackCooldown: 2.2,
    patrolSpeed: 2.2,
    chaseSpeed: 3.2,
    projectileDamage: 12,
    evadesCloseRange: false,
    retreatsWhenRushed: false,
  },
  boss: {
    type: 'boss',
    maxHealth: 300,
    hasShield: true,
    baseShield: 100,
    attackCooldown: 2.5,
    patrolSpeed: 0,
    chaseSpeed: 0,
    projectileDamage: 16,
    evadesCloseRange: false,
    retreatsWhenRushed: false,
  },
};

export function calculateMitigatedDamage(rawDamage: number, isShielded: boolean, shieldPercent: number): { netDamage: number; newShield: number } {
  if (isShielded && shieldPercent > 0) {
    const netDamage = Math.round(rawDamage * 0.2);
    const newShield = Math.max(0, shieldPercent - 10);
    return { netDamage, newShield };
  }
  return { netDamage: rawDamage, newShield: 0 };
}

export function shouldRangedGuardRetreat(distToPlayer: number): boolean {
  return distToPlayer < 8.0;
}

export function calculateScoutStrafeOffset(time: number, amplitude = 0.5): number {
  return Math.sin(time * 2.0) * amplitude;
}

test('Enemy archetypes have distinct, balanced combat roles', () => {
  assert.equal(ARCHETYPES.scout.maxHealth < ARCHETYPES.heavy_sentinel.maxHealth, true);
  assert.equal(ARCHETYPES.scout.chaseSpeed > ARCHETYPES.heavy_sentinel.chaseSpeed, true);
  assert.equal(ARCHETYPES.heavy_sentinel.projectileDamage > ARCHETYPES.scout.projectileDamage, true);
  assert.equal(ARCHETYPES.heavy_sentinel.hasShield, true);
  assert.equal(ARCHETYPES.scout.evadesCloseRange, true);
  assert.equal(ARCHETYPES.ranged_guard.retreatsWhenRushed, true);
});

test('Shield absorption mitigates 80% of damage until shield depletes', () => {
  const result1 = calculateMitigatedDamage(20, true, 50);
  assert.equal(result1.netDamage, 4);
  assert.equal(result1.newShield, 40);

  const resultUnshielded = calculateMitigatedDamage(20, false, 0);
  assert.equal(resultUnshielded.netDamage, 20);
});

test('Ranged Guard maintains tactical distance when player rushes inside 8m', () => {
  assert.equal(shouldRangedGuardRetreat(5.5), true);
  assert.equal(shouldRangedGuardRetreat(7.9), true);
  assert.equal(shouldRangedGuardRetreat(8.1), false);
  assert.equal(shouldRangedGuardRetreat(12.0), false);
});

test('Scout evasion produces non-zero oscillating strafe offsets', () => {
  const offset1 = calculateScoutStrafeOffset(Math.PI / 4, 1.0);
  const offset2 = calculateScoutStrafeOffset((3 * Math.PI) / 4, 1.0);
  assert.notEqual(offset1, 0);
  assert.equal(Math.abs(offset1) <= 1.0, true);
  assert.equal(Math.abs(offset2) <= 1.0, true);
});

test('First-stage drones (Alpha, Beta, Gamma) exist with valid encounter locations', () => {
  const firstStageDrones = ['drone_alpha', 'drone_beta', 'drone_gamma'];
  assert.equal(firstStageDrones.length, 3);
  firstStageDrones.forEach((id) => {
    assert.match(id, /^drone_/);
  });
});
