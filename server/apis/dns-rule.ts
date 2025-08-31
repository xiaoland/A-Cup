import { z } from 'zod';
import { Router } from '../fund/router';
import { DNSRules, DNSServers, RuleSets } from '../db/schema';
import { eq, and, or, inArray } from 'drizzle-orm';
import { DrizzleD1Database } from 'drizzle-orm/d1';
import { DNSRuleInSingBoxSchema, type DNSRuleInSingBox } from '../schemas/export';
import { exportDNSServer } from './dns-server';
import { exportRuleSet } from './rule-set';

export const DNS_RULE_ROUTER = new Router('/dns_rules');

// Helper function to parse JSON fields in DNS rule responses
function parseDNSRuleFields(rule: any) {
  return {
    ...rule,
    domains: rule.domains ? JSON.parse(rule.domains as string) : null,
    domain_suffixes: rule.domain_suffixes ? JSON.parse(rule.domain_suffixes as string) : null,
    domain_keywords: rule.domain_keywords ? JSON.parse(rule.domain_keywords as string) : null,
    rule_sets: rule.rule_sets ? JSON.parse(rule.rule_sets as string) : null
  };
}

// Export function for DNS rules to sing-box format
export async function exportDNSRule(db: DrizzleD1Database, id: number, type: "sing-box" = "sing-box"): Promise<DNSRuleInSingBox | null> {
  const dnsRules = await db.select().from(DNSRules).where(eq(DNSRules.id, id)).limit(1);
  if (dnsRules.length === 0) return null;
  
  const dnsRule = dnsRules[0];
  const config: DNSRuleInSingBox = {};

  // Add conditions
  if (dnsRule.domains) {
    const domains = JSON.parse(dnsRule.domains as string);
    if (domains && domains.length > 0) config.domain = domains;
  }
  if (dnsRule.domain_suffixes) {
    const domain_suffixes = JSON.parse(dnsRule.domain_suffixes as string);
    if (domain_suffixes && domain_suffixes.length > 0) config.domain_suffix = domain_suffixes;
  }
  if (dnsRule.domain_keywords) {
    const domain_keywords = JSON.parse(dnsRule.domain_keywords as string);
    if (domain_keywords && domain_keywords.length > 0) config.domain_keyword = domain_keywords;
  }
  if (dnsRule.rule_sets) {
    const rule_set_ids = JSON.parse(dnsRule.rule_sets as string);
    if (rule_set_ids && rule_set_ids.length > 0) {
      // Use rule set export function to get proper tags
      const ruleSetConfigs = await Promise.all(
        rule_set_ids.map((id: number) => exportRuleSet(db, id))
      );
      config.rule_set = ruleSetConfigs
        .filter((rs): rs is NonNullable<typeof rs> => rs !== null)
        .map(rs => rs.tag);
    }
  }

  // Add action
  if (dnsRule.action === 'reject') {
    config.disable_cache = true;
  } else {
    // Use DNS server export function to get proper tag
    const dnsServerConfig = await exportDNSServer(db, dnsRule.server);
    if (dnsServerConfig) {
      config.server = dnsServerConfig.tag;
    }
  }

  // Validate result with Zod schema
  return DNSRuleInSingBoxSchema.parse(config);
}

const CreateDNSRuleSchema = z.object({
  name: z.string().min(1),
  action: z.enum(['route', 'reject']).optional(),
  server: z.number().int().positive(),
  domains: z.array(z.string()).optional(),
  domain_suffixes: z.array(z.string()).optional(),
  domain_keywords: z.array(z.string()).optional(),
  rule_sets: z.array(z.number().int().positive()).optional(),
  share: z.boolean().default(false)
});

const IDPathParamSchema = z.object({
  id: z.string().transform(val => parseInt(val))
});

// Create DNS Rule
DNS_RULE_ROUTER.add('POST', '', async ({ body, db, token_payload }) => {
  const user_id = parseInt((token_payload?.sub || '0').toString());

  // Validate DNS Server exists and is accessible
  const dns_server = await db.select().from(DNSServers).where(
    and(
      eq(DNSServers.id, body.server),
      or(
        eq(DNSServers.owner, user_id),
        eq(DNSServers.share, true)
      )
    )
  ).limit(1);
  
  if (dns_server.length === 0) {
    return new Response('Referenced DNS server not found or not accessible', { status: 400 });
  }

  // Validate rule sets exist and are accessible if provided
  if (body.rule_sets && body.rule_sets.length > 0) {
    for (const rule_set_id of body.rule_sets) {
      const rule_set = await db.select().from(RuleSets).where(
        and(
          eq(RuleSets.id, rule_set_id),
          or(
            eq(RuleSets.owner, user_id),
            eq(RuleSets.share, true)
          )
        )
      ).limit(1);
      
      if (rule_set.length === 0) {
        return new Response(`Referenced rule set ${rule_set_id} not found or not accessible`, { status: 400 });
      }
    }
  }

  // Validate that at least one condition is provided
  if ((!body.domains || body.domains.length === 0) && 
      (!body.domain_suffixes || body.domain_suffixes.length === 0) && 
      (!body.domain_keywords || body.domain_keywords.length === 0) && 
      (!body.rule_sets || body.rule_sets.length === 0)) {
    return new Response('At least one condition (domains, domain_suffixes, domain_keywords, or rule_sets) must be provided', { status: 400 });
  }

  const result = await db.insert(DNSRules).values({
    owner: user_id,
    name: body.name,
    action: body.action,
    server: body.server,
    domains: body.domains ? JSON.stringify(body.domains) : null,
    domain_suffixes: body.domain_suffixes ? JSON.stringify(body.domain_suffixes) : null,
    domain_keywords: body.domain_keywords ? JSON.stringify(body.domain_keywords) : null,
    rule_sets: body.rule_sets ? JSON.stringify(body.rule_sets) : null,
    share: body.share
  }).returning();

  const createdRule = result[0];
  // Parse JSON fields for response
  const parsedRule = parseDNSRuleFields(createdRule);

  return Response.json(parsedRule, { status: 201 });
}, {
  bodySchema: CreateDNSRuleSchema,
  allowedRoles: ['authenticated']
});

