import { Mission, ActiveCrimeEvent } from '../types/game.ts';

export const STORY_MISSIONS: Mission[] = [
  {
    id: 'm1_prologue',
    title: 'Act I: Baptism by Cable',
    subtitle: 'Rooftop Traversal Calibration',
    category: 'STORY',
    biome: 'DOWNTOWN',
    description: 'Calibrate your kinetic web filaments by swinging across the highrises to reach Officer Maya Lin atop the Midtown precinct.',
    objectiveText: 'Swing to the Midtown Precinct beacon (30, 25, 150)',
    targetPos: [30, 25, 150],
    targetRadius: 12,
    rewardCredits: 250,
    rewardXp: 400,
    completed: false,
    isUnlocked: true,
    dialogue: [
      { speaker: 'The Weaver', text: 'Nanofilament tension stable. Time to test the kinetic swing lines across Downtown.', role: 'HERO' },
      { speaker: 'Maya Lin', text: 'Weaver, Syndicate frequencies are spiking on the police scanner. Glad you are back on the grid.', role: 'POLICE' },
    ],
  },
  {
    id: 'm2_bank_breach',
    title: 'Act I: First Neo Bank Breach',
    subtitle: 'Syndicate Enforcers Alert',
    category: 'STORY',
    biome: 'DOWNTOWN',
    description: 'Malik Vance’s shock-troopers have breached the central vault. Defeat the assault squad and secure the vault door.',
    objectiveText: 'Neutralize the 4 syndicate goons at the First Neo Bank (30, 0, -20)',
    targetPos: [30, 0, -20],
    targetRadius: 18,
    rewardCredits: 500,
    rewardXp: 850,
    completed: false,
    isUnlocked: false,
    dialogue: [
      { speaker: 'Syndicate Thug', text: 'Grab the energy cores! Overcharge wants them wired before the cops arrive!', role: 'VILLAIN' },
      { speaker: 'The Weaver', text: 'You picked the wrong vault on the wrong day. Let’s see how you handle high-tensile filament.', role: 'HERO' },
    ],
  },
  {
    id: 'm3_harbor_sabotage',
    title: 'Act II: Harbor Gantry Sabotage',
    subtitle: 'Industrial Infiltration',
    category: 'STORY',
    biome: 'INDUSTRIAL',
    description: 'Infiltrate the shipping container yards, scale the towering crane, and disarm the weapon shipment.',
    objectiveText: 'Ascend the Harbor Gantry Crane and stop the weapons shipment (240, 48, -60)',
    targetPos: [240, 48, -60],
    targetRadius: 14,
    rewardCredits: 750,
    rewardXp: 1200,
    completed: false,
    isUnlocked: false,
    dialogue: [
      { speaker: 'Maya Lin', text: 'They are smuggling military-grade chassis through Pier 9. We need someone who can climb where our squad cannot.', role: 'POLICE' },
      { speaker: 'The Weaver', text: 'Heading up the crane now. I’ll make sure those crates never reach city streets.', role: 'HERO' },
    ],
  },
  {
    id: 'm4_ocean_dive',
    title: 'Act II: Sunken Core Recovery',
    subtitle: 'Deep Sea Dive & Retrieval',
    category: 'SIDE',
    biome: 'BEACH',
    description: 'A cargo drone went down off South Beach. Dive into the ocean trench, recover the submerged energy core, and swim back to shore.',
    objectiveText: 'Dive to the sunken shipwreck off South Beach (10, -6, -340)',
    targetPos: [10, -6, -340],
    targetRadius: 16,
    rewardCredits: 600,
    rewardXp: 950,
    completed: false,
    isUnlocked: true,
    dialogue: [
      { speaker: 'The Weaver', text: 'Suit rebreather engaged. Let’s see what is hiding beneath the reef.', role: 'HERO' },
    ],
  },
  {
    id: 'm5_jungle_ruins',
    title: 'Act III: Canopy Trail & Ancient Shrine',
    subtitle: 'Wilderness Web Traversal',
    category: 'CHALLENGE',
    biome: 'JUNGLE',
    description: 'Swing through the towering jungle canopy using high branch anchors to reach the top of the ancient stone pyramid.',
    objectiveText: 'Web swing through the jungle to reach the Ancient Shrine apex (-260, 20, -10)',
    targetPos: [-260, 20, -10],
    targetRadius: 15,
    rewardCredits: 700,
    rewardXp: 1100,
    completed: false,
    isUnlocked: true,
    dialogue: [
      { speaker: 'The Weaver', text: 'Tree branches give plenty of tension for wide arcs. Feels like a whole different playground.', role: 'HERO' },
    ],
  },
  {
    id: 'm6_canyon_intercept',
    title: 'Act III: Redrock Canyon Convoy',
    subtitle: 'High Speed Intercept',
    category: 'STORY',
    biome: 'DESERT',
    description: 'Baron Ironclad’s heavy transport is cutting across the desert canyon. Commandeer a vehicle or web-slingshot to stop the convoy.',
    objectiveText: 'Intercept Ironclad’s convoy at the Redrock Canyon pass (-280, 8, 220)',
    targetPos: [-280, 8, 220],
    targetRadius: 20,
    rewardCredits: 900,
    rewardXp: 1500,
    completed: false,
    isUnlocked: false,
    dialogue: [
      { speaker: 'Baron Ironclad', text: 'You think some nylon strings can crack titanium armor, bug? You will be crushed under my treads!', role: 'VILLAIN' },
      { speaker: 'The Weaver', text: 'These aren’t strings, Baron. They are kinetic conduits.', role: 'HERO' },
    ],
  },
  {
    id: 'm7_boss_overcharge',
    title: 'Act IV: Overcharge Reckoning',
    subtitle: 'Boss Encounter: Malik Vance',
    category: 'BOSS',
    biome: 'DOWNTOWN',
    description: 'Malik Vance has hooked himself into the Midtown Power Grid. Face him in an epic multi-phase rooftop showdown.',
    objectiveText: 'Defeat Malik Overcharge Vance atop Apex Spire (-30, 110, 40)',
    targetPos: [-30, 110, 40],
    targetRadius: 22,
    rewardCredits: 2000,
    rewardXp: 3500,
    completed: false,
    isUnlocked: false,
    dialogue: [
      { speaker: 'Malik Vance', text: 'Feel that current, Weaver? The whole city’s wattage flows through my veins now!', role: 'VILLAIN' },
      { speaker: 'The Weaver', text: 'Then I’m pulling the circuit breaker.', role: 'HERO' },
    ],
  },
];

