import { useEffect, type RefObject } from "react";

/**
 * Where the paper sits in each stop-motion take, in px: 12 nudges in every direction, six a full
 * pixel out (every 60°) and six closer in between them (0.6px, offset by 30°).
 */
const TAKES: ReadonlyArray<readonly [number, number]> = [
  [1, 0],
  [0.5, 0.87],
  [-0.5, 0.87],
  [-1, 0],
  [-0.5, -0.87],
  [0.5, -0.87],
  [0.52, 0.3],
  [0, 0.6],
  [-0.52, 0.3],
  [-0.52, -0.3],
  [0, -0.6],
  [0.52, -0.3],
];

/** takes a second: each one is held for half a second */
const FPS = 2;

/**
 * Stop motion for the paper: twice a second, every element in `refs` jumps together to one of
 * the 12 takes, picked at random (never the one it is on), so the movement never settles into a
 * loop. It sets `translate`, which adds to any `transform` (the paper's scroll drift). Off while the
 * visitor prefers reduced motion.
 */
export default function usePaperTakes(refs: ReadonlyArray<RefObject<HTMLElement | null>>) {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer = 0;
    let current = 0;

    const place = (value: string) => {
      for (const ref of refs) if (ref.current) ref.current.style.translate = value;
    };
    const next = () => {
      const pick = Math.floor(Math.random() * (TAKES.length - 1));
      current = pick >= current ? pick + 1 : pick;
      const [x, y] = TAKES[current];
      place(`${x}px ${y}px`);
    };
    const update = () => {
      window.clearInterval(timer);
      if (reduce.matches) place("");
      else timer = window.setInterval(next, 1000 / FPS);
    };

    update();
    reduce.addEventListener("change", update);
    return () => {
      window.clearInterval(timer);
      reduce.removeEventListener("change", update);
      place("");
    };
    // runs once: the refs are stable objects for the page's lifetime
  }, []);
}
