import { z } from 'zod';

export const DialFieldsSchema = z.object({
  detour: z.string().optional(),
  bind_interface: z.string().optional(),
  inet4_bind_address: z.string().optional(),
  inet6_bind_address: z.string().optional(),
  routing_mark: z.number().int().optional(),
  reuse_addr: z.boolean().optional(),
  netns: z.string().optional(),
  connect_timeout: z.string().optional(),
  tcp_fast_open: z.boolean().optional(),
  tcp_multi_path: z.boolean().optional(),
  udp_fragment: z.boolean().optional(),
  domain_resolver: z.union([z.string(), z.object({})]).optional(),
  network_strategy: z.string().optional(),
  network_type: z.array(z.string()).optional(),
  fallback_network_type: z.array(z.string()).optional(),
  fallback_delay: z.string().optional(),
  domain_strategy: z
    .enum(['prefer_ipv4', 'prefer_ipv6', 'ipv4_only', 'ipv6_only'])
    .optional(),
});

export type DialFields = z.infer<typeof DialFieldsSchema>;

export const TLSClientFieldsSchema = z.object({
  enabled: z.boolean().optional(),
  disable_sni: z.boolean().optional(),
  server_name: z.string().optional(),
  insecure: z.boolean().optional(),
  alpn: z.array(z.string()).optional(),
  min_version: z.string().optional(),
  max_version: z.string().optional(),
  cipher_suites: z.array(z.string()).optional(),
  certificate: z.string().optional(),
  certificate_path: z.string().optional(),
  utls: z
    .object({
      enabled: z.boolean().optional(),
      fingerprint: z.string().optional(),
    })
    .optional(),
  reality: z
    .object({
      enabled: z.boolean().optional(),
      public_key: z.string().optional(),
      short_id: z.string().optional(),
    })
    .optional(),
});

export type TLSClientFields = z.infer<typeof TLSClientFieldsSchema>;
