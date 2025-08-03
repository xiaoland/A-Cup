export interface Profile {
  id?: number
  created_by?: number
  name: string
  tags: string[]
  inbounds: number[]
  outbounds: number[]
  route_final?: number
  wg_endpoints: number[]
  rules: number[]
  rule_sets: number[]
  dns_rules: number[]
  dns: number[]
}

export interface Props {
  profile?: Profile
  mode?: 'create' | 'edit'
}

export interface SelectOption {
  title: string
  value: string | number
}

// Available tags for profiles
export const profileTagOptions: SelectOption[] = [
  { title: 'Mobile', value: 'mobile' },
  { title: 'Desktop', value: 'desktop' },
  { title: 'Router', value: 'router' },
  { title: 'Server', value: 'server' },
  { title: 'Gaming', value: 'gaming' },
  { title: 'Work', value: 'work' },
  { title: 'Personal', value: 'personal' }
]

// Mock data interfaces for referenced entities
export interface Inbound {
  id: number
  type: string
  address?: string
  port?: number
}

export interface Outbound {
  id: number
  type: string
  name?: string
  region?: string
  address?: string
  port?: number
}

export interface WireguardEndpoint {
  id: number
  name: string
  system: boolean
}

export interface RouteRule {
  id: number
  name: string
  action: string
}

export interface RuleSet {
  id: number
  name: string
  type: string
}

export interface DNSRule {
  id: number
  name: string
  action?: string
}

export interface DNSServer {
  id: number
  name: string
  type: string
  address: string
  port: number
}
