<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useOutboundStore } from '@/stores/outbound';
import Dropdown from 'primevue/dropdown';
import type { Outbound } from '../../../schemas/outbound';

const props = defineProps<{
  modelValue?: Outbound;
  availableOutbounds?: number[];
}>();

const emit = defineEmits(['update:modelValue']);

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

const selectedOutbound = ref(props.modelValue);

watch(() => props.modelValue, (newValue) => {
  selectedOutbound.value = newValue;
});

watch(selectedOutbound, (newValue) => {
  emit('update:modelValue', newValue);
});

</script>

<template>
  <Dropdown
    v-model="selectedOutbound"
    :options="filteredOutbounds"
    optionLabel="name"
    placeholder="Select an Outbound"
    class="w-full"
    show-clear
  />
</template>
