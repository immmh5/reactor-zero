/**
 * LAB GUARDIAN - Asset Manager
 * Centralized asynchronous model loader with template caching, cloning, and procedural fallbacks.
 * Prevents duplicate GLB network requests and reuses materials across all instances.
 */

import {
  Scene,
  Node,
  Mesh,
  TransformNode,
  SceneLoader,
  AnimationGroup,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Vector3,
} from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import { ASSET_MANIFEST, AssetDefinition } from './AssetManifest';
import {
  createProceduralHumanoidPlayer,
  createProceduralEnemyDrone,
} from './FallbackModels';

export interface LoadingStatus {
  totalAssets: number;
  loadedAssets: number;
  progressPercent: number;
  currentAssetName: string;
}

export interface AssetLoadResult {
  node: TransformNode;
  isFallback: boolean;
  animationGroups?: AnimationGroup[];
}

export class AssetManager {
  private static instance: AssetManager | null = null;
  // Master template root nodes (kept hidden/disabled in scene as prototypes)
  private templateNodes = new Map<string, TransformNode>();
  private templateAnimations = new Map<string, AnimationGroup[]>();
  private fallbackInUse = new Map<string, boolean>();
  private pendingLoads = new Map<string, Promise<AssetLoadResult>>();

  public static getInstance(): AssetManager {
    if (!AssetManager.instance) {
      AssetManager.instance = new AssetManager();
    }
    return AssetManager.instance;
  }

  public static cloneHierarchy(
    source: TransformNode,
    newName: string,
    parent?: TransformNode | null
  ): TransformNode {
    const scene = source.getScene();
    const clonedRoot = new TransformNode(newName, scene);
    if (parent) clonedRoot.parent = parent;
    clonedRoot.position.copyFrom(source.position);
    clonedRoot.rotation.copyFrom(source.rotation);
    if (source.rotationQuaternion) {
      clonedRoot.rotationQuaternion = source.rotationQuaternion.clone();
    }
    clonedRoot.scaling.copyFrom(source.scaling);

    const cloneChildren = (src: Node, targetParent: Node) => {
      src.getChildren().forEach((child) => {
        if (child instanceof Mesh) {
          const mClone = child.clone(`${child.name}_cln`, targetParent);
          if (mClone) {
            mClone.parent = targetParent;
            mClone.setEnabled(true);
            mClone.isVisible = true;
            cloneChildren(child, mClone);
          }
        } else if (child instanceof TransformNode) {
          const tnClone = new TransformNode(`${child.name}_cln`, scene);
          tnClone.parent = targetParent;
          tnClone.position.copyFrom(child.position);
          tnClone.rotation.copyFrom(child.rotation);
          if (child.rotationQuaternion) {
            tnClone.rotationQuaternion = child.rotationQuaternion.clone();
          }
          tnClone.scaling.copyFrom(child.scaling);
          tnClone.setEnabled(true);
          cloneChildren(child, tnClone);
        }
      });
    };

    cloneChildren(source, clonedRoot);
    clonedRoot.setEnabled(true);
    return clonedRoot;
  }

