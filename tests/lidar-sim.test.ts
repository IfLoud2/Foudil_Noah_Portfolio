import assert from 'node:assert/strict';
import { test } from 'node:test';
import { BEAMS_PER_REV, MAX_RANGE, ROOM_H, Scanner, buildScene, castRay, pose } from '../src/scripts/lidar-sim.ts';

const scene = buildScene();

test('rayon vers le mur de droite : distance exacte', () => {
  assert.ok(Math.abs(castRay(scene, 2, 0, 1, 0, 1.5) - 2) < 1e-9);
});

test('la porte du mur gauche laisse passer le rayon (pas de retour)', () => {
  assert.equal(castRay(scene, 0, 0, -1, 0, 2.0), -1);
});

test('un obstacle bas est invisible au-dessus de sa hauteur', () => {
  // Boîte centrale de 1,1 m, depuis x=2 vers -x à y=0 : hit à z=0,5, pas à z=1,5.
  const low = castRay(scene, 2, 0, -1, 0, 0.5);
  const high = castRay(scene, 2, 0, -1, 0, 1.5);
  assert.ok(Math.abs(low - 1.4) < 1e-9, `bas = ${low}`);
  assert.equal(high, -1);
});

test('la trajectoire reste dans la pièce, à l\'écart des obstacles, altitude 0,3–2,3 m', () => {
  for (let t = 0; t < 60; t += 0.05) {
    const p = pose(t);
    assert.ok(Math.abs(p.x) < 3.1 && Math.abs(p.y) < 1.6);
    assert.ok(p.z > 0.29 && p.z < 2.31);
    // Hors boîte centrale, boîte latérale et pilier (marge 0,25 m).
    const inBox = (x0: number, y0: number, x1: number, y1: number): boolean =>
      p.x > x0 - 0.25 && p.x < x1 + 0.25 && p.y > y0 - 0.25 && p.y < y1 + 0.25;
    assert.ok(!inBox(-0.8, -0.5, 0.6, 0.5));
    assert.ok(!inBox(3.2, -2.2, 3.8, -1.4));
    assert.ok(!inBox(-3.6, 1.5, -3.2, 1.9));
  }
});

test('le scanner remplit le tampon circulaire, points dans la pièce et sous le plafond', () => {
  const s = new Scanner(5000);
  s.step(6000);
  assert.equal(s.count, 5000);
  for (let i = 0; i < s.count; i++) {
    const x = s.positions[i * 3];
    const z = s.positions[i * 3 + 1];
    const y = s.positions[i * 3 + 2];
    assert.ok(Math.abs(x) < 4.2 && Math.abs(y) < 2.7, `point hors pièce (${x}, ${y})`);
    assert.ok(z > 0.25 && z < ROOM_H);
  }
  let hits = 0;
  for (let b = 0; b < BEAMS_PER_REV; b++) if (s.ranges[b] > 0 && s.ranges[b] < MAX_RANGE) hits++;
  assert.ok(hits > 200, `retours par tour : ${hits}`);
});
