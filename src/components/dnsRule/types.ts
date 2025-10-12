export interface DNSRule {
  id?: number
  owner?: number
  // removed from UI; kept optional for backward compatibility if present in API
  share?: boolean
  name: string
  action?: string
  server: number
  domains?: string[]
  domain_suffixes?: string[]
  domain_keywords?: string[]
  rule_sets?: number[]
}

export interface Props {
  dnsRule?: DNSRule
  mode?: 'create' | 'edit'
  // List of available servers passed from parent (required)
  dnsServers: any[]
}

export interface SelectOption {
  title: string
  value: string | number
}

// Action options for DNS rules
export const actionOptions: SelectOption[] = [
  { title: 'Route', value: 'route' },
  { title: 'Reject', value: 'reject' }
]
