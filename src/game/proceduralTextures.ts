import * as THREE from 'three';

// Procedural textures generated directly via 2D Canvas (zero 404s, tiny memory footprint)
class TextureManager {
  private cache: Map<string, THREE.CanvasTexture> = new Map();

  getBuildingFacadeTexture(): THREE.CanvasTexture {
    if (this.cache.has('facade')) return this.cache.get('facade')!;

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Concrete background
    ctx.fillStyle = '#1e2430';
    ctx.fillRect(0, 0, 128, 256);

    // Window grid
    const cols = 4;
    const rows = 12;
    const padX = 8;
    const padY = 6;
    const w = (128 - padX * (cols + 1)) / cols;
    const h = (256 - padY * (rows + 1)) / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = padX + c * (w + padX);
        const y = padY + r * (h + padY);

        // Random window states (lit warm, lit cyan/office, dark glass)
        const rand = Math.random();
        if (rand > 0.45) {
          ctx.fillStyle = rand > 0.75 ? '#ffecb3' : '#b3e5fc';
        } else {
          ctx.fillStyle = '#0f172a';
        }
        ctx.fillRect(x, y, w, h);

        // Window frame
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, w, h);
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    this.cache.set('facade', tex);
    return tex;
  }

  getRoadTexture(): THREE.CanvasTexture {
    if (this.cache.has('road')) return this.cache.get('road')!;

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    // Dark asphalt
    ctx.fillStyle = '#1f242c';
    ctx.fillRect(0, 0, 128, 128);

    // Subtle asphalt noise
    for (let i = 0; i < 200; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#272e38' : '#171c23';
      ctx.fillRect(Math.random() * 128, Math.random() * 128, 2, 2);
    }

    // Yellow double center line
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(60, 0, 3, 128);
    ctx.fillRect(65, 0, 3, 128);

    // White edge dashed lines
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(10, 0, 3, 128);
    ctx.fillRect(115, 0, 3, 128);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 4);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.cache.set('road', tex);
    return tex;
  }

  getSandTexture(): THREE.CanvasTexture {
    if (this.cache.has('sand')) return this.cache.get('sand')!;

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#d97706';
    ctx.fillRect(0, 0, 128, 128);

    // Subtle dune wave bands
    for (let y = 0; y < 128; y += 16) {
      ctx.fillStyle = '#b45309';
      ctx.fillRect(0, y, 128, 4);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(0, y + 4, 128, 4);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    this.cache.set('sand', tex);
    return tex;
  }

  getWaterTexture(): THREE.CanvasTexture {
    if (this.cache.has('water')) return this.cache.get('water')!;

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#0284c7';
    ctx.fillRect(0, 0, 128, 128);

    // Soft caustic ripples
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.arc(30 + i * 20, 20 + i * 18, 25, 0, Math.PI * 2);
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    this.cache.set('water', tex);
    return tex;
  }

  getHeroSuitTexture(primary = '#0284c7', glow = '#38bdf8'): THREE.CanvasTexture {
    const key = `suit_${primary}_${glow}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    // Carbon fiber base weave
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 128, 128);

    // Micro grid weave pattern
    for (let x = 0; x < 128; x += 4) {
      for (let y = 0; y < 128; y += 4) {
        if ((x + y) % 8 === 0) {
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(x, y, 4, 4);
        }
      }
    }

    // Armor primary plates
    ctx.fillStyle = primary;
    ctx.fillRect(24, 20, 80, 88);

    // Kinetic energy glow chevron / emblem
    ctx.strokeStyle = glow;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(34, 40);
    ctx.lineTo(64, 76);
    ctx.lineTo(94, 40);
    ctx.stroke();

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, tex);
    return tex;
  }
}

export const textures = new TextureManager();
