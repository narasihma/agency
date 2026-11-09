import { useEffect, useId, useRef, type ReactNode } from "react";
import "./WorkCarousel.css";

export interface WorkCarouselItem {
  id: string;
  /** shown over the bottom of the card */
  title?: string;
  /** what fills the card: an image, or anything else */
  content: ReactNode;
  className?: string;
}

export interface WorkCarouselProps {
  /**
    the cards. They loop endlessly, so together they should span the view and a card or two more
    (eight cards a quarter of the view wide do comfortably)
  */
  items: WorkCarouselItem[];
  /** names the carousel for screen readers */
  label: string;
  /** label beside the shift lights under the cards ("RPM"); leave out to hide the lights */
  tachLabel?: string;
  /** cut the cards' sides by hand (on by default) */
  cutEdges?: boolean;
  className?: string;
}

/*
  Behaviour after the work gallery on aaronbrimhall.com, as an endless loop. The track is moved by
  script: drag and fling it, swipe sideways on a trackpad or shift + wheel, or step with the arrow
  keys; on touch a swipe flings and settles on the nearest card. The cards loop: each is placed on
  its own, wrapped round a seam kept on the far side of the loop, out of view. The card in the middle
  of the view (or the hovered one) is current: in colour and biggest, its neighbours cascading down
  in size, the rest dimmed. The cards bow with the speed, their hand-cut sides boil while dragged,
  shift lights rev with the speed, and on desktop the cards drop in and out with the section's scroll.
  Without script it is a native scroller.
*/

/**
  how far the hovered card and its first and second neighbours lift, px (the reference lifts 50, 10
  and 4; here the hovered card also grows with the cascade, so a small lift is enough)
*/
const LIFT = [12, 4, 0];
/** a press only becomes a drag after this many px sideways */
const CLAIM_PX = 6;
/** how fast the track catches up with its target, per second, by what moved it */
const LAMBDA = { glide: 4, glideReduced: 12, wheel: 10, key: 7, drag: 30 };
/** no hover while the track moves faster than this, px/s */
const HOVER_MAX_SPEED = 700;
/** after a drag, clicks are swallowed for this long, ms */
const CLICK_GUARD_MS = 350;
/** a pause this long between wheel events starts a new gesture (and a new axis), ms */
const WHEEL_GESTURE_GAP = 140;
/** the fastest fling, px/s */
const FLING_MAX = 4000;
/** the shift lights: what full revs are, how they spool up and brake, where they redline and flash */
const TACH = {
  trackRef: 2400,
  scrollRef: 3500,
  scrollGain: 0.5,
  scrollLambda: 12,
  scrollJump: 15000,
  idle: 0.004,
  spool: 0.05,
  brake: 0.28,
  redline: 0.9,
  rearm: 0.75,
  lights: 7,
  lightFrom: 0.1,
  lightSoft: 0.05,
  hot: 2,
  flashes: 2,
  flashOn: 0.07,
  flashOff: 0.06,
  blip: 0.2,
  blipHold: 0.12,
};
/**
  the drop on scroll (desktop), as a timeline scrubbed by the section's progress through the window
  (from its top at the window's bottom to 70% of it past the window's top): the cards fall in from
  80% above, one after another, then fall 70% down and out, and the lights slip away with them
*/
const DROP = { in: 0.45, out: 2.51, barOut: 2.58, barDur: 0.25, dur: 0.4, stagger: 0.1, from: -80, to: 70, end: 0.7, lambda: 4 };
const DROP_QUERY = "(min-width: 992px)";
/**
  the speed warp: while the track moves, every card bows, its top and bottom trailing its middle by
  `perVelocity` px per px/s of speed, softly capped at `max`; it builds quickly and relaxes slowly.
  `margin` is how far past a card's sides the bowed card may reach, px
*/
const BEND = { perVelocity: 0.02, max: 64, spool: 0.1, brake: 0.32, margin: 80, off: 0.3 };
/**
  hand-cut side edges, after a dribbble card with a scissor-cut edge: each side runs in slightly
  crooked straight cuts (knots `knot` px apart) up to `depth` px in from the card's side, with a
  hair of jitter and the odd small notch. Every card gets its own cut.
*/
const CUT = { depth: 3.2, knot: [18, 72], step: [3, 7], jitter: 0.3, notch: 0.06, notchDepth: [0.8, 2] };
/**
  while the cards are dragged the cuts boil: each card is recut afresh, never the same cut twice, on
  its own clock, `fps` times a second on average give or take `spread` (so they don't change together)
*/
const CUT_BOIL = { fps: 3, spread: 0.35 };
/**
  the size cascade: the current card is drawn at FOCUS[0] of its size, its neighbours either side at
  FOCUS[1], and so on; the rest at 1. The row spaces itself round them, so the gaps stay even.
*/
const FOCUS = [1.5, 1.25, 1];

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
/** a remainder that is never negative */
const mod = (a: number, n: number) => ((a % n) + n) % n;
/** frame-rate independent easing towards a target */
const damp = (a: number, b: number, lambda: number, dt: number) => a + (b - a) * (1 - Math.exp(-lambda * dt));
const easeOut = (x: number) => 1 - (1 - x) * (1 - x);
const easeIn = (x: number) => x * x;
/** past 80% of the cap the bend eases into it instead of stopping dead */
const softCap = (x: number, max: number) => {
  const knee = 0.8 * max;
  const a = Math.abs(x);
  return a > knee ? Math.sign(x) * (knee + (max - knee) * Math.tanh((a - knee) / (max - knee))) : x;
};