// Edit DNS Rule
const EditDNSRuleSchema = CreateDNSRuleSchema.partial();
DNS_RULE_ROUTER.add('PUT', '/:id', async ({ path_params, body, db, token_payload }) => {
  const current_user = parseInt((token_payload?.sub || '0').toString());
  const dns_rule_id = path_params.id;

  // Check ownership
  const existing = await db.select().from(DNSRules).where(eq(DNSRules.id, dns_rule_id)).limit(1);
  if (existing.length === 0) {
    return new Response('DNS Rule not found', { status: 404 });
  }
  if (existing[0].owner !== current_user) {
    return new Response('Forbidden', { status: 403 });
  }

  // Validate DNS Server exists and is accessible if provided
  if (body.server) {
    const dns_server = await db.select().from(DNSServers).where(
      and(
        eq(DNSServers.id, body.server),
        or(
          eq(DNSServers.owner, current_user),
          eq(DNSServers.share, true)
        )
      )
    ).limit(1);
    
    if (dns_server.length === 0) {
      return new Response('Referenced DNS server not found or not accessible', { status: 400 });
    }
  }

  // Validate rule sets exist and are accessible if provided
  if (body.rule_sets && body.rule_sets.length > 0) {
    for (const rule_set_id of body.rule_sets) {
      const rule_set = await db.select().from(RuleSets).where(
        and(
          eq(RuleSets.id, rule_set_id),
          or(
            eq(RuleSets.owner, current_user),
            eq(RuleSets.share, true)
          )
        )
      ).limit(1);
      
      if (rule_set.length === 0) {
        return new Response(`Referenced rule set ${rule_set_id} not found or not accessible`, { status: 400 });
      }
    }
  }

  const result = await db.update(DNSRules)
    .set({
      ...body,
      domains: body.domains !== undefined ? JSON.stringify(body.domains) : undefined,
      domain_suffixes: body.domain_suffixes !== undefined ? JSON.stringify(body.domain_suffixes) : undefined,
      domain_keywords: body.domain_keywords !== undefined ? JSON.stringify(body.domain_keywords) : undefined,
      rule_sets: body.rule_sets !== undefined ? JSON.stringify(body.rule_sets) : undefined
    })
    .where(eq(DNSRules.id, dns_rule_id))
    .returning();

  const updatedRule = result[0];
  // Parse JSON fields for response
  const parsedRule = parseDNSRuleFields(updatedRule);

  return Response.json(parsedRule);
}, {
  pathParamsSchema: IDPathParamSchema,
  bodySchema: EditDNSRuleSchema,
  allowedRoles: ['authenticated']
});

// Get DNS Rule by ID
DNS_RULE_ROUTER.add('GET', '/:id', async ({ path_params, db, token_payload }) => {
  const user_id = parseInt((token_payload?.sub || '0').toString());
  const dns_rule_id = path_params.id;

  // Check access (owner only for edit)
  const dns_rules = await db.select().from(DNSRules).where(
    and(
      eq(DNSRules.id, dns_rule_id),
      eq(DNSRules.owner, user_id)
    )
  ).limit(1);
  
  if (dns_rules.length === 0) {
    return new Response('DNS Rule not found', { status: 404 });
  }

  const rule = dns_rules[0];
  // Parse JSON fields
  const parsedRule = parseDNSRuleFields(rule);

  return Response.json(parsedRule);
}, {
  pathParamsSchema: IDPathParamSchema,
  allowedRoles: ['authenticated']
});

// List DNS Rules (owned or shared)
DNS_RULE_ROUTER.add('GET', '', async ({ db, token_payload, query_params }) => {
  const user_id = parseInt((token_payload?.sub || '0').toString());
  const server_id = query_params.server ? parseInt(query_params.server.toString()) : null;

  let whereCondition = or(
    eq(DNSRules.owner, user_id),
    eq(DNSRules.share, true)
  );

  // If server_id is provided, add it to the where condition
  if (server_id) {
    whereCondition = and(
      whereCondition,
      eq(DNSRules.server, server_id)
    );
  }

  const result = await db.select()
    .from(DNSRules)
    .where(whereCondition);

  // Parse JSON fields for each DNS rule
  const parsedResult = result.map(rule => parseDNSRuleFields(rule));

  return Response.json(parsedResult);
}, {
  allowedRoles: ['authenticated']
});

// Delete DNS Rule
DNS_RULE_ROUTER.add('DELETE', '/:id', async ({ path_params, db, token_payload }) => {
  const user_id = parseInt((token_payload?.sub || '0').toString());
  const dns_rule_id = path_params.id;

  // Check ownership
  const existing = await db.select().from(DNSRules).where(
    and(
      eq(DNSRules.id, dns_rule_id),
      eq(DNSRules.owner, user_id)
    )
  ).limit(1);
  
  if (existing.length === 0) {
    return new Response('DNS Rule not found', { status: 404 });
  }

  await db.delete(DNSRules).where(eq(DNSRules.id, dns_rule_id));
  return new Response('', { status: 204 });
}, {
  pathParamsSchema: IDPathParamSchema,
  allowedRoles: ['authenticated']
});
