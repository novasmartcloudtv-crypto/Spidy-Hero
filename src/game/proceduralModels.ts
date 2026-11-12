import * as THREE from 'three';
import { textures } from './proceduralTextures.ts';
import { SuitDefinition } from '../types/game.ts';

// Composite 3-12 part procedural models grounded at bottom-center (Y=0)
// Using varied roughness, metalness, and zero external 3D files.

export interface HeroModelRefs {
  root: THREE.Group;
  torso: THREE.Mesh;
  head: THREE.Mesh;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  leftGauntlet: THREE.Mesh;
  rightGauntlet: THREE.Mesh;
  eyes: THREE.Mesh;
}

export function createHeroModel(suit: SuitDefinition): HeroModelRefs {
  const root = new THREE.Group();
  root.name = 'hero_root';

  const suitTex = textures.getHeroSuitTexture(suit.primaryColor, suit.glowColor);

  const armorMat = new THREE.MeshStandardMaterial({
    map: suitTex,
    roughness: 0.35,
    metalness: 0.45,
  });

  const secondaryMat = new THREE.MeshStandardMaterial({
    color: suit.secondaryColor,
    roughness: 0.65,
    metalness: 0.2,
  });

  const glowMat = new THREE.MeshStandardMaterial({
    color: suit.glowColor,
    emissive: suit.glowColor,
    emissiveIntensity: 0.9,
    roughness: 0.1,
    metalness: 0.8,
  });

  const jointMat = new THREE.MeshStandardMaterial({
    color: 0x090d16,
    roughness: 0.8,
    metalness: 0.1,
  });

  // 1. Pelvis / Hips (Y: 0.95)
  const pelvisGeo = new THREE.BoxGeometry(0.38, 0.22, 0.26);
  const pelvis = new THREE.Mesh(pelvisGeo, secondaryMat);
  pelvis.position.y = 0.95;
  pelvis.castShadow = true;
  root.add(pelvis);

  // 2. Torso (Y: 1.25)
  const torsoGeo = new THREE.BoxGeometry(0.46, 0.48, 0.3);
  const torso = new THREE.Mesh(torsoGeo, armorMat);
  torso.position.y = 1.25;
  torso.castShadow = true;
  root.add(torso);

  // Kinetic Chest Emblem / Core
  const crestGeo = new THREE.BoxGeometry(0.2, 0.18, 0.04);
  const crest = new THREE.Mesh(crestGeo, glowMat);
  crest.position.set(0, 1.34, 0.16);
  root.add(crest);

  // 3. Head & Cowl (Y: 1.68)
  const headGeo = new THREE.BoxGeometry(0.26, 0.3, 0.28);
  const head = new THREE.Mesh(headGeo, armorMat);
  head.position.y = 1.68;
  head.castShadow = true;
  root.add(head);

  // Angled Optical Visor Eyes
  const eyesGeo = new THREE.BoxGeometry(0.22, 0.07, 0.04);
  const eyes = new THREE.Mesh(eyesGeo, glowMat);
  eyes.position.set(0, 1.7, 0.15);
  root.add(eyes);

  // 4. Arms (Pivoted at shoulders)
  // Left Arm Group
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.34, 1.45, 0);

  const lShoulder = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.2), armorMat);
  leftArm.add(lShoulder);

  const lBicep = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.26, 0.14), secondaryMat);
  lBicep.position.y = -0.18;
  leftArm.add(lBicep);

  const leftGauntlet = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.28, 0.16), glowMat);
  leftGauntlet.position.y = -0.42;
  leftArm.add(leftGauntlet);
  root.add(leftArm);

  // Right Arm Group
  const rightArm = new THREE.Group();
  rightArm.position.set(0.34, 1.45, 0);

  const rShoulder = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.2), armorMat);
  rightArm.add(rShoulder);

  const rBicep = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.26, 0.14), secondaryMat);
  rBicep.position.y = -0.18;
  rightArm.add(rBicep);

  const rightGauntlet = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.28, 0.16), glowMat);
  rightGauntlet.position.y = -0.42;
  rightArm.add(rightGauntlet);
  root.add(rightArm);

  // 5. Legs (Pivoted at hips)
  // Left Leg Group
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.16, 0.9, 0);

  const lThigh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.42, 0.2), armorMat);
  lThigh.position.y = -0.22;
  leftLeg.add(lThigh);

  const lKnee = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.16), jointMat);
  lKnee.position.y = -0.45;
  leftLeg.add(lKnee);

  const lCalf = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.38, 0.18), secondaryMat);
  lCalf.position.y = -0.66;
  leftLeg.add(lCalf);

  const lBoot = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.26), jointMat);
  lBoot.position.set(0, -0.88, 0.04);
  leftLeg.add(lBoot);
  root.add(leftLeg);

  // Right Leg Group
  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.16, 0.9, 0);

  const rThigh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.42, 0.2), armorMat);
  rThigh.position.y = -0.22;
  rightLeg.add(rThigh);

  const rKnee = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.16), jointMat);
  rKnee.position.y = -0.45;
  rightLeg.add(rKnee);

  const rCalf = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.38, 0.18), secondaryMat);
  rCalf.position.y = -0.66;
  rightLeg.add(rCalf);

  const rBoot = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.26), jointMat);
  rBoot.position.set(0, -0.88, 0.04);
  rightLeg.add(rBoot);
  root.add(rightLeg);

  return {
    root,
    torso,
    head,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    leftGauntlet,
    rightGauntlet,
    eyes,
  };
}

