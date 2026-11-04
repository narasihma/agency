import { useEffect, useRef } from "react";
import "./CrumplePaper.css";

export interface CrumplePaperProps {
  /** a photo of crumpled paper on white, multiplied over the paper below */
  src: string;
  className?: string;
}

/** how much of the scroll it takes to crumple fully; the rest of the page stays fully crumpled */
const FULL_AT = 0.85;
/** the photo's strength when fully crumpled */
const MAX_OPACITY = 0.8;
/** above 1, the crumpling starts slowly and gathers pace */
const EASE = 1.5;
/** distinct frames over the crumpling, as if the sheet were shot this many times */
const SHOTS = 24;
/** frames a second: how quickly it follows the scroll, in stop-motion steps */
const FPS = 8;

/**
 * Crumpled paper fading into the page's paper as it scrolls: none at the top, fully crumpled
 * near the end. It fills its parent and follows the scroll FPS times a second, in SHOTS steps.
 * The stop-motion takes (the nudges) belong to the parent, so the photo moves with the paper.
 */
export default function CrumplePaper({ src, className = "" }: CrumplePaperProps) {
  const layer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = layer.current;
    if (!el) return;
    let frame = 0;
    let last = -Infinity;
    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      if (now - last < 1000 / FPS) return;
      last = now;

      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, window.scrollY / max / FULL_AT) : 0;
      const shot = Math.round(Math.max(0, progress) * SHOTS) / SHOTS;
      el.style.opacity = String(+(MAX_OPACITY * shot ** EASE).toFixed(3));
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      ref={layer}
      className={`crumple-paper ${className}`}
      style={{ backgroundImage: `url(${src})`, opacity: 0 }}
      aria-hidden="true"
    />
  );
}
