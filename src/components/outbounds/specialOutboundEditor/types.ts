import type { SpecialOutbound } from '@/types/outbound'

export type { SpecialOutbound }

export interface SelectOption<T extends string = string> {
  title: string
  value: T
}

export const typeOptions: SelectOption[] = [
  { title: 'URL Test', value: 'urltest' },
  { title: 'Selector', value: 'selector' },
  { title: 'Direct', value: 'direct' },
]
