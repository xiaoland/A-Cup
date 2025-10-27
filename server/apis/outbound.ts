import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { OutboundSchema } from '../../schemas/outbound';
import { OutboundService } from '../services/outbound';
import { authMiddleware } from '../auth';

export const outboundApi = new Hono()
  .use(authMiddleware)
  .get('/', async (c) => {
    const userId = c.get('userId');
    const outboundService = new OutboundService(c.get('db'));
    const outbounds = await outboundService.getOutbounds(userId);
    return c.json(outbounds);
  })
  .get('/:id', async (c) => {
    const userId = c.get('userId');
    const outboundService = new OutboundService(c.get('db'));
    const id = parseInt(c.req.param('id'));
    try {
      const outbound = await outboundService.getOutboundById(id, userId);
      if (!outbound) {
        return c.notFound();
      }
      return c.json(outbound);
    } catch (error) {
      return c.json({ message: error.message }, 403);
    }
  })
  .post('/', zValidator('json', OutboundSchema), async (c) => {
    const userId = c.get('userId');
    const outboundService = new OutboundService(c.get('db'));
    const outbound = c.req.valid('json');
    const newOutbound = await outboundService.createOutbound(outbound, userId);
    return c.json(newOutbound, 201);
  })
  .put('/:id', zValidator('json', OutboundSchema), async (c) => {
    const userId = c.get('userId');
    const outboundService = new OutboundService(c.get('db'));
    const id = parseInt(c.req.param('id'));
    const outbound = c.req.valid('json');
    try {
      const updatedOutbound = await outboundService.updateOutbound(id, outbound, userId);
      if (!updatedOutbound) {
        return c.notFound();
      }
      return c.json(updatedOutbound);
    } catch (error) {
      if (error.message === 'Forbidden') {
        return c.json({ message: error.message }, 403);
      }
      return c.json({ message: error.message }, 500);
    }
  })
  .delete('/:id', async (c) => {
    const userId = c.get('userId');
    const outboundService = new OutboundService(c.get('db'));
    const id = parseInt(c.req.param('id'));
    try {
      await outboundService.deleteOutbound(id, userId);
      return c.body(null, 204);
    } catch (error) {
      if (error.message === 'Forbidden') {
        return c.json({ message: error.message }, 403);
      }
      return c.json({ message: error.message }, 500);
    }
  });
