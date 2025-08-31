import { z } from "zod";
import { Router } from "../fund/router";
import { Outbounds } from "../db/schema";
import { and, eq, or } from "drizzle-orm";
import { DrizzleD1Database } from 'drizzle-orm/d1';
import { OutboundInSingBoxSchema, type OutboundInSingBox } from '../schemas/export';

export const OUTBOUNDS_ROUTER = new Router('/outbounds');

// Export function for sing-box format
export async function exportOutbound(db: DrizzleD1Database, id: number, type: "sing-box" = "sing-box"): Promise<OutboundInSingBox | null> {
  const outbounds = await db.select().from(Outbounds).where(eq(Outbounds.id, id)).limit(1);
  if (outbounds.length === 0) return null;
  
  const outbound = outbounds[0];
  const config: OutboundInSingBox = {
    type: outbound.type,
    tag: `out.${outbound.type}.${outbound.region || 'default'}.${outbound.name || outbound.id}`
  };

  if (outbound.address) config.server = outbound.address;
  if (outbound.port) config.server_port = outbound.port;
  if (outbound.uuid) config.uuid = outbound.uuid;
  if (outbound.password) config.password = outbound.password;
  if (outbound.alter_id) config.alter_id = outbound.alter_id;
  
  // Handle encryption with backward compatibility
  if (outbound.method) {
    config.method = outbound.method;
  } else if (outbound.encryption) {
    // Backward compatibility: use encryption for method if method is not set
    config.method = outbound.encryption;
  }
  
  if (outbound.security) {
    config.security = outbound.security;
  } else if (outbound.encryption) {
    // Backward compatibility: use encryption for security if security is not set
    config.security = outbound.encryption;
  }
  if (outbound.network) config.network = outbound.network;
  if (outbound.flow) config.flow = outbound.flow;
  if (outbound.transport) config.transport = outbound.transport;
  if (outbound.tls) config.tls = outbound.tls;

  // Handle nested outbounds
  if (outbound.outbounds && Array.isArray(outbound.outbounds) && outbound.outbounds.length > 0) {
    const nestedOutboundTags: string[] = [];
    for (const nestedId of outbound.outbounds) {
      if (typeof nestedId === 'number') {
        const nestedOutbound = await exportOutbound(db, nestedId, type);
        if (nestedOutbound) {
          nestedOutboundTags.push(nestedOutbound.tag);
        }
      }
    }
    if (nestedOutboundTags.length > 0) {
      config.outbounds = nestedOutboundTags;
    }
  }

  // Validate result with Zod schema
  return OutboundInSingBoxSchema.parse(config);
}


const CreateOutboundBody = z.object({
  share: z.boolean().default(false),
  name: z.string().optional(),
  type: z.string(),
  outbounds: z.array(z.number()).optional(),
  region: z.string().optional(),
  address: z.string().optional(),
  port: z.number().optional(),
  network: z.enum(["udp", "tcp"]).optional(),
  encryption: z.string().optional(),  // Legacy field for backward compatibility
  method: z.string().optional(),      // SingBox encryption method
  security: z.string().optional(),    // SingBox security/encryption type
  packet_encoding: z.string().optional(),
  uuid: z.string().optional(),
  password: z.string().optional(),
  alter_id: z.number().optional(),
  flow: z.string().optional(),
  transport: z.any().optional(),
  tls: z.any().optional(),
});

const IDPathParamSchema = z.object({
  id: z.string().transform(val => parseInt(val))
});
// Get By ID
OUTBOUNDS_ROUTER.add("get", "/:id", async ({
    db, token_payload, path_params
}) => {
    const user_id = parseInt((token_payload?.sub || '0').toString());
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
    
    if (outbounds.length === 0) {
        return Response.json({ error: "Not Found" }, { status: 404 });
    }

    return Response.json(outbounds[0]);
}, {
    pathParamsSchema: IDPathParamSchema,
    allowedRoles: ['authenticated']
});

// Get all
OUTBOUNDS_ROUTER.add("get", "", async ({
    db, token_payload
}) => {
    const user_id = parseInt((token_payload?.sub || '0').toString());

    const outbounds = await db.select().from(Outbounds).where(
        or(
            eq(Outbounds.owner, user_id),
            eq(Outbounds.share, true)
        )
    );

    return Response.json(outbounds);
}, {
    allowedRoles: ['authenticated']
});

OUTBOUNDS_ROUTER.add("post", "", async ({
    db, token_payload, body
}) => {
    const user_id = parseInt((token_payload?.sub || '0').toString());

    const result = await db.insert(Outbounds).values({
      ...body,
      owner: user_id,
    }).returning();

    return Response.json(result[0]);
}, {
    bodySchema: CreateOutboundBody,
    allowedRoles: ['authenticated']
})


const EditOutboundBody = CreateOutboundBody.partial()
OUTBOUNDS_ROUTER.add("put", "/:id", async ({
    body, db, path_params, token_payload
}) => {
    const user_id = parseInt((token_payload?.sub || '0').toString());
    
    const result = await db.update(Outbounds).set({
      ...body,
    }).where(and(
      eq(Outbounds.id, path_params.id),
      eq(Outbounds.owner, user_id)
    )).returning();

    return Response.json(result[0]);
}, {
    bodySchema: EditOutboundBody,
    pathParamsSchema: IDPathParamSchema,
    allowedRoles: ['authenticated']
})

// Delete outbound
OUTBOUNDS_ROUTER.add('DELETE', '/:id', async ({ 
    path_params, db, token_payload 
}) => {
  const user_id = parseInt((token_payload?.sub || '0').toString());
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

// Export outbound
OUTBOUNDS_ROUTER.add('GET', '/:id/export', async ({ 
    path_params, db, token_payload 
}) => {
  const user_id = parseInt((token_payload?.sub || '0').toString());
  const outbound_id = path_params.id;

  // Check ownership or share
  const existing = await db.select().from(Outbounds).where(
    and(
      eq(Outbounds.id, outbound_id),
      or(
        eq(Outbounds.owner, user_id),
        eq(Outbounds.share, true)
      )
    )
  ).limit(1);
  if (existing.length === 0) {
    return new Response('Outbound not found', { status: 404 });
  }

  const exported = await exportOutbound(db, outbound_id);
  if (!exported) {
    return new Response('Export failed', { status: 500 });
  }

  return Response.json(exported);
}, {
  pathParamsSchema: IDPathParamSchema,
  allowedRoles: ['authenticated']
});
