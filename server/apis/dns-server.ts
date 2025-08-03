import { z } from 'zod';
import { Router } from '../fund/router';
import { DNSServers, Outbounds, EndpointWireguards } from '../db/schema';
import { eq, and, or } from 'drizzle-orm';
import { DrizzleD1Database } from 'drizzle-orm/d1';
import { DNSServerInSingBoxSchema, type DNSServerInSingBox } from '../schemas/export';
import { exportOutbound } from './outbound';
import { exportWireguardEndpoint } from './endpoint';

export const DNS_SERVER_ROUTER = new Router('/dns_servers');

// Export function for DNS servers to sing-box format
export async function exportDNSServer(db: DrizzleD1Database, id: number, type: "sing-box" = "sing-box"): Promise<DNSServerInSingBox | null> {
  const dnsServers = await db.select().from(DNSServers).where(eq(DNSServers.id, id)).limit(1);
  if (dnsServers.length === 0) return null;
  
  const dnsServer = dnsServers[0];
  let address = dnsServer.address;
  
  // Format address based on DNS server type
  if (dnsServer.type === 'https') {
    address = `https://${dnsServer.address}${dnsServer.port ? `:${dnsServer.port}` : ''}/dns-query`;
  } else if (dnsServer.type === 'tls') {
    address = `tls://${dnsServer.address}${dnsServer.port ? `:${dnsServer.port}` : ''}`;
  } else {
    address = `${dnsServer.address}${dnsServer.port ? `:${dnsServer.port}` : ''}`;
  }

  const config: DNSServerInSingBox = {
    tag: `dns.${dnsServer.type}.${dnsServer.id}`,
    address: address
  };

  // Handle detour - prefer outbound_detour over wg_endpoint_detour
  if (dnsServer.outbound_detour) {
    // Use outbound export function to get proper tag
    const outboundConfig = await exportOutbound(db, dnsServer.outbound_detour);
    if (outboundConfig) {
      config.detour = outboundConfig.tag;
    }
  } else if (dnsServer.wg_endpoint_detour) {
    // Use WireGuard endpoint export function to get proper tag
    const wgEndpointConfig = await exportWireguardEndpoint(db, dnsServer.wg_endpoint_detour);
    if (wgEndpointConfig) {
      config.detour = wgEndpointConfig.tag;
    }
  }

  // Validate result with Zod schema
  return DNSServerInSingBoxSchema.parse(config);
}

const HTTPSOptionsSchema = z.object({
  path: z.string().optional(),
  headers: z.record(z.string(), z.string()).optional()
}).optional();

const TLSOptionsSchema = z.object({
  enabled: z.boolean().optional(),
  server_name: z.string().optional(),
  insecure: z.boolean().optional()
}).optional();

const BaseDNSServerSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['udp', 'https', 'http3', 'quic', 'tls']),
  address: z.string().min(1),
  port: z.number().int().positive().optional().nullable(),
  outbound_detour: z.number().int().positive().optional().nullable(),
  wg_endpoint_detour: z.number().int().positive().optional().nullable(),
  tls: TLSOptionsSchema,
  https: HTTPSOptionsSchema,
  share: z.boolean().default(false)
});

const CreateDNSServerSchema = BaseDNSServerSchema.transform((data) => {
  // Auto-assign default ports based on type
  if (!data.port) {
    switch (data.type) {
      case 'udp':
        data.port = 53;
        break;
      case 'https':
      case 'http3':
      case 'quic':
        data.port = 443;
        break;
      case 'tls':
        data.port = 853;
        break;
    }
  }
  return data;
});

const IDPathParamSchema = z.object({
  id: z.string().transform(val => parseInt(val))
});

// Create DNS Server
DNS_SERVER_ROUTER.add('POST', '', async ({ body, db, token_payload }) => {
  const user_id = parseInt((token_payload?.sub || '0').toString());

  // Validate outbound detour exists and is accessible if provided
  if (body.outbound_detour) {
    const outbound = await db.select().from(Outbounds).where(
      and(
        eq(Outbounds.id, body.outbound_detour),
        or(
          eq(Outbounds.owner, user_id),
          eq(Outbounds.share, true)
        )
      )
    ).limit(1);
    
    if (outbound.length === 0) {
      return new Response('Referenced outbound detour not found or not accessible', { status: 400 });
    }
  }

  // Validate WireGuard endpoint detour exists and is accessible if provided
  if (body.wg_endpoint_detour) {
    const wg_endpoint = await db.select().from(EndpointWireguards).where(
      and(
        eq(EndpointWireguards.id, body.wg_endpoint_detour),
        or(
          eq(EndpointWireguards.owner, user_id),
          eq(EndpointWireguards.share, true)
        )
      )
    ).limit(1);
    
    if (wg_endpoint.length === 0) {
      return new Response('Referenced WireGuard endpoint detour not found or not accessible', { status: 400 });
    }
  }

  // Validate that only one detour type is provided
  if (body.outbound_detour && body.wg_endpoint_detour) {
    return new Response('Cannot specify both outbound_detour and wg_endpoint_detour', { status: 400 });
  }

  const result = await db.insert(DNSServers).values({
    owner: user_id,
    name: body.name,
    type: body.type,
    address: body.address,
    port: body.port || null,
    outbound_detour: body.outbound_detour || null,
    wg_endpoint_detour: body.wg_endpoint_detour || null,
    tls: body.tls ? JSON.stringify(body.tls) : null,
    https: body.https ? JSON.stringify(body.https) : null,
    share: body.share
  }).returning();

  return Response.json(result[0], { status: 201 });
}, {
  bodySchema: CreateDNSServerSchema,
  allowedRoles: ['authenticated']
});

