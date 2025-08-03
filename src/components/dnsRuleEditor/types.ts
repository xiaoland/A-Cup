export interface DNSRule {
  id?: number
  owner?: number
  share: boolean
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
