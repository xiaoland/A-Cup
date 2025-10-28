import { eq } from 'drizzle-orm';
import { profiles } from '../db/schema';
import type { DrizzleDb } from '../db';
import type { OutboundWithDefaults } from '../../schemas/outbound';
import type { Dns, Inbound, Profile, Route, RuleSet } from '../../schemas/profile';
import { produce } from 'immer';

export class ProfileService {
  constructor(private db: DrizzleDb) {}

  async getProfiles(userId: string) {
    const profileList = await this.db
      .select()
      .from(profiles)
      .where(eq(profiles.createdBy, userId));

    return profileList.map(p => ({
      ...p,
      tags: JSON.parse(p.tags),
      outbounds: JSON.parse(p.outbounds),
      rule_sets: JSON.parse(p.rule_sets),
    }));
  }

  async getProfileById(id: string, userId: string) {
    const profile = await this.db
      .select()
      .from(profiles)
      .where(eq(profiles.id, id))
      .get();

    if (!profile || profile.createdBy !== userId) {
      return null;
    }

    return {
      ...profile,
      tags: JSON.parse(profile.tags),
      outbounds: JSON.parse(profile.outbounds),
      rule_sets: JSON.parse(profile.rule_sets),
    };
  }

  async deleteProfile(id: string, userId: string): Promise<boolean> {
    const profile = await this.db
      .select()
      .from(profiles)
      .where(eq(profiles.id, id))
      .get();

    if (!profile || profile.createdBy !== userId) {
      return false;
    }

    await this.db.delete(profiles).where(eq(profiles.id, id));
    return true;
  }
}

export function exportProfileToSingBox(
  profile: Profile,
  outbounds: OutboundWithDefaults[],
  ruleSets: RuleSet[],
  dns: Dns,
  inbounds: Inbound[],
  route: Route,
) {
  const singBoxProfile = {
    dns: {
      ...dns,
      rules: dns.rules.map((rule) => {
        if (rule.type === 'logical') {
          return {
            ...rule,
            rules: rule.rules.map((subRule) => {
              if (subRule.type === 'logical') {
                return {
                  ...subRule,
                  rules: subRule.rules.map(r => ({ ...r })),
                };
              }
              return { ...subRule };
            }),
          };
        }
        return { ...rule };
      }),
    },
    inbounds,
    outbounds: outbounds.map(o => ({
      ...o,
      tag: o.name,
    })),
    route: produce(route, (draft) => {
      draft.rule_set = draft.rule_set.map((id) => {
        const ruleSet = ruleSets.find(rs => rs.id === id);
        return {
          ...ruleSet,
          type: 'remote',
          format: 'binary',
          url: `https://example.com/rulesets/${id}`, // Placeholder
        };
      });
    }),
  };
  return singBoxProfile;
}
