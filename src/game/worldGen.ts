import * as THREE from 'three';
import { textures } from './proceduralTextures.ts';
import { createFoliageModel, createVehicleModel } from './proceduralModels.ts';
import { BiomeType } from '../types/game.ts';

export interface WorldCollisionBox {
  min: THREE.Vector3;
  max: THREE.Vector3;
  isBuilding: boolean;
  canWebAnchor: boolean;
}

export interface WebAnchorPoint {
  position: THREE.Vector3;
  type: 'BUILDING_CORNER' | 'CRANE' | 'TREE' | 'CLIFF';
  distSq?: number;
}

export interface SafehouseData {
  id: string;
  name: string;
  biome: BiomeType;
  position: [number, number, number];
  unlocked: boolean;
}

export const SAFEHOUSE_LOCATIONS: SafehouseData[] = [
  { id: 'penthouse', name: 'Downtown High-Rise Penthouse', biome: 'DOWNTOWN', position: [25, 76, 35], unlocked: true },
  { id: 'beach_villa', name: 'South Beach Lookout Bungalow', biome: 'BEACH', position: [40, 6, -180], unlocked: true },
  { id: 'jungle_bunker', name: 'Jungle Canopy Treehouse', biome: 'JUNGLE', position: [-220, 24, -40], unlocked: false },
  { id: 'desert_depot', name: 'Redrock Desert Outpost', biome: 'DESERT', position: [-260, 14, 180], unlocked: false },
];

export class WorldManager {
  scene: THREE.Scene;
  worldGroup: THREE.Group;
  collisionBoxes: WorldCollisionBox[] = [];
  webAnchors: WebAnchorPoint[] = [];

  // Sector groups for streaming / LOD
  sectors: Map<string, THREE.Group> = new Map();
  activeSectorKey: string = '0,0';

