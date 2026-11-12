import * as THREE from 'three';
import { HeroModelRefs, createEnemyModel } from './proceduralModels.ts';
import { sound } from './audio.ts';

export interface ActiveEnemy {
  id: string;
  type: 'THUG' | 'BRUTE' | 'SNIPER' | 'BOSS_OVERCHARGE' | 'BOSS_IRONCLAD';
  mesh: THREE.Group;
  health: number;
  maxHealth: number;
  isStunned: boolean;
  stunTimer: number;
  attackCooldown: number;
  isBoss: boolean;
  velocity: THREE.Vector3;
}

export interface WebProjectile {
  mesh: THREE.Mesh;
  direction: THREE.Vector3;
  speed: number;
  life: number;
  isBullet: boolean;
}

export interface FloatingDamage {
  text: string;
  pos: THREE.Vector3;
  color: string;
  life: number;
}

export class CombatSystem {
  scene: THREE.Scene;
  heroRefs: HeroModelRefs;
  enemies: ActiveEnemy[] = [];
  projectiles: WebProjectile[] = [];
  floatingDamages: FloatingDamage[] = [];

  // Hitstop & camera shake state
  hitstopRemaining: number = 0;
  cameraShakeAmount: number = 0;

  // Combo system
  comboCount: number = 0;
  comboTimer: number = 0;

  constructor(scene: THREE.Scene, heroRefs: HeroModelRefs) {
    this.scene = scene;
    this.heroRefs = heroRefs;
  }

  spawnEnemy(type: ActiveEnemy['type'], pos: [number, number, number]): ActiveEnemy {
    const mesh = createEnemyModel(type);
    mesh.position.set(pos[0], pos[1], pos[2]);
    this.scene.add(mesh);

    const isBoss = type.startsWith('BOSS');
    const maxHp = isBoss ? 600 : type === 'BRUTE' ? 220 : type === 'SNIPER' ? 80 : 120;

    const enemy: ActiveEnemy = {
      id: `enemy_${Math.random().toString(36).substring(2, 9)}`,
      type,
      mesh,
      health: maxHp,
      maxHealth: maxHp,
      isStunned: false,
      stunTimer: 0,
      attackCooldown: 1.0 + Math.random(),
      isBoss,
      velocity: new THREE.Vector3(),
    };

    this.enemies.push(enemy);
    return enemy;
  }

  // Melee Attack (Light / Heavy 3-hit combo)
  executeMeleeAttack(playerPos: THREE.Vector3, playerRotY: number, onHit?: (dmg: number, isFinisher: boolean) => void) {
    // Punch animation
    this.heroRefs.rightArm.rotation.x = -1.8;
    this.heroRefs.rightArm.position.z = 0.2;
    setTimeout(() => {
      this.heroRefs.rightArm.rotation.x = 0;
      this.heroRefs.rightArm.position.z = 0;
    }, 120);

    const isHeavy = this.comboCount % 3 === 2;
    sound.playMeleePunch(isHeavy);

    // Hit detection cone in front of hero
    const forward = new THREE.Vector3(-Math.sin(playerRotY), 0, -Math.cos(playerRotY)).normalize();
    const hitRadius = 3.2;

    let hitSomeone = false;

    for (const enemy of this.enemies) {
      const dist = enemy.mesh.position.distanceTo(playerPos);
      if (dist <= hitRadius) {
        const toEnemy = new THREE.Vector3().subVectors(enemy.mesh.position, playerPos).normalize();
        if (toEnemy.dot(forward) > 0.3) {
          hitSomeone = true;
          const dmg = isHeavy ? 45 : 25;
          this.damageEnemy(enemy, dmg, isHeavy ? 12 : 6, toEnemy);
          if (onHit) onHit(dmg, isHeavy);
        }
      }
    }

    if (hitSomeone) {
      this.comboCount++;
      this.comboTimer = 3.5;
      this.hitstopRemaining = isHeavy ? 0.08 : 0.04;
      this.cameraShakeAmount = isHeavy ? 0.35 : 0.15;
    }
  }

  // Web Shot: shoots web filament tethering an enemy
  executeWebShot(playerPos: THREE.Vector3, playerRotY: number) {
    sound.playWebShoot();
    const forward = new THREE.Vector3(-Math.sin(playerRotY), 0, -Math.cos(playerRotY)).normalize();

    const geo = new THREE.SphereGeometry(0.35, 6, 6);
    const mat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(playerPos).add(new THREE.Vector3(0, 1.4, 0));
    this.scene.add(mesh);

    this.projectiles.push({
      mesh,
      direction: forward,
      speed: 38,
      life: 1.2,
      isBullet: false,
    });
  }

  // Web Bullet: fast precision stun bullet
  executeWebBullet(playerPos: THREE.Vector3, playerRotY: number) {
    sound.playWebShoot();
    const forward = new THREE.Vector3(-Math.sin(playerRotY), 0, -Math.cos(playerRotY)).normalize();

    const geo = new THREE.CylinderGeometry(0.08, 0.08, 0.8, 6);
    geo.rotateX(Math.PI / 2);
    const mat = new THREE.MeshBasicMaterial({ color: 0x7dd3fc });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(playerPos).add(new THREE.Vector3(0, 1.4, 0));
    this.scene.add(mesh);

    this.projectiles.push({
      mesh,
      direction: forward,
      speed: 55,
      life: 0.9,
      isBullet: true,
    });
  }

