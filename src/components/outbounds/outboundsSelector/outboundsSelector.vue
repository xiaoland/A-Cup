<template>
  <v-select
    v-model="selected"
    :items="outboundsWithTags"
    :multiple="multiple"
    item-title="name"
    item-value="tag"
    label="Outbound"
    @update:modelValue="onSelection"
  ></v-select>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useOutboundStore } from '@/stores/outbound';
import { useUserStore } from '@/stores/user';
import type { Outbound } from '@/components/outbounds/outboundEditor/types';

interface OutboundWithTag extends Outbound {
  tag: string;
}

const props = defineProps({
  modelValue: {
    type: [String, Array] as import('vue').PropType<string | string[]>,
    default: '',
  },
  multiple: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue']);

const outboundStore = useOutboundStore();
const userStore = useUserStore();
const outboundsWithTags = ref<OutboundWithTag[]>([]);
const selected = ref(props.modelValue);

onMounted(async () => {
  await outboundStore.fetchOutbounds();
  const outbounds = outboundStore.outbounds;
  const tagsPromises = outbounds.map(async (outbound) => {
    if (outbound.id) {
      const response = await userStore.authorizedFetch(`/api/outbounds/${outbound.id}/tag`);
      if (response.ok) {
        const data = await response.json();
        return { ...outbound, tag: data.tag };
      }
    }
    return null;
  });

  const resolvedTags = await Promise.all(tagsPromises);
  outboundsWithTags.value = resolvedTags.filter((o) => o !== null) as OutboundWithTag[];
});

const onSelection = (value: string | string[]) => {
  emit('update:modelValue', value);
};

watch(
  () => props.modelValue,
  (newValue) => {
    selected.value = newValue;
  }
);
</script>

<style scoped></style>