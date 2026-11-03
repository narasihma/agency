# Agency

React + TypeScript + Vite website: the design agency's portfolio.

## Development Server

Run `pnpm dev` to start the Vite development server. The default port is 8443; `PORT` can override it. Run `pnpm typecheck` after changes: Vite strips types without checking them.

## Working rules

- **To-do list:** every task the owner gives goes into `docs/todo.md` under Open, numbered in the order given. When one is finished, tick it, move it to Done (newest first) with the date and a note on what changed.
- **Change log:** record every repository change in `docs/version-history.md`, newest first: why, and what is different now.
- **Branches:** new work goes on `feature/<name>`, cut from an up-to-date `main`. Don't commit or push unless the owner asks.

## Project Structure

This is the canonical project structure and the standard for new code. Start with task-relevant files below. Only follow imports or inspect other files when required, when a documented path is missing, or when the repository contradicts this guide.

```
index.html                    HTML shell for /        → src/pages/Home/main.tsx
redraft/index.html            HTML shell for /redraft/ → src/pages/Redraft/main.tsx
src/
  pages/<Name>/               one folder per page, PascalCase (Home, Redraft)
    main.tsx                  entrypoint: imports @/styles/global.css, mounts the page into #root
    <Name>Page.tsx            page component (HomePage)
    <Name>Page.css            page-level styles
  components/<Name>/          one folder per component, named after it, usable from any page (ActionButton)
    index.ts                  re-exports the component (and any public types)
    <Name>.tsx                the component
    <Name>.css                its styles
    *.ts                      helpers only this component uses
  data/                       page content and copy, one file per page
  styles/global.css           tokens and resets shared by every page
  env.d.ts                    Vite client types; allows CSS custom properties in style props
public/                       static files served as-is
vite.config.ts                Vite config: PAGES list (entries, /<page> redirect, sitemap), @ alias
package.json                  scripts: dev, build, build:prod, preview, typecheck, format
.mise.toml                    toolchain versions for Node.js and pnpm
```

Key files:

- `src/pages/Home/HomePage.tsx` - Home page (`/`): a placeholder title and line from `src/data/home.ts` until the site has a design
- `src/pages/Redraft/RedraftPage.tsx` - Redraft preview (`/redraft/`, `noindex`): the Figma file's "Redraft" group built as a page; copy and asset paths in `src/data/redraft.ts`, assets in `public/assets/redraft/`. The hero scales as one 1440 × 900 composition in `--u`; the other sections reflow
- `src/components/ActionButton/ActionButton.tsx` - the white handle + arrow + label link, in `primary`, `ghost` and `outline` variants
### Structure rules

- **TypeScript only.** Write `.tsx` for components and `.ts` for everything else; no `.js` or `.jsx` in `src/`. `tsconfig.json` is strict.
- **Pages** are separate HTML entries, not router routes. Each page owns `src/pages/<Name>/` and holds only page-level composition; anything reusable belongs in `components/`.
- **Folder naming:** page and component folders under `src/` are PascalCase, named after what they contain (`pages/Home/HomePage.tsx`). URLs and the HTML shells at the project root stay lowercase (`work/index.html` → `/work/`). Other folders (`data/`, `styles/`) stay lowercase.
- **Components** are grouped by name, not by page: `src/components/<Name>/<Name>.tsx` plus `<Name>.css`, any private helpers, and an `index.ts` that re-exports the default export (`export { default } from "./<Name>.tsx";`) along with any types other code needs. Don't create per-page component folders. A component used by several pages stays in one place.
- **Content** (copy, image paths, nav items) lives in `src/data/`, not inside components.
- **Imports:** use the `@/` alias for anything outside the current folder and `./` only inside the same folder. Import components through their folder's `index.ts` (`import SiteNav from "@/components/SiteNav";`), never a file inside another component's folder. Everything else keeps an explicit file extension (`@/data/home.ts`, `./HomePage.css`).
- **Types:** give every component a props `interface`, and export shared data types from the file that owns the data (`HomeCopy` from `home.ts`).
- **Heavy libraries** (such as Three.js) are loaded with a dynamic `import()` inside the component that needs them, so the page's copy renders before the library arrives and pages without it never download it.

### Adding a page

1. Create `src/pages/<Name>/main.tsx` and `src/pages/<Name>/<Name>Page.tsx` (+ `.css`), e.g. `src/pages/Work/WorkPage.tsx`.
2. Create a lowercase `<name>/index.html` at the project root that loads `/src/pages/<Name>/main.tsx`; it is served at `/<name>/` (e.g. `work/index.html` → `/work/`).
3. Add `<name>` to `PAGES` in `vite.config.ts`; that registers the build entry, the `/<name>` → `/<name>/` dev redirect and the sitemap entry.
4. Link it from the site's navigation once there is one.

### Adding a component

Create `src/components/<Name>/<Name>.tsx` with a default export and a props interface, put its styles in `<Name>.css` next to it, add `index.ts` with `export { default } from "./<Name>.tsx";` (plus `export type { … }` for any types other code needs), and import it with `@/components/<Name>`.

## Dependencies

- Runtime: React 19 and React DOM 19
- Styling: plain CSS; the `@tailwindcss/vite` plugin is configured, but no stylesheet imports Tailwind yet
- Build tooling: Vite 8, TypeScript 7, and `@vitejs/plugin-react`
- Formatting: oxfmt

## Styling

Styles are plain CSS files next to the code that uses them: each component imports its own `<Name>.css`, and each page imports its `<Page>Page.css`. Shared tokens and resets live in `src/styles/global.css`, which every page's `main.tsx` imports. Load web fonts in each HTML shell. Scope page-specific variables to a class on the page's `<html>`: `index.html` sets `class="home"`, and `HomePage.css` defines its variables under `html.home`.

## Code quality

- Use double quotes for strings containing apostrophes (`"We're here to help"`), or escape them in single-quoted strings. An unescaped apostrophe in a single-quoted string breaks the build.
- Ensure JSX tags are closed and braces are balanced.
- Export components as default exports.