  // Web Boom: 360-degree shockwave blast
  executeWebBoom(playerPos: THREE.Vector3) {
    sound.playWebBoom();
    this.hitstopRemaining = 0.06;
    this.cameraShakeAmount = 0.5;

    // Expanding visual shockwave ring
    const ringGeo = new THREE.RingGeometry(0.5, 1.2, 16);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.copy(playerPos).add(new THREE.Vector3(0, 0.4, 0));
    this.scene.add(ring);

    // Expand and fade ring
    let scale = 1;
    const expandInterval = setInterval(() => {
      scale += 1.2;
      ring.scale.set(scale, 1, scale);
      ringMat.opacity -= 0.15;
      if (ringMat.opacity <= 0) {
        clearInterval(expandInterval);
        this.scene.remove(ring);
        ringGeo.dispose();
        ringMat.dispose();
      }
    }, 30);

    // Blast all enemies within 8m
    for (const enemy of this.enemies) {
      const dist = enemy.mesh.position.distanceTo(playerPos);
      if (dist <= 8.5) {
        const knockDir = new THREE.Vector3().subVectors(enemy.mesh.position, playerPos).normalize();
        this.damageEnemy(enemy, 50, 18, knockDir);
        enemy.isStunned = true;
        enemy.stunTimer = 2.0;
      }
    }
  }

  // Special Overdrive Attack: "Apex Filament Tempest"
  executeSpecialAttack(playerPos: THREE.Vector3) {
    sound.playWebBoom();
    this.hitstopRemaining = 0.12;
    this.cameraShakeAmount = 0.8;

    for (const enemy of this.enemies) {
      const dist = enemy.mesh.position.distanceTo(playerPos);
      if (dist <= 16.0) {
        const knockDir = new THREE.Vector3().subVectors(enemy.mesh.position, playerPos).normalize();
        this.damageEnemy(enemy, 120, 24, knockDir);
        enemy.isStunned = true;
        enemy.stunTimer = 3.5;
      }
    }
  }

  private damageEnemy(enemy: ActiveEnemy, dmg: number, knockbackForce: number, knockDir: THREE.Vector3) {
    enemy.health -= dmg;
    enemy.velocity.addScaledVector(knockDir, knockbackForce);
    enemy.velocity.y += knockbackForce * 0.4;

    this.floatingDamages.push({
      text: `-${dmg}`,
      pos: enemy.mesh.position.clone().add(new THREE.Vector3(0, 1.8, 0)),
      color: dmg > 40 ? '#ef4444' : '#f59e0b',
      life: 1.0,
    });

    if (enemy.health <= 0) {
      // Enemy defeated!
      sound.playTrickChime();
      this.floatingDamages.push({
        text: 'KO!',
        pos: enemy.mesh.position.clone().add(new THREE.Vector3(0, 2.2, 0)),
        color: '#10b981',
        life: 1.5,
      });
      this.scene.remove(enemy.mesh);
      this.enemies = this.enemies.filter((e) => e.id !== enemy.id);
    }
  }

  update(dt: number, playerPos: THREE.Vector3, onPlayerDamaged?: (dmg: number) => void) {
    // Hitstop freeze
    if (this.hitstopRemaining > 0) {
      this.hitstopRemaining -= dt;
      return;
    }

    // Decay camera shake
    this.cameraShakeAmount = THREE.MathUtils.damp(this.cameraShakeAmount, 0, 8, dt);

    // Combo timer
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) this.comboCount = 0;
    }

    // Update projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.life -= dt;
      p.mesh.position.addScaledVector(p.direction, p.speed * dt);

      // Check enemy collision
      for (const enemy of this.enemies) {
        if (p.mesh.position.distanceTo(enemy.mesh.position) < 1.8) {
          const dmg = p.isBullet ? 35 : 15;
          this.damageEnemy(enemy, dmg, 4, p.direction);
          enemy.isStunned = true;
          enemy.stunTimer = p.isBullet ? 1.5 : 3.0; // Web Shot pins for 3 sec!
          p.life = 0;
          break;
        }
      }

      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        this.projectiles.splice(i, 1);
      }
    }

    // Update enemies AI & physics
    for (const enemy of this.enemies) {
      if (enemy.isStunned) {
        enemy.stunTimer -= dt;
        if (enemy.stunTimer <= 0) enemy.isStunned = false;
      }

      // Knockback damping
      enemy.velocity.x = THREE.MathUtils.damp(enemy.velocity.x, 0, 5, dt);
      enemy.velocity.z = THREE.MathUtils.damp(enemy.velocity.z, 0, 5, dt);
      enemy.velocity.y -= 25.0 * dt; // gravity
      enemy.mesh.position.addScaledVector(enemy.velocity, dt);
      if (enemy.mesh.position.y <= 0) {
        enemy.mesh.position.y = 0;
        enemy.velocity.y = 0;
      }

      // AI movement toward player
      if (!enemy.isStunned) {
        const toPlayer = new THREE.Vector3().subVectors(playerPos, enemy.mesh.position);
        const dist = toPlayer.length();
        if (dist > 1.8 && dist < 35) {
          toPlayer.y = 0;
          toPlayer.normalize();
          const speed = enemy.isBoss ? 4.5 : 3.2;
          enemy.mesh.position.addScaledVector(toPlayer, speed * dt);
          enemy.mesh.rotation.y = Math.atan2(toPlayer.x, toPlayer.z);
        }

        // Enemy attack
        enemy.attackCooldown -= dt;
        if (dist <= 2.2 && enemy.attackCooldown <= 0) {
          enemy.attackCooldown = 1.8;
          sound.playMeleePunch(false);
          if (onPlayerDamaged) onPlayerDamaged(enemy.isBoss ? 28 : 12);
        }
      }
    }

    // Update floating damages
    for (let i = this.floatingDamages.length - 1; i >= 0; i--) {
      const fd = this.floatingDamages[i];
      fd.life -= dt;
      fd.pos.y += dt * 1.5;
      if (fd.life <= 0) this.floatingDamages.splice(i, 1);
    }
  }
}