  /**
   * Loads an asset definition. Returns a pristine, independent scene node.
   * Leverages template caching and deduplicates concurrent network requests.
   */
  public async loadAsset(
    assetId: string,
    scene: Scene,
    onProgress?: (percent: number) => void
  ): Promise<AssetLoadResult> {
    const def: AssetDefinition | undefined = ASSET_MANIFEST[assetId];
    if (!def) {
      console.warn(`[AssetManager] Asset '${assetId}' not in manifest.`);
      const fallbackNode = this.generateFallback(assetId, scene);
      return { node: fallbackNode, isFallback: true };
    }

    // 1. Check existing template cache for active scene
    const cachedTemplate = this.templateNodes.get(assetId);
    if (cachedTemplate && !cachedTemplate.isDisposed() && cachedTemplate.getScene() === scene) {
      const clone = AssetManager.cloneHierarchy(
        cachedTemplate,
        `${assetId}_inst_${Date.now()}_${Math.floor(Math.random() * 1000)}`
      );
      clone.setEnabled(true);
      if (onProgress) onProgress(100);
      return {
        node: clone,
        isFallback: false,
        animationGroups: this.templateAnimations.get(assetId),
      };
    }

    // 2. Deduplicate concurrent in-flight requests for the same model
    if (this.pendingLoads.has(assetId)) {
      const pendingRes = await this.pendingLoads.get(assetId)!;
      if (!pendingRes.isFallback && !pendingRes.node.isDisposed() && pendingRes.node.getScene() === scene) {
        const clone = AssetManager.cloneHierarchy(
          pendingRes.node,
          `${assetId}_inst_${Date.now()}_${Math.floor(Math.random() * 1000)}`
        );
        clone.setEnabled(true);
        if (onProgress) onProgress(100);
        return {
          node: clone,
          isFallback: false,
          animationGroups: pendingRes.animationGroups,
        };
      }
    }

    // 3. Import GLB from asset manifest URL
    const loadPromise = (async () => {
      try {
        const pathParts = def.glbPath.split('/');
        const filename = pathParts.pop() || '';
        const rootUrl = pathParts.join('/') + '/';

        const result = await SceneLoader.ImportMeshAsync(
          '',
          rootUrl,
          filename,
          scene,
          (evt) => {
            if (evt.lengthComputable && onProgress) {
              onProgress(Math.round((evt.loaded / evt.total) * 100));
            }
          }
        );

        const templateNode = new TransformNode(`${assetId}_template`, scene);
        result.meshes.forEach((m) => {
          if (!m.parent) {
            m.parent = templateNode;
          }
        });

        // Apply scale & orientation configuration if defined
        if (def.scale && def.scale !== 1.0) {
          templateNode.scaling.setAll(def.scale);
        }
        if (def.orientationOffset) {
          templateNode.rotation.y = def.orientationOffset;
        }

        // Cache template disabled so it doesn't render directly in world
        templateNode.setEnabled(false);
        this.templateNodes.set(assetId, templateNode);
        if (result.animationGroups) {
          this.templateAnimations.set(assetId, result.animationGroups);
        }

        // Clone active instance for caller
        const instance = AssetManager.cloneHierarchy(
          templateNode,
          `${assetId}_inst_${Date.now()}_${Math.floor(Math.random() * 1000)}`
        );
        instance.setEnabled(true);

        if (onProgress) onProgress(100);

        return {
          node: instance,
          isFallback: false,
          animationGroups: result.animationGroups,
        };
      } catch (err) {
        console.warn(`[AssetManager] GLB load failed for '${assetId}'. Using high-fidelity procedural fallback.`, err);
        const fallbackNode = this.generateFallback(assetId, scene);
        if (onProgress) onProgress(100);
        return { node: fallbackNode, isFallback: true };
      } finally {
        this.pendingLoads.delete(assetId);
      }
    })();

    this.pendingLoads.set(assetId, loadPromise);
    return loadPromise;
  }

  /**
   * Synchronously or asynchronously instantiates an asset into the scene.
   * If the template is already cached, clones immediately.
   */
  public instantiateAsset(
    assetId: string,
    instanceName: string,
    scene: Scene,
    parent?: TransformNode
  ): TransformNode {
    const template = this.templateNodes.get(assetId);
    if (template && !template.isDisposed() && template.getScene() === scene) {
      const clone = AssetManager.cloneHierarchy(template, instanceName, parent || null);
      clone.setEnabled(true);
      return clone;
    }

    // If not cached, trigger load in background and return procedural placeholder
    const placeholder = this.generateFallback(assetId, scene);
    placeholder.name = instanceName;
    if (parent) placeholder.parent = parent;

    this.loadAsset(assetId, scene)
      .then(({ node, isFallback }) => {
        if (!isFallback && node && !placeholder.isDisposed()) {
          node.name = `${instanceName}_glb`;
          node.parent = placeholder.parent || null;
          node.position.copyFrom(placeholder.position);
          node.rotation.copyFrom(placeholder.rotation);
          if (placeholder.rotationQuaternion) {
            node.rotationQuaternion = placeholder.rotationQuaternion.clone();
          }
          placeholder.dispose();
        }
      })
      .catch(() => {});

    return placeholder;
  }

  public clearCache(): void {
    for (const node of this.templateNodes.values()) {
      if (!node.isDisposed()) {
        node.dispose(false, true);
      }
    }
    this.templateNodes.clear();
    this.templateAnimations.clear();
    this.pendingLoads.clear();
  }

