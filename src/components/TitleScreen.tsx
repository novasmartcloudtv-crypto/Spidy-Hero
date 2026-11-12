import React from 'react';
import { Shield, Play, RotateCcw, Settings as SettingsIcon, Award } from 'lucide-react';

interface TitleScreenProps {
  onStartGame: () => void;
  onOpenSettings: () => void;
  onOpenCredits: () => void;
  onOpenApkModal: () => void;
  hasSave: boolean;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenSettings,
  onOpenCredits,
  onOpenApkModal,
  hasSave,
}) => {
  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-between p-6 sm:p-10 select-none bg-radial from-slate-900/60 via-slate-950/85 to-black">
      {/* Top Banner / Specs Badge */}
      <div className="w-full flex justify-between items-center text-xs tracking-wider text-cyan-400 font-mono">
        <div className="flex items-center gap-2 bg-slate-900/90 border border-cyan-500/30 px-3 py-1.5 rounded-md">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>NEO-HAVEN OPEN WORLD · 1GB RAM OPTIMIZED</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenApkModal}
            className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 border border-emerald-400/50 text-white font-bold text-xs px-3 py-1.5 rounded-md shadow-md cursor-pointer transition-all active:scale-95"
          >
            <span>📱 INSTALL APK</span>
          </button>
        </div>
      </div>

      {/* Main Title Centerpiece Lockup */}
      <div className="flex flex-col items-center text-center my-auto max-w-xl">
        {/* Custom Inline SVG Superhero Emblem */}
        <div className="relative mb-4">
          <svg className="w-24 h-24 drop-shadow-[0_0_25px_rgba(56,189,248,0.6)]" viewBox="0 0 100 100" fill="none">
            <polygon points="50,5 90,25 90,75 50,95 10,75 10,25" stroke="#38bdf8" strokeWidth="3" fill="#0f172a" fillOpacity="0.8" />
            <polygon points="50,15 80,30 80,70 50,85 20,70 20,30" stroke="#0284c7" strokeWidth="2" fill="none" />
            {/* Kinetic filament web strands */}
            <line x1="50" y1="15" x2="50" y2="85" stroke="#38bdf8" strokeWidth="2" />
            <line x1="20" y1="30" x2="80" y2="70" stroke="#38bdf8" strokeWidth="2" />
            <line x1="20" y1="70" x2="80" y2="30" stroke="#38bdf8" strokeWidth="2" />
            <circle cx="50" cy="50" r="8" fill="#38bdf8" />
          </svg>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white uppercase drop-shadow-md">
          VANGUARD <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-200">WEAVER</span>
        </h1>
        <p className="text-sm sm:text-base text-cyan-200/80 font-medium tracking-wide mt-2">
          Neo-Haven Chronicles · 3D Open World Superhero Adventure
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8 w-full max-w-md">
          <button
            onClick={onStartGame}
            className="flex-1 py-3.5 px-6 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-base sm:text-lg shadow-lg shadow-cyan-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>{hasSave ? 'CONTINUE PATROL' : 'ENTER NEO-HAVEN'}</span>
          </button>
          <button
            onClick={onOpenApkModal}
            className="py-3.5 px-5 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 border border-emerald-400 text-white font-bold text-sm active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/20"
          >
            <span>📱 GET APK</span>
          </button>
        </div>

        {/* Secondary Options */}
        <div className="flex gap-4 mt-4 text-xs font-semibold text-slate-400">
          <button onClick={onOpenSettings} className="hover:text-cyan-400 flex items-center gap-1.5 transition-colors cursor-pointer py-1 px-2">
            <SettingsIcon className="w-3.5 h-3.5" />
            <span>SETTINGS & GRAPHICS</span>
          </button>
          <span>·</span>
          <button onClick={onOpenCredits} className="hover:text-cyan-400 flex items-center gap-1.5 transition-colors cursor-pointer py-1 px-2">
            <Award className="w-3.5 h-3.5" />
            <span>CREDITS & LORE</span>
          </button>
        </div>
      </div>

      {/* Flat Control Hints Bar */}
      <div className="w-full bg-slate-900/80 border border-slate-800 rounded-lg p-3 text-center text-xs text-slate-300 font-mono tracking-wide shadow-md">
        <span className="hidden sm:inline">
          <strong className="text-cyan-400">WASD</strong> Move · <strong className="text-cyan-400">Space</strong> Jump/Dive · <strong className="text-cyan-400">Shift / E</strong> Web Swing · <strong className="text-cyan-400">LMB</strong> Melee · <strong className="text-cyan-400">RMB</strong> Web Shot · <strong className="text-cyan-400">Q</strong> Web Boom · <strong className="text-cyan-400">F</strong> Vehicle · <strong className="text-cyan-400">M</strong> Map · <strong className="text-cyan-400">Esc</strong> Pause
        </span>
        <span className="sm:hidden text-cyan-300">
          Touch Controls: Virtual Joystick (Left) · Action Cluster (Right)
        </span>
      </div>
    </div>
  );
};
