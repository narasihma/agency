# To do

Items from the site owner, in the order given. When one is finished, tick it, add the date it was done and a note on what changed, and record the change in `version-history.md` as usual.

## Open

## Done

- [x] **13. Redraft logo: use the new state 4 for the wink, and a path transition from state 2's turned 1 to state 3's turned P** (added 2026-11-03, done 2026-11-03). The bar and the P are traced into matching outlines and morph point by point while the mouth opens. The left eye winks into state 4's closed eye. A new `pnpm logo:build` rebuilds the parts from the Figma images. See `version-history.md`.

- [x] **12. Redraft logo: 90° turn between states 1 and 2, a longer beat on state 2, and a wink on state 3 before going back** (added 2026-11-03, done 2026-11-03). The 1B turns a quarter counter-clockwise as it melts, holds a third of a second, and the face winks its right eye before the wind-up. See `version-history.md`.

- [x] **11. Retime the Redraft logo animation after the dribbble reference (timing and feel)** (added 2026-11-03, done 2026-11-03). One 2.9s cycle on hover: melt, pop into the face, a slow living tilt, a wind-up, a fast snap back into the 1B and a soft settle. See `version-history.md`.

- [x] **10. Redraft logo timing: 150ms between states, 3s linger on the last before going back** (added 2026-11-03, done 2026-11-03). Hover now runs 1 → 2 → 3 in 0.3s, holds state 3 for 3s, then returns to 1. See `version-history.md`.

- [x] **9. Animate the Redraft logo through the Figma "Animation" group's states 1–3, 5s apart with smooth easing, started by hovering** (added 2026-11-03, done 2026-11-03). New `MorphLogo` component: hover plays 1 → 2 → 3 → 1 with a gooey spring morph between states. See `version-history.md`.

- [x] **8. Remove the clock from the Redraft footer bar** (added 2026-11-03, done 2026-11-03). Only the copyright is left in the bar; the `LiveClock` component is deleted. See `version-history.md`.

- [x] **7. Run the local time in the Redraft footer bar without the time zone, and change SYBIOSME 2026 to 1BRAND 2027** (added 2026-11-03, done 2026-11-03). The bar now reads "© 1BRAND 2027 — All rights reserved." and "Paris" with the live time there. See `version-history.md`.

- [x] **6. Give the Redraft background paper a bit of parallax while scrolling** (added 2026-11-03, done 2026-11-03). The paper drifts up 320px over the whole scroll, much slower than the content. See `version-history.md`.

- [x] **5. Make the Redraft black process card partly see-through, keeping it readable** (added 2026-11-03, done 2026-11-03). The card is now ink at 90%, so the paper and grain show faintly through it. See `version-history.md`.

- [x] **4. Run the Redraft grain behind the boxes, text and containers** (added 2026-11-03, done 2026-11-03). The grain layer now sits between the paper and the content instead of over everything. See `version-history.md`.

- [x] **3. Redraft background: the paper texture combined with aaronbrimhall.com's analogue noise, kept off-white** (added 2026-11-03, done 2026-11-03). The hero's paper now sits fixed behind the whole page, with a flickering film-grain overlay on top. See `version-history.md`.

- [x] **2. Build a local preview of the Figma "Redraft" group** (added 2026-11-03, done 2026-11-03). A new page at `/redraft/` with the hero, approach, process, work and footer sections, using the file's colours and assets; it scales the hero with the window and stacks on phones. See `version-history.md`.

- [x] **1. Set the project up like State Labs** (added 2026-11-03, done 2026-11-03). Same stack, structure and habits as the State Labs landing page (React 19, TypeScript, Vite, pnpm; this to-do list, a change log and `feature/` branches), with a placeholder home page until there's a design. On branch `feature/project-setup`. See `version-history.md`.