/** a small seeded random generator, so each card keeps its cut */
const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/** how far in from its side a hand-cut edge runs, from top to bottom: [y, inset] pairs in px */
const cutEdge = (height: number, rand: () => number) => {
  const between = (r: number[]) => r[0] + (r[1] - r[0]) * rand();
  const knot = () => Math.min(CUT.depth, Math.max(0, between([0.3, CUT.depth - 0.4])));
  const points: [number, number][] = [];
  let y0 = 0;
  let x0 = knot();
  let y1 = between(CUT.knot);
  let x1 = knot();
  for (let y = 0; y < height; y += between(CUT.step)) {
    while (y > y1) {
      y0 = y1;
      x0 = x1;
      y1 += between(CUT.knot);
      x1 = knot();
    }
    let x = x0 + ((x1 - x0) * (y - y0)) / (y1 - y0) + (rand() - 0.5) * 2 * CUT.jitter;
    if (rand() < CUT.notch) x += between(CUT.notchDepth);
    points.push([y, Math.min(CUT.depth + 2, Math.max(0, x))]);
  }
  points.push([height, knot()]);
  return points;
};

/** a mask for a card w × h with both sides hand-cut */
const cutMask = (w: number, h: number, seed: number) => {
  const rand = seeded(seed);
  const left = cutEdge(h, rand);
  const right = cutEdge(h, rand);
  const f = (n: number) => +n.toFixed(2);
  const path = [
    ...left.map(([y, x]) => `${f(x)},${f(y)}`),
    ...right.reverse().map(([y, x]) => `${f(w - x)},${f(y)}`),
  ].join(" ");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f(w)} ${f(h)}" preserveAspectRatio="none"><polygon points="${path}"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
};

/**
  the warp's displacement map, one column top to bottom: red is 0.5 + 0.5·s², s running -1 to 1 down
  the card, so a displacement scale of -2·bend shifts each row by bend·s² (the middle stays put, the
  top and bottom move furthest); green stays at 0.5, so nothing moves vertically
*/
const warpMap = () => {
  const rows = 256;
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = rows;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const img = ctx.createImageData(1, rows);
  for (let y = 0; y < rows; y++) {
    const s = (2 * (y + 0.5)) / rows - 1;
    img.data.set([Math.round(255 * (0.5 + 0.5 * s * s)), 128, 0, 255], y * 4);
  }
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL("image/png");
};

interface Spool {
  a: number;
  y: number;
}

/** two-stage lag: quick to rise (spool), slow to fall (brake), like a rev needle */
const spool = (e: Spool, target: number, dt: number, up = TACH.spool, down = TACH.brake) => {
  const step = (from: number, to: number) => {
    const rising = to * from < 0 || Math.abs(to) > Math.abs(from);
    return from + (to - from) * (1 - Math.exp(-dt / (rising ? up : down)));
  };
  e.a = step(e.a, target);
  e.y = step(e.y, e.a);
  if (!Number.isFinite(e.a + e.y)) e.a = e.y = 0;
  if (target === 0 && Math.abs(e.a) < TACH.idle && Math.abs(e.y) < TACH.idle) e.a = e.y = 0;
};

