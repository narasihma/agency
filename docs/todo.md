# To-do

The owner's tasks, numbered in the order given. Finished tasks move to Done, newest first.

## Open

_Nothing open._

## Done

- [x] 2. Check why `assets-src/` and `public/assets/redraft/` exist, consolidate them under `public/assets/`, and remove unreferenced assets. **2026-11-04:** the served images moved from `public/assets/redraft/` to `public/assets/`. All 53 are used, so none were removed. Of the source images in `assets-src/`: the four logo states `pnpm logo:build` reads moved to `public/assets/logo-src/`. The three paper photos, which no code reads, went to the owner's macOS Trash (`~/.Trash/1brand-redraft-paper-sources`). `assets-src/` is gone.
- [x] 1. Make the Redraft page the homepage, under the name Home. **2026-11-04:** the Redraft page is now the home page at `/` (`src/pages/Home/HomePage.tsx`, data in `src/data/home.ts`). The placeholder home and the `/redraft/` entry are gone, and the page is no longer `noindex`.
