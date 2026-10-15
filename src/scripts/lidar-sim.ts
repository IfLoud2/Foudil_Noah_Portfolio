/**
 * Simulation synthétique d'un LiDAR 2D embarqué sur un drone qui change d'altitude.
 * Un scan 2D à l'altitude z ne voit que les obstacles plus hauts que z : en
 * accumulant les scans à des altitudes différentes, on reconstruit une carte
 * pseudo-3D (même principe que sur le projet UAV).
 *
 * Module pur (sans DOM, sans Three.js) : testé sous Node.
 */
import { gaussian, mulberry32 } from './rng.ts';

export const ROOM_W = 8;
export const ROOM_D = 5;
export const ROOM_H = 2.6;
export const MAX_RANGE = 7;
export const BEAMS_PER_REV = 360;
export const BEAMS_PER_SECOND = 6000;

export interface Segment {
  ax: number;
  ay: number;
  bx: number;
  by: number;
  /** Hauteur de l'obstacle : un scan à z >= h passe au-dessus. */
  h: number;
}

export interface Pose {
  x: number;
  y: number;
  z: number;
  yaw: number;
}

/** sRGB -> linéaire : Three.js traite les couleurs de sommets comme linéaires. */
const lin = (c: number): number => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const LOW: readonly [number, number, number] = [lin(0x19 / 255), lin(0xe6 / 255), lin(0xff / 255)]; // #19e6ff (sol)
const HIGH: readonly [number, number, number] = [lin(0xb0 / 255), lin(0x5c / 255), lin(0xff / 255)]; // #b05cff (plafond)

function rect(x0: number, y0: number, x1: number, y1: number, h: number): Segment[] {
  return [
    { ax: x0, ay: y0, bx: x1, by: y0, h },
    { ax: x1, ay: y0, bx: x1, by: y1, h },
    { ax: x1, ay: y1, bx: x0, by: y1, h },
    { ax: x0, ay: y1, bx: x0, by: y0, h },
  ];
}

/** Pièce de 8 x 5 m, une porte dans le mur gauche, trois obstacles de hauteurs différentes. */
export function buildScene(): Segment[] {
  const hw = ROOM_W / 2;
  const hd = ROOM_D / 2;
  return [
    { ax: -hw, ay: -hd, bx: hw, by: -hd, h: ROOM_H },
    { ax: -hw, ay: hd, bx: hw, by: hd, h: ROOM_H },
    { ax: hw, ay: -hd, bx: hw, by: hd, h: ROOM_H },
    { ax: -hw, ay: -hd, bx: -hw, by: -0.5, h: ROOM_H },
    { ax: -hw, ay: 0.5, bx: -hw, by: hd, h: ROOM_H },
    ...rect(-0.8, -0.5, 0.6, 0.5, 1.1),
    ...rect(3.2, -2.2, 3.8, -1.4, 1.7),
    ...rect(-3.6, 1.5, -3.2, 1.9, ROOM_H),
  ];
}

const OMEGA = 0.35;

/** Trajectoire : ellipse autour du centre, altitude oscillante entre 0,3 et 2,3 m. */
export function pose(t: number): Pose {
  return {
    x: 2.9 * Math.cos(OMEGA * t),
    y: 1.5 * Math.sin(OMEGA * t),
    z: 1.3 + 1.0 * Math.sin(0.5 * t + 0.8),
    yaw: Math.atan2(1.5 * OMEGA * Math.cos(OMEGA * t), -2.9 * OMEGA * Math.sin(OMEGA * t)),
  };
}

/** Distance au premier obstacle touché par le rayon (ox,oy)+t(dx,dy) à l'altitude z, ou -1. */
export function castRay(segs: readonly Segment[], ox: number, oy: number, dx: number, dy: number, z: number): number {
  let best = -1;
  for (const s of segs) {
    if (s.h <= z) continue;
    const ex = s.bx - s.ax;
    const ey = s.by - s.ay;
    const den = dx * ey - dy * ex;
    if (Math.abs(den) < 1e-9) continue;
    const t = ((s.ax - ox) * ey - (s.ay - oy) * ex) / den;
    const u = ((s.ax - ox) * dy - (s.ay - oy) * dx) / den;
    if (t > 1e-6 && u >= 0 && u <= 1 && (best < 0 || t < best)) best = t;
  }
  return best;
}

export class Scanner {
  /** Positions (x, hauteur, y) : repère Three.js, Y vers le haut. */
  readonly positions: Float32Array;
  readonly colors: Float32Array;
  /** Dernière distance mesurée par faisceau (-1 : pas de retour). */
  readonly ranges: Float32Array;
  readonly capacity: number;
  count = 0;
  time = 0;
  private head = 0;
  private beam = 0;
  private readonly segs: Segment[];
  private readonly rand: () => number;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.positions = new Float32Array(capacity * 3);
    this.colors = new Float32Array(capacity * 3);
    this.ranges = new Float32Array(BEAMS_PER_REV).fill(-1);
    this.segs = buildScene();
    this.rand = mulberry32(7);
  }

  get pose(): Pose {
    return pose(this.time);
  }

  step(nBeams: number): void {
    const angStep = (2 * Math.PI) / BEAMS_PER_REV;
    for (let n = 0; n < nBeams; n++) {
      this.time += 1 / BEAMS_PER_SECOND;
      const p = pose(this.time);
      const slot = this.beam % BEAMS_PER_REV;
      const a = slot * angStep + p.yaw;
      const dx = Math.cos(a);
      const dy = Math.sin(a);
      const r = castRay(this.segs, p.x, p.y, dx, dy, p.z);
      if (r > 0 && r < MAX_RANGE) {
        const rn = r + gaussian(this.rand) * 0.012;
        const z = p.z + gaussian(this.rand) * 0.008;
        const i = this.head * 3;
        this.positions[i] = p.x + rn * dx;
        this.positions[i + 1] = z;
        this.positions[i + 2] = p.y + rn * dy;
        const k = Math.min(Math.max(z / ROOM_H, 0), 1);
        this.colors[i] = LOW[0] + (HIGH[0] - LOW[0]) * k;
        this.colors[i + 1] = LOW[1] + (HIGH[1] - LOW[1]) * k;
        this.colors[i + 2] = LOW[2] + (HIGH[2] - LOW[2]) * k;
        this.head = (this.head + 1) % this.capacity;
        if (this.count < this.capacity) this.count++;
        this.ranges[slot] = rn;
      } else {
        this.ranges[slot] = -1;
      }
      this.beam++;
    }
  }
}
