# Version history

Repository changes, newest first.

## 2026-11-04: Assets consolidated under public/assets

- **Why:** the owner asked why `assets-src/` and `public/assets/redraft/` exist, and to consolidate them under `public/assets/` with unreferenced assets removed.
- **Served images:** `public/assets/redraft/*` moved to `public/assets/`, so the home page loads `/assets/<name>` (`asset()` in `src/data/home.ts`) and `pnpm logo:build` writes its parts there. All 53 images are used by the page (the 21 paper balls through `PAPER_PILE`), so none were removed.
- **Sources:** `assets-src/` held the images the served ones were made from, kept out of `public/` so they wouldn't be served. The four Figma logo states (36KB) moved to `public/assets/logo-src/`, where `scripts/redraft-logo.ts` now reads them. They are now served, though no page loads them. Rerunning the script gives byte-identical parts; only the generated header of `src/data/redraft-logo.ts` names the new folder. The three paper photos (`crumpled-paper.png`, `paper-balls.png`, `torn-sheet.jpg`, 15MB) were only the input to a one-off conversion and nothing reads them. They were removed from the project into the owner's macOS Trash (`~/.Trash/1brand-redraft-paper-sources`), so they can still be restored.
- **Docs:** `AGENTS.md` describes the new layout.

## 2026-11-04: The Redraft page becomes Home

- **Why:** the owner asked for the Redraft page to be the homepage, under the name Home.
- **Page:** `src/pages/Redraft/` became `src/pages/Home/` (`RedraftPage` → `HomePage`, `RedraftPage.css` → `HomePage.css`) and replaced the placeholder home. `index.html` now loads it, has the 1BRAND title and loads the Geist and Bricolage Grotesque fonts. It has no `noindex`, so search engines can index the home page. `redraft/index.html` is gone, and `PAGES` in `vite.config.ts` is empty, so `/redraft/` no longer exists and the sitemap lists only `/`.
- **Names:** the page's identifiers now say Home: `html.redraft` → `html.home`, `.redraft-page` → `.home-page`, and the `rd-` class prefix → `home-` (`.home-hero`, `.home-paper`, `.home-desk` …). `src/data/redraft.ts` became `src/data/home.ts`, replacing the placeholder copy (`REDRAFT` → `HOME`, `REDRAFT_ASSETS` → `HOME_ASSETS`, `Redraft*` types → `Home*`). The design's source material keeps the Redraft name: `public/assets/redraft/`, `assets-src/redraft-*`, `scripts/redraft-logo.ts` and the generated `src/data/redraft-logo.ts`.
- **Docs:** `AGENTS.md` and `README.md` describe the new home. `docs/todo.md` is new and holds the owner's tasks.

## 2026-11-04: Redraft: the torn sheet at half the scale

- **Why:** the folds in the torn sheet were too big. The owner supplied a version twice as wide, so at the same page width its folds are about half the size.
- **Asset:** `assets-src/redraft-paper/crumpled-paper.png` is now the owner's wide version (4939 × 4090, replacing the 2560 × 4456 one). It becomes `paper-crumpled-sheet-wide.jpg` (grayscale, 2880 × 2385 so it stays sharp at 2× on a 1440 page, 430KB), replacing `paper-crumpled-sheet.jpg`. The new name keeps a cached copy of the tall photo out of the new box. Its tear and shadow sit at 90–96% of its height, and its desk is the same `#f3f3f3`.
- **Layout:** the photo is now 82.8% as tall as it is wide. The tear stays where it was, 34% of the page width below the work section: the photo hangs 45.4% of the width up behind the work section (was 133%) and fades in over its top 40% (was 25%; the fade now runs over 33% of the width, was 43.5%). The footer starts 3.3% of the width up into the photo's desk (was 7%). The desk's grain follows (`inset: -45.4vw`, fading in over 33vw).

## 2026-11-04: Redraft paper: stop-motion jitter on the whole sheet

