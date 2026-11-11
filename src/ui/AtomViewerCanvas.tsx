/**
 * LAB GUARDIAN - 3D Interactive Babylon.js Chemical Viewer Canvas
 * Embeds a real-time Babylon.js WebGL viewport for inspecting atomic/molecular geometry.
 * Supports:
 * - Orbit mouse drag rotation
 * - Touch drag & pinch-to-zoom on mobile
 * - Mouse wheel zoom (clamped)
 * - Auto-rotation toggle
 * - Camera reset
 * - Clean teardown & disposal on unmount
 */

import React, { useEffect, useRef } from 'react';
import {
  Engine,
  Scene,
  ArcRotateCamera,
  Vector3,
  Color4,
  HemisphericLight,
  PointLight,
  Color3,
  TransformNode,
} from '@babylonjs/core';
import { AtomModelFactory } from '../game/academy/AtomModelFactory';

interface AtomViewerCanvasProps {
  demoId: string;
  reactionStage: 'reactants' | 'products';
  isAutoRotating: boolean;
  onResetCamera?: () => void;
  className?: string;
}

export const AtomViewerCanvas: React.FC<AtomViewerCanvasProps> = ({
  demoId,
  reactionStage,
  isAutoRotating,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const cameraRef = useRef<ArcRotateCamera | null>(null);
  const currentModelRef = useRef<TransformNode | null>(null);
  const isAutoRotatingRef = useRef<boolean>(isAutoRotating);

  isAutoRotatingRef.current = isAutoRotating;

  // Initialize Babylon Engine & Scene once on canvas mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let engine: Engine | null = null;
    let scene: Scene | null = null;

    try {
      engine = new Engine(canvas, true, {
        preserveDrawingBuffer: true,
        stencil: false,
        antialias: true,
        powerPreference: 'default',
      });
      engineRef.current = engine;

      scene = new Scene(engine);
      sceneRef.current = scene;
      scene.clearColor = new Color4(0.024, 0.047, 0.094, 1.0); // Sci-Fi deep blue-black

      // 360 ArcRotateCamera (controls orbit rotation and wheel zoom)
      const camera = new ArcRotateCamera(
        'chem_viewer_camera',
        -Math.PI / 2,
        Math.PI / 2.6,
        4.4,
        Vector3.Zero(),
        scene
      );
      camera.lowerRadiusLimit = 1.8;
      camera.upperRadiusLimit = 8.5;
      camera.wheelPrecision = 28;
      camera.pinchPrecision = 35;
      camera.angularSensibilityX = 1400;
      camera.angularSensibilityY = 1400;
      camera.attachControl(canvas, true);
      cameraRef.current = camera;

      // Scientific Laboratory Studio Lighting
      const hemiLight = new HemisphericLight('chem_hemi_light', new Vector3(0, 1, 0), scene);
      hemiLight.diffuse = new Color3(0.9, 0.94, 1.0);
      hemiLight.groundColor = new Color3(0.18, 0.22, 0.32);
      hemiLight.intensity = 1.1;

      const keyLight = new PointLight('chem_key_light', new Vector3(4, 5, 4), scene);
      keyLight.diffuse = new Color3(1.0, 0.95, 0.9);
      keyLight.intensity = 1.3;

      const fillLight = new PointLight('chem_fill_light', new Vector3(-4, -2, -3), scene);
      fillLight.diffuse = new Color3(0.0, 0.7, 1.0);
      fillLight.intensity = 0.8;

      // Render loop with auto-rotation
      engine.runRenderLoop(() => {
        if (!scene || scene.isDisposed) return;

        if (isAutoRotatingRef.current && cameraRef.current) {
          cameraRef.current.alpha += 0.007;
        }

        scene.render();
      });

      const handleResize = () => {
        engine?.resize();
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (engine) {
          engine.stopRenderLoop();
          scene?.dispose();
          engine.dispose();
          engineRef.current = null;
          sceneRef.current = null;
          cameraRef.current = null;
          currentModelRef.current = null;
        }
      };
    } catch (err) {
      console.error('[AtomViewerCanvas] Failed to initialize Babylon engine:', err);
    }
  }, []);

  // Update 3D Model when demoId or reactionStage changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || scene.isDisposed) return;

    // Dispose old model
    if (currentModelRef.current) {
      currentModelRef.current.dispose(false, true);
      currentModelRef.current = null;
    }

    let newModel: TransformNode | null = null;

    switch (demoId) {
      case 'demo_iron_oxidation':
        newModel = AtomModelFactory.createIronOxidationModel(scene, reactionStage, 1.05);
        break;
      case 'demo_oxygen_molecule':
        newModel = AtomModelFactory.createOxygenInspectionModel(scene, 1.1);
        break;
      case 'demo_propane_combustion':
        newModel = AtomModelFactory.createPropaneCombustionModel(scene, reactionStage, 1.0);
        break;
      case 'demo_potassium_bromide':
        newModel = AtomModelFactory.createPotassiumBromideModel(scene, reactionStage, 1.0);
        break;
      case 'demo_butane_matrix':
        newModel = AtomModelFactory.createButaneCombustionModel(scene, reactionStage, 0.95);
        break;
      default:
        newModel = AtomModelFactory.createOxygenInspectionModel(scene, 1.0);
        break;
    }

    currentModelRef.current = newModel;

    // Reset camera target
    if (cameraRef.current) {
      cameraRef.current.setTarget(Vector3.Zero());
    }
  }, [demoId, reactionStage]);

  return (
    <div className={`relative w-full h-full min-h-[260px] overflow-hidden rounded-2xl ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full outline-none block cursor-grab active:cursor-grabbing touch-none"
        tabIndex={0}
      />
    </div>
  );
};
