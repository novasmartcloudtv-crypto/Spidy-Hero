export type GameMode = 'TITLE' | 'PLAYING' | 'PAUSED' | 'MAP' | 'SUITS' | 'UPGRADES' | 'MISSION_SELECT' | 'GAME_OVER' | 'VICTORY';

export type BiomeType = 'DOWNTOWN' | 'MIDTOWN' | 'INDUSTRIAL' | 'BEACH' | 'JUNGLE' | 'DESERT' | 'CAVES';

export interface PlayerStats {
  health: number;
  maxHealth: number;
  energy: number; // Web filament energy
  maxEnergy: number;
  stamina: number;
  maxStamina: number;
  xp: number;
  level: number;
  credits: number;
  combo: number;
  comboTimer: number;
  maxCombo: number;
  heroReputation: number; // 0 - 100
  villainReputation: number; // 0 - 100
  currentSuitId: string;
  oxygen: number; // For swimming underwater (0-100)
}

export interface SuitDefinition {
  id: string;
  name: string;
  tagline: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  glowColor: string;
  cost: number;
  unlocked: boolean;
  perk: string;
  stats: {
    swingSpeed: number; // multiplier e.g. 1.0 - 1.5
    defense: number;
    attack: number;
    energyRegen: number;
  };
}

export interface UpgradeItem {
  id: string;
  name: string;
  category: 'COMBAT' | 'TRAVERSAL' | 'GADGETS' | 'DEFENSE';
  description: string;
  level: number;
  maxLevel: number;
  costPerLevel: number;
  unlocked: boolean;
}

export interface Mission {
  id: string;
  title: string;
  subtitle: string;
  category: 'STORY' | 'SIDE' | 'CRIME' | 'CHALLENGE' | 'BOSS';
  biome: BiomeType;
  description: string;
  objectiveText: string;
  targetPos: [number, number, number];
  targetRadius: number;
  rewardCredits: number;
  rewardXp: number;
  completed: boolean;
  isUnlocked: boolean;
  dialogue?: Array<{ speaker: string; text: string; role: 'HERO' | 'ALLY' | 'VILLAIN' | 'POLICE' }>;
}

export interface VehicleState {
  type: 'CAR' | 'BIKE' | 'BOAT' | 'HELICOPTER';
  name: string;
  active: boolean;
  speed: number;
  health: number;
  maxHealth: number;
}

export interface GraphicsSettings {
  preset: 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH';
  targetFps: 20 | 24 | 30 | 40 | 60;
  resolutionScale: number; // 0.5 to 1.0
  shadows: boolean;
  npcDensity: number; // 0.2 to 1.0
  trafficDensity: number; // 0.2 to 1.0
  wildlifeDensity: number; // 0.2 to 1.0
  renderDistance: number; // 150 to 450
  weatherEffects: boolean;
}

export interface AudioSettings {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  dialogueVolume: number;
  muted: boolean;
}

export interface ControlSettings {
  touchSensitivity: number;
  touchButtonScale: number;
  invertY: boolean;
  hapticFeedback: boolean;
}

export interface ActiveCrimeEvent {
  id: string;
  name: string;
  type: 'MUGGING' | 'CAR_THEFT' | 'ROOFTOP_SNIPERS' | 'HOSTAGE';
  pos: [number, number, number];
  enemiesRemaining: number;
  active: boolean;
  timeRemaining: number;
}

export interface TrickNotification {
  id: string;
  name: string;
  xp: number;
  timestamp: number;
}
