/**
 * Builds the Redraft logo animation's parts from the four states in the Figma "Animation" group
 * (public/assets/logo-src/state-1…4.png, white on transparent, 512px wide):
 *
 * - public/assets/logo-state-1.png                the resting logo, as is
 * - public/assets/logo-state-2-top.png            state 2 without its bar (the 1, turned)
 * - public/assets/logo-state-3-top.png            state 3 without its P (the mouth) or left pupil
 * - public/assets/logo-state-3-pupil.png          state 3's left pupil, which winks
 * - public/assets/logo-state-4-lid.png            state 4's closed left eye
 * - src/data/redraft-logo.ts                      outlines of the bar and the P, traced and resampled
 *   to the same number of points so one can morph into the other, plus where the eye parts sit
 *
 * Run with `pnpm logo:build` after changing the source images.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { inflateSync, deflateSync } from "node:zlib";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const SRC = resolve(root, "public/assets/logo-src");
const OUT = resolve(root, "public/assets");
const DATA = resolve(root, "src/data/redraft-logo.ts");
/** points per outline: plenty for a 60px logo, small enough to morph every frame */
const POINTS = 160;

interface Image {
  width: number;
  height: number;
  /** RGBA, 8 bits per channel */
  data: Uint8Array;
}

// ---------- PNG in and out (8-bit, non-interlaced) ----------

function readPng(path: string): Image {
  const buf = readFileSync(path);
  let pos = 8;
  let width = 0, height = 0, colorType = 0;
  const idat: Buffer[] = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString("ascii", pos + 4, pos + 8);
    const body = buf.subarray(pos + 8, pos + 8 + len);
    if (type === "IHDR") {
      width = body.readUInt32BE(0);
      height = body.readUInt32BE(4);
      if (body[8] !== 8 || body[12] !== 0) throw new Error(`${path}: only 8-bit, non-interlaced PNGs`);
      colorType = body[9];
    } else if (type === "IDAT") idat.push(body);
    pos += 12 + len;
  }
  const channels = { 0: 1, 2: 3, 4: 2, 6: 4 }[colorType];
  if (!channels) throw new Error(`${path}: unsupported colour type ${colorType}`);
  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const px = new Uint8Array(stride * height);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let i = 0; i < stride; i++) {
      const a = i >= channels ? px[y * stride + i - channels] : 0;
      const b = y > 0 ? px[(y - 1) * stride + i] : 0;
      const c = i >= channels && y > 0 ? px[(y - 1) * stride + i - channels] : 0;
      const p = a + b - c;
      const paeth = Math.abs(p - a) <= Math.abs(p - b) && Math.abs(p - a) <= Math.abs(p - c) ? a : Math.abs(p - b) <= Math.abs(p - c) ? b : c;
      const predict = [0, a, b, (a + b) >> 1, paeth][filter];
      px[y * stride + i] = (line[i] + predict) & 255;
    }
  }
  const data = new Uint8Array(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const s = px.subarray(i * channels, i * channels + channels);
    const [r, g, b, a] = channels === 4 ? s : channels === 3 ? [s[0], s[1], s[2], 255] : channels === 2 ? [s[0], s[0], s[0], s[1]] : [s[0], s[0], s[0], 255];
    data.set([r, g, b, a], i * 4);
  }
  return { width, height, data };
}

const CRC = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function writePng(path: string, img: Image) {
  const chunk = (type: string, body: Buffer) => {
    const head = Buffer.alloc(8);
    head.writeUInt32BE(body.length, 0);
    head.write(type, 4, "ascii");
    let c = 0xffffffff;
    for (const byte of Buffer.concat([head.subarray(4), body])) c = CRC[(c ^ byte) & 255] ^ (c >>> 8);
    const tail = Buffer.alloc(4);
    tail.writeUInt32BE((c ^ 0xffffffff) >>> 0, 0);
    return Buffer.concat([head, body, tail]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(img.width, 0);
  ihdr.writeUInt32BE(img.height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const raw = Buffer.alloc((img.width * 4 + 1) * img.height);
  for (let y = 0; y < img.height; y++) raw.set(img.data.subarray(y * img.width * 4, (y + 1) * img.width * 4), y * (img.width * 4 + 1) + 1);
  writeFileSync(
    path,
    Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw, { level: 9 })), chunk("IEND", Buffer.alloc(0))]),
  );
}

// ---------- the separate shapes in a state ----------

interface Island {
  /** pixel indexes */
  pixels: number[];
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

/** every 8-connected group of visible pixels */
function islands(img: Image): Island[] {
  const { width: w, height: h, data } = img;
  const seen = new Uint8Array(w * h);
  const found: Island[] = [];
  for (let start = 0; start < w * h; start++) {
    if (seen[start] || data[start * 4 + 3] === 0) continue;
    const island: Island = { pixels: [], minX: w, maxX: 0, minY: h, maxY: 0 };
    const stack = [start];
    seen[start] = 1;
    while (stack.length) {
      const i = stack.pop()!;
      const x = i % w, y = (i - x) / w;
      island.pixels.push(i);
      island.minX = Math.min(island.minX, x);
      island.maxX = Math.max(island.maxX, x);
      island.minY = Math.min(island.minY, y);
      island.maxY = Math.max(island.maxY, y);
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx, ny = y + dy, n = ny * w + nx;
          if (nx >= 0 && ny >= 0 && nx < w && ny < h && !seen[n] && data[n * 4 + 3] > 0) {
            seen[n] = 1;
            stack.push(n);
          }
        }
    }
    found.push(island);
  }
  return found;
}

