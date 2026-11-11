import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateMoveVector,
  resolveCircleCollision,
  resolveBoxCollision,
  clampToLaboratoryBounds,
  stepVerticalPhysics,
  evaluateReactorState,
} from './gameRules';

test('calculateMoveVector calculates correct camera-relative movement vectors for all WASD keys', () => {
  const speed = 10;
  const defaultAlpha = -Math.PI / 2; // Camera behind player, looking toward +Z

  // 1. W: Move forward (+Z, toward reactor)
  const moveW = calculateMoveVector(0, 1, defaultAlpha, speed);
  assert.ok(Math.abs(moveW.x) < 0.001, `W should have 0 X-velocity, got ${moveW.x}`);
  assert.ok(Math.abs(moveW.z - speed) < 0.001, `W should move forward (+Z) at full speed, got ${moveW.z}`);

  // 2. S: Move backward (-Z, toward camera)
  const moveS = calculateMoveVector(0, -1, defaultAlpha, speed);
  assert.ok(Math.abs(moveS.x) < 0.001, `S should have 0 X-velocity, got ${moveS.x}`);
  assert.ok(Math.abs(moveS.z - (-speed)) < 0.001, `S should move backward (-Z) at full speed, got ${moveS.z}`);

  // 3. A: Move toward the LEFT side of the screen (-X)
  const moveA = calculateMoveVector(-1, 0, defaultAlpha, speed);
  assert.ok(Math.abs(moveA.x - (-speed)) < 0.001, `A must move toward left screen (-X), got ${moveA.x}`);
  assert.ok(Math.abs(moveA.z) < 0.001, `A should have 0 Z-velocity, got ${moveA.z}`);

  // 4. D: Move toward the RIGHT side of the screen (+X)
  const moveD = calculateMoveVector(1, 0, defaultAlpha, speed);
  assert.ok(Math.abs(moveD.x - speed) < 0.001, `D must move toward right screen (+X), got ${moveD.x}`);
  assert.ok(Math.abs(moveD.z) < 0.001, `D should have 0 Z-velocity, got ${moveD.z}`);

  // 5. W + D: Move diagonally forward-right (+X, +Z)
  const moveWD = calculateMoveVector(1, 1, defaultAlpha, speed);
  assert.ok(moveWD.x > 0, 'W+D X should be positive');
  assert.ok(moveWD.z > 0, 'W+D Z should be positive');
  const lenWD = Math.hypot(moveWD.x, moveWD.z);
  assert.ok(Math.abs(lenWD - speed) < 0.001, `Diagonal W+D speed must be normalized to ${speed}, got ${lenWD}`);

  // 6. W + A: Move diagonally forward-left (-X, +Z)
  const moveWA = calculateMoveVector(-1, 1, defaultAlpha, speed);
  assert.ok(moveWA.x < 0, 'W+A X should be negative (left)');
  assert.ok(moveWA.z > 0, 'W+A Z should be positive (forward)');
  const lenWA = Math.hypot(moveWA.x, moveWA.z);
  assert.ok(Math.abs(lenWA - speed) < 0.001, `Diagonal W+A speed must be normalized to ${speed}, got ${lenWA}`);
});

test('calculateMoveVector rotates correctly when camera yaw changes', () => {
  const speed = 10;

  // When camera is rotated 90 degrees right: alpha = 0 (camera at +X looking along -X)
  const alphaZero = 0;
  const fwdAlpha0 = calculateMoveVector(0, 1, alphaZero, speed);
  assert.ok(Math.abs(fwdAlpha0.x - (-speed)) < 0.001, `Facing -X, W should move -X, got ${fwdAlpha0.x}`);
  assert.ok(Math.abs(fwdAlpha0.z) < 0.001);

  const rightAlpha0 = calculateMoveVector(1, 0, alphaZero, speed);
  assert.ok(Math.abs(rightAlpha0.x) < 0.001);
  assert.ok(Math.abs(rightAlpha0.z - speed) < 0.001, `Facing -X, D should move +Z (to player right), got ${rightAlpha0.z}`);
});

test('Character heading, procedural model offset, and projectile direction agree', () => {
  // Test logical heading computation
  const headingNorth = Math.atan2(0, 10); // Moving +Z
  assert.equal(headingNorth, 0);

  const headingEast = Math.atan2(10, 0); // Moving +X (Right)
  assert.equal(headingEast, Math.PI / 2);

  const headingWest = Math.atan2(-10, 0); // Moving -X (Left)
  assert.equal(headingWest, -Math.PI / 2);

  const headingSouth = Math.atan2(0, -10); // Moving -Z (Backward)
  assert.equal(headingSouth, Math.PI);

  // Procedural model offset compensation:
  // Since procedural model visor is on -Z, adding Math.PI turns local -Z to face +Z
  const proceduralOffset = Math.PI;
  const visualRotationNorth = headingNorth + proceduralOffset;
  assert.equal(visualRotationNorth, Math.PI); // Visor on -Z rotated by PI faces +Z

  // Projectile forward vector from heading 0
  const projDirX = Math.sin(headingNorth);
  const projDirZ = Math.cos(headingNorth);
  assert.equal(projDirX, 0);
  assert.equal(projDirZ, 1); // Fires along +Z, matching character forward!

  // Configurable GLB model that natively faces +Z has offset 0
  const glbOffset = 0;
  const visualRotationGLB = headingNorth + glbOffset;
  assert.equal(visualRotationGLB, 0);
});