- **Why:** the 4-a-second takes only moved the crumple overlay, which is invisible near the top of the page and now hidden under the crumpled-sheet photo lower down, so the jitter had effectively gone. The owner asked for it back on the paper background.
- **What changed:** a CSS animation, `rd-paper-take` (750ms, `steps(1)`: three takes, 4 a second, nudging by up to 1px), now runs on `.rd-paper` (the texture and the crumple inside it) and on the crumpled-sheet photo, in sync. It uses `translate`, so on `.rd-paper` it adds to the scroll drift's `transform` (the two run as a pair of animations, the drift on the scroll timeline). `.rd-paper` is 4px larger on every side, and the sheet photo 2px wider each side, so the nudges never show an edge. `CrumplePaper` no longer nudges its photo itself (its `TAKES`/`TAKE_FPS` are gone); it only follows the scroll. Reduced motion turns the takes off.

## 2026-11-04: Redraft approach section: cards aligned

- **Why:** the intro card ended lower than the benefit cards beside it.
- **What changed:** `.rd-approach` now stretches its two columns to one height (was `align-items: start`), and `.rd-approach__benefits` has equal rows that fill it (`grid-auto-rows: 1fr`). At 1440 and 1920 the intro and the benefits now both run from 964 to 1365px, with the two rows of benefits meeting at the 17px gap. The cards grew by about 9px each. Stacked layouts (below 1180px) are unchanged.

## 2026-11-04: Redraft: the owner's crumpled, torn sheet replaces the torn-sheet photo

