import { outbounds } from '../db/schema';
import { and, eq, inArray } from 'drizzle-orm';
import { OutboundSchema } from '../../schemas/outbound';
import { z } from 'zod';
import { DrizzleD1Database } from 'drizzle-orm/d1';

export class OutboundService {
  private db: DrizzleD1Database;

  constructor(db: DrizzleD1Database) {
    this.db = db;
  }

  async getOutbounds(ids?: number[]) {
    const conditions = [];
    
    if (ids && ids.length > 0) {
      conditions.push(inArray(outbounds.id, ids));
    }
    
    return (await this.db.select().from(outbounds).where(and(...conditions))).map((outbound) => {
      return {
        ...outbound,
        tls: JSON.parse(outbound.tls),
        mux: JSON.parse(outbound.mux),
        credential: JSON.parse(outbound.credential),
        other: JSON.parse(outbound.other),
      };
    });
  }

  async getOutboundById(id: number) {
    const outbound = await this.db.select().from(outbounds).where(eq(outbounds.id, id)).get();

    if (!outbound) {
      return null;
    }
    return {
      ...outbound,
      tls: JSON.parse(outbound.tls),
      mux: JSON.parse(outbound.mux),
      credential: JSON.parse(outbound.credential),
      other: JSON.parse(outbound.other),
    };
  }

  async createOutbound(outbound: z.infer<typeof OutboundSchema>) {
    const newOutbound = {
      ...outbound,
      credential: JSON.stringify(outbound.credential),
      tls: JSON.stringify(outbound.tls),
      mux: JSON.stringify(outbound.mux),
      other: JSON.stringify(outbound.other),
    }
    const result = await this.db.insert(outbounds).values(newOutbound).returning().get();
    return this.getOutboundById(result.id);
  }

  async updateOutbound(id: number, outbound: z.infer<typeof OutboundSchema>) {
    const existingOutbound = await this.getOutboundById(id);
    if (!existingOutbound) {
      return null;
    }

    const updatedOutbound = {
      ...outbound,
      credential: JSON.stringify(outbound.credential),
      tls: JSON.stringify(outbound.tls),
      mux: JSON.stringify(outbound.mux),
      other: JSON.stringify(outbound.other),
    }
    await this.db.update(outbounds).set(updatedOutbound).where(eq(outbounds.id, id));
    return this.getOutboundById(id);
  }

  async deleteOutbound(id: number) {
    const existingOutbound = await this.getOutboundById(id);
    if (!existingOutbound) {
      return null;
    }
    return await this.db.delete(outbounds).where(eq(outbounds.id, id));
  }
}
