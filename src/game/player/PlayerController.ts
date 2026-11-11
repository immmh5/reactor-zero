/**
 * LAB GUARDIAN - Player Controller
 * Manages player physics, collision resolution, camera-relative movement, and audio triggers
 */

import { Scene, Vector3 } from '@babylonjs/core';
import { PlayerModel } from './PlayerModel';
import { InputManager } from '../input/InputManager';
import { GAME_CONFIG } from '../config/gameConfig';
import { sounds } from '../audio/SoundEffects';
import {
  calculateMoveVector,
  clampToLaboratoryBounds,
  resolveCircleCollision,
  resolveBoxCollision,
  stepVerticalPhysics,
  BoundingCircle,
  BoundingBox2D,
} from '../rules/gameRules';

export class PlayerController {
  public model: PlayerModel;
  private scene: Scene;
  private input: InputManager;

  // Position & Velocity
  private posX: number = GAME_CONFIG.PLAYER.SPAWN_POSITION.x;
  private posY: number = GAME_CONFIG.PLAYER.SPAWN_POSITION.y;
  private posZ: number = GAME_CONFIG.PLAYER.SPAWN_POSITION.z;

  private velX: number = 0;
  private velY: number = 0;
  private velZ: number = 0;

  private currentRotationY: number = 0;
  private isGrounded: boolean = true;
  private isMoving: boolean = false;
  private isSprinting: boolean = false;

  // Audio timers
  private footstepTimer: number = 0;

  // Scene obstacles registered from environment builder
  private circularObstacles: BoundingCircle[] = [];
  private boxObstacles: BoundingBox2D[] = [];
  private currentBoundaryRadius: number = GAME_CONFIG.WORLD.ARENA_RADIUS;

  // Vitals
  public health: number = 100;
  public energy: number = 100;

  constructor(scene: Scene, input: InputManager) {
    this.scene = scene;
    this.input = input;
    this.model = new PlayerModel(scene);
    this.model.setPosition(this.posX, this.posY, this.posZ);
  }

  public setObstacles(circles: BoundingCircle[], boxes: BoundingBox2D[], boundaryRadius?: number): void {
    this.circularObstacles = circles;
    this.boxObstacles = boxes;
    if (boundaryRadius !== undefined && boundaryRadius > 0) {
      this.currentBoundaryRadius = boundaryRadius;
    }
  }

  public setPosition(x: number, y: number, z: number, rotY: number = 0): void {
    this.posX = x;
    this.posY = y;
    this.posZ = z;
    this.velX = 0;
    this.velY = 0;
    this.velZ = 0;
    this.isGrounded = true;
    this.currentRotationY = rotY;
    this.model.setPosition(this.posX, this.posY, this.posZ);
    this.model.setRotationY(this.currentRotationY);
  }

  public resetPosition(): void {
    this.posX = GAME_CONFIG.PLAYER.SPAWN_POSITION.x;
    this.posY = GAME_CONFIG.PLAYER.SPAWN_POSITION.y;
    this.posZ = GAME_CONFIG.PLAYER.SPAWN_POSITION.z;
    this.velX = 0;
    this.velY = 0;
    this.velZ = 0;
    this.isGrounded = true;
    this.currentRotationY = 0;
    this.model.setPosition(this.posX, this.posY, this.posZ);
    this.model.setRotationY(this.currentRotationY);
  }

