import React, { useState } from 'react';
import {
  Compass,
  Map as MapIcon,
  Shield,
  Zap,
  Flame,
  Crosshair,
  Volume2,
  VolumeX,
  Menu,
  ChevronDown,
  ChevronUp,
  Car,
  Smartphone,
} from 'lucide-react';
import { PlayerStats, Mission, TrickNotification } from '../types/game.ts';

interface HUDOverlayProps {
  stats: PlayerStats;
  fps: number;
  activeMission: Mission | null;
  activeBiome: string;
  nearbyVehicle: string | null;
  isInVehicle: boolean;
  vehicleSpeed: number;
  trickNotes: TrickNotification[];
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenPause: () => void;
  onOpenMap: () => void;
  onOpenApkModal: () => void;
  // Touch inputs handlers
  onTouchMove: (x: number, z: number) => void;
  onTouchAction: (action: 'MELEE' | 'JUMP' | 'SWING_DOWN' | 'SWING_UP' | 'WEB_SHOT' | 'WEB_BOOM' | 'DODGE' | 'SPECIAL' | 'VEHICLE') => void;
  onCameraDrag: (dx: number, dy: number) => void;
}

export const HUDOverlay: React.FC<HUDOverlayProps> = ({
  stats,
  fps,
  activeMission,
  activeBiome,
  nearbyVehicle,
  isInVehicle,
  vehicleSpeed,
  trickNotes,
  isMuted,
  onToggleMute,
  onOpenPause,
  onOpenMap,
  onOpenApkModal,
  onTouchMove,
  onTouchAction,
  onCameraDrag,
}) => {
  const [controlsCollapsed, setControlsCollapsed] = useState(false);
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
  const [isJoystickActive, setIsJoystickActive] = useState(false);

  // Touch Camera Drag Tracking
  const handleTouchStart = (e: React.TouchEvent) => {
    // Only drag camera on background touch
    if ((e.target as HTMLElement).tagName === 'BUTTON') return;
  };

  const handleJoystickTouch = (e: React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = touch.clientX - centerX;
    const dy = touch.clientY - centerY;
    const dist = Math.min(40, Math.sqrt(dx * dx + dy * dy));
    const angle = Math.atan2(dy, dx);

    const nx = (Math.cos(angle) * dist) / 40;
    const ny = (Math.sin(angle) * dist) / 40;

    setJoystickPos({ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist });
    setIsJoystickActive(true);
    onTouchMove(nx, ny);
  };

  const handleJoystickEnd = () => {
    setJoystickPos({ x: 0, y: 0 });
    setIsJoystickActive(false);
    onTouchMove(0, 0);
  };

  // Drag look surface
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

  return (
    <div
      className="absolute inset-0 z-20 pointer-events-none select-none flex flex-col justify-between p-3 sm:p-5 overflow-hidden font-sans"
      onTouchStart={handleTouchStart}
    >
      {/* Invisible Camera Drag Pad across central 70% viewport */}
      <div
        className="absolute inset-x-0 top-20 bottom-36 pointer-events-auto"
        onTouchStart={(e) => {
          const t = e.touches[0];
          setDragStart({ x: t.clientX, y: t.clientY });
        }}
        onTouchMove={(e) => {
          if (!dragStart) return;
          const t = e.touches[0];
          const dx = t.clientX - dragStart.x;
          const dy = t.clientY - dragStart.y;
          onCameraDrag(dx, dy);
          setDragStart({ x: t.clientX, y: t.clientY });
        }}
        onTouchEnd={() => setDragStart(null)}
      />

      {/* TOP PERIMETER: Stats Cluster & Minimap */}
      <div className="w-full flex justify-between items-start pointer-events-none">
        {/* Top-Left: Hero Vital Clusters */}
        <div className="flex flex-col gap-1.5 max-w-[240px] sm:max-w-xs">
          {/* Health Bar */}
          <div className="bg-slate-900/90 border border-slate-700/80 rounded-md p-2 shadow-md">
            <div className="flex justify-between items-center text-xs font-mono mb-1">
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 fill-emerald-400" /> HP
              </span>
              <span className="text-slate-200 tabular-nums font-semibold">
                {Math.round(stats.health)} / {stats.maxHealth}
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-150"
                style={{ width: `${Math.max(0, (stats.health / stats.maxHealth) * 100)}%` }}
              />
            </div>

            {/* Filament Energy Bar */}
            <div className="flex justify-between items-center text-xs font-mono mt-1.5 mb-1">
              <span className="text-cyan-400 font-bold flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 fill-cyan-400" /> FILAMENT
              </span>
              <span className="text-slate-200 tabular-nums">
                {Math.round(stats.energy)}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-cyan-400 transition-all duration-100"
                style={{ width: `${Math.max(0, (stats.energy / stats.maxEnergy) * 100)}%` }}
              />
            </div>

            {/* Stamina / Oxygen Bar */}
            <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden mt-1.5">
              <div
                className={`h-full ${stats.oxygen < 100 ? 'bg-sky-400' : 'bg-amber-400'}`}
                style={{ width: `${stats.oxygen < 100 ? stats.oxygen : stats.stamina}%` }}
              />
            </div>
          </div>

          {/* Level, Credits & Reputation Meter */}
          <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-md px-2.5 py-1 text-xs font-mono">
            <span className="text-amber-300 font-bold">LVL {stats.level}</span>
            <span className="text-emerald-400 font-bold">${stats.credits}</span>
            <span className="text-sky-300 text-[10px]">HERO {stats.heroReputation}%</span>
            <span className="text-slate-400 text-[10px] tabular-nums">{fps} FPS</span>
          </div>
        </div>

        {/* Top-Center: Directional Mission Waypoint Tracker */}
        {activeMission && (
          <div className="hidden sm:flex flex-col items-center bg-slate-900/90 border border-cyan-500/40 px-4 py-1.5 rounded-lg shadow-lg pointer-events-auto">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold tracking-wider uppercase">
              <Crosshair className="w-3.5 h-3.5" />
              <span>{activeMission.title}</span>
            </div>
            <span className="text-slate-300 text-xs font-medium mt-0.5">
              {activeMission.objectiveText}
            </span>
          </div>
        )}

        {/* Top-Right: Minimap Radar & Controls Buttons */}
        <div className="flex flex-col items-end gap-2">
          {/* Minimap Circle */}
          <div
            onClick={onOpenMap}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-950/90 border-2 border-cyan-500/50 shadow-lg relative flex items-center justify-center pointer-events-auto cursor-pointer active:scale-95 transition-transform"
          >
            {/* Radar Sweep Lines */}
            <div className="absolute inset-0 rounded-full border border-cyan-500/20" />
            <div className="absolute w-full h-[1px] bg-cyan-500/20" />
            <div className="absolute h-full w-[1px] bg-cyan-500/20" />
            {/* North Indicator */}
            <span className="absolute top-1 text-[9px] font-bold text-cyan-400">N</span>
            {/* Player Center Icon */}
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8]" />
            {/* Waypoint Blip */}
            <div className="absolute top-3 right-4 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            {/* Biome label */}
            <span className="absolute bottom-1 text-[8px] font-mono text-slate-300 bg-slate-900/80 px-1 rounded">
              {activeBiome}
            </span>
          </div>

          {/* Quick HUD Action Buttons */}
          <div className="flex gap-1.5 pointer-events-auto">
            <button
              onClick={onOpenApkModal}
              className="p-2 rounded-md bg-emerald-950/90 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 cursor-pointer shadow-md"
              title="Android APK Downlink"
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
            </button>
            <button
              onClick={onOpenMap}
              className="p-2 rounded-md bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 cursor-pointer shadow-md"
              title="Open Map"
            >
              <MapIcon className="w-4 h-4 text-cyan-400" />
            </button>
            <button
              onClick={onToggleMute}
              className="p-2 rounded-md bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 cursor-pointer shadow-md"
              title="Mute Sound"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
            <button
              onClick={onOpenPause}
              className="p-2 rounded-md bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 cursor-pointer shadow-md"
              title="Pause Menu"
            >
              <Menu className="w-4 h-4 text-cyan-400" />
            </button>
          </div>
        </div>
      </div>

      {/* MID-SCREEN: Combo & Trick Feats */}
      <div className="w-full flex justify-between items-center pointer-events-none px-4">
        {/* Left: Combo Counter */}
        {stats.combo > 1 && (
          <div className="bg-slate-900/90 border-l-4 border-amber-400 px-3 py-1.5 rounded-r-md shadow-lg animate-bounce">
            <span className="text-2xl font-black text-amber-400 font-mono tracking-tighter">
              {stats.combo}x COMBO!
            </span>
          </div>
        )}

        {/* Right: Aerial Trick Popups */}
        <div className="flex flex-col items-end gap-1.5 ml-auto">
          {trickNotes.map((trick) => (
            <div
              key={trick.id}
              className="bg-slate-900/90 border border-cyan-400/60 px-3 py-1 rounded-md text-xs font-bold text-cyan-300 font-mono shadow-md animate-pulse"
            >
              ★ {trick.name} <span className="text-amber-400">+{trick.xp} XP</span>
            </div>
          ))}
          {/* Vehicle Speedometer if driving */}
          {isInVehicle && (
            <div className="bg-slate-900/90 border border-amber-500/60 px-3 py-1.5 rounded-md text-right font-mono">
              <div className="text-[10px] text-amber-400 uppercase font-bold flex items-center justify-end gap-1">
                <Car className="w-3 h-3" /> SPEED
              </div>
              <div className="text-2xl font-black text-white tabular-nums">
                {vehicleSpeed} <span className="text-xs font-normal text-slate-400">KM/H</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM PERIMETER: Consolidated Collapsible Touch Controls Dock */}
      <div className="w-full flex flex-col items-center pointer-events-none mt-auto">
        {/* Collapse / Expand Toggle */}
        <button
          onClick={() => setControlsCollapsed(!controlsCollapsed)}
          className="pointer-events-auto mb-1 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs px-3 py-1 rounded-full flex items-center gap-1 shadow-md cursor-pointer active:scale-95 transition-all"
        >
          {controlsCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-cyan-400" /> Show Touch Controls
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-cyan-400" /> Hide Touch Controls
            </>
          )}
        </button>

        {!controlsCollapsed && (
          <div className="w-full max-w-4xl flex justify-between items-end pb-1 px-2 pointer-events-none">
            {/* Left: Virtual Movement Joystick */}
            <div
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-slate-950/70 border-2 border-slate-700/80 relative flex items-center justify-center pointer-events-auto touch-none shadow-xl"
              onTouchMove={handleJoystickTouch}
              onTouchEnd={handleJoystickEnd}
            >
              {/* Outer boundary guide */}
              <div className="absolute inset-2 rounded-full border border-slate-800" />
              {/* Central Thumb Knob */}
              <div
                className="w-12 h-12 rounded-full bg-gradient-to-b from-cyan-500 to-blue-600 shadow-md border border-cyan-300/60 transition-transform"
                style={{
                  transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)`,
                }}
              />
            </div>

            {/* Right: Combat & Traversal Action Cluster */}
            <div className="grid grid-cols-3 gap-2 pointer-events-auto">
              {/* Row 1 */}
              <button
                onTouchStart={() => onTouchAction('WEB_BOOM')}
                onClick={() => onTouchAction('WEB_BOOM')}
                className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-purple-700/85 active:bg-purple-500 border border-purple-400 text-white font-bold text-[11px] shadow-lg flex flex-col items-center justify-center cursor-pointer active:scale-90 transition-transform"
              >
                <span>BOOM</span>
              </button>

              <button
                onTouchStart={() => onTouchAction('WEB_SHOT')}
                onClick={() => onTouchAction('WEB_SHOT')}
                className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-sky-600/85 active:bg-sky-400 border border-sky-300 text-white font-bold text-[11px] shadow-lg flex flex-col items-center justify-center cursor-pointer active:scale-90 transition-transform"
              >
                <span>SHOT</span>
              </button>

              <button
                onTouchStart={() => onTouchAction('SPECIAL')}
                onClick={() => onTouchAction('SPECIAL')}
                className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 active:from-amber-400 border border-yellow-300 text-black font-extrabold text-[11px] shadow-lg flex flex-col items-center justify-center cursor-pointer active:scale-90 transition-transform"
              >
                <span>APEX</span>
              </button>

              {/* Row 2 */}
              <button
                onTouchStart={() => onTouchAction('MELEE')}
                onClick={() => onTouchAction('MELEE')}
                className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-red-600/85 active:bg-red-500 border border-red-300 text-white font-bold text-[11px] shadow-lg flex flex-col items-center justify-center cursor-pointer active:scale-90 transition-transform"
              >
                <span>MELEE</span>
              </button>

              {/* SWING (Hold to swing, release to launch) */}
              <button
                onTouchStart={() => onTouchAction('SWING_DOWN')}
                onTouchEnd={() => onTouchAction('SWING_UP')}
                onMouseDown={() => onTouchAction('SWING_DOWN')}
                onMouseUp={() => onTouchAction('SWING_UP')}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-cyan-500/90 active:bg-cyan-400 border-2 border-cyan-200 text-slate-950 font-black text-xs shadow-xl flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-transform"
              >
                <span>SWING</span>
              </button>

              <button
                onTouchStart={() => onTouchAction('JUMP')}
                onClick={() => onTouchAction('JUMP')}
                className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-emerald-600/85 active:bg-emerald-500 border border-emerald-300 text-white font-bold text-[11px] shadow-lg flex flex-col items-center justify-center cursor-pointer active:scale-90 transition-transform"
              >
                <span>JUMP</span>
              </button>

              {/* Row 3: Dodge & Vehicle */}
              <button
                onTouchStart={() => onTouchAction('DODGE')}
                onClick={() => onTouchAction('DODGE')}
                className="col-span-2 py-2 rounded-lg bg-slate-800/90 active:bg-slate-700 border border-slate-600 text-slate-200 font-bold text-xs shadow-md flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition-transform"
              >
                <span>DODGE ROLL</span>
              </button>

              {(nearbyVehicle || isInVehicle) && (
                <button
                  onTouchStart={() => onTouchAction('VEHICLE')}
                  onClick={() => onTouchAction('VEHICLE')}
                  className="py-2 rounded-lg bg-amber-600/90 active:bg-amber-500 border border-amber-300 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition-transform animate-bounce"
                >
                  <Car className="w-3.5 h-3.5" />
                  <span>{isInVehicle ? 'EXIT' : 'DRIVE'}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
