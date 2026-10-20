/**
 * Modèle logiciel du jeu « Flappy Bird 7 segments » du projet VHDL (DE0-CV).
 * Il reprend la structure décrite dans le rapport : FSM à quatre états (OFF, MENU, RUNNING, GAME OVER),
 * registre à décalage de murs (2 bits par colonne, rotation circulaire), oiseau sur deux positions,
 * collision sur la colonne gauche du dernier afficheur, priorité SW2 > SW1 > SW0.
 * Les motifs de murs et les cadences sont des valeurs de démonstration : le rapport ne les donne pas.
 */

export type State = 'off' | 'menu' | 'running' | 'over';
export type Difficulty = 'easy' | 'medium' | 'hard';

/** Six afficheurs, deux colonnes de segments verticaux chacun. */
export const DIGITS = 6;
export const COLS = DIGITS * 2;

/** Segments d'un afficheur : bit 0 = a … bit 6 = g (1 = allumé). */
export const SEG = { a: 1, b: 2, c: 4, d: 8, e: 16, f: 32, g: 64 } as const;

/** Mur de la colonne : 0 libre, 1 mur bas, 2 mur haut (codage sur 2 bits comme dans le registre). */
export type Cell = 0 | 1 | 2;

/** Motifs de 30 colonnes (60 bits) : '.' libre, '^' mur haut, 'v' mur bas. */
const RUNS: Record<Difficulty, string> = {
  easy: '.....^^^....vvv.....^^^....vvv',
  medium: '....^^...vvv...^^..vv...^^^...',
  hard: '...^^..vv..^^..vv..^^..vv..^..',
};
export const PATTERN_LEN = 30;

export const PATTERNS: Record<Difficulty, Cell[]> = {
  easy: decode(RUNS.easy),
  medium: decode(RUNS.medium),
  hard: decode(RUNS.hard),
};

function decode(s: string): Cell[] {
  return [...s].map((c): Cell => (c === '^' ? 2 : c === 'v' ? 1 : 0));
}

/** Période du tick de défilement (ms) : plus la difficulté monte, plus ça va vite. */
export const TICK_MS: Record<Difficulty, number> = { easy: 480, medium: 330, hard: 220 };

export interface Switches {
  sw0: boolean;
  sw1: boolean;
  sw2: boolean;
  sw3: boolean;
}

export interface Game {
  state: State;
  /** Difficulté courante, ou null si aucun interrupteur de difficulté n'est actif. */
  difficulty: Difficulty | null;
  /** true = oiseau en haut (segment a), false = en bas (segment d). */
  birdUp: boolean;
  cols: Cell[];
  pos: number;
}

export function createGame(): Game {
  return { state: 'off', difficulty: null, birdUp: true, cols: new Array<Cell>(COLS).fill(0), pos: 0 };
}

/** Priorité SW2 > SW1 > SW0, comme Gestion_Switchs. */
export function difficultyOf(sw: Switches): Difficulty | null {
  if (sw.sw2) return 'hard';
  if (sw.sw1) return 'medium';
  if (sw.sw0) return 'easy';
  return null;
}

function clearField(g: Game): void {
  g.cols.fill(0);
  g.pos = 0;
  g.birdUp = true;
}

/** Applique l'état des interrupteurs (SW3 = alimentation, SW[2:0] = difficulté). */
export function applySwitches(g: Game, sw: Switches): void {
  const d = difficultyOf(sw);
  if (!sw.sw3) {
    g.state = 'off';
    g.difficulty = d;
    clearField(g);
    return;
  }
  if (g.state === 'off') {
    g.state = 'menu';
    clearField(g);
  }
  if (d !== g.difficulty) {
    g.difficulty = d;
    g.pos = 0; // le registre de murs est rechargé quand la difficulté change
  }
}

export function start(g: Game): void {
  if (g.state === 'menu' && g.difficulty) {
    g.state = 'running';
    clearField(g);
  }
}

export function reset(g: Game): void {
  if (g.state === 'off') return;
  g.state = 'menu';
  clearField(g);
}

export function up(g: Game): void {
  if (g.state === 'running') g.birdUp = true;
  checkCollision(g);
}

export function down(g: Game): void {
  if (g.state === 'running') g.birdUp = false;
  checkCollision(g);
}

/** Collision : l'oiseau et un mur occupent la même moitié de la colonne gauche du dernier afficheur. */
export function collides(g: Game): boolean {
  const wall = g.cols[COLS - 2] ?? 0;
  return g.birdUp ? wall === 2 : wall === 1;
}

function checkCollision(g: Game): void {
  if (g.state === 'running' && collides(g)) g.state = 'over';
}

/** Un tick de défilement : le registre avance d'une colonne (rotation circulaire du motif). */
export function tick(g: Game): void {
  if (g.state !== 'running' || !g.difficulty) return;
  const pattern = PATTERNS[g.difficulty];
  g.cols.pop();
  g.cols.unshift(pattern[g.pos % PATTERN_LEN] ?? 0);
  g.pos = (g.pos + 1) % PATTERN_LEN;
  checkCollision(g);
}

/** Motifs de texte sur afficheurs 7 segments. */
const GLYPH: Record<string, number> = {
  P: SEG.a | SEG.b | SEG.e | SEG.f | SEG.g,
  L: SEG.d | SEG.e | SEG.f,
  A: SEG.a | SEG.b | SEG.c | SEG.e | SEG.f | SEG.g,
  Y: SEG.b | SEG.c | SEG.d | SEG.f | SEG.g,
  O: SEG.a | SEG.b | SEG.c | SEG.d | SEG.e | SEG.f,
  S: SEG.a | SEG.c | SEG.d | SEG.f | SEG.g,
  E: SEG.a | SEG.d | SEG.e | SEG.f | SEG.g,
  R: SEG.e | SEG.g,
  ' ': 0,
};

function text(s: string): number[] {
  return [...s].map((c) => GLYPH[c] ?? 0);
}

/** Segments allumés de HEX5 (gauche) à HEX0 (droite). */
export function display(g: Game): number[] {
  if (g.state === 'off') return new Array<number>(DIGITS).fill(0);
  if (g.state === 'menu') return text(' PLAY ');
  if (g.state === 'over') return text('LOOSER');
  const out = new Array<number>(DIGITS).fill(0);
  for (let d = 0; d < DIGITS; d++) {
    const left = g.cols[2 * d] ?? 0;
    const right = g.cols[2 * d + 1] ?? 0;
    let m = 0;
    if (left === 2) m |= SEG.f;
    if (left === 1) m |= SEG.e;
    if (right === 2) m |= SEG.b;
    if (right === 1) m |= SEG.c;
    out[d] = m;
  }
  out[DIGITS - 1] = (out[DIGITS - 1] ?? 0) | (g.birdUp ? SEG.a : SEG.d);
  return out;
}

/** LEDR9…LEDR0 (indice 0 = LEDR9). */
export function leds(g: Game): boolean[] {
  const l = new Array<boolean>(10).fill(false);
  const set = (n: number, v: boolean): void => {
    l[9 - n] = v;
  };
  set(9, g.state === 'over');
  set(8, g.state === 'menu');
  // LEDR[7:6] : 00 OFF, 01 MENU, 10 RUNNING, 11 GAME OVER
  set(7, g.state === 'running' || g.state === 'over');
  set(6, g.state === 'menu' || g.state === 'over');
  if (g.state !== 'off') {
    set(0, g.difficulty === 'easy');
    set(1, g.difficulty === 'medium');
    set(2, g.difficulty === 'hard');
  }
  return l;
}
