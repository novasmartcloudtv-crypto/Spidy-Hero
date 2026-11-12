import { SuitDefinition, UpgradeItem, PlayerStats, GraphicsSettings, AudioSettings, ControlSettings } from '../types/game.ts';

export const INITIAL_SUITS: SuitDefinition[] = [
  {
    id: 'vanguard_classic',
    name: 'Vanguard Classic',
    tagline: 'Standard Issue Kinetic Nanoweave',
    description: 'Constructed from high-tensile carbon polymers with integrated electro-filament gauntlets. Perfectly balanced for urban swinging and responsive martial arts.',
    primaryColor: '#0284c7',
    secondaryColor: '#0f172a',
    glowColor: '#38bdf8',
    cost: 0,
    unlocked: true,
    perk: 'Balanced Kinetic Capacitors (+10% all base stats)',
    stats: { swingSpeed: 1.0, defense: 1.0, attack: 1.0, energyRegen: 1.0 },
  },
  {
    id: 'crimson_phantom',
    name: 'Crimson Phantom',
    tagline: 'High-Impact Strike Exoskeleton',
    description: 'Reinforced with tungsten micro-plates and crimson reactive armor that absorbs enemy punches to charge heavier counter-strikes.',
    primaryColor: '#dc2626',
    secondaryColor: '#18181b',
    glowColor: '#f87171',
    cost: 1200,
    unlocked: false,
    perk: 'Overloaded Knuckles (+30% Melee Punch Damage)',
    stats: { swingSpeed: 0.95, defense: 1.25, attack: 1.35, energyRegen: 0.9 },
  },
  {
    id: 'chrono_aegis',
    name: 'Chrono Aegis',
    tagline: 'Futuristic Energy Conduit Suit',
    description: 'Equipped with rapid micro-turbines that continuously recycle kinetic swinging momentum into instant web-filament replenishment.',
    primaryColor: '#059669',
    secondaryColor: '#1e293b',
    glowColor: '#34d399',
    cost: 2000,
    unlocked: false,
    perk: 'Dynamic Recoil Coil (+50% Web Energy Regeneration)',
    stats: { swingSpeed: 1.2, defense: 1.0, attack: 1.0, energyRegen: 1.5 },
  },
  {
    id: 'stealth_umbra',
    name: 'Stealth Umbra',
    tagline: 'Light-Bending Infiltration Mesh',
    description: 'Matte black anti-radar weave dampening footsteps and scattering thermal vision cones for silent rooftop takedowns.',
    primaryColor: '#581c87',
    secondaryColor: '#090d16',
    glowColor: '#c084fc',
    cost: 2500,
    unlocked: false,
    perk: 'Shadow Dampeners (Enemy detection range halved)',
    stats: { swingSpeed: 1.1, defense: 0.9, attack: 1.2, energyRegen: 1.2 },
  },
  {
    id: 'desert_nomad',
    name: 'Desert Nomad',
    tagline: 'All-Terrain Environmental Armor',
    description: 'Thermal-insulating ballistic weave engineered to withstand sandstorms, rocky canyon terrain, and long wilderness sprints.',
    primaryColor: '#d97706',
    secondaryColor: '#451a03',
    glowColor: '#fbbf24',
    cost: 3200,
    unlocked: false,
    perk: 'Ballistic Suspension (+40% Sprint Stamina efficiency)',
    stats: { swingSpeed: 1.15, defense: 1.3, attack: 1.1, energyRegen: 1.1 },
  },
  {
    id: 'golden_apex',
    name: 'Golden Apex',
    tagline: 'Master Nanotech Exoskeleton',
    description: 'The pinnacle of Neo-Haven engineering. Hyper-conductive gold filament mesh offering unparalleled traversal velocity and explosive shockwave bursts.',
    primaryColor: '#eab308',
    secondaryColor: '#000000',
    glowColor: '#fef08a',
    cost: 5000,
    unlocked: false,
    perk: 'Apex Overdrive (+40% Swing Speed, +50% Web Boom radius)',
    stats: { swingSpeed: 1.4, defense: 1.35, attack: 1.4, energyRegen: 1.4 },
  },
];

export const INITIAL_UPGRADES: UpgradeItem[] = [
  {
    id: 'kinetic_punch',
    name: 'Kinetic Strike Overclock',
    category: 'COMBAT',
    description: 'Amplifies melee impact force and increases finisher damage.',
    level: 1,
    maxLevel: 5,
    costPerLevel: 300,
    unlocked: true,
  },
  {
    id: 'tensile_cable',
    name: 'Tensile Cable Elasticity',
    category: 'TRAVERSAL',
    description: 'Increases web swing maximum velocity and apex slingshot jump height.',
    level: 1,
    maxLevel: 5,
    costPerLevel: 350,
    unlocked: true,
  },
  {
    id: 'filament_capacitor',
    name: 'Filament Storage Cells',
    category: 'GADGETS',
    description: 'Expands maximum web energy and accelerates automatic filament recharging.',
    level: 1,
    maxLevel: 5,
    costPerLevel: 250,
    unlocked: true,
  },
  {
    id: 'nanoweave_plating',
    name: 'Sub-Dermal Nanoweave Plating',
    category: 'DEFENSE',
    description: 'Boosts total hero health capacity and reduces damage received from heavy attacks.',
    level: 1,
    maxLevel: 5,
    costPerLevel: 400,
    unlocked: true,
  },
];

const SAVE_KEY = 'vanguard_weaver_save_v1';

export interface GameSaveData {
  stats: PlayerStats;
  suits: SuitDefinition[];
  upgrades: UpgradeItem[];
  completedMissionIds: string[];
  graphics: GraphicsSettings;
  audio: AudioSettings;
  controls: ControlSettings;
}

export function loadGameData(): GameSaveData {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}

  // Defaults optimized specifically for low-end devices (Samsung Galaxy A2 Core target: 1GB RAM)
  return {
    stats: {
      health: 100,
      maxHealth: 100,
      energy: 100,
      maxEnergy: 100,
      stamina: 100,
      maxStamina: 100,
      xp: 0,
      level: 1,
      credits: 350,
      combo: 0,
      comboTimer: 0,
      maxCombo: 0,
      heroReputation: 60,
      villainReputation: 10,
      currentSuitId: 'vanguard_classic',
      oxygen: 100,
    },
    suits: INITIAL_SUITS,
    upgrades: INITIAL_UPGRADES,
    completedMissionIds: [],
    graphics: {
      preset: 'LOW',
      targetFps: 30, // 30 FPS target for low-end hardware
      resolutionScale: 0.85,
      shadows: false, // Disabled for extreme smoothness on low-end GPU
      npcDensity: 0.4,
      trafficDensity: 0.4,
      wildlifeDensity: 0.5,
      renderDistance: 250,
      weatherEffects: true,
    },
    audio: {
      masterVolume: 0.8,
      sfxVolume: 0.9,
      musicVolume: 0.4,
      dialogueVolume: 0.9,
      muted: false,
    },
    controls: {
      touchSensitivity: 1.0,
      touchButtonScale: 1.0,
      invertY: false,
      hapticFeedback: true,
    },
  };
}

export function saveGameData(data: GameSaveData) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {}
}