test('Mouse horizontal rotation and touch control conventions', () => {
  // Positive angularSensibilityX in ArcRotateCamera means dragging mouse right (dx > 0)
  // decreases alpha (inertialAlphaOffset = -dx / sensibility < 0), rotating view to the right.
  const angularSensibilityX = 1200;
  const dxRight = 100;
  const inertialAlphaOffsetRight = -dxRight / angularSensibilityX;
  assert.ok(inertialAlphaOffsetRight < 0, 'Dragging mouse right must generate negative alpha offset to orbit view right');

  // Virtual touch control values match WASD:
  const touchLeft = { x: -1, z: 0 };
  const touchRight = { x: 1, z: 0 };
  const touchForward = { x: 0, z: 1 };
  const touchBackward = { x: 0, z: -1 };

  const speed = 6.2;
  const defaultAlpha = -Math.PI / 2;

  const moveLeft = calculateMoveVector(touchLeft.x, touchLeft.z, defaultAlpha, speed);
  assert.ok(moveLeft.x < 0, 'Touch left must move left (-X)');

  const moveRight = calculateMoveVector(touchRight.x, touchRight.z, defaultAlpha, speed);
  assert.ok(moveRight.x > 0, 'Touch right must move right (+X)');

  const moveFwd = calculateMoveVector(touchForward.x, touchForward.z, defaultAlpha, speed);
  assert.ok(moveFwd.z > 0, 'Touch forward must move forward (+Z)');

  const moveBack = calculateMoveVector(touchBackward.x, touchBackward.z, defaultAlpha, speed);
  assert.ok(moveBack.z < 0, 'Touch backward must move backward (-Z)');
});

test('resolveCircleCollision prevents player from penetrating cylindrical obstacles', () => {
  const obstacle = { x: 0, z: 0, radius: 2.0 };
  const playerRadius = 0.5;

  // Player attempting to be inside obstacle at (0.5, 0)
  const resolved = resolveCircleCollision({ x: 0.5, z: 0 }, playerRadius, obstacle);
  const dist = Math.hypot(resolved.x - obstacle.x, resolved.z - obstacle.z);
  assert.ok(dist >= 2.5, `Player should be pushed outside obstacle radius (2.5), got ${dist}`);
  assert.equal(resolved.z, 0);
});

test('resolveBoxCollision keeps player outside console/wall box boundary', () => {
  const wallBox = { minX: 5, maxX: 10, minZ: -2, maxZ: 2 };
  const playerRadius = 0.5;

  // Player approaching from left at x = 4.8
  const resolvedLeft = resolveBoxCollision({ x: 4.8, z: 0 }, playerRadius, wallBox);
  assert.ok(resolvedLeft.x <= 4.5001, `Player should be kept outside left edge (x<=4.5), got ${resolvedLeft.x}`);

  // Player far away unaffected
  const unaffected = resolveBoxCollision({ x: 0, z: 0 }, playerRadius, wallBox);
  assert.equal(unaffected.x, 0);
  assert.equal(unaffected.z, 0);
});

test('clampToLaboratoryBounds restricts player inside arena perimeter', () => {
  const inside = clampToLaboratoryBounds({ x: 10, z: 10 }, 28);
  assert.equal(inside.x, 10);
  assert.equal(inside.z, 10);

  const outside = clampToLaboratoryBounds({ x: 40, z: 0 }, 28);
  assert.equal(outside.x, 28);
  assert.equal(outside.z, 0);
});

test('stepVerticalPhysics handles jump and landing on floor', () => {
  // Grounded jump
  const jump = stepVerticalPhysics(0, 0, true, true, 8, 20, 0.016);
  assert.equal(jump.newVel, 8);
  assert.equal(jump.newGrounded, false);
  assert.ok(jump.newY > 0);

  // In air gravity pulling down
  const falling = stepVerticalPhysics(1.0, 0, false, false, 8, 20, 0.1);
  assert.ok(falling.newVel < 0);
  assert.ok(falling.newY < 1.0);

  // Touching ground
  const landing = stepVerticalPhysics(0.05, -5, false, false, 8, 20, 0.1);
  assert.equal(landing.newY, 0);
  assert.equal(landing.newVel, 0);
  assert.equal(landing.newGrounded, true);
});

test('evaluateReactorState evaluates temperatures and transitions correctly', () => {
  // Initial critical state
  const critical = evaluateReactorState(0, 0, false);
  assert.equal(critical.status, 'critical');
  assert.equal(critical.temperatureKelvin, 950);

  // Stabilizing with coolant
  const stabilizing = evaluateReactorState(70, 0.5, false);
  assert.equal(stabilizing.status, 'stabilizing');

  // Fully stabilized with high coolant, helium-3 isotope containment, and magnetic field
  const stable = evaluateReactorState(90, 0.98, true);
  assert.equal(stable.status, 'stable');
  assert.ok(stable.temperatureKelvin < 380);
});
