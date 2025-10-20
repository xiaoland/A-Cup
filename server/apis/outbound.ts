import { Hono } from 'hono';
import { z } from 'zod';
import { OutboundService } from '../services/outbound.service';
import { zValidator } from '@hono/zod-validator';

export const outboundRouter = new Hono();

export const SpecialOutboundSchema = z.object({
  tag: z.string().min(1),
  type: z.enum(['selector', 'urltest', 'direct']),
  outbounds: z.array(z.string()).optional(),
  url: z.string().optional(),
  interval: z.string().optional(),
  default: z.string().optional(),
});

const CreateOutboundBody = z.object({
  name: z.string().min(1),
  region: z.string().optional(),
  provider: z.string().optional(),
  type: z.enum(['shadowsocks', 'vmess', 'vless', 'hysteria2']),
  server: z.string().min(1),
  server_port: z.number().int().positive(),
  credential: z.any(),
  transport: z.any().optional().default({}),
  tls: z.any().optional().default({}),
  mux: z.any().optional().default({}),
  other: z.any().optional().default({}),
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
    const outbound = await outboundService.getOutboundById(user_id, id);
    if (!outbound) {
      return c.json({ error: "Not Found" }, 404);
    }
    return c.json(outbound);
  } catch (error) {
    return c.text('Forbidden', 403);
  }
});

outboundRouter.get('/', async (c) => {
  const user_id = parseInt((c.get('jwtPayload')?.sub || '0').toString());
  const outboundService = new OutboundService(c.get('db'), c.env);

  const outbounds = await outboundService.getOutbounds(user_id);
  return c.json(outbounds);
});

outboundRouter.post('/', zValidator('json', CreateOutboundBody), async (c) => {
  const body = c.req.valid('json');
  const user_id = parseInt((c.get('jwtPayload')?.sub || '0').toString());
  const outboundService = new OutboundService(c.get('db'), c.env);

  const newOutbound = await outboundService.createOutbound(user_id, body);
  return c.json(newOutbound);
});

outboundRouter.put('/:id', zValidator('param', IDPathParamSchema), zValidator('json', CreateOutboundBody.partial()), async (c) => {
  const { id } = c.req.valid('param');
  const body = c.req.valid('json');
  const user_id = parseInt((c.get('jwtPayload')?.sub || '0').toString());
  const outboundService = new OutboundService(c.get('db'), c.env);

  try {
    const updatedOutbound = await outboundService.updateOutbound(user_id, id, body);
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
    const deleted = await outboundService.deleteOutbound(user_id, id);
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
    const tag = await outboundService.getOutboundTag(user_id, id);
    if (!tag) {
      return c.text('Outbound not found', 404);
    }
    return c.json(tag);
  } catch (error) {
    return c.text('Forbidden', 403);
  }
});

outboundRouter.get('/:id/export', zValidator('param', IDPathParamSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user_id = parseInt((c.get('jwtPayload')?.sub || '0').toString());
  const outboundService = new OutboundService(c.get('db'), c.env);

  try {
    const exported = await outboundService.exportOutbound(user_id, id);
    if (!exported) {
      return c.text('Export failed', 500);
    }
    return c.json(exported);
  } catch (error) {
    return c.text('Forbidden', 403);
  }
});
