/**
 * LAB GUARDIAN - Advanced Camera Controller
 * Supports Third-Person and First-Person modes, centered HTML5 Pointer Lock,
 * hysteresis zoom thresholding, trauma camera shake, and configurable sensitivity.
 */

import { ArcRotateCamera, Scene, Vector3 } from '@babylonjs/core';
import { GAME_CONFIG } from '../config/gameConfig';
import { PlayerModel } from '../player/PlayerModel';

export type CameraMode = 'third-person' | 'first-person';

export class CameraController {
  public camera: ArcRotateCamera;
  private canvas: HTMLCanvasElement;
  private currentTarget: Vector3;
  private isCinematic: boolean = false;
  private cinematicAngle: number = 0;

  // First-person & Camera mode state
  public cameraMode: CameraMode = 'third-person';
  private playerModel: PlayerModel | null = null;
  public onCameraModeChange?: (mode: CameraMode) => void;

  // Pointer Lock state
  public isLocked: boolean = false;
  public onPointerLockChange?: (locked: boolean) => void;

  // Trauma camera shake
  public trauma: number = 0; // 0.0 to 1.0
  public screenEffectsEnabled: boolean = true;
  private shakeTimer: number = 0;

  // Sensitivity
  public sensitivityMultiplier: number = 1.0;
  private baseAngularSensibility: number = 1200;

  constructor(scene: Scene, canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.currentTarget = new Vector3(
      GAME_CONFIG.PLAYER.SPAWN_POSITION.x,
      GAME_CONFIG.CAMERA.TARGET_OFFSET_Y,
      GAME_CONFIG.PLAYER.SPAWN_POSITION.z
    );

    this.camera = new ArcRotateCamera(
      'MainGameCamera',
      GAME_CONFIG.CAMERA.DEFAULT_ALPHA,
      GAME_CONFIG.CAMERA.DEFAULT_BETA,
      GAME_CONFIG.CAMERA.DEFAULT_RADIUS,
      this.currentTarget.clone(),
      scene
    );

    // Initial camera limits
    this.camera.lowerRadiusLimit = GAME_CONFIG.CAMERA.MIN_RADIUS;
    this.camera.upperRadiusLimit = GAME_CONFIG.CAMERA.MAX_RADIUS;
    this.camera.lowerBetaLimit = GAME_CONFIG.CAMERA.MIN_BETA;
    this.camera.upperBetaLimit = GAME_CONFIG.CAMERA.MAX_BETA;
    this.camera.fov = GAME_CONFIG.CAMERA.FOV;

    // Smooth inertia and natural mouse camera orbit
    this.camera.inertia = 0.85;
    this.camera.angularSensibilityX = this.baseAngularSensibility; // Positive sensibility
    this.camera.angularSensibilityY = this.baseAngularSensibility;
    this.camera.wheelPrecision = 35;

    // Attach mouse controls
    this.camera.attachControl(canvas, true);

    // Setup HTML5 Pointer Lock event listeners
    this.handlePointerLockChange = this.handlePointerLockChange.bind(this);
    document.addEventListener('pointerlockchange', this.handlePointerLockChange);
  }

  public setPlayerModel(model: PlayerModel): void {
    this.playerModel = model;
  }

  // ==========================================
  // POINTER LOCK API
  // ==========================================

  public requestPointerLock(): void {
    try {
      if (this.canvas && document.pointerLockElement !== this.canvas) {
        this.canvas.requestPointerLock();
      }
    } catch {}
  }

  public exitPointerLock(): void {
    try {
      if (document.pointerLockElement) {
        document.exitPointerLock();
      }
    } catch {}
  }

  public togglePointerLock(): void {
    if (this.isPointerLocked()) {
      this.exitPointerLock();
    } else {
      this.requestPointerLock();
    }
  }

  public isPointerLocked(): boolean {
    return document.pointerLockElement === this.canvas;
  }

  private handlePointerLockChange(): void {
    const locked = document.pointerLockElement === this.canvas;
    this.isLocked = locked;
    if (this.onPointerLockChange) {
      this.onPointerLockChange(locked);
    }
  }

  // ==========================================
  // SENSITIVITY & CAMERA MODE
  // ==========================================

  public setSensitivity(factor: number): void {
    this.sensitivityMultiplier = Math.max(0.4, Math.min(2.5, factor));
    const effectiveSensibility = this.baseAngularSensibility / this.sensitivityMultiplier;
    this.camera.angularSensibilityX = effectiveSensibility;
    this.camera.angularSensibilityY = effectiveSensibility;
  }

