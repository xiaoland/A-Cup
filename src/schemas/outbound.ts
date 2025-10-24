import { z } from 'zod'

// Base schema with common fields for all outbounds
const BaseOutboundSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  region: z.string().optional(),
  provider: z.string().optional(),
  type: z.string(),
  tag: z.string(),
  other: z.any().optional(),
  readable_by: z.array(z.number()).optional(),
  writable_by: z.array(z.number()).optional(),
  created_at: z.number().optional(),
  updated_at: z.number().optional(),
});

const SpecialOutboundBaseSchema = z.object({
  type: z.string(),
  tag: z.string(),
});

// Schema for outbounds with server and port, and advanced connection settings
const ServerOutboundSchema = BaseOutboundSchema.extend({
  server: z.string(),
  server_port: z.number(),
  transport: z.any().optional(),
  tls: z.any().optional(),
  mux: z.any().optional(),
});

export const ShadowsocksOutboundSchema = ServerOutboundSchema.extend({
  type: z.literal('shadowsocks'),
  method: z.string(),
  password: z.string(),
});

export const VmessOutboundSchema = ServerOutboundSchema.extend({
  type: z.literal('vmess'),
  uuid: z.string(),
  security: z.string(),
});

export const VlessOutboundSchema = ServerOutboundSchema.extend({
  type: z.literal('vless'),
  uuid: z.string(),
});

export const Hysteria2OutboundSchema = ServerOutboundSchema.extend({
  type: z.literal('hysteria2'),
  password: z.string(),
});

export const SelectorOutboundSchema = SpecialOutboundBaseSchema.extend({
  type: z.literal('selector'),
  outbounds: z.array(z.string()),
  default: z.string().optional(),
});

export const UrlTestOutboundSchema = SpecialOutboundBaseSchema.extend({
  type: z.literal('urltest'),
  outbounds: z.array(z.string()),
  url: z.string().optional(),
  interval: z.string().optional(),
});

export const DirectOutboundSchema = SpecialOutboundBaseSchema.extend({
  type: z.literal('direct'),
});

export const OutboundSchema = z.union([
  ShadowsocksOutboundSchema,
  VmessOutboundSchema,
  VlessOutboundSchema,
  Hysteria2OutboundSchema,
]);

export const SpecialOutboundSchema = z.union([
  SelectorOutboundSchema,
  UrlTestOutboundSchema,
  DirectOutboundSchema,
]);

export type ShadowsocksOutbound = z.infer<typeof ShadowsocksOutboundSchema>;
export type VmessOutbound = z.infer<typeof VmessOutboundSchema>;
export type VlessOutbound = z.infer<typeof VlessOutboundSchema>;
export type Hysteria2Outbound = z.infer<typeof Hysteria2OutboundSchema>;
export type SelectorOutbound = z.infer<typeof SelectorOutboundSchema>;
export type UrlTestOutbound = z.infer<typeof UrlTestOutboundSchema>;
export type DirectOutbound = z.infer<typeof DirectOutboundSchema>;
export type Outbound = z.infer<typeof OutboundSchema>;
export type SpecialOutbound = z.infer<typeof SpecialOutboundSchema>;