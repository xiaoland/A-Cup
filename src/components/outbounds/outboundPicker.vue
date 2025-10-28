<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useOutboundStore } from '@/stores/outbound';
import Select from 'primevue/select';
import type { Outbound } from '../../../schemas/outbound';

const props = defineProps<{
  modelValue?: number;
  availableOutbounds?: number[];
}>();

const emit = defineEmits<{
  'update:modelValue': [value: number | undefined];
}>();

const outboundStore = useOutboundStore();
const allOutbounds = ref<Outbound[]>([]);

onMounted(async () => {
  await outboundStore.fetchOutbounds();
  allOutbounds.value = outboundStore.outbounds;
});

const filteredOutbounds = computed(() => {
  if (props.availableOutbounds) {
    return allOutbounds.value.filter(o => props.availableOutbounds!.includes(o.id!));
  }
  return allOutbounds.value;
});

const selectedId = computed({
  get: () => props.modelValue,
  set: (id: number | undefined) => {
    emit('update:modelValue', id);
  }
});

</script>

<template>
  <Select
    v-model="selectedId"
    :options="filteredOutbounds"
    optionLabel="name"
    optionValue="id"
    placeholder="Select an Outbound"
    class="w-full"
    showClear
  />
</template>
