import type { Outbound } from '@/types/outbound'

export type { Outbound }

export interface SelectOption<T extends string = string> {
  title: string
  value: T
}

export const typeOptions: SelectOption[] = [
  { title: 'URL Test', value: 'urltest' },
  { title: 'Selector', value: 'selector' },
  { title: 'VMess', value: 'vmess' },
  { title: 'VLESS', value: 'vless' },
  { title: 'Shadowsocks', value: 'shadowsocks' },
  { title: 'Hysteria2', value: 'hysteria2' },
]

export const regionOptions: SelectOption[] = [
  { title: 'Guangdong', value: 'gd' },
  { title: 'Hong Kong', value: 'hk' },
  { title: 'Singapore', value: 'sgp' },
  { title: 'Osaka', value: 'osk' },
  { title: 'Tokyo', value: 'tky' },
  { title: 'Los Angeles', value: 'la' },
  { title: 'Las Vegas', value: 'lv' },
]

export const networkOptions: SelectOption[] = [
  { title: 'TCP', value: 'tcp' },
  { title: 'UDP', value: 'udp' },
]