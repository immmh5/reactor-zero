/**
 * LAB GUARDIAN - Progression Validator Unit Tests
 * Verifies strict sequential unlocking, exam prerequisites, and save migration.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { ProgressionValidator } from './ProgressionValidator';
import { LocationId } from './CampaignTypes';

test('Initial state: Hub, Academy, and Research Wing are unlocked; Refinery and Vault are strictly locked', () => {
  const missions = new Set<number>();
  const exams = new Set<string>();
  const locs = new Set<LocationId>();

  const hubStatus = ProgressionValidator.evaluateLocationStatus('hub', missions, exams, locs, false);
  assert.equal(hubStatus.isUnlocked, true);

  const academyStatus = ProgressionValidator.evaluateLocationStatus('academy', missions, exams, locs, false);
  assert.equal(academyStatus.isUnlocked, true);

  const rwStatus = ProgressionValidator.evaluateLocationStatus('research_wing', missions, exams, locs, false);
  assert.equal(rwStatus.isUnlocked, true);

  const refStatus = ProgressionValidator.evaluateLocationStatus('refinery', missions, exams, locs, false);
  assert.equal(refStatus.isUnlocked, false);
  assert.equal(refStatus.lockReason, 'need_prev_mission');
  assert.equal(refStatus.statusLabelAr, 'تحتاج إنهاء المهمة السابقة');

  const vaultStatus = ProgressionValidator.evaluateLocationStatus('vault', missions, exams, locs, false);
  assert.equal(vaultStatus.isUnlocked, false);
  assert.equal(vaultStatus.lockReason, 'need_prev_mission');
});

test('Refinery requires BOTH Mission 1 AND Tier 1 Exam to unlock', () => {
  const missions = new Set<number>();
  const exams = new Set<string>();
  const locs = new Set<LocationId>();

  // Only Mission 1 completed -> still locked, needs exam!
  missions.add(1);
  const refStatusWithMissionOnly = ProgressionValidator.evaluateLocationStatus('refinery', missions, exams, locs, false);
  assert.equal(refStatusWithMissionOnly.isUnlocked, false);
  assert.equal(refStatusWithMissionOnly.lockReason, 'need_exam');
  assert.equal(refStatusWithMissionOnly.statusLabelAr, 'تحتاج اجتياز اختبار التأهيل');

  // Passing Exam 1 unlocks Refinery!
  exams.add('exam_tier_1');
  const refStatusUnlocked = ProgressionValidator.evaluateLocationStatus('refinery', missions, exams, locs, false);
  assert.equal(refStatusUnlocked.isUnlocked, true);
  assert.equal(refStatusUnlocked.lockReason, 'none');
});

test('Vault requires BOTH Missions 2 & 3 AND Tier 2 Exam to unlock', () => {
  const missions = new Set<number>([1]);
  const exams = new Set<string>(['exam_tier_1']);
  const locs = new Set<LocationId>(['research_wing']);

  // Complete Mission 2 only -> still locked
  missions.add(2);
  let vaultStatus = ProgressionValidator.evaluateLocationStatus('vault', missions, exams, locs, false);
  assert.equal(vaultStatus.isUnlocked, false);
  assert.equal(vaultStatus.lockReason, 'need_prev_mission');

  // Complete Mission 3 -> needs Exam 2
  missions.add(3);
  vaultStatus = ProgressionValidator.evaluateLocationStatus('vault', missions, exams, locs, false);
  assert.equal(vaultStatus.isUnlocked, false);
  assert.equal(vaultStatus.lockReason, 'need_exam');
  assert.equal(vaultStatus.statusLabelAr, 'تحتاج اجتياز اختبار التأهيل');

  // Pass Tier 2 Exam -> Vault unlocks!
  exams.add('exam_tier_2');
  vaultStatus = ProgressionValidator.evaluateLocationStatus('vault', missions, exams, locs, false);
  assert.equal(vaultStatus.isUnlocked, true);
  assert.equal(vaultStatus.lockReason, 'none');
});

test('canTransitionTo strictly rejects unauthorized jumps', () => {
  const missions = new Set<number>();
  const exams = new Set<string>();
  const locs = new Set<LocationId>();

  const jumpToVault = ProgressionValidator.canTransitionTo('vault', missions, exams, locs, false);
  assert.equal(jumpToVault.allowed, false);

  const jumpToRefinery = ProgressionValidator.canTransitionTo('refinery', missions, exams, locs, false);
  assert.equal(jumpToRefinery.allowed, false);

  const jumpToHub = ProgressionValidator.canTransitionTo('hub', missions, exams, locs, false);
  assert.equal(jumpToHub.allowed, true);

  const jumpToAcademy = ProgressionValidator.canTransitionTo('academy', missions, exams, locs, false);
  assert.equal(jumpToAcademy.allowed, true);
});

test('Save migration strips unauthorized locks from corrupted or old localStorage', () => {
  // If an old save erroneously has "vault" unlocked without exams/missions
  const rawUnlocked: LocationId[] = ['hub', 'research_wing', 'refinery', 'vault'];
  const completedMissions: number[] = [1];
  const passedExams: string[] = []; // No exams passed

  const migrated = ProgressionValidator.sanitizeAndMigrateSave(rawUnlocked, completedMissions, passedExams);
  // Refinery and Vault must be stripped!
  assert.deepEqual(migrated.sanitizedUnlocked, ['hub', 'academy', 'research_wing']);
});
