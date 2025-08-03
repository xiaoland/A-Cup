import { z } from 'zod';
import { Router } from '../fund/router';
import { RuleSets } from '../db/schema';
import { eq, and, or } from 'drizzle-orm';
import { DrizzleD1Database } from 'drizzle-orm/d1';
import { RuleSetInSingBoxSchema, type RuleSetInSingBox } from '../schemas/export';

export const RULE_SET_ROUTER = new Router('/rule_sets');

// Export function for rule sets to sing-box format
export async function exportRuleSet(db: DrizzleD1Database, id: number, type: "sing-box" = "sing-box"): Promise<RuleSetInSingBox | null> {
  const ruleSets = await db.select().from(RuleSets).where(eq(RuleSets.id, id)).limit(1);
  if (ruleSets.length === 0) return null;
  
  const ruleSet = ruleSets[0];
  const config: RuleSetInSingBox = {
    tag: `rule_set.${ruleSet.type}.${ruleSet.id}`,
    type: ruleSet.type
  };

  if (ruleSet.url) config.url = ruleSet.url;
  if (ruleSet.rules) config.rules = JSON.parse(ruleSet.rules as string);

  // Validate result with Zod schema
  return RuleSetInSingBoxSchema.parse(config);
}

const CreateRuleSetSchema = z.object({
  type: z.enum(['inline', 'remote']).default('remote'),
  name: z.string(),
  rules: z.array(z.any()).optional(), // array of headless rule objects
  url: z.string().optional(),
  share: z.boolean().default(false)
});

const IDPathParamSchema = z.object({
  id: z.string().transform(val => parseInt(val))
});

// Create rule set
RULE_SET_ROUTER.add('POST', '', async ({ body, db, token_payload }) => {
  const result = await db.insert(RuleSets).values({
    owner: parseInt((token_payload?.sub || '0').toString()),
    type: body.type,
    name: body.name,
    rules: body.rules,
    url: body.url,
    share: body.share
  }).returning();

  return Response.json((result[0]), {status: 201}); 
}, {
  bodySchema: CreateRuleSetSchema,
  allowedRoles: ['authenticated']
});

// Edit rule set
const EditRuleSetSchema = CreateRuleSetSchema.partial();
RULE_SET_ROUTER.add('PUT', '/:id', async ({ path_params, body, db, token_payload }) => {
  const current_user = parseInt((token_payload?.sub || '0').toString());
  const rule_set_id = path_params.id;

  // Check ownership
  const existing = await db.select().from(RuleSets).where(eq(RuleSets.id, rule_set_id)).limit(1);
  if (existing.length === 0) {
    return new Response('Rule set not found', { status: 404 });
  }
  if (existing[0].owner !== current_user) {
    return new Response('Forbidden', { status: 403 });
  }

  const result = await db.update(RuleSets)
    .set(body)
    .where(eq(RuleSets.id, rule_set_id))
    .returning();

  return Response.json(result[0]);
}, {
  pathParamsSchema: IDPathParamSchema,
  bodySchema: EditRuleSetSchema,
  allowedRoles: ['authenticated']
});

// Get rule set
RULE_SET_ROUTER.add('GET', '/:id', async ({ path_params, db, token_payload }) => {
  const user_id = parseInt((token_payload?.sub || '0').toString());
  const rule_set_id = path_params.id;

  // Check access (owner or shared)
  const rule_sets = await db.select().from(RuleSets).where(
    and(
      eq(RuleSets.id, rule_set_id),
      eq(RuleSets.owner, user_id)
    )
  ).limit(1);
  if (rule_sets.length === 0) {
    return new Response('Rule set not found', { status: 404 });
  }

  return Response.json(rule_sets[0]);
}, {
  pathParamsSchema: IDPathParamSchema,
  allowedRoles: ['authenticated']
});

// List rule sets (owned or shared)
RULE_SET_ROUTER.add('GET', '', async ({ db, token_payload }) => {
  const userId = parseInt((token_payload?.sub || '0').toString());

  const result = await db.select()
    .from(RuleSets)
    .where(
      or(
        eq(RuleSets.owner, userId),
        eq(RuleSets.share, true)
      )
    );

  return Response.json(result);
}, {
  allowedRoles: ['authenticated']
});

// Delete rule set
RULE_SET_ROUTER.add('DELETE', '/:id', async ({ path_params, db, token_payload }) => {
  const user_id = parseInt((token_payload?.sub || '0').toString());
  const rule_set_id = path_params.id;

  // Check ownership
  const existing = await db.select().from(RuleSets).where(
    and(
      eq(RuleSets.id, rule_set_id),
      eq(RuleSets.owner, user_id)
    )
  ).limit(1);
  if (existing.length === 0) {
    return new Response('Rule set not found', { status: 404 });
  }

  await db.delete(RuleSets).where(eq(RuleSets.id, rule_set_id));
  return new Response('', { status: 204 });
}, {
  pathParamsSchema: IDPathParamSchema,
  allowedRoles: ['authenticated']
});
