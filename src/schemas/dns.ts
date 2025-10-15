import { z } from 'zod'

export const dialSchema = z.object({
  detour: z.string().optional(),
  address_resolver: z.string().optional(),
})

export const dnsServerSchema = z.object({
  type: z.enum(['udp', 'https', 'fakeip']).default('udp'),
  tag: z.string(),
  address: z.string().optional(),
  server: z.string().optional(),
  server_port: z.number().optional(),
  path: z.string().optional(),
  headers: z.record(z.string(), z.string()).optional(),
  tls: z.object({}).optional(),
  inet4_range: z.string().optional(),
  inet6_range: z.string().optional(),
  dial_fields: dialSchema.optional(),
})

export const dnsRuleSchema = z.object({
  server: z.string(),
  domain: z.array(z.string()).optional(),
  domain_regex: z.array(z.string()).optional(),
  domain_suffix: z.array(z.string()).optional(),
  domain_keyword: z.array(z.string()).optional(),
  rule_set: z.array(z.string()).optional(),
})

export const dnsSchema = z.object({
  servers: z.array(dnsServerSchema),
  rules: z.array(dnsRuleSchema).optional(),
  final: z.string().optional(),
  strategy: z.string().optional(),
  disable_cache: z.boolean().optional(),
  disable_expire: z.boolean().optional(),
})

export type DnsServer = z.infer<typeof dnsServerSchema>
export type DnsRule = z.infer<typeof dnsRuleSchema>
export type Dns = z.infer<typeof dnsSchema>