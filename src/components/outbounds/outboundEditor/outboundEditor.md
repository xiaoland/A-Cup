## Rationale
This component is a comprehensive editor for all types of outbounds. It provides a user-friendly interface for creating and modifying outbound configurations.

## Goals
- Provide a form for editing all common outbound properties.
- Dynamically display form fields based on the selected outbound type.
- Handle validation of the form data using Zod schemas.
- Display validation errors to the user.
- Provide save, cancel, and delete functionality.

## Specification

### Layout
- A PrimeVue `Card` component is used as the main container.
- The form is laid out in a grid.
- Common fields like `name`, `type`, `region`, and `provider` are always visible.
- Advanced fields like `transport`, `tls`, and `mux` are in an accordion.
- Type-specific fields are rendered conditionally based on the selected `type`.
- Save, cancel, and delete buttons are displayed at the bottom.

### Interaction
- The form is validated on save.
- Validation errors are displayed next to the invalid fields.
- The `type` dropdown controls which type-specific form is displayed.
- The save button is disabled while saving.
- The delete button is only shown when editing an existing outbound.

### Props
- `form: Outbound`: The outbound object to edit.
- `showDelete?: boolean`: Whether to show the delete button.

### Emits (optional)
- `saved`: Emitted when the outbound is saved successfully.
- `cancel`: Emitted when the cancel button is clicked.
- `deleted`: Emitted when the outbound is deleted successfully.

## Dependencies
- `primevue/card`
- `primevue/button`
- `primevue/select`
- `primevue/inputtext`
- `primevue/accordion`
- `primevue/accordionpanel`
- `vue`
- `zod`
- `@/components/common/JSONEditor.vue`
- `@/stores/outbound`
- `@/types/outbound`
- `@/schemas/outbound`
- and all the individual outbound form components.