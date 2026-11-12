import * as THREE from 'three';
import { WorldManager } from './worldGen.ts';
import { sound } from './audio.ts';

export interface VehicleInstance {
  id: string;
  type: 'CAR' | 'BIKE' | 'BOAT' | 'HELICOPTER';
  mesh: THREE.Group;
  speed: number;
  maxSpeed: number;
  steerAngle: number;
  health: number;
}

export class VehicleController {
  world: WorldManager;
  vehicles: VehicleInstance[] = [];
  activeVehicle: VehicleInstance | null = null;

  constructor(world: WorldManager) {
    this.world = world;
    this.findWorldVehicles();
  }

  private findWorldVehicles() {
    // Find vehicle meshes registered in the world
    this.world.worldGroup.traverse((child) => {
      if (child.name.startsWith('world_car')) {
        this.vehicles.push({
          id: child.name,
          type: 'CAR',
          mesh: child as THREE.Group,
          speed: 0,
          maxSpeed: 38,
          steerAngle: 0,
          health: 200,
        });
      } else if (child.name.startsWith('world_bike')) {
        this.vehicles.push({
          id: child.name,
          type: 'BIKE',
          mesh: child as THREE.Group,
          speed: 0,
          maxSpeed: 45,
          steerAngle: 0,
          health: 120,
        });
      } else if (child.name.startsWith('world_boat')) {
        this.vehicles.push({
          id: child.name,
          type: 'BOAT',
          mesh: child as THREE.Group,
          speed: 0,
          maxSpeed: 32,
          steerAngle: 0,
          health: 250,
        });
      } else if (child.name.startsWith('world_heli')) {
        this.vehicles.push({
          id: child.name,
          type: 'HELICOPTER',
          mesh: child as THREE.Group,
          speed: 0,
          maxSpeed: 42,
          steerAngle: 0,
          health: 300,
        });
      }
    });
  }

  getNearbyVehicle(playerPos: THREE.Vector3, maxDist = 4.5): VehicleInstance | null {
    let closest: VehicleInstance | null = null;
    let minD = maxDist;

    for (const v of this.vehicles) {
      const d = v.mesh.position.distanceTo(playerPos);
      if (d < minD) {
        minD = d;
        closest = v;
      }
    }
    return closest;
  }

  enterVehicle(vehicle: VehicleInstance): boolean {
    this.activeVehicle = vehicle;
    sound.startVehicleEngine(vehicle.type === 'HELICOPTER');
    return true;
  }

  exitVehicle(): THREE.Vector3 {
    if (!this.activeVehicle) return new THREE.Vector3();
    const exitPos = this.activeVehicle.mesh.position.clone();
    exitPos.x += 2.0;
    exitPos.y += 0.5;
    this.activeVehicle.speed = 0;
    this.activeVehicle = null;
    sound.stopVehicleEngine();
    return exitPos;
  }

  update(
    dt: number,
    inputs: { forward: number; steer: number; handbrake: boolean; lift?: number },
    onVehicleUpdate?: (speed: number) => void
  ) {
    if (!this.activeVehicle) return;

    const v = this.activeVehicle;
    const accel = v.type === 'BIKE' ? 24 : v.type === 'CAR' ? 18 : 12;

    // Acceleration & Braking
    if (inputs.forward !== 0) {
      v.speed += inputs.forward * accel * dt;
    } else {
      v.speed = THREE.MathUtils.damp(v.speed, 0, 3, dt);
    }

    if (inputs.handbrake) {
      v.speed = THREE.MathUtils.damp(v.speed, 0, 10, dt);
    }

    v.speed = THREE.MathUtils.clamp(v.speed, -v.maxSpeed * 0.4, v.maxSpeed);

    // Steering
    const steerSpeed = v.type === 'BIKE' ? 2.4 : 1.8;
    if (Math.abs(v.speed) > 0.5) {
      v.mesh.rotation.y -= inputs.steer * steerSpeed * dt * Math.sign(v.speed);
    }

    // Move forward along vehicle heading
    const heading = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), v.mesh.rotation.y);
    v.mesh.position.addScaledVector(heading, v.speed * dt);

    // Special logic for Helicopter
    if (v.type === 'HELICOPTER') {
      const rotor = v.mesh.getObjectByName('main_rotor');
      if (rotor) rotor.rotation.y += dt * 35; // Spin blades

      // Lift / Descend
      if (inputs.lift) {
        v.mesh.position.y += inputs.lift * 16 * dt;
      }
      v.mesh.position.y = Math.max(1.0, v.mesh.position.y);
    } else if (v.type === 'BOAT') {
      // Bobbing on water
      v.mesh.position.y = Math.sin(performance.now() * 0.003) * 0.15;
    }

    // Sound engine pitch
    const speedNorm = Math.abs(v.speed) / v.maxSpeed;
    sound.updateVehicleEnginePitch(speedNorm);

    if (onVehicleUpdate) onVehicleUpdate(Math.round(Math.abs(v.speed) * 3.6)); // km/h
  }
}
