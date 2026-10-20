import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COLS, DIGITS, PATTERNS, PATTERN_LEN, SEG, applySwitches, collides, createGame, difficultyOf,
  display, down, leds, reset, start, tick, up,
} from '../src/scripts/fpga-game.ts';

const on = { sw0: true, sw1: false, sw2: false, sw3: true };

test('priorité SW2 > SW1 > SW0', () => {
  assert.equal(difficultyOf({ sw0: true, sw1: true, sw2: true, sw3: true }), 'hard');
  assert.equal(difficultyOf({ sw0: true, sw1: true, sw2: false, sw3: true }), 'medium');
  assert.equal(difficultyOf({ sw0: true, sw1: false, sw2: false, sw3: true }), 'easy');
  assert.equal(difficultyOf({ sw0: false, sw1: false, sw2: false, sw3: true }), null);
});

test('FSM : OFF -> MENU -> RUNNING -> OVER -> MENU', () => {
  const g = createGame();
  assert.equal(g.state, 'off');
  applySwitches(g, on);
  assert.equal(g.state, 'menu');
  start(g);
  assert.equal(g.state, 'running');
  g.cols[COLS - 2] = 2;
  g.birdUp = true;
  tick(g);
  assert.equal(g.state === 'over' || g.state === 'running', true);
  g.state = 'over';
  reset(g);
  assert.equal(g.state, 'menu');
  applySwitches(g, { ...on, sw3: false });
  assert.equal(g.state, 'off');
});

test('START sans difficulté est ignoré', () => {
  const g = createGame();
  applySwitches(g, { sw0: false, sw1: false, sw2: false, sw3: true });
  start(g);
  assert.equal(g.state, 'menu');
});

test('collision : même moitié que le mur', () => {
  const g = createGame();
  applySwitches(g, on);
  start(g);
  g.cols[COLS - 2] = 2;
  g.birdUp = true;
  assert.equal(collides(g), true);
  g.birdUp = false;
  assert.equal(collides(g), false);
  g.cols[COLS - 2] = 1;
  assert.equal(collides(g), true);
});

test('changer de moitié à temps évite le mur', () => {
  const g = createGame();
  applySwitches(g, on);
  start(g);
  g.cols[COLS - 3] = 2;
  down(g);
  tick(g);
  assert.equal(g.state, 'running');
  up(g);
  assert.equal(g.state, 'over');
});

test('les motifs font 30 colonnes, bouclent et ne bloquent jamais les deux moitiés', () => {
  for (const p of Object.values(PATTERNS)) {
    assert.equal(p.length, PATTERN_LEN);
    assert.ok(p.some((c) => c === 0));
  }
  const g = createGame();
  applySwitches(g, { ...on, sw2: true });
  start(g);
  for (let i = 0; i < PATTERN_LEN * 2; i++) {
    g.birdUp = g.cols[COLS - 3] !== 2;
    tick(g);
    if (g.state === 'over') break;
  }
  assert.ok(g.pos >= 0 && g.pos < PATTERN_LEN);
});

test('afficheurs : PLAY, LOOSER, oiseau sur HEX0', () => {
  const g = createGame();
  assert.deepEqual(display(g), new Array(DIGITS).fill(0));
  applySwitches(g, on);
  assert.equal(display(g)[1], SEG.a | SEG.b | SEG.e | SEG.f | SEG.g);
  start(g);
  assert.equal(display(g)[DIGITS - 1], SEG.a);
  g.birdUp = false;
  assert.equal(display(g)[DIGITS - 1], SEG.d);
  g.state = 'over';
  assert.equal(display(g)[0], SEG.d | SEG.e | SEG.f);
});

test('LED : indice 0 = LEDR9', () => {
  const g = createGame();
  applySwitches(g, on);
  const l = leds(g);
  assert.equal(l[1], true); // LEDR8 menu
  assert.equal(l[9], true); // LEDR0 facile
});
