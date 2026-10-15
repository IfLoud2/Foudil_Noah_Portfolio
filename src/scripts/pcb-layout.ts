/**
 * Géométrie de la carte stylisée du LCR-mètre (sans dépendance à Three.js, donc testable).
 *
 * Repère : x vers la droite, y vers le haut, z vers l'observateur ; le dessus de la carte est à y = 0.
 * Le chemin du signal est simplifié : deux voies (V et I) entrent par les BNC, passent par un étage
 * analogique chacune, se rejoignent au CAN, puis traversent le MCU jusqu'au connecteur de sortie.
 * Ce n'est pas le routage réel de la carte (voir la vue KiCad à côté).
 */

export const BOARD = { hw: 5.5, hd: 3.5, t: 0.18 } as const;

/** Nombre d'arrêts du point : BNC, étage analogique, CAN, MCU (tampon), MCU (DSP), sortie. */
export const STOPS = 6;
/** Pas d'échantillonnage du tracé du signal, en unités de la scène. */
export const SPACING = 0.06;

export interface V3 {
  x: number;
  y: number;
  z: number;
}

const p = (x: number, y: number, z: number): V3 => ({ x, y, z });

// ---------- primitives filaires (paires de sommets pour LineSegments) ----------

export function boxEdges(cx: number, cz: number, w: number, d: number, y0: number, y1: number, grow = 0): number[] {
  const xa = cx - w / 2 - grow;
  const xb = cx + w / 2 + grow;
  const za = cz - d / 2 - grow;
  const zb = cz + d / 2 + grow;
  const yb = y0;
  const yt = y1 + grow;
  const corners: ReadonlyArray<readonly [number, number]> = [
    [xa, za],
    [xb, za],
    [xb, zb],
    [xa, zb],
  ];
  const out: number[] = [];
  for (let i = 0; i < 4; i++) {
    const [ax, az] = corners[i] ?? [0, 0];
    const [bx, bz] = corners[(i + 1) % 4] ?? [0, 0];
    out.push(ax, yb, az, bx, yb, bz, ax, yt, az, bx, yt, bz, ax, yb, az, ax, yt, az);
  }
  return out;
}

export function prismEdges(cx: number, cz: number, r: number, y0: number, y1: number, sides = 10, grow = 0): number[] {
  const rr = r + grow;
  const yt = y1 + grow;
  const out: number[] = [];
  for (let i = 0; i < sides; i++) {
    const a = (i / sides) * Math.PI * 2;
    const b = ((i + 1) / sides) * Math.PI * 2;
    const ax = cx + Math.cos(a) * rr;
    const az = cz + Math.sin(a) * rr;
    const bx = cx + Math.cos(b) * rr;
    const bz = cz + Math.sin(b) * rr;
    out.push(ax, y0, az, bx, y0, bz, ax, yt, az, bx, yt, bz);
    if (i % 2 === 0) out.push(ax, y0, az, ax, yt, az);
  }
  return out;
}

/** Pattes d'un boîtier : de petits traits qui dépassent des bords. `all` : les quatre côtés, sinon les deux bords en z. */
export function pinEdges(cx: number, cz: number, w: number, d: number, perSide: number, all: boolean): number[] {
  const out: number[] = [];
  const len = 0.2;
  const y = 0.02;
  for (let i = 0; i < perSide; i++) {
    const f = (i + 0.5) / perSide - 0.5;
    const x = cx + f * (w - 0.2);
    out.push(x, y, cz - d / 2, x, y, cz - d / 2 - len, x, y, cz + d / 2, x, y, cz + d / 2 + len);
    if (all) {
      const z = cz + f * (d - 0.2);
      out.push(cx - w / 2, y, z, cx - w / 2 - len, y, z, cx + w / 2, y, z, cx + w / 2 + len, y, z);
    }
  }
  return out;
}

/** Polyligne dans le plan de la carte -> paires de sommets. */
export function polySegments(points: ReadonlyArray<readonly [number, number]>, y = 0.012): number[] {
  const out: number[] = [];
  for (let i = 0; i + 1 < points.length; i++) {
    const a = points[i] ?? [0, 0];
    const b = points[i + 1] ?? [0, 0];
    out.push(a[0], y, a[1], b[0], y, b[1]);
  }
  return out;
}

