/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/engine.ts';
import { loadGameData, saveGameData, GameSaveData } from './game/reputationAndSave.ts';
import { GameMode, SuitDefinition, UpgradeItem, TrickNotification } from './types/game.ts';
import { TitleScreen } from './components/TitleScreen.tsx';
import { HUDOverlay } from './components/HUDOverlay.tsx';
import { PauseMenu } from './components/PauseMenu.tsx';
import { InteractiveMapModal } from './components/InteractiveMapModal.tsx';
import { DialogueOverlay, DialogueLine } from './components/DialogueOverlay.tsx';
import { ApkDownlinkModal } from './components/ApkDownlinkModal.tsx';
import { sound } from './game/audio.ts';

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [mode, setMode] = useState<GameMode>('TITLE');
  const [saveData, setSaveData] = useState<GameSaveData>(() => loadGameData());
  const [fps, setFps] = useState<number>(30);
  const [activeBiome, setActiveBiome] = useState<string>('DOWNTOWN');
  const [nearbyVehicle, setNearbyVehicle] = useState<string | null>(null);
  const [isInVehicle, setIsInVehicle] = useState<boolean>(false);
  const [vehicleSpeed, setVehicleSpeed] = useState<number>(0);
  const [trickNotes, setTrickNotes] = useState<TrickNotification[]>([]);
  const [activeDialogue, setActiveDialogue] = useState<DialogueLine[] | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isApkModalOpen, setIsApkModalOpen] = useState<boolean>(false);

  // Active inputs buffer
  const inputsRef = useRef({
    moveX: 0,
    moveZ: 0,
    sprint: false,
    jump: false,
    swingHeld: false,
    dodge: false,
    dive: false,
  });

  // 1. Initialize Engine on Mount
  useEffect(() => {
    if (!canvasMountRef.current) return;

    const engine = new GameEngine(canvasMountRef.current, saveData);
    engineRef.current = engine;

    // Attach engine callbacks
    engine.onStatsUpdate = () => {
      setFps(engine.fps);
      if (engine.movement) {
        const biome = engine.world.getBiomeAt(
          engine.movement.position.x,
          engine.movement.position.z,
          engine.movement.position.y
        );
        setActiveBiome(biome);

        const v = engine.vehicles.getNearbyVehicle(engine.movement.position);
        setNearbyVehicle(v ? v.type : null);
        setIsInVehicle(!!engine.vehicles.activeVehicle);
      }
    };

    engine.onMissionCompleted = (title, xp, credits) => {
      setSaveData((prev) => {
        const updated = { ...prev };
        saveGameData(updated);
        return updated;
      });
      // Show victory trick chime
      setTrickNotes((prev) => [
        { id: `m_${Date.now()}`, name: `MISSION COMPLETE: ${title}`, xp, timestamp: Date.now() },
        ...prev.slice(0, 3),
      ]);
    };

    engine.onTrick = (name, xp) => {
      setTrickNotes((prev) => [
        { id: `trick_${Date.now()}`, name, xp, timestamp: Date.now() },
        ...prev.slice(0, 3),
      ]);
    };

    // Keyboard Input Listeners
    const keysDown = new Set<string>();

    const updateMovementInputs = () => {
      let mx = 0;
      let mz = 0;
      if (keysDown.has('KeyA') || keysDown.has('ArrowLeft')) mx -= 1;
      if (keysDown.has('KeyD') || keysDown.has('ArrowRight')) mx += 1;
      if (keysDown.has('KeyW') || keysDown.has('ArrowUp')) mz -= 1;
      if (keysDown.has('KeyS') || keysDown.has('ArrowDown')) mz += 1;

      inputsRef.current.moveX = mx;
      inputsRef.current.moveZ = mz;
      inputsRef.current.sprint = keysDown.has('ShiftLeft') || keysDown.has('ShiftRight');
      inputsRef.current.jump = keysDown.has('Space');
      inputsRef.current.swingHeld = keysDown.has('KeyE') || keysDown.has('ShiftLeft');
      inputsRef.current.dive = keysDown.has('KeyC');

      // Feed into engine if in PLAYING mode
      if (engine.vehicles.activeVehicle) {
        engine.vehicles.update(0.016, {
          forward: -mz,
          steer: mx,
          handbrake: keysDown.has('Space'),
          lift: keysDown.has('Space') ? 1 : keysDown.has('KeyC') ? -1 : 0,
        }, (spd) => setVehicleSpeed(spd));
      } else {
        engine.movement.update(0.016, inputsRef.current, engine.cameraYaw, (name, xp) => {
          engine.onTrick?.(name, xp);
        });
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is in an input field
      if ((e.target as HTMLElement).tagName === 'INPUT') return;

      keysDown.add(e.code);
      sound.init();

      if (e.code === 'Escape') {
        setMode((prev) => (prev === 'PLAYING' ? 'PAUSED' : prev === 'PAUSED' ? 'PLAYING' : prev));
      } else if (e.code === 'KeyM') {
        setMode((prev) => (prev === 'PLAYING' ? 'MAP' : prev === 'MAP' ? 'PLAYING' : prev));
      } else if (e.code === 'KeyF') {
        // Vehicle enter/exit
        if (engine.vehicles.activeVehicle) {
          const exitPos = engine.vehicles.exitVehicle();
          engine.movement.position.copy(exitPos);
          setIsInVehicle(false);
        } else {
          const v = engine.vehicles.getNearbyVehicle(engine.movement.position);
          if (v) {
            engine.vehicles.enterVehicle(v);
            setIsInVehicle(true);
          }
        }
      } else if (e.code === 'KeyQ') {
        // Web Boom
        engine.combat.executeWebBoom(engine.movement.position);
      } else if (e.code === 'KeyR') {
        // Special attack
        engine.combat.executeSpecialAttack(engine.movement.position);
      }

      updateMovementInputs();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysDown.delete(e.code);
      updateMovementInputs();
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (mode !== 'PLAYING') return;
      sound.init();
      if (e.button === 0) {
        // LMB: Melee attack
        engine.combat.executeMeleeAttack(engine.movement.position, engine.movement.rotationY);
      } else if (e.button === 2) {
        // RMB: Web Shot
        e.preventDefault();
        engine.combat.executeWebShot(engine.movement.position, engine.movement.rotationY);
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleBlur = () => {
      keysDown.clear();
      updateMovementInputs();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('blur', handleBlur);

    // Continuous tick feed for movement input
    const inputInterval = setInterval(() => {
      if (mode === 'PLAYING' && engineRef.current) {
        updateMovementInputs();
      }
    }, 16);

    return () => {
      clearInterval(inputInterval);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('blur', handleBlur);
      engine.dispose();
    };
  }, [mode]);

  // Handle touch actions from HUD
  const handleTouchAction = useCallback((action: 'MELEE' | 'JUMP' | 'SWING_DOWN' | 'SWING_UP' | 'WEB_SHOT' | 'WEB_BOOM' | 'DODGE' | 'SPECIAL' | 'VEHICLE') => {
    sound.init();
    if (!engineRef.current) return;
    const eng = engineRef.current;

    switch (action) {
      case 'MELEE':
        eng.combat.executeMeleeAttack(eng.movement.position, eng.movement.rotationY);
        break;
      case 'JUMP':
        eng.movement.velocity.y = 14.5;
        eng.movement.isGrounded = false;
        sound.playJump();
        break;
      case 'SWING_DOWN':
        inputsRef.current.swingHeld = true;
        break;
      case 'SWING_UP':
        inputsRef.current.swingHeld = false;
        break;
      case 'WEB_SHOT':
        eng.combat.executeWebShot(eng.movement.position, eng.movement.rotationY);
        break;
      case 'WEB_BOOM':
        eng.combat.executeWebBoom(eng.movement.position);
        break;
      case 'DODGE':
        inputsRef.current.dodge = true;
        setTimeout(() => (inputsRef.current.dodge = false), 100);
        break;
      case 'SPECIAL':
        eng.combat.executeSpecialAttack(eng.movement.position);
        break;
      case 'VEHICLE':
        if (eng.vehicles.activeVehicle) {
          const exitPos = eng.vehicles.exitVehicle();
          eng.movement.position.copy(exitPos);
          setIsInVehicle(false);
        } else {
          const v = eng.vehicles.getNearbyVehicle(eng.movement.position);
          if (v) {
            eng.vehicles.enterVehicle(v);
            setIsInVehicle(true);
          }
        }
        break;
    }
  }, []);

  const handleTouchMove = useCallback((x: number, y: number) => {
    inputsRef.current.moveX = x;
    inputsRef.current.moveZ = y;
  }, []);

  const handleCameraDrag = useCallback((dx: number, dy: number) => {
    if (engineRef.current) {
      engineRef.current.rotateCamera(dx, dy);
    }
  }, []);

  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      sound.setVolumes(saveData.audio.masterVolume, saveData.audio.sfxVolume, saveData.audio.musicVolume, next);
      return next;
    });
  }, [saveData.audio]);

  const handleFastTravel = useCallback((pos: [number, number, number]) => {
    if (engineRef.current) {
      engineRef.current.movement.position.set(pos[0], pos[1], pos[2]);
      engineRef.current.movement.velocity.set(0, 0, 0);
    }
  }, []);

  const handleEquipSuit = useCallback((suit: SuitDefinition) => {
    if (!suit.unlocked) {
      if (saveData.stats.credits >= suit.cost) {
        setSaveData((prev) => {
          const updatedSuits = prev.suits.map((s) => (s.id === suit.id ? { ...s, unlocked: true } : s));
          const updated = {
            ...prev,
            stats: { ...prev.stats, credits: prev.stats.credits - suit.cost, currentSuitId: suit.id },
            suits: updatedSuits,
          };
          saveGameData(updated);
          return updated;
        });
        if (engineRef.current) engineRef.current.setSuit(suit);
      }
    } else {
      setSaveData((prev) => {
        const updated = {
          ...prev,
          stats: { ...prev.stats, currentSuitId: suit.id },
        };
        saveGameData(updated);
        return updated;
      });
      if (engineRef.current) engineRef.current.setSuit(suit);
    }
  }, [saveData.stats.credits]);

  const handleBuyUpgrade = useCallback((upgrade: UpgradeItem) => {
    const cost = upgrade.costPerLevel * upgrade.level;
    if (saveData.stats.credits >= cost && upgrade.level < upgrade.maxLevel) {
      setSaveData((prev) => {
        const updatedUpgrades = prev.upgrades.map((u) =>
          u.id === upgrade.id ? { ...u, level: u.level + 1 } : u
        );
        const updated = {
          ...prev,
          stats: { ...prev.stats, credits: prev.stats.credits - cost },
          upgrades: updatedUpgrades,
        };
        saveGameData(updated);
        return updated;
      });
      sound.playTrickChime();
    }
  }, [saveData.stats.credits]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none touch-none">
      {/* 3D WebGL Canvas Mount Container (isolated from React re-renders) */}
      <div ref={canvasMountRef} className="absolute inset-0 w-full h-full" />

      {/* TITLE SCREEN */}
      {mode === 'TITLE' && (
        <TitleScreen
          onStartGame={() => {
            sound.init();
            setMode('PLAYING');
            // Show prologue dialogue if first mission
            if (engineRef.current?.missions.activeMission?.dialogue) {
              setActiveDialogue(engineRef.current.missions.activeMission.dialogue);
            }
          }}
          onOpenSettings={() => setMode('PAUSED')}
          onOpenCredits={() => alert('Vanguard Weaver: An original 3D open-world superhero game engine built for ultra low-end mobile devices and browser 60fps WebGL.')}
          onOpenApkModal={() => setIsApkModalOpen(true)}
          hasSave={saveData.stats.xp > 0}
        />
      )}

      {/* PLAYING HUD OVERLAY */}
      {mode === 'PLAYING' && (
        <HUDOverlay
          stats={saveData.stats}
          fps={fps}
          activeMission={engineRef.current?.missions.activeMission || null}
          activeBiome={activeBiome}
          nearbyVehicle={nearbyVehicle}
          isInVehicle={isInVehicle}
          vehicleSpeed={vehicleSpeed}
          trickNotes={trickNotes}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onOpenPause={() => setMode('PAUSED')}
          onOpenMap={() => setMode('MAP')}
          onOpenApkModal={() => setIsApkModalOpen(true)}
          onTouchMove={handleTouchMove}
          onTouchAction={handleTouchAction}
          onCameraDrag={handleCameraDrag}
        />
      )}

      {/* STORY DIALOGUE OVERLAY */}
      {activeDialogue && (
        <DialogueOverlay
          dialogue={activeDialogue}
          onComplete={() => setActiveDialogue(null)}
        />
      )}

      {/* FULL-SCREEN MAP MODAL */}
      {mode === 'MAP' && engineRef.current && (
        <InteractiveMapModal
          playerPos={[
            engineRef.current.movement.position.x,
            engineRef.current.movement.position.y,
            engineRef.current.movement.position.z,
          ]}
          missions={engineRef.current.missions.missions}
          activeMission={engineRef.current.missions.activeMission}
          activeCrimes={engineRef.current.missions.activeCrimes}
          onClose={() => setMode('PLAYING')}
          onFastTravel={handleFastTravel}
          onSelectMission={(id) => {
            engineRef.current?.missions.setActiveMissionById(id);
            setMode('PLAYING');
          }}
        />
      )}

      {/* PAUSE MENU MODAL */}
      {mode === 'PAUSED' && (
        <PauseMenu
          saveData={saveData}
          missions={engineRef.current?.missions.missions || []}
          onResume={() => setMode('PLAYING')}
          onOpenMap={() => setMode('MAP')}
          onOpenApkModal={() => setIsApkModalOpen(true)}
          onEquipSuit={handleEquipSuit}
          onBuyUpgrade={handleBuyUpgrade}
          onSave={() => saveGameData(saveData)}
          onQuitToTitle={() => setMode('TITLE')}
          onUpdateGraphics={(graphics) => {
            setSaveData((prev) => ({ ...prev, graphics }));
            saveGameData({ ...saveData, graphics });
          }}
          onUpdateAudio={(audio) => {
            setSaveData((prev) => ({ ...prev, audio }));
            sound.setVolumes(audio.masterVolume, audio.sfxVolume, audio.musicVolume, audio.muted);
          }}
        />
      )}

      {/* ANDROID APK DOWNLINK & INSTALL MODAL */}
      {isApkModalOpen && (
        <ApkDownlinkModal onClose={() => setIsApkModalOpen(false)} />
      )}
    </div>
  );
}