export default function WorkCarousel({
  items,
  label,
  tachLabel,
  cutEdges = true,
  className = "",
}: WorkCarouselProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const tachRef = useRef<HTMLDivElement>(null);
  const warpRef = useRef<SVGFilterElement>(null);
  const warpMapRef = useRef<SVGFEImageElement>(null);
  const warpShiftRef = useRef<SVGFEDisplacementMapElement>(null);
  const warpId = `wc-warp-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  useEffect(() => {
    const root = rootRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    const bottom = bottomRef.current;
    if (!root || !viewport || !track || !bottom) return;
    const slides = [...track.children] as HTMLElement[];
    if (!slides.length) return;
    const cards = slides.map((slide) => slide.firstElementChild as HTMLElement);
    const faces = cards.map((card) => card.firstElementChild as HTMLElement);
    const n = slides.length;
    const tach = tachRef.current;
    const lights = tach ? [...tach.querySelectorAll<HTMLElement>(".wc__light")] : [];
    const warp = warpRef.current;
    const warpImage = warpMapRef.current;
    const warpShift = warpShiftRef.current;
    if (warpImage) warpImage.setAttribute("href", warpMap());
    const section = root.closest("section") ?? root;
    const reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const dropMq = window.matchMedia(DROP_QUERY);
    const reduced = () => reduceMq.matches;

    root.dataset.mode = "track";
    // the room the track keeps above the row for the biggest card (CSS reads it for its padding)
    root.style.setProperty("--wc-focus", String(FOCUS[0]));
    root.style.setProperty("--wc-lift-room", `${LIFT[0]}px`);

    const s = {
      /** how far along the loop the view is, px; unbounded, the loop wraps it */
      target: 0,
      current: 0,
      prev: 0,
      velocity: 0,
      started: false,
      view: 0,
      gap: 0,
      /** a card's width at rest (all cards share one size) */
      w: 0,
      /** the loop's length: every card and its gap */
      loop: 1,
      /** each card's middle as laid out in the track, px from the track's left */
      homes: [] as number[],
      /** each card's middle where the loop puts it now, px from the view's left */
      places: [] as number[],
      /** the cards from left to right as the loop puts them, and each card's place in that order */
      order: [] as number[],
      rank: [] as number[],
      frameLeft: 0,
      lambda: LAMBDA.glide,
      dragging: false,
      pointer: { x: 0, inside: false },
      pointerIndex: -1,
      keyIndex: -1,
      input: "pointer" as "pointer" | "keyboard",
      hover: -1,
      active: -1,
      visible: false,
      primed: false,
      dropP: -1,
    };

    /* ---------- the loop ---------- */

    /** where the loop puts card i when the view is at `at`: its middle, px from the view's left */
    const placeAt = (i: number, at: number) => {
      // the seam sits half a loop from the view's middle, on the far side, out of view
      const seam = s.view / 2 - s.loop / 2;
      return mod(s.homes[i] - at - seam, s.loop) + seam;
    };

    let slideX: string[] = [];
    const place = () => {
      s.places = slides.map((_, i) => placeAt(i, s.current));
      s.order = slides.map((_, i) => i).sort((a, b) => s.places[a] - s.places[b]);
      s.order.forEach((card, r) => (s.rank[card] = r));
      slides.forEach((slide, i) => {
        // from where the track lays it out to where the loop puts it
        const x = `translate3d(${(s.places[i] - s.homes[i]).toFixed(2)}px, 0, 0)`;
        if (x !== slideX[i]) slide.style.transform = slideX[i] = x;
      });
    };

    /** how many places apart two cards are along the loop as it lies now (negative: to the left) */
    const between = (from: number, to: number) => s.rank[to] - s.rank[from];

    /* ---------- the hand-cut sides ---------- */

    let cutSize = "";
    let restCuts: string[] = [];
    let cutResting: boolean[] = [];
    let cutClocks: number[] = [];
    const setMask = (el: HTMLElement, mask: string) => {
      el.style.maskImage = mask;
      el.style.setProperty("-webkit-mask-image", mask);
    };
    const showRest = () => {
      faces.forEach((face, i) => {
        if (cutResting[i]) return;
        cutResting[i] = true;
        setMask(face, restCuts[i] ?? "");
      });
    };
    /** a fresh cut's wait: around 1/fps, give or take the spread */
    const nextCut = () => (1 / CUT_BOIL.fps) * (1 + CUT_BOIL.spread * (2 * Math.random() - 1));
    /** boils the cuts while the cards are dragged, and settles them back after */
    const cutStep = (dt: number) => {
      if (!s.dragging || reduced() || !cutSize) {
        // the first fresh cuts come at scattered moments, not all at once
        cutClocks = faces.map(() => Math.random() / CUT_BOIL.fps);
        showRest();
        return;
      }
      const h = cards[0].offsetHeight;
      faces.forEach((face, i) => {
        cutClocks[i] -= dt;
        if (cutClocks[i] > 0) return;
        cutClocks[i] = nextCut();
        cutResting[i] = false;
        setMask(face, cutMask(s.w, h, (Math.random() * 2 ** 31) | 0));
      });
    };

    /* ---------- layout ---------- */

    const measure = () => {
      const focus = s.active;
      // exact sizes (offsetWidth and offsetLeft round to whole px, which adds up round the loop)
      s.w = parseFloat(getComputedStyle(slides[0]).width) || slides[0].offsetWidth;
      s.gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      const start = parseFloat(getComputedStyle(track).paddingLeft) || 0;
      s.homes = slides.map((_, i) => start + i * (s.w + s.gap) + s.w / 2);
      s.loop = Math.max(1, n * (s.w + s.gap));
      s.view = viewport.clientWidth;
      s.frameLeft = viewport.getBoundingClientRect().left;
      // the first project starts in the middle; after a resize the current card stays there
      const keep = s.started && focus >= 0 ? focus : 0;
      if (!s.dragging) {
        s.current = s.target = s.prev = s.homes[keep] - s.view / 2;
        s.velocity = 0;
      }
      s.started = true;
      slideX = [];
      place();
      // the warp works in a card's own px: the map spans its height, and the region reaches
      // BEND.margin past its sides for the bowed corners
      const h = cards[0].offsetHeight;
      const region = { x: -BEND.margin, y: 0, width: s.w + 2 * BEND.margin, height: h };
      for (const el of [warp, warpImage]) {
        if (el) for (const [k, v] of Object.entries(region)) el.setAttribute(k, String(v));
      }
      // the resting cuts are cut again only when the cards change size
      const size = cutEdges && s.w && h ? `${s.w}x${h}` : "";
      if (size !== cutSize) {
        cutSize = size;
        restCuts = faces.map((_, i) => (size ? cutMask(s.w, h, 7919 * (i + 1)) : ""));
        cutResting = faces.map(() => false);
        showRest();
      }
      cascadeKey = "";
      setCurrent(s.active, true);
    };

    /** the card under a point on screen, counting half the gap either side as its own */
    const indexAt = (clientX: number) => {
      const x = clientX - s.frameLeft;
      const reach = s.w / 2 + s.gap / 2;
      for (let i = 0; i < n; i++) if (Math.abs(x - s.places[i]) <= reach) return i;
      return -1;
    };

    /** the card nearest the middle of the view */
    const middleCard = () => {
      let best = -1;
      let dist = Infinity;
      s.places.forEach((x, i) => {
        const d = Math.abs(x - s.view / 2);
        if (d < dist) {
          dist = d;
          best = i;
        }
      });
      return best;
    };

    /** once the carousel is near the screen, every card's images load: they all come round */
    const prime = () => {
      if (!s.visible || s.primed) return;
      s.primed = true;
      track.querySelectorAll<HTMLImageElement>("img[loading='lazy']").forEach((img) => (img.loading = "eager"));
    };

    /* ---------- hover, focus, current ---------- */

    let blipUntil = -1;
    const updateLift = () => {
      const index = s.input === "keyboard" ? s.keyIndex : s.pointerIndex >= 0 ? s.pointerIndex : s.keyIndex;
      if (index === s.hover) return;
      const before = s.hover;
      s.hover = index;
      const k = reduced() ? 0 : 1;
      cards.forEach((card, i) => {
        const d = index < 0 ? LIFT.length : Math.abs(between(index, i));
        const lift = (d < LIFT.length ? LIFT[d] : 0) * k;
        const was = Number(card.dataset.lift || 0);
        if (lift === was) return;
        card.classList.toggle("is-rising", lift > was);
        card.dataset.lift = String(lift);
        card.style.setProperty("--wc-lift", `${-lift}px`);
      });
      if (before >= 0) cards[before].classList.remove("is-hover");
      if (index >= 0) {
        cards[index].classList.add("is-hover");
        blipUntil = performance.now() / 1000 + TACH.blipHold;
      }
    };

    const pointerHover = () => {
      if (s.dragging) return;
      const index = s.pointer.inside && Math.abs(s.velocity) < HOVER_MAX_SPEED ? indexAt(s.pointer.x) : -1;
      if (index === s.pointerIndex) return;
      s.pointerIndex = index;
      updateLift();
    };

    const setFocus = (index: number) => {
      if (index !== s.keyIndex) {
        if (s.keyIndex >= 0) cards[s.keyIndex].classList.remove("is-focus");
        s.keyIndex = index;
        if (index >= 0) cards[index].classList.add("is-focus");
      }
      updateLift();
    };

    /**
      the size cascade round the current card, both ways round the loop: each card's scale (FOCUS by
      how many places it is from the current one), and how far it moves sideways so the row stays
      evenly spaced round the bigger cards, the current card growing about its own middle. Cards
      scale from their foot. Worked out every frame (a card coming round the seam swaps sides), but
      written only when it changes.
    */
    let cascadeKey = "";
    const scaleAt = (d: number) => FOCUS[Math.min(Math.abs(d), FOCUS.length - 1)] ?? 1;
    const cascade = () => {
      const index = s.active;
      const k = reduced() || index < 0 ? 0 : 1;
      const key = `${index}:${k}:${s.order.join(",")}`;
      if (key === cascadeKey) return;
      cascadeKey = key;
      cards.forEach((card, i) => {
        const d = index < 0 ? FOCUS.length : between(index, i);
        let shift = 0;
        // each step out from the current card adds half the growth of the two cards it passes
        for (let j = 0; j < Math.abs(d); j++) shift += ((scaleAt(j) + scaleAt(j + 1)) / 2 - 1) * s.w;
        const scale = 1 + k * (scaleAt(d) - 1);
        card.style.setProperty("--wc-scale", scale.toFixed(4));
        card.style.setProperty("--wc-shift", `${(k * Math.sign(d) * shift).toFixed(2)}px`);
      });
    };

    /** one card is current (in colour, full strength, biggest); the rest are dimmed and cascade in size */
    const setCurrent = (index: number, force = false) => {
      if (index !== s.active || force) {
        if (s.active >= 0) cards[s.active].classList.remove("is-current");
        s.active = index;
        if (index >= 0) cards[index].classList.add("is-current");
        root.classList.toggle("has-current", index >= 0);
      }
      cascade();
    };

    /** the hovered card (or, from the keyboard, the stepped-to card) is current; else the middle one */
    const updateCurrent = () => {
      if (s.hover >= 0) return setCurrent(s.hover);
      if (s.input === "keyboard" && s.keyIndex >= 0) return setCurrent(s.keyIndex);
      setCurrent(middleCard());
    };

    /* ---------- moving ---------- */

    const moveTo = (x: number, lambda: number) => {
      s.lambda = lambda;
      s.target = x;
      if (reduced()) {
        s.current = s.prev = x;
        s.velocity = 0;
        place();
      }
    };

    /** brings card i to the middle of the view, the short way round */
    const centre = (i: number) => moveTo(s.current + (s.places[i] - s.view / 2), LAMBDA.key);

    /** where the view should stop near `at` so the nearest card sits in the middle */
    const settleNear = (at: number) => {
      let best = 0;
      let dist = Infinity;
      for (let i = 0; i < n; i++) {
        const d = placeAt(i, at) - s.view / 2;
        if (Math.abs(d) < Math.abs(dist)) {
          dist = d;
          best = i;
        }
      }
      return at + (best >= 0 ? dist : 0);
    };

    /* ---------- drag and fling ---------- */

    const drag = {
      id: null as number | null,
      type: "",
      startX: 0,
      startY: 0,
      startTarget: 0,
      claimed: false,
      samples: [] as { t: number; x: number }[],
    };
    let clickGuardUntil = 0;

    const flingVelocity = (now: number) => {
      const samples = drag.samples;
      if (samples.length < 2) return 0;
      const last = samples[samples.length - 1];
      if (now - last.t > 80) return 0;
      let first = last;
      for (let i = samples.length - 1; i >= 0 && last.t - samples[i].t <= 100; i--) first = samples[i];
      const dt = last.t - first.t;
      return dt > 0 ? clamp(((last.x - first.x) / dt) * 1000, -FLING_MAX, FLING_MAX) : 0;
    };

    const onPointerDown = (e: PointerEvent) => {
      if (drag.id !== null && drag.claimed) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      s.input = "pointer";
      drag.id = e.pointerId;
      drag.type = e.pointerType;
      drag.startX = e.clientX;
      drag.startY = e.clientY;
      drag.claimed = false;
      drag.samples.length = 0;
      // a press catches the gliding track
      s.target = s.current;
      drag.startTarget = s.current;
    };

    const cancelDrag = () => {
      drag.id = null;
      drag.claimed = false;
    };

    const dragMove = (e: PointerEvent) => {
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      if (!drag.claimed) {
        if (Math.abs(dx) < CLAIM_PX) {
          if (drag.type === "touch" && Math.abs(dy) > CLAIM_PX) cancelDrag();
          return;
        }
        if (drag.type === "touch" && Math.abs(dy) > Math.abs(dx)) return cancelDrag();
        drag.claimed = true;
        s.dragging = true;
        root.classList.add("is-dragging");
        try {
          viewport.setPointerCapture(e.pointerId);
        } catch {
          /* the pointer may already be gone */
        }
      }
      // no ends to stretch against: the loop just goes round
      s.target = drag.startTarget - dx;
      drag.samples.push({ t: e.timeStamp, x: e.clientX });
      if (drag.samples.length > 8) drag.samples.shift();
    };

    const release = (e: PointerEvent | null, fling: boolean) => {
      if (drag.id === null || (e && e.pointerId !== drag.id)) return;
      const id = drag.id;
      const claimed = drag.claimed;
      const type = drag.type;
      cancelDrag();
      if (!claimed) return;
      try {
        if (viewport.hasPointerCapture(id)) viewport.releasePointerCapture(id);
      } catch {
        /* already released */
      }
      s.dragging = false;
      root.classList.remove("is-dragging");
      clickGuardUntil = performance.now() + CLICK_GUARD_MS;
      s.lambda = reduced() ? LAMBDA.glideReduced : LAMBDA.glide;
      const v = fling && e && !reduced() ? flingVelocity(e.timeStamp) : 0;
      s.target -= v / s.lambda;
      // a swipe on touch settles with a card in the middle
      if (type !== "mouse") s.target = settleNear(s.target);
    };

    const onPointerMove = (e: PointerEvent) => {
      let moved = false;
      if (e.pointerType !== "touch") {
        moved = e.clientX !== s.pointer.x;
        s.pointer.x = e.clientX;
        if (!s.dragging) s.pointer.inside = true;
      }
      if (e.pointerId === drag.id) {
        if (drag.type !== "mouse" || e.buttons !== 0) return dragMove(e);
        release(e, false);
      }
      pointerHover();
      if (moved && s.input !== "pointer") {
        s.input = "pointer";
        updateLift();
      }
    };

    const onPointerEnter = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      s.pointer.x = e.clientX;
      s.pointer.inside = true;
      pointerHover();
    };
    const onPointerLeave = () => {
      s.pointer.inside = false;
      pointerHover();
    };
    const onPointerUp = (e: PointerEvent) => release(e, true);
    const onPointerCancel = (e: PointerEvent) => release(e, false);
    const onClickCapture = (e: MouseEvent) => {
      if (e.detail !== 0 && performance.now() < clickGuardUntil) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    const onDragStart = (e: Event) => e.preventDefault();

    /* ---------- wheel: sideways gestures move the track, vertical ones scroll the page ---------- */

    let wheelAxis: "x" | "y" | null = null;
    let lastWheel = -Infinity;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || s.dragging) return;
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? s.view || window.innerWidth : 1;
      let dx = e.deltaX * unit;
      let dy = e.deltaY * unit;
      if (e.shiftKey && !dx) {
        dx = dy;
        dy = 0;
      }
      if (e.timeStamp - lastWheel > WHEEL_GESTURE_GAP) wheelAxis = null;
      lastWheel = e.timeStamp;
      if (!wheelAxis) {
        if (!dx && !dy) return;
        wheelAxis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      }
      if (wheelAxis !== "x") return;
      e.stopPropagation();
      e.preventDefault();
      s.lambda = LAMBDA.wheel;
      s.target += dx;
    };

    /* ---------- keyboard: arrows step through the cards, Home and End go to the first and last ---------- */

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) return;
      e.preventDefault();
      let i = s.keyIndex >= 0 ? s.keyIndex : Math.max(0, middleCard());
      if (e.key === "Home") i = 0;
      else if (e.key === "End") i = n - 1;
      else if (s.keyIndex >= 0) i = s.order[mod(s.rank[i] + (e.key === "ArrowRight" ? 1 : -1), n)];
      s.input = "keyboard";
      setFocus(i);
      centre(i);
    };
    const onFocusOut = (e: FocusEvent) => {
      if (!root.contains(e.relatedTarget as Node | null)) setFocus(-1);
    };

    /* ---------- shift lights ---------- */

    const rpm: Spool = { a: 0, y: 0 };
    const blip: Spool = { a: 0, y: 0 };
    let rpmLevel = 0;
    let scrollY = NaN;
    let scrollV = 0;
    let armed = true;
    let flashT = -1;
    let drawn = "";

    const drawLights = (level: number, phase: number) => {
      if (!tach) return;
      const key = phase ? `p${phase}` : String(Math.round(level * 512));
      if (key === drawn) return;
      drawn = key;
      tach.classList.toggle("is-flash", phase === 1);
      tach.classList.toggle("is-blank", phase === 2);
      const count = lights.length;
      lights.forEach((light, i) => {
        const at = TACH.lightFrom + (i * (TACH.redline - TACH.lightFrom)) / Math.max(1, count - 1);
        light.style.setProperty("--on", clamp((level - (at - TACH.lightSoft)) / TACH.lightSoft).toFixed(3));
      });
    };

    const resetTach = () => {
      rpm.a = rpm.y = blip.a = blip.y = 0;
      rpmLevel = 0;
      blipUntil = -1;
      scrollY = NaN;
      scrollV = 0;
      flashT = -1;
      armed = true;
      drawLights(0, 0);
    };

    const tachStep = (dt: number, now: number) => {
      if (!tach) return;
      if (reduced()) {
        if (rpmLevel) resetTach();
        return;
      }
      const y = window.scrollY;
      if (Number.isFinite(scrollY)) {
        const v = (y - scrollY) / dt;
        scrollV = damp(scrollV, Math.abs(v) > TACH.scrollJump ? 0 : v, TACH.scrollLambda, dt);
        if (Math.abs(scrollV) < 1) scrollV = 0;
      }
      scrollY = y;
      const fromTrack = clamp(Math.abs(s.velocity) / TACH.trackRef);
      const fromScroll = TACH.scrollGain * clamp(Math.abs(scrollV) / TACH.scrollRef);
      let throttle = Math.max(fromTrack, fromScroll);
      if (throttle <= TACH.idle) throttle = 0;
      spool(rpm, throttle, dt);
      spool(blip, now < blipUntil ? TACH.blip : 0, dt);
      rpmLevel = Math.max(clamp(rpm.y), clamp(blip.y));

      // two quick flashes of every light at the redline, then it re-arms once the revs drop
      if (rpmLevel > 0) {
        if (rpmLevel >= TACH.redline && armed) {
          armed = false;
          flashT = 0;
        } else if (rpmLevel < TACH.rearm) armed = true;
      } else {
        flashT = -1;
        armed = true;
      }
      let phase = 0;
      if (flashT >= 0) {
        const period = TACH.flashOn + TACH.flashOff;
        if (flashT >= period * (TACH.flashes - 1) + TACH.flashOn) flashT = -1;
        else {
          phase = flashT % period < TACH.flashOn ? 1 : 2;
          flashT += dt;
        }
      }
      drawLights(rpmLevel, phase);
    };

    /* ---------- drop in and out on scroll (desktop) ---------- */

    const clearDrop = () => {
      s.dropP = -1;
      [...slides, bottom].forEach((el) => {
        el.style.translate = "";
        el.style.opacity = "";
      });
    };

    const dropStep = (dt: number) => {
      if (!dropMq.matches || reduced()) {
        if (s.dropP >= 0) clearDrop();
        return;
      }
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = clamp((vh - rect.top) / (vh + DROP.end * rect.height));
      const prev = s.dropP;
      s.dropP = prev < 0 ? p : damp(prev, p, DROP.lambda, dt);
      if (Math.abs(s.dropP - p) < 0.0005) s.dropP = p;
      if (s.dropP === prev) return;
      // the cards in view drop one after another, left to right; the rest come with the last of them
      const stride = s.w + s.gap || 1;
      const count = Math.max(1, Math.ceil(s.view / stride));
      const total = DROP.out + DROP.stagger * (count - 1) + DROP.dur;
      const t = s.dropP * total;
      slides.forEach((slide, i) => {
        const st = DROP.stagger * clamp(Math.round((s.places[i] - s.w / 2) / stride), 0, count - 1);
        const inT = easeOut(clamp((t - DROP.in - st) / DROP.dur));
        const outT = easeIn(clamp((t - DROP.out - st) / DROP.dur));
        slide.style.translate = `0 ${(DROP.from * (1 - inT) + DROP.to * outT).toFixed(2)}%`;
        slide.style.opacity = (inT * (1 - outT)).toFixed(3);
      });
      const barT = easeIn(clamp((t - DROP.barOut) / DROP.barDur));
      bottom.style.translate = `0 ${(100 * barT).toFixed(2)}%`;
      bottom.style.opacity = (1 - barT).toFixed(3);
    };

    /* ---------- the speed warp ---------- */

    const bendSpool: Spool = { a: 0, y: 0 };
    let bend = 0;
    const setWarp = (px: number) => {
      bend = px;
      const on = Math.abs(px) >= BEND.off;
      warpShift?.setAttribute("scale", on ? (-2 * px).toFixed(2) : "0");
      // the filter only runs while the cards are bowed
      if (on) root.style.setProperty("--wc-warp", `url(#${warpId})`);
      else root.style.removeProperty("--wc-warp");
    };

    const bendStep = (dt: number) => {
      if (!warpShift || reduced()) {
        if (bend) {
          bendSpool.a = bendSpool.y = 0;
          setWarp(0);
        }
        return;
      }
      const target = clamp((s.velocity * BEND.perVelocity) / BEND.max, -1.5, 1.5);
      spool(bendSpool, target, dt, BEND.spool, BEND.brake);
      const px = softCap(bendSpool.y * BEND.max, BEND.max);
      if (Math.abs(px - bend) >= 0.05 || (px === 0 && bend !== 0)) setWarp(Math.abs(px) < BEND.off ? 0 : px);
    };

    /* ---------- the frame loop, while the carousel is near the screen ---------- */

    let raf = 0;
    let lastFrame = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = lastFrame ? Math.min(0.1, (now - lastFrame) / 1000) : 1 / 60;
      lastFrame = now;
      if (dt <= 0) return;
      let c = damp(s.current, s.target, s.dragging ? LAMBDA.drag : s.lambda, dt);
      if (!s.dragging && Math.abs(s.target - c) < 0.05) c = s.target;
      s.current = c;
      s.velocity = damp(s.velocity, (s.current - s.prev) / dt, 14, dt);
      s.prev = s.current;
      if (!s.dragging && s.current === s.target && Math.abs(s.velocity) < 2) s.velocity = 0;
      place();
      prime();
      pointerHover();
      updateCurrent();
      tachStep(dt, now / 1000);
      bendStep(dt);
      cutStep(dt);
      dropStep(dt);
    };
    const start = () => {
      if (!raf) {
        lastFrame = 0;
        raf = requestAnimationFrame(frame);
      }
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    measure();
    resetTach();

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting === s.visible) return;
        s.visible = entry.isIntersecting;
        if (s.visible) start();
        else {
          stop();
          s.pointerIndex = -1;
          s.pointer.inside = false;
          updateLift();
        }
      },
      { rootMargin: "10% 0px" },
    );
    io.observe(section);
    // resizes keep the current card in the middle (measure re-centres it)
    let lastWidth = root.clientWidth;
    const ro = new ResizeObserver(() => {
      if (root.clientWidth === lastWidth && s.started) {
        s.frameLeft = viewport.getBoundingClientRect().left;
        return;
      }
      lastWidth = root.clientWidth;
      measure();
    });
    ro.observe(root);

    const on = <K extends keyof HTMLElementEventMap>(
      el: HTMLElement,
      type: K,
      fn: (e: HTMLElementEventMap[K]) => void,
      opts?: AddEventListenerOptions | boolean,
    ) => {
      el.addEventListener(type, fn, opts);
      return () => el.removeEventListener(type, fn, opts);
    };
    const passive = { passive: true };
    const offs = [
      on(viewport, "pointerdown", onPointerDown, passive),
      on(viewport, "pointermove", onPointerMove, passive),
      on(viewport, "pointerup", onPointerUp, passive),
      on(viewport, "pointercancel", onPointerCancel, passive),
      on(viewport, "lostpointercapture", onPointerCancel, passive),
      on(viewport, "pointerenter", onPointerEnter, passive),
      on(viewport, "pointerleave", onPointerLeave, passive),
      on(viewport, "click", onClickCapture, true),
      on(viewport, "dragstart", onDragStart),
      on(root, "wheel", onWheel, { passive: false }),
      on(root, "keydown", onKeyDown),
      on(root, "focusout", onFocusOut),
    ];
    const onReduce = () => {
      s.hover = -2; // force a redraw of the lifts
      updateLift();
      setCurrent(s.active, true);
    };
    reduceMq.addEventListener("change", onReduce);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      offs.forEach((off) => off());
      reduceMq.removeEventListener("change", onReduce);
      delete root.dataset.mode;
      slides.forEach((slide) => (slide.style.transform = ""));
      clearDrop();
      root.style.removeProperty("--wc-warp");
      faces.forEach((face) => setMask(face, ""));
    };
  }, [items.length, warpId, cutEdges]);

  return (
    <div ref={rootRef} className={`wc ${className}`}>
      {/* the speed warp; its map and region are filled in by script */}
      <svg className="wc__defs" width="0" height="0" aria-hidden="true" focusable="false">
        <filter
          ref={warpRef}
          id={warpId}
          filterUnits="userSpaceOnUse"
          primitiveUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feImage ref={warpMapRef} preserveAspectRatio="none" result="map" />
          <feDisplacementMap
            ref={warpShiftRef}
            in="SourceGraphic"
            in2="map"
            scale="0"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>
      <div
        ref={viewportRef}
        className="wc__viewport"
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label={label}
      >
        <ul ref={trackRef} className="wc__track">
          {items.map((item) => (
            <li key={item.id} className="wc__slide">
              <div className="wc__card">
                <div className={`wc__face ${item.className ?? ""}`}>
                  {item.content}
                  {item.title && <p className="wc__title">{item.title}</p>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div ref={bottomRef} className="wc__bottom">
        {tachLabel && (
          <div ref={tachRef} className="wc__tach" aria-hidden="true">
            <span className="wc__tach-label">{tachLabel}</span>
            <span className="wc__lights">
              {Array.from({ length: TACH.lights }, (_, i) => {
                const plain = TACH.lights - TACH.hot;
                const hot = i >= plain;
                // the plain lights brighten along the row; the last ones are the redline
                const level = hot ? 1 : 0.5 + (0.45 * i) / Math.max(1, plain - 1);
                return (
                  <span
                    key={i}
                    className={`wc__light${hot ? " is-hot" : ""}`}
                    style={{ "--level": level.toFixed(3) }}
                  />
                );
              })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
