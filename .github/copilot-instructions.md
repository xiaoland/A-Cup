# A-Cup Proxy Configuration Management Platform
A-Cup is a Vue.js + TypeScript frontend with a Cloudflare Worker backend designed for editing and hosting proxy profiles for small-scale proxy services. The platform supports multi-user management of proxy configurations compatible with sing-box, clash, and other proxy clients.

**ALWAYS follow these instructions first** and only fallback to additional search and context gathering if the information in these instructions is incomplete or found to be in error.

## Working Effectively
- Bootstrap and build the repository:
  - `npm install -g pnpm` -- Install pnpm package manager (required)
  - `pnpm install` -- Install dependencies (~25 seconds)
  - `pnpm run type-check` -- TypeScript type checking (~11 seconds)
  - `pnpm run build` -- Full build (~14 seconds). NEVER CANCEL. Set timeout to 60+ minutes.
  - `pnpm run cf-typegen` -- Generate Cloudflare Worker types
- Development workflow:
  - `pnpm run dev` -- Start Vite dev server on http://localhost:5173
  - `pnpm run preview` -- Build and start wrangler dev server (requires Cloudflare auth)
  - `pnpm run deploy` -- Deploy to Cloudflare Workers (requires auth and config)

## Tech Stack Details
- **Package Manager**: pnpm (required - npm/yarn will not work correctly)
- **Frontend**: Vue 3 + TypeScript + Vuetify 3 + Vite + SCSS
- **Backend**: TypeScript on Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite-based) with DrizzleORM
- **Object Storage**: Cloudflare R2
- **Data Validation**: Zod
- **Build Tool**: Vite with Cloudflare plugin

## Project Structure
- **server/**: Backend API source code
  - `index.ts`: Cloudflare Worker entry point
  - `db/schema.ts`: DrizzleORM database schema definitions
  - `fund/router.ts`: Custom API router implementation
  - `apis/`: API modules by feature (user, outbound, inbound, etc.)
- **src/**: Vue.js frontend source code
  - `main.ts`: Vue application entry point
  - `components/`: Reusable Vue components (each in own directory with .vue, types.ts, index.scss)
  - `views/`: Page-level components
  - `router/`: Vue Router configuration
  - `stores/`: Pinia state management
- **docs/**: Developer documentation
- **drizzle/**: Database migrations and SQL scripts
  - `migrations/`: Auto-generated migration files
  - `user-init.sql`: Admin user initialization script

## Database Setup
- Schema is defined in `server/db/schema.ts` using DrizzleORM
- Migrations are in `drizzle/migrations/` directory
- Initialize admin user with: `INSERT INTO users (username, password, roles) VALUES ('admin', '21232f297a57a5a743894a0e4a801fc3', '["admin"]');`
- Default credentials: username `admin`, password `admin` (MD5 hashed in database)

## Build and Development
- **NEVER CANCEL** build commands - they may take longer than expected but complete in under 15 seconds
- **Build timing**: pnpm install (~25 seconds first time, ~1-2 seconds with cache), type-check (~11 seconds), build (~14 seconds)
- Frontend dev server runs independently and can be used without backend
- Login will fail in dev mode without proper Cloudflare backend setup (this is expected)
- Cloudflare authentication errors in console are expected in local development

## Validation and Testing
**ALWAYS run these validation steps after making changes:**
1. `pnpm run type-check` -- Must pass before committing changes
2. `pnpm run build` -- Must succeed completely  
3. **Manual UI testing**: Run `pnpm run dev` and verify:
   - Dev server starts on http://localhost:5173
   - Login page loads correctly showing username/password form
   - UI is responsive and displays properly
   - No critical JavaScript errors in browser console (Cloudflare connection errors are expected)
4. **End-to-end scenario**: Test the login flow by entering test credentials (admin/admin) - login will fail due to no backend but form should validate and submit
5. No automated test suite exists - manual testing is required for all changes

## Configuration Files
- `wrangler.jsonc`: Cloudflare Worker configuration (bindings, environment vars)
- `vite.config.ts`: Vite build configuration
- `drizzle.config.ts`: Database ORM configuration
- `package.json`: Dependencies and npm scripts
- `tsconfig.*.json`: TypeScript configurations for different parts of the app

## Common Tasks
The following are outputs from frequently run commands to save time:

### Repository root structure
```
.git/
.vscode/
README.md
docs/
drizzle/
server/
src/
package.json
pnpm-lock.yaml
wrangler.jsonc
vite.config.ts
worker-configuration.d.ts
```

### Available pnpm scripts
```
dev              - Start Vite development server
build            - Run type-check and build-only in parallel
preview          - Build and start wrangler dev server
build-only       - Run Vite build only
type-check       - Run Vue TypeScript compiler
deploy           - Build and deploy to Cloudflare Workers
cf-typegen       - Generate Cloudflare Worker types
orm-mig-gen      - Generate Drizzle ORM migrations
```

## Coding Standards
- Use Vue 3 Composition API for all components
- TypeScript naming conventions:
  - Variables: snake_case
  - Functions: camelCase  
  - Module constants: UPPER_CASE
- SCSS: Use `@use` instead of `@import`
- Component structure: Each component in own directory with .vue, types.ts, index.scss
- Extract common styles to `src/styles/`
- Don't extract functions unless used more than once

## Common Issues and Solutions
- **`pnpm not found`**: Run `npm install -g pnpm` (required package manager)
- **Cloudflare auth errors in dev console**: Expected - frontend works independently
- **Login fails in dev mode**: Expected - requires backend database connection  
- **"Unable to fetch Request.cf object" error**: Expected in local development
- **Build warnings about chunk size**: Normal for this application - can be ignored
- **Peer dependency warnings during install**: Can be ignored, build still works
- **Commands hanging**: Wait at least 30 seconds - builds are fast but may appear to pause briefly

## Deployment Requirements
- Cloudflare account with Workers, D1, and R2 enabled
- Configure `wrangler.jsonc` with your database and bucket IDs
- Set environment variables: `JWT_SECRET`, `OSS_PUBLIC_DOMAIN`
- Run database migrations: `wrangler d1 migrations apply YOUR_DB_NAME --remote`