import { z } from 'zod';
import { RuleSets, Profiles } from '../db/schema';
import { eq } from 'drizzle-orm';
import { DrizzleD1Database } from 'drizzle-orm/d1';
import { exportProfileToR2 } from '../fund/profile-export';
import { RuleSetInSingBoxSchema, type RuleSetInSingBox } from '../schemas/export';

const CreateRuleSetSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['inline', 'remote']),
  format: z.string().min(1),
  content: z.string().default(''),
  readableBy: z.array(z.number().int()).optional(),
  writeableBy: z.array(z.number().int()).optional(),
  download_detour: z.string().optional(),
  update_interval: z.string().optional()
});

export class RuleSetService {
  constructor(private db: DrizzleD1Database, private env: any) {}

  async createRuleSet(userId: number, body: z.infer<typeof CreateRuleSetSchema>) {
    const readableBy = body.readableBy ?? [userId];
    const writeableBy = body.writeableBy ?? [userId];

    const result = await this.db.insert(RuleSets).values({
      name: body.name,
      type: body.type,
      format: body.format,
      content: body.content ?? '',
      readableBy: JSON.stringify(readableBy),
      writeableBy: JSON.stringify(writeableBy),
      download_detour: body.download_detour,
      update_interval: body.update_interval,
    }).returning();

    return result[0];
  }

  async getRuleSets(userId: number) {
    const result = await this.db.select().from(RuleSets);
    return (result as any[]).filter((rs) => {
      try {
        const r = JSON.parse(rs.readableBy as string) as number[];
        const w = JSON.parse(rs.writeableBy as string) as number[];
        return (Array.isArray(r) && r.includes(userId)) || (Array.isArray(w) && w.includes(userId));
      } catch {
        return false;
      }
    });
  }

  async getRuleSetById(userId: number, ruleSetId: number) {
    const ruleSets = await this.db.select().from(RuleSets).where(eq(RuleSets.id, ruleSetId)).limit(1);
    if (ruleSets.length === 0) return null;

    const rs = ruleSets[0] as any;
    const readable = (() => {
      try {
        const r = JSON.parse(rs.readableBy as string) as number[];
        const w = JSON.parse(rs.writeableBy as string) as number[];
        return (Array.isArray(r) && r.includes(userId)) || (Array.isArray(w) && w.includes(userId));
      } catch {
        return false;
      }
    })();

    return readable ? rs : null;
  }

  async updateRuleSet(userId: number, ruleSetId: number, body: z.infer<typeof CreateRuleSetSchema>) {
    const existingList = await this.db.select().from(RuleSets).where(eq(RuleSets.id, ruleSetId)).limit(1);
    if (existingList.length === 0) return null;

    const existing = existingList[0] as any;
    const writable = Array.isArray(existing.writeableBy ? JSON.parse(existing.writeableBy as string) : [])
      ? (JSON.parse(existing.writeableBy as string) as number[]).includes(userId)
      : false;
    if (!writable) throw new Error('Forbidden');

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.format !== undefined) updateData.format = body.format;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.readableBy !== undefined) updateData.readableBy = JSON.stringify(body.readableBy);
    if (body.writeableBy !== undefined) updateData.writeableBy = JSON.stringify(body.writeableBy);
    if (body.download_detour !== undefined) updateData.download_detour = body.download_detour;
    if (body.update_interval !== undefined) updateData.update_interval = body.update_interval;

    const result = await this.db.update(RuleSets).set(updateData).where(eq(RuleSets.id, ruleSetId)).returning();

    const allProfiles = await this.db.select().from(Profiles);
    const referencing = (allProfiles as any[]).filter((p) => {
      try {
        const rs = Array.isArray(p.rule_sets) ? p.rule_sets : JSON.parse(p.rule_sets || '[]');
        return rs.includes(ruleSetId);
      } catch {
        return false;
      }
    });
    if (this.env.OSS) {
      await Promise.all(referencing.map((p: any) => exportProfileToR2(this.db, this.env, p.id)));
    }

    return result[0];
  }

  async deleteRuleSet(userId: number, ruleSetId: number) {
    const existingList = await this.db.select().from(RuleSets).where(eq(RuleSets.id, ruleSetId)).limit(1);
    if (existingList.length === 0) return false;

    const existing = existingList[0] as any;
    const writable = (() => {
      try { return (JSON.parse(existing.writeableBy as string) as number[]).includes(userId); } catch { return false; }
    })();
    if (!writable) throw new Error('Forbidden');

    await this.db.delete(RuleSets).where(eq(RuleSets.id, ruleSetId));
    return true;
  }

  async getRuleSetTag(userId: number, ruleSetId: number) {
    const existing = await this.db.select().from(RuleSets).where(eq(RuleSets.id, ruleSetId)).limit(1);
    if (existing.length === 0) return null;

    const row: any = existing[0];
    const readable = (() => {
      try {
        const r = JSON.parse(row.readableBy as string) as number[];
        const w = JSON.parse(row.writeableBy as string) as number[];
        return (Array.isArray(r) && r.includes(userId)) || (Array.isArray(w) && w.includes(userId));
      } catch {
        return false;
      }
    })();
    if (!readable) throw new Error('Forbidden');

    return { tag: row.name };
  }

  async exportRuleSet(id: number): Promise<RuleSetInSingBox | null> {
    const ruleSets = await this.db.select().from(RuleSets).where(eq(RuleSets.id, id)).limit(1);
    if (ruleSets.length === 0) return null;

    const ruleSet = ruleSets[0];
    const config: RuleSetInSingBox = {
      tag: `rule_set.${(ruleSet as any).type}.${(ruleSet as any).id}`,
      type: (ruleSet as any).type
    };

    if ((ruleSet as any).type === 'remote') {
      if ((ruleSet as any).content) config.url = (ruleSet as any).content as string;
    } else if ((ruleSet as any).type === 'inline') {
      try {
        if ((ruleSet as any).content) config.rules = JSON.parse((ruleSet as any).content as string);
      } catch {
        config.rules = [] as any;
      }
    }

    return RuleSetInSingBoxSchema.parse(config);
  }
}
