import { z } from 'zod';
import { Outbounds, Profiles } from '../db/schema';
import { eq } from 'drizzle-orm';
import { exportProfileToR2 } from '../fund/profile-export';
import { ServiceBase } from '.';
import { Outbound } from '../business/outbound';

const CreateOutboundBody = Outbound.schema().omit({
    id: true,
    created_at: true,
    updated_at: true,
}).extend({
    readable_by: z.array(z.number().int().positive()).optional(),
    writable_by: z.array(z.number().int().positive()).optional(),
});

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
    const filtered = outbounds.filter((row: any) => {
      const readable = Array.isArray(row.readable_by) ? row.readable_by : JSON.parse(row.readable_by || '[]');
      const writable = Array.isArray(row.writable_by) ? row.writable_by : JSON.parse(row.writable_by || '[]');
      return [...readable, ...writable].includes(userId);
    });

    return filtered.map((row: any) => new Outbound(row));
  }

  async get(userId: number, outboundId: number) {
    const outbounds = await this.db.select().from(Outbounds).where(eq(Outbounds.id, outboundId));
    if (outbounds.length === 0) return null;

    const row: any = outbounds[0];
    const readable = Array.isArray(row.readable_by) ? row.readable_by : JSON.parse(row.readable_by || '[]');
    const writable = Array.isArray(row.writable_by) ? row.writable_by : JSON.parse(row.writable_by || '[]');
    if (![...readable, ...writable].includes(userId)) {
      throw new Error('Forbidden');
    }

    return new Outbound(row);
  }

  async update(userId: number, outboundId: number, body: z.infer<typeof CreateOutboundBody>) {
    const existing = await this.db.select().from(Outbounds).where(eq(Outbounds.id, outboundId)).limit(1);
    if (existing.length === 0) return null;

    const row: any = existing[0];
    const writable = Array.isArray(row.writable_by) ? row.writable_by : JSON.parse(row.writable_by || '[]');
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
      const outs = Array.isArray(p.outbounds) ? p.outbounds : JSON.parse(p.outbounds || '[]');
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

    const row: any = existing[0];
    const writable = Array.isArray(row.writable_by) ? row.writable_by : JSON.parse(row.writable_by || '[]');
    if (!writable.includes(userId)) {
      throw new Error('Forbidden');
    }

    await this.db.delete(Outbounds).where(eq(Outbounds.id, outboundId));
    return true;
  }
}
