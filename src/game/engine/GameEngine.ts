/**
 * LAB GUARDIAN - Game Engine Core
 * Coordinates Babylon.js lifecycle, rendering loop, combat system, and stoichiometry progression
 */

import { Engine, Scene, Mesh, Color3, Vector3 } from '@babylonjs/core';
import { GAME_CONFIG } from '../config/gameConfig';
import { CameraController, CameraMode } from '../camera/CameraController';
import { PlayerController } from '../player/PlayerController';
import { InputManager } from '../input/InputManager';
import { InteractionManager, InteractiveStation } from '../interaction/InteractionManager';
import { WorldManager } from '../world/WorldManager';
import { MapBuildResult } from '../world/HubEnvironment';
import { CombatSystem } from '../combat/CombatSystem';
import { PickupNotificationEvent } from '../combat/CombatTypes';
import { ChemistryChallengeManager } from '../chemistry/ChemistryChallengeSystem';
import { CampaignManager } from '../campaign/CampaignManager';
import { LocationId, LocationDefinition } from '../campaign/CampaignTypes';
import { sounds } from '../audio/SoundEffects';

export type GameState = 'menu' | 'loading' | 'playing' | 'paused' | 'victory' | 'defeat' | 'error';

export interface GameEngineCallbacks {
  onStateChange?: (state: GameState) => void;
  onPromptChange?: (station: InteractiveStation | null) => void;
  onOpenInteraction?: (station: InteractiveStation) => void;
  onOpenAcademyModal?: (mode: 'gallery' | 'training' | 'exam', stationId?: string) => void;
  onPlayerStats?: (
    health: number,
    energy: number,
    stability: number,
    timerSeconds: number,
    score: number,
    combo: number,
    bossHealth: number,
    bossMaxHealth: number,
    bossShield: number
  ) => void;
  onDefeat?: (reasonAr: string) => void;
  onVictory?: () => void;
  onCampaignVictory?: () => void;
  onPickupNotification?: (event: PickupNotificationEvent) => void;
  onCameraModeChange?: (mode: CameraMode) => void;
  onPointerLockChange?: (locked: boolean) => void;
  onLocationChange?: (location: LocationDefinition) => void;
  onOpenCampaignMap?: () => void;
  onOpenBriefing?: () => void;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private engine: Engine;
  private scene: Scene;

  private cameraCtrl: CameraController;
  private playerCtrl: PlayerController;
  private inputMgr: InputManager;
  private interactMgr: InteractionManager;
  private combatSystem: CombatSystem;
  private chemistryMgr: ChemistryChallengeManager;
  private campaignMgr: CampaignManager;
  private worldMgr: WorldManager;
  private envResult: MapBuildResult;

  private state: GameState = 'menu';
  private callbacks: GameEngineCallbacks = {};

  // Simulation visuals
  private reactorRings: Mesh[] = [];
  private plasmaCore: Mesh | null = null;
  private ringAngles: number[] = [0, 0, 0];
  private plasmaPulseTime: number = 0;
  private dangerTimer: number = 0;

  // Real gameplay metrics
  public reactorStability: number = 65; // 0 to 100%
  public missionTimerSeconds: number = 720; // 12 minutes countdown
  private statsTimer: number = 0;
  private defeatReasonAr: string = '';

