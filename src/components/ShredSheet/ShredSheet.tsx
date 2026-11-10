import { useEffect, useRef, useState } from "react";
import type { ShredScene } from "./scene.ts";
import "./ShredSheet.css";

/** what is printed on the sheet and how it is cut */
export interface ShredLayout {
  /** the type printed across the sheet, one line each; it can only be read when the strips come together */
  lines: string[];
  /** how much of each line's first letter is lost past the sheet's left edge, as if the shredder took it (0 to 1) */
  cut?: number;
  /** how much of the longest line's last letter is lost past the sheet's right edge (0 to 1); it then sizes the type */
  cutEnd?: number;
  /** the sheet's width over its height */
  aspect?: number;
  /** how many strips the sheet is cut into */
  strips?: number;
}

export interface ShredSheetProps extends ShredLayout {
  /** another sheet for small screens: used while `query` matches, in place of the props above */
  narrow?: ShredLayout & { query: string };
  /** small print in the sheet's top left corner */
  caption?: string;
  /** small print in its bottom right corner */
  folio?: string;
  /** what the sheet says, for screen readers */
  label: string;
  className?: string;
}

const useMatch = (query: string | undefined) => {
  const [matches, setMatches] = useState(() => (query ? window.matchMedia(query).matches : false));
  useEffect(() => {
    if (!query) return setMatches(false);
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);
  return matches;
};

/**
  A printed sheet, shredded into strips that float apart in 3D (three.js, loaded on demand). Hover,
  keyboard focus or a tap brings them back together so the type can be read. Sizes come from the
  page: the stage fills its box, and the sheet fills `--shred-fill` of the stage's width.
*/
export default function ShredSheet({
  narrow,
  caption = "",
  folio = "",
  label,
  className = "",
  ...wide
}: ShredSheetProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const small = useMatch(narrow?.query);
  const layout = small && narrow ? narrow : wide;
  const { cut = 0, cutEnd = 0, aspect = 1.12, strips = 32 } = layout;
  const text = layout.lines.join("\n");

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;
    let scene: ShredScene | null = null;
    let cancelled = false;
    const css = getComputedStyle(stage);
    const read = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
    import("./scene.ts")
      .then(({ createShredScene }) => {
        if (cancelled) return;
        scene = createShredScene(stage, canvas, {
          lines: text.split("\n"),
          cut,
          cutEnd,
          aspect,
          caption,
          folio,
          strips,
          font: read("--shred-font", "sans-serif"),
          mono: read("--shred-mono", "monospace"),
          paper: read("--shred-paper", "#f4f3ef"),
          ink: read("--shred-ink", "#111111"),
        });
        stage.dataset.ready = "";
      })
      .catch(() => {
        // no WebGL: the sheet is decoration, so the stage just stays empty
      });
    return () => {
      cancelled = true;
      scene?.dispose();
      delete stage.dataset.ready;
    };
  }, [text, cut, cutEnd, aspect, caption, folio, strips]);

  return (
    <div ref={stageRef} className={`shred ${className}`} role="img" aria-label={label} tabIndex={0}>
      {/* a new canvas for each sheet, so a new scene never inherits the last one's context */}
      <canvas key={`${text}|${aspect}|${strips}`} ref={canvasRef} className="shred__canvas" />
    </div>
  );
}