- **Why:** the paper above and the torn piece still didn't match, in scale or where one faded into the other. Two attempts to bridge them (a finer in-between texture, then a torn strip across the join) were reverted before being committed. The owner then supplied one photo of crumpled paper torn off onto a desk at its foot, to blend with the page's background.
- **Asset:** `assets-src/redraft-paper/crumpled-paper.png` (the owner's, 2560 × 4456) becomes `paper-crumpled-sheet.jpg` (grayscale, full size, 710KB), replacing the old torn-sheet crop `paper-sheet.jpg`. It has a new name so a cached copy of the old, much wider photo can't turn up stretched in its box. It is full size, not downscaled, so it isn't blown up on wide or high-density screens. As a guard, the image is also `object-fit: cover`. Its tear and shadow sit at 89–96% of its height, and its desk (the bottom 4%) is `#f3f3f3`, now the desk colour.
- **Layout:** the photo is as wide as the page and 174% as tall as it is wide. It hangs 133% of the width up behind the work section and fades in over its top quarter, so the background blends into it. The footer starts 7% of the width up into the photo's desk, just under the tear (`.rd-desk__footer`). The margins are in % of the page's width, so they follow the photo's proportions at every size.
- **Stacking:** `.rd-desk` no longer isolates; it is a block formatting context instead, so the photo's negative margin doesn't pull it up. The desk colour (`::before`), the photo and the desk's grain sit at z-index −1, above the fixed paper and behind everything on the page, including the work cards the photo hangs behind. The grain now also covers the photo, fading in with it.
- **Unchanged:** the big-fold crumple still fades into the fixed paper as the page scrolls (`CrumplePaper`, one photo, as before). The pile and footer are as before.

## 2026-11-04: Redraft ending cropped up, slower jitter

- **Why:** the owner mocked up a tighter ending, cutting the empty desk between the torn edge and the footer and the space above the pile. They also found the jitter too intense.
- **Footer:** it now overlaps the bottom 22% of the torn-sheet photo (`.rd-desk__footer`, a negative top margin), so it starts on the photo's desk just under the torn edge and its shadow.
- **Pile:** the band is 290 design pixels tall (was 400), so it starts right under the footer's content. The tallest balls rise above it instead of being cut flat as in the mock-up, and they sit behind the footer content (the pile is at `z-index: -1` in the desk). The copyright bar now covers the pile's bottom.
- **Jitter:** the pile's pieces take 750ms per cycle of three takes (4 a second, was 8), moving half a pixel and up to 0.3° (was 1px and 0.6°). The crumpled paper still follows the scroll 8 times a second, but changes take only 4 times a second (`TAKE_FPS`), nudging by up to 1px (was 1.5px).

## 2026-11-04: Redraft background: photographic crumpling, torn sheet, paper pile

- **Why:** the shaded crumpling read as vector, not photographic. The owner supplied two reference photos (a torn, crumpled sheet on a white desk, and crumpled paper balls) and asked for the page to end on a pile of crumpled paper, with the torn half sheet somewhere along the end. A first pass for the owner to react to.
- **Sources** (`assets-src/redraft-paper/`): `torn-sheet.jpg` (the owner's photo at half size, 4032 × 2688; the 8064px original was 10MB) and `paper-balls.png`. They were turned into the served images in headless Chrome, in a one-off script that isn't in the repo yet. All the outputs are grayscale, to match the neutral paper. `paper-crumple.jpg` (3000 × 951) is the crumpled band above the torn edge. `paper-sheet.jpg` (2400 × 1042) is the torn edge with the desk under it; the desk's colour, sampled from its bottom rows, is `#f0f0f0`. `paper-ball-1…21.png` are cut out of the balls photo by colour: the paper is cream, while the background and its shadows are neutral, so pixels with chroma of 13 or more are paper. Low-chroma highlights enclosed by paper are filled back in, and the edges are softened by a pixel. Pieces 2, 5, 17 and 20 are the flat sheets.
- **Crumpling:** `CrumplePaper` no longer uses WebGL. It multiplies `paper-crumple.jpg` over the paper and fades it in with the scroll, in 24 steps, eased (power 1.5): none at the top, 80% by 85% of the way down. It updates at 8 fps and nudges the photo through three takes (up to 1.5px), like a stop-motion camera. The shader (`crumple.ts`) is gone.
- **Torn sheet:** after the work section, the page moves onto a full-width desk (`.rd-desk`). It starts with the torn-edge photo, `clamp(320px, 43.4vw, 900px)` tall, fading in over its top 30% so the crumpled paper above runs into it. Its bottom blends into the desk colour, which carries on under the footer. The desk has the same film grain, fading in with the photo. The footer's top padding dropped from 200px to 40px (24px on phones), since the sheet now sets it apart.
- **Pile:** 21 cut-outs at the foot of the page, between the footer's content and the copyright bar: flat sheets at the back, then a row of balls and a lower row in front. They're laid out on a 1440-wide frame in design pixels (`PAPER_PILE` in `src/data/redraft.ts`), drawn at 1.2× their photo size with a soft shadow and lifted 8% in brightness to match the desk. On phones the frame stays at least 55% of its desktop size, centred and cut to the screen. Each piece twitches through three takes at 8 fps (a pixel and under a degree), each starting at a different moment. Reduced motion stops them.
- **Rights:** the reference photos look like stock or AI images. Their licence needs checking before the site goes public, or they need replacing with our own shots.

## 2026-11-04: Redraft background: stop-motion crumpled paper

- **Why:** the background looked stale despite the grain. The owner pointed to a stock clip of crumpled paper in stop motion and asked for the paper to start smooth and get more crumpled towards the end of the site. The effect is drawn in code; nothing from the clip is used.
- **What changed:** new `CrumplePaper` component (`src/components/CrumplePaper/`), a WebGL canvas with no library. The shader (`crumple.ts`) shades the sheet as a crumpled height field from four layers of Voronoi cells, from 640px folds down to about 60px creases. Each cell rises from its edges (the creases) and is tilted its own way, with a thin dark line along each fold. It draws only light and shadow over the paper texture, capped at 16% shadow and 14% highlight so text on the paper stays readable.
- **Scroll:** the crumpling follows the page's scroll in 30 steps, eased (power 1.4) so the upper sections show only the first big folds and the footer is fully crumpled. The top starts at 6%, close to the texture's own soft wrinkles. Folds made early stay put while finer ones come in.
- **Stop motion:** it redraws 8 times a second, like the logo's boil, and cycles through three takes: each moves fold corners by up to 2px, re-tilts the facets slightly and flickers the light. So the sheet keeps living even when the page is still. Under reduced motion it follows the scroll without the takes. Without WebGL the paper stays flat, as before.
- **Page:** the canvas sits inside `.rd-paper`, so it drifts with the paper's parallax. It is drawn at up to 1.5× pixel ratio.

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