/** the bottom shape: the one reaching lowest */
const lowest = (all: Island[]) => all.reduce((a, b) => (b.maxY > a.maxY ? b : a));
/** the left eye: the leftmost of the small shapes */
const leftEye = (all: Island[]) => all.filter((i) => i.pixels.length < 5000).reduce((a, b) => (b.minX < a.minX ? b : a));

function without(img: Image, ...remove: Island[]): Image {
  const data = img.data.slice();
  for (const island of remove) for (const i of island.pixels) data[i * 4 + 3] = 0;
  return { ...img, data };
}

/** the shape alone, cropped with a 1px margin; returns where the crop sits */
function crop(img: Image, island: Island) {
  const x0 = island.minX - 1, y0 = island.minY - 1;
  const width = island.maxX - island.minX + 3, height = island.maxY - island.minY + 3;
  const data = new Uint8Array(width * height * 4);
  for (const i of island.pixels) {
    const x = i % img.width, y = (i - x) / img.width;
    data.set(img.data.subarray(i * 4, i * 4 + 4), ((y - y0) * width + (x - x0)) * 4);
  }
  return { image: { width, height, data }, x: x0, y: y0 };
}

// ---------- outlines ----------

type Point = [number, number];

/**
 * The shape's outlines (outer edge and any holes), traced with marching squares on its alpha at
 * 50%, so the edge lands between pixels where the anti-aliasing says it is.
 */
function outlines(img: Image, island: Island): Point[][] {
  const { width: w, height: h } = img;
  const field = new Float32Array((w + 2) * (h + 2));
  for (const i of island.pixels) {
    const x = i % w, y = (i - x) / w;
    field[(y + 1) * (w + 2) + x + 1] = img.data[i * 4 + 3];
  }
  const v = (x: number, y: number) => field[(y + 1) * (w + 2) + x + 1];
  const iso = 127.5;
  const points = new Map<string, Point>();
  const links = new Map<string, string[]>();
  const link = (a: string, b: string) => {
    links.set(a, [...(links.get(a) ?? []), b]);
    links.set(b, [...(links.get(b) ?? []), a]);
  };
  for (let y = -1; y < h; y++)
    for (let x = -1; x < w; x++) {
      const a = v(x, y), b = v(x + 1, y), c = v(x + 1, y + 1), d = v(x, y + 1);
      const index = (a > iso ? 8 : 0) | (b > iso ? 4 : 0) | (c > iso ? 2 : 0) | (d > iso ? 1 : 0);
      if (index === 0 || index === 15) continue;
      const edge = (side: "T" | "R" | "B" | "L") => {
        const key = side === "T" ? `h${x},${y}` : side === "B" ? `h${x},${y + 1}` : side === "L" ? `v${x},${y}` : `v${x + 1},${y}`;
        if (!points.has(key)) {
          const t = (p: number, q: number) => (iso - p) / (q - p);
          // pixel centres sit at +0.5
          const at: Point =
            side === "T" ? [x + t(a, b) + 0.5, y + 0.5] : side === "B" ? [x + t(d, c) + 0.5, y + 1.5] : side === "L" ? [x + 0.5, y + t(a, d) + 0.5] : [x + 1.5, y + t(b, c) + 0.5];
          points.set(key, at);
        }
        return key;
      };
      const centre = (a + b + c + d) / 4 > iso;
      const pairs: [string, string][] = {
        1: [["L", "B"]], 2: [["B", "R"]], 3: [["L", "R"]], 4: [["T", "R"]],
        5: centre ? [["T", "L"], ["B", "R"]] : [["T", "R"], ["L", "B"]],
        6: [["T", "B"]], 7: [["T", "L"]], 8: [["T", "L"]], 9: [["T", "B"]],
        10: centre ? [["T", "R"], ["L", "B"]] : [["T", "L"], ["B", "R"]],
        11: [["T", "R"]], 12: [["L", "R"]], 13: [["B", "R"]], 14: [["L", "B"]],
      }[index] as [string, string][];
      for (const [p, q] of pairs) link(edge(p as "T"), edge(q as "T"));
    }
  const loops: Point[][] = [];
  const used = new Set<string>();
  for (const start of links.keys()) {
    if (used.has(start)) continue;
    const loop: Point[] = [];
    let prev = "", cur = start;
    while (!used.has(cur)) {
      used.add(cur);
      loop.push(points.get(cur)!);
      const next = links.get(cur)!.find((n) => n !== prev && !used.has(n)) ?? links.get(cur)!.find((n) => n !== prev);
      if (!next) break;
      prev = cur;
      cur = next;
    }
    if (loop.length > 8) loops.push(loop);
  }
  return loops.sort((p, q) => Math.abs(area(q)) - Math.abs(area(p)));
}

