# A-Cup

Purpose: Manage and host Sing-Box proxy configurations.

Architecture: Full-stack serverless application with Vue 3 SPA frontend and Cloudflare Workers backend, using D1 (SQLite) for data and R2 for object storage.

## Tech Stacks

### Languages
- TypeScript (TS-first project; `tsconfig.json`, `vue-tsc` for type checking)
- Modern ECMAScript modules (package.json `type: "module"`)

### Frontend
- Framework: Vue 3 with Composition API
- State management: Pinia
- Form validation: Zod
- Router: Vue Router v4
- UI components: PrimeVue + @primevue/themes
- Icons: PrimeIcons
- CSS / Utility:
  - UnoCSS with presets (@unocss/preset-uno, transformers for directives and variant groups)
  - Sass (sass-embedded)
- Build / dev server: Vite + @vitejs/plugin-vue

### Backend / Runtime
- Hosting/runtime: Cloudflare Workers (configured via `wrangler.jsonc`)
  - Uses Node.js compatibility flags (nodejs_compat)
  - Entry point: `server/index.ts`
- HTTP framework: Hono
- Data model & services: Zod + @hono/zod-validator + zod-class
- Authentication: jsonwebtoken + @hono/jwt
- Utilities:
  - crypto-js for password hashing
  - uuid for unique identifiers
  - immer for immutable state updates

### Database & Storage
- ORM: Drizzle ORM
- Migrations: drizzle-kit
  - Config: `drizzle.config.ts`
  - Output: `./drizzle/migrations`
  - Script: `pnpm run gen-db-migration`
- Database: Cloudflare D1 (SQLite-compatible)
  - D1 bindings configured in `wrangler.jsonc`
  - Schema: `server/db/schema.ts`
  - Drizzle uses `sqlite` dialect (D1-compatible)
- Object storage: Cloudflare R2 for profile hosting
  - R2 bucket binding in `wrangler.jsonc`


### SingBox Profile Schema

Use package `@black-duty/sing-box-schema` (https://github.com/BlackDuty/sing-box-schema/)

### Testing
- Framework: Vitest
- Frontend testing: @vue/test-utils  + jsdom + @pinia/testing
- Backend testing: @cloudflare/vitest-pool-workers
- Configs:
  - `vitest.config.frontend.ts` for Vue components
  - `vitest.config.backend.ts` for Hono/Worker code
- Test command: `pnpm test` (runs both frontend and backend tests)

### Deployment & Ops
- Deployment tool: Wrangler (v4.24.3) for Cloudflare Workers
- Preview: `wrangler dev` serves Worker locally
- Type generation: `wrangler types` (script: `cf-typegen`) generates Cloudflare bindings types
- Deployment workflow:
  1. Build frontend + backend (`pnpm run build`)
  2. Deploy to Cloudflare (`wrangler deploy`)
  3. Apply D1 migrations (`wrangler d1 migrations apply a-cup --remote`)

### Tooling & Developer Experience
- Package manager: pnpm
- Type checking: vue-tsc  - `pnpm run type-check`
- Dev helpers:
  - vite-plugin-vue-devtools
  - @cloudflare/vite-plugin for Cloudflare integration
- Task runner: npm-run-all2  - used in scripts (run-p)
- Runtimes: ts-node, vite-node  for running TS scripts

### Project Structure
```
├── server/                 # Backend (Hono + Cloudflare Workers)
│   ├── index.ts           # Worker entry point
│   ├── auth.ts            # JWT authentication
│   ├── types.ts           # TypeScript types
│   ├── exceptions.ts      # Error handling
│   ├── apis/              # API route handlers
│   │   ├── user.ts        # User management
│   │   ├── profile.ts     # Profile CRUD
│   │   ├── outbound.ts    # Outbound proxy configs
│   │   └── ruleset.ts     # Routing rules
│   ├── db/
│   │   └── schema.ts      # Drizzle schema definitions
│   └── services/          # Business logic layer
│       ├── profile.ts
│       ├── outbound.ts
│       └── ruleset.ts
├── src/                   # Frontend (Vue 3 SPA)
│   ├── main.ts            # App entry point
│   ├── App.vue            # Root component
│   ├── components/        # Vue components
│   │   ├── common/        # Reusable UI components
│   │   ├── profiles/      # Profile editors
│   │   ├── outbounds/     # Outbound proxy editors
│   │   ├── dns/           # DNS configuration
│   │   ├── inbounds/      # Inbound configs
│   │   ├── route/         # Routing rules
│   │   └── rule-sets/     # Rule set management
│   ├── stores/            # Pinia state stores
│   │   ├── user.ts
│   │   ├── profile.ts
│   │   ├── outbound.ts
│   │   └── ruleset.ts
│   ├── router/            # Vue Router config
│   └── views/             # Top-level route views
├── schemas/               # Zod validation schemas
│   ├── user.ts
│   ├── profile.ts
│   ├── outbound.ts
├── drizzle/              # Database migrations
│   ├── migrations/       # Generated SQL migrations
│   └── init-user.sql     # Initial user setup
├── docs/                 # Project documentation
└── public/               # Static assets
```

## Key Scripts

```bash
# Development
pnpm dev                    # Start Vite dev server (frontend only)
pnpm run type-check         # Run TypeScript type checking

# Building
pnpm run build-only         # Build frontend with Vite
pnpm run build              # Full build (type-check + build-only)

# Testing
pnpm test                   # Run all tests (frontend + backend)

# Preview & Deployment
pnpm run preview            # Build and run wrangler dev (local preview)
pnpm run deploy             # Build, deploy to Cloudflare, apply migrations

# Database
pnpm run gen-db-migration        # Generate Drizzle migrations

# Cloudflare
pnpm run cf-typegen         # Generate Cloudflare Worker types

# OpenAPI
pnpm run openapi:serve:redoc    # Serve OpenAPI spec with Redoc
pnpm run openapi:serve:http     # Serve openapi/ as static files
pnpm run openapi:validate       # Validate OpenAPI spec
```

## Features

### Profile Management
- Create/edit/delete Sing-Box profiles
- Support for all Sing-Box config options:
  - Inbounds: TUN, Mixed (system proxy)
  - Outbounds: VLESS, VMESS, Shadowsocks, Selector, URLTest
  - Endpoints: WireGuard
  - Routing: Rules and rule sets
  - DNS: UDP, TLS, HTTPS, HTTP3, QUIC servers + DNS rules
- Share and reuse configuration components
- Auto-naming for tags
- Export profiles as Sing-Box JSON
- Host profiles on Cloudflare R2

### UI/UX
- Dark mode support
- Responsive layout (mobile-friendly)
- PrimeVue components for consistent UI
- Edit in JSON with Intellisense support

### Configuration

### Cloudflare Setup (`wrangler.jsonc`)
Required configuration:
- `d1_databases[0].database_name` - D1 database name
- `d1_databases[0].database_id` - D1 database ID
- `r2_buckets[0].bucket_name` - R2 bucket name
- `vars.JWT_SECRET` - Secret for JWT signing
- `vars.ADMIN_PASSWORD` - Password for admin login
- `vars.OSS_PUBLIC_DOMAIN` - Public domain for hosted profiles

## Development Notes

- TypeScript strict mode enabled for both frontend and backend
- Schema-first development: Zod schemas in `schemas/` are shared between client and server
- Component testing: Tests in `tests/`
- API testing: Backend tests use Vitest with Cloudflare Workers pool