// ---------- composants ----------

export interface Part {
  id: string;
  /** Arrêts pendant lesquels ce composant est mis en évidence. */
  stops: readonly number[];
  edges: number[];
  /** Même forme, un peu plus grande : halo allumé quand le point est dessus. */
  halo: number[];
}

const bnc = (id: string, z: number): Part => ({
  id,
  stops: [0],
  edges: [...prismEdges(-4.75, z, 0.5, 0, 1.0), ...prismEdges(-4.75, z, 0.2, 1.0, 1.12, 8)],
  halo: prismEdges(-4.75, z, 0.5, 0, 1.0, 10, 0.14),
});

const afe = (id: string, z: number): Part => ({
  id,
  stops: [1],
  edges: [...boxEdges(-2.8, z, 1.5, 0.9, 0, 0.22), ...pinEdges(-2.8, z, 1.5, 0.9, 5, false)],
  halo: boxEdges(-2.8, z, 1.5, 0.9, 0, 0.22, 0.14),
});

function headerPins(): number[] {
  const out: number[] = [];
  for (let i = 0; i < 8; i++) {
    const z = -1.05 + i * 0.3;
    out.push(...boxEdges(4.75, z, 0.2, 0.2, 0.35, 0.42));
  }
  return out;
}

export const PARTS: readonly Part[] = [
  bnc('bnc1', -1.5),
  bnc('bnc2', 1.5),
  afe('afe1', -1.5),
  afe('afe2', 1.5),
  {
    id: 'adc',
    stops: [2],
    edges: [...boxEdges(-0.3, 0, 1.7, 1.7, 0, 0.22), ...pinEdges(-0.3, 0, 1.7, 1.7, 6, true)],
    halo: boxEdges(-0.3, 0, 1.7, 1.7, 0, 0.22, 0.14),
  },
  {
    id: 'mcu',
    stops: [3, 4],
    edges: [...boxEdges(2.3, 0, 2.8, 2.3, 0, 0.28), ...pinEdges(2.3, 0, 2.8, 2.3, 7, false)],
    halo: boxEdges(2.3, 0, 2.8, 2.3, 0, 0.28, 0.14),
  },
  {
    id: 'out',
    stops: [5],
    edges: [...boxEdges(4.75, 0, 0.5, 2.4, 0, 0.35), ...headerPins()],
    halo: boxEdges(4.75, 0, 0.5, 2.4, 0, 0.35, 0.14),
  },
];

/** Composants d'ambiance : passifs, régulateur, condensateurs, points de test. */
function decor(): number[] {
  const out: number[] = [];
  const passive = (x: number, z: number, along = true): void => {
    out.push(...boxEdges(x, z, along ? 0.36 : 0.18, along ? 0.18 : 0.36, 0, 0.1));
  };
  for (const z of [-1.5, 1.5]) {
    passive(-3.9, z - 0.55);
    passive(-3.9, z + 0.55);
    passive(-1.95, z - 0.65, false);
    passive(-3.2, z + (z < 0 ? -0.8 : 0.8));
  }
  passive(-1.3, -1.05, false);
  passive(-1.3, 1.05, false);
  passive(0.65, -1.2);
  passive(0.65, 1.2);
  passive(-0.3, -1.25, false);
  passive(-0.3, 1.25, false);
  passive(0.4, 1.0, false);
  passive(0.4, -1.0, false);
  out.push(...boxEdges(-0.6, 2.7, 1.0, 0.7, 0, 0.2));
  out.push(...pinEdges(-0.6, 2.7, 1.0, 0.7, 3, false));
  for (const x of [1.2, 2.0, 2.8]) out.push(...prismEdges(x, 2.7, 0.3, 0, 0.55, 10));
  for (let i = 0; i < 6; i++) {
    const x = -3.3 + i * 1.3;
    out.push(x - 0.1, 0.01, -2.8, x + 0.1, 0.01, -2.8, x, 0.01, -2.9, x, 0.01, -2.7);
  }
  // Zone d'antenne du module radio : un cadre sur la carte, sans composant.
  out.push(...polySegments([[3.75, -1.0], [3.95, -1.0], [3.95, 1.0], [3.75, 1.0]], 0.012));
  return out;
}

export const DECOR_EDGES: number[] = decor();

