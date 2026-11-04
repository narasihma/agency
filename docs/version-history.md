# Version history

Repository changes, newest first.

## 2026-11-03: Redraft logo: finer, slower line boil

- **Why:** the owner wanted the boil a bit finer and slower.
- **What changed:** the edges now move up to 1.5px (`BOIL_PX`, was 3px), and a new take comes every 1/8s, held on threes (`BOIL.fps` 8, was 12).

## 2026-11-03: Redraft logo: line boil on states 2–4

- **Why:** the owner wanted states 2, 3 and 4 to have livelier, jittery edges, like a paper-traced animation.
- **What changed:** `MorphLogo` has a second SVG filter, the line boil: fractal noise (`feTurbulence`, base frequency 0.07, 3 octaves) displaces the edges by up to 3px (`feDisplacementMap`). During the hover cycle it sits on the state 2 and state 3 layers, and the wink and state 4's closed eye are inside state 3. Every 1/12s the noise gets a new seed, cycling through four takes (`BOIL` and `boilTake` in `morph.ts`), so the edges hold still between frames and jump like drawings redrawn on twos. State 1, the resting logo, stays crisp, and the filter is removed when the cycle ends. Reduced motion skips it, as it skips the other movement.

## 2026-11-03: Redraft "Book a call" in Bricolage Grotesque

- **Why:** Recursive felt too soft and comic, so the owner picked option 2.
- **What changed:** the primary `ActionButton` label is Bricolage Grotesque ExtraBold (800) in its display cut (optical size 96), which keeps the ink traps and squeezed curves that read hand-made at 24px. `redraft/index.html` loads only that instance (`Bricolage+Grotesque:opsz,wght@96,800`) in place of Recursive. Letter spacing is 0, since the display cut is already tight. The casual-on-hover effect went with Recursive; the handle's nudge on hover stays.

## 2026-11-03: Redraft "Book a call" in Recursive

- **Why:** the owner wanted the Book a call label to feel organic but still read digital, without a script face (off-brand). They picked Recursive from the options given (Recursive, Bricolage Grotesque, Chillax/Pally, Funnel Display).
- **What changed:** the primary `ActionButton` label is Recursive Bold (was Knewave), loaded from Google Fonts with only its weight 700 and the Casual axis (`CASL` 0–1) in `redraft/index.html`. It rests at Casual 0.5, and hovering or keyboard focus eases it to 1 over 600ms (expo ease-out), a small echo of the logo melting. Casual doesn't change the letter widths, so the button doesn't shift. With reduced motion it switches without the transition. Letter spacing is −0.01em, size unchanged (24px).

## 2026-11-03: Redraft accent: deep green to charcoal

- **Why:** the owner wanted the accent (the deep green, `color/accent` in Figma) to be `#252525`.
- **What changed:** `--accent` in `RedraftPage.css` is `#252525` (was `#224506`), so the Book a call buttons, the chat button and the footer bar are charcoal. So is `ActionButton`'s fallback, and the accent baked into three SVGs from Figma: the arrow on the primary buttons' white handle (`arrow-on-accent.svg`), the chat icon's dots (`icon-chat.svg`) and the dot in the "Your website" slot (`empty-slot.svg`). White on `#252525` is about 15:1. Only the site changed: the Figma variable is still the green.

## 2026-11-03: Redraft logo: bar → P path morph, wink from state 4

