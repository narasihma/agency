# To do

Items from the site owner, in the order given. When one is finished, tick it, add the date it was done and a note on what changed, and record the change in `version-history.md` as usual.

## Open

## Done

- [x] **44. Redraft work carousel: revert 43, back to the RPM lights** (added 2026-11-10, done 2026-11-10). The onlookers and their code are gone; the carousel is as committed in `f2a0eac`. See `version-history.md`.

- [x] **43. Redraft work carousel: try out the "head-turning" visual metaphor, a crowd of paper heads under the cards that turn towards the current one, instead of the RPM lights** (added 2026-11-10, done 2026-11-10, reverted in 44). A front and a back row of cut-paper onlookers turned in stop motion to look at the current card. An interesting idea, but not it.

- [x] **42. Redraft work carousel: remove the slider altogether and make the cards loop endlessly** (added 2026-11-09, done 2026-11-09). No bar; the cards wrap round endlessly with the middle one in focus, on desktop and touch alike. See `version-history.md`.

- [x] **41. Redraft work carousel: randomise the cards' edge boil, it looks too cyclical** (added 2026-11-09, done 2026-11-09). Every recut is new, and each card and bar part changes on its own irregular clock. See `version-history.md`.

- [x] **40. Redraft work carousel: smooth out the jump in card sizes (they touched their neighbours)** (added 2026-11-09, done 2026-11-09). Growth and spacing now ease together over 0.75s, so the gaps hold. See `version-history.md`.

- [x] **39. Redraft work carousel: the focused card another 20% bigger** (added 2026-11-09, done 2026-11-09). Now 150% (neighbours 125%), about 490px on a 1440 screen. See `version-history.md`.

- [x] **38. Redraft work carousel: round the bar's corners and give its sides the cards' hand-cut edge** (added 2026-11-09, done 2026-11-09). Track and thumb have 4px corners and hand-cut ends that boil with the cards'. See `version-history.md`.

- [x] **37. Redraft work carousel: dim to 70%, the focused card 30% bigger with the next cards cascading in size; the bar back to its previous design, only with arrows instead of < >** (added 2026-11-09, done 2026-11-09). See `version-history.md`.

- [x] **36. Redraft work carousel: one focused card with the rest dimmed; a thinner bar with the torn, live paper edge; scribbled arrows instead of < >** (added 2026-11-09, done 2026-11-09; the torn bar reverted in 37). The hovered card, or the one the scroll has reached, is in colour and the rest dim to 55%; the bar is 12px with a boiling torn edge; the thumb has hand-drawn arrows. See `version-history.md`.

- [x] **35. Redraft work carousel: slow down the cards' side jitter while they move** (added 2026-11-09, done 2026-11-09). The cut sides now change 3 times a second while dragged (was 12; 6 was still too fast). See `version-history.md`.

- [x] **34. Redraft: work cards' corners to match the site's, the cut sides jittering only while dragging, and the crumpled paper's side-to-side jitter slowed down** (added 2026-11-09, done 2026-11-09). Cards at 4px like every other box; the cuts boil at 12fps only on a drag; the paper now jumps twice a second (was 4), as the owner chose. The film grain, slowed by mistake at first, is back at 24fps. See `version-history.md`.

- [x] **33. Redraft work carousel: a gentler warp, and the dribbble card's hand-cut edge on our cards' sides** (added 2026-11-09, done 2026-11-09). The bow is about half as strong, and each card's sides are cut by hand, a different cut per card. See `version-history.md`.

- [x] **32. Redraft work carousel: the speed warp when it moves left or right** (added 2026-11-09, done 2026-11-09). The cards now bow with the track's speed, top and bottom trailing, as on aaronbrimhall.com. See `version-history.md`.

- [x] **31. Redraft work section: a horizontal carousel with aaronbrimhall.com's behaviour (styling to be changed afterwards)** (added 2026-11-09, done 2026-11-09). New `WorkCarousel` component: drag and fling, sideways wheel, a scrubbable bar, arrow keys, hover lift and colour, shift lights, and cards dropping in and out on scroll; a native snapping scroller on touch. See `version-history.md`.