export const BOARD_EDGES: number[] = (() => {
  const { hw, hd, t } = BOARD;
  const out: number[] = [];
  const top = [
    [-hw, -hd],
    [hw, -hd],
    [hw, hd],
    [-hw, hd],
  ] as const;
  for (let i = 0; i < 4; i++) {
    const a = top[i] ?? [0, 0];
    const b = top[(i + 1) % 4] ?? [0, 0];
    out.push(a[0], 0, a[1], b[0], 0, b[1], a[0], -t, a[1], b[0], -t, b[1], a[0], 0, a[1], a[0], -t, a[1]);
  }
  // Perçages aux quatre coins.
  for (const [x, z] of [
    [-hw + 0.45, -hd + 0.45],
    [hw - 0.45, -hd + 0.45],
    [hw - 0.45, hd - 0.45],
    [-hw + 0.45, hd - 0.45],
  ] as const) {
    out.push(...prismEdges(x, z, 0.16, 0, 0, 8));
  }
  return out;
})();

/** Pistes d'alimentation et bus, sans lien avec le chemin du signal ; sert de décor. */
export const TRACE_EDGES: number[] = [
  ...polySegments([[-0.6, 2.35], [-0.6, 1.6], [2.3, 1.6], [2.3, 1.15]]),
  ...polySegments([[-0.9, 2.35], [-0.9, 1.9], [-2.8, 1.9], [-2.8, 1.95]]),
  ...polySegments([[-0.1, 2.35], [-0.1, 1.0], [-0.3, 1.0], [-0.3, 0.85]]),
  ...polySegments([[0.55, -0.5], [0.9, -0.5]]),
  ...polySegments([[0.55, -0.3], [0.9, -0.3]]),
  ...polySegments([[0.55, 0.3], [0.9, 0.3]]),
  ...polySegments([[0.55, 0.5], [0.9, 0.5]]),
  ...polySegments([[3.7, -0.6], [4.5, -0.6]]),
  ...polySegments([[3.7, 0.6], [4.5, 0.6]]),
  ...polySegments([[-4.75, -2.4], [-4.75, -2.8], [-3.3, -2.8]]),
  ...polySegments([[-4.75, 2.4], [-4.75, 2.9], [-1.5, 2.9], [-1.5, 3.1]]),
];

/** Vias : un réseau régulier, sans les endroits couverts par un composant. */
export function viaPositions(): Float32Array {
  const keepOut = (x: number, z: number): boolean => {
    for (const [cx, cz, w, d] of [
      [-4.75, -1.5, 1.2, 1.2],
      [-4.75, 1.5, 1.2, 1.2],
      [-2.8, -1.5, 2.0, 1.5],
      [-2.8, 1.5, 2.0, 1.5],
      [-0.3, 0, 2.2, 2.2],
      [2.3, 0, 3.2, 2.8],
      [4.75, 0, 1.0, 2.9],
    ] as const) {
      if (Math.abs(x - cx) < w / 2 && Math.abs(z - cz) < d / 2) return true;
    }
    return false;
  };
  const out: number[] = [];
  for (let x = -5.0; x <= 5.0; x += 0.5) {
    for (let z = -3.0; z <= 3.0; z += 0.5) {
      if (!keepOut(x, z) && (Math.round(x * 2) + Math.round(z * 2)) % 2 === 0) out.push(x, 0.01, z);
    }
  }
  return new Float32Array(out);
}

// ---------- chemin du signal ----------

export interface SignalPath {
  /** Sommets du tracé complet (x, y, z) ; chaque tronçon est échantillonné au pas SPACING. */
  positions: Float32Array;
  /** Indice du premier sommet de chaque tronçon (longueur = tronçons + 1, le dernier = total). */
  legStart: number[];
  /** Nombre de tronçons. */
  legs: number;
}

