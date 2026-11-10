import * as THREE from "three";

/*
  The shredded sheet, in three.js: a printed sheet cut into vertical strips that float apart in 3D,
  each drifting, turning and twisting on its own slow clock, lit from the top left with soft shadows
  on the page behind. Focus brings the strips back together, in a ripple out from the pointer, until
  the sheet lies whole and its type can be read; when focus leaves they drift apart again. On load
  the sheet shows whole for a moment, then comes apart. With reduced motion it simply lies whole.
*/

export interface ShredOptions {
  /** the type printed across the sheet, one line each */
  lines: string[];
  /** how much of each line's first letter is lost past the sheet's left edge, as if the shredder took it (0 to 1) */
  cut: number;
  /**
    how much of the longest line's last letter is lost past the sheet's right edge (0 to 1); when
    set the type is sized by it, so the sheet's right edge slices through that letter
  */
  cutEnd: number;
  /** the sheet's width over its height */
  aspect: number;
  /** small print in the sheet's top left corner */
  caption: string;
  /** small print in its bottom right corner */
  folio: string;
  strips: number;
  font: string;
  mono: string;
  paper: string;
  ink: string;
}

export interface ShredScene {
  /** focus brings the strips together (rippling out from `x`, in sheet widths from its middle), blur lets them drift */
  setFocus(on: boolean, x?: number): void;
  dispose(): void;
}

/** rows each strip is cut into for bending */
const SEGMENTS = 72;
/**
  the strips' long sides are cut by hand, as on the work cards: crooked straight snips running up to
  `depth` of a strip's pitch in from its side, with knots `knot` of the sheet's height apart, a hair
  of `jitter` and the odd notch (`notch` of the rows, `notchDepth` of the pitch deeper)
*/
const EDGE = { depth: 0.13, knot: [0.05, 0.16], jitter: 0.02, notch: 0.05, notchDepth: [0.05, 0.12] };
/**
  the camera: the sheet fills `--shred-fill` of the stage's width (CSS, `fill` by default) and at
  most `fillH` of its height
*/
const FRAME = { fov: 28, fill: 0.6, fillH: 0.66 };
/**
  the drift: strips spread to `spread` times the sheet's width, float up to `y` and `z` out of
  line, turn about their length up to `ry`, lean up to `rz`, twist up to `twist` radians end to end,
  curl and sway; each on its own clock (periods of about 15 to 30 s)
*/
const DRIFT = {
  spread: 1.18,
  y: 0.07,
  z: 0.18,
  ry: 0.32,
  ryWave: 0.5,
  rz: 0.08,
  twist: 0.9,
  curl: 0.08,
  sway: 0.035,
  speed: 0.32,
};
/** the strips lying together still aren't quite flat: a hair of twist, curl and sway each, as in a photo of shredded paper */
const REST = { y: 0.005, twist: 0.06, curl: 0.014, sway: 0.006, rz: 0.004 };
/**
  each strip eases between drifting (0) and together (1) on a critically damped spring (`omega`);
  focus ripples out from the pointer, `ripple` s across the whole sheet, give or take `jitter` s
*/
const SPRING = { omega: 7, ripple: 0.42, jitter: 0.07 };
/** after load the sheet stays whole this long, s, then comes apart left to right over `introSweep` s */
const INTRO = { hold: 1.1, sweep: 0.8 };
/** pointer leaving the sheet: wait this long before letting go, s */
const LET_GO = 0.3;
/** the whole sheet tilts towards the pointer, radians, and floats gently */
const PARALLAX = { y: 0.2, x: 0.12, lambda: 3, float: 0.012 };

const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/**
  how far in a hand-cut side runs at each of a strip's rows, top to bottom (the sheet is 1 high):
  straight snips between knots placed at random, plus jitter and the odd notch
*/
const raggedEdge = (rand: () => number, pitch: number) => {
  const within = ([lo, hi]: number[]) => lo + (hi - lo) * rand();
  const knot = () => rand() * EDGE.depth * pitch;
  const inset: number[] = [];
  let y0 = 0;
  let x0 = knot();
  let y1 = within(EDGE.knot);
  let x1 = knot();
  for (let row = 0; row <= SEGMENTS; row++) {
    const y = row / SEGMENTS;
    while (y > y1) {
      y0 = y1;
      x0 = x1;
      y1 += within(EDGE.knot);
      x1 = knot();
    }
    let x = x0 + ((x1 - x0) * (y - y0)) / (y1 - y0) + (rand() - 0.5) * 2 * EDGE.jitter * pitch;
    if (rand() < EDGE.notch) x += within(EDGE.notchDepth) * pitch;
    inset.push(Math.max(0, x));
  }
  return inset;
};

