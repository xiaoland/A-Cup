import { z } from 'zod'

const stringOrStringArray = z.union([z.string(), z.array(z.string())])

const DnsRuleSchema = z.object({
  server: z.string(),
  domain: stringOrStringArray.optional(),
  domain_regex: stringOrStringArray.optional(),
  domain_suffix: stringOrStringArray.optional(),
  domain_keyword: stringOrStringArray.optional(),
  rule_set: stringOrStringArray.optional(),
  outbound: stringOrStringArray.optional(),
  disable_cache: z.boolean().optional(),
  clash_mode: z.string().optional(),
}).loose()

const DnsSchema = z.object({
  servers: z.array(z.any()),
  rules: z.array(DnsRuleSchema).optional(),
  final: z.string().optional(),
  strategy: z.string().optional(),
  disable_cache: z.boolean().optional(),
  disable_expire: z.boolean().optional(),
  independent_cache: z.boolean().optional(),
  fakeip: z.any().optional(),
}).loose()

const InboundSchema = z.object({
  type: z.string(),
  tag: z.string().optional(),
}).loose()

const OutboundSchema = z.object({
  type: z.string(),
  tag: z.string(),
}).loose()

const RouteRuleSchema = z.object({
  rule_set: stringOrStringArray.optional(),
  domain: stringOrStringArray.optional(),
  domain_suffix: stringOrStringArray.optional(),
  domain_keyword: stringOrStringArray.optional(),
  domain_regex: stringOrStringArray.optional(),
  outbound: z.string().optional(),
}).loose()

const RouteSchema = z.object({
  rules: z.array(RouteRuleSchema).optional(),
  rule_set: z.array(z.any()).optional(),
  final: z.string().optional(),
}).loose()

export const SingboxProfileSchema = z.object({
  log: z.any().optional(),
  dns: DnsSchema.optional(),
  ntp: z.any().optional(),
  certificate: z.any().optional(),
  endpoints: z.any().optional(),
  inbounds: z.array(InboundSchema).optional(),
  outbounds: z.array(OutboundSchema).optional(),
  route: RouteSchema.optional(),
  services: z.any().optional(),
  experimental: z.any().optional(),
}).loose()

export type SingboxProfile = z.infer<typeof SingboxProfileSchema>