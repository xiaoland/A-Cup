export interface DNSServer {
  id: number
  owner: number
  share: boolean
  name: string
  type: string
  address: string
  port?: number | null
  outbound_detour?: number | null
  wg_endpoint_detour?: number | null
  tls?: any
  https?: any
}

export interface Props {
  // Add any props if needed in the future
}