  public update(dt: number, cameraAlpha: number): void {
    // 1. Process horizontal inputs
    const raw = this.input.getRawMovement();
    this.isSprinting = this.input.isSprinting() && (raw.x !== 0 || raw.z !== 0);

    const targetSpeed = this.isSprinting
      ? GAME_CONFIG.PLAYER.SPRINT_SPEED
      : GAME_CONFIG.PLAYER.WALK_SPEED;

    const moveVec = calculateMoveVector(raw.x, raw.z, cameraAlpha, targetSpeed);

    // Smooth horizontal acceleration and damping
    const accel = this.isGrounded ? 18.0 : 8.0;
    this.velX += (moveVec.x - this.velX) * Math.min(1.0, accel * dt);
    this.velZ += (moveVec.z - this.velZ) * Math.min(1.0, accel * dt);

    const speedSq = this.velX * this.velX + this.velZ * this.velZ;
    this.isMoving = speedSq > 0.05;

    // 2. Process vertical physics (jump and gravity)
    const wasGrounded = this.isGrounded;
    const jumpRequested = this.input.isJumpJustPressed();

    if (this.isGrounded && jumpRequested) {
      sounds.playJump();
    }

    const vertStep = stepVerticalPhysics(
      this.posY,
      this.velY,
      this.isGrounded,
      jumpRequested,
      GAME_CONFIG.PLAYER.JUMP_STRENGTH,
      GAME_CONFIG.PLAYER.GRAVITY,
      dt
    );

    this.posY = vertStep.newY;
    this.velY = vertStep.newVel;
    this.isGrounded = vertStep.newGrounded;

    if (!wasGrounded && this.isGrounded) {
      sounds.playLand();
    }

    // 3. Integrate horizontal position
    let nextX = this.posX + this.velX * dt;
    let nextZ = this.posZ + this.velZ * dt;

    // 4. Resolve static collisions against circular obstacles (reactor, columns)
    const playerRadius = GAME_CONFIG.PLAYER.RADIUS;
    for (const circle of this.circularObstacles) {
      const resolved = resolveCircleCollision({ x: nextX, z: nextZ }, playerRadius, circle);
      nextX = resolved.x;
      nextZ = resolved.z;
    }

    // 5. Resolve static collisions against box obstacles (consoles, barrier walls)
    for (const box of this.boxObstacles) {
      const resolved = resolveBoxCollision({ x: nextX, z: nextZ }, playerRadius, box);
      nextX = resolved.x;
      nextZ = resolved.z;
    }

    // 6. Restrict inside lab boundary perimeter
    const bounded = clampToLaboratoryBounds({ x: nextX, z: nextZ }, this.currentBoundaryRadius);
    this.posX = bounded.x;
    this.posZ = bounded.z;

    // 7. Smoothly face movement heading
    if (this.isMoving) {
      // In 3D: atan2(dx, dz) gives rotation around Y axis
      const targetAngle = Math.atan2(this.velX, this.velZ);
      let angleDiff = targetAngle - this.currentRotationY;

      // Wrap angle difference to [-PI, PI]
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

      // Delta-time independent exponential smoothing for natural turning
      const turnFactor = 1 - Math.exp(-14.0 * dt);
      this.currentRotationY += angleDiff * turnFactor;
    }

    // 8. Update 3D model transform and procedural animations
    this.model.setPosition(this.posX, this.posY, this.posZ);
    this.model.setRotationY(this.currentRotationY);
    this.model.updateAnimation(this.isMoving, this.isSprinting, this.isGrounded, dt);

    // 9. Footstep audio rhythm
    if (this.isGrounded && this.isMoving) {
      this.footstepTimer += dt;
      const interval = this.isSprinting ? 0.28 : 0.42;
      if (this.footstepTimer >= interval) {
        this.footstepTimer = 0;
        sounds.playFootstep();
      }
    } else {
      this.footstepTimer = 0.2;
    }

    // 10. Slow passive energy regeneration
    if (this.energy < 100) {
      this.energy = Math.min(100, this.energy + dt * 6);
    }
  }

  public getPosition(): Vector3 {
    return new Vector3(this.posX, this.posY, this.posZ);
  }

  public getRotationY(): number {
    return this.currentRotationY;
  }

  public faceDirection(targetAngle: number): void {
    this.currentRotationY = targetAngle;
    this.model.setRotationY(this.currentRotationY);
  }

  public getIsMoving(): boolean {
    return this.isMoving;
  }

  public getIsSprinting(): boolean {
    return this.isSprinting;
  }

  public getIsGrounded(): boolean {
    return this.isGrounded;
  }

  public dispose(): void {
    this.model.dispose();
  }
}
