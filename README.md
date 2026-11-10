# Agency

Portfolio site for the design agency.

## Run it

```bash
pnpm install
pnpm dev         # local dev server with hot reload, on port 8443 (PORT overrides it)
pnpm build       # production build into dist/
pnpm preview     # serve the production build
pnpm typecheck   # type-check with tsc (Vite builds without checking types)
```

Node and pnpm versions are in `.mise.toml`. `docker compose up dev` runs the dev server in a container, and `docker compose up web` serves the production build with nginx.

## Structure

```
index.html              home page (/)
redraft/index.html      Redraft preview (/redraft/)
src/
  pages/
    Home/
      main.tsx          entry point (loaded by index.html)
      HomePage.tsx/.css placeholder home page
    Redraft/            the Figma "Redraft" group built as a page
  data/                 page copy: home.ts, redraft.ts
  components/           one folder per component (ActionButton, CrumplePaper, MorphLogo, ShredSheet, WorkCarousel);
                        each has an index.ts, so import as @/components/<Name>
  styles/global.css     tokens and resets shared by every page
public/                 static files served as-is
docs/
  todo.md               the owner's tasks, open and done
  version-history.md    every change, newest first
```

`AGENTS.md` has the full conventions, including how to add a page or a component.
