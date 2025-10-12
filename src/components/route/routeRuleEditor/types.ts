export interface RouteRule {
  id?: number
  owner?: number
  share: boolean
  name: string
  action: 'route' | 'reject'
  outbound?: number
  domains?: string[]
  domain_suffixes?: string[]
  domain_keywords?: string[]
  domain_regexes?: string[]
  rule_sets?: number[]
}

export interface Props {
  routeRule?: RouteRule
  mode?: 'create' | 'edit'
}

export interface SelectOption {
  title: string
  value: string
}

export interface OutboundSelectItem {
  title: string
  value: number | undefined
}

// Action options for route rules
export const actionOptions: SelectOption[] = [
  { title: 'Route', value: 'route' },
  { title: 'Reject', value: 'reject' }
]

// Export type options
export type ExportType = 'sing-box'

export interface ExportTypeOption {
  title: string
  value: ExportType
}

export const exportTypes: ExportTypeOption[] = [
  { title: 'Sing-Box', value: 'sing-box' }
]
