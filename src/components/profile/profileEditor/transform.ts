import type { Profile } from './schema'
import type { SingboxProfile } from '@/schemas/singbox'
import { useOutboundStore } from '@/stores/outbound'
import { useRuleSetStore } from '@/stores/ruleSet'
import type { Outbound } from '@/components/outbounds/outboundEditor/types'
import type { RuleSet } from '@/schemas/route'

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
  let credential = {}

  switch (type) {
    case 'vmess':
      credential = {
        uuid: rest.uuid,
        alter_id: rest.alter_id,
        security: rest.security,
      }
      break
    case 'vless':
      credential = {
        uuid: rest.uuid,
        flow: rest.flow,
      }
      break
    case 'shadowsocks':
      credential = {
        method: rest.method,
        password: rest.password,
      }
      break
    case 'trojan':
      credential = {
        password: rest.password,
      }
      break
    default:
      break
  }

  return {
    name: tag,
    type,
    server: rest.server || '',
    server_port: rest.server_port || 0,
    credential,
    transport: rest.transport,
    tls: rest.tls,
    mux: rest.mux,
  }
}

export async function transformSingboxToProfile(
  singboxProfile: SingboxProfile,
  existingProfile: Profile
): Promise<Profile> {
  const outboundStore = useOutboundStore()
  const ruleSetStore = useRuleSetStore()

  const newProfile: Profile = {
    ...existingProfile,
    name: existingProfile.name || 'Imported Profile',
  }

  if (singboxProfile.outbounds) {
    const outboundIds = await Promise.all(
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
    newProfile.outbounds = outboundIds.filter((id) => id !== undefined) as number[]
  }

  if (singboxProfile.route?.rule_set) {
    const ruleSetIds = await Promise.all(
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
    if (newProfile.route) {
      newProfile.route.rule_sets = ruleSetIds.filter((id) => id !== undefined)
    }
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

  return newProfile
}