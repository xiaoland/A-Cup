// Re-export shared types from inboundEditor
export type {
  Inbound,
  SelectOption
} from '../inboundEditor/types'

export {
  typeOptions,
  stackOptions,
  exportTypes
} from '../inboundEditor/types'

// Import for local use
import type { Inbound } from '../inboundEditor/types'

// Export type options
export type ExportType = 'sing-box'

export interface ExportTypeOption {
  title: string
  value: ExportType
}

// Props interface for inboundList component
export interface Props {
  // Currently no props needed, but prepared for future use
}

// Events interface for inboundList component
export interface Events {
  'edit-inbound': [inbound: Inbound]
  'create-inbound': []
  'delete-inbound': [inbound: Inbound]
  'export-inbound': [inbound: Inbound]
}
