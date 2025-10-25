import { z } from 'zod';
import { DialFieldsSchema, TLSClientFieldsSchema } from './shared';

const DNSRuleActionRouteSchema = z.object({
  action: z.literal('route').optional(),
  server: z.string(),
  strategy: z
    .enum(['prefer_ipv4', 'prefer_ipv6', 'ipv4_only', 'ipv6_only'])
    .optional(),
  disable_cache: z.boolean().optional(),
  rewrite_ttl: z.number().int().optional(),
  client_subnet: z.string().optional(),
});

const DNSRuleActionRouteOptionsSchema = z.object({
  action: z.literal('route-options'),
  disable_cache: z.boolean().optional(),
  rewrite_ttl: z.number().int().optional(),
  client_subnet: z.string().optional(),
});

const DNSRuleActionRejectSchema = z.object({
  action: z.literal('reject'),
  method: z.enum(['default', 'drop']).optional(),
  no_drop: z.boolean().optional(),
});

const DNSRuleActionPredefinedSchema = z.object({
  action: z.literal('predefined'),
  rcode: z.string().optional(),
  answer: z.array(z.string()).optional(),
  ns: z.array(z.string()).optional(),
  extra: z.array(z.string()).optional(),
});

export const DNSRuleActionSchema = z.discriminatedUnion('action', [
  DNSRuleActionRouteSchema,
  DNSRuleActionRouteOptionsSchema,
  DNSRuleActionRejectSchema,
  DNSRuleActionPredefinedSchema,
]);

export const DNSRuleSchema = z
  .object({
    inbound: z.array(z.string()).optional(),
    ip_version: z.number().int().optional(),
    query_type: z.array(z.union([z.string(), z.number()])).optional(),
    network: z.enum(['tcp', 'udp']).optional(),
    domain: z.array(z.string()).optional(),
    domain_suffix: z.array(z.string()).optional(),
    domain_keyword: z.array(z.string()).optional(),
    domain_regex: z.array(z.string()).optional(),
    source_ip_cidr: z.array(z.string()).optional(),
  })
  .merge(DNSRuleActionSchema);

const DNSServerBaseSchema = z.object({
  tag: z.string(),
});

const DNSServerUDPSchema = DNSServerBaseSchema.extend({
  type: z.literal('udp'),
  address: z.string(),
}).merge(DialFieldsSchema);

const DNSServerTLSSchema = DNSServerBaseSchema.extend({
  type: z.literal('tls'),
  address: z.string(),
  tls: TLSClientFieldsSchema.optional(),
}).merge(DialFieldsSchema);

const DNSServerHTTPSSchema = DNSServerBaseSchema.extend({
  type: z.literal('https'),
  address: z.string(),
  tls: TLSClientFieldsSchema.optional(),
}).merge(DialFieldsSchema);

export const DNSServerSchema = z.discriminatedUnion('type', [
  DNSServerUDPSchema,
  DNSServerTLSSchema,
  DNSServerHTTPSSchema,
]);

export const DnsSchema = z.object({
  servers: z.array(DNSServerSchema),
  rules: z.array(DNSRuleSchema),
  final: z.string().optional(),
  strategy: z
    .enum(['prefer_ipv4', 'prefer_ipv6', 'ipv4_only', 'ipv6_only'])
    .optional(),
});

export type Dns = z.infer<typeof DnsSchema>;
