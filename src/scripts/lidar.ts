/**
 * Rendu Three.js de la carte pseudo-3D : un LiDAR 2D synthétique, embarqué sur un drone
 * dont l'altitude varie, accumule ses retours dans un tampon circulaire.
 * La simulation vit dans lidar-sim.ts ; ici : scène, caméra, boucle de rendu, HUD.
 */
import {
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Group,
  Line,
  LineBasicMaterial,
  LineLoop,
  LineSegments,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  WebGLRenderer,
} from 'three';
import { onThemeChange, themedMaterials } from './theme.ts';
import { BEAMS_PER_REV, BEAMS_PER_SECOND, ROOM_D, ROOM_H, ROOM_W, Scanner } from './lidar-sim.ts';

const CAPACITY = 36000;
/** Distance d'affichage de l'anneau de scan pour un faisceau sans retour (la porte). */
const MISS_RANGE = 3.4;

function dotTexture(): CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 32;
  c.height = 32;
  const g = c.getContext('2d');
  if (g) {
    g.beginPath();
    g.arc(16, 16, 15, 0, Math.PI * 2);
    g.fillStyle = '#ffffff';
    g.fill();
  }
  return new CanvasTexture(c);
}

function lineMaterial(color: number, opacity: number): LineBasicMaterial {
  return new LineBasicMaterial({ color, transparent: true, opacity });
}

const themed = themedMaterials();
const tLine = (dark: number, light: number, opacity: number): LineBasicMaterial =>
  themed.add(lineMaterial(dark, opacity), dark, light);

/** Sol quadrillé (1 m), arêtes du plafond et montants : le volume de la pièce, très discret. */
function roomFrame(): Group {
  const hw = ROOM_W / 2;
  const hd = ROOM_D / 2;
  const grid: number[] = [];
  for (let x = -hw; x <= hw; x++) grid.push(x, 0, -hd, x, 0, hd);
  for (let z = -hd; z <= hd; z++) grid.push(-hw, 0, z, hw, 0, z);
  const floor = new BufferGeometry();
  floor.setAttribute('position', new BufferAttribute(new Float32Array(grid), 3));

  const ceil = new BufferGeometry();
  ceil.setAttribute(
    'position',
    new BufferAttribute(new Float32Array([-hw, ROOM_H, -hd, hw, ROOM_H, -hd, hw, ROOM_H, hd, -hw, ROOM_H, hd]), 3),
  );

  const posts = new BufferGeometry();
  const p: number[] = [];
  for (const [x, z] of [
    [-hw, -hd],
    [hw, -hd],
    [hw, hd],
    [-hw, hd],
  ] as const) {
    p.push(x, 0, z, x, ROOM_H, z);
  }
  posts.setAttribute('position', new BufferAttribute(new Float32Array(p), 3));

  const group = new Group();
  group.add(new LineSegments(floor, tLine(0x2a3346, 0x9099ab, 0.7)));
  group.add(new LineLoop(ceil, tLine(0x2a3346, 0x9099ab, 0.55)));
  group.add(new LineSegments(posts, tLine(0x2a3346, 0x9099ab, 0.55)));
  return group;
}

