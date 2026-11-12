import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { WorldManager } from './worldGen.ts';
import { HeroModelRefs, createHeroModel, createAnimalModel, createNPCModel } from './proceduralModels.ts';
import { HeroMovementController, MovementInput } from './physicsAndMovement.ts';
import { CombatSystem } from './combatSystem.ts';
import { VehicleController } from './vehicleController.ts';
import { MissionManager } from './missionSystem.ts';
import { SuitDefinition } from '../types/game.ts';
import { GameSaveData } from './reputationAndSave.ts';
import { sound } from './audio.ts';

// Pre-allocated reusable math helpers (Zero GC in animation loop!)
const _camOffset = new THREE.Vector3();
const _camTarget = new THREE.Vector3();
const _desiredCamPos = new THREE.Vector3();

export class GameEngine {
  container: HTMLDivElement;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;

  isSoftwareGl: boolean = false;
  isDestroyed: boolean = false;
  frameId: number = 0;

  // Subsystems
  world: WorldManager;
  heroRefs: HeroModelRefs;
  movement: HeroMovementController;
  combat: CombatSystem;
  vehicles: VehicleController;
  missions: MissionManager;
  saveData: GameSaveData;

  // Camera Control
  cameraYaw: number = 0;
  cameraPitch: number = 0.25;
  cameraDist: number = 5.5;

  // Living World NPCs & Animals
  birds: THREE.Group[] = [];
  fishes: THREE.Group[] = [];
  civilians: THREE.Group[] = [];

  // Weather & Day/Night
  sunLight: THREE.DirectionalLight;
  hemiLight: THREE.HemisphereLight;
  rainParticles: THREE.Points | null = null;
  dayTime: number = 10; // 0 to 24 hours
  weather: 'CLEAR' | 'RAIN' | 'FOG' = 'CLEAR';

  // Game Loop Stats
  fps: number = 30;
  private lastTime: number = performance.now();
  private frameCount: number = 0;
  private fpsTimer: number = performance.now();

  // Callbacks to UI
  onStatsUpdate?: () => void;
  onMissionCompleted?: (title: string, xp: number, credits: number) => void;
  onTrick?: (name: string, xp: number) => void;

  constructor(container: HTMLDivElement, saveData: GameSaveData) {
    this.container = container;
    this.saveData = saveData;

    // Detect software WebGL
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 1. Renderer Setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl && this.saveData.graphics.preset !== 'VERY_LOW',
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.setSize(container.clientWidth, container.clientHeight);

    const baseDpr = this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 1.5);
    this.renderer.setPixelRatio(baseDpr * this.saveData.graphics.resolutionScale);