- [x] **30. Redraft: shorten the paper between the work section and the tear, so it sits as tight as the other sections** (added 2026-11-09, done 2026-11-09). The tear now tops out a fixed 48px below the work section at every width. See `version-history.md`.

- [x] **29. Redraft: scrap the paper balls below the footer** (added 2026-11-09, done 2026-11-09). The pile, its data and its 21 cut-out images are gone; the footer ends on the bar. See `version-history.md`.

- [x] **28. Redraft: the paper's jitter feels cyclical; move it in all 4 directions, 12 variations at the same pace, in a random pattern** (added 2026-11-09, done 2026-11-09). The paper and the crumpled sheet now jump together, 4 times a second, to one of 12 offsets picked at random. See `version-history.md`.

- [x] **27. Redraft: the torn page's scale is too big; use the owner's double-width image instead** (added 2026-11-04, done 2026-11-04). The new photo's folds are about half the size; the tear stays in the same place above the footer. See `version-history.md`.

- [x] **26. Redraft: bring back the 4-a-second stop-motion jitter on the paper background** (added 2026-11-04, done 2026-11-04). The whole paper (texture and crumple) and the crumpled sheet now step through three takes 4 times a second, in sync. See `version-history.md`.

- [x] **25. Redraft: align the boxes in the second section (approach)** (added 2026-11-04, done 2026-11-04). The intro card and the four benefit cards now share a top and a bottom edge on desktop. See `version-history.md`.

- [x] **24. Redraft: revert 22 and 23, drop their images, and blend the owner's crumpled paper (torn off onto a desk) with the original background** (added 2026-11-04, done 2026-11-04). The owner's photo replaces the torn-sheet photo. It hangs up behind the work section, fading into the background, and tears off just above the footer. See `version-history.md`.

- [x] **23. Redraft: collage one of the live edges from the owner's torn-edges image between the paper above and the torn sheet** (added 2026-11-04, done 2026-11-04, reverted in 24). A traced edge, then a whole strip across the join. Neither was it.

- [x] **22. Redraft background: an in-between texture so the paper blends into the torn piece** (added 2026-11-04, done 2026-11-04, reverted in 24). The owner's finer crumple between the big folds and the torn sheet.

- [x] **21. Redraft ending: crop it up after the owner's mock-up, and slow the stop-motion jitter** (added 2026-11-04, done 2026-11-04). The footer now starts just under the torn edge, the pile sits right under the footer's content, and the paper and the pile jitter half as often and half as far. See `version-history.md`.

- [x] **20. Redraft background: photorealistic instead of vector, ending on the torn half sheet and a pile of crumpled paper (owner's reference photos)** (added 2026-11-04, done 2026-11-04). The crumpling is now a photo fading in down the page; the sheet tears off above the footer onto a white desk, and the page ends on a pile of paper balls cut out of the reference. A first pass to react to. See `version-history.md`.

- [x] **19. Liven up the Redraft background: stop-motion crumpled paper, flat at the top and more crumpled towards the end of the page** (added 2026-11-04, done 2026-11-04). After a stock clip of crumpled paper in stop motion. New `CrumplePaper` component: the folds deepen and multiply as you scroll, and it redraws 8 times a second in slightly different takes. See `version-history.md`.

- [x] **18. Redraft logo boil: finer (1.5px) and slower (8 fps)** (added 2026-11-03, done 2026-11-03). See `version-history.md`.

- [x] **17. Redraft logo: livelier, jittery edges on states 2, 3 and 4, like a paper-traced animation** (added 2026-11-03, done 2026-11-03). The character's edges now boil: noise redraws them 12 times a second through four takes, while the resting logo stays crisp. See `version-history.md`.

- [x] **16. Book a call font: option 2 (Recursive was too soft and comic)** (added 2026-11-03, done 2026-11-03). Bricolage Grotesque ExtraBold, display cut. See `version-history.md`.

- [x] **15. Book a call font: organic but still digital, not a script** (added 2026-11-03, done 2026-11-03). Recursive Bold, half casual at rest, fully casual on hover. See `version-history.md`.

- [x] **14. Change the accent (the deep green) to `#252525`** (added 2026-11-03, done 2026-11-03). Buttons, the chat button, the footer bar and the accent details in the icons are now charcoal. See `version-history.md`.

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
