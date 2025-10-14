import { z } from "zod";
import { Router } from "../fund/router";
import { Outbounds, Profiles } from "../db/schema";
import { and, eq } from "drizzle-orm";
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
    tag: `out.${outbound.type}.${(outbound as any).region || 'default'}.${(outbound as any).name || (outbound as any).id}`
  };

  // Map core connection fields
  if ((outbound as any).server) config.server = (outbound as any).server as string;
  if ((outbound as any).server_port) config.server_port = (outbound as any).server_port as number;

  // Optional fields derived from credential/transport/tls
  const credential = (outbound as any).credential as any | undefined;
  if (credential && typeof credential === 'object') {
    if (credential.uuid) config.uuid = credential.uuid;
    if (credential.password) config.password = credential.password;
    if (credential.alter_id) config.alter_id = credential.alter_id;
    if (credential.method) config.method = credential.method;
    if (credential.security) config.security = credential.security;
    if (credential.network) config.network = credential.network;
    if (credential.flow) config.flow = credential.flow;
  }

  if ((outbound as any).transport) config.transport = (outbound as any).transport as any;
  if ((outbound as any).tls) config.tls = (outbound as any).tls as any;

  // Validate result with Zod schema
  return OutboundInSingBoxSchema.parse(config);
}


const CreateOutboundBody = z.object({
  name: z.string().min(1),
  region: z.string().optional(),
  provider: z.string().optional(),
  type: z.string().min(1),
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
// Get By ID (auth via readable_by/writable_by)
OUTBOUNDS_ROUTER.add("get", "/:id", async ({
    db, token_payload, path_params
}) => {
    const user_id = parseInt((token_payload?.sub || '0').toString());
    const outbound_id = path_params.id;

    const outbounds = await db.select().from(Outbounds).where(eq(Outbounds.id, outbound_id));
    
    if (outbounds.length === 0) {
        return Response.json({ error: "Not Found" }, { status: 404 });
    }

    const row: any = outbounds[0];
    const readable = Array.isArray(row.readable_by) ? row.readable_by : JSON.parse(row.readable_by || '[]');
    const writable = Array.isArray(row.writable_by) ? row.writable_by : JSON.parse(row.writable_by || '[]');
    if (![...readable, ...writable].includes(user_id)) {
      return new Response('Forbidden', { status: 403 });
    }

    return Response.json(row);
}, {
    pathParamsSchema: IDPathParamSchema,
    allowedRoles: ['authenticated']
});

// Get all (filter by membership in readable_by/writable_by on the server side)
OUTBOUNDS_ROUTER.add("get", "", async ({
    db, token_payload
}) => {
    const user_id = parseInt((token_payload?.sub || '0').toString());

    const outbounds = await db.select().from(Outbounds);
    const filtered = outbounds.filter((row: any) => {
      const readable = Array.isArray(row.readable_by) ? row.readable_by : JSON.parse(row.readable_by || '[]');
      const writable = Array.isArray(row.writable_by) ? row.writable_by : JSON.parse(row.writable_by || '[]');
      return [...readable, ...writable].includes(user_id);
    });

    const tagged = filtered.map((row: any) => ({
      ...row,
      tag: `${row.type}.${row.provider || 'default'}.${row.region || 'default'}.${row.name || row.id}`
    }));

    return Response.json(tagged);
}, {
    allowedRoles: ['authenticated']
});

OUTBOUNDS_ROUTER.add("post", "", async ({
    db, token_payload, body
}) => {
    const user_id = parseInt((token_payload?.sub || '0').toString());

    const readable_by = body.readable_by && body.readable_by.length ? body.readable_by : [user_id];
    const writable_by = body.writable_by && body.writable_by.length ? body.writable_by : [user_id];

    const result = await db.insert(Outbounds).values({
      ...body,
      readable_by: JSON.stringify(readable_by),
      writable_by: JSON.stringify(writable_by),
    }).returning();

    return Response.json(result[0]);
}, {
    bodySchema: CreateOutboundBody,
    allowedRoles: ['authenticated']
})


const EditOutboundBody = CreateOutboundBody.partial()
import { exportProfileToR2 } from "../fund/profile-export";

OUTBOUNDS_ROUTER.add("put", "/:id", async ({
    body, db, path_params, token_payload, env
}) => {
    const user_id = parseInt((token_payload?.sub || '0').toString());
    // Permission check
    const existing = await db.select().from(Outbounds).where(eq(Outbounds.id, path_params.id)).limit(1);
    if (existing.length === 0) {
      return new Response('Not Found', { status: 404 });
    }
    const row: any = existing[0];
    const writable = Array.isArray(row.writable_by) ? row.writable_by : JSON.parse(row.writable_by || '[]');
    if (!writable.includes(user_id)) {
      return new Response('Forbidden', { status: 403 });
    }

    const result = await db.update(Outbounds).set({
      ...body,
      updated_at: Math.floor(Date.now() / 1000)
    }).where(eq(Outbounds.id, path_params.id)).returning();

    // Re-export and upload all profiles referencing this outbound (in outbounds[])
    const allProfiles = await db.select().from(Profiles);
    const referencing = (allProfiles as any[]).filter((p) => {
      try {
        const outs = Array.isArray(p.outbounds) ? p.outbounds : JSON.parse(p.outbounds || '[]');
        return outs.includes(path_params.id);
      } catch {
        return false;
      }
    });
    if (env.OSS) {
      await Promise.all(referencing.map((p: any) => exportProfileToR2(db, env, p.id)));
    }

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

  // Check writable permission
  const existing = await db.select().from(Outbounds).where(eq(Outbounds.id, outbound_id)).limit(1);
  if (existing.length === 0) {
    return new Response('Outbound not found', { status: 404 });
  }
  const row: any = existing[0];
  const writable = Array.isArray(row.writable_by) ? row.writable_by : JSON.parse(row.writable_by || '[]');
  if (!writable.includes(user_id)) {
    return new Response('Forbidden', { status: 403 });
  }

  await db.delete(Outbounds).where(eq(Outbounds.id, outbound_id));
  return new Response('', { status: 204 });
}, {
  pathParamsSchema: IDPathParamSchema,
  allowedRoles: ['authenticated']
});

OUTBOUNDS_ROUTER.add('GET', '/:id/tag', async ({
  path_params, db, token_payload
}) => {
  const user_id = parseInt((token_payload?.sub || '0').toString());
  const outbound_id = path_params.id;

  const existing = await db.select().from(Outbounds).where(eq(Outbounds.id, outbound_id)).limit(1);
  if (existing.length === 0) {
    return new Response('Outbound not found', { status: 404 });
  }
  const row: any = existing[0];
  const readable = Array.isArray(row.readable_by) ? row.readable_by : JSON.parse(row.readable_by || '[]');
  const writable = Array.isArray(row.writable_by) ? row.writable_by : JSON.parse(row.writable_by || '[]');
  if (![...readable, ...writable].includes(user_id)) {
    return new Response('Forbidden', { status: 403 });
  }

  const tag = `${row.type}.${row.provider || 'default'}.${row.region || 'default'}.${row.name || row.id}`;
  return Response.json({ tag });
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

  const existing = await db.select().from(Outbounds).where(eq(Outbounds.id, outbound_id)).limit(1);
  if (existing.length === 0) {
    return new Response('Outbound not found', { status: 404 });
  }
  const row: any = existing[0];
  const readable = Array.isArray(row.readable_by) ? row.readable_by : JSON.parse(row.readable_by || '[]');
  const writable = Array.isArray(row.writable_by) ? row.writable_by : JSON.parse(row.writable_by || '[]');
  if (![...readable, ...writable].includes(user_id)) {
    return new Response('Forbidden', { status: 403 });
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
