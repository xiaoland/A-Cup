import { ruleSets } from '../db/schema';
import { eq } from 'drizzle-orm';
import { RuleSetSchema } from '../../schemas/ruleset';
import { z } from 'zod';
import { DrizzleD1Database } from 'drizzle-orm/d1';

export class RuleSetService {
  private db: DrizzleD1Database;

  constructor(db: DrizzleD1Database) {
    this.db = db;
  }

  async getRuleSets() {
    return await this.db.select().from(ruleSets);
  }

  async getRuleSetById(id: number) {
    const ruleSet = await this.db.select().from(ruleSets).where(eq(ruleSets.id, id)).get();
    if (!ruleSet) {
      return null;
    }
    return ruleSet;
  }

  async createRuleSet(ruleSet: z.infer<typeof RuleSetSchema>) {
    const result = await this.db.insert(ruleSets).values(ruleSet).returning().get();
    return this.getRuleSetById(result.id);
  }

  async updateRuleSet(id: number, ruleSet: z.infer<typeof RuleSetSchema>) {
    const existingRuleSet = await this.getRuleSetById(id);
    if (!existingRuleSet) {
      return null;
    }

    await this.db.update(ruleSets).set(ruleSet).where(eq(ruleSets.id, id));
    return this.getRuleSetById(id);
  }

  async deleteRuleSet(id: number) {
    const existingRuleSet = await this.getRuleSetById(id);
    if (!existingRuleSet) {
      return null;
    }
    return await this.db.delete(ruleSets).where(eq(ruleSets.id, id));
  }
}
