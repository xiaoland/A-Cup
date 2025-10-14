<template>
  <v-select
    v-model="selected"
    :items="outbounds"
    item-title="name"
    item-value="tag"
    label="Outbound"
    @update:modelValue="onSelection"
  ></v-select>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '@/api';

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
});

const emit = defineEmits(['update:modelValue']);

const outbounds = ref<OutboundItem[]>([]);
const selected = ref(props.modelValue);

onMounted(async () => {
  const response = await api.get<OutboundItem[]>('/outbounds');
  outbounds.value = response.data;
});

const onSelection = (value: string) => {
  emit('update:modelValue', value);
};
</script>

<style scoped></style>