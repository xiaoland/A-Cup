export interface Inbound {
  id?: number
  owner?: number
  share: boolean
  type: string
  address?: string
  port?: number
  stack?: string
  mtu?: number
}

export interface Props {
  inbound?: Inbound
  mode?: 'create' | 'edit'
}

export interface SelectOption {
  title: string
  value: string
}

// Type options for inbound types
export const typeOptions: SelectOption[] = [
  { title: 'Mixed', value: 'mixed' },
  { title: 'TUN', value: 'tun' }
]

// Stack options for TUN inbounds
export const stackOptions: SelectOption[] = [
  { title: 'System (best performance)', value: 'system' },
  { title: 'gVisor (best compatibility)', value: 'gvisor' },
  { title: 'Mixed (TCP system, UDP gVisor)', value: 'mixed' }
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
