import { outbounds } from '../db/schema';
import { and, eq, like } from 'drizzle-orm';

export function exportOutboundToSingBox(outbound: any) {
  return {
    type: outbound.type,
    tag: outbound.name,
    server: outbound.server,
    server_port: outbound.server_port,
    ...outbound.credential,
    ...outbound.tls,
    ...outbound.mux,
    ...outbound.other,
  };
}
import { OutboundSchema } from '../../schemas/outbound';
import { z } from 'zod';
import { DrizzleD1Database } from 'drizzle-orm/d1';

export class OutboundService {
  private db: DrizzleD1Database;

  constructor(db: DrizzleD1Database) {
    this.db = db;
  }

  async getOutbounds(userId: string) {
    return await this.db.select().from(outbounds).where(like(outbounds.readableBy, `%${userId}%`));
  }

  async getOutboundById(id: number) {
    return await this.db.select().from(outbounds).where(eq(outbounds.id, id)).get();
  }

  async createOutbound(outbound: z.infer<typeof OutboundSchema>, userId: string) {
    const newOutbound = {
      ...outbound,
      readableBy: JSON.stringify([userId]),
      writeableBy: JSON.stringify([userId]),
      credential: JSON.stringify(outbound.credential),
      tls: JSON.stringify(outbound.tls),
      mux: JSON.stringify(outbound.mux),
      other: JSON.stringify(outbound.other),
    }
    const result = await this.db.insert(outbounds).values(newOutbound).returning().get();
    return this.getOutboundById(result.id);
  }

  async updateOutbound(id: number, outbound: z.infer<typeof OutboundSchema>, userId: string) {
    const existingOutbound = await this.getOutboundById(id);
    if (!existingOutbound) {
      return null;
    }
    if (!JSON.parse(existingOutbound.writeableBy).includes(userId)) {
      throw new Error('Unauthorized');
    }

    const updatedOutbound = {
      ...outbound,
      credential: JSON.stringify(outbound.credential),
      readableBy: JSON.stringify(outbound.readableBy),
      writeableBy: JSON.stringify(outbound.writeableBy),
      tls: JSON.stringify(outbound.tls),
      mux: JSON.stringify(outbound.mux),
      other: JSON.stringify(outbound.other),
    }
    await this.db.update(outbounds).set(updatedOutbound).where(eq(outbounds.id, id));
    return this.getOutboundById(id);
  }

  async deleteOutbound(id: number, userId: string) {
    const existingOutbound = await this.getOutboundById(id);
    if (!existingOutbound) {
      return null;
    }
    if (!JSON.parse(existingOutbound.writeableBy).includes(userId)) {
      throw new Error('Unauthorized');
    }
    return await this.db.delete(outbounds).where(eq(outbounds.id, id));
  }
}
