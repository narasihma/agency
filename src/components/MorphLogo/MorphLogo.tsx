import { useEffect, useId, useMemo, useRef } from "react";
import { boilTake, CYCLE, gooAt, pathMorph, pathProgress, STAGE_KEYFRAMES, stateKeyframes, winkKeyframes } from "./morph.ts";
import "./MorphLogo.css";

export interface MorphLogoImage {
  src: string;
  /** natural size in pixels */
  width: number;
  height: number;
}

/** a part cut out of a state, placed in that state's pixels */
export interface MorphLogoPart extends MorphLogoImage {
  x: number;
  y: number;
}

export interface MorphLogoProps {
  href: string;
  label: string;
  /** state 1: the resting logo */
  logo: MorphLogoImage;
  /**
   * state 2, turned a quarter counter-clockwise from the logo: its image without the bar (the 1,
   * turned), and the bar's outline as x, y pairs in its pixels
   */
  melted: { top: MorphLogoImage; bar: number[] };
  /**
   * state 3, the character: its image without the P (the 1's counterpart, whose loop is the mouth)
   * or the left pupil; the P's outline and mouth point for point with the bar; the left pupil and
   * the closed eye (state 4) it winks into
   */
  face: { top: MorphLogoImage; p: number[]; mouth: number[]; pupil: MorphLogoPart; lid: MorphLogoPart };
  className?: string;
}

/** peak blur of the gooey morph, in CSS pixels */
const GOO_BLUR = 3;
/** how far the line boil pushes the edges of states 2–4, in CSS pixels (half each way) */
const BOIL_PX = 1.5;
/** the boil's wobble: about one bump every 14px of edge, with finer roughness on top */
const BOIL_FREQUENCY = 0.07;

const place = (part: MorphLogoPart, frame: MorphLogoImage) => ({
  left: `${(part.x / frame.width) * 100}%`,
  top: `${(part.y / frame.height) * 100}%`,
  width: `${(part.width / frame.width) * 100}%`,
});

/**
 * Logo link that, when hovered or focused, turns into its character and back (timeline in
 * morph.ts). The states cross-fade and take each other's shape while a blur + alpha-threshold
 * filter melts their silhouettes together; from 2 to 3 the bar's outline morphs into the P's
 * instead. Around that the whole logo dips, pops, tilts, winks, winds up and settles, and the
 * character's edges boil like a hand-traced drawing.
 */