  public setCameraMode(mode: CameraMode): void {
    if (this.cameraMode === mode) return;
    this.cameraMode = mode;

    if (mode === 'first-person') {
      // Enter First-Person mode
      this.camera.lowerRadiusLimit = 0.05;
      this.camera.radius = 0.05;
      this.camera.beta = 1.45; // Level horizon view
      if (this.playerModel) {
        this.playerModel.setFirstPersonVisible(false);
      }
    } else {
      // Enter Third-Person mode
      this.camera.lowerRadiusLimit = GAME_CONFIG.CAMERA.MIN_RADIUS;
      this.camera.radius = 4.8;
      this.camera.beta = GAME_CONFIG.CAMERA.DEFAULT_BETA;
      if (this.playerModel) {
        this.playerModel.setFirstPersonVisible(true);
      }
    }

    if (this.onCameraModeChange) {
      this.onCameraModeChange(this.cameraMode);
    }
  }

  public toggleCameraMode(): void {
    this.setCameraMode(this.cameraMode === 'third-person' ? 'first-person' : 'third-person');
  }

  public reset(immediateTarget?: Vector3): void {
    this.trauma = 0;
    this.setCameraMode('third-person');
    this.camera.alpha = GAME_CONFIG.CAMERA.DEFAULT_ALPHA;
    this.camera.radius = GAME_CONFIG.CAMERA.DEFAULT_RADIUS;
    this.camera.beta = GAME_CONFIG.CAMERA.DEFAULT_BETA;
    if (immediateTarget) {
      this.camera.target.copyFrom(immediateTarget);
      this.currentTarget.copyFrom(immediateTarget);
    }
  }

  // ==========================================
  // TRAUMA CAMERA SHAKE
  // ==========================================

  public addTrauma(amount: number): void {
    if (!this.screenEffectsEnabled) return;
    this.trauma = Math.min(1.0, this.trauma + amount);
  }

  public setCinematicMode(enabled: boolean): void {
    this.isCinematic = enabled;
    if (enabled) {
      this.exitPointerLock();
      this.camera.radius = 16.0;
      this.camera.beta = 1.15;
    } else {
      this.camera.alpha = GAME_CONFIG.CAMERA.DEFAULT_ALPHA;
      this.camera.radius = GAME_CONFIG.CAMERA.DEFAULT_RADIUS;
      this.camera.beta = GAME_CONFIG.CAMERA.DEFAULT_BETA;
    }
  }

  public update(playerPos: Vector3, dt: number): void {
    if (this.isCinematic) {
      this.cinematicAngle += dt * 0.15;
      this.camera.alpha = this.cinematicAngle;
      const reactorTarget = new Vector3(0, 3.2, 0);
      Vector3.LerpToRef(this.camera.target, reactorTarget, 0.05, this.camera.target);
      return;
    }

    // 1. Hysteresis zoom distance thresholding
    if (this.cameraMode === 'third-person' && this.camera.radius <= 1.4) {
      this.setCameraMode('first-person');
    } else if (this.cameraMode === 'first-person' && this.camera.radius >= 2.0) {
      this.setCameraMode('third-person');
    }

    // 2. Target offset based on camera mode (eye-level in FP, shoulder-level in TP)
    const targetOffsetY =
      this.cameraMode === 'first-person' ? 1.75 : GAME_CONFIG.CAMERA.TARGET_OFFSET_Y;
    let desiredTarget = new Vector3(playerPos.x, playerPos.y + targetOffsetY, playerPos.z);

    // 3. Trauma Camera Shake calculation
    if (this.trauma > 0 && this.screenEffectsEnabled) {
      this.trauma = Math.max(0, this.trauma - dt * 1.6);
      this.shakeTimer += dt * 35;
      const shakeMagnitude = this.trauma * this.trauma * 0.16;
      const offsetX = Math.sin(this.shakeTimer) * shakeMagnitude;
      const offsetY = Math.cos(this.shakeTimer * 1.3) * (shakeMagnitude * 0.6);
      const offsetZ = Math.sin(this.shakeTimer * 0.7) * shakeMagnitude;
      desiredTarget = desiredTarget.add(new Vector3(offsetX, offsetY, offsetZ));
    }

    const lerpSpeed = this.cameraMode === 'first-person' ? 0.35 : GAME_CONFIG.CAMERA.LERP_SPEED;
    Vector3.LerpToRef(this.camera.target, desiredTarget, lerpSpeed, this.camera.target);
  }

  public getAlpha(): number {
    return this.camera.alpha;
  }

  public dispose(): void {
    document.removeEventListener('pointerlockchange', this.handlePointerLockChange);
    this.exitPointerLock();
    this.camera.dispose();
  }
}
