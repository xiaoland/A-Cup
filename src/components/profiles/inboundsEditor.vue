<script setup lang="ts">
import { computed } from 'vue';
import type { Inbound } from '../../../schemas/inbound';
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import Button from 'primevue/button';
import InboundEditor from '@/components/inbounds/inboundEditor.vue';

const props = defineProps<{
  modelValue: Inbound[];
}>();

const emit = defineEmits(['update:modelValue']);

const items = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const addInbound = () => {
  const newInbound: Inbound = {
    type: 'mixed',
    tag: `new-inbound-${items.value.length + 1}`,
    listen: '0.0.0.0',
    listen_port: 1080,
  };
  items.value = [...items.value, newInbound];
};

const removeInbound = (index: number) => {
  const newItems = [...items.value];
  newItems.splice(index, 1);
  items.value = newItems;
};
</script>

<template>
  <div class="p-4">
    <div v-if="items.length > 0">
      <Accordion :multiple="true" class="mb-3">
        <AccordionTab v-for="(inbound, index) in items" :key="index">
          <template #header>
            <div class="flex items-center justify-between w-full">
              <span class="font-medium">{{ inbound.tag || `Inbound ${index + 1}` }}</span>
              <span class="text-sm text-gray-500 ml-2">({{ inbound.type }})</span>
            </div>
          </template>
          <div class="flex justify-end mb-3">
            <Button 
              icon="pi pi-trash" 
              severity="danger" 
              size="small"
              text
              @click="removeInbound(index)" 
              label="Remove"
            />
          </div>
          <InboundEditor v-model="items[index]" />
        </AccordionTab>
      </Accordion>
    </div>
    <div v-else class="text-center py-4 text-gray-500">
      No inbounds configured. Add one to get started.
    </div>
    <Button 
      label="Add Inbound" 
      icon="pi pi-plus" 
      severity="success" 
      @click="addInbound" 
      outlined
    />
  </div>
</template>
