import { z } from 'zod';
import { Profiles } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { SingBoxProfileRequestSchema } from '../schemas/export';
import { exportProfileToR2 } from '../fund/profile-export';

const CreateProfileSchema = SingBoxProfileRequestSchema.extend({
  name: z.string().min(1),
  tags: z.array(z.string()).optional(),
});
const UpdateProfileSchema = SingBoxProfileRequestSchema.partial();

export class ProfileService {
  constructor(private db: DrizzleD1Database, private env: any) {}

  async createProfile(userId: number, body: z.infer<typeof CreateProfileSchema>) {
    const ruleSetIds: number[] = body.route?.rule_set ?? [];

    const result = await this.db.insert(Profiles).values({
      created_by: userId,
      name: body.name,
      tags: JSON.stringify(body.tags),
      outbounds: JSON.stringify(body.outbounds),
      rule_sets: JSON.stringify(ruleSetIds),
    }).returning();

    const newProfile = result[0];

    if (!this.env.OSS) {
      throw new Error('Object storage not configured');
    }
    const baseConfig = { ...body };
    delete (baseConfig as any).name;
    delete (baseConfig as any).tags;
    await exportProfileToR2(this.db, this.env, newProfile.id, baseConfig);

    return newProfile;
  }

  async getProfiles(userId: number) {
    const profiles = await this.db.select().from(Profiles).where(
      eq(Profiles.created_by, userId)
    );

    return Promise.all(
      profiles.map(async (profile) => {
        return {
          ...profile,
          tags: JSON.parse(profile.tags as string),
          outbounds: JSON.parse(profile.outbounds as string),
          rule_sets: JSON.parse(profile.rule_sets as string),
        };
      })
    );
  }

  async getProfileById(userId: number, profileId: string) {
    const profile = await this.db.select().from(Profiles).where(
      and(
        eq(Profiles.id, profileId),
        eq(Profiles.created_by, userId)
      )
    ).limit(1);

    if (profile.length === 0) {
      return null;
    }

    const profileData = profile[0] as any;
    let r2Config: any = {};
    if (this.env.OSS) {
      const r2Object = await this.env.OSS.get(`profiles/${profileData.id}`);
      if (r2Object) {
        try {
          const data = await r2Object.json();
          if (data) {
            r2Config = data;
          }
        } catch (error) {
          console.error(`Failed to parse R2 config for profile ${profileData.id}`, error);
        }
      }
    }
    return {
      ...r2Config,
      id: profileData.id,
      name: profileData.name,
      tags: JSON.parse(profileData.tags as string),
      outbounds: JSON.parse(profileData.outbounds as string),
      route: {
        ...(r2Config.route || {}),
        rule_set: JSON.parse(profileData.rule_sets as string),
      },
    };
  }

  async updateProfile(userId: number, profileId: string, body: z.infer<typeof UpdateProfileSchema>) {
    const existingProfile = await this.getProfileById(userId, profileId);

    if (!existingProfile) {
      return null;
    }

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.tags !== undefined) updateData.tags = JSON.stringify(body.tags);
    if (body.outbounds !== undefined) updateData.outbounds = JSON.stringify(body.outbounds);
    if (body.route?.rule_set !== undefined) updateData.rule_sets = JSON.stringify(body.route.rule_set);

    const result = await this.db.update(Profiles)
      .set(updateData)
      .where(eq(Profiles.id, profileId))
      .returning();

    if (!this.env.OSS) {
      throw new Error('Object storage not configured');
    }
    const baseConfig = { ...body };
    delete (baseConfig as any).name;
    delete (baseConfig as any).tags;
    await exportProfileToR2(this.db, this.env, existingProfile.id, baseConfig);

    const resultData = result[0] as any;
    return {
      ...resultData,
      tags: JSON.parse(resultData.tags as string),
      outbounds: JSON.parse(resultData.outbounds as string),
      rule_sets: JSON.parse(resultData.rule_sets as string),
    };
  }

  async deleteProfile(userId: number, profileId: string) {
    const result = await this.db.delete(Profiles).where(
      and(
        eq(Profiles.id, profileId),
        eq(Profiles.created_by, userId)
      )
    ).returning();

    if (result.length === 0) {
      return false;
    }

    if (this.env.OSS) {
      const key = `profiles/${result[0].id}`;
      await this.env.OSS.delete(key);
    }

    return true;
  }

  async exportProfile(userId: number, profileId: string) {
    const profile = await this.getProfileById(userId, profileId);

    if (!profile) {
      return null;
    }

    const url = `${this.env.OSS_PUBLIC_DOMAIN}/profiles/${profile.id}`;

    return {
      method: 'oss',
      url: url,
      fileName: `${profile.name}.json`
    };
  }
}
