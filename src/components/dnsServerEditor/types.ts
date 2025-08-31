export interface DNSServer {
  id?: number
  owner?: number
  share: boolean
  name: string
  type: string
  address: string
  port?: number | null
  outbound_detour?: number | null
  wg_endpoint_detour?: number | null
  tls?: TLSOptions
  https?: HTTPSOptions
}

export interface TLSOptions {
  enabled?: boolean
  server_name?: string
  insecure?: boolean
}

export interface HTTPSOptions {
  path?: string
  headers?: Record<string, string>
}

export interface Props {
  dnsServer?: DNSServer
  mode?: 'create' | 'edit'
}

export interface SelectOption {
  title: string
  value: string | number
}

// Type options for DNS server types
export const typeOptions: SelectOption[] = [
  { title: 'UDP', value: 'udp' },
  { title: 'HTTPS', value: 'https' },
  { title: 'HTTP/3', value: 'http3' },
  { title: 'QUIC', value: 'quic' },
  { title: 'TLS', value: 'tls' }
]

// Default ports by type
export const DEFAULT_PORTS: Record<string, number> = {
  udp: 53,
  https: 443,
  http3: 443,
  quic: 443,
  tls: 853
}
