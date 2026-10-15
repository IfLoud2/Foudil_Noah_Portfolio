/**
 * Chaîne de mesure du LCR-mètre, modélisée sur signaux synthétiques.
 *
 *   excitation sinusoïdale -> composant -> tension V et courant I
 *   -> bruit + quantification (CAN) -> DFT à la fréquence d'excitation
 *   -> Z = V / I (phaseurs)
 *
 * Module pur (sans DOM) : exécuté dans un Web Worker et testé sous Node.
 * Hypothèse : calibrage analogique idéal (le rapport d'amplitude V/I est connu),
 * la démo isole donc l'échantillonnage, le bruit, la quantification et la DFT.
 */
import { gaussian, mulberry32 } from './rng.ts';

export type Dut = 'R' | 'C' | 'L';

/** Nombre d'échantillons par acquisition (puissance de 2). */
export const N = 2048;
/** Fréquence d'échantillonnage par voie (Hz). */
export const FS = 100_000;
/** Amplitude crête des signaux, en fraction de la pleine échelle. */
export const AMP = 0.8;
/** Décalage entre V et I quand les deux voies partagent un seul CAN : une demi-période d'échantillonnage. */
export const SKEW_S = 0.5 / FS;

export const DUTS = {
  R: { r: 1000 },
  C: { value: 100e-9, rs: 0.5 },
  L: { value: 10e-3, rs: 5 },
} as const;

export interface AcquireRequest {
  id: number;
  dut: Dut;
  freq: number;
  snrDb: number;
  bits: number;
  multiplexed: boolean;
  seed: number;
}

export interface AcquireResult {
  id: number;
  /** Fréquence réellement utilisée (cohérente avec la fenêtre). */
  freq: number;
  bin: number;
  /** Phase de départ de la sinusoïde de tension (rad). */
  phi0: number;
  /** Argument réel de Z (rad) : décalage de phase entre V et I. */
  theta: number;
  /** Décalage d'échantillonnage entre V et I (s) : 0 si deux CAN simultanés. */
  skew: number;
  zRe: number;
  zIm: number;
  trueRe: number;
  trueIm: number;
  /** Phaseurs issus de la DFT au bin k (référence cosinus, début de fenêtre). */
  vRe: number;
  vIm: number;
  iRe: number;
  iIm: number;
  /** Échantillons après bruit et quantification, N valeurs par voie (fraction de pleine échelle). */
  v: Float32Array;
  i: Float32Array;
  /** Spectre de la tension, en dBFS, bins 0..N/2-1. */
  spectrum: Float32Array;
  /** Répétabilité sur REPEATS acquisitions indépendantes : écart-type relatif de |Z| et de la phase (degrés). */
  sigmaMag: number;
  sigmaPhase: number;
}

/** Nombre d'acquisitions indépendantes pour l'estimation de répétabilité. */
export const REPEATS = 32;

const TWO_PI = 2 * Math.PI;
const COS = new Float64Array(N);
const SIN = new Float64Array(N);
for (let n = 0; n < N; n++) {
  COS[n] = Math.cos((TWO_PI * n) / N);
  SIN[n] = Math.sin((TWO_PI * n) / N);
}

/** Bin DFT correspondant à `freq` (échantillonnage cohérent : nombre entier de périodes). */
export function binFor(freq: number): number {
  const k = Math.round((freq * N) / FS);
  return Math.min(Math.max(k, 1), N / 2 - 1);
}

export function dutImpedance(dut: Dut, omega: number): { re: number; im: number } {
  switch (dut) {
    case 'R':
      return { re: DUTS.R.r, im: 0 };
    case 'C':
      return { re: DUTS.C.rs, im: -1 / (omega * DUTS.C.value) };
    case 'L':
      return { re: DUTS.L.rs, im: omega * DUTS.L.value };
  }
}

/** CAN bipolaire ±1 (pleine échelle) sur `bits` bits, avec saturation. */
export function quantize(x: number, bits: number): number {
  const step = 2 / 2 ** bits;
  const q = Math.round(x / step) * step;
  return Math.min(Math.max(q, -1), 1 - step);
}

/** DFT à un seul bin : coefficient complexe normalisé (2/N), amplitude crête de la sinusoïde. */
export function dftBin(x: Float64Array, k: number): { re: number; im: number } {
  let re = 0;
  let im = 0;
  for (let n = 0; n < N; n++) {
    const idx = (k * n) & (N - 1);
    re += x[n] * COS[idx];
    im -= x[n] * SIN[idx];
  }
  return { re: (2 / N) * re, im: (2 / N) * im };
}

