# Version history

Repository changes, newest first.

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
