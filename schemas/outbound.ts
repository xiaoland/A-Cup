import { z } from "zod";
import { TLSClientFieldsSchema } from "./shared";
import { SingBoxMultiplexSchema } from "./multiplex";

export const VlessCredentialSchema = z.object({
  uuid: z.uuid(),
  flow: z.string().default(""),
});

export const VmessCredentialSchema = z.object({
  uuid: z.uuid(),
  security: z.string().default("auto"),
  alter_id: z.int().default(0),
});

export const ShadowsocksCredentialSchema = z.object({
  method: z.string().default(""),
  password: z.string().default(""),
});

export const Hysteria2CredentialSchema = z.object({
  password: z.string().default(""),
  obfs: z.string().optional(),
  obfs_password: z.string().optional(),
});

export const BaseOutboundSchema = z.object({
  id: z.int().optional(),
  readableBy: z.array(z.uuid()).default([]),
  writeableBy: z.array(z.uuid()).default([]),
  name: z.string().default(""),
  region: z.string().default(""),
  provider: z.string().default(""),
  server: z.string().default(""),
  server_port: z.int().default(0),
  tls: TLSClientFieldsSchema.default({}),
  mux: SingBoxMultiplexSchema.default({}),
  other: z.looseObject({}).default({}),
});

export const OutboundSchema = z.discriminatedUnion("type", [
  BaseOutboundSchema.extend({
    type: z.literal("vless"),
    credential: VlessCredentialSchema,
  }),
  BaseOutboundSchema.extend({
    type: z.literal("vmess"),
    credential: VmessCredentialSchema,
  }),
  BaseOutboundSchema.extend({
    type: z.literal("shadowsocks"),
    credential: ShadowsocksCredentialSchema,
  }),
  BaseOutboundSchema.extend({
    type: z.literal("hysteria2"),
    credential: Hysteria2CredentialSchema,
  }),
]);

export type Outbound = z.infer<typeof OutboundSchema>;

export function exportOutboundToSingBox(outbound: Outbound) {
  return {
    type: outbound.type,
    tag: String(outbound.id),
    server: outbound.server,
    server_port: outbound.server_port,
    ...outbound.credential,
    ...outbound.tls,
    ...outbound.mux,
    ...outbound.other,
  };
}

/**
 * Get display nickname for an outbound
 * @param outbound - The outbound configuration
 * @returns A human-readable nickname combining name, region, provider, and type
 */
export function getOutboundNickname(outbound: Outbound): string {
  const parts: string[] = [];

  if (outbound.name) {
    parts.push(outbound.name);
  }

  if (outbound.region) {
    parts.push(outbound.region);
  }

  if (outbound.provider) {
    parts.push(outbound.provider);
  }

  if (outbound.type) {
    parts.push(`[${outbound.type}]`);
  }

  return parts.length > 0 ? parts.join(" - ") : `Outbound #${outbound.id}`;
}
