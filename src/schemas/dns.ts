import { z } from 'zod'

export const dialSchema = z.object({
  detour: z.string().optional(),
  bind_interface: z.string().optional(),
  inet4_bind_address: z.string().optional(),
  inet6_bind_address: z.string().optional(),
  routing_mark: z.number().optional(),
  reuse_addr: z.boolean().optional(),
  netns: z.string().optional(),
  connect_timeout: z.string().optional(),
  tcp_fast_open: z.boolean().optional(),
  tcp_multi_path: z.boolean().optional(),
  udp_fragment: z.boolean().optional(),
  domain_resolver: z.string().optional(),
  network_strategy: z.string().optional(),
  network_type: z.array(z.string()).optional(),
  fallback_network_type: z.array(z.string()).optional(),
  fallback_delay: z.string().optional(),
  domain_strategy: z.string().optional(),
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
}).extend(dialSchema.shape)

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