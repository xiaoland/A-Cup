import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { OutboundSchema } from '../../schemas/outbound';
import { OutboundService } from '../services/outbound';

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { OutboundSchema } from '../../schemas/outbound';
import { OutboundService } from '../services/outbound';
import { jwt } from 'hono/jwt';

export const outboundApi = new Hono()
  .use('*', jwt({ secret: 'your-secret' })) // Replace with your actual secret
  .get('/', async (c) => {
    const user = c.get('jwtPayload');
    const outboundService = new OutboundService(c.get('db'));
    const outbounds = await outboundService.getOutbounds(user.id);
    return c.json(outbounds.map(o => ({...o, credential: JSON.parse(o.credential), readableBy: JSON.parse(o.readableBy), writeableBy: JSON.parse(o.writeableBy) })));
  })
  .get('/:id', async (c) => {
    const outboundService = new OutboundService(c.get('db'));
    const id = parseInt(c.req.param('id'));
    const outbound = await outboundService.getOutboundById(id);
    if (!outbound) {
      return c.notFound();
    }
    return c.json({...outbound, credential: JSON.parse(outbound.credential), readableBy: JSON.parse(o.readableBy), writeableBy: JSON.parse(o.writeableBy) });
  })
  .post('/', zValidator('json', OutboundSchema), async (c) => {
    const user = c.get('jwtPayload');
    const outboundService = new OutboundService(c.get('db'));
    const outbound = c.req.valid('json');
    const newOutbound = await outboundService.createOutbound(outbound, user.id);
    return c.json(newOutbound, 201);
  })
  .put('/:id', zValidator('json', OutboundSchema), async (c) => {
    const user = c.get('jwtPayload');
    const outboundService = new OutboundService(c.get('db'));
    const id = parseInt(c.req.param('id'));
    const outbound = c.req.valid('json');
    try {
      const updatedOutbound = await outboundService.updateOutbound(id, outbound, user.id);
      if (!updatedOutbound) {
        return c.notFound();
      }
      return c.json(updatedOutbound);
    } catch (error) {
      return c.json({ message: error.message }, 403);
    }
  })
  .delete('/:id', async (c) => {
    const user = c.get('jwtPayload');
    const outboundService = new OutboundService(c.get('db'));
    const id = parseInt(c.req.param('id'));
    try {
      await outboundService.deleteOutbound(id, user.id);
      return c.body(null, 204);
    } catch (error) {
      return c.json({ message: error.message }, 403);
    }
  });
