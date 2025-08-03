import { z } from 'zod';
import { Router } from '../fund/router';
import { 
  Profiles, 
  Inbounds, 
  Outbounds, 
  EndpointWireguards, 
  RouteRules, 
  RuleSets, 
  DNSRules, 
  DNSServers 
} from '../db/schema';
import { eq, and, or, inArray } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { 
  SingBoxProfileSchema, 
  ProfileExportResponseSchema,
  type SingBoxProfile,
  type ProfileExportResponse
} from '../schemas/export';

// Import export functions from other modules
import { exportInbound } from './inbound';
import { exportOutbound } from './outbound';
import { exportWireguardEndpoint } from './endpoint';
import { exportRouteRule } from './route-rule';
import { exportRuleSet } from './rule-set';
import { exportDNSRule } from './dns-rule';
import { exportDNSServer } from './dns-server';

export const PROFILE_ROUTER = new Router('/profiles');

const CreateProfileSchema = z.object({
  name: z.string().min(1),
  tags: z.array(z.string()).default([]),
  inbounds: z.array(z.number().int().positive()).default([]),
  outbounds: z.array(z.number().int().positive()).default([]),
  route_final: z.number().int().positive().optional(),
  wg_endpoints: z.array(z.number().int().positive()).default([]),
  rules: z.array(z.number().int().positive()).default([]),
  rule_sets: z.array(z.number().int().positive()).default([]),
  dns_rules: z.array(z.number().int().positive()).default([]),
  dns: z.array(z.number().int().positive()).default([])
});

const UpdateProfileSchema = CreateProfileSchema.partial();

const IDPathParamSchema = z.object({
  id: z.string().transform(val => parseInt(val))
});

const ExportQuerySchema = z.object({
  type: z.enum(['sing-box']).default('sing-box'),
  method: z.enum(['oss', 'direct']).default('direct')
});

// Helper function to validate entity access
async function validateEntityAccess(db: any, user_id: number, entityIds: number[], table: any, entityName: string) {
  if (entityIds.length === 0) return true;
  
  const entities = await db.select().from(table).where(
    and(
      inArray(table.id, entityIds),
      or(
        eq(table.owner, user_id),
        eq(table.share, true)
      )
    )
  );
  
  if (entities.length !== entityIds.length) {
    throw new Error(`Some ${entityName} not found or not accessible`);
  }
  
  return true;
}

// Create Profile
PROFILE_ROUTER.add('POST', '', async ({ body, db, token_payload }) => {
  const user_id = parseInt((token_payload?.sub || '0').toString());
  
  try {
    // Validate all referenced entities exist and are accessible
    await validateEntityAccess(db, user_id, body.inbounds, Inbounds, 'inbounds');
    await validateEntityAccess(db, user_id, body.outbounds, Outbounds, 'outbounds');
    await validateEntityAccess(db, user_id, body.wg_endpoints, EndpointWireguards, 'WireGuard endpoints');
    await validateEntityAccess(db, user_id, body.rules, RouteRules, 'route rules');
    await validateEntityAccess(db, user_id, body.rule_sets, RuleSets, 'rule sets');
    await validateEntityAccess(db, user_id, body.dns_rules, DNSRules, 'DNS rules');
    await validateEntityAccess(db, user_id, body.dns, DNSServers, 'DNS servers');
    
    // Validate route_final if provided
    if (body.route_final) {
      await validateEntityAccess(db, user_id, [body.route_final], Outbounds, 'route final outbound');
    }
    
    const result = await db.insert(Profiles).values({
      created_by: user_id,
      name: body.name,
      tags: JSON.stringify(body.tags),
      inbounds: JSON.stringify(body.inbounds),
      outbounds: JSON.stringify(body.outbounds),
      route_final: body.route_final,
      wg_endpoints: JSON.stringify(body.wg_endpoints),
      rules: JSON.stringify(body.rules),
      rule_sets: JSON.stringify(body.rule_sets),
      dns_rules: JSON.stringify(body.dns_rules),
      dns: JSON.stringify(body.dns)
    }).returning();
    
    return Response.json(result[0]);
  } catch (error) {
    return new Response(error instanceof Error ? error.message : 'Validation failed', { status: 400 });
  }
}, {
  bodySchema: CreateProfileSchema,
  allowedRoles: ['authenticated']
});

