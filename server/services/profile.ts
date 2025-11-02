import { CreateProfile } from '../../schemas/profile';
import { SingBoxProfile } from '../../schemas/singbox';
import { eq } from 'drizzle-orm';
import { profiles } from '../db/schema';
import { DrizzleD1Database } from 'drizzle-orm/d1';


export function exportProfileCreateToSingBox(
  profileCreate: CreateProfile
): SingBoxProfile {
  const { name, tags, referencedOutbounds, referencedRuleSets, ...result } = profileCreate;
  return result;
}

export class ProfileService {
  constructor(private db: DrizzleD1Database) {}

  async getProfiles() {
    const profileList = await this.db
      .select()
      .from(profiles);

    return profileList.map(p => ({
      ...p,
      tags: JSON.parse(p.tags),
      outbounds: JSON.parse(p.outbounds),
      rule_sets: JSON.parse(p.rule_sets),
    }));
  }

  async getProfileById(id: string) {
    const profile = await this.db
      .select()
      .from(profiles)
      .where(eq(profiles.id, id))
      .get();

    if (!profile) {
      return null;
    }

    return {
      ...profile,
      tags: JSON.parse(profile.tags),
      outbounds: JSON.parse(profile.outbounds),
      rule_sets: JSON.parse(profile.rule_sets),
    };
  }

  async deleteProfile(id: string): Promise<boolean> {
    const profile = await this.db
      .select()
      .from(profiles)
      .where(eq(profiles.id, id))
      .get();

    if (!profile) {
      return false;
    }

    await this.db.delete(profiles).where(eq(profiles.id, id));
    return true;
  }
}
