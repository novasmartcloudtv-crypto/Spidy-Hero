import React, { useState } from 'react';
import { X, Navigation, Home, AlertCircle, Crosshair, ZoomIn, ZoomOut } from 'lucide-react';
import { SAFEHOUSE_LOCATIONS } from '../game/worldGen.ts';
import { Mission, ActiveCrimeEvent } from '../types/game.ts';

interface InteractiveMapModalProps {
  playerPos: [number, number, number];
  missions: Mission[];
  activeMission: Mission | null;
  activeCrimes: ActiveCrimeEvent[];
  onClose: () => void;
  onFastTravel: (pos: [number, number, number]) => void;
  onSelectMission: (missionId: string) => void;
}

export const InteractiveMapModal: React.FC<InteractiveMapModalProps> = ({
  playerPos,
  missions,
  activeMission,
  activeCrimes,
  onClose,
  onFastTravel,
  onSelectMission,
}) => {
  const [zoom, setZoom] = useState(1.0);
  const [selectedSafehouse, setSelectedSafehouse] = useState<typeof SAFEHOUSE_LOCATIONS[0] | null>(null);

  // Convert world coordinates [-400, 400] to map SVG coordinates [0, 800]
  const worldToMap = (x: number, z: number) => {
    const mapX = 400 + (x / 400) * 350;
    const mapY = 400 + (z / 400) * 350;
    return { x: mapX, y: mapY };
  };

  const pMap = worldToMap(playerPos[0], playerPos[2]);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 select-none">
      <div className="relative w-full max-w-4xl h-[90vh] bg-slate-900 border-2 border-cyan-500/50 rounded-xl flex flex-col overflow-hidden shadow-2xl">
        {/* Header Bar */}
        <div className="flex justify-between items-center px-4 py-3 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-wide">
              NEO-HAVEN METROPOLITAN ATLAS
            </h2>
            <span className="hidden sm:inline text-xs text-slate-400 font-mono ml-2">
              7 CONNECTED BIOMES
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom(Math.max(0.7, zoom - 0.2))}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(Math.min(1.8, zoom + 0.2))}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-900/60 text-slate-300 hover:text-red-300 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Map Canvas / SVG Area */}
        <div className="relative flex-1 bg-slate-950 overflow-auto flex items-center justify-center p-4">
          <div
            className="relative w-[750px] h-[750px] transition-transform duration-150"
            style={{ transform: `scale(${zoom})` }}
          >
            {/* SVG Biome Outlines */}
            <svg viewBox="0 0 800 800" className="w-full h-full rounded-lg border border-slate-800 shadow-inner">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="800" height="800" fill="url(#grid)" />

              {/* 1. South Ocean & Beach Area (Y: 550 to 800) */}
              <rect x="0" y="550" width="800" height="250" fill="#0369a1" fillOpacity="0.35" />
              <path d="M 0 540 Q 400 510 800 540 L 800 580 L 0 580 Z" fill="#d97706" fillOpacity="0.4" />
              <text x="350" y="650" fill="#38bdf8" fontSize="14" fontWeight="bold">SOUTH OCEAN & REEF</text>
              <text x="370" y="560" fill="#fbbf24" fontSize="12" fontWeight="bold">GOLDEN BEACH</text>

              {/* 2. Emerald Jungle (West: X: 0 to 280, Y: 250 to 520) */}
              <rect x="50" y="260" width="230" height="260" rx="16" fill="#14532d" fillOpacity="0.4" />
              <text x="100" y="390" fill="#4ade80" fontSize="14" fontWeight="bold">EMERALD JUNGLE</text>

              {/* 3. Redrock Desert & Canyons (North-West: X: 50 to 280, Y: 50 to 240) */}
              <rect x="50" y="50" width="230" height="190" rx="16" fill="#b45309" fillOpacity="0.4" />
              <text x="90" y="150" fill="#f59e0b" fontSize="14" fontWeight="bold">REDROCK CANYONS</text>

              {/* 4. Neo-Haven Downtown & Midtown (Center: X: 300 to 520, Y: 150 to 500) */}
              <rect x="300" y="160" width="220" height="340" rx="12" fill="#1e293b" fillOpacity="0.6" stroke="#0284c7" strokeWidth="2" />
              <text x="350" y="340" fill="#e0f2fe" fontSize="16" fontWeight="bold">DOWNTOWN SKYLINE</text>
              <text x="375" y="210" fill="#93c5fd" fontSize="12" fontWeight="bold">MIDTOWN RESIDENTIAL</text>

              {/* 5. Industrial Harbor & Docks (East: X: 540 to 750, Y: 200 to 500) */}
              <rect x="540" y="200" width="210" height="300" rx="12" fill="#334155" fillOpacity="0.5" stroke="#f59e0b" strokeWidth="1" />
              <text x="570" y="350" fill="#f59e0b" fontSize="14" fontWeight="bold">HARBOR & SHIPYARDS</text>
            </svg>

            {/* Safehouses Pins */}
            {SAFEHOUSE_LOCATIONS.map((sh) => {
              const pos = worldToMap(sh.position[0], sh.position[2]);
              return (
                <div
                  key={sh.id}
                  onClick={() => setSelectedSafehouse(sh)}
                  className="absolute cursor-pointer -translate-x-1/2 -translate-y-1/2 group"
                  style={{ left: pos.x, top: pos.y }}
                >
                  <div className="w-7 h-7 rounded-full bg-cyan-600 border-2 border-white flex items-center justify-center shadow-lg group-hover:scale-125 transition-transform">
                    <Home className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="absolute left-8 top-1 text-[10px] font-bold text-cyan-300 bg-slate-900/90 px-1.5 py-0.5 rounded border border-slate-700 whitespace-nowrap hidden group-hover:block">
                    {sh.name}
                  </span>
                </div>
              );
            })}

            {/* Missions Pins */}
            {missions.filter((m) => m.isUnlocked && !m.completed).map((m) => {
              const pos = worldToMap(m.targetPos[0], m.targetPos[2]);
              const isActive = activeMission?.id === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => onSelectMission(m.id)}
                  className="absolute cursor-pointer -translate-x-1/2 -translate-y-1/2 group"
                  style={{ left: pos.x, top: pos.y }}
                >
                  <div
                    className={`w-7 h-7 rounded-full ${
                      isActive ? 'bg-amber-500 animate-bounce' : 'bg-blue-600'
                    } border-2 border-white flex items-center justify-center shadow-lg group-hover:scale-125 transition-transform`}
                  >
                    <Crosshair className="w-4 h-4 text-white" />
                  </div>
                  <span className="absolute left-8 top-1 text-[10px] font-bold text-amber-300 bg-slate-900/90 px-1.5 py-0.5 rounded border border-slate-700 whitespace-nowrap hidden group-hover:block">
                    {m.title}
                  </span>
                </div>
              );
            })}

            {/* Active Crimes Pins */}
            {activeCrimes.map((c) => {
              const pos = worldToMap(c.pos[0], c.pos[2]);
              return (
                <div
                  key={c.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2 animate-pulse"
                  style={{ left: pos.x, top: pos.y }}
                >
                  <div className="w-6 h-6 rounded-full bg-red-600 border-2 border-white flex items-center justify-center shadow-lg">
                    <AlertCircle className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
              );
            })}

            {/* LIVE PLAYER ICON */}
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
              style={{ left: pMap.x, top: pMap.y }}
            >
              <div className="w-5 h-5 rounded-full bg-cyan-400 border-2 border-white shadow-[0_0_15px_#38bdf8] flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-blue-700" />
              </div>
              <span className="absolute left-6 -top-1 text-[10px] font-extrabold text-cyan-300 bg-slate-950 px-1 rounded border border-cyan-500 whitespace-nowrap">
                YOU
              </span>
            </div>
          </div>
        </div>

        {/* Selected Safehouse or Mission Quick Tray */}
        <div className="bg-slate-950 border-t border-slate-800 p-3 flex flex-col sm:flex-row justify-between items-center gap-3">
          {selectedSafehouse ? (
            <div className="flex items-center justify-between w-full">
              <div>
                <h4 className="text-sm font-bold text-white">{selectedSafehouse.name}</h4>
                <p className="text-xs text-slate-400">Biome: {selectedSafehouse.biome}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onFastTravel(selectedSafehouse.position);
                    onClose();
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white font-bold text-xs rounded-lg cursor-pointer"
                >
                  FAST TRAVEL
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full text-xs text-slate-400 font-mono text-center sm:text-left">
              Click a safehouse icon to Fast Travel, or select an objective beacon to track.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