// Get All Profiles
PROFILE_ROUTER.add('GET', '', async ({ db, token_payload }) => {
  const user_id = parseInt((token_payload?.sub || '0').toString());
  
  const profiles = await db.select().from(Profiles).where(
    eq(Profiles.created_by, user_id)
  );
  
  // Parse JSON fields
  const parsedProfiles = profiles.map((profile: any) => ({
    ...profile,
    tags: JSON.parse(profile.tags as string),
    inbounds: JSON.parse(profile.inbounds as string),
    outbounds: JSON.parse(profile.outbounds as string),
    wg_endpoints: JSON.parse(profile.wg_endpoints as string),
    rules: JSON.parse(profile.rules as string),
    rule_sets: JSON.parse(profile.rule_sets as string),
    dns_rules: JSON.parse(profile.dns_rules as string),
    dns: JSON.parse(profile.dns as string)
  }));
  
  return Response.json(parsedProfiles);
}, {
  allowedRoles: ['authenticated']
});

// Get Profile by ID
PROFILE_ROUTER.add('GET', '/:id', async ({ path_params, db, token_payload }) => {
  const user_id = parseInt((token_payload?.sub || '0').toString());
  
  const profile = await db.select().from(Profiles).where(
    and(
      eq(Profiles.id, path_params.id),
      eq(Profiles.created_by, user_id)
    )
  ).limit(1);
  
  if (profile.length === 0) {
    return new Response('Profile not found', { status: 404 });
  }
  
  // Parse JSON fields
  const profileData = profile[0] as any;
  const parsedProfile = {
    ...profileData,
    tags: JSON.parse(profileData.tags as string),
    inbounds: JSON.parse(profileData.inbounds as string),
    outbounds: JSON.parse(profileData.outbounds as string),
    wg_endpoints: JSON.parse(profileData.wg_endpoints as string),
    rules: JSON.parse(profileData.rules as string),
    rule_sets: JSON.parse(profileData.rule_sets as string),
    dns_rules: JSON.parse(profileData.dns_rules as string),
    dns: JSON.parse(profileData.dns as string)
  };
  
  return Response.json(parsedProfile);
}, {
  pathParamsSchema: IDPathParamSchema,
  allowedRoles: ['authenticated']
});

