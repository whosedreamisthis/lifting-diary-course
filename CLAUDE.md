# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `npm run dev` — start the dev server (http://localhost:3000)
- `npm run build` / `npm start` — production build and serve
- `npm run lint` — ESLint (flat config in `eslint.config.mjs`, uses `eslint-config-next`)
- No test runner is configured yet.

## Architecture

Freshly scaffolded Create Next App project (Next.js 16, React 19, Tailwind CSS 4, TypeScript) for a lifting diary app. Currently only the starter App Router files exist.

- App Router lives in `app/` (`layout.tsx`, `page.tsx`, `globals.css`). There is no `src/` directory.
- Tailwind v4 is wired through `@tailwindcss/postcss` (`postcss.config.mjs`) — no `tailwind.config` file; configuration goes in CSS (`app/globals.css`).
- Path alias: `@/*` maps to the repo root (e.g. `@/app/...`), not `src/`.
- Next.js version docs are bundled at `node_modules/next/dist/docs/` (`01-app`, `02-pages`, `03-architecture`); consult them before writing Next.js code, since APIs differ from older versions.
