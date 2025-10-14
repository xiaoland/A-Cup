<template>
  <v-select
    v-model="selected"
    :items="outbounds"
    :multiple="multiple"
    item-title="name"
    item-value="tag"
    label="Outbound"
    @update:modelValue="onSelection"
  ></v-select>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useOutboundStore } from '@/stores/outbound';

interface OutboundItem {
  id: number;
  name: string;
  tag: string;
}

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  multiple: {
    type: Boolean,
    default: false,
  }
});

const emit = defineEmits(['update:modelValue']);

const outboundStore = useOutboundStore();
const outbounds = computed(() => outboundStore.outbounds);
const selected = ref(props.modelValue);

onMounted(async () => {
  await outboundStore.fetchOutbounds();
});

const onSelection = (value: string) => {
  emit('update:modelValue', value);
};
</script>

<style scoped></style>