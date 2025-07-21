import { z } from "zod";
import { Router } from "../fund/router";
import { Outbounds } from "../db/schema";
import { and, eq, or } from "drizzle-orm";


export const OUTBOUNDS_ROUTER = new Router('/outbounds');


const CreateOutboundBody = z.object({
  share: z.boolean().default(false),
  type: z.string(),
  outbounds: z.array(z.number()).optional(),
  region: z.string().optional(),
  address: z.string().optional(),
  port: z.number().optional(),
  network: z.enum(["udp", "tcp"]).optional(),
  encryption: z.string().optional(),
  packet_encoding: z.string().optional(),
  uuid: z.string().optional(),
  password: z.string().optional(),
  alter_id: z.number().optional(),
  flow: z.string().optional(),
  transport: z.any().optional(),
  tls: z.any().optional(),
});

OUTBOUNDS_ROUTER.add("post", "", async ({
    db, token_payload, body
}) => {
    const user_id = parseInt(token_payload?.sub || '0');

    const result = await db.insert(Outbounds).values({
      ...body,
      owner: user_id,
    }).returning();

    return Response.json(result[0]);
}, {
    bodySchema: CreateOutboundBody,
})


const EditOutboundBody = CreateOutboundBody.partial()
const IDPathParamSchema = z.object({
  id: z.string().transform(val => parseInt(val))
});
OUTBOUNDS_ROUTER.add("put", "/:id", async ({
    body, db, path_params, token_payload
}) => {
    const user_id = parseInt(token_payload?.sub || '0');
    
    const result = await db.update(Outbounds).set({
      ...body,
    }).where(and(
      eq(Outbounds.id, path_params.id),
      eq(Outbounds.owner, user_id)
    )).returning();

    return Response.json(result[0]);
}, {
    bodySchema: EditOutboundBody,
    pathParamsSchema: IDPathParamSchema
})


const GetOutboundExportQuery = z.object({
  type: z.enum(['sing-box']).default('sing-box')
})
OUTBOUNDS_ROUTER.add("get", "/:id/export", async ({
    token_payload, db, path_params, query_params
}) => {
    const user_id = parseInt(token_payload?.sub || '0');
    const outbound_id = path_params.id;

    const outbounds = await db.select().from(Outbounds).where(
        and(
            eq(Outbounds.id, outbound_id),
            or(
                eq(Outbounds.owner, user_id),
                eq(Outbounds.share, true)
            )
        )
    );
    if (!outbounds) {
      return Response.json({ error: "Not Found" }, {status: 404});
    }
    const outbound = outbounds[0];

    if (query_params.type === 'sing-box') {
        return Response.json({
            type: outbound.type,
            tag: `${outbound.type}.${outbound.region}`,
            server: outbound.address,
            server_port: outbound.port,
            uuid: outbound.uuid,
            password: outbound.password,
            alter_id: outbound.alter_id,
            method: outbound.encryption,
            security: outbound.encryption,
            network: outbound.network,
            transport: outbound.transport,
            tls: outbound.tls,
            flow: outbound.flow
        });
    }
    else {
        return new Response('Unsupported export type', { status: 400 });
    }
}, {
    pathParamsSchema: IDPathParamSchema,
    queryParamsSchema: GetOutboundExportQuery
});


// Delete outbound
OUTBOUNDS_ROUTER.add('DELETE', '/:id', async ({ 
    path_params, db, token_payload 
}) => {
  const user_id = parseInt(token_payload?.sub || '0');
  const outbound_id = path_params.id;

  // Check ownership
  const existing = await db.select().from(Outbounds).where(
    and(
      eq(Outbounds.id, outbound_id),
      eq(Outbounds.owner, user_id)
    )
  ).limit(1);
  if (existing.length === 0) {
    return new Response('Outbound not found', { status: 404 });
  }

  await db.delete(Outbounds).where(eq(Outbounds.id, outbound_id));
  return new Response('', { status: 204 });
}, {
  pathParamsSchema: IDPathParamSchema,
  allowedRoles: ['authenticated']
});