  // Water plane
  waterMesh: THREE.Mesh | null = null;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.worldGroup = new THREE.Group();
    this.worldGroup.name = 'world_root';
    this.scene.add(this.worldGroup);
  }

  buildWorld() {
    this.buildTerrainAndRoads();
    this.buildDowntownSector();
    this.buildMidtownSector();
    this.buildIndustrialHarborSector();
    this.buildSouthBeachSector();
    this.buildJungleSector();
    this.buildDesertCanyonsSector();
    this.buildSubterraneanCaveSector();
    this.buildWater();
    this.buildAmbientPropsAndVehicles();
  }

  private buildTerrainAndRoads() {
    const terrainGroup = new THREE.Group();
    terrainGroup.name = 'sector_terrain';

    // Massive base ground plane (-600 to 600)
    const groundGeo = new THREE.PlaneGeometry(1200, 1200, 32, 32);
    groundGeo.rotateX(-Math.PI / 2);

    // Vertex colors to paint biomes seamlessly without large multi-textures (RAM friendly!)
    const count = groundGeo.attributes.position.count;
    const colors = new Float32Array(count * 3);
    const pos = groundGeo.attributes.position;

    const cCity = new THREE.Color(0x1a212b);
    const cBeach = new THREE.Color(0xd97706);
    const cJungle = new THREE.Color(0x14532d);
    const cDesert = new THREE.Color(0xb45309);
    const cWater = new THREE.Color(0x0369a1);

    for (let i = 0; i < count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      let col = cCity;
      if (z < -120) {
        // South: Beach & Ocean
        col = z < -240 ? cWater : cBeach;
      } else if (x < -140 && z < 80) {
        // West South: Jungle
        col = cJungle;
      } else if (x < -140 && z >= 80) {
        // West North: Desert
        col = cDesert;
      }

      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    groundGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const groundMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.9,
      metalness: 0.1,
    });

    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.receiveShadow = true;
    terrainGroup.add(ground);

    // City Main Avenues
    const roadMat = new THREE.MeshStandardMaterial({
      map: textures.getRoadTexture(),
      roughness: 0.8,
      metalness: 0.1,
    });

    // North-South Avenues
    [-60, 0, 60, 120].forEach((x) => {
      const road = new THREE.Mesh(new THREE.PlaneGeometry(16, 420), roadMat);
      road.rotateX(-Math.PI / 2);
      road.position.set(x, 0.04, 30);
      terrainGroup.add(road);
    });

    // East-West Boulevards
    [-40, 20, 80, 140].forEach((z) => {
      const road = new THREE.Mesh(new THREE.PlaneGeometry(360, 16), roadMat);
      road.rotateX(-Math.PI / 2);
      road.rotation.z = Math.PI / 2;
      road.position.set(30, 0.05, z);
      terrainGroup.add(road);
    });

    this.worldGroup.add(terrainGroup);
  }

  private buildDowntownSector() {
    const downtown = new THREE.Group();
    downtown.name = 'sector_downtown';
    const facadeTex = textures.getBuildingFacadeTexture();

    const towerMat = new THREE.MeshStandardMaterial({
      map: facadeTex,
      roughness: 0.3,
      metalness: 0.5,
    });

    const glassTowerMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a,
      roughness: 0.1,
      metalness: 0.8,
    });

    // Highrise Buildings grid in Sector (0, 0)
    const buildingsConfig = [
      { x: 30, z: 40, w: 26, d: 26, h: 85, isGlass: false }, // Penthouse Safehouse
      { x: -30, z: 40, w: 24, d: 24, h: 110, isGlass: true }, // Apex Spire Tower
      { x: 30, z: -20, w: 28, d: 28, h: 70, isGlass: false }, // First Neo Bank
      { x: -30, z: -20, w: 22, d: 22, h: 95, isGlass: true }, // Corporate HQ
      { x: 80, z: 40, w: 22, d: 22, h: 65, isGlass: false },
      { x: 80, z: -20, w: 24, d: 24, h: 75, isGlass: true },
      { x: -80, z: 40, w: 24, d: 24, h: 60, isGlass: false },
      { x: -80, z: -20, w: 20, d: 20, h: 80, isGlass: true },
      { x: 0, z: 100, w: 32, d: 32, h: 130, isGlass: true }, // Neo-Haven Central Skyscraper
    ];

    buildingsConfig.forEach((b) => {
      const geo = new THREE.BoxGeometry(b.w, b.h, b.d);
      const mesh = new THREE.Mesh(geo, b.isGlass ? glassTowerMat : towerMat);
      mesh.position.set(b.x, b.h / 2, b.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      downtown.add(mesh);

      // Rooftop ledge / helipad on Central Skyscraper
      if (b.h >= 100) {
        const roofTrim = new THREE.Mesh(
          new THREE.BoxGeometry(b.w + 1.5, 2, b.d + 1.5),
          new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8 })
        );
        roofTrim.position.set(b.x, b.h, b.z);
        downtown.add(roofTrim);

        // Antenna tower
        const antenna = new THREE.Mesh(
          new THREE.CylinderGeometry(0.3, 0.8, 18, 6),
          new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9 })
        );
        antenna.position.set(b.x, b.h + 9, b.z);
        downtown.add(antenna);

        this.webAnchors.push({
          position: new THREE.Vector3(b.x, b.h + 18, b.z),
          type: 'CRANE',
        });
      }

      // Add collision box
      this.collisionBoxes.push({
        min: new THREE.Vector3(b.x - b.w / 2, 0, b.z - b.d / 2),
        max: new THREE.Vector3(b.x + b.w / 2, b.h, b.z + b.d / 2),
        isBuilding: true,
        canWebAnchor: true,
      });

      // Add 4 top-corner web anchor points for swinging
      const hw = b.w / 2;
      const hd = b.d / 2;
      this.webAnchors.push(
        { position: new THREE.Vector3(b.x + hw, b.h, b.z + hd), type: 'BUILDING_CORNER' },
        { position: new THREE.Vector3(b.x - hw, b.h, b.z + hd), type: 'BUILDING_CORNER' },
        { position: new THREE.Vector3(b.x + hw, b.h, b.z - hd), type: 'BUILDING_CORNER' },
        { position: new THREE.Vector3(b.x - hw, b.h, b.z - hd), type: 'BUILDING_CORNER' }
      );
    });

    // Skybridge connecting Two Highrises
    const bridgeGeo = new THREE.BoxGeometry(36, 4, 6);
    const bridge = new THREE.Mesh(
      bridgeGeo,
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7 })
    );
    bridge.position.set(0, 52, 40);
    downtown.add(bridge);

    this.collisionBoxes.push({
      min: new THREE.Vector3(-18, 50, 37),
      max: new THREE.Vector3(18, 54, 43),
      isBuilding: true,
      canWebAnchor: true,
    });

    this.worldGroup.add(downtown);
  }

  private buildMidtownSector() {
    const midtown = new THREE.Group();
    midtown.name = 'sector_midtown';

    const brickMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
    const policeMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.5 });

    // Mid-rise apartments, cafes, shops (Z: 140 to 220)
    for (let i = 0; i < 8; i++) {
      const x = -80 + (i % 4) * 55;
      const z = 150 + Math.floor(i / 4) * 50;
      const h = 25 + (i % 3) * 12;
      const w = 22;
      const d = 22;

      const isPolice = i === 2;
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), isPolice ? policeMat : brickMat);
      mesh.position.set(x, h / 2, z);
      midtown.add(mesh);

      // Doors and shops on ground level
      const door = new THREE.Mesh(
        new THREE.BoxGeometry(4, 5, 0.4),
        new THREE.MeshBasicMaterial({ color: isPolice ? 0x38bdf8 : 0xfacc15 })
      );
      door.position.set(x, 2.5, z + d / 2 + 0.1);
      midtown.add(door);

      this.collisionBoxes.push({
        min: new THREE.Vector3(x - w / 2, 0, z - d / 2),
        max: new THREE.Vector3(x + w / 2, h, z + d / 2),
        isBuilding: true,
        canWebAnchor: true,
      });

      this.webAnchors.push({
        position: new THREE.Vector3(x, h, z),
        type: 'BUILDING_CORNER',
      });
    }

    this.worldGroup.add(midtown);
  }

  private buildIndustrialHarborSector() {
    const harbor = new THREE.Group();
    harbor.name = 'sector_harbor';

    const metalMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7, roughness: 0.4 });
    const crateColors = [0xd97706, 0xef4444, 0x0284c7, 0x10b981];

    // Industrial Warehouses (X: 160 to 280, Z: -60 to 60)
    [
      { x: 180, z: -20, w: 45, d: 30, h: 18 },
      { x: 180, z: 40, w: 50, d: 35, h: 22 },
      { x: 240, z: 0, w: 40, d: 55, h: 20 },
    ].forEach((wh) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(wh.w, wh.h, wh.d), metalMat);
      mesh.position.set(wh.x, wh.h / 2, wh.z);
      harbor.add(mesh);

      this.collisionBoxes.push({
        min: new THREE.Vector3(wh.x - wh.w / 2, 0, wh.z - wh.d / 2),
        max: new THREE.Vector3(wh.x + wh.w / 2, wh.h, wh.z + wh.d / 2),
        isBuilding: true,
        canWebAnchor: true,
      });

      this.webAnchors.push({
        position: new THREE.Vector3(wh.x, wh.h, wh.z),
        type: 'BUILDING_CORNER',
      });
    });

    // Stacks of Shipping Cargo Containers
    for (let c = 0; c < 12; c++) {
      const cx = 160 + (c % 4) * 16;
      const cz = -70 - Math.floor(c / 4) * 8;
      const stack = 1 + (c % 3);
      for (let s = 0; s < stack; s++) {
        const crate = new THREE.Mesh(
          new THREE.BoxGeometry(12, 4.5, 5),
          new THREE.MeshStandardMaterial({
            color: crateColors[(c + s) % crateColors.length],
            roughness: 0.7,
            metalness: 0.5,
          })
        );
        crate.position.set(cx, s * 4.5 + 2.25, cz);
        harbor.add(crate);

        this.collisionBoxes.push({
          min: new THREE.Vector3(cx - 6, s * 4.5, cz - 2.5),
          max: new THREE.Vector3(cx + 6, s * 4.5 + 4.5, cz + 2.5),
          isBuilding: true,
          canWebAnchor: true,
        });
      }
    }

    // Huge Harbor Gantry Crane (Great for high-altitude swinging!)
    const craneTower = new THREE.Mesh(
      new THREE.BoxGeometry(6, 48, 6),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8 })
    );
    craneTower.position.set(240, 24, -60);
    harbor.add(craneTower);

    const craneArm = new THREE.Mesh(
      new THREE.BoxGeometry(45, 4, 4),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8 })
    );
    craneArm.position.set(230, 48, -60);
    harbor.add(craneArm);

    this.webAnchors.push({
      position: new THREE.Vector3(210, 48, -60),
      type: 'CRANE',
    });

    this.worldGroup.add(harbor);
  }

  private buildSouthBeachSector() {
    const beach = new THREE.Group();
    beach.name = 'sector_beach';

    // Palm Trees along beachfront (Z: -120 to -180)
    for (let p = 0; p < 14; p++) {
      const px = -120 + p * 20;
      const pz = -140 + Math.sin(p) * 20;
      const palm = createFoliageModel('PALM');
      palm.position.set(px, 0, pz);
      beach.add(palm);

      this.webAnchors.push({
        position: new THREE.Vector3(px, 4.5, pz),
        type: 'TREE',
      });
    }

    // Wooden Beach Pier extending into Ocean
    const pierMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
    const pier = new THREE.Mesh(new THREE.BoxGeometry(10, 1.2, 90), pierMat);
    pier.position.set(0, 1.2, -200);
    beach.add(pier);

    this.collisionBoxes.push({
      min: new THREE.Vector3(-5, 0, -245),
      max: new THREE.Vector3(5, 2, -155),
      isBuilding: false,
      canWebAnchor: false,
    });

    // Tropical Archipelago Islands in ocean (Z: -280 to -420)
    const islandMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.9 });
    const island1 = new THREE.Mesh(new THREE.CylinderGeometry(25, 40, 6, 12), islandMat);
    island1.position.set(-80, 1.5, -320);
    beach.add(island1);

    const island2 = new THREE.Mesh(new THREE.CylinderGeometry(35, 50, 8, 12), islandMat);
    island2.position.set(90, 2.0, -360);
    beach.add(island2);

    // Sunken Shipwreck in the deep ocean
    const wreck = new THREE.Mesh(
      new THREE.BoxGeometry(8, 12, 32),
      new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.9 })
    );
    wreck.rotation.z = 0.4;
    wreck.position.set(10, -6, -340);
    beach.add(wreck);

    this.worldGroup.add(beach);
  }

  private buildJungleSector() {
    const jungle = new THREE.Group();
    jungle.name = 'sector_jungle';

    // Dense Jungle Trees with high branches for canopy web-slinging (X: -160 to -350, Z: -80 to 60)
    for (let t = 0; t < 24; t++) {
      const tx = -180 - (t % 6) * 28;
      const tz = -60 + Math.floor(t / 6) * 35;
      const tree = createFoliageModel('PINE');
      const s = 1.4 + (t % 3) * 0.4;
      tree.scale.set(s, s * 1.5, s);
      tree.position.set(tx, 0, tz);
      jungle.add(tree);

      this.webAnchors.push({
        position: new THREE.Vector3(tx, 14 * s, tz),
        type: 'TREE',
      });
    }

    // Ancient Ruin Pyramidal Temple
    const templeMat = new THREE.MeshStandardMaterial({ color: 0x3f3f46, roughness: 0.9 });
    for (let l = 0; l < 4; l++) {
      const step = new THREE.Mesh(
        new THREE.BoxGeometry(40 - l * 8, 4, 40 - l * 8),
        templeMat
      );
      step.position.set(-260, l * 4 + 2, -10);
      jungle.add(step);

      this.collisionBoxes.push({
        min: new THREE.Vector3(-260 - (20 - l * 4), l * 4, -10 - (20 - l * 4)),
        max: new THREE.Vector3(-260 + (20 - l * 4), l * 4 + 4, -10 + (20 - l * 4)),
        isBuilding: true,
        canWebAnchor: true,
      });
    }

    this.webAnchors.push({
      position: new THREE.Vector3(-260, 20, -10),
      type: 'BUILDING_CORNER',
    });

    this.worldGroup.add(jungle);
  }

  private buildDesertCanyonsSector() {
    const desert = new THREE.Group();
    desert.name = 'sector_desert';

    // Redrock Canyon Cliffs (X: -180 to -360, Z: 120 to 300)
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.95 });
    for (let r = 0; r < 8; r++) {
      const rx = -200 - (r % 3) * 45;
      const rz = 140 + Math.floor(r / 3) * 55;
      const h = 35 + (r % 4) * 15;
      const cliff = new THREE.Mesh(new THREE.CylinderGeometry(18, 25, h, 8), rockMat);
      cliff.position.set(rx, h / 2, rz);
      desert.add(cliff);

      this.collisionBoxes.push({
        min: new THREE.Vector3(rx - 20, 0, rz - 20),
        max: new THREE.Vector3(rx + 20, h, rz + 20),
        isBuilding: true,
        canWebAnchor: true,
      });

      this.webAnchors.push({
        position: new THREE.Vector3(rx, h, rz),
        type: 'CLIFF',
      });
    }

    // Cacti
    for (let c = 0; c < 10; c++) {
      const cactus = createFoliageModel('CACTUS');
      cactus.position.set(-180 - c * 15, 0, 110 + (c % 3) * 30);
      desert.add(cactus);
    }

    // Baron Ironclad's Desert Stronghold
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.8, roughness: 0.4 });
    const bunker = new THREE.Mesh(new THREE.BoxGeometry(45, 16, 45), baseMat);
    bunker.position.set(-280, 8, 220);
    desert.add(bunker);

    this.collisionBoxes.push({
      min: new THREE.Vector3(-302, 0, 198),
      max: new THREE.Vector3(-258, 16, 242),
      isBuilding: true,
      canWebAnchor: true,
    });

    this.webAnchors.push({
      position: new THREE.Vector3(-280, 16, 220),
      type: 'BUILDING_CORNER',
    });

    this.worldGroup.add(desert);
  }

  private buildSubterraneanCaveSector() {
    // Hidden grotto & underworld tunnels (Accessed near canyon ravine or sewer grate)
    const caves = new THREE.Group();
    caves.name = 'sector_caves';

    const caveWallMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.9,
    });

    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      emissive: 0x9333ea,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.9,
    });

    // Cave chamber beneath city (-140, -18, 60)
    const chamberFloor = new THREE.Mesh(
      new THREE.CylinderGeometry(35, 35, 2, 12),
      caveWallMat
    );
    chamberFloor.position.set(-140, -22, 60);
    caves.add(chamberFloor);

    // Glowing crystal stalactites
    for (let i = 0; i < 6; i++) {
      const crystal = new THREE.Mesh(
        new THREE.ConeGeometry(1.2, 8, 5),
        crystalMat
      );
      crystal.rotation.x = Math.PI;
      crystal.position.set(-140 + Math.cos(i) * 16, -10, 60 + Math.sin(i) * 16);
      caves.add(crystal);

      this.webAnchors.push({
        position: new THREE.Vector3(-140 + Math.cos(i) * 16, -10, 60 + Math.sin(i) * 16),
        type: 'CLIFF',
      });
    }

    this.worldGroup.add(caves);
  }

  private buildWater() {
    // Infinite ocean water plane at Y = 0 (Z: -160 to -600)
    const waterGeo = new THREE.PlaneGeometry(1000, 600, 16, 16);
    waterGeo.rotateX(-Math.PI / 2);

    const waterMat = new THREE.MeshStandardMaterial({
      map: textures.getWaterTexture(),
      color: 0x0284c7,
      roughness: 0.1,
      metalness: 0.4,
      transparent: true,
      opacity: 0.85,
    });

    this.waterMesh = new THREE.Mesh(waterGeo, waterMat);
    this.waterMesh.position.set(0, 0, -420);
    this.waterMesh.receiveShadow = true;
    this.worldGroup.add(this.waterMesh);
  }

  private buildAmbientPropsAndVehicles() {
    // Place some vehicles ready to be driven by the player!
    const car1 = createVehicleModel('CAR');
    car1.position.set(0, 0, 15);
    car1.name = 'world_car_1';
    this.worldGroup.add(car1);

    const bike1 = createVehicleModel('BIKE');
    bike1.position.set(12, 0, 30);
    bike1.name = 'world_bike_1';
    this.worldGroup.add(bike1);

    const boat1 = createVehicleModel('BOAT');
    boat1.position.set(0, 0, -185);
    boat1.name = 'world_boat_1';
    this.worldGroup.add(boat1);

    const heli1 = createVehicleModel('HELICOPTER');
    heli1.position.set(0, 130, 100); // On Central Skyscraper helipad!
    heli1.name = 'world_heli_1';
    this.worldGroup.add(heli1);
  }

  // Find optimal anchor point for web swinging based on look direction and range
  findWebAnchor(playerPos: THREE.Vector3, lookDir: THREE.Vector3, maxDist = 95): WebAnchorPoint | null {
    let bestAnchor: WebAnchorPoint | null = null;
    let bestScore = -Infinity;

    for (const anchor of this.webAnchors) {
      // Must be above player or at least close to player elevation
      if (anchor.position.y < playerPos.y + 4) continue;

      const toAnchor = new THREE.Vector3().subVectors(anchor.position, playerPos);
      const dist = toAnchor.length();
      if (dist > maxDist || dist < 6) continue;

      toAnchor.normalize();
      const dot = toAnchor.dot(lookDir);
      // Favour anchors in front of the camera/character with good distance
      if (dot > 0.1) {
        const score = dot * 2.0 - (dist / maxDist);
        if (score > bestScore) {
          bestScore = score;
          bestAnchor = anchor;
        }
      }
    }

    return bestAnchor;
  }

  // Check simple box collisions for player movement
  checkCollision(pos: THREE.Vector3, radius = 0.5): { collided: boolean; normal: THREE.Vector3; resolveY?: number } {
    for (const box of this.collisionBoxes) {
      if (
        pos.x + radius > box.min.x &&
        pos.x - radius < box.max.x &&
        pos.z + radius > box.min.z &&
        pos.z - radius < box.max.z
      ) {
        // Player is horizontally within box bounds
        if (pos.y >= box.max.y - 0.8 && pos.y <= box.max.y + 1.5) {
          // Walking on top of the building/roof/bridge!
          return { collided: true, normal: new THREE.Vector3(0, 1, 0), resolveY: box.max.y };
        } else if (pos.y < box.max.y && pos.y + 1.8 > box.min.y) {
          // Side wall collision
          return { collided: true, normal: new THREE.Vector3(0, 0, 1) };
        }
      }
    }
    return { collided: false, normal: new THREE.Vector3() };
  }

  // Get active biome based on coordinates
  getBiomeAt(x: number, z: number, y: number): BiomeType {
    if (y < -10) return 'CAVES';
    if (z < -130) return 'BEACH';
    if (x < -140 && z < 90) return 'JUNGLE';
    if (x < -140 && z >= 90) return 'DESERT';
    if (x > 140) return 'INDUSTRIAL';
    if (z > 130) return 'MIDTOWN';
    return 'DOWNTOWN';
  }
}
