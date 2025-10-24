import { Hono } from 'hono';
import { z } from 'zod';
import { OutboundService } from '../services/outbound.service';
import { zValidator } from '@hono/zod-validator';
import { Outbound } from '../business/outbound';

export const outboundRouter = new Hono();

const CreateOutboundBody = Outbound.schema().omit({
  id: true,
  created_at: true,
  updated_at: true,
}).extend({
  type: z.enum(['shadowsocks', 'vmess', 'vless', 'hysteria2']),
  readable_by: z.array(z.number().int().positive()).optional(),
  writable_by: z.array(z.number().int().positive()).optional(),
});

const IDPathParamSchema = z.object({
  id: z.string().transform(val => parseInt(val))
});

outboundRouter.get('/:id', zValidator('param', IDPathParamSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user_id = parseInt((c.get('jwtPayload')?.sub || '0').toString());
  const outboundService = new OutboundService(c.get('db'), c.env);

  try {
    const outbound = await outboundService.get(user_id, id);
    if (!outbound) {
      return c.json({ error: "Not Found" }, 404);
    }
    return c.json(outbound);
  } catch (error) {
    return c.text('Forbidden', 403);
  }
});

outboundRouter.get('/', async (c) => {
  try {
    const user_id = parseInt((c.get('jwtPayload')?.sub || '0').toString());
    const outboundService = new OutboundService(c.get('db'), c.env);

    const outbounds = await outboundService.getAll(user_id);
    return c.json(outbounds);
  } catch (error: any) {
    return c.json({ error: 'Internal Server Error', message: error.message }, 500);
  }
});

outboundRouter.post('/', zValidator('json', CreateOutboundBody), async (c) => {
  const body = c.req.valid('json');
  const user_id = parseInt((c.get('jwtPayload')?.sub || '0').toString());
  const outboundService = new OutboundService(c.get('db'), c.env);

  const newOutbound = await outboundService.create(user_id, body);
  return c.json(newOutbound);
});

outboundRouter.put('/:id', zValidator('param', IDPathParamSchema), zValidator('json', CreateOutboundBody.partial()), async (c) => {
  const { id } = c.req.valid('param');
  const body = c.req.valid('json');
  const user_id = parseInt((c.get('jwtPayload')?.sub || '0').toString());
  const outboundService = new OutboundService(c.get('db'), c.env);

  try {
    const updatedOutbound = await outboundService.update(user_id, id, body);
    if (!updatedOutbound) {
      return c.text('Not Found', 404);
    }
    return c.json(updatedOutbound);
  } catch (error) {
    return c.text('Forbidden', 403);
  }
});

outboundRouter.delete('/:id', zValidator('param', IDPathParamSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user_id = parseInt((c.get('jwtPayload')?.sub || '0').toString());
  const outboundService = new OutboundService(c.get('db'), c.env);

  try {
    const deleted = await outboundService.delete(user_id, id);
    if (!deleted) {
      return c.text('Outbound not found', 404);
    }
    return new Response(null, { status: 204 });
  } catch (error) {
    return c.text('Forbidden', 403);
  }
});

outboundRouter.get('/:id/tag', zValidator('param', IDPathParamSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user_id = parseInt((c.get('jwtPayload')?.sub || '0').toString());
  const outboundService = new OutboundService(c.get('db'), c.env);

  try {
    const outbound = await outboundService.get(user_id, id);
    if (!outbound) {
      return c.text('Outbound not found', 404);
    }
    return c.json({ tag: outbound.getTag() });
  } catch (error) {
    return c.text('Forbidden', 403);
  }
});

outboundRouter.get('/:id/export', zValidator('param', IDPathParamSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user_id = parseInt((c.get('jwtPayload')?.sub || '0').toString());
  const outboundService = new OutboundService(c.get('db'), c.env);

  try {
    const outbound = await outboundService.get(user_id, id);
    if (!outbound) {
      return c.text('Outbound not found', 404);
    }
    const exported = outbound.exportToSingBox();
    return c.json(exported);
  } catch (error) {
    return c.text('Forbidden', 403);
  }
});
