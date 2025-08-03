import { z } from 'zod';

// Zod schema for Inbound export result
export const InboundInSingBoxSchema = z.object({
  type: z.string(),
  tag: z.string(),
  listen: z.string().optional(),
  listen_port: z.number().optional(),
  stack: z.string().optional(),
  mtu: z.number().optional(),
  auto_route: z.boolean().optional(),
  auto_redirect: z.boolean().optional(),
  strict_route: z.boolean().optional(),
});

// Zod schema for Outbound export result
export const OutboundInSingBoxSchema = z.object({
  type: z.string(),
  tag: z.string(),
  server: z.string().optional(),
  server_port: z.number().optional(),
  uuid: z.string().optional(),
  password: z.string().optional(),
  alter_id: z.number().optional(),
  method: z.string().optional(),
  security: z.string().optional(),
  network: z.string().optional(),
  flow: z.string().optional(),
  transport: z.any().optional(),
  tls: z.any().optional(),
  outbounds: z.array(z.string()).optional(),
});

// Zod schema for WireGuard Endpoint export result
export const WireguardEndpointInSingBoxSchema = z.object({
  type: z.literal("wireguard"),
  tag: z.string(),
  system_interface: z.boolean(),
  interface_name: z.string(),
  local_address: z.array(z.string()),
  private_key: z.string(),
  peers: z.array(z.object({
    server: z.string(),
    server_port: z.number(),
    allowed_ips: z.array(z.string()),
    public_key: z.string().optional(),
    pre_shared_key: z.string().optional(),
  })),
  mtu: z.number().optional(),
  pre_shared_key: z.string().optional(),
});

// Zod schema for Route Rule export result
export const RouteRuleInSingBoxSchema = z.object({
  domain: z.array(z.string()).optional(),
  domain_suffix: z.array(z.string()).optional(),
  domain_keyword: z.array(z.string()).optional(),
  domain_regex: z.array(z.string()).optional(),
  rule_set: z.array(z.string()).optional(),
  outbound: z.string().optional(),
  action: z.string().optional(),
});

// Zod schema for Rule Set export result
export const RuleSetInSingBoxSchema = z.object({
  tag: z.string(),
  type: z.string(),
  url: z.string().optional(),
  rules: z.array(z.any()).optional(),
});

// Zod schema for DNS Rule export result
export const DNSRuleInSingBoxSchema = z.object({
  domain: z.array(z.string()).optional(),
  domain_suffix: z.array(z.string()).optional(),
  domain_keyword: z.array(z.string()).optional(),
  rule_set: z.array(z.string()).optional(),
  server: z.string().optional(),
  disable_cache: z.boolean().optional(),
});

// Zod schema for DNS Server export result
export const DNSServerInSingBoxSchema = z.object({
  tag: z.string(),
  address: z.string(),
  detour: z.string().optional(),
});

// Zod schema for the complete Sing-Box profile configuration
export const SingBoxProfileSchema = z.object({
  log: z.object({
    level: z.string(),
    timestamp: z.boolean(),
  }),
  experimental: z.object({
    cache_file: z.object({
      enabled: z.boolean(),
      store_fakeip: z.boolean(),
      store_rdrc: z.boolean(),
    }),
  }),
  inbounds: z.array(InboundInSingBoxSchema),
  outbounds: z.array(OutboundInSingBoxSchema),
  endpoints: z.array(WireguardEndpointInSingBoxSchema),
  route: z.object({
    rule_set: z.array(RuleSetInSingBoxSchema),
    rules: z.array(RouteRuleInSingBoxSchema),
    final: z.string(),
    auto_detect_interface: z.boolean(),
  }),
  dns: z.object({
    disable_cache: z.boolean(),
    disable_expire: z.boolean(),
    independent_cache: z.boolean(),
    servers: z.array(DNSServerInSingBoxSchema),
    rules: z.array(DNSRuleInSingBoxSchema),
  }),
});

// Zod schema for profile export response
export const ProfileExportDirectResponseSchema = z.object({
  method: z.literal('direct'),
  content: z.string(),
  fileName: z.string(),
});

export const ProfileExportOSSResponseSchema = z.object({
  method: z.literal('oss'),
  url: z.string(),
  fileName: z.string(),
});

export const ProfileExportResponseSchema = z.union([
  ProfileExportDirectResponseSchema,
  ProfileExportOSSResponseSchema,
]);

// Type exports for backwards compatibility
export type InboundInSingBox = z.infer<typeof InboundInSingBoxSchema>;
export type OutboundInSingBox = z.infer<typeof OutboundInSingBoxSchema>;
export type WireguardEndpointInSingBox = z.infer<typeof WireguardEndpointInSingBoxSchema>;
export type RouteRuleInSingBox = z.infer<typeof RouteRuleInSingBoxSchema>;
export type RuleSetInSingBox = z.infer<typeof RuleSetInSingBoxSchema>;
export type DNSRuleInSingBox = z.infer<typeof DNSRuleInSingBoxSchema>;
export type DNSServerInSingBox = z.infer<typeof DNSServerInSingBoxSchema>;
export type SingBoxProfile = z.infer<typeof SingBoxProfileSchema>;
export type ProfileExportResponse = z.infer<typeof ProfileExportResponseSchema>;
