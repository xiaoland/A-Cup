# Agent Quickstart: A-Cup

This doc gives a coding agent the minimum, actionable info to start, build, and validate changes in this repo.

## Tech stack
- Frontend: Vue 3 + Vite + TypeScript + Vuetify
- Server utilities: TypeScript under `server/` (schemas, APIs); database via Drizzle ORM
- Cloudflare tooling: Wrangler (for preview/deploy) and Cloudflare Workers types
- Package manager: pnpm (pnpm-lock.yaml present)

## Prerequisites
- Node.js 20+
- pnpm 8+
- Optional (for preview/deploy): Cloudflare `wrangler` configured with an account; local preview may require modern glibc

## Install & validate
```bash
pnpm install --frozen-lockfile
node -v && pnpm -v
pnpm run type-check
pnpm run build
```

## Common commands
- Start dev (Vite): `pnpm run dev`
- Type-check only: `pnpm run type-check`
- Build (Vite): `pnpm run build`
- Cloudflare preview (builds then wrangler dev): `pnpm run preview`
- Cloudflare deploy (builds then wrangler deploy): `pnpm run deploy`
- Cloudflare types generation: `pnpm run cf-typegen`
- Drizzle migration generation: `pnpm run orm-mig-gen`

Notes:
- If `wrangler` fails locally due to `workerd`/glibc constraints, builds still complete; use CI or a supported environment for preview/deploy.

## Project layout
- `src/` Vue SPA source (components, views, router, store)
- `server/` API-related code and schemas
- `drizzle/` migrations and SQL helpers; `drizzle.config.ts` for tooling
- `docs/` project documentation
- `vite.config.ts`, `tsconfig*.json` build and TS configs
- `wrangler.jsonc`, `worker-configuration.d.ts` Cloudflare config/types

## Branching & PR workflow
1) Create a feature branch from `master`.
2) Make changes.
3) Run quality checks before committing:
   - `pnpm run type-check`
   - `pnpm run build`
4) Commit and push the branch.
5) Open a Pull Request. Include a short description of the change and evidence of passing checks.

## Database (Drizzle)
- Generate new SQL migrations with `pnpm run orm-mig-gen` (ensure `drizzle.config.ts` is correct).
- Apply migrations using your normal deployment/database workflow (this repo doesn’t ship a direct migrate script).

## Environment
- Frontend build typically needs no secrets.
- For Cloudflare preview/deploy, configure `wrangler.jsonc` and auth (`wrangler login`).

## Troubleshooting
- Wrangler/workerd validation errors on some Linux images: use a newer glibc or run preview/deploy in CI/Cloudflare.
- If type-check or build fails, open a PR with the failing logs only if requested; otherwise fix and ensure both pass before PR.
