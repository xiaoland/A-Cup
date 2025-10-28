import { z } from 'zod';
import { DnsSchema } from './dns';
import { InboundSchema } from './inbound';
import { RouteSchema } from './route';
import { SingBoxTlsSchema } from './tls';
import { SingBoxMultiplexSchema } from './multiplex';
import { SingBoxTransportSchema } from './transport';
import { DialFieldsSchema } from './shared';

// SingBox Outbound Schemas
const SingBoxBaseOutboundSchema = z.object({
  tag: z.string(),
}).merge(DialFieldsSchema);

const SingBoxVlessOutboundSchema = SingBoxBaseOutboundSchema.extend({
  type: z.literal('vless'),
  server: z.string(),
  server_port: z.int(),
  uuid: z.uuid(),
  flow: z.string().optional(),
  network: z.enum(['tcp', 'udp']).optional(),
  tls: SingBoxTlsSchema.optional(),
  packet_encoding: z.string().optional(),
  multiplex: SingBoxMultiplexSchema.optional(),
  transport: SingBoxTransportSchema.optional(),
});

const SingBoxVmessOutboundSchema = SingBoxBaseOutboundSchema.extend({
  type: z.literal('vmess'),
  server: z.string(),
  server_port: z.int(),
  uuid: z.uuid(),
  security: z.string(),
  alter_id: z.int(),
  tls: SingBoxTlsSchema.optional(),
  multiplex: SingBoxMultiplexSchema.optional(),
  transport: SingBoxTransportSchema.optional(),
});

const SingBoxShadowsocksOutboundSchema = SingBoxBaseOutboundSchema.extend({
  type: z.literal('shadowsocks'),
  server: z.string(),
  server_port: z.int(),
  method: z.string(),
  password: z.string(),
  tls: SingBoxTlsSchema.optional(),
  multiplex: SingBoxMultiplexSchema.optional(),
  transport: SingBoxTransportSchema.optional(),
});

const SingBoxHysteria2OutboundSchema = SingBoxBaseOutboundSchema.extend({
  type: z.literal('hysteria2'),
  server: z.string(),
  server_port: z.int(),
  password: z.string(),
  obfs: z.string().optional(),
  obfs_password: z.string().optional(),
  tls: SingBoxTlsSchema.optional(),
  multiplex: SingBoxMultiplexSchema.optional(),
  transport: SingBoxTransportSchema.optional(),
});

export const SelectorOutboundSchema = SingBoxBaseOutboundSchema.extend({
    type: z.literal('selector'),
    outbounds: z.array(z.string()).default([]),
    default: z.string().optional(),
});

export const UrlTestOutboundSchema = SingBoxBaseOutboundSchema.extend({
    type: z.literal('urltest'),
    outbounds: z.array(z.string()).default([]),
    url: z.string().default('https://www.gstatic.com/generate_204'),
    interval: z.string().default('5m'),
});

export const DirectOutboundSchema = SingBoxBaseOutboundSchema.extend({
    type: z.literal('direct'),
});

export const SingBoxOutboundSchema = z.discriminatedUnion('type', [
  SingBoxVlessOutboundSchema,
  SingBoxVmessOutboundSchema,
  SingBoxShadowsocksOutboundSchema,
  SingBoxHysteria2OutboundSchema,
  SelectorOutboundSchema,
  UrlTestOutboundSchema,
  DirectOutboundSchema,
]);

export type SingBoxOutbound = z.infer<typeof SingBoxOutboundSchema>;

// SingBoxProfile Schema
export const SingBoxProfileSchema = z.object({
  dns: DnsSchema,
  inbounds: z.array(InboundSchema),
  outbounds: z.array(SingBoxOutboundSchema),
  route: RouteSchema,
});

export type SingBoxProfile = z.infer<typeof SingBoxProfileSchema>;
