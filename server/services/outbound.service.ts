import { z } from 'zod';
import { Outbounds, Profiles } from '../db/schema';
import { eq } from 'drizzle-orm';
import { DrizzleD1Database } from 'drizzle-orm/d1';
import { exportProfileToR2 } from '../fund/profile-export';
import { OutboundInSingBoxSchema, type OutboundInSingBox } from '../schemas/export';

const CreateOutboundBody = z.object({
  name: z.string().min(1),
  region: z.string().optional(),
  provider: z.string().optional(),
  type: z.string().min(1),
  server: z.string().min(1),
  server_port: z.number().int().positive(),
  credential: z.any(),
  transport: z.any().optional().default({}),
  tls: z.any().optional().default({}),
  mux: z.any().optional().default({}),
  other: z.any().optional().default({}),
  readable_by: z.array(z.number().int().positive()).optional(),
  writable_by: z.array(z.number().int().positive()).optional(),
});

export class OutboundService {
  constructor(private db: DrizzleD1Database, private env: any) {}

  async createOutbound(userId: number, body: z.infer<typeof CreateOutboundBody>) {
    const readable_by = body.readable_by && body.readable_by.length ? body.readable_by : [userId];
    const writable_by = body.writable_by && body.writable_by.length ? body.writable_by : [userId];

    const result = await this.db.insert(Outbounds).values({
      ...body,
      readable_by: readable_by,
      writable_by: writable_by,
    }).returning();

    return result[0];
  }

  async getOutbounds(userId: number) {
    const outbounds = await this.db.select().from(Outbounds);
    const filtered = outbounds.filter((row: any) => {
      const readable: number[] = row.readable_by ?? [];
      const writable: number[] = row.writable_by ?? [];
      return [...readable, ...writable].includes(userId);
    });

    return filtered.map((row: any) => ({
      ...row,
      tag: `${row.type}.${row.provider || 'default'}.${row.region || 'default'}.${row.name || row.id}`
    }));
  }

  async getOutboundById(userId: number, outboundId: number) {
    const outbounds = await this.db.select().from(Outbounds).where(eq(Outbounds.id, outboundId));
    if (outbounds.length === 0) return null;

    const row: any = outbounds[0];
    const readable: number[] = row.readable_by ?? [];
    const writable: number[] = row.writable_by ?? [];
    if (![...readable, ...writable].includes(userId)) {
      throw new Error('Forbidden');
    }

    return row;
  }

  async updateOutbound(userId: number, outboundId: number, body: z.infer<typeof CreateOutboundBody>) {
    const existing = await this.db.select().from(Outbounds).where(eq(Outbounds.id, outboundId)).limit(1);
    if (existing.length === 0) return null;

    const row: any = existing[0];
    const writable: number[] = row.writable_by ?? [];
    if (!writable.includes(userId)) {
      throw new Error('Forbidden');
    }

    const result = await this.db.update(Outbounds).set({
      ...body,
      updated_at: Math.floor(Date.now() / 1000)
    }).where(eq(Outbounds.id, outboundId)).returning();

    const allProfiles = await this.db.select().from(Profiles);
    const referencing = (allProfiles as any[]).filter((p) => {
      const outs: number[] = p.outbounds ?? [];
      return outs.includes(outboundId);
    });
    if (this.env.OSS) {
      await Promise.all(referencing.map((p: any) => exportProfileToR2(this.db, this.env, p.id)));
    }

    return result[0];
  }

  async deleteOutbound(userId: number, outboundId: number) {
    const existing = await this.db.select().from(Outbounds).where(eq(Outbounds.id, outboundId)).limit(1);
    if (existing.length === 0) return false;

    const row: any = existing[0];
    const writable: number[] = row.writable_by ?? [];
    if (!writable.includes(userId)) {
      throw new Error('Forbidden');
    }

    await this.db.delete(Outbounds).where(eq(Outbounds.id, outboundId));
    return true;
  }

  async getOutboundTag(userId: number, outboundId: number) {
    const existing = await this.db.select().from(Outbounds).where(eq(Outbounds.id, outboundId)).limit(1);
    if (existing.length === 0) return null;

    const row: any = existing[0];
    const readable: number[] = row.readable_by ?? [];
    const writable: number[] = row.writable_by ?? [];
    if (![...readable, ...writable].includes(userId)) {
      throw new Error('Forbidden');
    }

    return { tag: `${row.type}.${row.provider || 'default'}.${row.region || 'default'}.${row.name || row.id}` };
  }

  async exportOutbound(userId: number, outboundId: number): Promise<OutboundInSingBox | null> {
    const outbounds = await this.db.select().from(Outbounds).where(eq(Outbounds.id, outboundId)).limit(1);
    if (outbounds.length === 0) return null;

    const outbound = outbounds[0];
    const config: OutboundInSingBox = {
      type: outbound.type,
      tag: `out.${outbound.type}.${(outbound as any).region || 'default'}.${(outbound as any).name || (outbound as any).id}`
    };

    if ((outbound as any).server) config.server = (outbound as any).server as string;
    if ((outbound as any).server_port) config.server_port = (outbound as any).server_port as number;

    const credential = (outbound as any).credential as any | undefined;
    if (credential && typeof credential === 'object') {
      if (credential.uuid) config.uuid = credential.uuid;
      if (credential.password) config.password = credential.password;
      if (credential.alter_id) config.alter_id = credential.alter_id;
      if (credential.method) config.method = credential.method;
      if (credential.security) config.security = credential.security;
      if (credential.network) config.network = credential.network;
      if (credential.flow) config.flow = credential.flow;
    }

    if ((outbound as any).transport) config.transport = (outbound as any).transport as any;
    if ((outbound as any).tls) config.tls = (outbound as any).tls as any;

    return OutboundInSingBoxSchema.parse(config);
  }
}
