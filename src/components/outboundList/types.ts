// Re-export shared types from outboundEditor
export type {
  Outbound,
  SelectOption,
  OutboundSelectItem
} from '../outboundEditor/types'

export {
  typeOptions,
  regionOptions,
  networkOptions
} from '../outboundEditor/types'

// Import for local use
import type { Outbound } from '../outboundEditor/types'

// Export type options
export type ExportType = 'sing-box'

export interface ExportTypeOption {
  title: string
  value: ExportType
}

export const exportTypes: ExportTypeOption[] = [
  { title: 'Sing-Box', value: 'sing-box' }
]

// Props interface for outboundList component
export interface Props {
  // Currently no props needed, but prepared for future use
}

// Events interface for outboundList component
export interface Events {
  'edit-outbound': [outbound: Outbound]
  'create-outbound': []
  'delete-outbound': [outbound: Outbound]
  'export-outbound': [outbound: Outbound]
}