// Edit DNS Server
const EditDNSServerSchema = BaseDNSServerSchema.partial();
DNS_SERVER_ROUTER.add('PUT', '/:id', async ({ path_params, body, db, token_payload }) => {
  const current_user = parseInt((token_payload?.sub || '0').toString());
  const dns_server_id = path_params.id;

  // Check ownership
  const existing = await db.select().from(DNSServers).where(eq(DNSServers.id, dns_server_id)).limit(1);
  if (existing.length === 0) {
    return new Response('DNS Server not found', { status: 404 });
  }
  if (existing[0].owner !== current_user) {
    return new Response('Forbidden', { status: 403 });
  }

  // Validate outbound detour exists and is accessible if provided (and not null)
  if (body.outbound_detour !== null && body.outbound_detour !== undefined) {
    const outbound = await db.select().from(Outbounds).where(
      and(
        eq(Outbounds.id, body.outbound_detour),
        or(
          eq(Outbounds.owner, current_user),
          eq(Outbounds.share, true)
        )
      )
    ).limit(1);
    
    if (outbound.length === 0) {
      return new Response('Referenced outbound detour not found or not accessible', { status: 400 });
    }
  }

  // Validate WireGuard endpoint detour exists and is accessible if provided (and not null)
  if (body.wg_endpoint_detour !== null && body.wg_endpoint_detour !== undefined) {
    const wg_endpoint = await db.select().from(EndpointWireguards).where(
      and(
        eq(EndpointWireguards.id, body.wg_endpoint_detour),
        or(
          eq(EndpointWireguards.owner, current_user),
          eq(EndpointWireguards.share, true)
        )
      )
    ).limit(1);
    
    if (wg_endpoint.length === 0) {
      return new Response('Referenced WireGuard endpoint detour not found or not accessible', { status: 400 });
    }
  }

  // Validate that only one detour type is provided (both cannot be non-null/non-undefined)
  if (body.outbound_detour !== null && body.outbound_detour !== undefined && 
      body.wg_endpoint_detour !== null && body.wg_endpoint_detour !== undefined) {
    return new Response('Cannot specify both outbound_detour and wg_endpoint_detour', { status: 400 });
  }

  const updateData: any = { ...body };
  if (updateData.tls) {
    updateData.tls = JSON.stringify(updateData.tls);
  }
  if (updateData.https) {
    updateData.https = JSON.stringify(updateData.https);
  }

  const result = await db.update(DNSServers)
    .set(updateData)
    .where(eq(DNSServers.id, dns_server_id))
    .returning();

  return Response.json(result[0]);
}, {
  pathParamsSchema: IDPathParamSchema,
  bodySchema: EditDNSServerSchema,
  allowedRoles: ['authenticated']
});

// Get DNS Server by ID
DNS_SERVER_ROUTER.add('GET', '/:id', async ({ path_params, db, token_payload }) => {
  const user_id = parseInt((token_payload?.sub || '0').toString());
  const dns_server_id = path_params.id;

  // Check access (owner or shared)
  const dns_servers = await db.select().from(DNSServers).where(
    and(
      eq(DNSServers.id, dns_server_id),
      eq(DNSServers.owner, user_id)
    )
  ).limit(1);
  
  if (dns_servers.length === 0) {
    return new Response('DNS Server not found', { status: 404 });
  }

  const dns_server = dns_servers[0];
  
  // Parse JSON fields
  const response: any = { ...dns_server };
  if (response.tls) {
    try {
      response.tls = JSON.parse(response.tls);
    } catch (e) {
      response.tls = null;
    }
  }
  if (response.https) {
    try {
      response.https = JSON.parse(response.https);
    } catch (e) {
      response.https = null;
    }
  }

  return Response.json(response);
}, {
  pathParamsSchema: IDPathParamSchema,
  allowedRoles: ['authenticated']
});

// List DNS Servers (owned or shared)
DNS_SERVER_ROUTER.add('GET', '', async ({ db, token_payload }) => {
  const user_id = parseInt((token_payload?.sub || '0').toString());

  const result = await db.select()
    .from(DNSServers)
    .where(
      or(
        eq(DNSServers.owner, user_id),
        eq(DNSServers.share, true)
      )
    );

  // Parse JSON fields for all results
  const parsed_result = result.map(dns_server => {
    const response: any = { ...dns_server };
    if (response.tls) {
      try {
        response.tls = JSON.parse(response.tls);
      } catch (e) {
        response.tls = null;
      }
    }
    if (response.https) {
      try {
        response.https = JSON.parse(response.https);
      } catch (e) {
        response.https = null;
      }
    }
    return response;
  });

  return Response.json(parsed_result);
}, {
  allowedRoles: ['authenticated']
});

// Delete DNS Server
DNS_SERVER_ROUTER.add('DELETE', '/:id', async ({ path_params, db, token_payload }) => {
  const user_id = parseInt((token_payload?.sub || '0').toString());
  const dns_server_id = path_params.id;

  // Check ownership
  const existing = await db.select().from(DNSServers).where(
    and(
      eq(DNSServers.id, dns_server_id),
      eq(DNSServers.owner, user_id)
    )
  ).limit(1);
  
  if (existing.length === 0) {
    return new Response('DNS Server not found', { status: 404 });
  }

  await db.delete(DNSServers).where(eq(DNSServers.id, dns_server_id));
  return new Response('', { status: 204 });
}, {
  pathParamsSchema: IDPathParamSchema,
  allowedRoles: ['authenticated']
});