  constructor(canvas: HTMLCanvasElement, callbacks?: GameEngineCallbacks) {
    this.canvas = canvas;
    if (callbacks) this.callbacks = callbacks;

    // 1. Initialize Babylon Engine
    this.engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      powerPreference: 'high-performance',
      antialias: true,
    });

    // 2. Create Scene
    this.scene = new Scene(this.engine);

    // 3. Setup Input Manager
    this.inputMgr = new InputManager();
    this.inputMgr.attach();

    // 4. Setup Campaign & World Managers
    this.campaignMgr = new CampaignManager();
    this.campaignMgr.onCampaignComplete = () => {
      this.triggerVictory();
    };
    this.worldMgr = new WorldManager(this.scene);

    const initialLocDef = this.campaignMgr.getCurrentLocation();
    const initialLoc = initialLocDef.id;
    this.envResult = this.worldMgr.loadLocation(initialLoc);
    this.reactorRings = this.envResult.reactorRings;
    this.plasmaCore = this.envResult.plasmaCore;

    // 5. Setup Player & Camera
    this.playerCtrl = new PlayerController(this.scene, this.inputMgr);
    const spawn = initialLocDef.spawnPosition;
    this.playerCtrl.setPosition(spawn.x, spawn.y, spawn.z, initialLocDef.spawnRotationY);
    this.playerCtrl.setObstacles(this.envResult.circles, this.envResult.boxes, initialLocDef.boundaryRadius);

    this.cameraCtrl = new CameraController(this.scene, this.canvas);
    this.cameraCtrl.setPlayerModel(this.playerCtrl.model);
    this.cameraCtrl.setCinematicMode(true);

    this.cameraCtrl.onCameraModeChange = (mode) => {
      if (this.callbacks.onCameraModeChange) {
        this.callbacks.onCameraModeChange(mode);
      }
    };
    this.cameraCtrl.onPointerLockChange = (locked) => {
      if (this.callbacks.onPointerLockChange) {
        this.callbacks.onPointerLockChange(locked);
      }
    };

    // 6. Setup Interaction Manager
    this.interactMgr = new InteractionManager();
    this.interactMgr.setStations(this.envResult.stations);

    this.interactMgr.onPromptChange = (station) => {
      if (this.callbacks.onPromptChange) {
        this.callbacks.onPromptChange(station);
      }
    };
    this.interactMgr.onOpenModal = (station) => {
      // Hub Special Terminals
      if (station.id === 'hub_mission_dispatch') {
        this.cameraCtrl.exitPointerLock();
        this.pause();
        if (this.callbacks.onOpenCampaignMap) {
          this.callbacks.onOpenCampaignMap();
        }
        return;
      }

      if (station.id === 'hub_briefing') {
        this.cameraCtrl.exitPointerLock();
        this.pause();
        if (this.callbacks.onOpenBriefing) {
          this.callbacks.onOpenBriefing();
        }
        return;
      }

      if (station.id === 'hub_equipment') {
        this.playerCtrl.health = 100;
        this.playerCtrl.energy = 100;
        this.reactorStability = Math.min(100, this.reactorStability + 25);
        sounds.playSuccess();
        if (this.callbacks.onPickupNotification) {
          this.callbacks.onPickupNotification({
            id: `equip_${Date.now()}`,
            type: 'energy',
            nameAr: 'محطة شحن العتاد',
            value: 100,
            icon: 'BatteryCharging',
            timestamp: Date.now(),
            detailAr: 'تم شحن دروع البذلة بالكامل وتبريد مكثفات البلازما.',
          });
        }
        return;
      }

      if (station.id === 'gate_academy') {
        this.switchLocation('academy');
        return;
      }

      if (station.id === 'transit_hub_academy') {
        this.switchLocation('hub');
        return;
      }

      if (station.id === 'gate_research_wing') {
        this.switchLocation('research_wing');
        return;
      }

      if (station.id === 'gate_refinery') {
        if (this.campaignMgr.isLocationUnlocked('refinery')) {
          this.switchLocation('refinery');
        } else {
          sounds.playDamageImpact();
          const refLoc = this.campaignMgr.getLocation('refinery');
          if (this.callbacks.onPickupNotification) {
            this.callbacks.onPickupNotification({
              id: `gate_locked_${Date.now()}`,
              type: 'keycard',
              nameAr: refLoc?.statusLabelAr || 'القطاع 02 مغلق',
              value: 0,
              icon: 'KeyRound',
              timestamp: Date.now(),
              detailAr: refLoc?.lockReasonAr || 'يتطلب إكمال جناح الأبحاث واجتياز اختبار التأهيل الأول.',
            });
          }
        }
        return;
      }

      if (station.id === 'gate_vault') {
        if (this.campaignMgr.isLocationUnlocked('vault')) {
          this.switchLocation('vault');
        } else {
          sounds.playDamageImpact();
          const vltLoc = this.campaignMgr.getLocation('vault');
          if (this.callbacks.onPickupNotification) {
            this.callbacks.onPickupNotification({
              id: `gate_locked_${Date.now()}`,
              type: 'keycard',
              nameAr: vltLoc?.statusLabelAr || 'القطاع 03 مغلق',
              value: 0,
              icon: 'KeyRound',
              timestamp: Date.now(),
              detailAr: vltLoc?.lockReasonAr || 'يتطلب إكمال مصفاة الكتلة واجتياز اختبار التأهيل الثاني.',
            });
          }
        }
        return;
      }

      if (
        station.id === 'transit_hub_research' ||
        station.id === 'transit_hub_refinery' ||
        station.id === 'transit_hub_vault' ||
        station.id === 'transit_hub_entrance'
      ) {
        this.switchLocation('hub');
        return;
      }

      // Academy Demonstration Station (Area A)
      if (station.id.startsWith('demo_station_')) {
        this.cameraCtrl.exitPointerLock();
        this.pause();
        if (this.callbacks.onOpenAcademyModal) {
          this.callbacks.onOpenAcademyModal('gallery', station.id);
        }
        return;
      }

      // Academy Training Station (Area B)
      if (station.id.startsWith('acad_training_')) {
        this.cameraCtrl.exitPointerLock();
        this.pause();
        if (this.callbacks.onOpenAcademyModal) {
          this.callbacks.onOpenAcademyModal('training', station.id);
        }
        return;
      }

      // Academy Exam Console (Area C - 20 Questions Certification!)
      if (station.id === 'academy_exam_console') {
        this.cameraCtrl.exitPointerLock();
        this.pause();
        if (this.callbacks.onOpenAcademyModal) {
          this.callbacks.onOpenAcademyModal('exam', station.id);
        }
        return;
      }

      // Standard educational station
      this.cameraCtrl.exitPointerLock();
      this.pause();
      if (this.callbacks.onOpenInteraction) {
        this.callbacks.onOpenInteraction(station);
      }
    };

    // 7. Setup Combat System
    this.combatSystem = new CombatSystem(this.scene);
    this.combatSystem.getPickupManager().loadCollectedIds(this.campaignMgr.getCollectedPickupIds());
    this.combatSystem.setupLocationCombat(
      initialLoc,
      initialLocDef.boundaryRadius,
      this.envResult.circles,
      this.envResult.boxes
    );

    // 8. Setup Chemistry Challenge System
    this.chemistryMgr = new ChemistryChallengeManager();

    // 9. Window resize listener
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);

    // 10. Start continuous Render Loop
    this.engine.runRenderLoop(() => {
      this.tick();
    });
  }

  public setCallbacks(callbacks: GameEngineCallbacks): void {
    this.callbacks = callbacks;
  }

  public getState(): GameState {
    return this.state;
  }

  public getInputManager(): InputManager {
    return this.inputMgr;
  }

  public getInteractionManager(): InteractionManager {
    return this.interactMgr;
  }

  public getCombatSystem(): CombatSystem {
    return this.combatSystem;
  }

  public getChemistryManager(): ChemistryChallengeManager {
    return this.chemistryMgr;
  }

  public getDefeatReason(): string {
    return this.defeatReasonAr;
  }

  /**
   * Main game loop executed at ~60fps
   */
  private tick(): void {
    const rawDt = this.engine.getDeltaTime() / 1000;
    const dt = Math.min(rawDt, 0.05);

    // Always animate reactor visual pulsation
    this.animateReactor(dt);

    if (this.state === 'menu') {
      this.cameraCtrl.update(this.playerCtrl.getPosition(), dt);
    } else if (this.state === 'playing') {
      // Accumulate campaign play time
      this.campaignMgr.addPlayTime(dt);

      // Mission timer countdown
      this.missionTimerSeconds = Math.max(0, this.missionTimerSeconds - dt);
      if (this.missionTimerSeconds <= 0) {
        this.triggerDefeat('انتهت المهلة الزمنية لعملية الإنقاذ! حدث انهيار حراري للمفاعل.');
        return;
      }

      // Check Pause key (ESC)
      if (this.inputMgr.isPauseJustPressed()) {
        this.cameraCtrl.exitPointerLock();
        this.pause();
        return;
      }

      // Check Sector Map key (M)
      if (this.inputMgr.isMapJustPressed()) {
        this.cameraCtrl.exitPointerLock();
        this.pause();
        if (this.callbacks.onOpenCampaignMap) {
          this.callbacks.onOpenCampaignMap();
        }
        return;
      }

      // Check Pointer Lock toggle (L)
      if (this.inputMgr.isPointerLockJustPressed()) {
        this.cameraCtrl.togglePointerLock();
      }

      // Check Camera Mode toggle (V)
      if (this.inputMgr.isCameraModeJustPressed()) {
        this.cameraCtrl.toggleCameraMode();
      }

      // Check Interaction key (E)
      if (this.inputMgr.isInteractJustPressed()) {
        this.interactMgr.handleInteract();
      }

      // Update Camera & Player simulation
      const cameraAlpha = this.cameraCtrl.getAlpha();

      // Check Weapon Fire key (F)
      if (this.inputMgr.isFireJustPressed() || this.inputMgr.isFiring()) {
        if (!this.playerCtrl.getIsMoving()) {
          const cameraYaw = Math.atan2(-Math.cos(cameraAlpha), -Math.sin(cameraAlpha));
          this.playerCtrl.faceDirection(cameraYaw);
        }
        const fireRes = this.combatSystem.firePlayerWeapon(
          this.playerCtrl.getPosition(),
          this.playerCtrl.getRotationY(),
          this.playerCtrl.energy
        );
        if (fireRes.fired) {
          this.playerCtrl.energy = fireRes.newEnergy;
        }
      }

      this.playerCtrl.update(dt, cameraAlpha);
      this.cameraCtrl.update(this.playerCtrl.getPosition(), dt);
      this.interactMgr.update(this.playerCtrl.getPosition());

      // Update Combat System (projectiles, enemy AI, collisions, pickups)
      const combatRes = this.combatSystem.update(dt, this.playerCtrl.getPosition());

      if (combatRes.playerDamageTaken > 0) {
        this.playerCtrl.health = Math.max(0, this.playerCtrl.health - combatRes.playerDamageTaken);
        this.cameraCtrl.addTrauma(0.45);
        sounds.playDamageImpact();

        // Player health defeat condition
        if (this.playerCtrl.health <= 0) {
          this.triggerDefeat('نفدت طاقة دروع بذلة العزل بعد التعرض لنيران الروبوتات المعادية.');
          return;
        }
      }

      if (combatRes.healthRecovered > 0) {
        this.playerCtrl.health = Math.min(100, this.playerCtrl.health + combatRes.healthRecovered);
      }
      if (combatRes.energyRecovered > 0) {
        this.playerCtrl.energy = Math.min(100, this.playerCtrl.energy + combatRes.energyRecovered);
      }
      if (combatRes.stabilityBonus > 0) {
        this.reactorStability = Math.min(100, this.reactorStability + combatRes.stabilityBonus);
      }

      // Forward collected pickups to HUD toast notifications & sync persistent campaign save
      if (combatRes.pickupsCollected.length > 0) {
        this.campaignMgr.setCollectedPickupIds(this.combatSystem.getPickupManager().getCollectedIds());
        if (this.callbacks.onPickupNotification) {
          combatRes.pickupsCollected.forEach((event) => {
            this.callbacks.onPickupNotification!(event);
          });
        }
      }

      // Dynamic danger audio warning loops
      if (this.playerCtrl.health <= 15) {
        sounds.playHeartbeat(0.95);
        sounds.playCriticalAlarm();
      } else if (this.playerCtrl.health <= 30) {
        sounds.playHeartbeat(0.5);
      }

      if (this.reactorStability <= 30) {
        sounds.playReactorSiren();
      }

      // Reactor Zero Stability Defeat Condition (exact once trigger)
      if (this.reactorStability <= 0) {
        this.triggerDefeat('انهار استقرار قلب المفاعل النووي تماماً ووصل إلى مرحلة الانصهار الحرج.');
        return;
      }

      // Update Real-Time Environmental Laboratory Danger Lighting
      this.updateEnvironmentalDanger(dt);

      // Check Victory Condition: All 5 missions completed AND Boss defeated
      const missions = this.chemistryMgr.getMissions();
      const allMissionsDone = missions.every((m) => m.isCompleted);
      const bossInfo = this.combatSystem.getBossInfo();

      if (bossInfo?.isDefeated || combatRes.bossDefeated) {
        this.campaignMgr.setBossDefeated(true);
      }

      if (allMissionsDone && (bossInfo?.isDefeated || combatRes.bossDefeated)) {
        this.triggerVictory();
        return;
      }

      // Throttled UI status updates
      this.statsTimer += dt;
      if (this.statsTimer >= 0.1) {
        this.statsTimer = 0;
        if (this.callbacks.onPlayerStats) {
          this.callbacks.onPlayerStats(
            this.playerCtrl.health,
            this.playerCtrl.energy,
            this.reactorStability,
            Math.ceil(this.missionTimerSeconds),
            this.chemistryMgr.getTotalScore(),
            this.chemistryMgr.getCombo(),
            bossInfo?.health ?? 0,
            bossInfo?.maxHealth ?? 300,
            bossInfo?.shieldPercent ?? 0
          );
        }
      }
    }

    // Reset inputs for this frame
    this.inputMgr.endFrame();

    // Render 3D Scene
    this.scene.render();
  }

  private animateReactor(dt: number): void {
    if (this.reactorRings.length === 3) {
      this.ringAngles[0] += dt * 0.7;
      this.ringAngles[1] -= dt * 1.1;
      this.ringAngles[2] += dt * 0.5;

      this.reactorRings[0].rotation.y = this.ringAngles[0];
      this.reactorRings[1].rotation.y = this.ringAngles[1];
      this.reactorRings[2].rotation.y = this.ringAngles[2];
    }

    if (this.plasmaCore) {
      this.plasmaPulseTime += dt * 2.2;
      const scale = 1.0 + Math.sin(this.plasmaPulseTime) * 0.05;
      this.plasmaCore.scaling.x = scale;
      this.plasmaCore.scaling.z = scale;
    }
  }

  private updateEnvironmentalDanger(dt: number): void {
    this.dangerTimer += dt;
    const reactorLight = this.envResult.mainLight;
    const amberLights = this.envResult.auxLights;
    if (!reactorLight) return;

    if (this.reactorStability <= 15) {
      // Urgent meltdown hazard: emergency red flashing strobe
      const strobe = Math.sin(this.dangerTimer * 14) > 0 ? 2.4 : 0.4;
      reactorLight.diffuse = new Color3(1.0, 0.08, 0.08);
      reactorLight.intensity = strobe;
      amberLights?.forEach((l) => {
        l.diffuse = new Color3(1.0, 0.1, 0.1);
        l.intensity = strobe * 0.8;
      });
    } else if (this.reactorStability <= 30) {
      // Moderate instability warning: amber warning pulse
      const pulse = 1.0 + Math.sin(this.dangerTimer * 4.5) * 0.45;
      reactorLight.diffuse = new Color3(1.0, 0.55, 0.05);
      reactorLight.intensity = pulse;
      amberLights?.forEach((l) => {
        l.diffuse = new Color3(1.0, 0.65, 0.1);
        l.intensity = pulse * 0.7;
      });
    } else {
      // Normal stable condition: calming cyan glow
      reactorLight.diffuse = new Color3(0.0, 0.9, 1.0);
      reactorLight.intensity = 1.4;
      amberLights?.forEach((l) => {
        l.diffuse = new Color3(1.0, 0.65, 0.1);
        l.intensity = 0.8;
      });
    }
  }

  public switchLocation(targetLocationId: LocationId): boolean {
    if (!this.campaignMgr.isLocationUnlocked(targetLocationId)) {
      sounds.playDamageImpact();
      const loc = this.campaignMgr.getLocation(targetLocationId);
      if (this.callbacks.onPickupNotification) {
        this.callbacks.onPickupNotification({
          id: `lock_${Date.now()}`,
          type: 'keycard',
          nameAr: loc?.statusLabelAr || 'القطاع مغلق',
          value: 0,
          icon: 'Lock',
          timestamp: Date.now(),
          detailAr: loc?.lockReasonAr || 'يتطلب إكمال أهداف القطاع واجتياز اختبار التأهيل أولاً للمرور.',
        });
      }
      return false;
    }

    sounds.playInteract();
    this.campaignMgr.setCurrentLocation(targetLocationId);
    const locDef = this.campaignMgr.getCurrentLocation();

    // 1. Build and load new location
    const mapResult = this.worldMgr.loadLocation(targetLocationId);
    this.envResult = mapResult;
    this.reactorRings = mapResult.reactorRings;
    this.plasmaCore = mapResult.plasmaCore;

    // 2. Set player position & obstacles
    this.playerCtrl.setPosition(
      locDef.spawnPosition.x,
      locDef.spawnPosition.y,
      locDef.spawnPosition.z,
      locDef.spawnRotationY
    );
    this.playerCtrl.setObstacles(mapResult.circles, mapResult.boxes, locDef.boundaryRadius);

    // 3. Reset camera tracking to spawn target
    this.cameraCtrl.reset(
      new Vector3(
        locDef.spawnPosition.x,
        locDef.spawnPosition.y + GAME_CONFIG.CAMERA.TARGET_OFFSET_Y,
        locDef.spawnPosition.z
      )
    );

    // 4. Update interactive stations
    this.interactMgr.setStations(mapResult.stations);

    // 5. Update combat system with safe sector context and obstacle boundaries
    this.combatSystem.setupLocationCombat(
      targetLocationId,
      locDef.boundaryRadius,
      mapResult.circles,
      mapResult.boxes
    );

    // 6. Crossfade soundtrack to location theme
    sounds.playTrackForLocation(targetLocationId);

    // 7. Notify callbacks
    if (this.callbacks.onLocationChange) {
      this.callbacks.onLocationChange(locDef);
    }

    if (this.callbacks.onPickupNotification) {
      this.callbacks.onPickupNotification({
        id: `loc_${Date.now()}`,
        type: 'keycard',
        nameAr: locDef.nameAr,
        value: 100,
        icon: 'Navigation',
        timestamp: Date.now(),
        detailAr: `تم الانتقال بنجاح إلى ${locDef.codenameAr}`,
      });
    }

    return true;
  }

  public getCampaignManager(): CampaignManager {
    return this.campaignMgr;
  }

  public getWorldManager(): WorldManager {
    return this.worldMgr;
  }

  public startPlaying(): void {
    this.state = 'playing';
    this.cameraCtrl.setCinematicMode(false);
    this.inputMgr.setEnabled(true);
    sounds.startAmbientHum();
    sounds.playTrackForLocation(this.campaignMgr.getCurrentLocationId());
    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange('playing');
    }
  }

  public pause(): void {
    if (this.state === 'playing') {
      this.cameraCtrl.exitPointerLock();
      this.state = 'paused';
      this.inputMgr.setEnabled(false);
      sounds.stopAmbientHum();
      if (this.callbacks.onStateChange) {
        this.callbacks.onStateChange('paused');
      }
    }
  }

  public resume(): void {
    if (this.state === 'paused') {
      this.state = 'playing';
      this.inputMgr.setEnabled(true);
      sounds.startAmbientHum();
      sounds.playTrackForLocation(this.campaignMgr.getCurrentLocationId());
      if (this.callbacks.onStateChange) {
        this.callbacks.onStateChange('playing');
      }
    }
  }

  public triggerDefeat(reasonAr: string): void {
    this.cameraCtrl.exitPointerLock();
    this.state = 'defeat';
    this.defeatReasonAr = reasonAr;
    this.inputMgr.setEnabled(false);
    sounds.stopAmbientHum();
    sounds.setMusicState('defeat');
    sounds.playDefeat();
    if (this.callbacks.onDefeat) {
      this.callbacks.onDefeat(reasonAr);
    }
    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange('defeat');
    }
  }

  public triggerVictory(): void {
    this.cameraCtrl.exitPointerLock();
    this.state = 'victory';
    this.inputMgr.setEnabled(false);
    sounds.stopAmbientHum();
    sounds.setMusicState('victory');
    sounds.playSuccess();
    if (this.callbacks.onCampaignVictory && this.campaignMgr.isCampaignFinished()) {
      this.callbacks.onCampaignVictory();
    } else if (this.callbacks.onVictory) {
      this.callbacks.onVictory();
    }
    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange('victory');
    }
  }

  public getCameraController(): CameraController {
    return this.cameraCtrl;
  }

  public togglePointerLock(): void {
    this.cameraCtrl.togglePointerLock();
  }

  public toggleCameraMode(): void {
    this.cameraCtrl.toggleCameraMode();
  }

  public setSensitivity(factor: number): void {
    this.cameraCtrl.setSensitivity(factor);
  }

  public setScreenEffectsEnabled(enabled: boolean): void {
    this.cameraCtrl.screenEffectsEnabled = enabled;
  }

  public restart(): void {
    const locId = this.campaignMgr.getCurrentLocationId();
    this.switchLocation(locId);
    this.playerCtrl.health = 100;
    this.playerCtrl.energy = 100;
    this.reactorStability = 65;
    this.missionTimerSeconds = 720;
    this.combatSystem.reset();
    this.chemistryMgr.resetAll();
    this.startPlaying();
  }

  public returnToMenu(): void {
    this.state = 'menu';
    this.cameraCtrl.setCinematicMode(true);
    this.inputMgr.setEnabled(false);
    this.inputMgr.clearAll();
    sounds.stopAmbientHum();
    sounds.setMusicState('menu');
    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange('menu');
    }
    if (this.callbacks.onPromptChange) {
      this.callbacks.onPromptChange(null);
    }
  }

  /**
   * Called when student submits a stoichiometry answer
   */
  public submitChemistryAnswer(rawInput: string) {
    const res = this.chemistryMgr.submitAnswer(rawInput);

    if (res.isCorrect) {
      sounds.playSuccess();
      // Increase reactor stability
      this.reactorStability = Math.min(100, this.reactorStability + 12);

      // If active mission is Mission 5 (Boss), weaken the boss shield!
      const activeMission = this.chemistryMgr.getActiveMission();
      if (activeMission.missionNumber === 5) {
        const remainingSteps = activeMission.steps.length - activeMission.currentStepIndex;
        const newShield = Math.max(0, Math.round((remainingSteps / activeMission.steps.length) * 100));
        this.combatSystem.setBossShieldLevel(newShield);
      }

      if (res.isMissionCompleted) {
        this.interactMgr.markStationCompleted(activeMission.missionNumber);
        const unlockInfo = this.campaignMgr.registerMissionCompletion(activeMission.missionNumber);

        if (unlockInfo.newUnlocks.length > 0) {
          const unlockedNames = unlockInfo.newUnlocks
            .map((uid) => this.campaignMgr.getLocation(uid)?.nameAr)
            .filter(Boolean)
            .join(' و ');
          if (this.callbacks.onPickupNotification) {
            this.callbacks.onPickupNotification({
              id: `unlock_${Date.now()}`,
              type: 'keycard',
              nameAr: 'تم فتح قطاع جديد في المنشأة!',
              value: 200,
              icon: 'KeyRound',
              timestamp: Date.now(),
              detailAr: `تم تفعيل تصاريح الدخول إلى: ${unlockedNames}`,
            });
          }
        }
      }
    } else {
      sounds.playImpact();
      // Penalty to stability
      this.reactorStability = Math.max(0, this.reactorStability - res.penaltyStability);
      if (this.reactorStability <= 0) {
        this.triggerDefeat('تدهورت حالة استقرار المفاعل الكيميائي إلى الصفر بعد تراكم أخطاء المعايرة.');
      }
    }

    return res;
  }

  /**
   * Called when question countdown expires
   */
  public handleChemistryTimeout() {
    const res = this.chemistryMgr.handleTimeout();
    sounds.playImpact();
    this.reactorStability = Math.max(0, this.reactorStability - res.penaltyStability);
    if (this.reactorStability <= 0) {
      this.triggerDefeat('تدهورت حالة استقرار المفاعل الكيميائي إلى الصفر بعد تراكم أخطاء المعايرة ونفاد الوقت.');
    }
    return res;
  }

  private handleResize(): void {
    if (this.engine) {
      this.engine.resize();
    }
  }

  public dispose(): void {
    window.removeEventListener('resize', this.handleResize);
    sounds.dispose();
    this.inputMgr.detach();
    this.combatSystem.dispose();
    this.playerCtrl.dispose();
    this.cameraCtrl.dispose();
    this.scene.dispose();
    this.engine.dispose();
  }
}
