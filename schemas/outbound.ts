import { z } from 'zod';

export const VlessCredentialSchema = z.object({
  uuid: z.string().uuid(),
  flow: z.string().optional(),
});

export const VmessCredentialSchema = z.object({
  uuid: z.string().uuid(),
  security: z.string(),
  alter_id: z.number().int(),
});

export const ShadowsocksCredentialSchema = z.object({
  method: z.string(),
  password: z.string(),
});

export const Hysteria2CredentialSchema = z.object({
  password: z.string(),
  obfs: z.string().optional(),
  obfs_password: z.string().optional(),
});

export const OutboundSchema = z.object({
  id: z.number().int().optional(),
  readableBy: z.array(z.string().uuid()),
  writeableBy: z.array(z.string().uuid()),
  name: z.string(),
  region: z.string(),
  provider: z.string(),
  type: z.enum(['vless', 'hysteria2', 'vmess', 'shadowsocks']),
  server: z.string(),
  server_port: z.number().int(),
  credential: z.union([
    VlessCredentialSchema,
    VmessCredentialSchema,
    ShadowsocksCredentialSchema,
    Hysteria2CredentialSchema,
  ]),
  tls: z.object({}).optional(),
  mux: z.object({}).optional(),
  other: z.object({}).optional(),
});

export type Outbound = z.infer<typeof OutboundSchema>;
