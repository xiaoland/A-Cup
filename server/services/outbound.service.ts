import { z } from 'zod';
import { Outbounds, Profiles } from '../db/schema';
import { eq } from 'drizzle-orm';
import { exportProfileToR2 } from '../fund/profile-export';
import { OutboundInSingBoxSchema, type OutboundInSingBox } from '../schemas/export';
import { ServiceBase } from '.';
import { CreateOutboundBody, SelectOutboundSchema } from '../db/outbound';
import { Z } from 'zod-class';

export class Outbound extends Z.class('Outbound', SelectOutboundSchema) {
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


export class OutboundService extends ServiceBase {
  async create(userId: number, body: z.infer<typeof CreateOutboundBody>) {
    const readable_by = body.readable_by && body.readable_by.length ? body.readable_by : [userId];
    const writable_by = body.writable_by && body.writable_by.length ? body.writable_by : [userId];

    const result = await this.db.insert(Outbounds).values({
      ...body,
      readable_by: JSON.stringify(readable_by),
      writable_by: JSON.stringify(writable_by),
    }).returning();

    return new Outbound(result[0]);
  }

  async getAll(userId: number) {
    const outbounds = await this.db.select().from(Outbounds);
    const filtered = outbounds.filter((row) => {
      const readable = Array.isArray(row.readable_by) ? row.readable_by : JSON.parse(row.readable_by as string || '[]');
      const writable = Array.isArray(row.writable_by) ? row.writable_by : JSON.parse(row.writable_by as string || '[]');
      return [...readable, ...writable].includes(userId);
    });

    return filtered.map((row) => new Outbound(row));
  }

  async get(userId: number, outboundId: number) {
    const outbounds = await this.db.select().from(Outbounds).where(eq(Outbounds.id, outboundId));
    if (outbounds.length === 0) return null;

    const row = outbounds[0];
    const readable = Array.isArray(row.readable_by) ? row.readable_by : JSON.parse(row.readable_by as string || '[]');
    const writable = Array.isArray(row.writable_by) ? row.writable_by : JSON.parse(row.writable_by as string || '[]');
    if (![...readable, ...writable].includes(userId)) {
      throw new Error('Forbidden');
    }

    return new Outbound(row);
  }

  async update(userId: number, outboundId: number, body: z.infer<typeof CreateOutboundBody>) {
    const existing = await this.db.select().from(Outbounds).where(eq(Outbounds.id, outboundId)).limit(1);
    if (existing.length === 0) return null;

    const row = existing[0];
    const writable = Array.isArray(row.writable_by) ? row.writable_by : JSON.parse(row.writable_by as string || '[]');
    if (!writable.includes(userId)) {
      throw new Error('Forbidden');
    }

    const updateData: any = { ...body };
    if (body.readable_by) {
        updateData.readable_by = JSON.stringify(body.readable_by);
    }
    if (body.writable_by) {
        updateData.writable_by = JSON.stringify(body.writable_by);
    }

    const result = await this.db.update(Outbounds).set({
      ...updateData,
      updated_at: Math.floor(Date.now() / 1000)
    }).where(eq(Outbounds.id, outboundId)).returning();

    const allProfiles = await this.db.select().from(Profiles);
    const referencing = (allProfiles as any[]).filter((p) => {
      const outs = Array.isArray(p.outbounds) ? p.outbounds : JSON.parse(p.outbounds as string || '[]');
      return outs.includes(outboundId);
    });
    if (this.env.OSS) {
      await Promise.all(referencing.map((p: any) => exportProfileToR2(this.db, this.env, p.id)));
    }

    return new Outbound(result[0]);
  }

  async delete(userId: number, outboundId: number) {
    const existing = await this.db.select().from(Outbounds).where(eq(Outbounds.id, outboundId)).limit(1);
    if (existing.length === 0) return false;

    const row = existing[0];
    const writable = Array.isArray(row.writable_by) ? row.writable_by : JSON.parse(row.writable_by as string || '[]');
    if (!writable.includes(userId)) {
      throw new Error('Forbidden');
    }

    await this.db.delete(Outbounds).where(eq(Outbounds.id, outboundId));
    return true;
  }
}