export default function MorphLogo({ href, label, logo, melted, face, className = "" }: MorphLogoProps) {
  const uid = useId().replace(/[^\w-]/g, "");
  const filterId = `morph-goo-${uid}`;
  const boilId = `morph-boil-${uid}`;
  const stage = useRef<HTMLSpanElement>(null);
  const layers = useRef<(HTMLSpanElement | null)[]>([]);
  const barPath = useRef<SVGPathElement>(null);
  const pPath = useRef<SVGPathElement>(null);
  const pupil = useRef<HTMLImageElement>(null);
  const lid = useRef<HTMLImageElement>(null);
  const blur = useRef<SVGFEGaussianBlurElement>(null);
  const threshold = useRef<SVGFEColorMatrixElement>(null);
  const boilNoise = useRef<SVGFETurbulenceElement>(null);
  const running = useRef(false);
  const frame = useRef(0);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const frames = [logo, melted.top, face.top];
  const ratios = frames.map((s) => s.height / s.width);
  const morph = useMemo(
    () => pathMorph({ bar: melted.bar, p: face.p, mouth: face.mouth, barHeight: melted.top.height, pHeight: face.top.height }),
    [melted, face],
  );

  // hover or focus starts one cycle; it plays to the end even if the pointer leaves
  const play = () => {
    const el = stage.current;
    if (running.current || !el) return;
    running.current = true;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timing = { duration: CYCLE.end };

    // every animation ends where the inline styles already are, so nothing needs committing
    stateKeyframes(ratios).forEach((keyframes, i) => {
      layers.current[i]?.animate(reduced ? keyframes.map(({ transform: _, ...k }) => k) : keyframes, timing);
    });
    if (reduced) {
      window.setTimeout(() => (running.current = false), CYCLE.end);
      return;
    }
    el.animate(STAGE_KEYFRAMES, timing);
    const wink = winkKeyframes(face.pupil, face.lid);
    pupil.current?.animate(wink.pupil, timing);
    lid.current?.animate(wink.lid, timing);

    // states 2 and 3 (with the wink) boil for the whole cycle; they're hidden when not in play
    const boiling = layers.current.slice(1);
    boiling.forEach((layer) => layer && (layer.style.filter = `url(#${boilId})`));
    let take = -1;

    const start = performance.now();
    const step = (now: number) => {
      const ms = now - start;
      // a new take only on its frame, so the edges hold still in between like drawn frames
      const seed = boilTake(ms);
      if (seed !== take) {
        take = seed;
        boilNoise.current?.setAttribute("seed", String(seed));
      }
      const { blurPx, slope, offset } = gooAt(ms, GOO_BLUR);
      blur.current?.setAttribute("stdDeviation", String(blurPx));
      threshold.current?.setAttribute("values", `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${slope} ${offset}`);
      // only filter during the morphs: a filtered, rotated logo can show the filter's edge
      el.style.filter = blurPx > 0 ? `url(#${filterId})` : "";

      // the bar → P transition; outside it each layer shows its own shape
      const t = pathProgress(ms);
      const shape = t === null ? null : morph.at(t);
      barPath.current?.setAttribute("d", shape ? shape.inBar : morph.bar);
      pPath.current?.setAttribute("d", shape ? shape.inP : morph.p);

      if (ms < CYCLE.end) {
        frame.current = requestAnimationFrame(step);
      } else {
        el.style.filter = "";
        boiling.forEach((layer) => layer && (layer.style.filter = ""));
        running.current = false;
      }
    };
    frame.current = requestAnimationFrame(step);
  };

  const outline = (frame: MorphLogoImage, ref: typeof barPath, d: string) => (
    <svg className="morph-logo__outline" viewBox={`0 0 ${frame.width} ${frame.height}`} preserveAspectRatio="none" aria-hidden="true">
      <path ref={ref} d={d} fill="#fff" fillRule="evenodd" />
    </svg>
  );

  return (
    <a
      className={`morph-logo ${className}`}
      href={href}
      aria-label={label}
      onPointerEnter={play}
      onFocus={play}
      style={{ "--morph-ratio": ratios[0], "--morph-max-ratio": Math.max(...ratios) }}
    >
      <span className="morph-logo__stage" ref={stage}>
        {frames.map((image, i) => (
          <span
            key={image.src}
            className="morph-logo__state"
            ref={(el) => {
              layers.current[i] = el;
            }}
            style={{ opacity: i === 0 ? 1 : 0 }}
          >
            <img src={image.src} alt="" width={image.width} height={image.height} />
            {i === 1 && outline(melted.top, barPath, morph.bar)}
            {i === 2 && (
              <>
                {outline(face.top, pPath, morph.p)}
                <img ref={pupil} className="morph-logo__part" src={face.pupil.src} alt="" width={face.pupil.width} height={face.pupil.height} style={place(face.pupil, face.top)} />
                <img
                  ref={lid}
                  className="morph-logo__part"
                  src={face.lid.src}
                  alt=""
                  width={face.lid.width}
                  height={face.lid.height}
                  style={{ ...place(face.lid, face.top), opacity: 0 }}
                />
              </>
            )}
          </span>
        ))}
      </span>
      <svg className="morph-logo__defs" aria-hidden="true" focusable="false">
        <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
          <feGaussianBlur ref={blur} in="SourceGraphic" stdDeviation="0" />
          <feColorMatrix ref={threshold} type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" />
        </filter>
        {/* the line boil: noise pushes the edges about; a new seed is a new take */}
        <filter id={boilId} x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
          <feTurbulence ref={boilNoise} type="fractalNoise" baseFrequency={BOIL_FREQUENCY} numOctaves="3" seed="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={BOIL_PX} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
    </a>
  );
}