    this.renderer.shadowMap.enabled = !this.isSoftwareGl && this.saveData.graphics.shadows;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    // 2. Scene & Camera
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x38bdf8);
    this.scene.fog = new THREE.FogExp2(0x38bdf8, 0.0035);

    this.camera = new THREE.PerspectiveCamera(
      65,
      container.clientWidth / container.clientHeight,
      0.3,
      this.saveData.graphics.renderDistance
    );

    // Studio Environment map
    try {
      const pmrem = new THREE.PMREMGenerator(this.renderer);
      this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      pmrem.dispose();
    } catch {}

    // 3. Lighting Rig (Key + Fill)
    this.hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x1e293b, 0.8);
    this.scene.add(this.hemiLight);

    this.sunLight = new THREE.DirectionalLight(0xfffbeb, 1.6);
    this.sunLight.position.set(120, 180, 80);
    this.sunLight.castShadow = this.renderer.shadowMap.enabled;
    this.sunLight.shadow.mapSize.width = 1024;
    this.sunLight.shadow.mapSize.height = 1024;
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 400;
    const d = 150;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0005;
    this.sunLight.shadow.normalBias = 0.02;
    this.scene.add(this.sunLight);

    // 4. World Geometry
    this.world = new WorldManager(this.scene);
    this.world.buildWorld();

    // 5. Hero Model & Movement
    const activeSuit = this.saveData.suits.find((s: SuitDefinition) => s.id === this.saveData.stats.currentSuitId) || this.saveData.suits[0];
    this.heroRefs = createHeroModel(activeSuit);
    this.scene.add(this.heroRefs.root);

    this.movement = new HeroMovementController(this.world, this.heroRefs);
    this.combat = new CombatSystem(this.scene, this.heroRefs);
    this.vehicles = new VehicleController(this.world);
    this.missions = new MissionManager();

    // 6. Living World Entities
    this.spawnLivingWorld();
    this.createRainEffect();

    // Pre-warm shaders
    if (!this.isSoftwareGl) {
      try {
        this.renderer.compile(this.scene, this.camera);
      } catch {}
    }

    // Window resize
    window.addEventListener('resize', this.handleResize);

    // Start Main Loop
    this.tick();
  }

  private spawnLivingWorld() {
    // Birds flying over city and beach
    for (let i = 0; i < 8; i++) {
      const bird = createAnimalModel('BIRD');
      bird.position.set(
        (Math.random() - 0.5) * 180,
        40 + Math.random() * 45,
        (Math.random() - 0.5) * 180
      );
      this.scene.add(bird);
      this.birds.push(bird);
    }

    // Fish swimming in South Beach ocean
    for (let i = 0; i < 10; i++) {
      const fish = createAnimalModel('FISH');
      fish.position.set(
        -80 + Math.random() * 160,
        -1.5 - Math.random() * 4,
        -180 - Math.random() * 120
      );
      this.scene.add(fish);
      this.fishes.push(fish);
    }

    // Civilians walking along sidewalks
    for (let i = 0; i < 14; i++) {
      const civ = createNPCModel(i === 0 ? 'POLICE' : 'CIVILIAN');
      civ.position.set(
        -40 + (i % 5) * 20,
        0,
        (Math.random() - 0.5) * 100
      );
      this.scene.add(civ);
      this.civilians.push(civ);
    }
  }

  private createRainEffect() {
    const count = 400;
    const rainGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 120;
      positions[i * 3 + 1] = Math.random() * 60;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 120;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const rainMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.18,
      transparent: true,
      opacity: 0.6,
    });
    this.rainParticles = new THREE.Points(rainGeo, rainMat);
    this.rainParticles.visible = false;
    this.scene.add(this.rainParticles);
  }

  setSuit(suit: SuitDefinition) {
    this.scene.remove(this.heroRefs.root);
    this.heroRefs = createHeroModel(suit);
    this.scene.add(this.heroRefs.root);
    this.movement.heroRefs = this.heroRefs;
    this.combat.heroRefs = this.heroRefs;
    this.saveData.stats.currentSuitId = suit.id;
  }

  handleResize = () => {
    if (!this.container || this.isDestroyed) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  rotateCamera(deltaX: number, deltaY: number) {
    const sens = 0.004 * this.saveData.controls.touchSensitivity;
    this.cameraYaw -= deltaX * sens;
    const yDir = this.saveData.controls.invertY ? -1 : 1;
    this.cameraPitch = THREE.MathUtils.clamp(this.cameraPitch + deltaY * sens * yDir, -0.4, 1.2);
  }

  tick = () => {
    if (this.isDestroyed) return;

    const now = performance.now();
    const rawDt = (now - this.lastTime) * 0.001;
    this.lastTime = now;
    const dt = Math.min(rawDt, 0.05); // Frame delta clamp for simulation stability

    // FPS counter
    this.frameCount++;
    if (now - this.fpsTimer >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.fpsTimer = now;
      if (this.onStatsUpdate) this.onStatsUpdate();
    }

    this.updateGame(dt);
    this.updateCamera(dt);
    this.updateLivingWorld(dt);
    this.updateDayNightAndWeather(dt);

    this.renderer.render(this.scene, this.camera);

    // Paced loop on software WebGL vs requestAnimationFrame on GPU
    if (this.isSoftwareGl) {
      this.afterDraw(this.tick);
    } else {
      this.frameId = requestAnimationFrame(this.tick);
    }
  };

  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 33); // ~30 fps cap for low-end
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  private updateGame(dt: number) {
    // Passive filament energy & stamina recovery
    this.saveData.stats.energy = Math.min(
      this.saveData.stats.maxEnergy,
      this.saveData.stats.energy + dt * 15
    );
    this.saveData.stats.stamina = this.movement.stamina;
    this.saveData.stats.oxygen = this.movement.oxygen;

    // Check mission objective triggers
    const check = this.missions.checkMissionProgress([
      this.movement.position.x,
      this.movement.position.y,
      this.movement.position.z,
    ]);

    if (check.completed && check.mission) {
      sound.playMissionComplete();
      this.saveData.stats.credits += check.mission.rewardCredits;
      this.saveData.stats.xp += check.mission.rewardXp;
      this.saveData.stats.heroReputation = Math.min(100, this.saveData.stats.heroReputation + 5);
      if (this.onMissionCompleted) {
        this.onMissionCompleted(
          check.mission.title,
          check.mission.rewardXp,
          check.mission.rewardCredits
        );
      }
    }

    // Update combat system
    this.combat.update(dt, this.movement.position, (dmg) => {
      this.saveData.stats.health = Math.max(0, this.saveData.stats.health - dmg);
    });

    this.saveData.stats.combo = this.combat.comboCount;
  }

  private updateCamera(dt: number) {
    const target = this.vehicles.activeVehicle
      ? this.vehicles.activeVehicle.mesh.position
      : this.movement.position;

    _camTarget.copy(target);
    _camTarget.y += 1.6;

    // Calculate third-person camera pos
    const dist = this.vehicles.activeVehicle ? 8.5 : this.cameraDist;
    _camOffset.set(
      Math.sin(this.cameraYaw) * Math.cos(this.cameraPitch) * dist,
      Math.sin(this.cameraPitch) * dist + 0.5,
      Math.cos(this.cameraYaw) * Math.cos(this.cameraPitch) * dist
    );

    _desiredCamPos.copy(_camTarget).add(_camOffset);

    // Add camera shake from combat impacts
    if (this.combat.cameraShakeAmount > 0.01) {
      _desiredCamPos.x += (Math.random() - 0.5) * this.combat.cameraShakeAmount;
      _desiredCamPos.y += (Math.random() - 0.5) * this.combat.cameraShakeAmount;
      _desiredCamPos.z += (Math.random() - 0.5) * this.combat.cameraShakeAmount;
    }

    // Smooth exponential damping follow
    this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, _desiredCamPos.x, 14, dt);
    this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, _desiredCamPos.y, 14, dt);
    this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, _desiredCamPos.z, 14, dt);

    this.camera.lookAt(_camTarget);
  }

  private updateLivingWorld(dt: number) {
    const t = performance.now() * 0.001;

    // Flap and circle birds
    this.birds.forEach((bird, i) => {
      bird.position.x += Math.cos(t * 0.6 + i) * 12 * dt;
      bird.position.z += Math.sin(t * 0.6 + i) * 12 * dt;
      bird.rotation.y = -(t * 0.6 + i) + Math.PI / 2;

      const wingL = bird.getObjectByName('wing_l');
      const wingR = bird.getObjectByName('wing_r');
      if (wingL && wingR) {
        const flap = Math.sin(t * 12 + i) * 0.7;
        wingL.rotation.z = flap;
        wingR.rotation.z = -flap;
      }
    });

    // Fish swarming
    this.fishes.forEach((fish, i) => {
      fish.position.x += Math.cos(t * 0.8 + i) * 4 * dt;
      fish.position.z += Math.sin(t * 0.8 + i) * 4 * dt;
      const tail = fish.getObjectByName('tail');
      if (tail) tail.rotation.y = Math.sin(t * 10 + i) * 0.5;
    });

    // Pedestrians strolling
    this.civilians.forEach((civ, i) => {
      civ.position.z += Math.sin(t * 0.4 + i) * 2 * dt;
    });
  }

  private updateDayNightAndWeather(dt: number) {
    // Advance day/night clock (slow cycle)
    this.dayTime = (this.dayTime + dt * 0.05) % 24;

    const sunAngle = ((this.dayTime - 6) / 24) * Math.PI * 2;
    this.sunLight.position.x = Math.cos(sunAngle) * 220;
    this.sunLight.position.y = Math.sin(sunAngle) * 220;

    const isNight = this.dayTime < 6 || this.dayTime > 19;
    const targetFogCol = isNight ? new THREE.Color(0x090d16) : new THREE.Color(0x38bdf8);
    (this.scene.fog as THREE.FogExp2).color.lerp(targetFogCol, dt * 0.5);
    (this.scene.background as THREE.Color).lerp(targetFogCol, dt * 0.5);

    // Rain particles
    if (this.rainParticles && this.rainParticles.visible) {
      const pos = this.rainParticles.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < pos.count; i++) {
        let y = pos.getY(i) - dt * 45;
        if (y < 0) y = 60;
        pos.setY(i, y);
      }
      pos.needsUpdate = true;
      this.rainParticles.position.x = this.movement.position.x;
      this.rainParticles.position.z = this.movement.position.z;
    }
  }

  toggleWeather() {
    if (this.weather === 'CLEAR') {
      this.weather = 'RAIN';
      if (this.rainParticles) this.rainParticles.visible = true;
    } else if (this.weather === 'RAIN') {
      this.weather = 'FOG';
      if (this.rainParticles) this.rainParticles.visible = false;
      (this.scene.fog as THREE.FogExp2).density = 0.012;
    } else {
      this.weather = 'CLEAR';
      (this.scene.fog as THREE.FogExp2).density = 0.0035;
    }
  }

  dispose() {
    this.isDestroyed = true;
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);
    window.removeEventListener('resize', this.handleResize);
    this.renderer.dispose();
  }
}
