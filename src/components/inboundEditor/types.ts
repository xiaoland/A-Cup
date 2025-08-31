export interface Inbound {
  id?: number
  owner?: number
  share: boolean
  type: string
  address?: string
  port?: number
  stack?: string
  mtu?: number
  auto_route?: boolean
  auto_redirect?: boolean
  strict_route?: boolean
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
  { title: 'Mixed (SOCKS5 + HTTP)', value: 'mixed' },
  { title: 'SOCKS5', value: 'socks' },
  { title: 'HTTP', value: 'http' },
  { title: 'TUN', value: 'tun' },
  { title: 'Redirect', value: 'redirect' },
  { title: 'TProxy', value: 'tproxy' }
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
