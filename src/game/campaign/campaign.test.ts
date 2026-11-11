import test from 'node:test';
import assert from 'node:assert/strict';
import { CampaignManager } from './CampaignManager';

test('CampaignManager initializes 5 locations with proper defaults including Academy', () => {
  const mgr = new CampaignManager();
  const locs = mgr.getAllLocations();
  assert.equal(locs.length, 5, 'Should contain exactly 5 locations (Hub, Academy, Research Wing, Refinery, Vault)');

  const hub = mgr.getLocation('hub');
  assert.ok(hub);
  assert.equal(hub.isUnlocked, true, 'Hub must be unlocked by default');
  assert.equal(hub.isCompleted, false);

  const academy = mgr.getLocation('academy');
  assert.ok(academy);
  assert.equal(academy.isUnlocked, true, 'Stoichiometry Academy must be accessible from Hub by default');

  const research = mgr.getLocation('research_wing');
  assert.ok(research);
  assert.equal(research.isUnlocked, true, 'Research Wing must be unlocked for the first mission');

  const refinery = mgr.getLocation('refinery');
  assert.ok(refinery);
  assert.equal(refinery.isUnlocked, false, 'Refinery should be locked initially');

  const vault = mgr.getLocation('vault');
  assert.ok(vault);
  assert.equal(vault.isUnlocked, false, 'Vault should be locked initially');

  assert.equal(mgr.getCurrentLocationId(), 'hub');
  assert.equal(mgr.isCampaignFinished(), false);
});

test('CampaignManager unlocking progression requires BOTH story missions AND certification exams', () => {
  const mgr = new CampaignManager();

  // Initially refinery is locked
  assert.equal(mgr.isLocationUnlocked('refinery'), false);

  // Complete Mission 1 (Equation Research)
  mgr.registerMissionCompletion(1);
  // Refinery requires Tier 1 Exam in Academy before opening!
  assert.equal(mgr.isLocationUnlocked('refinery'), false, 'Refinery requires both Mission 1 AND Tier 1 Exam');

  // Pass Tier 1 Exam in Stoichiometry Academy!
  const exam1Res = mgr.registerExamPassed('exam_tier_1');
  assert.ok(exam1Res.newUnlocks.includes('refinery'), 'Passing Tier 1 Exam with Mission 1 unlocks refinery');
  assert.equal(mgr.isLocationUnlocked('refinery'), true);

  // Complete Mission 2 (Mass Balance)
  mgr.registerMissionCompletion(2);
  assert.equal(mgr.isLocationUnlocked('vault'), false, 'Vault requires missions 2 & 3 and Tier 2 Exam');

  // Complete Mission 3 (Mole Ratios)
  mgr.registerMissionCompletion(3);
  assert.equal(mgr.isLocationUnlocked('vault'), false, 'Vault still requires Tier 2 Exam');

  // Pass Tier 2 Exam in Stoichiometry Academy!
  const exam2Res = mgr.registerExamPassed('exam_tier_2');
  assert.ok(exam2Res.newUnlocks.includes('vault'), 'Passing Tier 2 Exam unlocks vault');
  assert.equal(mgr.isLocationUnlocked('vault'), true);

  // Complete Mission 4 (Matrix n(n-1))
  mgr.registerMissionCompletion(4);
  assert.equal(mgr.isCampaignFinished(), false);

  // Complete Mission 5 & Pass Tier 3 Exam & Defeat Boss
  mgr.registerMissionCompletion(5);
  mgr.registerExamPassed('exam_tier_3');
  mgr.setBossDefeated(true);
  assert.equal(mgr.isCampaignFinished(), true);
});

test('CampaignManager location switching respects unlock permissions', () => {
  const mgr = new CampaignManager();

  // Cannot switch to locked vault directly
  const switchVault = mgr.setCurrentLocation('vault');
  assert.equal(switchVault, false);
  assert.equal(mgr.getCurrentLocationId(), 'hub');

  // Can switch to unlocked academy
  const switchAcademy = mgr.setCurrentLocation('academy');
  assert.equal(switchAcademy, true);
  assert.equal(mgr.getCurrentLocationId(), 'academy');

  // Can switch to unlocked research_wing
  const switchResearch = mgr.setCurrentLocation('research_wing');
  assert.equal(switchResearch, true);
  assert.equal(mgr.getCurrentLocationId(), 'research_wing');

  // Can return to hub
  const switchHub = mgr.setCurrentLocation('hub');
  assert.equal(switchHub, true);
  assert.equal(mgr.getCurrentLocationId(), 'hub');
});

test('CampaignManager resetCampaign restores clean initial state', () => {
  const mgr = new CampaignManager();
  mgr.registerMissionCompletion(1);
  mgr.registerExamPassed('exam_tier_1');
  mgr.setCurrentLocation('refinery');

  assert.equal(mgr.isLocationUnlocked('refinery'), true);
  assert.equal(mgr.getCurrentLocationId(), 'refinery');

  mgr.resetCampaign();

  assert.equal(mgr.getCurrentLocationId(), 'hub');
  assert.equal(mgr.isLocationUnlocked('refinery'), false);
  assert.equal(mgr.isLocationUnlocked('vault'), false);
  assert.equal(mgr.isCampaignFinished(), false);
  assert.equal(mgr.getCompletedLocationsCount(), 0);
});

test('CampaignManager locations have valid spawn coordinates and positive boundary radii', () => {
  const mgr = new CampaignManager();
  const locs = mgr.getAllLocations();

  for (const loc of locs) {
    assert.ok(typeof loc.nameAr === 'string' && loc.nameAr.length > 0);
    assert.ok(typeof loc.codenameAr === 'string' && loc.codenameAr.length > 0);
    assert.ok(typeof loc.spawnPosition.x === 'number');
    assert.ok(typeof loc.spawnPosition.y === 'number');
    assert.ok(typeof loc.spawnPosition.z === 'number');
    assert.ok(loc.boundaryRadius >= 20, `Boundary radius for ${loc.id} must be at least 20m`);

    // Verify spawn point is inside boundary radius
    const spawnDist = Math.hypot(loc.spawnPosition.x, loc.spawnPosition.z);
    assert.ok(
      spawnDist < loc.boundaryRadius,
      `Spawn position for ${loc.id} (dist: ${spawnDist}) must be inside boundaryRadius (${loc.boundaryRadius})`
    );
  }
});

test('CampaignManager tracks playtime accumulation', () => {
  const mgr = new CampaignManager();
  assert.equal(mgr.getPlayTimeSeconds(), 0);

  mgr.addPlayTime(1.5);
  mgr.addPlayTime(2.6);
  assert.equal(mgr.getPlayTimeSeconds(), 4);
});
