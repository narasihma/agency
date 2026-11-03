/**
 * The hover cycle's timeline, in ms from the hover. Timed after a mascot-to-wordmark reference
 * (dribbble upload 35813511): the character arrives, lives for a beat with a slow tilt, winds up,
 * then snaps back into the logo and settles with a long ease-out.
 */
export const CYCLE = {
  /** state 1 → 2: the logo turns a quarter turn counter-clockwise as it melts */
  melt: 380,
  /** state 2 holds for a beat */
  hold: 700,
  /** state 2 → 3: the eyes pop open and the bar's path turns into the P */
  face: 920,
  /** the wink: the left pupil squeezes shut into state 4's closed eye and opens again, while the face idles */
  winkClose: 1500,
  winkOpen: 1720,
  /** the face idles, tilting slowly */
  live: 1900,
  /** anticipation: it leans further and squashes */
  windUp: 2250,
  /** state 3 → 1: the fast morph back into the logo */
  back: 2650,
  /** the logo grows back to full size and settles */
  end: 3300,
};

/** how far state 2 is turned from state 1: the B's bowls point up and the 1 lies along the bottom */
const TURN = -90;

export const EASE = {
  out: "cubic-bezier(0.33, 1, 0.68, 1)",
  outExpo: "cubic-bezier(0.16, 1, 0.3, 1)",
  outBack: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  inOut: "cubic-bezier(0.37, 0, 0.63, 1)",
  in: "cubic-bezier(0.5, 0, 0.75, 0)",
  /** a deliberate turn: quick to start, long to land */
  turn: "cubic-bezier(0.5, 0, 0.2, 1)",
};

const at = (ms: number) => ms / CYCLE.end;

/**
 * One transform for every keyframe, so the browser interpolates each part separately. Each state
 * is drawn at the logo's width with its own height (ratio r = height / width), centred on its own
 * box: `look` makes it fill the box another state would, turned by `turn` degrees.
 */
function pose(r: number, look: number, turn = 0) {
  const quarter = Math.abs(turn) === 90;
  // turned a quarter, the drawing's width spans the target's height and its height the width
  const sx = quarter ? look : 1;
  const sy = quarter ? 1 / r : look / r;
  // shift so the top edge stays where the target's would be
  const ty = (((look - r) / 2) / r) * 100;
  return `translateY(${+ty.toFixed(3)}%) rotate(${turn}deg) scale(${+sx.toFixed(4)}, ${+sy.toFixed(4)})`;
}

/**
 * Opacity and transform keyframes for the three states. Each change fades one state out while it
 * takes the next one's shape and fades the next in from the previous shape, so the silhouettes
 * overlap mid-morph. From 1 to 2 both turn together, so the 1B rotates into the melted face.
 */
export function stateKeyframes([r1, r2, r3]: number[]): Keyframe[][] {
  const rest = (r: number) => pose(r, r);
  return [
    [
      { offset: 0, opacity: 1, transform: rest(r1), easing: EASE.turn },
      { offset: at(CYCLE.melt), opacity: 0, transform: pose(r1, r2, TURN) },
      { offset: at(CYCLE.windUp), opacity: 0, transform: pose(r1, r3), easing: EASE.outExpo },
      { offset: at(CYCLE.back), opacity: 1, transform: rest(r1) },
      { offset: 1, opacity: 1, transform: rest(r1) },
    ],
    [
      { offset: 0, opacity: 0, transform: pose(r2, r1, -TURN), easing: EASE.turn },
      { offset: at(CYCLE.melt), opacity: 1, transform: rest(r2) },
      // 2 → 3 carries the same morphing outline in both states, so 2 stays solid under 3 fading in
      // (two half-faded layers would wash the logo out) and only goes once 3 is fully there
      { offset: at(CYCLE.hold), opacity: 1, transform: rest(r2), easing: EASE.out },
      { offset: at(CYCLE.face), opacity: 1, transform: pose(r2, r3) },
      { offset: at(CYCLE.face + 1), opacity: 0, transform: pose(r2, r3) },
      { offset: 1, opacity: 0, transform: pose(r2, r3) },
    ],
    [
      { offset: 0, opacity: 0, transform: pose(r3, r2) },
      { offset: at(CYCLE.hold), opacity: 0, transform: pose(r3, r2), easing: EASE.out },
      { offset: at(CYCLE.face), opacity: 1, transform: rest(r3) },
      { offset: at(CYCLE.windUp), opacity: 1, transform: rest(r3), easing: EASE.outExpo },
      { offset: at(CYCLE.back), opacity: 0, transform: pose(r3, r1) },
      { offset: 1, opacity: 0, transform: pose(r3, r1) },
    ],
  ];
}

/** a cut-out part's box in its state's pixels */
export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * The wink: the pupil squeezes into the closed eye's box (state 4), hands over to the closed eye
 * for a moment, then opens a little slower than it closed.
 */