- **Why:** the owner added state 4 (state 3 with the left eye closed) to the Figma "Animation" group for the wink, and asked for a path transition between state 2's turned 1 and state 3's turned P.
- **Parts build (`pnpm logo:build`, `scripts/redraft-logo.ts`):** reads the four states from `assets-src/redraft-logo/` (kept outside `public/`) and writes the parts to `public/assets/redraft/`: `logo-state-1.png`, `logo-state-2-top.png` (state 2 without its bar), `logo-state-3-top.png` (state 3 without its P or left pupil), `logo-state-3-pupil.png` and `logo-state-4-lid.png` (state 4's closed eye). It also writes `src/data/redraft-logo.ts`: the bar's and the P's outlines (traced from the images' alpha with marching squares, resampled to 160 points each and lined up point for point), the mouth (the P's loop), and where the eye parts sit. No dependencies: it decodes and encodes the PNGs with `node:zlib`. The whole-state images `logo-state-2.png` and `logo-state-3.png` are gone.
- **Path morph:** states 2 and 3 now draw their bottoms as SVG paths. From 0.7 to 0.92s both paths move point by point from the bar to the P (eased like the cross-fade), and the mouth opens from a slit in its middle. The two states carry the same outline, so state 2 stays solid under state 3 fading in, to avoid a washed-out middle. The goo filter no longer runs on this change; it still melts 1 → 2 and 3 → 1.
- **Wink:** now on the left eye, using state 4. The pupil squeezes into the closed eye's box from 1.5s, hands over to state 4's closed eye for about 40ms, and opens by 1.72s. The cut-out right pupil from the last change is gone.
- **`MorphLogo` props** are now `logo`, `melted` (top image + bar outline) and `face` (top image, P, mouth, pupil, lid), assembled in `src/data/redraft.ts` as `logoAnimation`.

## 2026-11-03: Redraft logo: quarter turn, longer state 2, wink

- **Why:** the owner asked for a 90° turn between states 1 and 2, a little more time on state 2 before state 3, and one of state 3's dots to wink before going back to 1.
- **Quarter turn:** state 2 is the 1B turned a quarter counter-clockwise (the B's bowls point up and the 1 lies along the bottom), so from 1 to 2 both states now turn −90° together while one melts into the other. Each is resized so that, turned, it fills the other's box, so the silhouettes line up throughout. 0–380ms, quick to start and long to land.
- **State 2 holds** from 380 to 700ms, then the eyes pop (700–920ms), with the whole logo dipping slightly just before.
- **Wink:** state 3's right pupil is cut out of `logo-state-3.png` into `logo-state-3-pupil.png` (61×61, placed at 320, 174 in state 3's pixels, `logoWink` in `src/data/redraft.ts`). At 1.5s it squeezes almost flat, holds for 40ms and opens by 1.72s, while the face is still idling, before the wind-up.
- **Timing:** the cycle is now 3.3s: wind-up 1.9–2.25s, snap back 2.25–2.65s, settle to 3.3s. The states are now wrappers (`.morph-logo__state`) that turn and stretch around their own middles, and every keyframe uses one transform shape (translate, rotate, scale) so the parts interpolate cleanly.

## 2026-11-03: Redraft logo animation retimed after a reference

- **Why:** 150ms per state was too quick. The owner pointed to a reference for timing and feel (dribbble upload 35813511, a mascot face morphing into a wordmark) and asked to replicate it with our three states.
- **Reference, measured frame by frame:** the face pops in (~0.35s, ease-out), lives with a slow tilt (~0.65s), leans further as a wind-up (~0.35s, accelerating), snaps into the wordmark (~0.4s, fast ease-out), then grows slightly into place and settles (~0.75s).
- **Our cycle on hover (2.9s, in `morph.ts`):** 0–0.28s 1B melts into state 2; 0.28–0.52s the eyes pop open into state 3, while the whole logo pops to 106% with a back-out ease; 0.52–1.5s the face lives, tilting from −5° to 6°; 1.5–1.85s the wind-up to 12° and 94%; 1.85–2.25s it snaps back into the 1B (fast expo ease-out), arriving at 90%; 2.25–2.9s it grows back to 100% and settles. The goo filter melts the silhouettes during the two morphs only and is off the rest of the time (left on while rotated, it showed a faint seam). The `morphMs`/`lingerMs` props are gone: the timeline is one set of keyframes per image plus one for the whole logo, played with the Web Animations API.
- **Reduced motion:** the same timeline as plain cross-fades, with no tilt, scale or goo.

## 2026-11-03: Redraft logo animation timing

- **Why:** the owner wanted 150ms between states and a 3-second linger on the last state before going back to the original.
- **What changed:** each morph now takes 150ms (`morphMs`, was 0.9s), and the states run 1 → 2 → 3 back to back (0.3s in all). The logo stays on state 3 for 3s (`lingerMs`, replacing the 5s `holdMs` on every state), then morphs back to state 1 in 150ms. A full cycle is about 3.45s. The spring easing and goo filter are unchanged, now compressed into the shorter morphs.

## 2026-11-03: Redraft logo animation

- **Why:** the owner wanted the hero logo to animate through the three states in the Figma "Animation" group (`32:612`), Smart Animate–style with smooth easing, 5 seconds apart, started by hovering.
- **States:** `public/assets/redraft/logo-state-1.png` (the plain 1B, now the resting logo in place of `logo.svg`, which is deleted), `-2.png` (melted) and `-3.png` (melted, with eyes), the 512px images from the Figma group.
- **`MorphLogo` component:** hovering or focusing the logo plays one cycle, 1 → 2 → 3 → 1, holding each state 5s (`holdMs`). A cycle plays to the end even if the pointer leaves, and hovering again mid-cycle doesn't restart it. Each change takes 0.9s (`morphMs`): the two images cross-fade while one stretches to the other's height on a spring easing (CSS `linear()` sampled from a damped spring, 8% overshoot; older browsers get a back-out cubic-bezier). An SVG blur + alpha-threshold ("goo") filter, strongest mid-change and off at rest, melts the two silhouettes together, so the logo reads as one shape morphing. The images are bitmaps, so there are no matching vector layers to interpolate as Figma's Smart Animate would. Visitors who ask for reduced motion get a plain cross-fade.
- **Layout:** the logo's box keeps state 1's proportions, so the taller states hang below it without moving the top bar.

## 2026-11-03: Redraft footer clock removed

- **Why:** the owner asked to remove the clock.
- **What changed:** the footer bar shows only "© 1BRAND 2027 — All rights reserved." The `LiveClock` component and the `clockCity`/`clockTimeZone` data are deleted, since nothing else used them.

## 2026-11-03: Redraft footer bar: live clock, 1BRAND copyright

- **Why:** the owner wanted the footer bar's time to run live without the time zone, and the copyright to read 1BRAND 2027.
- **Clock:** the static "Paris 09:55 (GMT +1)" is now "Paris" plus the current time in Paris (HH:MM, 24-hour), from the new `LiveClock` component. It shows the studio's time in any visitor's browser and updates on the minute. The city and its time zone (`clockCity`, `clockTimeZone: "Europe/Paris"`) are in `src/data/redraft.ts`.
- **Copyright:** "© SYBIOSME 2026" is now "© 1BRAND 2027".

## 2026-11-03: Redraft paper parallax

- **Why:** the owner wanted the background paper to move a little while scrolling.
- **What changed:** `.rd-paper` is now `--drift` (320px) taller than the screen and slides up by `--drift` across the whole page scroll, using a CSS scroll-linked animation (`animation-timeline: scroll(root block)`), so no script runs on scroll. On this page that's about 1/14 of the scroll speed. Browsers without scroll-linked animations (Firefox for now) and visitors who ask for reduced motion get the still paper as before.

## 2026-11-03: Redraft process card partly see-through

- **Why:** the owner wanted the black process card to show the paper and grain like the other cards, without losing readability.
- **What changed:** the card's fill is ink (`#111`) at 90% instead of solid. 90% is the most see-through it can go while the smallest grey text (the 12px `#AAA` dates on the lit Day cells) stays above 4.5:1 contrast over the brightest patches of paper. The grey body text and the yellow labels stay well above that.

## 2026-11-03: Redraft background: paper texture + analogue grain

- **Why:** the owner wanted the whole page on the hero's paper texture combined with the analogue noise from aaronbrimhall.com, kept light (off-white) rather than that site's dark ground.
- **Paper:** the hero no longer paints its own background. One fixed layer (`.rd-paper`) holds the paper texture behind the entire page, so every section sits on the same sheet and the content scrolls over it.
- **Grain:** a fixed layer (`.rd-grain`) between the paper and the content (moved behind the boxes, text and images at the owner's request; it shows through the see-through cards), ignoring the pointer, tiles a 128px grey noise image (`public/assets/redraft/grain.png`, generated, not copied) at 7% opacity and jumps it to 12 offsets every 0.5s, the same film-grain technique as that site. It stops moving for visitors who ask for reduced motion.
- **Structure:** both layers sit outside `.redraft-page`, because its container query would otherwise pin fixed layers to the page instead of the window.

## 2026-11-03: Redraft preview page

- **Why:** the owner wanted a local preview of the "Redraft" group in the Figma file (SYBIOSME homepage – editable reference, node `17:581`).
- **New page `/redraft/`:** `redraft/index.html` → `src/pages/Redraft/`, registered in `PAGES`, marked `noindex`. It has five sections: the 1BRAND hero, our approach, the 10-day process, the work grid and the footer. Copy and asset paths are in `src/data/redraft.ts`.
- **Layout:** the hero is the design's 1440 × 900 composition, scaled with the page width in `--u` (one design pixel, from container units). The sections below reflow: one column for the approach under 1180px, and everything stacks under 820px, where the hero becomes a normal stacked layout.
- **Type and colour:** Geist 500 and Knewave (the "Book a call" label) from Google Fonts. The 1BRAND wordmark is the Figma text exported as an SVG outline, because its face (BESAN) isn't a web font. Colours are the file's variables: accent `#224506`, accent-ink `#AFC336`, accent-warm `#FFD65A` on the black process card.
- **`ActionButton` component:** the white handle + arrow + label link in three variants: `primary` (accent fill with a caption), `ghost` and `outline`.
- **Assets:** `public/assets/redraft/`, downloaded from Figma. The paper texture is a 1440 × 900 JPEG; the project screenshots, avatars and footer mark are still SYBIOSME's.

## 2026-11-03: Project set up like the State Labs landing page

- **Why:** the owner wanted the same setup and habits as State Labs.
- **Stack:** React 19, TypeScript 7 (strict), Vite 8 with `@vitejs/plugin-react` and the Tailwind plugin (not used yet), oxfmt, pnpm 10.34.3 on Node 26 (`.mise.toml`). Three.js was left out until a page needs it.
- **Structure:** pages as separate HTML entries (`PAGES` in `vite.config.ts` registers each one's build entry, `/<page>` redirect and sitemap entry), `src/pages/<Name>/`, `src/components/<Name>/` behind an `index.ts`, copy in `src/data/`, shared tokens in `src/styles/global.css`, the `@/` alias for `src/`. The build writes `robots.txt` and `sitemap.xml` for `SITE_ORIGIN` (`.env.example`).
- **Home page:** a placeholder, the title "Agency" and "Portfolio coming soon." in the system font, until there's a design.
- **Docker:** `Dockerfile` and `compose.yaml` as in State Labs: a dev server with hot reload, and the production build served by nginx.
- **Agent setup:** `AGENTS.md` (read through `CLAUDE.md`) sets the conventions and the working rules: tasks in `docs/todo.md`, every change here, new work on `feature/<name>` from an up-to-date `main`. The project skills (`caveman`, `design-taste-frontend`, `impeccable`, `typescript-expert`, `vercel-react-best-practices`) and the impeccable agents are copied into `.claude/`.
- **Not copied:** the FTP deploy workflow, until there's somewhere to deploy to, and the Copilot copy of the skills in `.github/`.
