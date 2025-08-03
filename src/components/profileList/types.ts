export interface Profile {
  id: number
  created_by: number
  name: string
  tags: string[]
  inbounds: number[]
  outbounds: number[]
  wg_endpoints: number[]
  rules: number[]
  rule_sets: number[]
  dns_rules: number[]
  dns: number[]
}

export interface Props {
  profiles?: Profile[]
  loading?: boolean
  exportMode?: boolean
}

export interface ExportOptions {
  type: 'sing-box'
  method: 'oss' | 'direct'
}

export interface SelectOption {
  title: string
  value: string
}

// Export type options
export const exportTypeOptions: SelectOption[] = [
  { title: 'Sing-Box', value: 'sing-box' }
]

// Export method options  
export const exportMethodOptions: SelectOption[] = [
  { title: 'Object Storage (OSS)', value: 'oss' },
  { title: 'Direct Download', value: 'direct' }
]
