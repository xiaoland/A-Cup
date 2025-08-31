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
  encryption?: string  // Legacy field for backward compatibility
  method?: string      // SingBox encryption method
  security?: string    // SingBox security/encryption type
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

// SingBox encryption method options
export const methodOptions: SelectOption[] = [
  { title: 'AES-128-GCM', value: 'aes-128-gcm' },
  { title: 'AES-256-GCM', value: 'aes-256-gcm' },
  { title: 'ChaCha20-Poly1305', value: 'chacha20-poly1305' },
  { title: 'XChaCha20-Poly1305', value: 'xchacha20-poly1305' },
  { title: '2022-Blake3-AES-128-GCM', value: '2022-blake3-aes-128-gcm' },
  { title: '2022-Blake3-AES-256-GCM', value: '2022-blake3-aes-256-gcm' },
  { title: '2022-Blake3-ChaCha20-Poly1305', value: '2022-blake3-chacha20-poly1305' }
]

// SingBox security type options
export const securityOptions: SelectOption[] = [
  { title: 'None', value: 'none' },
  { title: 'Auto', value: 'auto' },
  { title: 'AES-128-GCM', value: 'aes-128-gcm' },
  { title: 'AES-128-CFB', value: 'aes-128-cfb' },
  { title: 'ChaCha20-Poly1305', value: 'chacha20-poly1305' },
  { title: 'Zero', value: 'zero' }
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
