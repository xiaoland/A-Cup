import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { OutboundSchema } from '../../schemas/outbound';
import { OutboundService } from '../services/outbound';
import { authMiddleware } from '../auth';
import type { HonoEnv } from '../types';

export const outboundApi = new Hono<HonoEnv>()
  .use(authMiddleware)
  .get('/', async (c) => {
    const outboundService = new OutboundService(c.get('db'));
    const outbounds = await outboundService.getOutbounds();
    return c.json(outbounds);
  })
  .get('/:id', async (c) => {
    const outboundService = new OutboundService(c.get('db'));
    const id = parseInt(c.req.param('id'));
    const outbound = await outboundService.getOutboundById(id);
    if (!outbound) {
      return c.notFound();
    }
    return c.json(outbound);
  })
  .post('/', zValidator('json', OutboundSchema), async (c) => {
    const outboundService = new OutboundService(c.get('db'));
    const outbound = c.req.valid('json');
    const newOutbound = await outboundService.createOutbound(outbound);
    return c.json(newOutbound, 201);
  })
  .put('/:id', zValidator('json', OutboundSchema), async (c) => {
    const outboundService = new OutboundService(c.get('db'));
    const id = parseInt(c.req.param('id'));
    const outbound = c.req.valid('json');
    const updatedOutbound = await outboundService.updateOutbound(id, outbound);
    if (!updatedOutbound) {
      return c.notFound();
    }
    return c.json(updatedOutbound);
  })
  .delete('/:id', async (c) => {
    const outboundService = new OutboundService(c.get('db'));
    const id = parseInt(c.req.param('id'));
    try {
      await outboundService.deleteOutbound(id);
      return c.body(null, 204);
    } catch (error) {
      if (error instanceof Error && error.message === 'Forbidden') {
        return c.json({ message: error.message }, 403);
      }
      return c.json({ message: error instanceof Error ? error.message : 'Unknown error' }, 500);
    }
  });
