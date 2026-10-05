# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Docs-first rule

**IMPORTANT:** Before generating any code, ALWAYS first read the relevant documentation in the `docs/` folder and follow the conventions it describes. Do not write code until you have checked `docs/` for a file covering the area you are working on.

- `docs/ui.md` — UI conventions (components, styling)
- `docs/auth.md` — authentication conventions (Clerk only, route protection in `proxy.ts`, `requireUserId()`)
- `docs/data-mutations.md` — data mutation rules (`/data` helpers with Drizzle, server actions in co-located `actions.ts`, typed params with no `FormData`, Zod validation)
- `docs/data-fetching.md` — data fetching rules (server components only, `/data` helpers with Drizzle, per-user data access)

When adding a new doc to `docs/`, list it here so it is discovered.

## Commands

- `npm run dev` — start the dev server (http://localhost:3000)
- `npm run build` / `npm start` — production build and serve
- `npm run lint` — ESLint (flat config in `eslint.config.mjs`, uses `eslint-config-next`)
- `npm test` — run unit tests once with Vitest (`vitest.config.mts`; tests are co-located as `*.test.ts`)

## Architecture

Freshly scaffolded Create Next App project (Next.js 16, React 19, Tailwind CSS 4, TypeScript) for a lifting diary app. Currently only the starter App Router files exist.

- App Router lives in `app/` (`layout.tsx`, `page.tsx`, `globals.css`). There is no `src/` directory.
- Tailwind v4 is wired through `@tailwindcss/postcss` (`postcss.config.mjs`) — no `tailwind.config` file; configuration goes in CSS (`app/globals.css`).
- Path alias: `@/*` maps to the repo root (e.g. `@/app/...`), not `src/`.
- Next.js version docs are bundled at `node_modules/next/dist/docs/` (`01-app`, `02-pages`, `03-architecture`); consult them before writing Next.js code, since APIs differ from older versions.
