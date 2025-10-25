import { Outbound } from '../../schemas/outbound';
import { SingBoxOutboundSchema } from '../../schemas/singbox';
import { z } from 'zod';

type SingBoxOutbound = z.infer<typeof SingBoxOutboundSchema>;

export function exportOutboundToSingBox(outbound: Outbound): SingBoxOutbound {
  const { type, name, region, provider, server, server_port, credential, tls, mux, other } = outbound;
  const tag = `${provider}.${region}.${type}.${name}`;

  switch (type) {
    case 'vless':
      return {
        type,
        tag,
        server,
        server_port,
        uuid: credential.uuid,
        flow: credential.flow,
        tls: tls || undefined,
        multiplex: mux || undefined,
        ...other,
      };
    case 'vmess':
      return {
        type,
        tag,
        server,
        server_port,
        uuid: credential.uuid,
        security: credential.security,
        alter_id: credential.alter_id,
        tls: tls || undefined,
        multiplex: mux || undefined,
        ...other,
      };
    case 'shadowsocks':
      return {
        type,
        tag,
        server,
        server_port,
        method: credential.method,
        password: credential.password,
        tls: tls || undefined,
        multiplex: mux || undefined,
        ...other,
      };
    case 'hysteria2':
      return {
        type,
        tag,
        server,
        server_port,
        password: credential.password,
        obfs: credential.obfs,
        obfs_password: credential.obfs_password,
        tls: tls || undefined,
        multiplex: mux || undefined,
        ...other,
      };
    default:
      throw new Error(`Unsupported outbound type: ${type}`);
  }
}
