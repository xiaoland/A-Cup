import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { Outbounds, Profiles, RuleSets } from '../db/schema';
import { SingBoxProfileSchema } from '../schemas/export';

// Export a single outbound into Sing-Box format (duplicate of logic in apis/outbound.ts without import to avoid cycles)
async function exportOutboundForProfile(db: DrizzleD1Database, id: number) {
  const outbounds = await db.select().from(Outbounds).where(eq(Outbounds.id, id)).limit(1);
  if (outbounds.length === 0) return null;

  const outbound: any = outbounds[0];
  const config: any = {
    type: outbound.type,
    tag: `out.${outbound.type}.${outbound.region || 'default'}.${outbound.name || outbound.id}`,
  };

  if (outbound.server) config.server = outbound.server as string;
  if (outbound.server_port) config.server_port = outbound.server_port as number;

  const credential = outbound.credential as any | undefined;
  if (credential && typeof credential === 'object') {
    if (credential.uuid) config.uuid = credential.uuid;
    if (credential.password) config.password = credential.password;
    if (credential.alter_id) config.alter_id = credential.alter_id;
    if (credential.method) config.method = credential.method;
    if (credential.security) config.security = credential.security;
    if (credential.network) config.network = credential.network;
    if (credential.flow) config.flow = credential.flow;
  }

  if (outbound.transport) config.transport = outbound.transport as any;
  if (outbound.tls) config.tls = outbound.tls as any;

  return config;
}

// Export a single rule set into Sing-Box format (duplicate of logic in apis/rule-set.ts without import to avoid cycles)
async function exportRuleSetForProfile(db: DrizzleD1Database, id: number) {
  const ruleSets = await db.select().from(RuleSets).where(eq(RuleSets.id, id)).limit(1);
  if (ruleSets.length === 0) return null;

  const ruleSet: any = ruleSets[0];
  const config: any = {
    tag: `rule_set.${ruleSet.type}.${ruleSet.id}`,
    type: ruleSet.type,
  };

  if (ruleSet.type === 'remote') {
    if (ruleSet.content) config.url = ruleSet.content as string;
  } else if (ruleSet.type === 'inline') {
    try {
      if (ruleSet.content) config.rules = JSON.parse(ruleSet.content as string);
    } catch {
      config.rules = [] as any;
    }
  }

  return config;
}

export async function exportProfileToR2(db: DrizzleD1Database, env: Env, profileId: number, baseConfig?: any) {
  // Fetch profile row
  const profileList = await db.select().from(Profiles).where(eq(Profiles.id, profileId)).limit(1);
  if (profileList.length === 0) return;

  const profile: any = profileList[0];
  const outboundIds: number[] = Array.isArray(profile.outbounds) ? profile.outbounds : JSON.parse(profile.outbounds || '[]');
  const ruleSetIds: number[] = Array.isArray(profile.rule_sets) ? profile.rule_sets : JSON.parse(profile.rule_sets || '[]');

  // Prepare base configuration
  let config: any;
  if (baseConfig) {
    // Shallow clone to avoid mutation
    config = JSON.parse(JSON.stringify(baseConfig));
  } else {
    // Load existing config from R2 and update only the outbounds and route.rule_set
    const existing = await env.OSS.get(`profiles/${profileId}`);
    if (existing) {
      try {
        config = await existing.json<any>();
      } catch {
        config = {};
      }
    } else {
      config = {};
    }
  }

  // Replace outbounds array with exported objects
  const [outbounds, ruleSets] = await Promise.all([
    Promise.all(outboundIds.map((id) => exportOutboundForProfile(db, id))).then((results) => results.filter((x): x is any => x != null)),
    Promise.all(ruleSetIds.map((id) => exportRuleSetForProfile(db, id))).then((results) => results.filter((x): x is any => x != null)),
  ]);

  config.outbounds = outbounds;
  // Ensure route object exists
  config.route = config.route || {};
  config.route.rule_set = ruleSets;

  // Validate with Zod
  SingBoxProfileSchema.parse(config);

  const configJson = JSON.stringify(config, null, 2);
  await env.OSS.put(`profiles/${profileId}`, configJson, {
    httpMetadata: { contentType: 'application/json' },
  });
}
