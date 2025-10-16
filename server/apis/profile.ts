import { z } from 'zod';
import { Router } from '../fund/router';
import { 
  Profiles, 
  Outbounds, 
  RuleSets
} from '../db/schema';
import { eq, and, or, inArray } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { 
  SingBoxProfileSchema,
  SingBoxProfileRequestSchema,
  ProfileExportResponseSchema,
  type SingBoxProfile,
  type ProfileExportResponse
} from '../schemas/export';
import { exportProfileToR2 } from '../fund/profile-export';

// Import export functions from other modules
import { exportOutbound } from './outbound';
import { exportRuleSet } from './rule-set';

export const PROFILE_ROUTER = new Router('/profiles');

// Request body schema derived from Sing-Box JSON Schema with adapted ID arrays
const CreateProfileSchema = SingBoxProfileRequestSchema;
const UpdateProfileSchema = SingBoxProfileRequestSchema.partial();

const IDPathParamSchema = z.object({
  id: z.string().transform(val => parseInt(val))
});

const ExportQuerySchema = z.object({
  type: z.enum(['sing-box']).default('sing-box'),
  method: z.enum(['oss', 'direct']).default('direct')
});

// Create Profile
PROFILE_ROUTER.add('POST', '', async ({ body, db, token_payload, env }) => {
  const user_id = parseInt((token_payload?.sub || '0').toString());
  
  try {
    const ruleSetIds: number[] = body.route?.rule_set ?? [];
    
    const result = await db.insert(Profiles).values({
      created_by: user_id,
      name: body.name,
      tags: JSON.stringify(body.tags),
      outbounds: JSON.stringify(body.outbounds),
      rule_sets: JSON.stringify(ruleSetIds),
    }).returning();
    
    // Upload exported profile to R2 (private)
    if (!env.OSS) {
      return new Response('Object storage not configured', { status: 501 });
    }
    // Remove DB-only fields from base config
    const baseConfig = { ...body };
    delete (baseConfig as any).name;
    delete (baseConfig as any).tags;
    await exportProfileToR2(db, env, (result[0] as any).id, baseConfig);

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
    outbounds: JSON.parse(profile.outbounds as string),
    rule_sets: JSON.parse(profile.rule_sets as string),
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
    outbounds: JSON.parse(profileData.outbounds as string),
    rule_sets: JSON.parse(profileData.rule_sets as string),
  };
  
  return Response.json(parsedProfile);
}, {
  pathParamsSchema: IDPathParamSchema,
  allowedRoles: ['authenticated']
});

// Update Profile
PROFILE_ROUTER.add('PUT', '/:id', async ({ path_params, body, db, token_payload, env }) => {
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
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.tags !== undefined) updateData.tags = JSON.stringify(body.tags);
    if (body.outbounds !== undefined) updateData.outbounds = JSON.stringify(body.outbounds);
    if (body.route?.rule_set !== undefined) updateData.rule_sets = JSON.stringify(body.route.rule_set);
    
    const result = await db.update(Profiles)
      .set(updateData)
      .where(eq(Profiles.id, path_params.id))
      .returning();
    
    // Upload updated profile export to R2 (private)
    if (!env.OSS) {
      return new Response('Object storage not configured', { status: 501 });
    }
    const baseConfig = { ...body };
    delete (baseConfig as any).name;
    delete (baseConfig as any).tags;
    await exportProfileToR2(db, env, path_params.id, baseConfig);

    // Parse JSON fields for response
    const resultData = result[0] as any;
    const parsedProfile = {
      ...resultData,
      tags: JSON.parse(resultData.tags as string),
      outbounds: JSON.parse(resultData.outbounds as string),
      rule_sets: JSON.parse(resultData.rule_sets as string),
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
PROFILE_ROUTER.add('DELETE', '/:id', async ({ path_params, db, token_payload, env }) => {
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

  // Also delete the exported profile from R2
  if (env.OSS) {
    const key = `profiles/${path_params.id}`;
    await env.OSS.delete(key);
  }
  
  return Response.json({ message: 'Profile deleted successfully' });
}, {
  pathParamsSchema: IDPathParamSchema,
  allowedRoles: ['authenticated']
});

// Export Profile
PROFILE_ROUTER.add('GET', '/:id/export', async ({ path_params, db, token_payload, env }) => {
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

  // Check if R2 is configured
  if (!env.OSS) {
    return new Response('Object storage not configured', { status: 501 });
  }

  const profileData = profile[0] as any;
  const key = `profiles/${profileData.id}`;

  try {
    // Check if the object exists in R2
    const object = await env.OSS.head(key);
    if (object === null) {
      // (Optional) Regenerate the profile if it's missing
      // For now, we'll return an error as per the plan.
      return new Response('Exported profile not found in storage.', { status: 404 });
    }

    // Generate a pre-signed URL for GET requests, expiring in 5 minutes (300 seconds)
    const signedUrl = await env.OSS.createSignedUrl('getObject', key, {
      expires: 300,
    });

    const response: ProfileExportResponse = {
      method: 'oss',
      url: signedUrl,
      fileName: `${profileData.name}.json`
    };

    return Response.json(ProfileExportResponseSchema.parse(response));

  } catch (error) {
    console.error('Export error:', error);
    return new Response('Failed to generate signed URL for export.', { status: 500 });
  }
}, {
  pathParamsSchema: IDPathParamSchema,
  allowedRoles: ['authenticated']
});
