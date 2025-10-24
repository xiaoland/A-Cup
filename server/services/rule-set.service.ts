import { z } from "zod";
import { Profiles } from "../db/profile";
import { RuleSets } from "../db/rule-set";
import { eq } from "drizzle-orm";
import { exportProfileToR2 } from "../fund/profile-export";
import { ServiceBase } from ".";
import { RuleSet } from "../business/rule-set";

const CreateRuleSetSchema = RuleSet.schema().omit({ id: true });

export class RuleSetService extends ServiceBase {
  async createRuleSet(userId: number, body: z.infer<typeof CreateRuleSetSchema>) {
    const readableBy = body.readableBy ?? [userId];
    const writeableBy = body.writeableBy ?? [userId];

    const result = await this.db
      .insert(RuleSets)
      .values({
        name: body.name,
        type: body.type,
        format: body.format,
        content: body.content ?? "",
        readableBy: JSON.stringify(readableBy),
        writeableBy: JSON.stringify(writeableBy),
        download_detour: body.download_detour,
        update_interval: body.update_interval,
      })
      .returning();

    return new RuleSet(result[0]);
  }

  async getRuleSets(userId: number) {
    const result = await this.db.select().from(RuleSets);
    return result
      .map((rs) => new RuleSet(rs))
      .filter((rs) => {
        return [...rs.readableBy, ...rs.writeableBy].includes(userId);
      });
  }

  async getRuleSetById(userId: number, ruleSetId: number) {
    const ruleSets = await this.db
      .select()
      .from(RuleSets)
      .where(eq(RuleSets.id, ruleSetId))
      .limit(1);
    if (ruleSets.length === 0) return null;

    const rs = new RuleSet(ruleSets[0]);
    const readable = [...rs.readableBy, ...rs.writeableBy].includes(userId);

    return readable ? rs : null;
  }

  async updateRuleSet(
    userId: number,
    ruleSetId: number,
    body: z.infer<typeof CreateRuleSetSchema>
  ) {
    const existing = await this.getRuleSetById(userId, ruleSetId);
    if (!existing) return null;

    if (!existing.writeableBy.includes(userId)) {
      throw new Error("Forbidden");
    }

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.format !== undefined) updateData.format = body.format;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.readableBy !== undefined)
      updateData.readableBy = JSON.stringify(body.readableBy);
    if (body.writeableBy !== undefined)
      updateData.writeableBy = JSON.stringify(body.writeableBy);
    if (body.download_detour !== undefined)
      updateData.download_detour = body.download_detour;
    if (body.update_interval !== undefined)
      updateData.update_interval = body.update_interval;

    const result = await this.db
      .update(RuleSets)
      .set(updateData)
      .where(eq(RuleSets.id, ruleSetId))
      .returning();

    const allProfiles = await this.db.select().from(Profiles);
    const referencing = (allProfiles as any[]).filter((p) => {
      const rs = Array.isArray(p.rule_sets)
        ? p.rule_sets
        : JSON.parse(p.rule_sets || "[]");
      return rs.includes(ruleSetId);
    });
    if (this.env.OSS) {
      await Promise.all(
        referencing.map((p: any) =>
          exportProfileToR2(this.db, this.env, p.id)
        )
      );
    }

    return new RuleSet(result[0]);
  }

  async deleteRuleSet(userId: number, ruleSetId: number) {
    const existing = await this.getRuleSetById(userId, ruleSetId);
    if (!existing) return false;

    if (!existing.writeableBy.includes(userId)) {
      throw new Error("Forbidden");
    }

    await this.db.delete(RuleSets).where(eq(RuleSets.id, ruleSetId));
    return true;
  }
}
