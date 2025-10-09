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
  outbounds: z.array(OutboundInSingBoxSchema),
  route: z.object({
    rule_set: z.array(RuleSetInSingBoxSchema),
    final: z.string(),
    auto_detect_interface: z.boolean(),
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
export type OutboundInSingBox = z.infer<typeof OutboundInSingBoxSchema>;
export type RuleSetInSingBox = z.infer<typeof RuleSetInSingBoxSchema>;
export type SingBoxProfile = z.infer<typeof SingBoxProfileSchema>;
export type ProfileExportResponse = z.infer<typeof ProfileExportResponseSchema>;
