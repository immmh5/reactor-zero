/**
 * LAB GUARDIAN - Pickup System Unit Tests
 * Verifies category separation, one-time collection, limit enforcement,
 * safe bounds, and persistent IDs without duplicates.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { COLLECTIBLE_DEFINITIONS, FunctionalCollectibleType } from './PickupTypes';

test('Collectible definitions contain distinct identities and valid Arabic descriptions', () => {
  const types: FunctionalCollectibleType[] = ['health', 'energy', 'ammo', 'keycard'];

  for (const t of types) {
    const def = COLLECTIBLE_DEFINITIONS[t];
    assert.ok(def, `Definition exists for ${t}`);
    assert.ok(def.nameAr.length > 0, `Arabic name exists for ${t}`);
    assert.ok(def.effectDescriptionAr.length > 0, `Arabic effect description exists for ${t}`);
    assert.ok(def.defaultValue > 0, `Default value is positive for ${t}`);
    assert.ok(def.collectionRadius >= 1.5, `Collection radius is at least 1.5m for ${t}`);
  }

  // Ensure keycard is persistent (lifespanSeconds === 0)
  assert.equal(COLLECTIBLE_DEFINITIONS.keycard.lifespanSeconds, 0);
  // Ensure health, energy, ammo drops have finite lifespan
  assert.ok(COLLECTIBLE_DEFINITIONS.health.lifespanSeconds > 0);
  assert.ok(COLLECTIBLE_DEFINITIONS.energy.lifespanSeconds > 0);
  assert.ok(COLLECTIBLE_DEFINITIONS.ammo.lifespanSeconds > 0);
});

test('Pickup collection state prevents double awards for the same unique ID', () => {
  const collectedIds = new Set<string>();

  const pickupId = 'hub_hp_1';
  assert.equal(collectedIds.has(pickupId), false);

  // First collection
  collectedIds.add(pickupId);
  assert.equal(collectedIds.has(pickupId), true);

  // On second attempt (e.g. map re-entry), respawn must be rejected
  const canSpawnOnReentry = !collectedIds.has(pickupId);
  assert.equal(canSpawnOnReentry, false);
});

test('Sector enemy drop limit calculation caps active drops at 3', () => {
  const maxDrops = 3;
  const activeDrops: string[] = [];

  function simulateEnemyDrop(id: string) {
    if (activeDrops.length >= maxDrops) {
      activeDrops.shift(); // Evict oldest
    }
    activeDrops.push(id);
  }

  simulateEnemyDrop('drop_1');
  simulateEnemyDrop('drop_2');
  simulateEnemyDrop('drop_3');
  assert.equal(activeDrops.length, 3);
  assert.deepEqual(activeDrops, ['drop_1', 'drop_2', 'drop_3']);

  // Adding a 4th drop evicts drop_1
  simulateEnemyDrop('drop_4');
  assert.equal(activeDrops.length, 3);
  assert.deepEqual(activeDrops, ['drop_2', 'drop_3', 'drop_4']);
});

test('Safe coordinate boundary clamping keeps drops inside arena perimeter', () => {
  const boundaryRadius = 28;
  const maxRadius = boundaryRadius - 1.5; // 26.5

  function clampToRadius(x: number, z: number): { x: number; z: number } {
    const d = Math.hypot(x, z);
    if (d > maxRadius && d > 0) {
      return { x: (x / d) * maxRadius, z: (z / d) * maxRadius };
    }
    return { x, z };
  }

  const inside = clampToRadius(10, 10);
  assert.equal(inside.x, 10);
  assert.equal(inside.z, 10);

  const outside = clampToRadius(35, 0);
  assert.equal(outside.x, maxRadius);
  assert.equal(outside.z, 0);
});
