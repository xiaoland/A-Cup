## Rationale
This component is used to manage a list of outbounds for a profile. It allows the user to add, edit, and remove outbounds from the list.

## Goals
- Display a list of selected outbounds.
- Allow the user to add new outbounds to the list by selecting from existing outbounds.
- Allow the user to edit an outbound in the list.
- Allow the user to remove an outbound from the list.

## Specification

### Layout
- A PrimeVue `Card` component is used to contain the list of outbounds.
- The list of outbounds is displayed using the `outboundCard` component.
- An "Add Outbound" button is displayed in the card's title.
- A PrimeVue `Dialog` is used to display the `outboundsSelector` component when adding outbounds.
- A PrimeVue `Sidebar` is used to display the `outboundEditor` component when editing an outbound.

### Interaction
- Clicking the "Add Outbound" button opens the `outboundsSelector` dialog.
- Clicking on an `outboundCard` opens the `outboundEditor` sidebar.
- The `outboundEditor` handles saving and deleting outbounds.

### Props
- `modelValue: number[]`: An array of outbound IDs that are selected.

### Emits (optional)
- `update:modelValue`: Emitted when the list of selected outbounds changes.

## Dependencies
- `primevue/card`
- `primevue/button`
- `primevue/dialog`
- `primevue/sidebar`
- `vue`
- `@/components/outbounds/outboundEditor/outboundEditor.vue`
- `@/components/outbounds/outboundCard/outboundCard.vue`
- `@/components/outbounds/outboundsSelector/outboundsSelector.vue`
- `@/stores/outbound`
- `@/types/outbound`