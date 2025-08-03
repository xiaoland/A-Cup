import { z } from "zod";
import { eq, and, or, inArray } from "drizzle-orm";
import { Router } from "../fund/router";
import { RouteRules, Outbounds, RuleSets } from "../db/schema";
import { DrizzleD1Database } from 'drizzle-orm/d1';
import { RouteRuleInSingBoxSchema, type RouteRuleInSingBox } from '../schemas/export';
import { exportOutbound } from './outbound';
import { exportRuleSet } from './rule-set';

// Export function for route rules to sing-box format
export async function exportRouteRule(db: DrizzleD1Database, id: number, type: "sing-box" = "sing-box"): Promise<RouteRuleInSingBox | null> {
  const routeRules = await db.select().from(RouteRules).where(eq(RouteRules.id, id)).limit(1);
  if (routeRules.length === 0) return null;
  
  const rule = routeRules[0];
  const config: RouteRuleInSingBox = {};

  // Add matching conditions
  const domains = rule.domains as string[] | null;
  const domainSuffixes = rule.domain_suffixes as string[] | null;
  const domainKeywords = rule.domain_keywords as string[] | null;
  const domainRegexes = rule.domain_regexes as string[] | null;
  const ruleSets = rule.rule_sets as number[] | null;

  if (domains && domains.length > 0) config.domain = domains;
  if (domainSuffixes && domainSuffixes.length > 0) config.domain_suffix = domainSuffixes;
  if (domainKeywords && domainKeywords.length > 0) config.domain_keyword = domainKeywords;
  if (domainRegexes && domainRegexes.length > 0) config.domain_regex = domainRegexes;
  if (ruleSets && ruleSets.length > 0) {
    // Use rule set export function to get proper tags
    const ruleSetConfigs = await Promise.all(
      ruleSets.map(id => exportRuleSet(db, id))
    );
    config.rule_set = ruleSetConfigs
      .filter((rs): rs is NonNullable<typeof rs> => rs !== null)
      .map(rs => rs.tag);
  }

  // Add action
  if (rule.action === 'route' && rule.outbound) {
    // Use outbound export function to get proper tag
    const outboundConfig = await exportOutbound(db, rule.outbound);
    if (outboundConfig) {
      config.outbound = outboundConfig.tag;
    }
  } else if (rule.action === 'reject') {
    config.action = 'reject';
  }

  // Validate result with Zod schema
  return RouteRuleInSingBoxSchema.parse(config);
}

// Validation schemas
const RouteRuleSchema = z.object({
  name: z.string().min(1),
  action: z.enum(['route', 'reject']),
  outbound: z.number().optional(),
  domains: z.array(z.string()).optional(),
  domain_suffixes: z.array(z.string()).optional(),
  domain_keywords: z.array(z.string()).optional(),
  domain_regexes: z.array(z.string()).optional(),
  rule_sets: z.array(z.number()).optional(),
  share: z.boolean().default(false)
}).refine((data) => {
  // If action is 'route', outbound is required
  if (data.action === 'route' && !data.outbound) {
    return false;
  }
  // At least one matching condition must be provided
  const conditions = [data.domains, data.domain_suffixes, data.domain_keywords, data.domain_regexes, data.rule_sets];
  return conditions.some(condition => condition !== undefined && condition.length > 0);
}, {
  message: "At least one matching condition (domains, domain_suffixes, domain_keywords, domain_regexes, or rule_sets) must be provided, and outbound is required when action is 'route'"
});

const RouteRuleUpdateSchema = RouteRuleSchema.partial().omit({ share: true });

const PathParamsSchema = z.object({
  id: z.string().transform(val => parseInt(val))
});

const ExportQuerySchema = z.object({
  type: z.enum(['sing-box']).default('sing-box')
});

export const ROUTE_RULE_ROUTER = new Router('/route-rules');

// Get all route rules accessible to current user
ROUTE_RULE_ROUTER.add('get', '', async ({ db, token_payload }) => {
  const user_id = parseInt((token_payload?.sub || '0').toString());

  const routeRules = await db
    .select()
    .from(RouteRules)
    .where(
      or(
        eq(RouteRules.owner, user_id),
        eq(RouteRules.share, true)
      )
    );

  return Response.json(routeRules);
}, {
  allowedRoles: ['authenticated']
});

