## Rationale
This component is used to display a summary of an outbound configuration. It is used in the `outboundsListEditor` to show the user which outbounds are currently selected.

## Goals
- Display the name and type of an outbound.
- Be clickable to allow for editing.

## Specification

### Layout
- A PrimeVue `Card` component is used to display the outbound information.
- The card shows the outbound's name as the title and the type as the subtitle.

### Interaction
- When the card is clicked, it emits a `click` event.

### Props
- `id: number`: The ID of the outbound to display.

### Emits (optional)
- `click`: Emitted when the card is clicked.

## Dependencies
- `primevue/card`
- `vue`
- `@/stores/outbound`
- `@/types/outbound`