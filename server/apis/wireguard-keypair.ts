import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { CreateWireguardKeypairSchema } from '../../schemas/wireguard-keypair';
import { WireguardKeypairService } from '../services/wireguard-keypair';
import { authMiddleware } from '../auth';
import type { HonoEnv } from '../types';

export const wireguardKeypairApi = new Hono<HonoEnv>()
  .use(authMiddleware)
  .get('/', async (c) => {
    const userId = c.get('userId');
    const service = new WireguardKeypairService(c.get('db'));
    const keypairs = await service.getKeypairs(userId);
    return c.json(
      keypairs.map((keypair) => ({
        id: keypair.id,
        publicKey: keypair.publicKey,
        privateKey: keypair.privateKey,
        createdAt: keypair.createdAt,
      })),
    );
  })
  .get('/:id', async (c) => {
    const userId = c.get('userId');
    const id = c.req.param('id');
    const service = new WireguardKeypairService(c.get('db'));
    const keypair = await service.getKeypairById(id, userId);
    if (!keypair) {
      return c.notFound();
    }
    return c.json({
      id: keypair.id,
      publicKey: keypair.publicKey,
      privateKey: keypair.privateKey,
      createdAt: keypair.createdAt,
    });
  })
  .post('/', zValidator('json', CreateWireguardKeypairSchema), async (c) => {
    const userId = c.get('userId');
    const data = c.req.valid('json');
    const service = new WireguardKeypairService(c.get('db'));
    const keypair = await service.createKeypair(
      data.publicKey,
      data.privateKey,
      userId,
    );
    return c.json(
      {
        id: keypair.id,
        publicKey: keypair.publicKey,
        privateKey: keypair.privateKey,
        createdAt: keypair.createdAt,
      },
      201,
    );
  })
  .delete('/:id', async (c) => {
    const userId = c.get('userId');
    const id = c.req.param('id');
    const service = new WireguardKeypairService(c.get('db'));
    try {
      await service.deleteKeypair(id, userId);
      return c.body(null, 204);
    } catch (error) {
      if (error instanceof Error && error.message === 'Forbidden') {
        return c.json({ message: error.message }, 403);
      }
      return c.json(
        { message: error instanceof Error ? error.message : 'Unknown error' },
        500,
      );
    }
  });
