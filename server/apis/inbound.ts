import { z } from 'zod';
import { Router } from '../fund/router';
import { Inbounds, Users } from '../db/schema';
import { eq, and, or } from 'drizzle-orm';
import { api_router } from '../fund/router';


const CreateInboundSchema = z.object({
  type: z.enum(['mixed', 'tun']),
  address: z.string().optional(),
  port: z.number().int().optional(),
  stack: z.enum(['system', 'gvisor', 'mixed']).optional(),
  mtu: z.number().int().optional(),
  share: z.boolean().default(false)
});

const IDPathParamSchema = z.object({
  id: z.string().transform(val => parseInt(val))
});

// Create inbound
api_router.add('POST', '/inbounds', async ({ body, db, token_payload }) => {
  const result = await db.insert(Inbounds).values({
    owner: parseInt(token_payload?.sub || '0'),
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
api_router.add('PUT', '/inbounds/:id', async ({ path_params, body, db, token_payload }) => {
  const current_user = parseInt(token_payload?.sub || '0');
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

// Export inbound to sing-box format
const GetInboundExportQuery = z.object({
  type: z.enum(['sing-box']).default('sing-box')
})
api_router.add('GET', '/inbounds/:id/export', async ({ 
  path_params, query_params, db, token_payload 
}) => {
  const user_id = parseInt(token_payload?.sub || '0');
  const inbound_id = path_params.id;

  // Check access (owner or shared)
  const inbounds = await db.select().from(Inbounds).where(
    and(
      eq(Inbounds.id, inbound_id),
      or(
        eq(Inbounds.owner, user_id),
        eq(Inbounds.share, true)
      )
    )
  ).limit(1);
  if (inbounds.length === 0) {
    return new Response('Inbound not found', { status: 404 });
  }
  const inbound = inbounds[0];

  // Generate sing-box config
  if (query_params.type === 'sing-box') {
    const config: any = {
      type: inbound.type,
      tag: `in-${inbound.type}`
    };

    if (inbound.address) {
      config.listen = inbound.address;
    }

    if (inbound.port) {
      config.listen_port = inbound.port;
    }

    if (inbound.type === 'tun') {
      config.stack = inbound.stack;
      config.mtu = inbound.mtu;
      config.auto_route = true;
      config.auto_redirect = true;
      config.strict_route = true;
    }

    return Response.json(config);
  }

  return new Response('Unsupported export type', { status: 400 });
}, {
  pathParamsSchema: IDPathParamSchema,
  queryParamsSchema: GetInboundExportQuery,
  allowedRoles: ['authenticated']
});


// Get inbound
api_router.add('GET', '/inbounds/:id', async ({ path_params, db, token_payload }) => {
  const user_id = parseInt(token_payload?.sub || '0');
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
api_router.add('GET', '/', async ({ db, token_payload }) => {
  const userId = parseInt(token_payload?.sub || '0');

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
api_router.add('DELETE', '/inbounds/:id', async ({ path_params, db, token_payload }) => {
  const user_id = parseInt(token_payload?.sub || '0');
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

