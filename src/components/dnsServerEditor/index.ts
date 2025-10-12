export interface DNSServer {
  id?: number
  owner?: number
  share?: boolean
  name: string
  type: string
  address: string
  port?: number | null
  outbound_detour?: number | null
  wg_endpoint_detour?: number | null
  tls?: {
    enabled?: boolean
    server_name?: string
    insecure?: boolean
  }
  https?: {
    path?: string
    headers?: Record<string, string>
  }
}
