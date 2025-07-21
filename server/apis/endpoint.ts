import { eq, and, or } from "drizzle-orm";
import { z } from "zod";
import { api_router } from "../fund/router";
import { EndpointWireguards } from "../db/schema";

// Schemas for validation
const Peer = z.object({
  id: z.number(),
  address: z.string(),
  port: z.number(),
  allowed_ips: z.array(z.string())
});

const CreateWireguardBody = z.object({
  name: z.string(),
  system: z.boolean().default(false),
  addresses: z.array(z.string()),
  private_key: z.string(),
  public_key: z.string(),
  preshared_key: z.string().optional(),
  peers: z.array(Peer).default([]),
  mtu: z.number().default(1408),
  share: z.boolean().default(false)
});

const IdPathParamsSchema = z.object({
  id: z.string().transform(val => parseInt(val))
});


// Create endpoint
api_router.add(
  "POST", "/endpoints/wireguard",
  async ({ body, db, token_payload }) => {
    const endpoint = await db.insert(EndpointWireguards).values({
      owner: parseInt(token_payload?.sub || '0'),
      name: body.name,
      system: body.system,
      addresses: JSON.stringify(body.addresses),
      private_key: body.private_key,
      public_key: body.public_key,
      preshared_key: body.preshared_key,
      peers: JSON.stringify(body.peers),
      mtu: body.mtu,
      share: body.share
    }).returning();

    return Response.json(endpoint[0], { status: 201 });
  },
  {
    bodySchema: CreateWireguardBody,
    allowedRoles: ["authenticated"]
  }
);

// Get all endpoints for current user
api_router.add(
  "GET", "/endpoints/wireguard",
  async ({ db, token_payload }) => {
    const user_id = parseInt(token_payload?.sub || '0');
    const endpoints = await db
      .select()
      .from(EndpointWireguards)
      .where(
        eq(EndpointWireguards.owner, user_id)
      );

    // Parse JSON fields
    const parsedEndpoints = endpoints.map(endpoint => ({
      ...endpoint,
      addresses: JSON.parse(endpoint.addresses as string),
      peers: JSON.parse(endpoint.peers as string)
    }));

    return Response.json(parsedEndpoints);
  },
  {
    allowedRoles: ["authenticated"]
  }
);

// Get specific endpoint by ID
api_router.add(
  "GET", "/endpoints/wireguard/:id",
  async ({ path_params, db, token_payload }) => {
    const user_id = parseInt(token_payload?.sub || '0');
    const endpoint = await db
      .select()
      .from(EndpointWireguards)
      .where(
        and(
          eq(EndpointWireguards.id, path_params.id),
          eq(EndpointWireguards.owner, user_id)
        )
      )
      .get();

    if (!endpoint) {
      return new Response("Endpoint not found", { status: 404 });
    }

    // Parse JSON fields
    const parsedEndpoint = {
      ...endpoint,
      addresses: JSON.parse(endpoint.addresses as string),
      peers: JSON.parse(endpoint.peers as string)
    };

    return Response.json(parsedEndpoint);
  },
  {
    pathParamsSchema: IdPathParamsSchema,
    allowedRoles: ["authenticated"]
  }
);

// Update endpoint
const UpdateWireguardBody = CreateWireguardBody.partial();
api_router.add(
  "PUT", "/endpoints/wireguard/:id",
  async ({ path_params, body, db, token_payload }) => {
    const user_id = parseInt(token_payload?.sub || '0');

    const updated = await db.update(EndpointWireguards).set({
        ...body
    }).where(
        and(
            eq(EndpointWireguards.id, path_params.id),
            eq(EndpointWireguards.owner, user_id)
        )
    ).returning();

    return Response.json(updated[0]);
  },
  {
    pathParamsSchema: IdPathParamsSchema,
    bodySchema: UpdateWireguardBody,
    allowedRoles: ["authenticated"]
  }
);

// Delete endpoint
api_router.add(
  "DELETE", "/api/endpoints/wireguard/:id",
  async ({ path_params, db, token_payload }) => {
    const user_Id = parseInt(token_payload?.sub || '0');

    await db.delete(EndpointWireguards).where(eq(EndpointWireguards.id, path_params.id));

    return new Response("", { status: 204 });
  },
  {
    pathParamsSchema: IdPathParamsSchema,
    allowedRoles: ["authenticated"]
  }
);

// Export endpoint to Sing-Box format
const GetEndpointExportQuery = z.object({
  type: z.enum(['sing-box']).default('sing-box')
})
api_router.add(
  "GET", "/api/endpoints/wireguard/:id/export",
  async ({ path_params, db, token_payload, query_params }) => {
    const user_id = parseInt(token_payload?.sub || '0');
    
    // Get endpoint - user must be owner or endpoint must be shared
    const endpoint = await db
      .select()
      .from(EndpointWireguards)
      .where(
        and(
            eq(EndpointWireguards.id, path_params.id),
            or(
                eq(EndpointWireguards.owner, user_id),
                eq(EndpointWireguards.share, true)
            )
        )
      )
      .get();
    if (!endpoint) {
      return new Response("Endpoint not found", { status: 404 });
    }

    // Parse JSON fields
    const addresses = JSON.parse(endpoint.addresses as string);
    const peers = JSON.parse(endpoint.peers as string);

    // Build Sing-Box configuration
    if (query_params.type === 'sing-box') {
        return Response.json({
            type: "wireguard",
            tag: `wg.${endpoint.name}`,
            system: endpoint.system,
            name: endpoint.name,
            mtu: endpoint.mtu,
            address: addresses,
            peers: peers,
            private_key: endpoint.private_key
        })
    }
    else {
        return new Response("Unsupported export type", { status: 400 });
    }
  },
  {
    pathParamsSchema: IdPathParamsSchema,
    queryParamsSchema: GetEndpointExportQuery,
    allowedRoles: ["authenticated"],
});

