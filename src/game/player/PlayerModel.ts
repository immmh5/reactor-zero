/**
 * LAB GUARDIAN - Player Model Component
 * Manages the 3D character hierarchy, procedural limb animation, and future GLB integration
 */

import { Scene, TransformNode, Vector3 } from '@babylonjs/core';
import {
  createProceduralHumanoidPlayer,
  PlayerProceduralHierarchy,
} from '../assets/FallbackModels';
import { ASSET_MANIFEST } from '../assets/AssetManifest';

export class PlayerModel {
  public rootNode: TransformNode;
  private hierarchy: PlayerProceduralHierarchy | null = null;
  private walkCycleTime: number = 0;

  /**
   * Local forward orientation offset.
   * Procedural model's visor was built facing -Z, so Math.PI compensates to make logical 0 face +Z.
   * For GLB models, reads from ASSET_MANIFEST.player.orientationOffset (defaults to 0 for +Z models).
   */
  public orientationOffset: number;

  constructor(scene: Scene, customRootNode?: TransformNode, orientationOffset?: number) {
    if (orientationOffset !== undefined) {
      this.orientationOffset = orientationOffset;
    } else if (customRootNode) {
      this.orientationOffset = ASSET_MANIFEST.player.orientationOffset ?? 0;
    } else {
      this.orientationOffset = Math.PI;
    }

    if (customRootNode) {
      this.rootNode = customRootNode;
    } else {
      this.hierarchy = createProceduralHumanoidPlayer(scene, 'player_hero');
      this.rootNode = this.hierarchy.root;
    }
  }

  public setPosition(x: number, y: number, z: number): void {
    this.rootNode.position.set(x, y, z);
  }

  public setRotationY(angleRadians: number): void {
    this.rootNode.rotation.y = angleRadians + this.orientationOffset;
  }

  public getVisualRotationY(): number {
    return this.rootNode.rotation.y;
  }

  /**
   * Procedural limb swinging and breathing animations
   */
  public updateAnimation(
    isMoving: boolean,
    isSprinting: boolean,
    isGrounded: boolean,
    dt: number
  ): void {
    if (!this.hierarchy) return;

    const { leftArm, rightArm, leftLeg, rightLeg, torso } = this.hierarchy;

    if (!isGrounded) {
      // In-air jump pose: legs bent, arms raised slightly
      leftLeg.rotation.x = -0.35;
      rightLeg.rotation.x = 0.25;
      leftArm.rotation.x = -0.5;
      rightArm.rotation.x = -0.5;
      torso.position.y = 1.3;
      return;
    }

    if (isMoving) {
      const cycleSpeed = isSprinting ? 14.0 : 8.5;
      const legAmplitude = isSprinting ? 0.65 : 0.42;
      const armAmplitude = isSprinting ? 0.55 : 0.35;

      this.walkCycleTime += dt * cycleSpeed;
      const swing = Math.sin(this.walkCycleTime);

      leftLeg.rotation.x = swing * legAmplitude;
      rightLeg.rotation.x = -swing * legAmplitude;

      leftArm.rotation.x = -swing * armAmplitude;
      rightArm.rotation.x = swing * armAmplitude;

      // Subtle torso bobbing
      torso.position.y = 1.25 + Math.abs(Math.sin(this.walkCycleTime * 2)) * 0.04;
    } else {
      // Idle breathing: smoothly decay limb angles toward zero
      this.walkCycleTime += dt * 2.0;
      const breathe = Math.sin(this.walkCycleTime) * 0.015;

      leftLeg.rotation.x *= 0.85;
      rightLeg.rotation.x *= 0.85;
      leftArm.rotation.x *= 0.85;
      rightArm.rotation.x *= 0.85;

      torso.position.y = 1.25 + breathe;
    }
  }

  /**
   * Toggles visibility of head, visor, torso, and backpack in first-person mode
   * to ensure camera viewport is completely clear without mesh clipping.
   */
  public setFirstPersonVisible(visible: boolean): void {
    if (this.hierarchy) {
      this.hierarchy.head.setEnabled(visible);
      this.hierarchy.visor.setEnabled(visible);
      this.hierarchy.torso.setEnabled(visible);
      this.hierarchy.backpack.setEnabled(visible);
    } else {
      // For loaded GLB nodes, toggle upper child meshes if present
      const children = this.rootNode.getChildMeshes();
      children.forEach((mesh) => {
        const name = mesh.name.toLowerCase();
        if (name.includes('head') || name.includes('helmet') || name.includes('visor')) {
          mesh.setEnabled(visible);
        }
      });
    }
  }

  public dispose(): void {
    this.rootNode.dispose(false, true);
  }
}
