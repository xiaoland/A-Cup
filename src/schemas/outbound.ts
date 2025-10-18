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

export const SelectorOutboundSchema = BaseOutboundSchema.extend({
  type: z.literal('selector'),
  outbounds: z.array(z.string()),
  default: z.string().optional(),
});

export const UrlTestOutboundSchema = BaseOutboundSchema.extend({
  type: z.literal('urltest'),
  outbounds: z.array(z.string()),
  url: z.string().optional(),
  interval: z.string().optional(),
});

export const OutboundSchema = z.union([
  ShadowsocksOutboundSchema,
  VmessOutboundSchema,
  VlessOutboundSchema,
  Hysteria2OutboundSchema,
  SelectorOutboundSchema,
  UrlTestOutboundSchema,
]);