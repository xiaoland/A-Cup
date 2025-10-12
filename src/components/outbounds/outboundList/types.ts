// Re-export shared types from outboundEditor
// export type {
//   Outbound,
//   SelectOption,
//   OutboundSelectItem
// } from '../outbounds/outboundEditor/types' // TODO: Uncomment when implemented

// export {
//   typeOptions,
//   regionOptions,
//   networkOptions
// } from '../outbounds/outboundEditor/types' // TODO: Uncomment when implemented

// Import for local use
// import type { Outbound } from '../outbounds/outboundEditor/types' // TODO: Uncomment when implemented

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
