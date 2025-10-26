
import { z } from 'zod';
import { OutboundSchema, VlessCredentialSchema, VmessCredentialSchema, ShadowsocksCredentialSchema, Hysteria2CredentialSchema } from '../../../schemas/outbound';
import { SingBoxOutboundSchema } from '../../../schemas/singbox';

type SingboxOutbound = z.infer<typeof SingBoxOutboundSchema>;
type Outbound = z.infer<typeof OutboundSchema>;
type Credential = z.infer<typeof OutboundSchema.shape.credential>;

export function fromSingbox(singboxOutbound: SingboxOutbound): Outbound {
  const { tag, multiplex, ...retainedFields } = singboxOutbound;

  const other: { [key: string]: any } = {};
  let credential: Credential | null = null;

  const outboundSchemaKeys = Object.keys(OutboundSchema.shape);

  for (const key in retainedFields) {
    if (!outboundSchemaKeys.includes(key) && key !== 'type' && key !== 'server' && key !== 'server_port') {
      other[key] = (retainedFields as any)[key];
    }
  }

  switch (retainedFields.type) {
    case 'vless':
      credential = VlessCredentialSchema.parse({
        uuid: retainedFields.uuid,
        flow: retainedFields.flow,
      });
      break;
    case 'vmess':
      credential = VmessCredentialSchema.parse({
        uuid: retainedFields.uuid,
        security: retainedFields.security,
        alter_id: retainedFields.alter_id,
      });
      break;
    case 'shadowsocks':
      credential = ShadowsocksCredentialSchema.parse({
        method: retainedFields.method,
        password: retainedFields.password,
      });
      break;
    case 'hysteria2':
      credential = Hysteria2CredentialSchema.parse({
        password: retainedFields.password,
        obfs: retainedFields.obfs,
        obfs_password: retainedFields.obfs_password,
      });
      break;
  }

  if (!credential) {
    throw new Error('Could not create credential for outbound type: ' + retainedFields.type);
  }

  return {
    name: tag,
    type: retainedFields.type,
    server: retainedFields.server,
    server_port: retainedFields.server_port,
    mux: multiplex as any,
    other: other as any,
    credential,
    readableBy: [],
    writeableBy: [],
    region: '',
    provider: '',
  };
}
