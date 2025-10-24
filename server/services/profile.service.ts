import { z } from 'zod';
import { Profiles } from '../db/profile';
import { eq, and } from 'drizzle-orm';
import { ServiceBase } from '.';
import { Profile } from '../business/profile';
import { SpecialOutbound } from '../business/outbound';

const ProfileForCreate = z.object({
  name: z.string().min(1),
  tags: z.array(z.string()),
  outbounds: z.array(z.number().int().positive()),
  special_outbounds: z.array(SpecialOutbound.schema()),
  rule_sets: z.array(z.number().int().positive()),
});

export class ProfileService extends ServiceBase {
  async createProfile(userId: number, body: z.infer<typeof ProfileForCreate>) {
    const result = await this.db.insert(Profiles).values({
      created_by: userId,
      name: body.name,
      tags: JSON.stringify(body.tags),
      outbounds: JSON.stringify(body.outbounds),
      rule_sets: JSON.stringify(body.rule_sets),
    }).returning();

    const profile = new Profile(result[0]);

    if (!this.env.OSS) {
      throw new Error('Object storage not configured');
    }

    const baseConfig = { special_outbounds: body.special_outbounds };
    await profile.exportToSingBox(this.db, this.env, baseConfig);

    return profile;
  }

  async getProfiles(userId: number) {
    const profiles = await this.db.select().from(Profiles).where(
      eq(Profiles.created_by, userId)
    );

    return profiles.map((profile) => new Profile(profile));
  }

  async getProfileById(userId: number, profileId: string) {
    const result = await this.db.select().from(Profiles).where(
      and(
        eq(Profiles.id, profileId),
        eq(Profiles.created_by, userId)
      )
    ).limit(1);

    if (result.length === 0) {
      return null;
    }

    return new Profile(result[0]);
  }

  async getProfileWithSingboxConfig(userId: number, profileId: string) {
    const profile = await this.getProfileById(userId, profileId);

    if (!profile) {
      return null;
    }

    let r2Config: any = {};
    if (this.env.OSS) {
      const r2Object = await this.env.OSS.get(`profiles/${profile.id}`);
      if (r2Object) {
        try {
          const data = await r2Object.json();
          if (data) {
            r2Config = data;
          }
        } catch (error) {
          console.error(`Failed to parse R2 config for profile ${profile.id}`, error);
        }
      }
    }

    const special_outbounds = (r2Config.outbounds || []).filter((o: any) => ['selector', 'urltest', 'direct'].includes(o.type));
    return {
      ...r2Config,
      id: profile.id,
      name: profile.name,
      tags: profile.tags,
      outbounds: profile.outbounds,
      special_outbounds,
      route: {
        ...(r2Config.route || {}),
        rule_set: profile.rule_sets,
      },
    };
  }

  async updateProfile(userId: number, profileId: string, body: z.infer<typeof ProfileForCreate>) {
    const existingProfile = await this.getProfileById(userId, profileId);

    if (!existingProfile) {
      return null;
    }

    const result = await this.db.update(Profiles)
      .set({
        name: body.name,
        tags: JSON.stringify(body.tags),
        outbounds: JSON.stringify(body.outbounds),
        rule_sets: JSON.stringify(body.rule_sets),
      })
      .where(eq(Profiles.id, profileId))
      .returning();

    const profile = new Profile(result[0]);

    if (!this.env.OSS) {
      throw new Error('Object storage not configured');
    }

    const baseConfig = { special_outbounds: body.special_outbounds };
    await profile.exportToSingBox(this.db, this.env, baseConfig);

    return profile;
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
