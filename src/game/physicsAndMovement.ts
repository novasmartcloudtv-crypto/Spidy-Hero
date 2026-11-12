import * as THREE from 'three';
import { WorldManager, WebAnchorPoint } from './worldGen.ts';
import { HeroModelRefs } from './proceduralModels.ts';
import { sound } from './audio.ts';

export type MovementState =
  | 'IDLE'
  | 'RUN'
  | 'SPRINT'
  | 'JUMP'
  | 'DOUBLE_JUMP'
  | 'SWING'
  | 'WALL_CLIMB'
  | 'WALL_RUN'
  | 'SWIM'
  | 'DIVE'
  | 'TRICK_AERIAL'
  | 'DODGE';

export interface MovementInput {
  moveX: number; // -1 to 1 (left/right)
  moveZ: number; // -1 to 1 (forward/backward)
  sprint: boolean;
  jump: boolean;
  swingHeld: boolean;
  dodge: boolean;
  dive: boolean;
}

export class HeroMovementController {
  world: WorldManager;
  heroRefs: HeroModelRefs;

  position: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  velocity: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  rotationY: number = 0;

  state: MovementState = 'IDLE';
  isGrounded: boolean = true;
  stamina: number = 100;
  oxygen: number = 100;

  // Web swing state
  swingAnchor: WebAnchorPoint | null = null;
  swingRopeLength: number = 0;
  swingLine: THREE.Line | null = null;
  swingAngleVel: number = 0;

  // Wall mechanics
  wallNormal: THREE.Vector3 = new THREE.Vector3();
  wallRunTimer: number = 0;

  // Trick state
  trickActive: boolean = false;
  trickTimer: number = 0;
  trickName: string = '';

  // Dodge state
  dodgeTimer: number = 0;

  // Temp reusable math vectors (Zero GC in render loop!)
  private _forward = new THREE.Vector3();
  private _right = new THREE.Vector3();
  private _moveDir = new THREE.Vector3();
  private _gravity = new THREE.Vector3(0, -28.0, 0);

  constructor(world: WorldManager, heroRefs: HeroModelRefs) {
    this.world = world;
    this.heroRefs = heroRefs;
    this.position.set(0, 0.5, 5); // Start on Neo-Haven downtown street
    this.heroRefs.root.position.copy(this.position);

    this.createSwingVisualLine();
  }

