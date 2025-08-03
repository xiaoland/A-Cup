export interface WireguardEndpoint {
  id?: number
  owner?: number
  share: boolean
  name: string
  system: boolean
  addresses: string[]
  private_key: string
  public_key: string
  preshared_key?: string
  peers: Peer[]
  mtu?: number
  type?: string
}

export interface Peer {
  id?: number
  address: string
  port: number
  allowed_ips: string[]
  newAllowedIp?: string // Add this for editing
}

export interface Props {
  endpoint?: WireguardEndpoint
  mode?: 'create' | 'edit'
}

export interface SelectOption {
  title: string
  value: string | boolean
}

// Export type options
export type ExportType = 'sing-box'

export interface ExportTypeOption {
  title: string
  value: ExportType
}

export const exportTypes: ExportTypeOption[] = [
  { title: 'Sing-Box', value: 'sing-box' }
]

// Helper functions for IP address validation
export const isValidIPv4 = (ip: string): boolean => {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  return ipv4Regex.test(ip)
}

export const isValidIPv6 = (ip: string): boolean => {
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/
  return ipv6Regex.test(ip)
}

export const isValidCIDR = (cidr: string): boolean => {
  const parts = cidr.split('/')
  if (parts.length !== 2) return false
  
  const ip = parts[0]
  const prefix = parseInt(parts[1])
  
  if (isValidIPv4(ip)) {
    return prefix >= 0 && prefix <= 32
  } else if (isValidIPv6(ip)) {
    return prefix >= 0 && prefix <= 128
  }
  
  return false
}

// WireGuard key validation (base64 44 characters)
export const isValidWireguardKey = (key: string): boolean => {
  const keyRegex = /^[A-Za-z0-9+/]{42}[A-Za-z0-9+/=]{2}$/
  return keyRegex.test(key)
}
