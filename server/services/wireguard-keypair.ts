import { wireguardKeypairs } from '../db/schema';
import { eq } from 'drizzle-orm';
import { DrizzleD1Database } from 'drizzle-orm/d1';
import { v4 as uuidv4 } from 'uuid';

export class WireguardKeypairService {
  private db: DrizzleD1Database;

  constructor(db: DrizzleD1Database) {
    this.db = db;
  }

  async getKeypairs(userId: string) {
    return await this.db
      .select()
      .from(wireguardKeypairs)
      .where(eq(wireguardKeypairs.createdBy, userId));
  }

  async getKeypairById(id: string, userId: string) {
    const keypair = await this.db
      .select()
      .from(wireguardKeypairs)
      .where(eq(wireguardKeypairs.id, id))
      .get();

    if (keypair && keypair.createdBy !== userId) {
      throw new Error('Forbidden');
    }

    return keypair || null;
  }

  async createKeypair(
    publicKey: string,
    privateKey: string,
    userId: string,
  ) {
    const id = uuidv4();
    const createdAt = Date.now();

    const newKeypair = {
      id,
      publicKey,
      privateKey,
      createdBy: userId,
      createdAt,
    };

    const result = await this.db
      .insert(wireguardKeypairs)
      .values(newKeypair)
      .returning()
      .get();

    return result;
  }

  async deleteKeypair(id: string, userId: string) {
    const keypair = await this.getKeypairById(id, userId);
    if (!keypair) {
      return null;
    }
    if (keypair.createdBy !== userId) {
      throw new Error('Forbidden');
    }
    return await this.db
      .delete(wireguardKeypairs)
      .where(eq(wireguardKeypairs.id, id));
  }
}
