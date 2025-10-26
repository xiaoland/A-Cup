import { z } from 'zod';
import { DnsSchema } from './dns';
import { InboundSchema } from './inbound';
import { RouteSchema } from './route';
import { SingBoxTlsSchema } from './tls';
import { SingBoxMultiplexSchema } from './multiplex';
import { SingBoxTransportSchema } from './transport';

// SingBox Outbound Schemas
const SingBoxVlessOutboundSchema = z.object({
  type: z.literal('vless'),
  tag: z.string(),
  server: z.string(),
  server_port: z.number().int(),
  uuid: z.string().uuid(),
  flow: z.string().optional(),
  network: z.enum(['tcp', 'udp']).optional(),
  tls: SingBoxTlsSchema.optional(),
  packet_encoding: z.string().optional(),
  multiplex: SingBoxMultiplexSchema.optional(),
  transport: SingBoxTransportSchema.optional(),
});

const SingBoxVmessOutboundSchema = z.object({
  type: z.literal('vmess'),
  tag: z.string(),
  server: z.string(),
  server_port: z.number().int(),
  uuid: z.string().uuid(),
  security: z.string(),
  alter_id: z.number().int(),
  tls: SingBoxTlsSchema.optional(),
  multiplex: SingBoxMultiplexSchema.optional(),
  transport: SingBoxTransportSchema.optional(),
});

const SingBoxShadowsocksOutboundSchema = z.object({
  type: z.literal('shadowsocks'),
  tag: z.string(),
  server: z.string(),
  server_port: z.number().int(),
  method: z.string(),
  password: z.string(),
  tls: SingBoxTlsSchema.optional(),
  multiplex: SingBoxMultiplexSchema.optional(),
  transport: SingBoxTransportSchema.optional(),
});

const SingBoxHysteria2OutboundSchema = z.object({
  type: z.literal('hysteria2'),
  tag: z.string(),
  server: z.string(),
  server_port: z.number().int(),
  password: z.string(),
  obfs: z.string().optional(),
  obfs_password: z.string().optional(),
  tls: SingBoxTlsSchema.optional(),
  multiplex: SingBoxMultiplexSchema.optional(),
  transport: SingBoxTransportSchema.optional(),
});

export const SingBoxOutboundSchema = z.discriminatedUnion('type', [
  SingBoxVlessOutboundSchema,
  SingBoxVmessOutboundSchema,
  SingBoxShadowsocksOutboundSchema,
  SingBoxHysteria2OutboundSchema,
]);

// SingBoxProfile Schema
export const SingBoxProfileSchema = z.object({
  dns: DnsSchema,
  inbounds: z.array(InboundSchema),
  outbounds: z.array(SingBoxOutboundSchema),
  route: RouteSchema,
});

export type SingBoxProfile = z.infer<typeof SingBoxProfileSchema>;
