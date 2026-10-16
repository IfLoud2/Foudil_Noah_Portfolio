/**
 * Démo « dans le LCR-mètre » : un modèle filaire de la carte (Three.js), un point rouge qui suit
 * le signal de la prise BNC jusqu'à la sortie, et un écran de type oscilloscope qui montre le signal
 * au point où se trouve le point rouge.
 *
 * Les signaux viennent de dsp.ts (Web Worker) : mêmes calculs qu'auparavant, nouvelle présentation.
 * La géométrie de la carte est dans pcb-layout.ts ; ici : scène, caméra, écran, interface.
 */
import {
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Group,
  Line,
  LineBasicMaterial,
  LineSegments,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  WebGLRenderer,
} from 'three';
import { AMP, FS, N, type AcquireRequest, type AcquireResult, type Dut } from './dsp.ts';
import {
  BOARD_EDGES,
  DECOR_EDGES,
  LEGS_I,
  LEGS_V,
  PARTS,
  STOPS,
  TRACE_EDGES,
  buildPath,
  litCount,
  pointAt,
  viaPositions,
} from './pcb-layout.ts';

interface Labels {
  stops: string[];
  captions: string[];
  dut: Record<Dut, string>;
  impedance: string;
  phase: string;
  value: Record<Dut, string>;
  play: string;
  pause: string;
}

const MINUS = '−';
const TAU = 2 * Math.PI;
const PREFIXES: ReadonlyArray<readonly [number, string]> = [
  [1e-12, 'p'],
  [1e-9, 'n'],
  [1e-6, 'µ'],
  [1e-3, 'm'],
  [1, ''],
  [1e3, 'k'],
  [1e6, 'M'],
];

// ---- chronologie : durée d'attente à chaque arrêt, puis trajet vers le suivant ----
const DWELL_MS = [1900, 2100, 2300, 2300, 2500, 3600] as const;
const TRAVEL_MS = [800, 850, 900, 0, 800, 0] as const;
const SLOTS = (() => {
  let start = 0;
  return DWELL_MS.map((dwell, i) => {
    const travel = TRAVEL_MS[i] ?? 0;
    const slot = { start, dwell, travel };
    start += dwell + travel;
    return slot;
  });
})();
const TOTAL_MS = SLOTS.reduce((sum, s) => sum + s.dwell + s.travel, 0);

interface Where {
  stop: number;
  /** Avancement dans l'arrêt, 0 à 1. */
  s: number;
  /** Avancement du trajet vers l'arrêt suivant, 0 à 1. */
  travel: number;
}

function locate(t: number): Where {
  for (let i = 0; i < SLOTS.length; i++) {
    const slot = SLOTS[i];
    if (!slot) continue;
    if (t < slot.start + slot.dwell) return { stop: i, s: Math.max(0, (t - slot.start) / slot.dwell), travel: 0 };
    if (t < slot.start + slot.dwell + slot.travel) {
      return { stop: i, s: 1, travel: (t - slot.start - slot.dwell) / slot.travel };
    }
  }
  return { stop: STOPS - 1, s: 1, travel: 0 };
}

function must<T extends Element>(root: ParentNode, selector: string): T {
  const el = root.querySelector<T>(selector);
  if (!el) throw new Error(`bench: élément manquant ${selector}`);
  return el;
}

const clamp01 = (x: number): number => Math.min(Math.max(x, 0), 1);
const sliderToFreq = (x: number): number => 100 * 200 ** (x / 100);
const toDut = (v: string): Dut => (v === 'R' || v === 'L' ? v : 'C');
const unitOf = (d: Dut): string => (d === 'R' ? 'Ω' : d === 'C' ? 'F' : 'H');
const deg = (rad: number): number => (rad * 180) / Math.PI;
const wrap = (rad: number): number => Math.atan2(Math.sin(rad), Math.cos(rad));

function derive(dut: Dut, omega: number, re: number, im: number): number {
  switch (dut) {
    case 'R':
      return re;
    case 'C':
      return im < 0 ? -1 / (omega * im) : NaN;
    case 'L':
      return im / omega;
  }
}

function dotTexture(): CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 32;
  c.height = 32;
  const g = c.getContext('2d');
  if (g) {
    g.beginPath();
    g.arc(16, 16, 15, 0, TAU);
    g.fillStyle = '#ffffff';
    g.fill();
  }
  return new CanvasTexture(c);
}

const lineMaterial = (color: number, opacity: number): LineBasicMaterial =>
  new LineBasicMaterial({ color, transparent: true, opacity });

