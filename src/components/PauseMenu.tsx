import React, { useState } from 'react';
import {
  X,
  Play,
  Map as MapIcon,
  Shield,
  Zap,
  Cpu,
  Settings as SettingsIcon,
  Save,
  LogOut,
  Check,
  Smartphone,
} from 'lucide-react';
import { SuitDefinition, UpgradeItem, Mission } from '../types/game.ts';
import { GameSaveData } from '../game/reputationAndSave.ts';

interface PauseMenuProps {
  saveData: GameSaveData;
  missions: Mission[];
  onResume: () => void;
  onOpenMap: () => void;
  onOpenApkModal: () => void;
  onEquipSuit: (suit: SuitDefinition) => void;
  onBuyUpgrade: (upgrade: UpgradeItem) => void;
  onSave: () => void;
  onQuitToTitle: () => void;
  onUpdateGraphics: (graphics: GameSaveData['graphics']) => void;
  onUpdateAudio: (audio: GameSaveData['audio']) => void;
}

type TabType = 'RESUME' | 'MISSIONS' | 'SUITS' | 'UPGRADES' | 'SETTINGS';

export const PauseMenu: React.FC<PauseMenuProps> = ({
  saveData,
  missions,
  onResume,
  onOpenMap,
  onOpenApkModal,
  onEquipSuit,
  onBuyUpgrade,
  onSave,
  onQuitToTitle,
  onUpdateGraphics,
  onUpdateAudio,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('MISSIONS');
  const [savedBanner, setSavedBanner] = useState(false);

  const handleSaveClick = () => {
    onSave();
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 2000);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 select-none font-sans">
      <div className="relative w-full max-w-4xl h-[92vh] bg-slate-900 border-2 border-slate-700/80 rounded-xl flex flex-col overflow-hidden shadow-2xl">
        {/* Header Tabs */}
        <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800 gap-2">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('MISSIONS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'MISSIONS'
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              MISSIONS
            </button>
            <button
              onClick={() => setActiveTab('SUITS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'SUITS'
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              SUITS
            </button>
            <button
              onClick={() => setActiveTab('UPGRADES')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'UPGRADES'
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              UPGRADES
            </button>
            <button
              onClick={() => setActiveTab('SETTINGS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'SETTINGS'
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              SETTINGS
            </button>
            <button
              onClick={onOpenApkModal}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 transition-all cursor-pointer flex items-center gap-1"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>APK DOWNLINK</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveClick}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-md"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savedBanner ? 'SAVED!' : 'SAVE GAME'}</span>
            </button>
            <button
              onClick={onResume}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-900">
          {/* TAB: MISSIONS */}
          {activeTab === 'MISSIONS' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white tracking-wide">
                  CAMPAIGN & BIOME MISSIONS
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {missions.filter((m) => m.completed).length} / {missions.length} COMPLETED
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {missions.map((m) => (
                  <div
                    key={m.id}
                    className={`p-4 rounded-lg border ${
                      m.completed
                        ? 'bg-slate-950/60 border-emerald-500/30'
                        : m.isUnlocked
                        ? 'bg-slate-950 border-cyan-500/50 shadow-md'
                        : 'bg-slate-950/40 border-slate-800 opacity-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                          {m.biome} · {m.category}
                        </span>
                        <h4 className="text-sm font-bold text-white mt-1.5">{m.title}</h4>
                        <p className="text-xs text-slate-300 mt-1">{m.description}</p>
                      </div>
                      {m.completed && (
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                          <Check className="w-4 h-4" /> DONE
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-800/80 text-xs font-mono">
                      <span className="text-amber-300">+{m.rewardXp} XP</span>
                      <span className="text-emerald-400">+${m.rewardCredits}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: SUITS */}
          {activeTab === 'SUITS' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white tracking-wide">
                  NANOTECH WARDROBE
                </h3>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  CREDITS: ${saveData.stats.credits}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {saveData.suits.map((suit: SuitDefinition) => {
                  const isEquipped = saveData.stats.currentSuitId === suit.id;
                  const canAfford = saveData.stats.credits >= suit.cost;

                  return (
                    <div
                      key={suit.id}
                      className={`p-4 rounded-lg border flex flex-col justify-between ${
                        isEquipped
                          ? 'bg-slate-950 border-cyan-400 shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <div>
                        {/* Color preview swatch */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-5 h-5 rounded-full border border-white"
                              style={{ backgroundColor: suit.primaryColor }}
                            />
                            <div
                              className="w-4 h-4 rounded-full border border-white"
                              style={{ backgroundColor: suit.glowColor }}
                            />
                          </div>
                          {isEquipped && (
                            <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-700">
                              EQUIPPED
                            </span>
                          )}
                        </div>

                        <h4 className="text-base font-bold text-white">{suit.name}</h4>
                        <p className="text-xs text-cyan-400 font-mono mt-0.5">{suit.tagline}</p>
                        <p className="text-xs text-slate-300 mt-2 leading-relaxed">{suit.description}</p>

                        <div className="mt-3 p-2 rounded bg-slate-900 border border-slate-800 text-[11px] text-amber-300">
                          ★ {suit.perk}
                        </div>

                        {/* Stat multipliers */}
                        <div className="grid grid-cols-2 gap-2 mt-3 text-xs font-mono">
                          <div className="text-slate-400">
                            Swing Speed: <strong className="text-cyan-400">{suit.stats.swingSpeed}x</strong>
                          </div>
                          <div className="text-slate-400">
                            Defense: <strong className="text-emerald-400">{suit.stats.defense}x</strong>
                          </div>
                          <div className="text-slate-400">
                            Attack: <strong className="text-red-400">{suit.stats.attack}x</strong>
                          </div>
                          <div className="text-slate-400">
                            Regen: <strong className="text-purple-400">{suit.stats.energyRegen}x</strong>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800">
                        {suit.unlocked ? (
                          <button
                            onClick={() => onEquipSuit(suit)}
                            disabled={isEquipped}
                            className={`w-full py-2 rounded-lg font-bold text-xs cursor-pointer ${
                              isEquipped
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                            }`}
                          >
                            {isEquipped ? 'CURRENT SUIT' : 'EQUIP SUIT'}
                          </button>
                        ) : (
                          <button
                            onClick={() => onEquipSuit(suit)}
                            disabled={!canAfford}
                            className={`w-full py-2 rounded-lg font-bold text-xs cursor-pointer ${
                              canAfford
                                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            UNLOCK (${suit.cost})
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: UPGRADES */}
          {activeTab === 'UPGRADES' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white tracking-wide">
                  COMBAT & TRAVERSAL UPGRADES
                </h3>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  CREDITS: ${saveData.stats.credits}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {saveData.upgrades.map((up: UpgradeItem) => {
                  const cost = up.costPerLevel * up.level;
                  const canAfford = saveData.stats.credits >= cost;
                  const isMax = up.level >= up.maxLevel;

                  return (
                    <div
                      key={up.id}
                      className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono font-bold text-amber-400">
                            {up.category}
                          </span>
                          <span className="text-xs font-mono text-slate-300">
                            TIER {up.level} / {up.maxLevel}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-white mt-1">{up.name}</h4>
                        <p className="text-xs text-slate-300 mt-1">{up.description}</p>

                        {/* Progress pips */}
                        <div className="flex gap-1.5 mt-3">
                          {Array.from({ length: up.maxLevel }).map((_, i) => (
                            <div
                              key={i}
                              className={`h-2 flex-1 rounded-sm ${
                                i < up.level ? 'bg-cyan-400' : 'bg-slate-800'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => onBuyUpgrade(up)}
                        disabled={isMax || !canAfford}
                        className={`w-full py-2 mt-4 rounded-lg font-bold text-xs cursor-pointer ${
                          isMax
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : canAfford
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 text-slate-950'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {isMax ? 'MAX LEVEL' : `UPGRADE TIER (${cost} CREDITS)`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: SETTINGS & GRAPHICS */}
          {activeTab === 'SETTINGS' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="text-lg font-bold text-white tracking-wide">
                  GRAPHICS & LOW-END PERFORMANCE
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Engine presets tailored for low-spec devices (e.g. 1 GB RAM / Samsung Galaxy A2 Core).
                </p>
              </div>

              {/* Quality Preset */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">GRAPHICS PRESET</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['VERY_LOW', 'LOW', 'MEDIUM', 'HIGH'] as const).map((preset) => (
                    <button
                      key={preset}
                      onClick={() =>
                        onUpdateGraphics({
                          ...saveData.graphics,
                          preset,
                          shadows: preset === 'HIGH',
                          resolutionScale:
                            preset === 'VERY_LOW'
                              ? 0.65
                              : preset === 'LOW'
                              ? 0.85
                              : preset === 'MEDIUM'
                              ? 1.0
                              : 1.0,
                        })
                      }
                      className={`py-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                        saveData.graphics.preset === preset
                          ? 'bg-cyan-500 text-slate-950 font-black'
                          : 'bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {preset.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target FPS Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">TARGET FPS</label>
                <div className="grid grid-cols-5 gap-2">
                  {([20, 24, 30, 40, 60] as const).map((fps) => (
                    <button
                      key={fps}
                      onClick={() => onUpdateGraphics({ ...saveData.graphics, targetFps: fps })}
                      className={`py-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                        saveData.graphics.targetFps === fps
                          ? 'bg-cyan-500 text-slate-950 font-black'
                          : 'bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {fps} FPS
                    </button>
                  ))}
                </div>
              </div>

              {/* Audio Controls */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <h4 className="text-sm font-bold text-white">AUDIO LEVELS</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Master Volume</span>
                    <span>{Math.round(saveData.audio.masterVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={saveData.audio.masterVolume}
                    onChange={(e) =>
                      onUpdateAudio({ ...saveData.audio, masterVolume: parseFloat(e.target.value) })
                    }
                    className="w-full accent-cyan-400"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-950 border-t border-slate-800 p-3 flex justify-between items-center">
          <button
            onClick={onQuitToTitle}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-300 hover:text-red-300 text-xs font-bold cursor-pointer transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>MAIN MENU</span>
          </button>

          <button
            onClick={onResume}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white text-sm font-bold shadow-lg shadow-cyan-500/25 cursor-pointer active:scale-95 transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>RESUME PLAY</span>
          </button>
        </div>
      </div>
    </div>
  );
};