/** FFT radix-2 en place (longueur N). */
export function fft(re: Float64Array, im: Float64Array): void {
  for (let i = 1, j = 0; i < N; i++) {
    let bit = N >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      const tr = re[i];
      re[i] = re[j];
      re[j] = tr;
      const ti = im[i];
      im[i] = im[j];
      im[j] = ti;
    }
  }
  for (let len = 2; len <= N; len <<= 1) {
    const half = len >> 1;
    const stride = N / len;
    for (let i = 0; i < N; i += len) {
      for (let j = 0; j < half; j++) {
        const wr = COS[j * stride];
        const wi = -SIN[j * stride];
        const a = i + j;
        const b = a + half;
        const xr = re[b] * wr - im[b] * wi;
        const xi = re[b] * wi + im[b] * wr;
        re[b] = re[a] - xr;
        im[b] = im[a] - xi;
        re[a] += xr;
        im[a] += xi;
      }
    }
  }
}

interface Capture {
  v: Float64Array;
  i: Float64Array;
  phi0: number;
  V: { re: number; im: number };
  I: { re: number; im: number };
  /** Phaseur V/I. */
  ratioRe: number;
  ratioIm: number;
}

/** Une acquisition : excitation, bruit, quantification, DFT au bin k. */
function capture(req: AcquireRequest, seed: number, z: { re: number; im: number }, k: number): Capture {
  const omega = (TWO_PI * k * FS) / N;
  const theta = Math.atan2(z.im, z.re);
  const rand = mulberry32(seed);
  const phi0 = rand() * TWO_PI;
  const sigma = (AMP / Math.SQRT2) * 10 ** (-req.snrDb / 20);
  const skew = req.multiplexed ? SKEW_S : 0;

  const v = new Float64Array(N);
  const i = new Float64Array(N);
  for (let n = 0; n < N; n++) {
    const t = n / FS;
    v[n] = quantize(AMP * Math.sin(omega * t + phi0) + sigma * gaussian(rand), req.bits);
    // i = V / Z : le courant est en retard de theta sur la tension.
    i[n] = quantize(AMP * Math.sin(omega * (t + skew) + phi0 - theta) + sigma * gaussian(rand), req.bits);
  }
  const V = dftBin(v, k);
  const I = dftBin(i, k);
  const den = I.re * I.re + I.im * I.im;
  return {
    v,
    i,
    phi0,
    V,
    I,
    ratioRe: (V.re * I.re + V.im * I.im) / den,
    ratioIm: (V.im * I.re - V.re * I.im) / den,
  };
}

function relStd(xs: readonly number[]): number {
  const m = xs.reduce((a, b) => a + b, 0) / xs.length;
  return Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / xs.length) / Math.abs(m);
}

function std(xs: readonly number[]): number {
  const m = xs.reduce((a, b) => a + b, 0) / xs.length;
  return Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / xs.length);
}

export function acquire(req: AcquireRequest): AcquireResult {
  const k = binFor(req.freq);
  const freq = (k * FS) / N;
  const omega = TWO_PI * freq;
  const z = dutImpedance(req.dut, omega);
  const zMag = Math.hypot(z.re, z.im);
  const theta = Math.atan2(z.im, z.re);

  const main = capture(req, req.seed, z, k);

  // Répétabilité : REPEATS acquisitions indépendantes (graines dérivées), mêmes réglages.
  const mags: number[] = [];
  const phases: number[] = [];
  for (let r = 1; r <= REPEATS; r++) {
    const c = capture(req, (req.seed + Math.imul(r, 0x9e3779b1)) >>> 0, z, k);
    mags.push(zMag * Math.hypot(c.ratioRe, c.ratioIm));
    phases.push((Math.atan2(zMag * c.ratioIm, zMag * c.ratioRe) * 180) / Math.PI);
  }

  const re = Float64Array.from(main.v);
  const im = new Float64Array(N);
  fft(re, im);
  const spectrum = new Float32Array(N / 2);
  for (let b = 0; b < N / 2; b++) {
    const mag = (2 / N) * Math.hypot(re[b], im[b]);
    spectrum[b] = 20 * Math.log10(Math.max(mag, 1e-9));
  }

  return {
    id: req.id,
    freq,
    bin: k,
    phi0: main.phi0,
    theta,
    skew: req.multiplexed ? SKEW_S : 0,
    zRe: zMag * main.ratioRe,
    zIm: zMag * main.ratioIm,
    trueRe: z.re,
    trueIm: z.im,
    vRe: main.V.re,
    vIm: main.V.im,
    iRe: main.I.re,
    iIm: main.I.im,
    v: Float32Array.from(main.v),
    i: Float32Array.from(main.i),
    spectrum,
    sigmaMag: relStd(mags),
    sigmaPhase: std(phases),
  };
}
