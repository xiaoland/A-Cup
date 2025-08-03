export interface Outbound {
  id?: number
  owner?: number
  share: boolean
  name?: string
  type: string
  outbounds: number[]
  region?: string
  address?: string
  port?: number
  network?: string
  encryption?: string
  packet_encoding?: string
  uuid?: string
  password?: string
  alter_id?: number
  flow?: string
  transport?: any
  tls?: any
}

export interface Props {
  outbound?: Outbound
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

// Type options for outbound types
export const typeOptions: SelectOption[] = [
  { title: 'Direct', value: 'direct' },
  { title: 'URL Test', value: 'urltest' },
  { title: 'Selector', value: 'selector' },
  { title: 'VMess', value: 'vmess' },
  { title: 'VLESS', value: 'vless' },
  { title: 'Shadowsocks', value: 'ss' },
  { title: 'Hysteria2', value: 'hysteria2' }
]

// Region options for server locations
export const regionOptions: SelectOption[] = [
  { title: 'Guangdong, China', value: 'gd' },
  { title: 'Hong Kong, China', value: 'hk' },
  { title: 'Singapore', value: 'sgp' },
  { title: 'Osaka, Japan', value: 'osk' },
  { title: 'Tokyo, Japan', value: 'tky' },
  { title: 'Los Angeles, USA', value: 'la' },
  { title: 'Las Vegas, USA', value: 'lv' }
]

// Network protocol options
export const networkOptions: SelectOption[] = [
  { title: 'TCP', value: 'tcp' },
  { title: 'UDP', value: 'udp' }
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