interface Pose {
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
  twist: number;
  curl: number;
  sway: number;
}
const POSE_KEYS = ["x", "y", "z", "rx", "ry", "rz", "twist", "curl", "sway"] as const;
const blank = (): Pose => ({ x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, twist: 0, curl: 0, sway: 0 });

interface Strip {
  holder: THREE.Group;
  geo: THREE.PlaneGeometry;
  base: Float32Array;
  home: number;
  rest: Pose;
  /** the drift's resting offsets, phases and clock rates */
  dy: number;
  dz: number;
  ry0: number;
  rz0: number;
  phase: number[];
  rate: number[];
  /** 0 drifting, 1 together */
  k: number;
  v: number;
  goal: number;
  /** when the strip starts towards `next`, s */
  at: number;
  next: number;
}

/**
  the printed sheet: paper with a little grain, small print in two corners and the type set big along
  the bottom, each line starting `cut` of its first letter's width past the left edge
*/
const drawSheet = (o: ShredOptions) => {
  const W = 2048;
  const H = Math.round(W / o.aspect);
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.fillStyle = o.paper;
  ctx.fillRect(0, 0, W, H);
  // grain
  const img = ctx.getImageData(0, 0, W, H);
  const rand = seeded(77);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (rand() - 0.5) * 10;
    img.data[i] += n;
    img.data[i + 1] += n;
    img.data[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);

  const m = 112;
  ctx.fillStyle = o.ink;
  ctx.textBaseline = "alphabetic";
  ctx.font = `400 34px ${o.mono}`;
  ctx.letterSpacing = "3px";
  // the small print, each only if there is some; a rule runs under the caption
  if (o.caption) {
    ctx.fillText(o.caption.toUpperCase(), m, m + 26);
    ctx.fillRect(m, m + 56, W - 2 * m, 2);
  }
  if (o.folio) {
    ctx.textAlign = "right";
    ctx.fillText(o.folio.toUpperCase(), W - m, H - m + 26);
    ctx.textAlign = "left";
  }

  // the type: as big as the room allows (what is left of the longest line across the sheet, the
  // lines' height between the rule and the bottom margin), set close, from the bottom up; each line
  // starts `cut` of its first letter's width past the left edge, so the sheet's edge slices through
  // that letter
  const lead = 0.88;
  const capHeight = 0.72;
  const cut = Math.min(0.9, Math.max(0, o.cut));
  const bottom = H - m - (o.folio ? 40 : 0);
  const top = o.caption ? m + 56 + 60 : m;
  let size = 400;
  const cutEnd = Math.min(0.9, Math.max(0, o.cutEnd));
  const lost = () => {
    ctx.font = `500 ${size}px ${o.font}`;
    ctx.letterSpacing = `${-0.05 * size}px`;
    return o.lines.map((line) => cut * ctx.measureText(line.charAt(0)).width);
  };
  /** what shows of each line, less what its last letter loses past the right edge */
  const shown = () => {
    const off = lost();
    return o.lines.map((line, i) => {
      const end = cutEnd * (ctx.measureText(line.slice(-1)).width + 0.05 * size);
      return ctx.measureText(line).width - off[i] - end;
    });
  };
  const start = cut ? 0 : m;
  const end = cutEnd ? 0 : m;
  size *= (W - end - start) / Math.max(...shown());
  // a cut through the last letter decides the size; otherwise the height may hold it back
  if (!cutEnd) size = Math.min(size, (bottom - top) / ((o.lines.length - 1) * lead + capHeight));
  const off = lost();
  // with a caption the type sits on the bottom; without one it is centred on the sheet
  const block = ((o.lines.length - 1) * lead + capHeight) * size;
  const last = o.caption ? bottom : (H + block) / 2;
  o.lines.forEach((line, i) => {
    const x = cut ? -off[i] : m - size * 0.04;
    ctx.fillText(line, x, last - (o.lines.length - 1 - i) * size * lead);
  });
  return canvas;
};

