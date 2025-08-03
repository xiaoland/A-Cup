export interface RuleSet {
  id: number
  owner: number
  share: boolean
  type: string
  name: string
  rules?: any[]
  url?: string
}

export interface Props {
  // Add any props if needed
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
