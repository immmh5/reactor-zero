/**
 * LAB GUARDIAN - Pure Game Rules & Physics Calculations
 * Decoupled from WebGL/Babylon for fast, deterministic unit testing
 */

export interface Vector2D {
  x: number;
  z: number;
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface BoundingCircle {
  x: number;
  z: number;
  radius: number;
}

export interface BoundingBox2D {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface ReactorState {
  temperatureKelvin: number; // Normal: ~300K, Max critical: 1200K, Target: <450K
  coolantPressurePercent: number; // 0 - 100
  isotopeContainmentRatio: number; // 0 - 1.0 (1.0 = stabilized)
  magneticFieldActive: boolean;
  status: 'critical' | 'unstable' | 'stabilizing' | 'stable';
}

export interface ChemistryTask {
  id: string;
  name: string;
  elementSymbol: string;
  targetMoles: number;
  completed: boolean;
}

/**
 * Calculates world movement direction based on WASD input and camera azimuth (yaw) angle
 */
export function calculateMoveVector(
  inputX: number, // -1 (A) to +1 (D)
  inputZ: number, // -1 (S) to +1 (W)
  cameraAlpha: number, // Camera horizontal angle (yaw in radians)
  speed: number
): Vector2D {
  const len = Math.hypot(inputX, inputZ);
  if (len < 0.001) {
    return { x: 0, z: 0 };
  }

  // Normalize input
  const nx = inputX / len;
  const nz = inputZ / len;

  // In Babylon ArcRotateCamera, alpha is horizontal angle around target.
  const sinA = Math.sin(cameraAlpha);
  const cosA = Math.cos(cameraAlpha);

  // Forward unit vector on XZ plane
  const fwdX = -cosA;
  const fwdZ = -sinA;

  // Right unit vector on XZ plane: Up x Forward where Up = (0, 1, 0)
  // (0, 1, 0) x (fwdX, 0, fwdZ) = (fwdZ, 0, -fwdX) = (-sinA, 0, cosA)
  const rightX = -sinA;
  const rightZ = cosA;

  const worldX = (fwdX * nz + rightX * nx) * speed;
  const worldZ = (fwdZ * nz + rightZ * nx) * speed;

  return { x: worldX, z: worldZ };
}

/**
 * Resolves player collision with a static circular obstacle (e.g. reactor pillar, console)
 */
export function resolveCircleCollision(
  playerPos: Vector2D,
  playerRadius: number,
  obstacle: BoundingCircle
): Vector2D {
  const dx = playerPos.x - obstacle.x;
  const dz = playerPos.z - obstacle.z;
  const dist = Math.hypot(dx, dz);
  const minAllowed = playerRadius + obstacle.radius;

  if (dist < minAllowed) {
    if (dist < 0.0001) {
      return { x: obstacle.x + minAllowed, z: obstacle.z };
    }
    const overlap = minAllowed - dist;
    const nx = dx / dist;
    const nz = dz / dist;
    return {
      x: playerPos.x + nx * overlap,
      z: playerPos.z + nz * overlap,
    };
  }

  return { x: playerPos.x, z: playerPos.z };
}

/**
 * Resolves player collision with an axis-aligned bounding box (room walls, machinery)
 */
export function resolveBoxCollision(
  playerPos: Vector2D,
  playerRadius: number,
  box: BoundingBox2D
): Vector2D {
  const closestX = Math.max(box.minX, Math.min(playerPos.x, box.maxX));
  const closestZ = Math.max(box.minZ, Math.min(playerPos.z, box.maxZ));

  const dx = playerPos.x - closestX;
  const dz = playerPos.z - closestZ;
  const dist = Math.hypot(dx, dz);

  if (dist < playerRadius) {
    if (dist > 0.0001) {
      const overlap = playerRadius - dist;
      return {
        x: playerPos.x + (dx / dist) * overlap,
        z: playerPos.z + (dz / dist) * overlap,
      };
    } else {
      const toMinX = Math.abs(playerPos.x - box.minX);
      const toMaxX = Math.abs(playerPos.x - box.maxX);
      const toMinZ = Math.abs(playerPos.z - box.minZ);
      const toMaxZ = Math.abs(playerPos.z - box.maxZ);
      const minDistance = Math.min(toMinX, toMaxX, toMinZ, toMaxZ);

      if (minDistance === toMinX) return { x: box.minX - playerRadius, z: playerPos.z };
      if (minDistance === toMaxX) return { x: box.maxX + playerRadius, z: playerPos.z };
      if (minDistance === toMinZ) return { x: playerPos.x, z: box.minZ - playerRadius };
      return { x: playerPos.x, z: box.maxZ + playerRadius };
    }
  }

  return { x: playerPos.x, z: playerPos.z };
}

/**
 * Clamps coordinates within laboratory outer boundary
 */
export function clampToLaboratoryBounds(
  pos: Vector2D,
  boundaryRadius: number = 28
): Vector2D {
  const dist = Math.hypot(pos.x, pos.z);
  if (dist > boundaryRadius) {
    const scale = boundaryRadius / dist;
    return { x: pos.x * scale, z: pos.z * scale };
  }
  return { x: pos.x, z: pos.z };
}

/**
 * Calculates vertical jump and gravity update for physics step
 */
export function stepVerticalPhysics(
  currentY: number,
  verticalVelocity: number,
  isGrounded: boolean,
  jumpRequested: boolean,
  jumpStrength: number = 7.5,
  gravity: number = 19.6,
  dt: number = 0.016
): { newY: number; newVel: number; newGrounded: boolean } {
  let vel = verticalVelocity;
  let grounded = isGrounded;

  if (grounded && jumpRequested) {
    vel = jumpStrength;
    grounded = false;
  } else if (!grounded) {
    vel -= gravity * dt;
  }

  let newY = currentY + vel * dt;

  // Floor level is 0
  if (newY <= 0) {
    newY = 0;
    vel = 0;
    grounded = true;
  }

  return { newY, newVel: vel, newGrounded: grounded };
}

/**
 * Updates reactor status based on current stabilization parameters
 */
export function evaluateReactorState(
  coolantPressure: number,
  isotopeRatio: number,
  magneticField: boolean
): ReactorState {
  let temp = 950;

  temp -= (coolantPressure / 100) * 450;
  temp -= isotopeRatio * 200;

  if (magneticField) {
    temp -= 60;
  }

  temp = Math.max(295, Math.round(temp));

  let status: ReactorState['status'] = 'critical';
  if (temp <= 380 && magneticField && isotopeRatio >= 0.95 && coolantPressure >= 85) {
    status = 'stable';
  } else if (temp <= 580 && coolantPressure >= 60) {
    status = 'stabilizing';
  } else if (temp <= 780) {
    status = 'unstable';
  }

  return {
    temperatureKelvin: temp,
    coolantPressurePercent: coolantPressure,
    isotopeContainmentRatio: isotopeRatio,
    magneticFieldActive: magneticField,
    status,
  };
}