export function createShredScene(stage: HTMLElement, canvas: HTMLCanvasElement, o: ShredOptions): ShredScene {
  /** the sheet in world units */
  const SHEET = { w: o.aspect, h: 1 };
  const reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");
  const reduced = () => reduceMq.matches;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  // PCF is soft by itself now (three r18x dropped PCFSoft); `radius` blurs it
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FRAME.fov, 1, 0.1, 20);

  // light from the top left, as on a desk by a window; the page behind catches the shadows
  scene.add(new THREE.HemisphereLight(0xffffff, 0xcfccc4, 1.9));
  const key = new THREE.DirectionalLight(0xffffff, 1.9);
  key.position.set(-1.4, 1.9, 3);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  // the shadows cover the drifting strips: the sheet's width spread, and room either side
  const reach = Math.max(1.8, SHEET.w * DRIFT.spread * 0.5 + 0.9);
  key.shadow.camera.left = -reach;
  key.shadow.camera.right = reach;
  key.shadow.camera.top = 1.8;
  key.shadow.camera.bottom = -1.8;
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 9;
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.01;
  key.shadow.radius = 7;
  key.shadow.blurSamples = 16;
  scene.add(key);
  const catcher = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.ShadowMaterial({ opacity: 0.14 }));
  catcher.position.z = -0.2;
  catcher.receiveShadow = true;
  scene.add(catcher);

  const texture = new THREE.CanvasTexture(drawSheet(o));
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const front = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.92, metalness: 0, side: THREE.FrontSide });
  front.shadowSide = THREE.DoubleSide;
  const back = new THREE.MeshStandardMaterial({
    color: new THREE.Color(o.paper).multiplyScalar(0.94),
    roughness: 0.95,
    metalness: 0,
    side: THREE.BackSide,
  });
  // the type waits for its fonts, then the sheet is printed again
  const fontsReady = Promise.all([
    document.fonts.load(`500 100px ${o.font}`),
    document.fonts.load(`400 34px ${o.mono}`),
  ]).catch(() => []);
  let disposed = false;
  void fontsReady.then(() => {
    if (disposed) return;
    texture.image = drawSheet(o);
    texture.needsUpdate = true;
    dirty = true;
  });

  const sheet = new THREE.Group();
  scene.add(sheet);
  const rand = seeded(1319);
  const between = (a: number) => (rand() - 0.5) * 2 * a;
  const n = Math.max(2, o.strips);
  const pitch = SHEET.w / n;
  const strips: Strip[] = Array.from({ length: n }, (_, i) => {
    const w = pitch * (0.88 + 0.08 * rand());
    const home = -SHEET.w / 2 + (i + 0.5) * pitch + between(pitch * 0.03);
    const geo = new THREE.PlaneGeometry(w, SHEET.h, 1, SEGMENTS);
    // its long sides cut by hand, and each strip showing its own slice of the print (the print
    // follows the cut, so nothing stretches)
    const left = raggedEdge(rand, pitch);
    const right = raggedEdge(rand, pitch);
    const pos = geo.attributes.position;
    const uv = geo.attributes.uv;
    for (let j = 0; j < pos.count; j++) {
      const row = Math.floor(j / 2);
      const x = j % 2 === 0 ? -w / 2 + left[row] : w / 2 - right[row];
      pos.setX(j, x);
      uv.setX(j, (home + x) / SHEET.w + 0.5);
    }
    const holder = new THREE.Group();
    const face = new THREE.Mesh(geo, front);
    face.castShadow = true;
    face.receiveShadow = true;
    const rear = new THREE.Mesh(geo, back);
    rear.receiveShadow = true;
    holder.add(face, rear);
    sheet.add(holder);
    const rest = blank();
    rest.x = home;
    rest.y = between(REST.y);
    rest.rz = between(REST.rz);
    rest.twist = between(REST.twist);
    rest.curl = between(REST.curl);
    rest.sway = between(REST.sway);
    return {
      holder,
      geo,
      base: Float32Array.from(geo.attributes.position.array as ArrayLike<number>),
      home,
      rest,
      dy: between(DRIFT.y),
      dz: between(DRIFT.z),
      ry0: between(DRIFT.ry),
      rz0: between(DRIFT.rz),
      phase: Array.from({ length: 9 }, () => rand() * Math.PI * 2),
      rate: Array.from({ length: 9 }, () => 0.7 + 0.6 * rand()),
      k: 1,
      v: 0,
      goal: 1,
      at: 0,
      next: 1,
    };
  });

  /** where a strip drifts at time t */
  const drift = (s: Strip, t: number, out: Pose) => {
    const w = (i: number, f: number) => Math.sin(t * DRIFT.speed * f * s.rate[i] + s.phase[i]);
    out.x = s.home * DRIFT.spread + 0.03 * w(0, 0.9);
    out.y = s.dy + 0.05 * w(1, 1.2);
    out.z = s.dz + 0.12 * w(2, 1.1);
    out.rx = 0.16 * w(3, 0.8);
    out.ry = s.ry0 + DRIFT.ryWave * w(4, 1);
    out.rz = s.rz0 + 0.07 * w(5, 0.8);
    out.twist = DRIFT.twist * w(6, 1.15);
    out.curl = DRIFT.curl * w(7, 1);
    out.sway = DRIFT.sway * w(8, 0.9);
  };

  /** bends a strip: twisted about its length, curled end to end and swayed sideways */
  const bend = (s: Strip, p: Pose) => {
    const pos = s.geo.attributes.position;
    const arr = pos.array as Float32Array;
    for (let j = 0; j < pos.count; j++) {
      const u = s.base[j * 3];
      const v = s.base[j * 3 + 1];
      const f = v / SHEET.h;
      const th = p.twist * f;
      const ends = 4 * f * f;
      arr[j * 3] = u * Math.cos(th) + p.sway * ends;
      arr[j * 3 + 1] = v;
      arr[j * 3 + 2] = u * Math.sin(th) + p.curl * ends;
    }
    pos.needsUpdate = true;
    s.geo.computeVertexNormals();
  };

  /* ---------- focus ---------- */

  let clock = 0;
  let focused = false;
  const schedule = (goal: number, from: number | null, sweep: number) => {
    strips.forEach((s, i) => {
      const along = from === null ? i / (n - 1) : Math.abs(s.home / SHEET.w - from);
      s.at = clock + along * sweep + Math.random() * SPRING.jitter;
      s.next = goal;
    });
  };
  const setFocus = (on: boolean, x = 0) => {
    if (on === focused) return;
    focused = on;
    schedule(on ? 1 : 0, on ? x : null, on ? SPRING.ripple : SPRING.ripple * 0.6);
  };
  // the intro: whole, then apart
  schedule(0, null, INTRO.sweep);
  strips.forEach((s) => (s.at += INTRO.hold));

  /* ---------- the pointer ---------- */

  const pointer = new THREE.Vector2();
  const tilt = { x: 0, y: 0 };
  const ray = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const hit = new THREE.Vector3();
  let letGoAt = -1;
  let hovering = false;

  const toPointer = (e: PointerEvent) => {
    // the camera spans the canvas, which may reach past the stage
    const r = canvas.getBoundingClientRect();
    pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(pointer, camera);
    if (!ray.ray.intersectPlane(plane, hit)) return null;
    const inside = Math.abs(hit.x) < SHEET.w / 2 + 0.04 && Math.abs(hit.y) < SHEET.h / 2 + 0.04;
    return { inside, x: hit.x / SHEET.w };
  };
  const onMove = (e: PointerEvent) => {
    if (e.pointerType === "touch") return;
    const at = toPointer(e);
    hovering = !!at?.inside;
    if (at?.inside) {
      letGoAt = -1;
      setFocus(true, at.x);
    } else if (focused && letGoAt < 0 && document.activeElement !== stage) letGoAt = clock + LET_GO;
  };
  const onLeave = () => {
    pointer.set(0, 0);
    hovering = false;
    if (focused && document.activeElement !== stage) letGoAt = clock + LET_GO;
  };
  const onDown = (e: PointerEvent) => {
    if (e.pointerType !== "touch") return;
    const at = toPointer(e);
    if (at?.inside || focused) setFocus(!focused, at?.x ?? 0);
  };
  const onFocus = () => {
    letGoAt = -1;
    setFocus(true, 0);
  };
  const onBlur = () => {
    if (!hovering) setFocus(false);
  };
  stage.addEventListener("pointermove", onMove);
  stage.addEventListener("pointerleave", onLeave);
  stage.addEventListener("pointerdown", onDown);
  stage.addEventListener("focus", onFocus);
  stage.addEventListener("blur", onBlur);

  /* ---------- size ---------- */

  let dirty = true;
  const resize = () => {
    // the sheet is framed in the stage; the canvas may reach past it (`--shred-bleed`, evenly all
    // round) so drifting strips and their shadows aren't cut off at the stage's edges
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    const cw = canvas.clientWidth || w;
    const ch = canvas.clientHeight || h;
    if (!w || !h) return;
    renderer.setSize(cw, ch, false);
    camera.aspect = cw / ch;
    const fill = parseFloat(getComputedStyle(stage).getPropertyValue("--shred-fill")) || FRAME.fill;
    const tan = Math.tan((FRAME.fov * Math.PI) / 360);
    const d = Math.max((SHEET.w * ch) / (2 * tan * fill * w), (SHEET.h * ch) / (2 * tan * FRAME.fillH * h));
    camera.position.set(0, 0, d);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    dirty = true;
  };
  const ro = new ResizeObserver(resize);
  ro.observe(stage);
  ro.observe(canvas);
  resize();

  /* ---------- the frame loop, while the stage is on screen ---------- */

  const drifting = blank();
  const pose = blank();
  let raf = 0;
  let last = 0;
  let visible = false;
  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const dt = last ? Math.min(0.1, (now - last) / 1000) : 1 / 60;
    last = now;
    const still = reduced();
    if (still && !dirty) return;
    clock += dt;
    if (letGoAt >= 0 && clock >= letGoAt) {
      letGoAt = -1;
      setFocus(false);
    }
    const t = still ? 0 : clock;
    const { omega } = SPRING;
    strips.forEach((s) => {
      if (clock >= s.at) s.goal = s.next;
      if (still) {
        s.k = 1;
        s.v = 0;
      } else {
        // critically damped: no overshoot
        const a = omega * omega * (s.goal - s.k) - 2 * omega * s.v;
        s.v += a * dt;
        s.k += s.v * dt;
      }
      drift(s, t, drifting);
      const k = Math.min(1, Math.max(0, s.k));
      for (const key of POSE_KEYS) pose[key] = drifting[key] + (s.rest[key] - drifting[key]) * k;
      s.holder.position.set(pose.x, pose.y, pose.z);
      s.holder.rotation.set(pose.rx, pose.ry, pose.rz);
      bend(s, pose);
    });
    // the whole sheet leans towards the pointer and floats
    const ease = 1 - Math.exp(-PARALLAX.lambda * dt);
    tilt.x += ((still ? 0 : -pointer.y * PARALLAX.x) - tilt.x) * ease;
    tilt.y += ((still ? 0 : pointer.x * PARALLAX.y) - tilt.y) * ease;
    sheet.rotation.set(tilt.x, tilt.y, still ? 0 : PARALLAX.float * Math.sin(clock * 0.5));
    sheet.position.y = still ? 0 : PARALLAX.float * Math.sin(clock * 0.7);
    renderer.render(scene, camera);
    dirty = false;
  };
  const start = () => {
    if (!raf) {
      last = 0;
      raf = requestAnimationFrame(frame);
    }
  };
  const stop = () => {
    cancelAnimationFrame(raf);
    raf = 0;
  };
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) start();
    else stop();
  });
  io.observe(stage);
  const onReduce = () => (dirty = true);
  reduceMq.addEventListener("change", onReduce);

  return {
    setFocus,
    dispose() {
      disposed = true;
      stop();
      io.disconnect();
      ro.disconnect();
      reduceMq.removeEventListener("change", onReduce);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", onLeave);
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("focus", onFocus);
      stage.removeEventListener("blur", onBlur);
      strips.forEach((s) => s.geo.dispose());
      catcher.geometry.dispose();
      (catcher.material as THREE.Material).dispose();
      front.dispose();
      back.dispose();
      texture.dispose();
      renderer.dispose();
    },
  };
}
