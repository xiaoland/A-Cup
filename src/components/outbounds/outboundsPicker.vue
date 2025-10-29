<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useOutboundStore } from '@/stores/outbound';
import MultiSelect from 'primevue/multiselect';
import type { Outbound } from '../../../schemas/outbound';

const props = defineProps<{
  modelValue?: number[];
  availableOutbounds?: number[];
}>();

const emit = defineEmits<{
  'update:modelValue': [value: number[] | undefined];
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

const selectedIds = computed({
  get: () => props.modelValue,
  set: (ids: number[] | undefined) => {
    emit('update:modelValue', ids);
  }
});

</script>

<template>
  <MultiSelect
    v-model="selectedIds"
    :options="filteredOutbounds"
    optionLabel="name"
    optionValue="id"
    placeholder="Select Outbounds"
    class="w-full"
    showClear
  />
</template>