function segments(edges: number[], material: LineBasicMaterial): LineSegments {
  const geo = new BufferGeometry();
  geo.setAttribute('position', new BufferAttribute(new Float32Array(edges), 3));
  const obj = new LineSegments(geo, material);
  obj.frustumCulled = false;
  return obj;
}

export function startBench(root: HTMLElement): void {
  const lang = document.documentElement.lang || 'en';
  const nf = (digits: number) => new Intl.NumberFormat(lang, { maximumSignificantDigits: digits });
  const num = (x: number, digits = 4): string => nf(digits).format(x).replace('-', MINUS);
  const eng = (x: number, unit: string, digits = 4): string => {
    if (!Number.isFinite(x)) return '–';
    if (Math.abs(x) < 1e-15) return `0 ${unit}`;
    const a = Math.abs(x);
    let pick = PREFIXES[0] ?? [1, ''];
    for (const q of PREFIXES) if (a >= q[0] * 0.99995) pick = q;
    return `${num(x / pick[0], digits)} ${pick[1]}${unit}`;
  };
  const fmt = (template: string, vars: Record<string, string>): string =>
    template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? '');

  const labels = JSON.parse(must<HTMLScriptElement>(root, 'script[data-bench-labels]').textContent ?? '{}') as Labels;

  const host = must<HTMLElement>(root, '[data-pcb]');
  const scopeCv = must<HTMLCanvasElement>(root, 'canvas[data-scope-cv]');
  const dutSel = must<HTMLSelectElement>(root, 'select[name="dut"]');
  const freqEl = must<HTMLInputElement>(root, 'input[name="freq"]');
  const playBtn = must<HTMLButtonElement>(root, 'button[data-play]');
  const readout = must<HTMLElement>(root, '.readout');
  const stageEl = must<HTMLElement>(root, '[data-scope="stage"]');
  const captionEl = must<HTMLElement>(root, '[data-scope="caption"]');
  const stopBtns = [...root.querySelectorAll<HTMLButtonElement>('button[data-stop]')];
  const cells = new Map<string, HTMLElement>();
  root.querySelectorAll<HTMLElement>('[data-out]').forEach((el) => {
    const key = el.dataset['out'];
    if (key) cells.set(key, el);
  });
  const put = (key: string, text: string): void => {
    const el = cells.get(key);
    if (el) el.textContent = text;
  };

  const css = getComputedStyle(root);
  const color = (name: string): string => css.getPropertyValue(name).trim();
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- scène Three.js ----------
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch {
    root.classList.add('is-static');
    return;
  }
  renderer.setClearColor(0x000000, 0);
  host.appendChild(renderer.domElement);

  const scene = new Scene();
  const camera = new PerspectiveCamera(40, 1, 0.1, 80);
  const board = new Group();
  scene.add(board);

  board.add(segments(BOARD_EDGES, lineMaterial(0x3b4a86, 0.95)));
  board.add(segments(TRACE_EDGES, lineMaterial(0x3b4a86, 0.8)));
  board.add(segments(DECOR_EDGES, lineMaterial(0x4a5a9e, 0.6)));

  const viaGeo = new BufferGeometry();
  const vias = viaPositions();
  viaGeo.setAttribute('position', new BufferAttribute(vias, 3));
  const viaCol = new Float32Array(vias.length);
  for (let i = 0; i < viaCol.length; i += 3) {
    viaCol[i] = 0.2;
    viaCol[i + 1] = 0.27;
    viaCol[i + 2] = 0.5;
  }
  viaGeo.setAttribute('color', new BufferAttribute(viaCol, 3));
  const viaPts = new Points(
    viaGeo,
    new PointsMaterial({ size: 2, sizeAttenuation: false, vertexColors: true, map: dotTexture(), alphaTest: 0.4 }),
  );
  viaPts.frustumCulled = false;
  board.add(viaPts);

  const parts = PARTS.map((part) => {
    const mat = lineMaterial(0x9aa4c8, 0.55);
    const halo = lineMaterial(0x19e6ff, 0);
    board.add(segments(part.edges, mat));
    board.add(segments(part.halo, halo));
    return { stops: part.stops, mat, halo };
  });

  // Chemin du signal : tracé sombre, partie parcourue en rouge.
  const pathV = buildPath(LEGS_V);
  const pathI = buildPath(LEGS_I);
  const makeLine = (path: { positions: Float32Array }, material: LineBasicMaterial): { geo: BufferGeometry } => {
    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(path.positions, 3));
    const line = new Line(geo, material);
    line.frustumCulled = false;
    board.add(line);
    return { geo };
  };
  makeLine(pathV, lineMaterial(0x6f86e0, 0.95));
  makeLine(pathI, lineMaterial(0x6f86e0, 0.95));
  const litV = makeLine(pathV, lineMaterial(0xff3040, 0.95)).geo;
  const litI = makeLine(pathI, lineMaterial(0xff3040, 0.95)).geo;
  litV.setDrawRange(0, 0);
  litI.setDrawRange(0, 0);

  const RED: [number, number, number] = [1, 0.18, 0.25];
  const makeDot = (size: number, opacity: number, alphaTest: number): { geo: BufferGeometry; pos: BufferAttribute } => {
    const geo = new BufferGeometry();
    const pos = new BufferAttribute(new Float32Array(3), 3);
    geo.setAttribute('position', pos);
    geo.setAttribute('color', new BufferAttribute(new Float32Array(RED), 3));
    const pts = new Points(
      geo,
      new PointsMaterial({
        size,
        sizeAttenuation: false,
        vertexColors: true,
        map: dotTexture(),
        transparent: true,
        opacity,
        alphaTest,
        depthTest: false,
        depthWrite: false,
      }),
    );
    pts.frustumCulled = false;
    board.add(pts);
    return { geo, pos };
  };
  const haloV = makeDot(38, 0.28, 0);
  const dotV = makeDot(15, 1, 0.4);
  const haloI = makeDot(30, 0.22, 0);
  const dotI = makeDot(11, 1, 0.4);

  // Vue orbitale : glisser ou flèches. Avant la première interaction, un très léger balancement.
  const view = { az: -0.3, el: 0.74, drag: false, touched: false, lx: 0, ly: 0 };
  const EL_MIN = 0.12;
  const EL_MAX = 1.5;
  const SWAY = 0.09;
  const clampEl = (v: number): number => Math.min(Math.max(v, EL_MIN), EL_MAX);

  function resize(): void {
    const w = host.clientWidth;
    const h = host.clientHeight;
    if (w === 0 || h === 0) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function render(now: number): void {
    const sway = view.touched || reduced ? 0 : Math.sin(now / 3800) * SWAY;
    const az = view.az + sway;
    const dist = Math.max(11.2, 7.1 / (0.364 * camera.aspect));
    camera.position.set(
      Math.cos(view.el) * Math.sin(az) * dist,
      Math.sin(view.el) * dist,
      Math.cos(view.el) * Math.cos(az) * dist,
    );
    camera.lookAt(0, 0.2, 0.3);
    renderer.render(scene, camera);
  }

  const nudge = (daz: number, del: number): void => {
    view.touched = true;
    view.az += daz;
    view.el = clampEl(view.el + del);
    frame(performance.now());
  };
  host.addEventListener('pointerdown', (e: PointerEvent) => {
    if (e.button !== 0) return;
    view.drag = true;
    view.touched = true;
    view.lx = e.clientX;
    view.ly = e.clientY;
    host.setPointerCapture(e.pointerId);
    host.classList.add('is-dragging');
    if (e.pointerType === 'mouse') e.preventDefault();
  });
  host.addEventListener('pointermove', (e: PointerEvent) => {
    if (!view.drag) return;
    view.az -= (e.clientX - view.lx) * 0.0065;
    view.el = clampEl(view.el + (e.clientY - view.ly) * 0.0055);
    view.lx = e.clientX;
    view.ly = e.clientY;
    frame(performance.now());
  });
  const release = (e: PointerEvent): void => {
    if (!view.drag) return;
    view.drag = false;
    host.classList.remove('is-dragging');
    if (host.hasPointerCapture(e.pointerId)) host.releasePointerCapture(e.pointerId);
  };
  host.addEventListener('pointerup', release);
  host.addEventListener('pointercancel', release);
  host.addEventListener('keydown', (e: KeyboardEvent) => {
    const step = e.shiftKey ? 0.35 : 0.12;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const m = moves[e.key];
    if (!m) return;
    e.preventDefault();
    nudge(m[0], m[1]);
  });

  // ---------- acquisition (Web Worker) ----------
  const worker = new Worker(new URL('./bench.worker.ts', import.meta.url), { type: 'module' });
  let seq = 0;
  let sent: AcquireRequest | null = null;
  let inflight = false;
  let again = false;
  let applyNow = true;
  let announceNext = false;
  let req: AcquireRequest | null = null;
  let res: AcquireResult | null = null;
  let next: { r: AcquireRequest; a: AcquireResult } | null = null;

  function readRequest(): AcquireRequest {
    return {
      id: ++seq,
      dut: toDut(dutSel.value),
      freq: sliderToFreq(Number(freqEl.value)),
      snrDb: 70,
      bits: 12,
      multiplexed: true,
      compensate: true,
      seed: (Math.random() * 4294967296) >>> 0,
    };
  }

  function request(): void {
    if (inflight) {
      again = true;
      return;
    }
    inflight = true;
    sent = readRequest();
    worker.postMessage(sent);
  }

  worker.onmessage = (event: MessageEvent<AcquireResult>) => {
    inflight = false;
    if (sent) {
      if (applyNow || !res) {
        applyNow = false;
        use(sent, event.data);
      } else {
        next = { r: sent, a: event.data };
      }
    }
    if (again) {
      again = false;
      request();
    }
  };

  function use(r: AcquireRequest, a: AcquireResult): void {
    req = r;
    res = a;
    fillReadout(r, a);
    lastKey = '';
    frame(performance.now());
  }

  function fillReadout(r: AcquireRequest, a: AcquireResult): void {
    const omega = TAU * a.freq;
    const magM = Math.hypot(a.zRe, a.zIm);
    const phM = deg(Math.atan2(a.zIm, a.zRe));
    put('freq', eng(a.freq, 'Hz'));
    put('z', eng(magM, 'Ω'));
    put('theta', `${num(phM, 5)} °`);
    put('val-label', labels.value[r.dut]);
    put('val', eng(derive(r.dut, omega, a.zRe, a.zIm), unitOf(r.dut)));
    put('rep', `σ|Z| ${num(a.sigmaMag * 100, 3)} %  ·  σθ ${num(a.sigmaPhase, 3)} °`);
    if (announceNext) {
      announceNext = false;
      put('sr', `${labels.dut[r.dut]}, ${eng(a.freq, 'Hz')}: ${labels.impedance} = ${eng(magM, 'Ω')}, ${labels.phase} = ${num(phM, 4)} °`);
    }
  }

  // ---------- écran d'oscilloscope ----------
  function prep(canvas: HTMLCanvasElement): { ctx: CanvasRenderingContext2D; w: number; h: number } | null {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w === 0 || h === 0) return null;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.font = `11px ${color('--mono') || 'monospace'}`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    return { ctx, w, h };
  }

  type Ctx = CanvasRenderingContext2D;

  function graticule(ctx: Ctx, w: number, h: number): void {
    ctx.fillStyle = color('--scope');
    ctx.fillRect(0, 0, w, h);
    ctx.save();
    ctx.strokeStyle = color('--line');
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    for (let i = 1; i < 10; i++) {
      const x = Math.round((i * w) / 10) + 0.5;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    for (let j = 1; j < 8; j++) {
      const y = Math.round((j * h) / 8) + 0.5;
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = color('--line-hi');
    ctx.beginPath();
    ctx.moveTo(0, Math.round(h / 2) + 0.5);
    ctx.lineTo(w, Math.round(h / 2) + 0.5);
    ctx.moveTo(Math.round(w / 2) + 0.5, 0);
    ctx.lineTo(Math.round(w / 2) + 0.5, h);
    // Graduations fines sur les deux axes centraux.
    for (let i = 0; i <= 50; i++) {
      const x = Math.round((i * w) / 50) + 0.5;
      ctx.moveTo(x, h / 2 - 3);
      ctx.lineTo(x, h / 2 + 3);
    }
    for (let j = 0; j <= 40; j++) {
      const y = Math.round((j * h) / 40) + 0.5;
      ctx.moveTo(w / 2 - 3, y);
      ctx.lineTo(w / 2 + 3, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  /** Trace lumineuse : un halo large et faible, puis le trait net. */
  function glow(ctx: Ctx, stroke: string, draw: () => void): void {
    ctx.save();
    ctx.strokeStyle = stroke;
    ctx.shadowColor = stroke;
    ctx.shadowBlur = 8;
    ctx.lineWidth = 1.8;
    draw();
    ctx.restore();
  }

  function beam(ctx: Ctx, x: number, y: number, stroke: string): void {
    ctx.save();
    ctx.fillStyle = stroke;
    ctx.shadowColor = stroke;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(x, y, 3.2, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  function dashed(ctx: Ctx, x: number, y0: number, y1: number, stroke: string): void {
    ctx.save();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(Math.round(x) + 0.5, y0);
    ctx.lineTo(Math.round(x) + 0.5, y1);
    ctx.stroke();
    ctx.restore();
  }

  function arrow(ctx: Ctx, x0: number, y0: number, x1: number, y1: number, stroke: string): void {
    ctx.save();
    ctx.strokeStyle = stroke;
    ctx.fillStyle = stroke;
    ctx.shadowColor = stroke;
    ctx.shadowBlur = 8;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    const a = Math.atan2(y1 - y0, x1 - x0);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 - 9 * Math.cos(a - 0.4), y1 - 9 * Math.sin(a - 0.4));
    ctx.lineTo(x1 - 9 * Math.cos(a + 0.4), y1 - 9 * Math.sin(a + 0.4));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  const label = (ctx: Ctx, text: string, x: number, y: number, fill: string, align: CanvasTextAlign = 'left'): void => {
    ctx.fillStyle = fill;
    ctx.textAlign = align;
    ctx.fillText(text, x, y);
    ctx.textAlign = 'left';
  };

  const legend = (ctx: Ctx, showI: boolean): void => {
    label(ctx, 'CH1 V', 10, 14, color('--cyan'));
    if (showI) label(ctx, 'CH2 I', 62, 14, color('--magenta'));
  };

  /** Étages 0 et 1 : sinusoïdes analogiques ; au 2e, le décalage entre V et I. */
  function paintSines(ctx: Ctx, w: number, h: number, a: AcquireResult, s: number, showI: boolean): void {
    legend(ctx, showI);
    const omega = TAU * a.freq;
    const span = 3 / a.freq;
    const y = (v: number): number => h / 2 - (v / AMP) * 0.78 * (h / 2);
    const steps = Math.max(8, Math.round(w / 2));
    const last = Math.round(steps * s);
    const curve = (shift: number, stroke: string): void => {
      glow(ctx, stroke, () => {
        ctx.beginPath();
        for (let q = 0; q <= last; q++) {
          const py = y(AMP * Math.sin(omega * ((q / steps) * span) + a.phi0 - shift));
          if (q === 0) ctx.moveTo(0, py);
          else ctx.lineTo((q / steps) * w, py);
        }
        ctx.stroke();
      });
      if (s < 1) beam(ctx, (last / steps) * w, y(AMP * Math.sin(omega * ((last / steps) * span) + a.phi0 - shift)), stroke);
    };
    curve(0, color('--cyan'));
    if (showI) curve(a.theta, color('--magenta'));
    label(ctx, `${eng(span / 10, 's', 2)}/div`, 10, h - 12, color('--ink-2'));

    const alpha = showI ? clamp01((s - 0.55) / 0.25) : 0;
    if (alpha > 0) {
      const m = Math.ceil((omega * (span / 3) + a.phi0) / TAU);
      const tV = (TAU * m - a.phi0) / omega;
      const tI = tV + a.theta / omega;
      const xV = (tV / span) * w;
      const xI = (tI / span) * w;
      ctx.save();
      ctx.globalAlpha = alpha;
      dashed(ctx, xV, 0, h - 26, color('--cyan'));
      dashed(ctx, xI, 0, h - 26, color('--magenta'));
      const yb = h - 34;
      if (Math.abs(xV - xI) > 3) {
        ctx.strokeStyle = color('--ink');
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(Math.min(xV, xI), yb);
        ctx.lineTo(Math.max(xV, xI), yb);
        ctx.stroke();
      }
      label(ctx, 'Δt', Math.max(xV, xI) + 6, yb - 8, color('--ink'));
      ctx.restore();
    }
  }

  /** Étage 2 : échantillons de V et I, datés, sur le signal analogique en filigrane. */
  function paintSamples(ctx: Ctx, w: number, h: number, a: AcquireResult, s: number): void {
    legend(ctx, true);
    const count = Math.min(N, Math.round((3 * N) / a.bin));
    const y = (v: number): number => h / 2 - (v / AMP) * 0.78 * (h / 2);
    const omega = TAU * a.freq;
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 1;
    for (const [shift, stroke] of [
      [0, color('--cyan')],
      [a.theta, color('--magenta')],
    ] as const) {
      ctx.beginPath();
      const steps = Math.max(8, Math.round(w / 2));
      for (let q = 0; q <= steps; q++) {
        const py = y(AMP * Math.sin(omega * (((q / steps) * count) / FS) + a.phi0 - shift));
        if (q === 0) ctx.moveTo(0, py);
        else ctx.lineTo((q / steps) * w, py);
      }
      ctx.strokeStyle = stroke;
      ctx.stroke();
    }
    ctx.restore();

    const stride = Math.max(1, Math.ceil(count / 90));
    const lastN = Math.floor(count * s);
    const mid = h / 2;
    for (let n = 0; n < lastN; n += stride) {
      const x = ((n + 0.5) / count) * w;
      for (const [arr, stroke] of [
        [a.v, color('--cyan')],
        [a.i, color('--magenta')],
      ] as const) {
        const py = y(arr[n] ?? 0);
        ctx.strokeStyle = stroke;
        ctx.globalAlpha = 0.45;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, mid);
        ctx.lineTo(x, py);
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.fillStyle = stroke;
        ctx.beginPath();
        ctx.arc(x, py, 2.1, 0, TAU);
        ctx.fill();
      }
    }
    if (s < 1) dashed(ctx, (lastN / count) * w, 0, h - 26, color('--ink-2'));
    label(ctx, `${eng(count / FS / 10, 's', 2)}/div`, 10, h - 12, color('--ink-2'));
    label(ctx, `Ts ${eng(1 / FS, 's', 2)}`, w - 10, h - 12, color('--ink-2'), 'right');
  }

  /** Étage 3 : les deux tampons de N échantillons dans la mémoire du MCU. */
  function paintBuffer(ctx: Ctx, w: number, h: number, a: AcquireResult, s: number): void {
    const M = Math.min(N, Math.round((4 * N) / a.bin));
    const lane = (h - 30) / 2;
    const filled = Math.floor(w * s);
    const lanes: ReadonlyArray<readonly [Float32Array, string, string, number]> = [
      [a.v, color('--cyan'), 'V[n]', 0],
      [a.i, color('--magenta'), 'I[n]', 1],
    ];
    for (const [arr, stroke, name, k] of lanes) {
      const cy = 18 + lane * k + lane / 2;
      label(ctx, name, 10, cy - lane / 2 + 4, stroke);
      glow(ctx, stroke, () => {
        ctx.beginPath();
        for (let x = 0; x <= filled; x++) {
          const idx = Math.min(M - 1, Math.floor((x / w) * M));
          const py = cy - ((arr[idx] ?? 0) / AMP) * lane * 0.42;
          if (x === 0) ctx.moveTo(x, py);
          else ctx.lineTo(x, py);
        }
        ctx.stroke();
      });
    }
    if (s < 1) dashed(ctx, filled, 0, h - 26, color('--ink'));
    const yb = h - 14;
    ctx.strokeStyle = color('--line-hi');
    ctx.lineWidth = 1;
    ctx.strokeRect(10.5, yb - 3.5, w - 21, 7);
    ctx.fillStyle = color('--accent');
    ctx.fillRect(11, yb - 3, Math.max(0, s * (w - 22)), 6);
    label(ctx, `n = ${Math.round(s * N)} / ${N}`, w - 10, 14, color('--ink-2'), 'right');
  }

  /** Étage 4 : spectre de V ; la DFT lit le bin de la fréquence d'excitation. */
  function paintSpectrum(ctx: Ctx, w: number, h: number, a: AcquireResult, s: number): void {
    label(ctx, '0 dBFS', 10, 14, color('--ink-2'));
    label(ctx, `${eng(FS / 2, 'Hz', 3)}  |  ${MINUS}140 dBFS`, w - 10, 14, color('--ink-2'), 'right');
    const bins = a.spectrum.length;
    const upTo = Math.max(2, Math.floor(bins * s));
    const px = (b: number): number => (b / (bins - 1)) * w;
    const py = (db: number): number => Math.min(Math.max(-db / 140, 0), 1) * (h - 4) + 2;
    ctx.beginPath();
    ctx.moveTo(px(1), h);
    for (let b = 1; b < upTo; b++) ctx.lineTo(px(b), py(a.spectrum[b] ?? -140));
    ctx.lineTo(px(upTo - 1), h);
    ctx.closePath();
    ctx.fillStyle = color('--cyan');
    ctx.globalAlpha = 0.14;
    ctx.fill();
    ctx.globalAlpha = 1;
    glow(ctx, color('--cyan'), () => {
      ctx.beginPath();
      for (let b = 1; b < upTo; b++) {
        if (b === 1) ctx.moveTo(px(b), py(a.spectrum[b] ?? -140));
        else ctx.lineTo(px(b), py(a.spectrum[b] ?? -140));
      }
      ctx.stroke();
    });
    if (upTo > a.bin) {
      const mx = px(a.bin);
      const my = py(a.spectrum[a.bin] ?? -140);
      dashed(ctx, mx, my, h, color('--magenta'));
      beam(ctx, mx, my, color('--magenta'));
      label(ctx, `k = ${a.bin}`, Math.min(mx + 10, w - 56), Math.max(my, 30), color('--ink'));
    }
  }

  /** Étage 5 : les phaseurs V et I issus de la DFT, et l'angle θ entre eux. */
  function paintPhasors(ctx: Ctx, w: number, h: number, a: AcquireResult, s: number): void {
    const cx = w / 2;
    const cy = h / 2;
    const R = Math.min(w, h) / 2 - 18;
    ctx.save();
    ctx.strokeStyle = color('--line-hi');
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.arc(cx, cy, R * 0.92, 0, TAU);
    ctx.stroke();
    ctx.restore();
    label(ctx, 'Re', cx + R * 0.92 + 8, cy + 12, color('--ink-2'));
    label(ctx, 'Im', cx - 26, cy - R * 0.92 + 2, color('--ink-2'));
    const grow = clamp01(s * 1.6);
    const phiV = Math.atan2(a.vIm, a.vRe);
    const phiI = Math.atan2(a.iIm, a.iRe);
    const lenV = R * 0.92 * (Math.hypot(a.vRe, a.vIm) / AMP) * grow;
    const lenI = R * 0.92 * (Math.hypot(a.iRe, a.iIm) / AMP) * grow;
    const tip = (len: number, phi: number): [number, number] => [cx + len * Math.cos(phi), cy - len * Math.sin(phi)];
    const arcAlpha = clamp01((s - 0.55) / 0.3);
    if (arcAlpha > 0) {
      const th = wrap(phiV - phiI);
      ctx.save();
      ctx.globalAlpha = arcAlpha;
      ctx.strokeStyle = color('--ink');
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 0.42, -phiI, -phiV, th > 0);
      ctx.stroke();
      const mid = phiI + th / 2;
      ctx.textAlign = 'center';
      ctx.fillStyle = color('--ink');
      ctx.fillText('θ', cx + R * 0.6 * Math.cos(mid), cy - R * 0.6 * Math.sin(mid));
      ctx.restore();
    }
    const [ix, iy] = tip(lenI, phiI);
    const [vx, vy] = tip(lenV, phiV);
    arrow(ctx, cx, cy, ix, iy, color('--magenta'));
    arrow(ctx, cx, cy, vx, vy, color('--cyan'));
    label(ctx, 'I', ix + 6 * Math.cos(phiI) + 3, iy - 6 * Math.sin(phiI), color('--magenta'));
    label(ctx, 'V', vx + 6 * Math.cos(phiV) + 3, vy - 6 * Math.sin(phiV), color('--cyan'));
  }

  function paintScope(stop: number, s: number): void {
    const c = prep(scopeCv);
    if (!c) return;
    const { ctx, w, h } = c;
    graticule(ctx, w, h);
    if (!res) return;
    switch (stop) {
      case 0:
        paintSines(ctx, w, h, res, s, false);
        break;
      case 1:
        paintSines(ctx, w, h, res, s, true);
        break;
      case 2:
        paintSamples(ctx, w, h, res, s);
        break;
      case 3:
        paintBuffer(ctx, w, h, res, s);
        break;
      case 4:
        paintSpectrum(ctx, w, h, res, s);
        break;
      default:
        paintPhasors(ctx, w, h, res, s);
    }
  }

  function caption(stop: number): string {
    if (!res || !req) return '';
    const template = labels.captions[stop] ?? '';
    const lsbBits = String(req.bits);
    return fmt(template, {
      f: eng(res.freq, 'Hz', 4),
      dt: eng(Math.abs(res.theta) / (TAU * res.freq), 's', 3),
      fs: eng(FS, 'S/s', 3),
      bits: lsbBits,
      n: String(N),
      k: String(res.bin),
      z: eng(Math.hypot(res.zRe, res.zIm), 'Ω'),
      theta: num(deg(Math.atan2(res.zIm, res.zRe)), 4),
    });
  }

  // ---------- boucle ----------
  let t = reduced ? (SLOTS[STOPS - 1]?.start ?? 0) + (SLOTS[STOPS - 1]?.dwell ?? 0) - 0.01 : 0;
  let playing = !reduced;
  let visible = true;
  let raf = 0;
  let prev = 0;
  let lastKey = '';
  let shownStop = -1;

  function frame(now: number): void {
    const wh = locate(t);
    const { stop, s, travel } = wh;

    // 3D : position du point et partie du chemin déjà parcourue.
    const u = stop >= STOPS - 1 ? STOPS - 1 : stop + travel;
    let pt = pointAt(pathV, u);
    if (stop === 4 && travel === 0) {
      const a = s * TAU * 2;
      pt = { x: pt.x + Math.cos(a) * 0.55, y: pt.y, z: pt.z + Math.sin(a) * 0.45 };
    }
    for (const d of [dotV, haloV]) {
      d.pos.setXYZ(0, pt.x, pt.y + 0.05, pt.z);
      d.pos.needsUpdate = true;
    }
    litV.setDrawRange(0, litCount(pathV, u));
    const iOn = u <= 2.0001;
    const ip = pointAt(pathI, Math.min(u, 2));
    for (const d of [dotI, haloI]) {
      d.geo.setDrawRange(0, iOn ? 1 : 0);
      d.pos.setXYZ(0, ip.x, ip.y + 0.05, ip.z);
      d.pos.needsUpdate = true;
    }
    litI.setDrawRange(0, litCount(pathI, Math.min(u, 2)));
    for (const part of parts) {
      const on = travel === 0 && part.stops.includes(stop);
      part.mat.opacity = on ? 1 : 0.55;
      part.halo.opacity = on ? 0.9 : 0;
    }
    render(now);

    // Écran, légende et pastilles.
    if (stop !== shownStop) {
      shownStop = stop;
      stageEl.textContent = labels.stops[stop] ?? '';
      captionEl.textContent = caption(stop);
      stopBtns.forEach((btn, i) => {
        if (i === stop) btn.setAttribute('aria-current', 'step');
        else btn.removeAttribute('aria-current');
      });
    }
    const key = `${stop}:${travel > 0 ? 1 : s.toFixed(3)}:${res ? res.id : 0}`;
    if (key !== lastKey) {
      lastKey = key;
      captionEl.textContent = caption(stop);
      paintScope(stop, travel > 0 ? 1 : s);
    }
    const ready = stop === STOPS - 1 && s >= 0.35;
    readout.dataset['ready'] = ready ? 'true' : 'false';
  }

  function tick(now: number): void {
    raf = requestAnimationFrame(tick);
    const dt = Math.min(now - prev, 80);
    prev = now;
    t += dt;
    if (t >= TOTAL_MS) {
      t = 0;
      if (next) {
        use(next.r, next.a);
        next = null;
      }
      request();
    }
    frame(now);
  }

  function sync(): void {
    const should = playing && visible && !document.hidden;
    if (should && raf === 0) {
      prev = performance.now();
      raf = requestAnimationFrame(tick);
    } else if (!should && raf !== 0) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  }

  function setPlaying(on: boolean): void {
    playing = on;
    playBtn.textContent = on ? labels.pause : labels.play;
    playBtn.setAttribute('aria-pressed', String(on));
    sync();
    frame(performance.now());
  }

  playBtn.addEventListener('click', () => {
    if (!playing && t >= (SLOTS[STOPS - 1]?.start ?? 0)) t = 0;
    setPlaying(!playing);
  });
  stopBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const i = Number(btn.dataset['stop']);
      const slot = SLOTS[i];
      if (!slot) return;
      t = slot.start + slot.dwell - 0.01;
      lastKey = '';
      setPlaying(false);
    });
  });
  root.addEventListener('input', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) return;
    put('freq', eng(sliderToFreq(Number(freqEl.value)), 'Hz'));
    applyNow = true;
    announceNext = true;
    next = null;
    if (playing) t = 0;
    request();
  });

  const ro = new ResizeObserver(() => {
    resize();
    lastKey = '';
    frame(performance.now());
  });
  ro.observe(host);
  ro.observe(scopeCv);
  new IntersectionObserver((entries) => {
    visible = entries.some((e) => e.isIntersecting);
    sync();
  }).observe(root);
  document.addEventListener('visibilitychange', sync);

  playBtn.textContent = playing ? labels.pause : labels.play;
  playBtn.setAttribute('aria-pressed', String(playing));
  put('freq', eng(sliderToFreq(Number(freqEl.value)), 'Hz'));
  resize();
  request();
  frame(performance.now());
  sync();
}
