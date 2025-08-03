export interface DNSRule {
  id: number
  owner: number
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
  // Add any props if needed in the future
}
