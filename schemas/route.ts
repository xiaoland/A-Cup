import { z } from 'zod';

const HeadlessRuleSchema = z.object({
  domain: z.array(z.string()).optional(),
  domain_suffix: z.array(z.string()).optional(),
  domain_keyword: z.array(z.string()).optional(),
  domain_regex: z.array(z.string()).optional(),
  source_ip_cidr: z.array(z.string()).optional(),
  ip_cidr: z.array(z.string()).optional(),
  source_port: z.array(z.number()).optional(),
  source_port_range: z.array(z.string()).optional(),
  port: z.array(z.number()).optional(),
  port_range: z.array(z.string()).optional(),
  process_name: z.array(z.string()).optional(),
  process_path: z.array(z.string()).optional(),
  package_name: z.array(z.string()).optional(),
  invert: z.boolean().optional(),
});

export const SingBoxRuleSetSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('inline'),
    tag: z.string(),
    rules: z.array(HeadlessRuleSchema),
  }),
  z.object({
    type: z.literal('local'),
    tag: z.string(),
    format: z.enum(['source', 'binary']),
    path: z.string(),
  }),
  z.object({
    type: z.literal('remote'),
    tag: z.string(),
    format: z.enum(['source', 'binary']),
    url: z.string(),
    download_detour: z.string().optional(),
    update_interval: z.string().optional(),
  }),
]);

export type SingBoxRuleSet = z.infer<typeof SingBoxRuleSetSchema>;

export const RouteRuleSchema = z.object({
  rule_set: z.array(z.string()).optional(),
  domain: z.array(z.string()).optional(),
  domain_suffix: z.array(z.string()).optional(),
  domain_keyword: z.array(z.string()).optional(),
  domain_regex: z.array(z.string()).optional(),
  outbound: z.string().optional(),
  outbounds: z.array(z.string()).optional(),
}).refine(
  (data) => (data.outbound !== undefined && data.outbounds === undefined) || (data.outbound === undefined && data.outbounds !== undefined),
  { message: "A rule must have either 'outbound' or 'outbounds'." }
);

export type RouteRule = z.infer<typeof RouteRuleSchema>;

export const RouteSchema = z.object({
  rules: z.array(RouteRuleSchema).optional(),
  rule_set: z.array(SingBoxRuleSetSchema).optional(),
  final: z.string().optional(),
  auto_detect_interface: z.boolean().optional(),
  override_android_vpn: z.boolean().optional(),
  default_interface: z.string().optional(),
  default_mark: z.number().int().optional(),
  default_domain_resolver: z.union([z.string(), z.object({})]).optional(),
  default_network_strategy: z.string().optional(),
  default_network_type: z.array(z.string()).optional(),
  default_fallback_network_type: z.array(z.string()).optional(),
  default_fallback_delay: z.string().optional(),
});

export type Route = z.infer<typeof RouteSchema>;
