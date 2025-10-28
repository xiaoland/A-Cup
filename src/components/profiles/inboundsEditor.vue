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
  <div>
    <Accordion :activeIndex="0">
      <AccordionTab v-for="(inbound, index) in items" :key="index" :header="inbound.tag">
        <div class="flex justify-content-end">
          <Button icon="pi pi-trash" severity="danger" @click="removeInbound(index)" />
        </div>
        <InboundEditor v-model="items[index]" class="mt-3" />
      </AccordionTab>
    </Accordion>
    <Button label="Add Inbound" icon="pi pi-plus" severity="success" class="mt-2" @click="addInbound" />
  </div>
</template>