export function createEnemyModel(type: 'THUG' | 'BRUTE' | 'SNIPER' | 'BOSS_OVERCHARGE' | 'BOSS_IRONCLAD'): THREE.Group {
  const root = new THREE.Group();
  root.name = `enemy_${type}`;

  const isBoss = type.startsWith('BOSS');
  const scale = isBoss ? 1.4 : type === 'BRUTE' ? 1.25 : 1.0;

  const baseColor =
    type === 'BOSS_OVERCHARGE'
      ? 0x8b5cf6
      : type === 'BOSS_IRONCLAD'
      ? 0xd97706
      : type === 'BRUTE'
      ? 0xef4444
      : type === 'SNIPER'
      ? 0x06b6d4
      : 0x475569;

  const bodyMat = new THREE.MeshStandardMaterial({
    color: baseColor,
    roughness: 0.5,
    metalness: isBoss ? 0.7 : 0.2,
  });

  const accentMat = new THREE.MeshStandardMaterial({
    color: isBoss ? (type === 'BOSS_OVERCHARGE' ? 0xa855f7 : 0xf59e0b) : 0x1e293b,
    roughness: 0.3,
    metalness: 0.6,
  });

  // Torso
  const torsoWidth = type === 'BRUTE' || type === 'BOSS_IRONCLAD' ? 0.6 : 0.44;
  const torso = new THREE.Mesh(new THREE.BoxGeometry(torsoWidth, 0.5, 0.32), bodyMat);
  torso.position.y = 1.2;
  root.add(torso);

  // Head
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.28, 0.26), accentMat);
  head.position.y = 1.6;
  root.add(head);

  // Visor / Mask
  const visor = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.06, 0.04),
    new THREE.MeshBasicMaterial({ color: isBoss ? 0xff0055 : 0xf97316 })
  );
  visor.position.set(0, 1.62, 0.14);
  root.add(visor);

  // Arms
  const lArm = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.6, 0.16), bodyMat);
  lArm.position.set(-(torsoWidth * 0.5 + 0.1), 1.15, 0);
  root.add(lArm);

  const rArm = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.6, 0.16), bodyMat);
  rArm.position.set(torsoWidth * 0.5 + 0.1, 1.15, 0);
  root.add(rArm);

  // Legs
  const lLeg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.85, 0.2), accentMat);
  lLeg.position.set(-0.16, 0.45, 0);
  root.add(lLeg);

  const rLeg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.85, 0.2), accentMat);
  rLeg.position.set(0.16, 0.45, 0);
  root.add(rLeg);

  // Boss Accents: Heavy Pauldrons or Plasma Coils
  if (type === 'BOSS_OVERCHARGE') {
    const coilL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.4), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
    coilL.position.set(-0.25, 1.5, -0.2);
    root.add(coilL);

    const coilR = coilL.clone();
    coilR.position.x = 0.25;
    root.add(coilR);
  } else if (type === 'BOSS_IRONCLAD') {
    const shield = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.7, 0.08), accentMat);
    shield.position.set(-0.45, 1.1, 0.15);
    root.add(shield);
  }

  root.scale.setScalar(scale);
  return root;
}