export class MissionManager {
  missions: Mission[] = [...STORY_MISSIONS];
  activeMission: Mission | null = this.missions[0];
  activeCrimes: ActiveCrimeEvent[] = [];

  constructor() {
    this.spawnRandomCrime();
  }

  spawnRandomCrime() {
    const crimeTypes: ActiveCrimeEvent['type'][] = ['MUGGING', 'CAR_THEFT', 'ROOFTOP_SNIPERS', 'HOSTAGE'];
    const selectedType = crimeTypes[Math.floor(Math.random() * crimeTypes.length)];

    const crimePositions: [number, number, number][] = [
      [20, 0, 45],
      [-50, 0, 20],
      [160, 0, 10],
      [50, 0, 120],
      [-20, 0, -80],
    ];
    const pos = crimePositions[Math.floor(Math.random() * crimePositions.length)];

    this.activeCrimes = [
      {
        id: `crime_${Date.now()}`,
        name: `Street ${selectedType.replace('_', ' ')}`,
        type: selectedType,
        pos,
        enemiesRemaining: 3,
        active: true,
        timeRemaining: 180,
      },
    ];
  }

  checkMissionProgress(playerPos: [number, number, number]): { completed: boolean; mission: Mission | null } {
    if (!this.activeMission) return { completed: false, mission: null };

    const dx = playerPos[0] - this.activeMission.targetPos[0];
    const dy = playerPos[1] - this.activeMission.targetPos[1];
    const dz = playerPos[2] - this.activeMission.targetPos[2];
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (dist <= this.activeMission.targetRadius) {
      this.activeMission.completed = true;
      const finished = this.activeMission;

      // Unlock next story mission
      const currentIndex = this.missions.findIndex((m) => m.id === finished.id);
      if (currentIndex !== -1 && currentIndex + 1 < this.missions.length) {
        this.missions[currentIndex + 1].isUnlocked = true;
        this.activeMission = this.missions[currentIndex + 1];
      } else {
        this.activeMission = null;
      }

      return { completed: true, mission: finished };
    }

    return { completed: false, mission: null };
  }

  setActiveMissionById(id: string) {
    const found = this.missions.find((m) => m.id === id);
    if (found && found.isUnlocked) {
      this.activeMission = found;
    }
  }
}
