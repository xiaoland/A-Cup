# A-Cup

## What is this

This is a Web application provides sing-box (a proxy application) profiles editing and hosting with multi tenants support.

### Key Concepts

Following are composition of a Sing-Box profile:

- inbound
- outbound
- route
  - rules
  - rule_sets
- dns
  - servers
  - rules
- log
- expremental

Read [Sing-Box offical configuration doc](https://sing-box.sagernet.org/configuration) for what they are and detailed configuration fields.

### Features

- Edit a profile in UI / JSON mode with validation, completions.
- Host profile on Object Storage Service, user can get a pre-signed link to download newest profile to their sing-box client.
- Outbound, RuleSet can be shared and reused in different profiles.

## Tech stack

This is a fullstack app based on cloudflare worker teck stacks:

- Frontend: Vue 3 (TS) + Vite + Vuetify + Pinia. Under `src/`
- Backend: Cloudflare Worker + DrizzleORM + Cloudflare D1. Under `server/`
- Object Storage Service: Cloudflare R2
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

## Frontend Development Guidelines

#### Component

- In `src/components/`
- Compositional API
- Every component has a directory with these files:
  - `compName.vue`: template and script of the component
    - should have `<style scoped lang="scss" src="./compName.scss"></style>`
  - `compName.ts`: props, emits, types, constant of the component
  - `compName.scss`: styles of this component

### Styles

Extract common styles, mixtures into `src/styles/`

### Component Documentation

For every new component, or when modifying an existing one, create a `compName.md` file in the same directory. This file should follow the template in `docs/component-doc-template.md`.

## Branching & PR workflow

1. Create a feature branch from `master`.
2. Make changes.
3. Run quality checks before committing:
   - `pnpm run type-check`
   - `pnpm run build`
4. Commit and push the branch.
5. Open a Pull Request. Include a short description of the change and evidence of passing checks.

## Backend Development Guidelines

### Database

- Once Database schema changed, generate new SQL migrations with `pnpm run orm-mig-gen` (ensure `drizzle.config.ts` is correct).
