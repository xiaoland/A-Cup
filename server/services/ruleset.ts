import { ruleSets } from '../db/schema';
import { and, eq, like } from 'drizzle-orm';
import { RuleSet, RuleSetSchema } from '../../schemas/ruleset';
import { HeadlessRuleSchema, SingBoxRuleSet } from '../../schemas/route';
import { z } from 'zod';
import { DrizzleD1Database } from 'drizzle-orm/d1';

export function exportRuleSetToSingBox(ruleSet: RuleSet): SingBoxRuleSet {
  if (!ruleSet.id) {
    throw new Error("Cannot export RuleSet not inserted")
  }
  return {
    tag: ruleSet.id.toString(),
    type: ruleSet.type,
    url: ruleSet.type === 'remote' ? ruleSet.content : undefined,
    rules: ruleSet.type === 'inline' ? z.array(HeadlessRuleSchema).parse(JSON.parse(ruleSet.content)) : undefined,
  } as SingBoxRuleSet;
}

export class RuleSetService {
  private db: DrizzleD1Database;

  constructor(db: DrizzleD1Database) {
    this.db = db;
  }

  async getRuleSets(userId: string) {
    return (await this.db.select().from(ruleSets).where(like(ruleSets.readableBy, `%${userId}%`))).map((ruleSet) => {
      return {
        ...ruleSet,
        readableBy: JSON.parse(ruleSet.readableBy),
        writeableBy: JSON.parse(ruleSet.writeableBy),
      };
    });
  }

  async getRuleSetById(id: number, userId: string) {
    const ruleSet = await this.db.select().from(ruleSets).where(eq(ruleSets.id, id)).get();
    if (ruleSet && !JSON.parse(ruleSet.readableBy).includes(userId)) {
      throw new Error('Forbidden');
    }
    if (!ruleSet) {
      return null;
    }
    return {
      ...ruleSet,
      readableBy: JSON.parse(ruleSet.readableBy),
      writeableBy: JSON.parse(ruleSet.writeableBy),
    };
  }

  async createRuleSet(ruleSet: z.infer<typeof RuleSetSchema>, userId: string) {
    const readableBy = (ruleSet.readableBy && ruleSet.readableBy.length > 0) ? ruleSet.readableBy : [userId];
    const writeableBy = (ruleSet.writeableBy && ruleSet.writeableBy.length > 0) ? ruleSet.writeableBy : [userId];

    const newRuleSet = {
      ...ruleSet,
      readableBy: JSON.stringify(readableBy),
      writeableBy: JSON.stringify(writeableBy),
    }
    const result = await this.db.insert(ruleSets).values(newRuleSet).returning().get();
    return this.getRuleSetById(result.id, userId);
  }

  async updateRuleSet(id: number, ruleSet: z.infer<typeof RuleSetSchema>, userId: string) {
    const existingRuleSet = await this.getRuleSetById(id, userId);
    if (!existingRuleSet) {
      return null;
    }
    if (!existingRuleSet.writeableBy.includes(userId)) {
      throw new Error('Forbidden');
    }

    const updatedRuleSet = {
      ...ruleSet,
      readableBy: JSON.stringify(ruleSet.readableBy),
      writeableBy: JSON.stringify(ruleSet.writeableBy),
    }
    await this.db.update(ruleSets).set(updatedRuleSet).where(eq(ruleSets.id, id));
    return this.getRuleSetById(id, userId);
  }

  async deleteRuleSet(id: number, userId: string) {
    const existingRuleSet = await this.getRuleSetById(id, userId);
    if (!existingRuleSet) {
      return null;
    }
    if (!existingRuleSet.writeableBy.includes(userId)) {
      throw new Error('Forbidden');
    }
    return await this.db.delete(ruleSets).where(eq(ruleSets.id, id));
  }
}
