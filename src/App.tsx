/**
 * LAB GUARDIAN: REACTOR ZERO
 * Main Application Shell & Game Orchestrator
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine, GameState } from './game/engine/GameEngine';
import { CameraMode } from './game/camera/CameraController';
import { InteractiveStation } from './game/interaction/InteractionManager';
import { PickupNotificationEvent } from './game/combat/CombatTypes';
import { sounds } from './game/audio/SoundEffects';
import { MainMenu } from './ui/MainMenu';
import { GameHUD } from './ui/GameHUD';
import { PauseMenu } from './ui/PauseMenu';
import { InteractionModal } from './ui/InteractionModal';
import { ControlsModal } from './ui/ControlsModal';
import { SettingsModal } from './ui/SettingsModal';
import { DefeatModal } from './ui/DefeatModal';
import { VictoryModal } from './ui/VictoryModal';
import { CampaignVictoryModal } from './ui/CampaignVictoryModal';
import { CampaignMapModal } from './ui/CampaignMapModal';
import { BriefingModal } from './ui/BriefingModal';
import { VirtualControls } from './ui/VirtualControls';
import { LoadingScreen } from './ui/LoadingScreen';
import { AcademyModal } from './ui/AcademyModal';
import { LocationDefinition, LocationId } from './game/campaign/CampaignTypes';
import { CertificationExamReport } from './game/academy/AcademyTypes';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // High-level UI states
  const [gameState, setGameState] = useState<GameState>('menu');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadPercent, setLoadPercent] = useState<number>(20);

  // Player vitals & combat metrics
  const [health, setHealth] = useState<number>(100);
  const [energy, setEnergy] = useState<number>(100);
  const [stability, setStability] = useState<number>(65);
  const [timerSeconds, setTimerSeconds] = useState<number>(720);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(1);
  const [bossHealth, setBossHealth] = useState<number>(300);
  const [bossMaxHealth, setBossMaxHealth] = useState<number>(300);
  const [bossShield, setBossShield] = useState<number>(100);
  const [defeatReason, setDefeatReason] = useState<string>('');

  // Aiming, Camera & Pickup Feedback
  const [cameraMode, setCameraMode] = useState<CameraMode>('third-person');
  const [isPointerLocked, setIsPointerLocked] = useState<boolean>(false);
  const [pickupToasts, setPickupToasts] = useState<PickupNotificationEvent[]>([]);
  const [screenEffectsEnabled, setScreenEffectsEnabled] = useState<boolean>(true);
  const [mouseSensitivity, setMouseSensitivity] = useState<number>(1.0);

  // Interactive prompts and modals
  const [promptStation, setPromptStation] = useState<InteractiveStation | null>(null);
  const [modalStation, setModalStation] = useState<InteractiveStation | null>(null);
  const [showControls, setShowControls] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Campaign & Multi-Map State
  const [currentLocation, setCurrentLocation] = useState<LocationDefinition | null>(null);
  const [showCampaignMap, setShowCampaignMap] = useState<boolean>(false);
  const [showBriefing, setShowBriefing] = useState<boolean>(false);
  const [isCampaignVictory, setIsCampaignVictory] = useState<boolean>(false);
  const [academyModalConfig, setAcademyModalConfig] = useState<{
    isOpen: boolean;
    initialMode: 'gallery' | 'training' | 'exam';
    stationId?: string;
  }>({ isOpen: false, initialMode: 'gallery' });

  // Autostart query parameter detection for automated testing & direct jump
  const autostartRequested = useRef<boolean>(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1' || params.get('autostart') === 'true') {
        autostartRequested.current = true;
      }
    }
  }, []);

  // Initialize Babylon Game Engine once on canvas mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let engineInstance: GameEngine | null = null;

    try {
      setLoadPercent(45);
      engineInstance = new GameEngine(canvas, {
        onStateChange: (newState) => {
          setGameState(newState);
        },
        onPromptChange: (station) => {
          setPromptStation(station);
        },
        onOpenInteraction: (station) => {
          setModalStation(station);
        },
        onPlayerStats: (h, e, stab, timer, sc, cb, bH, bMH, bShield) => {
          setHealth(h);
          setEnergy(e);
          setStability(stab);
          setTimerSeconds(timer);
          setScore(sc);
          setCombo(cb);
          setBossHealth(bH);
          setBossMaxHealth(bMH);
          setBossShield(bShield);
        },
        onDefeat: (reason) => {
          setDefeatReason(reason);
        },
        onCampaignVictory: () => {
          setIsCampaignVictory(true);
        },
        onCameraModeChange: (mode) => {
          setCameraMode(mode);
        },
        onPointerLockChange: (locked) => {
          setIsPointerLocked(locked);
        },
        onLocationChange: (loc) => {
          setCurrentLocation(loc);
        },
        onOpenCampaignMap: () => {
          setShowCampaignMap(true);
        },
        onOpenBriefing: () => {
          setShowBriefing(true);
        },
        onOpenAcademyModal: (mode, stationId) => {
          setAcademyModalConfig({ isOpen: true, initialMode: mode, stationId });
        },
        onPickupNotification: (event) => {
          setPickupToasts((prev) => [...prev.slice(-3), event]);
          setTimeout(() => {
            setPickupToasts((prev) => prev.filter((t) => t.id !== event.id));
          }, 3200);
        },
      });

      engineRef.current = engineInstance;
      setCurrentLocation(engineInstance.getCampaignManager().getCurrentLocation());
      setLoadPercent(80);

      // Automated test helper to open any station modal and access engine
      (window as unknown as { __openStation?: (id: string) => void }).__openStation = (id: string) => {
        const s = engineInstance?.getInteractionManager().getStation(id);
        if (s) {
          engineInstance?.pause();
          setModalStation(s);
        }
      };
      (window as unknown as { __openAcademy?: (mode?: 'gallery' | 'training' | 'exam', stationId?: string) => void }).__openAcademy = (mode = 'gallery', stationId?: string) => {
        engineInstance?.pause();
        setAcademyModalConfig({ isOpen: true, initialMode: mode, stationId });
      };
      (window as unknown as { __gameEngine?: GameEngine }).__gameEngine = engineInstance;
      (window as unknown as { __switchLocation?: (id: LocationId) => boolean }).__switchLocation = (id: LocationId) => {
        return engineInstance?.switchLocation(id) ?? false;
      };
      (window as unknown as { __campaignManager?: unknown }).__campaignManager = engineInstance?.getCampaignManager();

      // Brief simulated warm-up to ensure shaders and geometries compile
      const timer = setTimeout(() => {
        setLoadPercent(100);
        setIsLoading(false);

        if (autostartRequested.current && engineRef.current) {
          engineRef.current.startPlaying();
        }
      }, 500);

      return () => {
        clearTimeout(timer);
        if (engineInstance) {
          engineInstance.dispose();
          engineRef.current = null;
        }
      };
    } catch (err) {
      console.error('Failed to initialize 3D GameEngine:', err);
      setIsLoading(false);
    }
  }, []);

  // Control handlers
  const handleStartGame = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.startPlaying();
    }
  }, []);

  const handlePause = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.pause();
    }
  }, []);

  const handleResume = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.resume();
    }
  }, []);

  const handleRestart = useCallback(() => {
    setModalStation(null);
    setDefeatReason('');
    if (engineRef.current) {
      engineRef.current.restart();
    }
  }, []);

  const handleReturnToMenu = useCallback(() => {
    setModalStation(null);
    setShowControls(false);
    setShowSettings(false);
    setShowCampaignMap(false);
    setShowBriefing(false);
    setDefeatReason('');
    if (engineRef.current) {
      engineRef.current.returnToMenu();
    }
  }, []);

  const handleSelectLocation = useCallback((locId: LocationId) => {
    setShowCampaignMap(false);
    if (engineRef.current) {
      const ok = engineRef.current.switchLocation(locId);
      if (ok) {
        engineRef.current.resume();
      }
    }
  }, []);

  const handleReturnToHub = useCallback(() => {
    setShowCampaignMap(false);
    setShowBriefing(false);
    if (engineRef.current) {
      engineRef.current.switchLocation('hub');
      engineRef.current.resume();
    }
  }, []);

  const handleResetCampaign = useCallback(() => {
    setShowCampaignMap(false);
    setShowBriefing(false);
    setModalStation(null);
    setDefeatReason('');
    if (engineRef.current) {
      engineRef.current.getCampaignManager().resetCampaign();
      engineRef.current.switchLocation('hub');
      engineRef.current.restart();
    }
  }, []);

  const handleOpenAcademy = useCallback((mode: 'gallery' | 'training' | 'exam' = 'gallery', stationId?: string) => {
    if (engineRef.current) {
      engineRef.current.pause();
    }
    setAcademyModalConfig({ isOpen: true, initialMode: mode, stationId });
  }, []);

  const handleCloseAcademy = useCallback(() => {
    setAcademyModalConfig((prev) => ({ ...prev, isOpen: false }));
    if (engineRef.current) {
      engineRef.current.resume();
    }
  }, []);

  const handleAcademyCertificationSuccess = useCallback((report: CertificationExamReport) => {
    if (engineRef.current) {
      const mgr = engineRef.current.getCampaignManager();
      const unlockRes = mgr.registerExamPassed(report.examId);
      setCurrentLocation(mgr.getCurrentLocation());

      if (unlockRes.newUnlocks.length > 0) {
        const unlockedNames = unlockRes.newUnlocks
          .map((uid) => mgr.getLocation(uid)?.nameAr)
          .filter(Boolean)
          .join(' و ');
        sounds.playSuccess();
        setPickupToasts((prev) => [
          ...prev.slice(-3),
          {
            id: `exam_unlock_${Date.now()}`,
            type: 'keycard',
            nameAr: 'تم اجتياز اختبار التأهيل وفتح قطاع جديد!',
            value: 300,
            icon: 'KeyRound',
            timestamp: Date.now(),
            detailAr: `تم تفعيل تصاريح الدخول إلى: ${unlockedNames}`,
          },
        ]);
      }
    }
  }, []);

  const handleToggleMute = useCallback(() => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sounds.setMasterMute(nextMuted);
  }, [isMuted]);

  // Player weapon fire trigger
  const handleFireWeapon = useCallback(() => {
    if (engineRef.current) {
      const inputMgr = engineRef.current.getInputManager();
      inputMgr.triggerVirtualFire();
    }
  }, []);

  // Chemistry Interaction actions
  const handleOpenPromptStation = useCallback(() => {
    if (promptStation) {
      if (engineRef.current) {
        engineRef.current.pause();
      }
      setModalStation(promptStation);
      sounds.playInteract();
    }
  }, [promptStation]);

  const handleCloseModal = useCallback(() => {
    setModalStation(null);
    if (engineRef.current) {
      engineRef.current.resume();
    }
  }, []);

  const handleSubmitChemistryAnswer = useCallback((rawInput: string) => {
    if (!engineRef.current) {
      return {
        isCorrect: false,
        scoreAwarded: 0,
        comboMultiplier: 1,
        feedbackMessageAr: '',
        isStepCompleted: false,
        isMissionCompleted: false,
        penaltyStability: 0,
      };
    }
    return engineRef.current.submitChemistryAnswer(rawInput);
  }, []);

  const handleTimeoutChemistryQuestion = useCallback(() => {
    if (!engineRef.current) {
      return {
        isCorrect: false,
        scoreAwarded: 0,
        comboMultiplier: 1,
        feedbackMessageAr: '',
        isStepCompleted: false,
        isMissionCompleted: false,
        penaltyStability: 0,
      };
    }
    return engineRef.current.handleChemistryTimeout();
  }, []);

  const handleTogglePointerLock = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.togglePointerLock();
    }
  }, []);

  const handleToggleCameraMode = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.toggleCameraMode();
    }
  }, []);

  const handleSensitivityChange = useCallback((val: number) => {
    setMouseSensitivity(val);
    if (engineRef.current) {
      engineRef.current.setSensitivity(val);
    }
  }, []);

  const handleToggleScreenEffects = useCallback(() => {
    setScreenEffectsEnabled((prev) => {
      const next = !prev;
      if (engineRef.current) {
        engineRef.current.setScreenEffectsEnabled(next);
      }
      return next;
    });
  }, []);

  const challengeMgr = engineRef.current?.getChemistryManager();
  const missions = challengeMgr?.getMissions() || [];
  const completedMissionsCount = missions.filter((m) => m.isCompleted).length;
  const stats = challengeMgr?.getStats() || { score: 0, combo: 1, maxCombo: 1, correct: 0, incorrect: 0, hintsUsed: 0 };

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-[#050811] text-slate-100 select-none"
      dir="rtl"
      data-state={gameState}
    >
      {/* 3D WebGL Canvas Layer */}
      <canvas
        ref={canvasRef}
        id="game-canvas"
        className="absolute inset-0 w-full h-full block outline-none touch-none z-0 cursor-grab active:cursor-grabbing"
        tabIndex={0}
        onClick={() => canvasRef.current?.focus()}
      />

      {/* Loading Screen */}
      {isLoading && <LoadingScreen progressPercent={loadPercent} />}

      {/* Main Menu Overlay (Live 3D background visible behind) */}
      {!isLoading && gameState === 'menu' && (
        <MainMenu
          onStartGame={handleStartGame}
          onOpenControls={() => {
            engineRef.current?.getCameraController().exitPointerLock();
            setShowControls(true);
          }}
          onOpenSettings={() => {
            engineRef.current?.getCameraController().exitPointerLock();
            setShowSettings(true);
          }}
        />
      )}

      {/* In-game HUD */}
      {!isLoading && (gameState === 'playing' || gameState === 'paused') && (
        <GameHUD
          health={health}
          energy={energy}
          stability={stability}
          timerSeconds={timerSeconds}
          score={score}
          combo={combo}
          activeMissionIndex={completedMissionsCount}
          bossHealth={bossHealth}
          bossMaxHealth={bossMaxHealth}
          bossShield={bossShield}
          promptStation={promptStation}
          cameraMode={cameraMode}
          isPointerLocked={isPointerLocked}
          pickupToasts={pickupToasts}
          currentLocationNameAr={currentLocation?.nameAr}
          currentLocationCodenameAr={currentLocation?.codenameAr}
          onOpenCampaignMap={() => {
            engineRef.current?.pause();
            setShowCampaignMap(true);
          }}
          onOpenAcademy={() => handleOpenAcademy('gallery')}
          onTogglePointerLock={handleTogglePointerLock}
          onToggleCameraMode={handleToggleCameraMode}
          onPause={handlePause}
          onInteract={handleOpenPromptStation}
          onFire={handleFireWeapon}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Mobile Touch Controls Layer */}
      {!isLoading && gameState === 'playing' && engineRef.current && (
        <VirtualControls
          inputManager={engineRef.current.getInputManager()}
          hasPrompt={!!promptStation}
          onInteract={handleOpenPromptStation}
          onFire={handleFireWeapon}
        />
      )}

      {/* Pause Menu Modal */}
      {!isLoading && gameState === 'paused' && !modalStation && !showCampaignMap && !showBriefing && !showControls && !showSettings && !academyModalConfig.isOpen && (
        <PauseMenu
          onResume={handleResume}
          onRestart={handleRestart}
          onOpenControls={() => {
            engineRef.current?.getCameraController().exitPointerLock();
            setShowControls(true);
          }}
          onOpenSettings={() => {
            engineRef.current?.getCameraController().exitPointerLock();
            setShowSettings(true);
          }}
          onReturnToMenu={handleReturnToMenu}
          onOpenCampaignMap={() => {
            setShowCampaignMap(true);
          }}
          onOpenAcademy={() => {
            setShowCampaignMap(false);
            handleOpenAcademy('gallery');
          }}
          onReturnToHub={handleReturnToHub}
          onResetCampaign={handleResetCampaign}
        />
      )}

      {/* Campaign Sector Map Modal */}
      {showCampaignMap && engineRef.current && (
        <CampaignMapModal
          locations={engineRef.current.getCampaignManager().getAllLocations()}
          currentLocationId={currentLocation?.id || 'hub'}
          onSelectLocation={handleSelectLocation}
          onClose={() => {
            setShowCampaignMap(false);
            engineRef.current?.resume();
          }}
        />
      )}

      {/* Tactical Mission Briefing Modal */}
      {showBriefing && (
        <BriefingModal
          onClose={() => {
            setShowBriefing(false);
            engineRef.current?.resume();
          }}
          onOpenMap={() => {
            setShowBriefing(false);
            setShowCampaignMap(true);
          }}
        />
      )}

      {/* Chemistry Station Interaction Modal */}
      {modalStation && challengeMgr && (
        <InteractionModal
          station={modalStation}
          challengeMgr={challengeMgr}
          onClose={handleCloseModal}
          onSubmitAnswer={handleSubmitChemistryAnswer}
          onTimeout={handleTimeoutChemistryQuestion}
        />
      )}

      {/* Controls Overview Modal */}
      {showControls && <ControlsModal onClose={() => setShowControls(false)} />}

      {/* Settings Modal (Volume, Hazard, Sensitivity, Danger effects) */}
      {showSettings && (
        <SettingsModal
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          mouseSensitivity={mouseSensitivity}
          onSensitivityChange={handleSensitivityChange}
          screenEffectsEnabled={screenEffectsEnabled}
          onToggleScreenEffects={handleToggleScreenEffects}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* 3D Stoichiometry Academy & 20-Question Certification Exam Modal */}
      {academyModalConfig.isOpen && (
        <AcademyModal
          initialMode={academyModalConfig.initialMode}
          initialStationId={academyModalConfig.stationId}
          onClose={handleCloseAcademy}
          onCertificationSuccess={handleAcademyCertificationSuccess}
        />
      )}

      {/* Defeat Modal */}
      {gameState === 'defeat' && (
        <DefeatModal
          reasonAr={defeatReason}
          score={score}
          completedMissions={completedMissionsCount}
          totalMissions={5}
          incorrectAnswers={stats.incorrect}
          onRestart={handleRestart}
          onReturnToMenu={handleReturnToMenu}
        />
      )}

      {/* Grand Campaign Victory or Single Mission Complete Modal */}
      {gameState === 'victory' && (
        isCampaignVictory || engineRef.current?.getCampaignManager().isCampaignFinished() ? (
          <CampaignVictoryModal
            score={score}
            comboMax={stats.maxCombo}
            accuracyPercent={stats.correct + stats.incorrect > 0 ? Math.round((stats.correct / (stats.correct + stats.incorrect)) * 100) : 100}
            totalTimeSeconds={engineRef.current?.getCampaignManager().getPlayTimeSeconds() || (720 - timerSeconds)}
            completedLocations={engineRef.current?.getCampaignManager().getAllLocations().filter((l) => l.isCompleted) || []}
            onReturnToHub={handleReturnToHub}
            onRestartCampaign={handleResetCampaign}
          />
        ) : (
          <VictoryModal
            score={score}
            comboMax={stats.maxCombo}
            onRestart={handleRestart}
            onReturnToMenu={handleReturnToMenu}
          />
        )
      )}
    </div>
  );
}
