import { z } from 'zod';
import { Router } from '../fund/router';
import { RuleSets } from '../db/schema';
import { eq } from 'drizzle-orm';
import { DrizzleD1Database } from 'drizzle-orm/d1';
import { RuleSetInSingBoxSchema, type RuleSetInSingBox } from '../schemas/export';

export const RULE_SET_ROUTER = new Router('/rule_sets');

// Export function for rule sets to sing-box format
export async function exportRuleSet(db: DrizzleD1Database, id: number, type: "sing-box" = "sing-box"): Promise<RuleSetInSingBox | null> {
  const ruleSets = await db.select().from(RuleSets).where(eq(RuleSets.id, id)).limit(1);
  if (ruleSets.length === 0) return null;
  
  const ruleSet = ruleSets[0];
  const config: RuleSetInSingBox = {
    tag: `rule_set.${(ruleSet as any).type}.${(ruleSet as any).id}`,
    type: (ruleSet as any).type
  };

  // Use new schema fields
  if ((ruleSet as any).type === 'remote') {
    // content stores URL or remote metadata
    if ((ruleSet as any).content) config.url = (ruleSet as any).content as string;
  } else if ((ruleSet as any).type === 'inline') {
    try {
      if ((ruleSet as any).content) config.rules = JSON.parse((ruleSet as any).content as string);
    } catch {
      // fallback: empty rules
      config.rules = [] as any;
    }
  }

  // Validate result with Zod schema
  return RuleSetInSingBoxSchema.parse(config);
}

const CreateRuleSetSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['inline', 'remote']),
  format: z.string().min(1), // e.g. source/binary
  content: z.string().default(''),
  readableBy: z.array(z.number().int()).optional(),
  writeableBy: z.array(z.number().int()).optional(),
  download_detour: z.string().optional(),
  update_interval: z.string().optional()
});

const IDPathParamSchema = z.object({
  id: z.string().transform(val => parseInt(val))
});

// Create rule set
RULE_SET_ROUTER.add('POST', '', async ({ body, db, token_payload }) => {
  const currentUser = parseInt((token_payload?.sub || '0').toString());
  const readableBy = body.readableBy ?? [currentUser];
  const writeableBy = body.writeableBy ?? [currentUser];

  const result = await db.insert(RuleSets).values({
    name: body.name,
    type: body.type,
    format: body.format,
    content: body.content ?? '',
    readableBy: JSON.stringify(readableBy) as unknown as any,
    writeableBy: JSON.stringify(writeableBy) as unknown as any,
    download_detour: body.download_detour,
    update_interval: body.update_interval,
  }).returning();

  return Response.json((result[0]), {status: 201}); 
}, {
  bodySchema: CreateRuleSetSchema,
  allowedRoles: ['authenticated']
});

// Edit rule set
const EditRuleSetSchema = CreateRuleSetSchema.partial();
RULE_SET_ROUTER.add('PUT', '/:id', async ({ path_params, body, db, token_payload }) => {
  const currentUser = parseInt((token_payload?.sub || '0').toString());
  const rule_set_id = path_params.id;

  const existingList = await db.select().from(RuleSets).where(eq(RuleSets.id, rule_set_id)).limit(1);
  if (existingList.length === 0) return new Response('Rule set not found', { status: 404 });

  const existing = existingList[0] as any;
  const writable = Array.isArray(existing.writeableBy ? JSON.parse(existing.writeableBy as string) : [])
    ? (JSON.parse(existing.writeableBy as string) as number[]).includes(currentUser)
    : false;
  if (!writable) return new Response('Forbidden', { status: 403 });

  const updateData: any = {};
  if (body.name !== undefined) updateData.name = body.name;
  if (body.type !== undefined) updateData.type = body.type;
  if (body.format !== undefined) updateData.format = body.format;
  if (body.content !== undefined) updateData.content = body.content;
  if (body.readableBy !== undefined) updateData.readableBy = JSON.stringify(body.readableBy) as unknown as any;
  if (body.writeableBy !== undefined) updateData.writeableBy = JSON.stringify(body.writeableBy) as unknown as any;
  if (body.download_detour !== undefined) updateData.download_detour = body.download_detour;
  if (body.update_interval !== undefined) updateData.update_interval = body.update_interval;

  const result = await db.update(RuleSets).set(updateData).where(eq(RuleSets.id, rule_set_id)).returning();
  return Response.json(result[0]);
}, {
  pathParamsSchema: IDPathParamSchema,
  bodySchema: CreateRuleSetSchema.partial(),
  allowedRoles: ['authenticated']
});

// Get rule set
RULE_SET_ROUTER.add('GET', '/:id', async ({ path_params, db, token_payload }) => {
  const user_id = parseInt((token_payload?.sub || '0').toString());
  const rule_set_id = path_params.id;

  const rule_sets = await db.select().from(RuleSets).where(eq(RuleSets.id, rule_set_id)).limit(1);
  if (rule_sets.length === 0) return new Response('Rule set not found', { status: 404 });

  const rs = rule_sets[0] as any;
  const readable = (() => {
    try {
      const r = JSON.parse(rs.readableBy as string) as number[];
      const w = JSON.parse(rs.writeableBy as string) as number[];
      return (Array.isArray(r) && r.includes(user_id)) || (Array.isArray(w) && w.includes(user_id));
    } catch {
      return false;
    }
  })();
  if (!readable) return new Response('Rule set not found', { status: 404 });

  return Response.json(rs);
}, {
  pathParamsSchema: IDPathParamSchema,
  allowedRoles: ['authenticated']
});

// List rule sets (owned or shared)
RULE_SET_ROUTER.add('GET', '', async ({ db, token_payload }) => {
  const userId = parseInt((token_payload?.sub || '0').toString());

  // Fetch and filter by ACLs
  const result = await db.select().from(RuleSets);
  const filtered = (result as any[]).filter((rs) => {
    try {
      const r = JSON.parse(rs.readableBy as string) as number[];
      const w = JSON.parse(rs.writeableBy as string) as number[];
      return (Array.isArray(r) && r.includes(userId)) || (Array.isArray(w) && w.includes(userId));
    } catch {
      return false;
    }
  });

  return Response.json(filtered);
}, {
  allowedRoles: ['authenticated']
});

// Delete rule set
RULE_SET_ROUTER.add('DELETE', '/:id', async ({ path_params, db, token_payload }) => {
  const user_id = parseInt((token_payload?.sub || '0').toString());
  const rule_set_id = path_params.id;

  const existingList = await db.select().from(RuleSets).where(eq(RuleSets.id, rule_set_id)).limit(1);
  if (existingList.length === 0) return new Response('Rule set not found', { status: 404 });
  const existing = existingList[0] as any;
  const writable = (() => {
    try { return (JSON.parse(existing.writeableBy as string) as number[]).includes(user_id); } catch { return false; }
  })();
  if (!writable) return new Response('Forbidden', { status: 403 });

  await db.delete(RuleSets).where(eq(RuleSets.id, rule_set_id));
  return new Response('', { status: 204 });
}, {
  pathParamsSchema: IDPathParamSchema,
  allowedRoles: ['authenticated']
});