const area = (loop: Point[]) => loop.reduce((s, [x, y], i) => {
  const [nx, ny] = loop[(i + 1) % loop.length];
  return s + x * ny - nx * y;
}, 0) / 2;

/** `count` points evenly spaced along the closed outline */
function resample(loop: Point[], count: number): Point[] {
  const lengths = loop.map((p, i) => Math.hypot(loop[(i + 1) % loop.length][0] - p[0], loop[(i + 1) % loop.length][1] - p[1]));
  const total = lengths.reduce((s, l) => s + l, 0);
  const out: Point[] = [];
  let seg = 0, walked = 0;
  for (let k = 0; k < count; k++) {
    const target = (k * total) / count;
    while (seg < loop.length - 1 && walked + lengths[seg] < target) walked += lengths[seg++];
    const t = (target - walked) / lengths[seg];
    const [x1, y1] = loop[seg], [x2, y2] = loop[(seg + 1) % loop.length];
    out.push([x1 + (x2 - x1) * t, y1 + (y2 - y1) * t]);
  }
  return out;
}

/** turns `to` to run the same way as `from` and starts it where it lines up best, so each point travels least */
function align(from: Point[], to: Point[]): Point[] {
  const runs = Math.sign(area(from)) === Math.sign(area(to)) ? to : [...to].reverse();
  let best = 0, bestCost = Infinity;
  for (let k = 0; k < runs.length; k++) {
    let cost = 0;
    for (let i = 0; i < from.length; i++) {
      const [x, y] = runs[(i + k) % runs.length];
      cost += (x - from[i][0]) ** 2 + (y - from[i][1]) ** 2;
    }
    if (cost < bestCost) [best, bestCost] = [k, cost];
  }
  return runs.map((_, i) => runs[(i + best) % runs.length]);
}

const flat = (loop: Point[]) => loop.flatMap(([x, y]) => [+x.toFixed(1), +y.toFixed(1)]);

// ---------- build ----------

const [s1, s2, s3, s4] = [1, 2, 3, 4].map((n) => readPng(resolve(SRC, `state-${n}.png`)));

writePng(resolve(OUT, "logo-state-1.png"), s1);

const bar = lowest(islands(s2));
writePng(resolve(OUT, "logo-state-2-top.png"), without(s2, bar));

const s3Shapes = islands(s3);
const p = lowest(s3Shapes);
const pupil = leftEye(s3Shapes);
writePng(resolve(OUT, "logo-state-3-top.png"), without(s3, p, pupil));
const pupilCrop = crop(s3, pupil);
writePng(resolve(OUT, "logo-state-3-pupil.png"), pupilCrop.image);

const lidCrop = crop(s4, leftEye(islands(s4)));
writePng(resolve(OUT, "logo-state-4-lid.png"), lidCrop.image);

// the bar is drawn in state 2's frame; line it up with the P in state 3's frame before matching points
const toFrame3 = s3.height / s2.height;
const barOutline = resample(outlines(s2, bar)[0], POINTS);
const [pOuter, mouth] = outlines(s3, p);
const pOutline = align(barOutline.map(([x, y]) => [x, y * toFrame3] as Point), resample(pOuter, POINTS));
const mouthOutline = resample(mouth, POINTS);

const file = `// Generated by scripts/redraft-logo.ts from public/assets/logo-src: don't edit by hand.

/** where a cut-out part sits in its state, in that state's pixels */
export interface RedraftLogoPart {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** The bar (state 2's turned 1) and the P (state 3's, whose loop is the mouth): ${POINTS} points each, as x, y pairs */
export const REDRAFT_LOGO_PATHS = {
  width: ${s2.width},
  /** the resting logo's height (state 1) */
  logoHeight: ${s1.height},
  bar: { height: ${s2.height}, outline: [${flat(barOutline).join(", ")}] },
  p: {
    height: ${s3.height},
    outline: [${flat(pOutline).join(", ")}],
    mouth: [${flat(mouthOutline).join(", ")}],
  },
};

/** state 3's left pupil, and state 4's closed eye that it winks into */
export const REDRAFT_LOGO_EYE: { pupil: RedraftLogoPart; lid: RedraftLogoPart } = {
  pupil: { x: ${pupilCrop.x}, y: ${pupilCrop.y}, width: ${pupilCrop.image.width}, height: ${pupilCrop.image.height} },
  lid: { x: ${lidCrop.x}, y: ${lidCrop.y}, width: ${lidCrop.image.width}, height: ${lidCrop.image.height} },
};
`;
writeFileSync(DATA, file);
console.log(`bar ${barOutline.length} points, P ${pOutline.length} + mouth ${mouthOutline.length}; pupil at ${pupilCrop.x},${pupilCrop.y}; lid at ${lidCrop.x},${lidCrop.y}`);
