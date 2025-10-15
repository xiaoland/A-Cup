<template>
  <div>
    <v-select
      v-model="selected"
      :items="outboundStore.outbounds"
      item-title="name"
      label="Select an Outbound"
      @update:modelValue="onSelection"
      return-object
    ></v-select>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useOutboundStore } from '@/stores/outbound';
import type { Outbound } from '../outboundEditor/types';

const emit = defineEmits(['update:modelValue']);
const outboundStore = useOutboundStore();
const selected = ref<Outbound | null>(null);

onMounted(() => {
  outboundStore.fetchOutbounds();
});

const onSelection = (value: Outbound) => {
  emit('update:modelValue', value);
};
</script>