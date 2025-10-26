import { z } from 'zod';

export const VlessCredentialSchema = z.object({
  uuid: z.string().uuid(),
  flow: z.string().default(''),
});

export const VmessCredentialSchema = z.object({
  uuid: z.string().uuid(),
  security: z.string().default('auto'),
  alter_id: z.number().int().default(0),
});

export const ShadowsocksCredentialSchema = z.object({
  method: z.string().default(''),
  password: z.string().default(''),
});

export const Hysteria2CredentialSchema = z.object({
  password: z.string().default(''),
  obfs: z.string().optional(),
  obfs_password: z.string().optional(),
});

export const BaseOutboundSchema = z.object({
  id: z.number().int().optional(),
  readableBy: z.array(z.string().uuid()).default([]),
  writeableBy: z.array(z.string().uuid()).default([]),
  name: z.string().default(''),
  region: z.string().default(''),
  provider: z.string().default(''),
  server: z.string().default(''),
  server_port: z.number().int().default(0),
  tls: z.object({}).default({}),
  mux: z.object({}).default({}),
  other: z.object({}).default({}),
});

export const OutboundSchema = z.discriminatedUnion('type', [
  BaseOutboundSchema.extend({
    type: z.literal('vless'),
    credential: VlessCredentialSchema,
  }),
  BaseOutboundSchema.extend({
    type: z.literal('vmess'),
    credential: VmessCredentialSchema,
  }),
  BaseOutboundSchema.extend({
    type: z.literal('shadowsocks'),
    credential: ShadowsocksCredentialSchema,
  }),
  BaseOutboundSchema.extend({
    type: z.literal('hysteria2'),
    credential: Hysteria2CredentialSchema,
  }),
]);

export type Outbound = z.infer<typeof OutboundSchema>;
