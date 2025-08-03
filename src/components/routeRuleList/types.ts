// Re-export shared types from routeRuleEditor
export type {
  RouteRule,
  SelectOption,
  OutboundSelectItem
} from '../routeRuleEditor/types'

export {
  actionOptions
} from '../routeRuleEditor/types'

// Import for local use
import type { RouteRule } from '../routeRuleEditor/types'

// Export type options
export type ExportType = 'sing-box'

export interface ExportTypeOption {
  title: string
  value: ExportType
}

export const exportTypes: ExportTypeOption[] = [
  { title: 'Sing-Box', value: 'sing-box' }
]

// Props interface for routeRuleList component
export interface Props {
  // Currently no props needed, but prepared for future use
}

// Events interface for routeRuleList component
export interface Events {
  'edit-route-rule': [routeRule: RouteRule]
  'create-route-rule': []
  'delete-route-rule': [routeRule: RouteRule]
  'export-route-rule': [routeRule: RouteRule]
}
