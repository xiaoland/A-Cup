import type { Profile } from './schema'
import type { SingboxProfile } from '@/schemas/singbox'
import { useOutboundStore } from '@/stores/outbound'
import { useRuleSetStore } from '@/stores/ruleSet'
import type { Outbound } from '@/types/outbound'
import type { RuleSet } from '@/schemas/route'
import {
  ShadowsocksOutboundSchema,
  VmessOutboundSchema,
  VlessOutboundSchema,
  Hysteria2OutboundSchema,
  SelectorOutboundSchema,
  UrlTestOutboundSchema,
  OutboundSchema,
} from '@/schemas/outbound'

function ensureArray<T>(value: T | T[] | undefined): T[] {
  if (Array.isArray(value)) {
    return value
  }
  if (value === undefined) {
    return []
  }
  return [value]
}

function transformSingboxToOutbound(singboxOutbound: any): Omit<Outbound, 'id'> {
  const { tag, type, ...rest } = singboxOutbound

  const baseOutbound = {
    name: tag,
    tag: tag,
    type,
    ...rest,
  }

  switch (type) {
    case 'vmess':
      return VmessOutboundSchema.parse({ ...baseOutbound, security: rest.security || 'auto' })
    case 'vless':
      return VlessOutboundSchema.parse({ ...baseOutbound })
    case 'shadowsocks':
      return ShadowsocksOutboundSchema.parse({ ...baseOutbound, method: rest.method || '', password: rest.password || '' })
    case 'hysteria2':
      return Hysteria2OutboundSchema.parse({ ...baseOutbound, password: rest.password || ''})
    case 'selector':
      return SelectorOutboundSchema.parse({ ...baseOutbound, outbounds: rest.outbounds || [], default: rest.default || ''})
    case 'urltest':
      return UrlTestOutboundSchema.parse({ ...baseOutbound, outbounds: rest.outbounds || [], url: rest.url || '', interval: rest.interval || ''})
    default:
      return OutboundSchema.parse(baseOutbound)
  }
}

export async function transformSingboxToProfile(
  singboxProfile: SingboxProfile,
  existingProfile: Profile
): Promise<Profile> {
  const outboundStore = useOutboundStore()
  const ruleSetStore = useRuleSetStore()

  let outboundIds: (number | undefined)[] = []
  if (singboxProfile.outbounds) {
    outboundIds = await Promise.all(
      singboxProfile.outbounds.map(async (outbound) => {
        const existing = outboundStore.outbounds.find((o) => o.name === outbound.tag)
        if (existing) {
          return existing.id
        }
        const newOutbound = transformSingboxToOutbound(outbound)
        const created = await outboundStore.createOutbound(newOutbound)
        if (created) {
          return created.id
        }
      })
    )
  }

  let ruleSetIds: (number | undefined)[] = []
  if (singboxProfile.route?.rule_set) {
    ruleSetIds = await Promise.all(
      (singboxProfile.route.rule_set as any[]).map(async (rs) => {
        const tag = typeof rs === 'string' ? rs : rs.tag
        const existing = ruleSetStore.ruleSets.find((r) => r.name === tag)
        if (existing) {
          return existing.id
        }
        const newRuleSet: Partial<RuleSet> = {
          name: tag,
          type: 'remote',
          format: 'binary',
          content: '',
        }
        const created = await ruleSetStore.createRuleSet(newRuleSet as RuleSet)
        if (created) {
          return created.id
        }
      })
    )
  }

  const newProfile: Profile = {
    ...existingProfile,
    name: existingProfile.name || 'Imported Profile',
    outbounds: outboundIds.filter((id) => id !== undefined) as number[],
    dns: {
      ...singboxProfile.dns,
      servers: singboxProfile.dns?.servers || [],
      rules: singboxProfile.dns?.rules?.map(rule => ({
        ...rule,
        domain: ensureArray(rule.domain),
        domain_suffix: ensureArray(rule.domain_suffix),
        domain_keyword: ensureArray(rule.domain_keyword),
        domain_regex: ensureArray(rule.domain_regex),
        rule_set: ensureArray(rule.rule_set),
      })) || [],
    },
    route: {
      ...singboxProfile.route,
      rules: singboxProfile.route?.rules?.map(rule => ({
        ...rule,
        domain: ensureArray(rule.domain),
        domain_suffix: ensureArray(rule.domain_suffix),
        domain_keyword: ensureArray(rule.domain_keyword),
        domain_regex: ensureArray(rule.domain_regex),
        rule_set: ensureArray(rule.rule_set),
      })) || [],
      rule_set: ruleSetIds.filter((id) => id !== undefined) as number[],
    },
    inbounds: singboxProfile.inbounds?.map(inbound => {
      const { type, tag, ...rest } = inbound
      return {
        type,
        tag: tag || '',
        ...rest
      } as any
    }) || [],
  }

  return newProfile
}