  private createSwingVisualLine() {
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 0),
    ]);
    const mat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      linewidth: 3,
    });
    this.swingLine = new THREE.Line(geo, mat);
    this.swingLine.visible = false;
    this.world.scene.add(this.swingLine);
  }

  update(dt: number, input: MovementInput, cameraYaw: number, onTrickComplete?: (name: string, xp: number) => void) {
    // 1. Water Swimming / Diving Check
    const inWaterZone = this.position.z < -130 || (this.position.x < -140 && this.position.y < -15);
    const inWater = inWaterZone && this.position.y <= 0.2;

    if (inWater) {
      this.handleSwimming(dt, input, cameraYaw);
      this.animateHero(dt);
      return;
    }

    // 2. Dodge Roll
    if (input.dodge && this.dodgeTimer <= 0 && this.isGrounded) {
      this.state = 'DODGE';
      this.dodgeTimer = 0.35;
      sound.playDodge();
      // Burst velocity forward
      this.velocity.x = -Math.sin(this.rotationY) * 18;
      this.velocity.z = -Math.cos(this.rotationY) * 18;
    }

    if (this.dodgeTimer > 0) {
      this.dodgeTimer -= dt;
      this.position.addScaledVector(this.velocity, dt);
      this.heroRefs.root.position.copy(this.position);
      this.heroRefs.root.rotation.x += dt * 18; // Roll flip!
      if (this.dodgeTimer <= 0) {
        this.heroRefs.root.rotation.x = 0;
        this.state = 'IDLE';
      }
      return;
    }

    // 3. Web Swinging System
    if (input.swingHeld) {
      if (!this.swingAnchor) {
        // Try to initiate swing
        this._forward.set(-Math.sin(cameraYaw), 0, -Math.cos(cameraYaw)).normalize();
        const anchor = this.world.findWebAnchor(this.position, this._forward, 110);
        if (anchor) {
          this.swingAnchor = anchor;
          this.swingRopeLength = this.position.distanceTo(anchor.position);
          this.state = 'SWING';
          sound.playWebShoot();
          sound.playWebAttach();
          sound.playSwingWhoosh(1.2);
          if (this.swingLine) this.swingLine.visible = true;
        }
      }
    } else {
      // Released web! Slingshot release boost!
      if (this.swingAnchor) {
        this.swingAnchor = null;
        if (this.swingLine) this.swingLine.visible = false;
        // Boost release velocity in forward direction
        this.velocity.y = Math.max(this.velocity.y, 8.0);
        this.velocity.multiplyScalar(1.25);
        this.state = 'JUMP';
        sound.playSwingWhoosh(1.5);
      }
    }

    if (this.swingAnchor && this.state === 'SWING') {
      this.handleWebSwinging(dt, cameraYaw);
      this.animateHero(dt);
      return;
    }

    // 4. Ground Movement & Air Physics
    this._forward.set(-Math.sin(cameraYaw), 0, -Math.cos(cameraYaw)).normalize();
    this._right.set(Math.cos(cameraYaw), 0, -Math.sin(cameraYaw)).normalize();

    this._moveDir.set(0, 0, 0);
    this._moveDir.addScaledVector(this._right, input.moveX);
    this._moveDir.addScaledVector(this._forward, -input.moveZ);

    const hasInput = this._moveDir.lengthSq() > 0.01;
    if (hasInput) {
      this._moveDir.normalize();
      this.rotationY = Math.atan2(-this._moveDir.x, -this._moveDir.z);
    }

    const isSprinting = input.sprint && this.stamina > 10;
    const speed = isSprinting ? 22 : 11;

    if (this.isGrounded) {
      if (hasInput) {
        this.state = isSprinting ? 'SPRINT' : 'RUN';
        this.velocity.x = this._moveDir.x * speed;
        this.velocity.z = this._moveDir.z * speed;
        if (isSprinting) this.stamina = Math.max(0, this.stamina - dt * 14);
      } else {
        this.state = 'IDLE';
        this.velocity.x = THREE.MathUtils.damp(this.velocity.x, 0, 12, dt);
        this.velocity.z = THREE.MathUtils.damp(this.velocity.z, 0, 12, dt);
        this.stamina = Math.min(100, this.stamina + dt * 25);
      }

      // Jump
      if (input.jump) {
        this.velocity.y = 14.5;
        this.isGrounded = false;
        this.state = 'JUMP';
        sound.playJump();
      }
    } else {
      // Air physics
      this.velocity.addScaledVector(this._gravity, dt);

      // Air steering
      if (hasInput) {
        this.velocity.x = THREE.MathUtils.damp(this.velocity.x, this._moveDir.x * speed * 0.9, 4, dt);
        this.velocity.z = THREE.MathUtils.damp(this.velocity.z, this._moveDir.z * speed * 0.9, 4, dt);
      }

      // Double Jump or Aerial Trick
      if (input.jump && this.state === 'JUMP') {
        this.velocity.y = 12.0;
        this.state = 'DOUBLE_JUMP';
        sound.playJump();
      }

      // Perform Aerial Tricks when falling/jumping fast
      if (input.sprint && !this.trickActive && this.velocity.y < -3) {
        this.trickActive = true;
        this.trickTimer = 0.6;
        const tricks = ['360 Web Spin', 'Swan Dive Slip', 'Kinetic Somersault', 'Aerial Apex Flip'];
        this.trickName = tricks[Math.floor(Math.random() * tricks.length)];
        sound.playTrickChime();
        if (onTrickComplete) onTrickComplete(this.trickName, 80);
      }
    }

    // Integrate position
    this.position.addScaledVector(this.velocity, dt);

    // Collision detection with buildings and ground
    const col = this.world.checkCollision(this.position, 0.6);
    if (col.collided && col.resolveY !== undefined) {
      // Landed on roof / platform!
      if (this.velocity.y < -1) sound.playLand();
      this.position.y = col.resolveY;
      this.velocity.y = 0;
      this.isGrounded = true;
    } else if (this.position.y <= 0) {
      // Ground plane floor
      if (this.velocity.y < -1) sound.playLand();
      this.position.y = 0;
      this.velocity.y = 0;
      this.isGrounded = true;
    } else {
      this.isGrounded = false;
    }

    // Wall run / Wall climb detection
    if (col.collided && !this.isGrounded && Math.abs(this.velocity.y) < 10) {
      if (input.sprint) {
        this.state = 'WALL_RUN';
        this.velocity.y = 7.0; // Run up the wall!
        this.stamina = Math.max(0, this.stamina - dt * 20);
      }
    }

    // Apply to mesh
    this.heroRefs.root.position.copy(this.position);
    this.heroRefs.root.rotation.y = this.rotationY;

    this.animateHero(dt);
  }

  private handleWebSwinging(dt: number, cameraYaw: number) {
    if (!this.swingAnchor) return;

    // Anchor vector from player to anchor
    const toAnchor = new THREE.Vector3().subVectors(this.swingAnchor.position, this.position);
    const currentDist = toAnchor.length();

    // Pendulum physics: Gravity pulls down, tension force pulls toward anchor along line
    this.velocity.addScaledVector(this._gravity, dt * 1.2);

    // Lateral camera swing steering
    const swingSide = -Math.sin(cameraYaw);
    this.velocity.x += swingSide * 4.0 * dt;

    // Constrain distance to rope length
    const tensionDir = toAnchor.clone().normalize();
    const velAlongTension = this.velocity.dot(tensionDir);

    // Centripetal acceleration constraint
    if (currentDist >= this.swingRopeLength) {
      this.velocity.addScaledVector(tensionDir, -velAlongTension);
      // Boost tangential momentum!
      this.velocity.multiplyScalar(1.008);
      // Pull back to rope sphere radius
      const targetPos = this.swingAnchor.position.clone().sub(tensionDir.multiplyScalar(this.swingRopeLength));
      this.position.lerp(targetPos, 0.2);
    }

    this.position.addScaledVector(this.velocity, dt);

    // Update swing visual line
    if (this.swingLine) {
      const positions = this.swingLine.geometry.attributes.position as THREE.BufferAttribute;
      // Start at hero's right gauntlet in world space
      const gauntletWorld = new THREE.Vector3();
      this.heroRefs.rightGauntlet.getWorldPosition(gauntletWorld);
      positions.setXYZ(0, gauntletWorld.x, gauntletWorld.y, gauntletWorld.z);
      positions.setXYZ(1, this.swingAnchor.position.x, this.swingAnchor.position.y, this.swingAnchor.position.z);
      positions.needsUpdate = true;
    }

    // Rotate hero body along velocity vector
    if (this.velocity.lengthSq() > 1.0) {
      const horizontalVel = new THREE.Vector2(this.velocity.x, this.velocity.z);
      this.rotationY = Math.atan2(-horizontalVel.x, -horizontalVel.y);
      this.heroRefs.root.rotation.y = this.rotationY;
      // Pitch hero forward with speed
      const speedNorm = Math.min(this.velocity.length() / 30, 1.2);
      this.heroRefs.root.rotation.x = speedNorm * 0.45;
    }
  }

  private handleSwimming(dt: number, input: MovementInput, cameraYaw: number) {
    this.state = input.dive ? 'DIVE' : 'SWIM';
    const swimSpeed = 7.0;

    this._forward.set(-Math.sin(cameraYaw), 0, -Math.cos(cameraYaw)).normalize();
    this._right.set(Math.cos(cameraYaw), 0, -Math.sin(cameraYaw)).normalize();

    this._moveDir.set(0, 0, 0);
    this._moveDir.addScaledVector(this._right, input.moveX);
    this._moveDir.addScaledVector(this._forward, -input.moveZ);

    if (this._moveDir.lengthSq() > 0.01) {
      this._moveDir.normalize();
      this.rotationY = Math.atan2(-this._moveDir.x, -this._moveDir.z);
      this.position.addScaledVector(this._moveDir, swimSpeed * dt);
    }

    if (input.dive) {
      // Dive underwater
      this.position.y = Math.max(-12, this.position.y - dt * 3.5);
      this.oxygen = Math.max(0, this.oxygen - dt * 8);
    } else {
      // Surface buoyancy
      this.position.y = THREE.MathUtils.damp(this.position.y, -0.2, 5, dt);
      this.oxygen = Math.min(100, this.oxygen + dt * 25);
    }

    this.heroRefs.root.position.copy(this.position);
    this.heroRefs.root.rotation.y = this.rotationY;
    this.heroRefs.root.rotation.x = input.dive ? 0.4 : 0.8; // Horizontal swimming pose
  }

  private animateHero(dt: number) {
    const t = performance.now() * 0.008;

    if (this.state === 'RUN' || this.state === 'SPRINT') {
      const animSpeed = this.state === 'SPRINT' ? 1.8 : 1.2;
      const legAngle = Math.sin(t * animSpeed) * 0.65;
      const armAngle = Math.sin(t * animSpeed + Math.PI) * 0.6;

      this.heroRefs.leftLeg.rotation.x = legAngle;
      this.heroRefs.rightLeg.rotation.x = -legAngle;
      this.heroRefs.leftArm.rotation.x = armAngle;
      this.heroRefs.rightArm.rotation.x = -armAngle;
      this.heroRefs.root.rotation.x = this.state === 'SPRINT' ? 0.22 : 0.08;
    } else if (this.state === 'SWING') {
      // Dynamic swinging pose: right arm raised toward anchor line, legs swept back
      this.heroRefs.rightArm.rotation.x = -2.2;
      this.heroRefs.leftArm.rotation.x = 0.5;
      this.heroRefs.leftLeg.rotation.x = 0.6;
      this.heroRefs.rightLeg.rotation.x = 0.4;
    } else if (this.state === 'JUMP' || this.state === 'DOUBLE_JUMP') {
      // Tucked aerial pose
      this.heroRefs.leftLeg.rotation.x = 0.5;
      this.heroRefs.rightLeg.rotation.x = -0.3;
      this.heroRefs.leftArm.rotation.x = -0.8;
      this.heroRefs.rightArm.rotation.x = -0.8;
      if (this.trickActive) {
        this.heroRefs.root.rotation.y += dt * 16;
        this.trickTimer -= dt;
        if (this.trickTimer <= 0) this.trickActive = false;
      }
    } else if (this.state === 'IDLE') {
      // Breathing idle pose
      const breath = Math.sin(t * 0.3) * 0.04;
      this.heroRefs.torso.position.y = 1.25 + breath;
      this.heroRefs.leftLeg.rotation.x = 0;
      this.heroRefs.rightLeg.rotation.x = 0;
      this.heroRefs.leftArm.rotation.x = 0.05;
      this.heroRefs.rightArm.rotation.x = 0.05;
      this.heroRefs.root.rotation.x = 0;
    }
  }
}
