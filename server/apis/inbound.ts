import { z } from 'zod';
import { Router } from '../fund/router';
import { Inbounds } from '../db/schema';
import { eq, and, or } from 'drizzle-orm';
import { DrizzleD1Database } from 'drizzle-orm/d1';
import { InboundInSingBoxSchema, type InboundInSingBox } from '../schemas/export';

export const INBOUND_ROUTER = new Router('/inbounds');

// Export function for sing-box format
export async function exportInbound(db: DrizzleD1Database, id: number, type: "sing-box" = "sing-box"): Promise<InboundInSingBox | null> {
  const inbounds = await db.select().from(Inbounds).where(eq(Inbounds.id, id)).limit(1);
  if (inbounds.length === 0) return null;
  
  const inbound = inbounds[0];
  const config: InboundInSingBox = {
    type: inbound.type,
    tag: `in.${inbound.type}`
  };

  if (inbound.address) {
    config.listen = inbound.address;
  }

  if (inbound.port) {
    config.listen_port = inbound.port;
  }

  if (inbound.type === 'tun') {
    if (inbound.stack) config.stack = inbound.stack;
    if (inbound.mtu) config.mtu = inbound.mtu;
    // Use explicit routing settings if available, otherwise use defaults
    config.auto_route = inbound.auto_route !== null && inbound.auto_route !== undefined ? inbound.auto_route : true;
    config.auto_redirect = inbound.auto_redirect !== null && inbound.auto_redirect !== undefined ? inbound.auto_redirect : true;
    config.strict_route = inbound.strict_route !== null && inbound.strict_route !== undefined ? inbound.strict_route : true;
  }

  // Validate result with Zod schema
  return InboundInSingBoxSchema.parse(config);
}

const CreateInboundSchema = z.object({
  type: z.enum(['mixed', 'socks', 'http', 'tun', 'redirect', 'tproxy']),
  address: z.string().optional(),
  port: z.number().int().optional(),
  stack: z.enum(['system', 'gvisor', 'mixed']).optional(),
  mtu: z.number().int().optional(),
  auto_route: z.boolean().optional(),
  auto_redirect: z.boolean().optional(),
  strict_route: z.boolean().optional(),
  share: z.boolean().default(false)
});

const IDPathParamSchema = z.object({
  id: z.string().transform(val => parseInt(val))
});

// Create inbound
INBOUND_ROUTER.add('POST', '', async ({ body, db, token_payload }) => {
  const result = await db.insert(Inbounds).values({
    owner: parseInt((token_payload?.sub || '0').toString()),
    type: body.type,
    address: body.address,
    port: body.port,
    stack: body.stack,
    mtu: body.mtu,
    share: body.share
  }).returning();

  return Response.json((result[0]), {status: 201}); 
}, {
  bodySchema: CreateInboundSchema,
  allowedRoles: ['authenticated']
});

// Edit inbound
const EditInboundSchema = CreateInboundSchema.partial();
INBOUND_ROUTER.add('PUT', '/:id', async ({ path_params, body, db, token_payload }) => {
  const current_user = parseInt((token_payload?.sub || '0').toString());
  const inbound_id = path_params.id;

  // Check ownership
  const existing = await db.select().from(Inbounds).where(eq(Inbounds.id, inbound_id)).limit(1);
  if (existing.length === 0) {
    return new Response('Inbound not found', { status: 404 });
  }
  if (existing[0].owner !== current_user) {
    return new Response('Forbidden', { status: 403 });
  }

  const result = await db.update(Inbounds)
    .set(body)
    .where(eq(Inbounds.id, inbound_id))
    .returning();

  return Response.json(result[0]);
}, {
  pathParamsSchema: IDPathParamSchema,
  bodySchema: EditInboundSchema,
  allowedRoles: ['authenticated']
});

// Get inbound
INBOUND_ROUTER.add('GET', '/:id', async ({ path_params, db, token_payload }) => {
  const user_id = parseInt((token_payload?.sub || '0').toString());
  const inbound_id = path_params.id;

  // Check access (owner or shared)
  const inbounds = await db.select().from(Inbounds).where(
    and(
      eq(Inbounds.id, inbound_id),
      eq(Inbounds.owner, user_id)
    )
  ).limit(1);
  if (inbounds.length === 0) {
    return new Response('Inbound not found', { status: 404 });
  }

  return Response.json(inbounds[0]);
}, {
  pathParamsSchema: IDPathParamSchema,
  allowedRoles: ['authenticated']
});

// List inbounds (owned or shared)
INBOUND_ROUTER.add('GET', '', async ({ db, token_payload }) => {
  const userId = parseInt((token_payload?.sub || '0').toString());

  const result = await db.select()
    .from(Inbounds)
    .where(
      or(
        eq(Inbounds.owner, userId),
        eq(Inbounds.share, true)
      )
    );

  return Response.json(result);
}, {
  allowedRoles: ['authenticated']
});

// Delete inbound
INBOUND_ROUTER.add('DELETE', '/:id', async ({ path_params, db, token_payload }) => {
  const user_id = parseInt((token_payload?.sub || '0').toString());
  const inbound_id = path_params.id;

  // Check ownership
  const existing = await db.select().from(Inbounds).where(
    and(
      eq(Inbounds.id, inbound_id),
      eq(Inbounds.owner, user_id)
    )
  ).limit(1);
  if (existing.length === 0) {
    return new Response('Inbound not found', { status: 404 });
  }

  await db.delete(Inbounds).where(eq(Inbounds.id, inbound_id));
  return new Response('', { status: 204 });
}, {
  pathParamsSchema: IDPathParamSchema,
  allowedRoles: ['authenticated']
});