export function startLidar(root: HTMLElement): void {
  const found = root.querySelector<HTMLElement>('[data-lidar-canvas]');
  if (!found) return;
  const host: HTMLElement = found;
  const lang = document.documentElement.lang || 'en';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
  const camera = new PerspectiveCamera(42, 1, 0.1, 60);
  const scanner = new Scanner(CAPACITY);

  // Nuage de points
  const cloudGeo = new BufferGeometry();
  const posAttr = new BufferAttribute(scanner.positions, 3);
  const colAttr = new BufferAttribute(scanner.colors, 3);
  cloudGeo.setAttribute('position', posAttr);
  cloudGeo.setAttribute('color', colAttr);
  cloudGeo.setDrawRange(0, 0);
  const cloud = new Points(
    cloudGeo,
    themed.add(
      new PointsMaterial({ size: 2.8, sizeAttenuation: false, vertexColors: true, map: dotTexture(), alphaTest: 0.4 }),
      0xffffff,
      0x5a8fa8,
    ),
  );
  cloud.frustumCulled = false;
  scene.add(cloud);
  scene.add(roomFrame());

  // Anneau du scan courant (plan du LiDAR à l'altitude du drone)
  const ringPos = new Float32Array(BEAMS_PER_REV * 3);
  const ringGeo = new BufferGeometry();
  const ringAttr = new BufferAttribute(ringPos, 3);
  ringGeo.setAttribute('position', ringAttr);
  const ring = new LineLoop(ringGeo, tLine(0x35d0e6, 0x0a6f84, 0.5));
  ring.frustumCulled = false;
  scene.add(ring);

  // Drone : croix + ligne d'altitude
  const marker = new Group();
  const armGeo = new BufferGeometry();
  armGeo.setAttribute(
    'position',
    new BufferAttribute(new Float32Array([-0.2, 0, -0.2, 0.2, 0, 0.2, -0.2, 0, 0.2, 0.2, 0, -0.2]), 3),
  );
  marker.add(new LineSegments(armGeo, tLine(0xf0a43a, 0xa85a05, 1)));
  scene.add(marker);
  const altPos = new Float32Array(6);
  const altGeo = new BufferGeometry();
  const altAttr = new BufferAttribute(altPos, 3);
  altGeo.setAttribute('position', altAttr);
  const altLine = new Line(altGeo, tLine(0xf0a43a, 0xa85a05, 0.5));
  altLine.frustumCulled = false;
  scene.add(altLine);
  onThemeChange(() => {
    themed.apply();
    if (reduced) draw();
  });

  const hud = {
    alt: root.querySelector<HTMLElement>('[data-hud="alt"]'),
    yaw: root.querySelector<HTMLElement>('[data-hud="yaw"]'),
    pts: root.querySelector<HTMLElement>('[data-hud="pts"]'),
  };
  const nf = new Intl.NumberFormat(lang);

  // Vue orbitale pilotée par l'utilisateur : glisser pour tourner, flèches du clavier aussi.
  // Avant la première interaction, une très lente dérive montre que la scène est en 3D
  // (DRIFT = 0 pour la supprimer). Après, la vue ne bouge que si on la déplace.
  const view = { az: 0.55, el: 0.4, vaz: 0, vel: 0, drag: false, touched: false, lx: 0, ly: 0, lt: 0 };
  const EL_MIN = 0.08;
  const EL_MAX = 1.38;
  const DRIFT = 0.04;
  const clampEl = (v: number): number => Math.min(Math.max(v, EL_MIN), EL_MAX);

  const nudge = (daz: number, del: number): void => {
    view.touched = true;
    view.az += daz;
    view.el = clampEl(view.el + del);
    if (reduced) draw();
  };

  root.addEventListener('pointerdown', (e: PointerEvent) => {
    if (e.button !== 0 || (e.target instanceof Element && e.target.closest('a, button'))) return;
    view.drag = true;
    view.touched = true;
    view.vaz = 0;
    view.vel = 0;
    view.lx = e.clientX;
    view.ly = e.clientY;
    view.lt = e.timeStamp;
    root.setPointerCapture(e.pointerId);
    root.classList.add('is-dragging');
    if (e.pointerType === 'mouse') e.preventDefault();
  });
  root.addEventListener('pointermove', (e: PointerEvent) => {
    if (!view.drag) return;
    const dx = e.clientX - view.lx;
    const dy = e.clientY - view.ly;
    const dt = Math.max(e.timeStamp - view.lt, 1) / 1000;
    view.lx = e.clientX;
    view.ly = e.clientY;
    view.lt = e.timeStamp;
    const daz = -dx * 0.0065;
    const del = dy * 0.0055;
    view.az += daz;
    view.el = clampEl(view.el + del);
    view.vaz = daz / dt;
    view.vel = del / dt;
    if (reduced) draw();
  });
  const release = (e: PointerEvent): void => {
    if (!view.drag) return;
    view.drag = false;
    root.classList.remove('is-dragging');
    if (root.hasPointerCapture(e.pointerId)) root.releasePointerCapture(e.pointerId);
    if (reduced || e.timeStamp - view.lt > 80) {
      view.vaz = 0;
      view.vel = 0;
    }
  };
  root.addEventListener('pointerup', release);
  root.addEventListener('pointercancel', release);
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

  function resize(): void {
    // La taille vient du conteneur du canvas (sur petit écran, il est plus petit que le hero).
    const w = host.clientWidth;
    const h = host.clientHeight;
    if (w === 0 || h === 0) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Sur grand écran, la scène est décalée vers la droite, le texte occupe la gauche.
    if (w > 900) camera.setViewOffset(w, h, -w * 0.15, 0, w, h);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
  }

  function place(): void {
    // Écran étroit : on recule pour garder la pièce entière dans le cadre.
    const dist = 15.7 * Math.max(1, 0.95 / camera.aspect);
    camera.position.set(
      Math.cos(view.el) * Math.cos(view.az) * dist,
      0.5 + Math.sin(view.el) * dist,
      Math.cos(view.el) * Math.sin(view.az) * dist,
    );
    camera.lookAt(0, 0.5, 0);
  }

  function draw(): void {
    place();
    renderer.render(scene, camera);
  }

  function sync(): void {
    const p = scanner.pose;
    cloudGeo.setDrawRange(0, scanner.count);
    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;

    const step = (Math.PI * 2) / BEAMS_PER_REV;
    for (let j = 0; j < BEAMS_PER_REV; j++) {
      const r = scanner.ranges[j] > 0 ? scanner.ranges[j] : MISS_RANGE;
      const a = j * step + p.yaw;
      ringPos[j * 3] = p.x + Math.cos(a) * r;
      ringPos[j * 3 + 1] = p.z;
      ringPos[j * 3 + 2] = p.y + Math.sin(a) * r;
    }
    ringAttr.needsUpdate = true;

    marker.position.set(p.x, p.z, p.y);
    altPos[0] = p.x;
    altPos[1] = 0;
    altPos[2] = p.y;
    altPos[3] = p.x;
    altPos[4] = p.z;
    altPos[5] = p.y;
    altAttr.needsUpdate = true;
  }

  function updateHud(): void {
    const p = scanner.pose;
    if (hud.alt) hud.alt.textContent = `${p.z.toFixed(2)} m`;
    if (hud.yaw) hud.yaw.textContent = `${Math.round((((p.yaw * 180) / Math.PI) % 360) + 360) % 360}°`;
    if (hud.pts) hud.pts.textContent = nf.format(scanner.count);
  }

  resize();
  new ResizeObserver(() => {
    resize();
    if (reduced) draw();
  }).observe(host);

  if (reduced) {
    // Pas de mouvement : carte déjà construite, une seule image.
    scanner.step(Math.round(CAPACITY * 1.3));
    sync();
    updateHud();
    draw();
    return;
  }

  let prev = performance.now();
  let hudClock = 0;
  let raf = 0;
  let visible = true;

  /** Dérive avant la première interaction, inertie après un lancer, sinon la vue reste où on l'a laissée. */
  const advanceView = (dt: number): void => {
    if (view.drag) return;
    if (!view.touched) {
      view.az += DRIFT * dt;
      return;
    }
    if (view.vaz === 0 && view.vel === 0) return;
    view.az += view.vaz * dt;
    view.el = clampEl(view.el + view.vel * dt);
    const k = Math.exp(-dt * 4.5);
    view.vaz *= k;
    view.vel *= k;
    if (Math.abs(view.vaz) < 0.01) view.vaz = 0;
    if (Math.abs(view.vel) < 0.01) view.vel = 0;
  };

  const tick = (now: number): void => {
    raf = requestAnimationFrame(tick);
    const dt = Math.min((now - prev) / 1000, 0.05);
    prev = now;
    advanceView(dt);
    scanner.step(Math.max(1, Math.round(BEAMS_PER_SECOND * dt)));
    sync();
    hudClock += dt;
    if (hudClock > 0.1) {
      hudClock = 0;
      updateHud();
    }
    draw();
  };

  const apply = (): void => {
    const should = visible && !document.hidden;
    if (should && raf === 0) {
      prev = performance.now();
      raf = requestAnimationFrame(tick);
    } else if (!should && raf !== 0) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };

  new IntersectionObserver((entries) => {
    visible = entries.some((e) => e.isIntersecting);
    apply();
  }).observe(root);
  document.addEventListener('visibilitychange', apply);
  apply();
}
