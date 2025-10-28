import { z } from 'zod';
import { SingBoxOutboundSchema } from '../../../schemas/singbox';
import type { Outbound } from '../../../schemas/outbound';

type SingBoxOutbound = z.infer<typeof SingBoxOutboundSchema>;

export function fromSingbox(singboxOutbound: SingBoxOutbound): Partial<Outbound> {
  const { tag, type, ...rest } = singboxOutbound;

  const credential: any = {};
  const other: any = {};

  const credentialKeys = ['uuid', 'flow', 'security', 'alter_id', 'method', 'password', 'obfs', 'obfs_password'];

  for (const key in rest) {
    if (credentialKeys.includes(key)) {
      credential[key] = (rest as any)[key];
    } else {
      other[key] = (rest as any)[key];
    }
  }

  return {
    name: tag,
    type: type as any,
    credential,
    ...other,
  };
}
