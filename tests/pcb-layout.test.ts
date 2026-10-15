import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  BOARD,
  BOARD_EDGES,
  DECOR_EDGES,
  LEGS_I,
  LEGS_V,
  PARTS,
  SPACING,
  STOPS,
  TRACE_EDGES,
  buildPath,
  litCount,
  pointAt,
  viaPositions,
} from '../src/scripts/pcb-layout.ts';

const V = buildPath(LEGS_V);
const I = buildPath(LEGS_I);

test('la voie V a un tronçon entre deux arrêts consécutifs', () => {
  assert.equal(V.legs, STOPS - 1);
  assert.equal(V.legStart.length, STOPS);
  assert.equal(V.positions.length % 3, 0);
});

test('les tronçons se raccordent : fin de l’un = début du suivant', () => {
  for (let leg = 0; leg + 1 < V.legs; leg++) {
    const end = pointAt(V, leg + 1 - 1e-9);
    const next = pointAt(V, leg + 1);
    assert.ok(Math.hypot(end.x - next.x, end.y - next.y, end.z - next.z) < 1e-3, `raccord ${leg}`);
  }
});

test('le pas d’échantillonnage ne dépasse jamais SPACING', () => {
  for (const path of [V, I]) {
    for (let leg = 0; leg < path.legs; leg++) {
      const a = path.legStart[leg] ?? 0;
      const b = (path.legStart[leg + 1] ?? 0) - 1;
      for (let i = a; i < b; i++) {
        const d = Math.hypot(
          (path.positions[i * 3] ?? 0) - (path.positions[(i + 1) * 3] ?? 0),
          (path.positions[i * 3 + 1] ?? 0) - (path.positions[(i + 1) * 3 + 1] ?? 0),
          (path.positions[i * 3 + 2] ?? 0) - (path.positions[(i + 1) * 3 + 2] ?? 0),
        );
        assert.ok(d <= SPACING * 1.0001, `pas ${d}`);
      }
    }
  }
});

test('le point reste au-dessus de la carte et dans son contour', () => {
  for (const path of [V, I]) {
    for (let i = 0; i < path.positions.length; i += 3) {
      const x = path.positions[i] ?? 0;
      const y = path.positions[i + 1] ?? 0;
      const z = path.positions[i + 2] ?? 0;
      assert.ok(Math.abs(x) <= BOARD.hw && Math.abs(z) <= BOARD.hd && y >= 0);
    }
  }
});

test('les arrêts tombent sur leur composant', () => {
  const half = (id: string): [number, number, number, number] => {
    const part = PARTS.find((q) => q.id === id);
    assert.ok(part, id);
    const xs: number[] = [];
    const zs: number[] = [];
    for (let i = 0; i < part.edges.length; i += 3) {
      xs.push(part.edges[i] ?? 0);
      zs.push(part.edges[i + 2] ?? 0);
    }
    return [Math.min(...xs), Math.max(...xs), Math.min(...zs), Math.max(...zs)];
  };
  const inside = (u: number, id: string): boolean => {
    const pt = pointAt(V, u);
    const [x0, x1, z0, z1] = half(id);
    return pt.x >= x0 && pt.x <= x1 && pt.z >= z0 && pt.z <= z1;
  };
  assert.ok(inside(0, 'bnc1'), 'arrêt 0');
  assert.ok(inside(1, 'afe1'), 'arrêt 1');
  assert.ok(inside(2, 'adc'), 'arrêt 2');
  assert.ok(inside(3, 'mcu'), 'arrêt 3');
  assert.ok(inside(4, 'mcu'), 'arrêt 4');
  assert.ok(inside(5, 'out'), 'arrêt 5');
  const iEnd = pointAt(I, 2);
  assert.ok(Math.hypot(iEnd.x - pointAt(V, 2).x, iEnd.z - pointAt(V, 2).z) < 1e-3, 'la voie I rejoint le CAN');
});

test('litCount croît avec u et ne dépasse pas le nombre de sommets', () => {
  let last = 0;
  for (let u = 0; u <= V.legs; u += 0.05) {
    const c = litCount(V, u);
    assert.ok(c >= last && c <= V.positions.length / 3);
    last = c;
  }
});

test('les listes d’arêtes sont des paires de sommets', () => {
  for (const list of [BOARD_EDGES, DECOR_EDGES, TRACE_EDGES, ...PARTS.flatMap((q) => [q.edges, q.halo])]) {
    assert.equal(list.length % 6, 0);
    assert.ok(list.every(Number.isFinite));
  }
  assert.equal(viaPositions().length % 3, 0);
});
