
import { z } from 'zod';
import { BaseOutboundSchema, VlessCredentialSchema, VmessCredentialSchema, ShadowsocksCredentialSchema, Hysteria2CredentialSchema } from '../../../schemas/outbound';
import { SingBoxOutboundSchema } from '../../../schemas/singbox';

const OutboundSchema = BaseOutboundSchema.extend({
  type: z.enum(['vless', 'hysteria2', 'vmess', 'shadowsocks']),
  credential: z.union([
    VlessCredentialSchema,
    VmessCredentialSchema,
    ShadowsocksCredentialSchema,
    Hysteria2CredentialSchema,
  ])
});

type SingboxOutbound = z.infer<typeof SingBoxOutboundSchema>;
type OutboundPartial = z.infer<typeof OutboundSchema.partial>;
type Credential = z.infer<typeof OutboundSchema.shape.credential>;

export function fromSingbox(singboxOutbound: SingboxOutbound): OutboundPartial {
  const { tag, multiplex, tls, type, server, server_port, ...retainedFields } = singboxOutbound;

  const other: { [key: string]: any } = {};
  let credential: Credential | undefined;
  let credentialSchema: any;

  const outboundSchemaKeys = Object.keys(OutboundSchema.shape);

  switch (type) {
    case 'vless':
      credentialSchema = VlessCredentialSchema
      break;
    case 'vmess':
      credentialSchema = VmessCredentialSchema;
      break;
    case 'shadowsocks':
      credentialSchema = ShadowsocksCredentialSchema;
      break;
    case 'hysteria2':
      credentialSchema = Hysteria2CredentialSchema;
      break;
  }

  if (credentialSchema) {
     credential = credentialSchema.parse(retainedFields);
  }

  if (!credential) {
    throw new Error('Could not create credential for outbound type: ' + type);
  }

  for (const key in retainedFields) {
    if (!outboundSchemaKeys.includes(key) && !Object.keys(credentialSchema.shape).includes(key)) {
      other[key] = (retainedFields as any)[key];
    }
  }

  return {
    name: tag,
    type,
    server,
    server_port,
    mux: multiplex as any,
    other: other as any,
    tls,
    credential
  };
}