  /**
   * Preload a batch of asset IDs concurrently
   */
  public async preloadAssets(assetIds: string[], scene: Scene): Promise<void> {
    await Promise.all(assetIds.map((id) => this.loadAsset(id, scene).catch(() => {})));
  }

  /**
   * Generates high-quality procedural fallback geometries for any missing asset
   */
  public generateFallback(assetId: string, scene: Scene): TransformNode {
    switch (assetId) {
      case 'player': {
        const hierarchy = createProceduralHumanoidPlayer(scene, 'player_char');
        return hierarchy.root;
      }
      case 'enemyRobot':
      case 'enemyScout': {
        return createProceduralEnemyDrone(scene, 'scout_drone_fb');
      }
      case 'enemySentinel': {
        const root = new TransformNode('sentinel_fallback', scene);
        const box = MeshBuilder.CreateBox('sentinel_box', { width: 1.8, height: 2.0, depth: 1.4 }, scene);
        box.position.y = 1.0;
        const mat = new StandardMaterial('mat_sentinel_fb', scene);
        mat.diffuseColor = new Color3(0.1, 0.12, 0.18);
        box.material = mat;
        box.parent = root;
        return root;
      }
      case 'enemyRangedGuard': {
        const root = new TransformNode('guard_fallback', scene);
        const cyl = MeshBuilder.CreateCylinder('guard_cyl', { diameter: 0.8, height: 1.8 }, scene);
        cyl.position.y = 0.9;
        const mat = new StandardMaterial('mat_guard_fb', scene);
        mat.diffuseColor = new Color3(0.15, 0.2, 0.28);
        cyl.material = mat;
        cyl.parent = root;
        return root;
      }
      case 'structuralColumn': {
        const root = new TransformNode('column_fb', scene);
        const col = MeshBuilder.CreateCylinder('col_mesh', { diameter: 0.9, height: 7.0 }, scene);
        col.position.y = 3.5;
        const mat = new StandardMaterial('mat_col_fb', scene);
        mat.diffuseColor = new Color3(0.08, 0.12, 0.18);
        col.material = mat;
        col.parent = root;
        return root;
      }
      case 'modularCorridor': {
        const root = new TransformNode('corridor_fb', scene);
        const arch = MeshBuilder.CreateTorus('arch_mesh', { diameter: 5.0, thickness: 0.6 }, scene);
        arch.position.y = 2.5;
        const mat = new StandardMaterial('mat_arch_fb', scene);
        mat.diffuseColor = new Color3(0.1, 0.15, 0.25);
        arch.material = mat;
        arch.parent = root;
        return root;
      }
      case 'refinerySilo': {
        const root = new TransformNode('silo_fb', scene);
        const silo = MeshBuilder.CreateCylinder('silo_mesh', { diameter: 4.5, height: 10.0 }, scene);
        silo.position.y = 5.0;
        const mat = new StandardMaterial('mat_silo_fb', scene);
        mat.diffuseColor = new Color3(0.12, 0.16, 0.22);
        silo.material = mat;
        silo.parent = root;
        return root;
      }
      case 'damagedHelmet': {
        const root = new TransformNode('procedural_damaged_helmet', scene);
        const dome = MeshBuilder.CreateSphere('helmet_dome', { diameter: 0.5, segments: 12 }, scene);
        dome.position.y = 0.25;
        const mat = new StandardMaterial('mat_helmet_fb', scene);
        mat.diffuseColor = new Color3(0.2, 0.25, 0.3);
        dome.material = mat;
        dome.parent = root;
        return root;
      }
      case 'resourceCrate': {
        const root = new TransformNode('procedural_resource_crate', scene);
        const box = MeshBuilder.CreateBox('crate_box', { size: 0.8 }, scene);
        box.position.y = 0.4;
        const mat = new StandardMaterial('mat_crate_fb', scene);
        mat.diffuseColor = new Color3(0.15, 0.2, 0.3);
        box.material = mat;
        box.parent = root;
        return root;
      }
      default: {
        const node = new TransformNode(`generic_${assetId}`, scene);
        return node;
      }
    }
  }

  public isUsingFallback(assetId: string): boolean {
    return this.fallbackInUse.get(assetId) ?? false;
  }

  public getManifest(): Record<string, AssetDefinition> {
    return ASSET_MANIFEST;
  }
}
