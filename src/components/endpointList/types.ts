export interface Endpoint {
  id: number
  owner: number
  share: boolean
  name: string
  type: string
  // Type-specific properties will vary
  [key: string]: any
}

export interface WireguardEndpoint extends Endpoint {
  system: boolean
  addresses: string[]
  private_key: string
  public_key: string
  preshared_key?: string
  peers: Array<{
    id?: number
    address: string
    port: number
    allowed_ips: string[]
  }>
  mtu?: number
}

export interface Props {
  endpoints?: Endpoint[]
  loading?: boolean
}

export interface EmitEvents {
  edit: [endpoint: Endpoint]
  delete: [endpoint: Endpoint]
  export: [endpoint: Endpoint, format: string]
  refresh: []
}

export type ExportFormat = 'sing-box'

export const exportFormats: Array<{ title: string; value: ExportFormat }> = [
  { title: 'Sing-Box', value: 'sing-box' }
]

export const getEndpointTypeIcon = (type: string): string => {
  switch (type) {
    case 'wireguard':
      return 'mdi-vpn'
    default:
      return 'mdi-network'
  }
}

export const getEndpointTypeColor = (type: string): string => {
  switch (type) {
    case 'wireguard':
      return 'primary'
    default:
      return 'grey'
  }
}
