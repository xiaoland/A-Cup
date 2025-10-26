import { z } from 'zod';

export const SingBoxTlsSchema = z.object({
  enabled: z.boolean().optional(),
  disable_sni: z.boolean().optional(),
  server_name: z.string().optional(),
  insecure: z.boolean().optional(),
  alpn: z.array(z.string()).optional(),
  min_version: z.enum(['1.0', '1.1', '1.2', '1.3']).optional(),
  max_version: z.enum(['1.0', '1.1', '1.2', '1.3']).optional(),
  cipher_suites: z.array(z.string()).optional(),
  curve_preferences: z.array(z.string()).optional(),
  certificate: z.string().optional(),
  certificate_path: z.string().optional(),
  certificate_public_key_sha256: z.array(z.string()).optional(),
  client_certificate: z.array(z.string()).optional(),
  client_certificate_path: z.string().optional(),
  client_key: z.array(z.string()).optional(),
  client_key_path: z.string().optional(),
  fragment: z.boolean().optional(),
  fragment_fallback_delay: z.string().optional(),
  record_fragment: z.boolean().optional(),
  ech: z.object({
    enabled: z.boolean().optional(),
    config: z.array(z.string()).optional(),
    config_path: z.string().optional(),
    pq_signature_schemes_enabled: z.boolean().optional(),
    dynamic_record_sizing_disabled: z.boolean().optional(),
  }).optional(),
  utls: z.object({
    enabled: z.boolean().optional(),
    fingerprint: z.string().optional(),
  }).optional(),
  reality: z.object({
    enabled: z.boolean().optional(),
    public_key: z.string().optional(),
    short_id: z.string().optional(),
  }).optional(),
});