export function createNPCModel(role: 'CIVILIAN' | 'POLICE'): THREE.Group {
  const root = new THREE.Group();
  const shirtColors = [0x3b82f6, 0x10b981, 0xef4444, 0xf59e0b, 0x8b5cf6, 0xec4899];
  const chosenShirt = role === 'POLICE' ? 0x1e3a8a : shirtColors[Math.floor(Math.random() * shirtColors.length)];

  const shirtMat = new THREE.MeshStandardMaterial({ color: chosenShirt, roughness: 0.8 });
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.6 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: role === 'POLICE' ? 0x0f172a : 0x334155, roughness: 0.8 });

  // Body
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.46, 0.24), shirtMat);
  torso.position.y = 1.15;
  root.add(torso);

  // Head
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.26, 0.24), skinMat);
  head.position.y = 1.54;
  root.add(head);

  if (role === 'POLICE') {
    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.1, 0.3), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
    cap.position.set(0, 1.7, 0.02);
    root.add(cap);
    const badge = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.02), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
    badge.position.set(0.08, 1.25, 0.13);
    root.add(badge);
  }

  // Legs
  const lLeg = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.85, 0.18), pantsMat);
  lLeg.position.set(-0.12, 0.45, 0);
  root.add(lLeg);

  const rLeg = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.85, 0.18), pantsMat);
  rLeg.position.set(0.12, 0.45, 0);
  root.add(rLeg);

  return root;
}

export function createVehicleModel(type: 'CAR' | 'BIKE' | 'BOAT' | 'HELICOPTER'): THREE.Group {
  const root = new THREE.Group();
  root.name = `vehicle_${type}`;

  const bodyMat = new THREE.MeshStandardMaterial({
    color: type === 'BOAT' ? 0x0284c7 : type === 'HELICOPTER' ? 0x1e293b : 0xd97706,
    metalness: 0.8,
    roughness: 0.25,
  });

  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.1,
    metalness: 0.9,
    transparent: true,
    opacity: 0.8,
  });

  const tireMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 });

  if (type === 'CAR') {
    // Chassis
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.45, 3.8), bodyMat);
    chassis.position.y = 0.45;
    root.add(chassis);

    // Cabin
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.55, 2.0), glassMat);
    cabin.position.set(0, 0.9, -0.2);
    root.add(cabin);

    // 4 Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 12);
    wheelGeo.rotateZ(Math.PI / 2);

    const positions = [
      [-0.95, 0.35, 1.2],
      [0.95, 0.35, 1.2],
      [-0.95, 0.35, -1.2],
      [0.95, 0.35, -1.2],
    ];
    positions.forEach(([x, y, z]) => {
      const w = new THREE.Mesh(wheelGeo, tireMat);
      w.position.set(x, y, z);
      root.add(w);
    });

    // Headlights
    const hlGeo = new THREE.BoxGeometry(0.3, 0.15, 0.05);
    const hlMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const hl1 = new THREE.Mesh(hlGeo, hlMat);
    hl1.position.set(-0.6, 0.45, 1.91);
    root.add(hl1);
    const hl2 = hl1.clone();
    hl2.position.x = 0.6;
    root.add(hl2);
  } else if (type === 'BIKE') {
    // Motorcycle frame
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.45, 1.8), bodyMat);
    frame.position.y = 0.6;
    root.add(frame);

    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.15, 0.6), tireMat);
    seat.position.set(0, 0.85, -0.2);
    root.add(seat);

    // 2 Wheels
    const wGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.18, 12);
    wGeo.rotateZ(Math.PI / 2);
    const wFront = new THREE.Mesh(wGeo, tireMat);
    wFront.position.set(0, 0.38, 0.9);
    root.add(wFront);
    const wRear = new THREE.Mesh(wGeo, tireMat);
    wRear.position.set(0, 0.38, -0.9);
    root.add(wRear);
  } else if (type === 'BOAT') {
    // Streamlined hull
    const hull = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 4.2), bodyMat);
    hull.position.y = 0.3;
    root.add(hull);

    const bow = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 1.6, 1.2, 4), bodyMat);
    bow.rotation.y = Math.PI / 4;
    bow.rotation.x = Math.PI / 2;
    bow.position.set(0, 0.3, 2.5);
    root.add(bow);

    const screen = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.4, 0.1), glassMat);
    screen.position.set(0, 0.7, 0.6);
    root.add(screen);
  } else if (type === 'HELICOPTER') {
    // Fuselage
    const fuse = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.2, 3.2), bodyMat);
    fuse.position.y = 1.6;
    root.add(fuse);

    // Cockpit
    const cock = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 1.2), glassMat);
    cock.position.set(0, 1.7, 1.4);
    root.add(cock);

    // Tail boom
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 2.8), bodyMat);
    tail.position.set(0, 1.7, -2.6);
    root.add(tail);

    // Landing skids
    const skidGeo = new THREE.BoxGeometry(0.1, 0.1, 3.0);
    const skidL = new THREE.Mesh(skidGeo, tireMat);
    skidL.position.set(-0.8, 0.3, 0);
    root.add(skidL);
    const skidR = skidL.clone();
    skidR.position.x = 0.8;
    root.add(skidR);

    // Main rotor
    const rotor = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.05, 0.3), tireMat);
    rotor.name = 'main_rotor';
    rotor.position.set(0, 2.35, 0.2);
    root.add(rotor);
  }

  return root;
}