// Update Profile
PROFILE_ROUTER.add('PUT', '/:id', async ({ path_params, body, db, token_payload }) => {
  const user_id = parseInt((token_payload?.sub || '0').toString());
  
  // Check if profile exists and is owned by user
  const existingProfile = await db.select().from(Profiles).where(
    and(
      eq(Profiles.id, path_params.id),
      eq(Profiles.created_by, user_id)
    )
  ).limit(1);
  
  if (existingProfile.length === 0) {
    return new Response('Profile not found', { status: 404 });
  }
  
  try {
    // Validate all referenced entities if they are being updated
    if (body.inbounds) await validateEntityAccess(db, user_id, body.inbounds, Inbounds, 'inbounds');
    if (body.outbounds) await validateEntityAccess(db, user_id, body.outbounds, Outbounds, 'outbounds');
    if (body.wg_endpoints) await validateEntityAccess(db, user_id, body.wg_endpoints, EndpointWireguards, 'WireGuard endpoints');
    if (body.rules) await validateEntityAccess(db, user_id, body.rules, RouteRules, 'route rules');
    if (body.rule_sets) await validateEntityAccess(db, user_id, body.rule_sets, RuleSets, 'rule sets');
    if (body.dns_rules) await validateEntityAccess(db, user_id, body.dns_rules, DNSRules, 'DNS rules');
    if (body.dns) await validateEntityAccess(db, user_id, body.dns, DNSServers, 'DNS servers');
    
    // Validate route_final if provided
    if (body.route_final) {
      await validateEntityAccess(db, user_id, [body.route_final], Outbounds, 'route final outbound');
    }
    
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.tags !== undefined) updateData.tags = JSON.stringify(body.tags);
    if (body.inbounds !== undefined) updateData.inbounds = JSON.stringify(body.inbounds);
    if (body.outbounds !== undefined) updateData.outbounds = JSON.stringify(body.outbounds);
    if (body.route_final !== undefined) updateData.route_final = body.route_final;
    if (body.wg_endpoints !== undefined) updateData.wg_endpoints = JSON.stringify(body.wg_endpoints);
    if (body.rules !== undefined) updateData.rules = JSON.stringify(body.rules);
    if (body.rule_sets !== undefined) updateData.rule_sets = JSON.stringify(body.rule_sets);
    if (body.dns_rules !== undefined) updateData.dns_rules = JSON.stringify(body.dns_rules);
    if (body.dns !== undefined) updateData.dns = JSON.stringify(body.dns);
    
    const result = await db.update(Profiles)
      .set(updateData)
      .where(eq(Profiles.id, path_params.id))
      .returning();
    
    // Parse JSON fields for response
    const resultData = result[0] as any;
    const parsedProfile = {
      ...resultData,
      tags: JSON.parse(resultData.tags as string),
      inbounds: JSON.parse(resultData.inbounds as string),
      outbounds: JSON.parse(resultData.outbounds as string),
      wg_endpoints: JSON.parse(resultData.wg_endpoints as string),
      rules: JSON.parse(resultData.rules as string),
      rule_sets: JSON.parse(resultData.rule_sets as string),
      dns_rules: JSON.parse(resultData.dns_rules as string),
      dns: JSON.parse(resultData.dns as string)
    };
    
    return Response.json(parsedProfile);
  } catch (error) {
    return new Response(error instanceof Error ? error.message : 'Validation failed', { status: 400 });
  }
}, {
  pathParamsSchema: IDPathParamSchema,
  bodySchema: UpdateProfileSchema,
  allowedRoles: ['authenticated']
});

// Delete Profile
PROFILE_ROUTER.add('DELETE', '/:id', async ({ path_params, db, token_payload }) => {
  const user_id = parseInt((token_payload?.sub || '0').toString());
  
  const result = await db.delete(Profiles).where(
    and(
      eq(Profiles.id, path_params.id),
      eq(Profiles.created_by, user_id)
    )
  ).returning();
  
  if (result.length === 0) {
    return new Response('Profile not found', { status: 404 });
  }
  
  return Response.json({ message: 'Profile deleted successfully' });
}, {
  pathParamsSchema: IDPathParamSchema,
  allowedRoles: ['authenticated']
});