/** Échantillonne des tronçons (polylignes) à pas constant. Un tronçon réduit à un point reste présent. */
export function buildPath(legs: ReadonlyArray<readonly V3[]>, spacing = SPACING): SignalPath {
  const out: number[] = [];
  const legStart: number[] = [];
  for (const poly of legs) {
    legStart.push(out.length / 3);
    const first = poly[0];
    if (!first) continue;
    const cum: number[] = [0];
    for (let i = 1; i < poly.length; i++) {
      const a = poly[i - 1] ?? first;
      const b = poly[i] ?? first;
      cum.push((cum[i - 1] ?? 0) + Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z));
    }
    const total = cum[cum.length - 1] ?? 0;
    const n = Math.max(1, Math.ceil(total / spacing));
    let seg = 0;
    for (let k = 0; k <= n; k++) {
      const s = (k / n) * total;
      while (seg < poly.length - 2 && s > (cum[seg + 1] ?? 0)) seg++;
      const a = poly[seg] ?? first;
      const b = poly[seg + 1] ?? a;
      const span = (cum[seg + 1] ?? 0) - (cum[seg] ?? 0);
      const f = span > 0 ? (s - (cum[seg] ?? 0)) / span : 0;
      out.push(a.x + (b.x - a.x) * f, a.y + (b.y - a.y) * f, a.z + (b.z - a.z) * f);
    }
  }
  legStart.push(out.length / 3);
  return { positions: new Float32Array(out), legStart, legs: legs.length };
}

/** Position du point à l'abscisse curviligne u ∈ [0, legs] (la partie entière désigne le tronçon). */
export function pointAt(path: SignalPath, u: number): V3 {
  const uu = Math.min(Math.max(u, 0), path.legs);
  const leg = Math.min(Math.floor(uu), path.legs - 1);
  const f = uu - leg;
  const a = path.legStart[leg] ?? 0;
  const b = (path.legStart[leg + 1] ?? a + 1) - 1;
  const idx = a + f * (b - a);
  const i0 = Math.floor(idx);
  const i1 = Math.min(i0 + 1, b);
  const g = idx - i0;
  const at = (i: number, o: number): number => path.positions[i * 3 + o] ?? 0;
  return {
    x: at(i0, 0) + (at(i1, 0) - at(i0, 0)) * g,
    y: at(i0, 1) + (at(i1, 1) - at(i0, 1)) * g,
    z: at(i0, 2) + (at(i1, 2) - at(i0, 2)) * g,
  };
}

/** Nombre de sommets à tracer pour couvrir le chemin jusqu'à l'abscisse u. */
export function litCount(path: SignalPath, u: number): number {
  const uu = Math.min(Math.max(u, 0), path.legs);
  const leg = Math.min(Math.floor(uu), path.legs - 1);
  const f = uu - leg;
  const a = path.legStart[leg] ?? 0;
  const b = (path.legStart[leg + 1] ?? a + 1) - 1;
  return Math.min(a + Math.ceil(f * (b - a)) + 1, path.positions.length / 3);
}

const Y_BOARD = 0.06;

/** Voie de la tension (BNC du haut) : cinq tronçons, un par arrêt suivant. */
export const LEGS_V: ReadonlyArray<readonly V3[]> = [
  [p(-4.75, 1.12, -1.5), p(-4.75, Y_BOARD, -1.5), p(-3.55, Y_BOARD, -1.5), p(-2.8, 0.34, -1.5)],
  [p(-2.8, 0.34, -1.5), p(-2.05, Y_BOARD, -1.5), p(-1.7, Y_BOARD, -1.5), p(-1.7, Y_BOARD, 0), p(-1.15, Y_BOARD, 0), p(-0.3, 0.34, 0)],
  [p(-0.3, 0.34, 0), p(0.55, Y_BOARD, 0), p(0.9, Y_BOARD, 0), p(2.3, 0.4, 0)],
  [p(2.3, 0.4, 0), p(2.3, 0.4, 0)],
  [p(2.3, 0.4, 0), p(3.7, Y_BOARD, 0), p(4.5, Y_BOARD, 0), p(4.75, 0.47, 0)],
];

/** Voie du courant (BNC du bas) : jusqu'au CAN, où elle rejoint la voie de la tension. */
export const LEGS_I: ReadonlyArray<readonly V3[]> = [
  [p(-4.75, 1.12, 1.5), p(-4.75, Y_BOARD, 1.5), p(-3.55, Y_BOARD, 1.5), p(-2.8, 0.34, 1.5)],
  [p(-2.8, 0.34, 1.5), p(-2.05, Y_BOARD, 1.5), p(-1.7, Y_BOARD, 1.5), p(-1.7, Y_BOARD, 0), p(-1.15, Y_BOARD, 0), p(-0.3, 0.34, 0)],
];
