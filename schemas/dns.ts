import { z } from 'zod';
import { DialFieldsSchema, TLSClientFieldsSchema } from './shared';

export const DNSRuleSchema = z.object({
  inbound: z.array(z.string()).optional(),
  ip_version: z.number().int().optional(),
  query_type: z.array(z.union([z.string(), z.number()])).optional(),
  network: z.enum(['tcp', 'udp']).optional(),
  domain: z.array(z.string()).optional(),
  domain_suffix: z.array(z.string()).optional(),
  domain_keyword: z.array(z.string()).optional(),
  domain_regex: z.array(z.string()).optional(),
  source_ip_cidr: z.array(z.string()).optional(),
  server: z.string(),
  disable_cache: z.boolean().optional(),
  rewrite_ttl: z.number().int().optional(),
  client_subnet: z.string().optional(),
});

const DNSServerBaseSchema = z.object({
  tag: z.string(),
});

const DNSServerUDPSchema = DNSServerBaseSchema.extend({
  type: z.literal('udp'),
  address: z.string(),
  detour: z.string().optional(),
}).merge(DialFieldsSchema);

const DNSServerTLSSchema = DNSServerBaseSchema.extend({
  type: z.literal('tls'),
  address: z.string(),
  detour: z.string().optional(),
  tls: TLSClientFieldsSchema.optional(),
}).merge(DialFieldsSchema);

const DNSServerHTTPSSchema = DNSServerBaseSchema.extend({
  type: z.literal('https'),
  address: z.string(),
  detour: z.string().optional(),
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
