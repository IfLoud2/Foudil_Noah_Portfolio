import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AMP, DUTS, FS, N, SKEW_S, acquire, binFor, type AcquireRequest, type Dut } from '../src/scripts/dsp.ts';

const base: AcquireRequest = { id: 1, dut: 'C', freq: 1000, snrDb: 90, bits: 16, multiplexed: false, seed: 42 };
const deg = (rad: number): number => (rad * 180) / Math.PI;
const phase = (re: number, im: number): number => deg(Math.atan2(im, re));
const mag = (re: number, im: number): number => Math.hypot(re, im);

function std(xs: number[]): number {
  const m = xs.reduce((a, b) => a + b, 0) / xs.length;
  return Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / xs.length);
}

test('échantillonnage cohérent : la fréquence est calée sur un bin entier', () => {
  const k = binFor(1000);
  assert.equal(k, 20);
  const r = acquire(base);
  assert.equal(r.bin, 20);
  assert.ok(Math.abs(r.freq - (20 * FS) / N) < 1e-9);
});

test('condensateur 100 nF : |Z| et phase retrouvés à 16 bits / 90 dB', () => {
  const r = acquire(base);
  const dMag = Math.abs(mag(r.zRe, r.zIm) / mag(r.trueRe, r.trueIm) - 1);
  const dPhase = Math.abs(phase(r.zRe, r.zIm) - phase(r.trueRe, r.trueIm));
  assert.ok(dMag < 1e-3, `erreur |Z| = ${dMag}`);
  assert.ok(dPhase < 0.1, `erreur phase = ${dPhase}°`);
  const omega = 2 * Math.PI * r.freq;
  const cs = -1 / (omega * r.zIm);
  assert.ok(Math.abs(cs / DUTS.C.value - 1) < 2e-3, `Cs = ${cs}`);
});

test('inductance 10 mH : Ls retrouvée', () => {
  const r = acquire({ ...base, dut: 'L', freq: 5000 });
  const ls = r.zIm / (2 * Math.PI * r.freq);
  assert.ok(Math.abs(ls / DUTS.L.value - 1) < 2e-3, `Ls = ${ls}`);
});

test('résistance : phase proche de 0 et R retrouvée', () => {
  const r = acquire({ ...base, dut: 'R' });
  assert.ok(Math.abs(phase(r.zRe, r.zIm)) < 0.1);
  assert.ok(Math.abs(r.zRe / DUTS.R.r - 1) < 1e-3);
});

test('échantillonnage multiplexé : erreur de phase = -360·f·Δt', () => {
  const sim = acquire(base);
  const mux = acquire({ ...base, multiplexed: true });
  const expected = -360 * mux.freq * SKEW_S;
  const measured = phase(mux.zRe, mux.zIm) - phase(sim.zRe, sim.zIm);
  assert.ok(Math.abs(measured - expected) < 0.1, `mesuré ${measured}°, attendu ${expected}°`);
});

test('échantillonnage multiplexé compensé : phase retrouvée', () => {
  const sim = acquire(base);
  const mux = acquire({ ...base, multiplexed: true, compensate: true });
  assert.ok(Math.abs(phase(mux.zRe, mux.zIm) - phase(sim.zRe, sim.zIm)) < 0.05);
});

test('moins de bruit => meilleure répétabilité', () => {
  const run = (snrDb: number): number => {
    const xs: number[] = [];
    for (let s = 1; s <= 24; s++) {
      const r = acquire({ ...base, snrDb, seed: s });
      xs.push(phase(r.zRe, r.zIm));
    }
    return std(xs);
  };
  assert.ok(run(40) > 5 * run(80));
});

test('moins de bits => bruit de quantification plus élevé', () => {
  const run = (bits: number): number => {
    const xs: number[] = [];
    for (let s = 1; s <= 24; s++) {
      const r = acquire({ ...base, snrDb: 100, bits, seed: s });
      xs.push(phase(r.zRe, r.zIm));
    }
    return std(xs);
  };
  assert.ok(run(12) > run(16));
});

test('spectre : le pic est au bin de la fondamentale, proche de 20·log10(AMP)', () => {
  const r = acquire(base);
  let peak = 0;
  for (let b = 1; b < r.spectrum.length; b++) if (r.spectrum[b] > r.spectrum[peak]) peak = b;
  assert.equal(peak, r.bin);
  assert.ok(Math.abs(r.spectrum[peak] - 20 * Math.log10(AMP)) < 0.2);
});

test('mêmes paramètres et même graine => mêmes résultats', () => {
  const a = acquire(base);
  const b = acquire(base);
  assert.equal(a.zRe, b.zRe);
  assert.equal(a.zIm, b.zIm);
});

test('tampons : N échantillons par voie, phaseurs cohérents avec Z', () => {
  const r = acquire({ ...base, freq: 10000 });
  assert.equal(r.v.length, N);
  assert.equal(r.i.length, N);
  // theta = angle(V) - angle(I) (phaseurs DFT), au bruit près.
  const dv = Math.atan2(r.vIm, r.vRe) - Math.atan2(r.iIm, r.iRe);
  const wrapped = Math.atan2(Math.sin(dv), Math.cos(dv));
  assert.ok(Math.abs(deg(wrapped - r.theta)) < 0.1, `écart ${deg(wrapped - r.theta)}°`);
  assert.equal(r.skew, 0);
  assert.equal(acquire({ ...base, multiplexed: true }).skew, SKEW_S);
});

test('répétabilité : décroît avec le SNR et reste déterministe', () => {
  const lo = acquire({ ...base, snrDb: 40 });
  const hi = acquire({ ...base, snrDb: 90 });
  assert.ok(lo.sigmaPhase > 3 * hi.sigmaPhase, `${lo.sigmaPhase} vs ${hi.sigmaPhase}`);
  assert.ok(lo.sigmaMag > 3 * hi.sigmaMag);
  assert.equal(acquire({ ...base, snrDb: 40 }).sigmaPhase, lo.sigmaPhase);
  const dut: Dut = 'C';
  assert.equal(dut, 'C');
});
