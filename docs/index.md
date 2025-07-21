---
description: Base doc of the project.
---

# A-Cup Index Doc

## For What

A-Cup is a project for editing and hosting proxy profiles.

Proxy profile is the file proxy client like sing-box, clash and others takes to control its behaviour.

And A-Cup are designed for multi users (in small numbers).

## Tech Stack

- Package Manager and Node Env Manager: pnpm
- Language:
  - Backend: TypeScript.
  - Frontend: Vue3 + TypeScript + SCSS.
- Runtime: Cloudflare Worker.
  - See [Cloudflare Worker Doc](./cloudflare.md#worker) for more details.
- Relational Database: Cloudflare D1.
  - Cloudflare D1 are provided through worker bindings.
  - Use DrizzleORM to define schema and query data from it.
- Object Storage: Cloudflare R2.
- Data Validation: Zod.
- API Routing:
  - `server/index.ts` uses Cloudflare Worker Runtime API fetch handler to process requests that not matched any frontend pages. If the request path starts with `/api/`, it will be seen as a request to the backend apis and routed by router (`server/fund/router.ts`).

## Project Structure

- server: Backend API src
  - index.ts: entrypoint of cloudflare worker app.
  - db
    - schema.ts: DrizzleORM schema defintions.
  - fund (fundamental)
    - router.ts: Simplified Router.
  - apis: ts module by module name.
- src: Frontend (Vue) src
- docs: Developer Manual

## Secret Management

Managing secrets using cloudflare worker environment variables binding.

## Coding Standard

Don't extract a function if there's no more than one usage.

### VueJS

- Vue3 + TypeScript
- UI Lib: [Vuetify 3](https://vuetifyjs.com/en/components/all)
- Store Lib: [Pinia](https://pinia.vuejs.org/core-concepts/)

#### Component

- Compositional API
- Every component has a directory with these files:
  - `compName.vue`: template and script
  - `types.ts`: types and constant of this component
  - `index.scss`: styles of this component

### Styles

Extract common styles, mixtures into `src/styles/`

#### SCSS

- use `@use` to replace `@import`

### TypeScript

- name a variable with snake naming
- name a function with camel naming
- name module level constants with UPPER CASE naming

## Documentation Standard

### Module Document

For the module data documentation, define where it stores and its schema.
Notes for defining data schema:

- Type:
  - `serial` is incremental integer
- Constraints:
  - `N` for nullable, omitted for not nullable.
  - `PK` for primary key, `FK` for foreign key.
  - `U` for unique
- Default:
  - If constraints allows null value, default value will be `null` if no further explaination.
