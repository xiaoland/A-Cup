import { z } from 'zod';
import { Z } from 'zod-class';
import { OutboundInSingBox, OutboundInSingBoxSchema } from '../schemas/export';

export class Outbound extends Z.class({
  id: z.number().int().positive(),
  name: z.string().min(1),
  region: z.string().nullable(),
  provider: z.string().nullable(),
  type: z.string().min(1),
  server: z.string().min(1),
  server_port: z.number().int().positive(),
  credential: z.any(),
  transport: z.any().nullable().default({}),
  tls: z.any().nullable().default({}),
  mux: z.any().nullable().default({}),
  other: z.any().nullable().default({}),
  readable_by: z.preprocess((v) => {
    if (typeof v === 'string') return JSON.parse(v);
    return v;
  }, z.array(z.number())),
  writable_by: z.preprocess((v) => {
    if (typeof v === 'string') return JSON.parse(v);
    return v;
  }, z.array(z.number())),
  created_at: z.number().int().positive(),
  updated_at: z.number().int().positive(),
}) {
  getTag(): string {
    return `${this.type}.${this.provider || 'default'}.${this.region || 'default'}.${this.name || this.id}`;
  }

  exportToSingBox(): OutboundInSingBox {
    const config: OutboundInSingBox = {
      type: this.type,
      tag: `out.${this.getTag()}`,
    };

    if (this.server) config.server = this.server;
    if (this.server_port) config.server_port = this.server_port;

    const credential = this.credential as any | undefined;
    if (credential && typeof credential === 'object') {
      if (credential.uuid) config.uuid = credential.uuid;
      if (credential.password) config.password = credential.password;
      if (credential.alter_id) config.alter_id = credential.alter_id;
      if (credential.method) config.method = credential.method;
      if (credential.security) config.security = credential.security;
      if (credential.network) config.network = credential.network;
      if (credential.flow) config.flow = credential.flow;
    }

    if (this.transport) config.transport = this.transport as any;
    if (this.tls) config.tls = this.tls as any;

    return OutboundInSingBoxSchema.parse(config);
  }
}
