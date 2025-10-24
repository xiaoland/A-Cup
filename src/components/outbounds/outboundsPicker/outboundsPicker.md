## Rationale
This component provides a way to select one or more outbounds from a list of available outbounds. It is used in the `outboundsListEditor` to add existing outbounds to a profile.

## Goals
- Display a dropdown of available outbounds.
- Allow for single or multiple selections.
- Allow for creating new outbounds.
- Mask out already selected outbounds.

## Specification

### Layout
- A PrimeVue `Select` component is used for the dropdown.
- A "Create New Outbound" button is displayed next to the dropdown.
- A dialog is used to display the `outboundEditor` for creating a new outbound.

### Interaction
- The dropdown displays a list of available outbounds.
- The user can select one or more outbounds.
- The "Create New Outbound" button opens a dialog to create a new outbound.
- When a new outbound is created, it is automatically selected.

### Props
- `modelValue: string | string[] | number | number[]`: The currently selected outbound(s).
- `multiple?: boolean`: Whether to allow multiple selections.
- `valueAs?: 'id' | 'tag'`: The value to use for the selection.
- `mask?: number[]`: An array of outbound IDs to hide from the selection.

### Emits (optional)
- `update:modelValue`: Emitted when the selection changes.

## Dependencies
- `primevue/select`
- `primevue/button`
- `primevue/dialog`
- `vue`
- `@/components/outbounds/outboundEditor/outboundEditor.vue`
- `@/stores/outbound`
- `@/types/outbound`