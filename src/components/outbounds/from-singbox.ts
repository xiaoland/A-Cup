
import { z } from 'zod';
import { OutboundSchema, VlessCredentialSchema, VmessCredentialSchema, ShadowsocksCredentialSchema, Hysteria2CredentialSchema } from '../../../schemas/outbound';
import { SingBoxOutboundSchema } from '../../../schemas/singbox';

type SingboxOutbound = z.infer<typeof SingBoxOutboundSchema>;
type Outbound = z.infer<typeof OutboundSchema>;
type Credential = z.infer<typeof OutboundSchema.shape.credential>;

export function fromSingbox(singboxOutbound: SingboxOutbound): Outbound {
  const { tag, multiplex, tls, type, server, server_port ...retainedFields } = singboxOutbound;

  const other: { [key: string]: any } = {};
  let credential: Credential | null = null;
  let credentailSchema: any;

  const outboundSchemaKeys = Object.keys(OutboundSchema.shape);

  switch (type) {
    case 'vless':
      credentailSchema = VlessCredentialSchema
      break;
    case 'vmess':
      credentailSchema = VmessCredentialSchema;
      break;
    case 'shadowsocks':
      credentailSchema = ShadowsocksCredentialSchema;
      break;
    case 'hysteria2':
      credentailSchema = Hysteria2CredentialSchema;
      break;
  }

  if (credentialSchema) {
     credentail = credentailSchema.parse(retainedFields);
  }

  if (!credential) {
    throw new Error('Could not create credential for outbound type: ' + retainedFields.type);
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
    credential
  };
}
