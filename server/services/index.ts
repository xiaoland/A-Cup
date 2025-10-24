import { DrizzleD1Database } from 'drizzle-orm/d1';

export abstract class ServiceBase {
  constructor(protected db: DrizzleD1Database, protected env: any) {}
}
