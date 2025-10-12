export interface RuleSet {
  id?: number
  owner?: number
  share: boolean
  type: string
  name: string
  rules?: any[] // array of headless rule objects
  url?: string
}

export interface Props {
  ruleSet?: RuleSet
  mode?: 'create' | 'edit'
}

export interface SelectOption {
  title: string
  value: string
}

// Type options for rule set types
export const typeOptions: SelectOption[] = [
  { title: 'Remote File', value: 'remote' },
  { title: 'Inline Rules', value: 'inline' }
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

// Example rule structure for inline rules
export interface HeadlessRule {
  domain?: string
  domain_suffix?: string
  domain_keyword?: string
  domain_regex?: string
  ip_cidr?: string[]
  port?: number[]
  port_range?: string[]
  process_name?: string[]
  package_name?: string[]
}
