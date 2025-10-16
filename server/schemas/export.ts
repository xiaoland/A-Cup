import { z } from 'zod';

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

// Zod schema for Rule Set export result
export const RuleSetInSingBoxSchema = z.object({
  tag: z.string(),
  type: z.string(),
  url: z.string().optional(),
  rules: z.array(z.any()).optional(),
});

// Zod schema for the complete Sing-Box profile configuration
// Request body schema for ProfileEditor (derived from Sing-Box JSON Schema with adaptations):
// - outbounds: number[] (referencing Outbound IDs)
// - route.rule_set: number[] (referencing RuleSet IDs)
export const SingBoxProfileRequestSchema = z.object({
  // Top-level sections described in Sing-Box schema; most are passthrough here
  log: z.object({
    disabled: z.boolean().optional(),
    level: z.enum(['trace','debug','info','warn','error','fatal','panic']).optional(),
    output: z.string().optional(),
    timestamp: z.boolean().optional(),
  }).partial().optional(),
  dns: z.any().optional(),
  ntp: z.any().optional(),
  certificate: z.any().optional(),
  endpoints: z.array(z.any()).optional(),
  inbounds: z.array(z.any()).optional(),

  // Adapted fields using ID arrays
  outbounds: z.array(z.number().int().positive()).default([]),

  route: z.object({
    rules: z.array(z.any()).optional(),
    rule_set: z.array(z.number().int().positive()).default([]),
    final: z.string().optional(),
    auto_detect_interface: z.boolean().optional(),
    default_interface: z.string().optional(),
    default_mark: z.number().optional(),
    default_domain_resolver: z.string().optional(),
    default_network_strategy: z.string().optional(),
    default_network_type: z.string().optional(),
    default_fallback_network_type: z.string().optional(),
    default_fallback_delay: z.number().optional(),
    geoip: z.any().optional(),
    geosite: z.any().optional(),
  }).partial().default({ rule_set: [] }).optional(),

  services: z.array(z.any()).optional(),
  experimental: z.any().optional(),
}).passthrough();

// Export configuration schema (subset for internal generation/validation)
// Full Sing-Box configuration shape (top-level) – aligned with official JSON Schema
// Note: Nested structures are left as any to follow upstream spec without re-implementing all branches in Zod.
export const SingBoxProfileSchema = z.object({
  $schema: z.string().optional(),
  log: z.object({
    level: z.string(),
    timestamp: z.boolean(),
  }).optional(),
  dns: z.any().optional(),
  ntp: z.any().optional(),
  certificate: z.any().optional(),
  endpoints: z.array(z.any()).optional(),
  inbounds: z.array(z.any()).optional(),
  outbounds: z.array(OutboundInSingBoxSchema).optional(),
  route: z.object({
    rule_set: z.array(RuleSetInSingBoxSchema),
    final: z.string(),
    auto_detect_interface: z.boolean(),
  }).optional(),
  services: z.array(z.any()).optional(),
  experimental: z.object({
    cache_file: z.object({
      enabled: z.boolean(),
      store_fakeip: z.boolean(),
      store_rdrc: z.boolean(),
    }),
  }).optional(),
}).strict();

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
export type OutboundInSingBox = z.infer<typeof OutboundInSingBoxSchema>;
export type RuleSetInSingBox = z.infer<typeof RuleSetInSingBoxSchema>;
export type SingBoxProfile = z.infer<typeof SingBoxProfileSchema>;
export type SingBoxProfileRequest = z.infer<typeof SingBoxProfileRequestSchema>;
export type ProfileExportResponse = z.infer<typeof ProfileExportResponseSchema>;