// Export Profile
PROFILE_ROUTER.add('GET', '/:id/export', async ({ path_params, query_params, db, token_payload, env }) => {
  const user_id = parseInt((token_payload?.sub || '0').toString());
  
  // Get profile
  const profile = await db.select().from(Profiles).where(
    and(
      eq(Profiles.id, path_params.id),
      eq(Profiles.created_by, user_id)
    )
  ).limit(1);
  
  if (profile.length === 0) {
    return new Response('Profile not found', { status: 404 });
  }
  
  const profileData = profile[0] as any;
  const inboundIds = JSON.parse(profileData.inbounds as string) as number[];
  const outboundIds = JSON.parse(profileData.outbounds as string) as number[];
  const wgEndpointIds = JSON.parse(profileData.wg_endpoints as string) as number[];
  const ruleIds = JSON.parse(profileData.rules as string) as number[];
  const ruleSetIds = JSON.parse(profileData.rule_sets as string) as number[];
  const dnsRuleIds = JSON.parse(profileData.dns_rules as string) as number[];
  const dnsServerIds = JSON.parse(profileData.dns as string) as number[];
  
  try {
    // Use individual module export methods to generate configurations
    const [inbounds, outbounds, wgEndpoints, rules, ruleSets, dnsRules, dnsServers] = await Promise.all([
      Promise.all(inboundIds.map(id => exportInbound(db, id))).then(results => results.filter((item): item is NonNullable<typeof item> => item !== null)),
      Promise.all(outboundIds.map(id => exportOutbound(db, id))).then(results => results.filter((item): item is NonNullable<typeof item> => item !== null)),
      Promise.all(wgEndpointIds.map(id => exportWireguardEndpoint(db, id))).then(results => results.filter((item): item is NonNullable<typeof item> => item !== null)),
      Promise.all(ruleIds.map(id => exportRouteRule(db, id))).then(results => results.filter((item): item is NonNullable<typeof item> => item !== null)),
      Promise.all(ruleSetIds.map(id => exportRuleSet(db, id))).then(results => results.filter((item): item is NonNullable<typeof item> => item !== null)),
      Promise.all(dnsRuleIds.map(id => exportDNSRule(db, id))).then(results => results.filter((item): item is NonNullable<typeof item> => item !== null)),
      Promise.all(dnsServerIds.map(id => exportDNSServer(db, id))).then(results => results.filter((item): item is NonNullable<typeof item> => item !== null))
    ]);
    
    // Determine the final outbound with proper tag format
    let finalOutbound = "direct";
    if (profileData.route_final) {
      // Find the route_final outbound in our exported outbounds
      const finalOutboundData = outbounds.find(out => out.tag.endsWith(`.${profileData.route_final}`));
      if (finalOutboundData) {
        finalOutbound = finalOutboundData.tag;
      }
    } else if (outbounds.length > 0) {
      finalOutbound = outbounds[0]?.tag || "direct";
    }
    
    // Generate sing-box configuration
    const singBoxConfig: SingBoxProfile = {
      log: {
        level: "info",
        timestamp: true
      },
      experimental: {
        cache_file: {
          enabled: true,
          store_fakeip: true,
          store_rdrc: false
        }
      },
      inbounds: inbounds,
      outbounds: outbounds,
      endpoints: wgEndpoints,
      route: {
        rule_set: ruleSets,
        rules: rules,
        final: finalOutbound,
        auto_detect_interface: true
      },
      dns: {
        disable_cache: false,
        disable_expire: false,
        independent_cache: false,
        servers: dnsServers,
        rules: dnsRules
      }
    };

    // Validate the complete configuration with Zod schema
    const validatedConfig = SingBoxProfileSchema.parse(singBoxConfig);
    
    const configJson = JSON.stringify(singBoxConfig, null, 2);
    
    if (query_params.method === 'oss') {
      // Check if R2 is configured
      if (!env.OSS) {
        return new Response('Object storage not configured', { status: 501 });
      }
      
      // Upload to R2 storage
      const fileName = `${profileData.id}-${profileData.name.replace(/[^a-zA-Z0-9]/g, '-')}.json`;
      const key = `profiles/${fileName}`;
      
      await env.OSS.put(key, configJson, {
        httpMetadata: {
          contentType: 'application/json'
        }
      });
      
      // Generate a presigned URL or return the public URL
      const url = env.OSS_PUBLIC_DOMAIN 
        ? `https://${env.OSS_PUBLIC_DOMAIN}/${key}`
        : `Object uploaded as ${key}`;
      
      const response: ProfileExportResponse = {
        method: 'oss',
        url: url,
        fileName: fileName
      };
      
      return Response.json(ProfileExportResponseSchema.parse(response));
    } else {
      // Return direct download
      const response: ProfileExportResponse = {
        method: 'direct',
        content: configJson,
        fileName: `${profileData.name}.json`
      };
      
      return Response.json(ProfileExportResponseSchema.parse(response));
    }
    
  } catch (error) {
    console.error('Export error:', error);
    return new Response('Export failed', { status: 500 });
  }
}, {
  pathParamsSchema: IDPathParamSchema,
  queryParamsSchema: ExportQuerySchema,
  allowedRoles: ['authenticated']
});