export function createFoliageModel(type: 'PALM' | 'PINE' | 'CACTUS'): THREE.Group {
  const root = new THREE.Group();
  root.name = `foliage_${type}`;

  if (type === 'PALM') {
    // Trunk
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.25, 4.5, 6),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 })
    );
    trunk.position.y = 2.25;
    root.add(trunk);

    // Fronds
    const frondMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 });
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const frond = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.5), frondMat);
      frond.position.set(Math.cos(angle) * 0.7, 4.4, Math.sin(angle) * 0.7);
      frond.rotation.y = angle;
      frond.rotation.z = -0.35;
      root.add(frond);
    }
  } else if (type === 'PINE') {
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.3, 2.0, 6),
      new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 })
    );
    trunk.position.y = 1.0;
    root.add(trunk);

    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.7 });
    for (let c = 0; c < 3; c++) {
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(1.8 - c * 0.45, 2.2, 6),
        foliageMat
      );
      cone.position.y = 2.4 + c * 1.3;
      root.add(cone);
    }
  } else if (type === 'CACTUS') {
    const cMat = new THREE.MeshStandardMaterial({ color: 0x4d7c0f, roughness: 0.8 });
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 3.0, 8), cMat);
    stem.position.y = 1.5;
    root.add(stem);

    // Left arm
    const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 1.0, 6), cMat);
    armL.position.set(-0.45, 1.8, 0);
    armL.rotation.z = Math.PI / 3;
    root.add(armL);
  }

  return root;
}

export function createAnimalModel(type: 'BIRD' | 'FISH'): THREE.Group {
  const root = new THREE.Group();
  root.name = `animal_${type}`;

  if (type === 'BIRD') {
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 });
    const body = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.4, 4), bodyMat);
    body.rotation.x = Math.PI / 2;
    root.add(body);

    const wingL = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.02, 0.15), bodyMat);
    wingL.name = 'wing_l';
    wingL.position.set(-0.25, 0, 0);
    root.add(wingL);

    const wingR = wingL.clone();
    wingR.name = 'wing_r';
    wingR.position.x = 0.25;
    root.add(wingR);
  } else {
    const fishMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.4 });
    const body = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.35, 4), fishMat);
    body.rotation.z = Math.PI / 2;
    root.add(body);

    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.16, 0.12), fishMat);
    tail.name = 'tail';
    tail.position.x = -0.2;
    root.add(tail);
  }

  return root;
}