export function winkKeyframes(pupil: Box, lid: Box): { pupil: Keyframe[]; lid: Keyframe[] } {
  const dx = ((lid.x + lid.width / 2 - (pupil.x + pupil.width / 2)) / pupil.width) * 100;
  const dy = ((lid.y + lid.height / 2 - (pupil.y + pupil.height / 2)) / pupil.height) * 100;
  const open = "translate(0%, 0%) scale(1, 1)";
  const shut = `translate(${dx.toFixed(2)}%, ${dy.toFixed(2)}%) scale(${(lid.width / pupil.width).toFixed(3)}, ${(lid.height / pupil.height).toFixed(3)})`;
  const close = CYCLE.winkClose;
  return {
    pupil: [
      { offset: 0, opacity: 1, transform: open },
      { offset: at(close), opacity: 1, transform: open, easing: EASE.in },
      { offset: at(close + 80), opacity: 1, transform: shut },
      { offset: at(close + 90), opacity: 0, transform: shut },
      { offset: at(close + 120), opacity: 0, transform: shut },
      { offset: at(close + 130), opacity: 1, transform: shut, easing: EASE.out },
      { offset: at(CYCLE.winkOpen), opacity: 1, transform: open },
      { offset: 1, opacity: 1, transform: open },
    ],
    lid: [
      { offset: 0, opacity: 0 },
      { offset: at(close + 75), opacity: 0 },
      { offset: at(close + 90), opacity: 1 },
      { offset: at(close + 120), opacity: 1 },
      { offset: at(close + 135), opacity: 0 },
      { offset: 1, opacity: 0 },
    ],
  };
}

type Point = [number, number];

const pairs = (flat: number[]): Point[] => Array.from({ length: flat.length / 2 }, (_, i) => [flat[2 * i], flat[2 * i + 1]]);
const toPath = (points: Point[]) => `M${points.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L")}Z`;
const lerp = (a: Point[], b: Point[], t: number): Point[] => a.map(([x, y], i) => [x + (b[i][0] - x) * t, y + (b[i][1] - y) * t]);

/** the outlines that morph from state 2 to 3, as x, y pairs in each state's own pixels */
export interface MorphOutlines {
  /** state 2's bar (its 1, turned) */
  bar: number[];
  /** state 3's P, point for point with the bar */
  p: number[];
  /** the P's loop: the mouth */
  mouth: number[];
  /** state 2's and 3's heights: the bar is drawn in a frame `barHeight` tall, the P in one `pHeight` tall */
  barHeight: number;
  pHeight: number;
}

/**
 * The bar → P path transition. `at(t)` gives the shape at progress t (0..1) as SVG path data, in
 * state 3's frame and in state 2's (the two layers carry the same shape while they cross-fade).
 * The mouth opens from a slit in the middle of where it ends up.
 */
export function pathMorph(o: MorphOutlines) {
  const k = o.pHeight / o.barHeight;
  const bar = pairs(o.bar).map(([x, y]): Point => [x, y * k]);
  const p = pairs(o.p);
  const mouth = pairs(o.mouth);
  const cx = mouth.reduce((s, [x]) => s + x, 0) / mouth.length;
  const cy = mouth.reduce((s, [, y]) => s + y, 0) / mouth.length;
  const slit = mouth.map(([x, y]): Point => [cx + (x - cx) * 0.6, cy + (y - cy) * 0.02]);
  const inBar = (points: Point[]) => points.map(([x, y]): Point => [x, y / k]);
  return {
    bar: toPath(pairs(o.bar)),
    p: toPath(p) + toPath(mouth),
    at(t: number) {
      const outline = lerp(bar, p, t);
      const hole = t > 0 ? lerp(slit, mouth, t) : null;
      return {
        inP: toPath(outline) + (hole ? toPath(hole) : ""),
        inBar: toPath(inBar(outline)) + (hole ? toPath(inBar(hole)) : ""),
      };
    },
  };
}

/** progress of the 2 → 3 change at `ms` into the cycle, eased like its cross-fade (EASE.out), or null outside it */
export function pathProgress(ms: number) {
  if (ms <= CYCLE.hold || ms >= CYCLE.face) return null;
  const t = (ms - CYCLE.hold) / (CYCLE.face - CYCLE.hold);
  return 1 - (1 - t) ** 3;
}

/** The whole logo's motion: a dip before the eyes pop, a slow tilt while the face lives, the wind-up, the snap back, the settle */
export const STAGE_KEYFRAMES: Keyframe[] = [
  { offset: 0, transform: "rotate(0deg) scale(1)", easing: EASE.inOut },
  { offset: at(CYCLE.hold), transform: "rotate(-2deg) scale(0.98)", easing: EASE.outBack },
  { offset: at(CYCLE.face), transform: "rotate(-5deg) scale(1.06)", easing: EASE.inOut },
  { offset: at(CYCLE.live), transform: "rotate(6deg) scale(1.03)", easing: EASE.in },
  { offset: at(CYCLE.windUp), transform: "rotate(12deg) scale(0.94)", easing: EASE.outExpo },
  { offset: at(CYCLE.back), transform: "rotate(0deg) scale(0.9)", easing: EASE.outExpo },
  { offset: 1, transform: "rotate(0deg) scale(1)" },
];

/**
 * the stretches where two states overlap, when the goo filter melts them together. Not 2 → 3:
 * there the bar's path turns into the P's, and the rest of the two states is nearly the same.
 */
const GOO_WINDOWS: [number, number][] = [
  [0, CYCLE.melt],
  [CYCLE.windUp, CYCLE.back],
];

/**
 * Goo filter settings at `ms` into the cycle. Strength follows sin over each morph window: zero at
 * its edges, so the logo is crisp at rest, and full mid-morph, where alpha × 18 − 7 snaps the
 * blurred edges hard.
 */
export function gooAt(ms: number, peakBlur: number) {
  const window = GOO_WINDOWS.find(([a, b]) => ms > a && ms < b);
  const strength = window ? Math.sin((Math.PI * (ms - window[0])) / (window[1] - window[0])) : 0;
  return {
    blurPx: +(peakBlur * strength).toFixed(2),
    slope: +(1 + 17 * strength).toFixed(2),
    offset: +(-7 * strength).toFixed(2),
  };
}
