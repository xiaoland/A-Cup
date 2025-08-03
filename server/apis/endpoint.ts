import { eq, and, or } from "drizzle-orm";
import { z } from "zod";
import { Router } from "../fund/router";
import { EndpointWireguards } from "../db/schema";
import { DrizzleD1Database } from 'drizzle-orm/d1';
import { WireguardEndpointInSingBoxSchema, type WireguardEndpointInSingBox } from '../schemas/export';

export const ENDPOINT_ROUTER = new Router('/endpoints');

// Export function for WireGuard endpoints to sing-box format
export async function exportWireguardEndpoint(db: DrizzleD1Database, id: number, type: "sing-box" = "sing-box"): Promise<WireguardEndpointInSingBox | null> {
  const endpoints = await db.select().from(EndpointWireguards).where(eq(EndpointWireguards.id, id)).limit(1);
  if (endpoints.length === 0) return null;
  
  const endpoint = endpoints[0];
  
  // Build peers with referenced endpoint data
  const peers = [];
  for (const peer of endpoint.peers as any[]) {
    const peerData: any = {
      server: peer.address,
      server_port: peer.port,
      allowed_ips: peer.allowed_ips
    };

    // If peer has an id reference, fetch the public key and preshared key
    if (peer.id) {
      const referencedEndpoints = await db.select().from(EndpointWireguards)
        .where(eq(EndpointWireguards.id, peer.id))
        .limit(1);
      
      if (referencedEndpoints.length > 0) {
        peerData.public_key = referencedEndpoints[0].public_key;
        if (referencedEndpoints[0].preshared_key) {
          peerData.pre_shared_key = referencedEndpoints[0].preshared_key;
        }
      }
    }

    peers.push(peerData);
  }

  const config: WireguardEndpointInSingBox = {
    type: "wireguard",
    tag: `wg.${endpoint.name || endpoint.id}`,
    system_interface: endpoint.system,
    interface_name: endpoint.name,
    local_address: endpoint.addresses as string[],
    private_key: endpoint.private_key,
    peers: peers
  };

  if (endpoint.mtu) config.mtu = endpoint.mtu;
  if (endpoint.preshared_key) config.pre_shared_key = endpoint.preshared_key;

  // Validate result with Zod schema
  return WireguardEndpointInSingBoxSchema.parse(config);
}

// Schemas for validation
const Peer = z.object({
  id: z.number().optional(),
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
ENDPOINT_ROUTER.add(
  "POST", "/wireguard",
  async ({ body, db, token_payload }) => {
    const endpoint = await db.insert(EndpointWireguards).values({
      owner: parseInt((token_payload?.sub || '0').toString()),
      name: body.name,
      system: body.system,
      addresses: body.addresses,
      private_key: body.private_key,
      public_key: body.public_key,
      preshared_key: body.preshared_key,
      peers: body.peers,
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

// Get all endpoints for current user (including shared ones)
ENDPOINT_ROUTER.add(
  "GET", "",
  async ({ db, token_payload }) => {
    const user_id = parseInt((token_payload?.sub || '0').toString());
    const endpoints = await db
      .select()
      .from(EndpointWireguards)
      .where(
        or(
          eq(EndpointWireguards.owner, user_id),
          eq(EndpointWireguards.share, true)
        )
      );

    // Add type information for frontend
    const typedEndpoints = endpoints.map(endpoint => ({
      ...endpoint,
      type: 'wireguard'
    }));

    return Response.json(typedEndpoints);
  },
  {
    allowedRoles: ["authenticated"]
  }
);

// Get specific endpoint by ID
ENDPOINT_ROUTER.add(
  "GET", "/wireguard/:id",
  async ({ path_params, db, token_payload }) => {
    const user_id = parseInt((token_payload?.sub || '0').toString());
    const endpoints = await db
      .select()
      .from(EndpointWireguards)
      .where(
        and(
          eq(EndpointWireguards.id, path_params.id),
          eq(EndpointWireguards.owner, user_id)
        )
      )
      .limit(1);

    if (endpoints.length === 0) {
      return new Response("Endpoint not found", { status: 404 });
    }

    return Response.json(endpoints[0]);
  },
  {
    pathParamsSchema: IdPathParamsSchema,
    allowedRoles: ["authenticated"]
  }
);

// Update endpoint
const UpdateWireguardBody = CreateWireguardBody.partial();
ENDPOINT_ROUTER.add(
  "PATCH", "/wireguard/:id",
  async ({ path_params, body, db, token_payload }) => {
    const user_id = parseInt((token_payload?.sub || '0').toString());

    // Check ownership first
    const existing = await db.select().from(EndpointWireguards).where(
      and(
        eq(EndpointWireguards.id, path_params.id),
        eq(EndpointWireguards.owner, user_id)
      )
    ).limit(1);

    if (existing.length === 0) {
      return new Response("Endpoint not found", { status: 404 });
    }

    const updated = await db.update(EndpointWireguards)
      .set(body)
      .where(eq(EndpointWireguards.id, path_params.id))
      .returning();

    return Response.json(updated[0]);
  },
  {
    pathParamsSchema: IdPathParamsSchema,
    bodySchema: UpdateWireguardBody,
    allowedRoles: ["authenticated"]
  }
);

// Delete endpoint
ENDPOINT_ROUTER.add(
  "DELETE", "/wireguard/:id",
  async ({ path_params, db, token_payload }) => {
    const user_id = parseInt((token_payload?.sub || '0').toString());

    // Check ownership first
    const existing = await db.select().from(EndpointWireguards).where(
      and(
        eq(EndpointWireguards.id, path_params.id),
        eq(EndpointWireguards.owner, user_id)
      )
    ).limit(1);

    if (existing.length === 0) {
      return new Response("Endpoint not found", { status: 404 });
    }

    await db.delete(EndpointWireguards).where(eq(EndpointWireguards.id, path_params.id));

    return new Response("", { status: 204 });
  },
  {
    pathParamsSchema: IdPathParamsSchema,
    allowedRoles: ["authenticated"]
  }
);
