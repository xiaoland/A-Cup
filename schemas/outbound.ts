import { z } from 'zod';
import { TLSClientFieldsSchema } from './shared';
import { SingBoxMultiplexSchema } from './multiplex';

export const VlessCredentialSchema = z.object({
  uuid: z.uuid(),
  flow: z.string().default(''),
});

export const VmessCredentialSchema = z.object({
  uuid: z.uuid(),
  security: z.string().default('auto'),
  alter_id: z.int().default(0),
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
  id: z.int().optional(),
  readableBy: z.array(z.uuid()).default([]),
  writeableBy: z.array(z.uuid()).default([]),
  name: z.string().default(''),
  region: z.string().default(''),
  provider: z.string().default(''),
  server: z.string().default(''),
  server_port: z.int().default(0),
  tls: TLSClientFieldsSchema.default({}),
  mux: SingBoxMultiplexSchema.default({}),
  other: z.looseObject({}).default({}),
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