// Get route rule by ID
ROUTE_RULE_ROUTER.add('get', '/:id', async ({ db, token_payload, path_params }) => {
  const user_id = parseInt((token_payload?.sub || '0').toString());

  const routeRule = await db
    .select()
    .from(RouteRules)
    .where(eq(RouteRules.id, path_params.id))
    .limit(1);

  if (routeRule.length === 0) {
    return new Response('Route rule not found', { status: 404 });
  }

  const rule = routeRule[0];

  // Check if user can access this rule
  if (rule.owner !== user_id && !rule.share) {
    return new Response('Forbidden', { status: 403 });
  }

  return Response.json(rule);
}, {
  allowedRoles: ['authenticated'],
  pathParamsSchema: PathParamsSchema
});

// Create new route rule
ROUTE_RULE_ROUTER.add('post', '', async ({ db, token_payload, body }) => {
  const user_id = parseInt((token_payload?.sub || '0').toString());

  // Validate outbound exists and is accessible if specified
  if (body.outbound) {
    const outbound = await db
      .select()
      .from(Outbounds)
      .where(eq(Outbounds.id, body.outbound))
      .limit(1);

    if (outbound.length === 0) {
      return new Response('Outbound not found', { status: 400 });
    }

    const outboundRule = outbound[0];
    if (outboundRule.owner !== user_id && !outboundRule.share) {
      return new Response('Cannot reference inaccessible outbound', { status: 403 });
    }
  }

  const routeRuleData = {
    ...body,
    owner: user_id
  };

  const newRouteRule = await db
    .insert(RouteRules)
    .values(routeRuleData)
    .returning();

  return Response.json(newRouteRule[0], { status: 201 });
}, {
  allowedRoles: ['authenticated'],
  bodySchema: RouteRuleSchema
});

// Update route rule
ROUTE_RULE_ROUTER.add('put', '/:id', async ({ db, token_payload, path_params, body }) => {
  const user_id = parseInt((token_payload?.sub || '0').toString());

  // Check if route rule exists and user owns it
  const existingRule = await db
    .select()
    .from(RouteRules)
    .where(eq(RouteRules.id, path_params.id))
    .limit(1);

  if (existingRule.length === 0) {
    return new Response('Route rule not found', { status: 404 });
  }

  if (existingRule[0].owner !== user_id) {
    return new Response('Forbidden: You can only edit route rules you own', { status: 403 });
  }

  // Validate outbound exists and is accessible if specified
  if (body.outbound) {
    const outbound = await db
      .select()
      .from(Outbounds)
      .where(eq(Outbounds.id, body.outbound))
      .limit(1);

    if (outbound.length === 0) {
      return new Response('Outbound not found', { status: 400 });
    }

    const outboundRule = outbound[0];
    if (outboundRule.owner !== user_id && !outboundRule.share) {
      return new Response('Cannot reference inaccessible outbound', { status: 403 });
    }
  }

  const updatedRouteRule = await db
    .update(RouteRules)
    .set(body)
    .where(eq(RouteRules.id, path_params.id))
    .returning();

  return Response.json(updatedRouteRule[0]);
}, {
  allowedRoles: ['authenticated'],
  pathParamsSchema: PathParamsSchema,
  bodySchema: RouteRuleUpdateSchema
});

// Delete route rule
ROUTE_RULE_ROUTER.add('delete', '/:id', async ({ db, token_payload, path_params }) => {
  const user_id = parseInt((token_payload?.sub || '0').toString());

  // Check if route rule exists and user owns it
  const existingRule = await db
    .select()
    .from(RouteRules)
    .where(eq(RouteRules.id, path_params.id))
    .limit(1);

  if (existingRule.length === 0) {
    return new Response('Route rule not found', { status: 404 });
  }

  if (existingRule[0].owner !== user_id) {
    return new Response('Forbidden: You can only delete route rules you own', { status: 403 });
  }

  await db
    .delete(RouteRules)
    .where(eq(RouteRules.id, path_params.id));

  return new Response('', { status: 204 });
}, {
  allowedRoles: ['authenticated'],
  pathParamsSchema: PathParamsSchema
});
