import { DrizzleD1Database } from "drizzle-orm/d1";

// Define the Cloudflare bindings (environment variables and bindings)
// D1Database and R2Bucket types are declared globally in worker-configuration.d.ts
export type Bindings = {
  DB: D1Database;
  R2: R2Bucket;
  JWT_SECRET: string;
  ADMIN_PASSWORD: string;
  R2_PUBLIC_URL: string;
};

// Define variables that can be set in the context
export type Variables = {
  db: DrizzleD1Database<Record<string, never>>;
  userId: string;
  jwtPayload: any;
};

// Define the Hono app type
export type HonoEnv = {
  Bindings: Bindings;
  Variables: Variables;
};
