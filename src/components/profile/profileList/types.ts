export interface Profile {
  id: number
  created_by: number
  name: string
  tags: string[]
  outbounds: number[]
  rule_sets: number[]
}

export interface Props {
  profiles?: Profile[]
  loading?: boolean
  exportMode?: boolean
}

export interface ExportOptions {
  type: 'sing-box'
}

export interface SelectOption {
  title: string
  value: string
}

// Export type options
export const exportTypeOptions: SelectOption[] = [
  { title: 'Sing-Box', value: 'sing-box' }
]
