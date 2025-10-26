<script setup lang="ts">
import { z } from 'zod';
import { OutboundSchema } from '../../../../schemas/outbound';
import Card from 'primevue/card';
import Button from 'primevue/button';

const props = defineProps<{
  outbound: z.infer<typeof OutboundSchema>;
}>();

const emit = defineEmits(['edit', 'delete']);
</script>

<template>
  <Card>
    <template #title>{{ props.outbound.name }}</template>
    <template #subtitle>{{ props.outbound.type }}</template>
    <template #content>
      <p><strong>Region:</strong> {{ props.outbound.region }}</p>
      <p><strong>Provider:</strong> {{ props.outbound.provider }}</p>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <Button label="Edit" icon="pi pi-pencil" @click="emit('edit', props.outbound)" />
        <Button label="Delete" icon="pi pi-trash" severity="danger" @click="emit('delete', props.outbound)" />
      </div>
    </template>
  </Card>
</template>
