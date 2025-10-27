# A-Cup

## Tech Stacks

### Languages
- TypeScript (project is TS-first; `tsconfig.json`, `vue-tsc` in scripts)
- Modern ECMAScript modules (package.json `type: "module"`)

### Frontend
- Framework: Vue 3
- State management: Pinia
- Router: Vue Router (v4)
- UI components: PrimeVue (+ @primevue/themes)
- Icons: PrimeIcons
- CSS / Utility: UnoCSS (with presets) and Sass (sass-embedded)
- Editor: Monaco (integrated via ESM workers per `vite.config.ts` comments)
- Build / dev server: Vite (vite + @vitejs/plugin-vue)

### Backend / Runtime
- Hosting/runtime: Cloudflare Workers (configured via `wrangler.jsonc`)
  - Cloudflare Worker uses Node compatibility flags (nodejs_compat)
  - Entry: `server/index.ts` (as set in wrangler config)
- Lightweight HTTP framework: Hono
- Validation: Zod and `@hono/zod-validator`
- Authentication: jsonwebtoken (JWT)

### Database & Storage
- ORM: Drizzle ORM (drizzle-orm)
- Migrations: drizzle-kit (config in `drizzle.config.ts`, migrations output to `./drizzle/migrations`)
- DB: Cloudflare D1 (D1 bindings are present in `wrangler.jsonc`); drizzle config uses `sqlite` dialect (compatible with D1 via migrations)
- Object storage: Cloudflare R2 (R2 bucket binding configured in `wrangler.jsonc`)

### Deployment & Ops
- Wrangler for Cloudflare Workers deployment (wrangler CLI used in scripts)
- Preview uses `wrangler dev` to serve the Worker locally
- CI / type generation: `wrangler types` is available via `cf-typegen` script

### Tooling & Developer Experience
- Package manager: pnpm
- Type checking: `vue-tsc` (script `type-check`)
- Dev helper: vite-plugin-vue-devtools, @cloudflare/vite-plugin (Cloudflare integration)
- Task runner: npm-run-all2 used in scripts (run-p)
- ts-node available for running TS scripts

### Notable libraries
- zod, zod-class (schema validation)
- jsonwebtoken (JWT handling)

### Scripts (high-level)
- `pnpm dev` — run Vite dev server
- `pnpm run build` — full build sequence (type-check + build)
- `pnpm run preview` — build and run `wrangler dev` for preview
- `pnpm run deploy` — build + `wrangler deploy` + D1 migrations apply (see README)

