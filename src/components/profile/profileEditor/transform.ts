import type { Profile } from './schema'
import type { SingboxProfile } from '@/schemas/singbox'

function ensureArray<T>(value: T | T[] | undefined): T[] {
  if (Array.isArray(value)) {
    return value
  }
  if (value === undefined) {
    return []
  }
  return [value]
}

export function transformSingboxToProfile(
  singboxProfile: SingboxProfile,
  existingProfile: Profile
): Profile {
  const newProfile: Profile = {
    ...existingProfile,
    name: existingProfile.name || 'Imported Profile',
  }

  if (singboxProfile.dns) {
    newProfile.dns = {
      ...singboxProfile.dns,
      rules: singboxProfile.dns.rules?.map(rule => ({
        ...rule,
        domain: ensureArray(rule.domain),
        domain_suffix: ensureArray(rule.domain_suffix),
        domain_keyword: ensureArray(rule.domain_keyword),
        domain_regex: ensureArray(rule.domain_regex),
        rule_set: ensureArray(rule.rule_set),
      })) || [],
    }
  }

  if (singboxProfile.route) {
    newProfile.route = {
      ...singboxProfile.route,
      rules: singboxProfile.route.rules?.map(rule => ({
        ...rule,
        domain: ensureArray(rule.domain),
        domain_suffix: ensureArray(rule.domain_suffix),
        domain_keyword: ensureArray(rule.domain_keyword),
        domain_regex: ensureArray(rule.domain_regex),
        rule_set: ensureArray(rule.rule_set),
      })) || [],
      rule_set: singboxProfile.route.rule_set?.map(rs => typeof rs === 'string' ? rs : rs.tag) || []
    }
  }

  if (singboxProfile.inbounds) {
    newProfile.inbounds = singboxProfile.inbounds.map(inbound => {
      const { type, tag, ...rest } = inbound
      return {
        type,
        tag: tag || '',
        ...rest
      } as any
    })
  }

  if (singboxProfile.outbounds) {
    newProfile.outbounds = singboxProfile.outbounds.map(outbound => {
      const { type, tag, ...rest } = outbound
      return {
        type,
        tag,
        name: tag,
        server: rest.server || '',
        server_port: rest.server_port || 0,
        credential: rest.credential || {},
        ...rest,
      } as any
    })
  }


  return newProfile
}