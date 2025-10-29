<script setup lang="ts">
import { inject, computed } from 'vue';
import Select from 'primevue/select';
import type { SingBoxOutbound } from '../../../schemas/singbox';
import type { ComputedRef } from 'vue';

const props = defineProps<{
  modelValue?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string | undefined];
}>();

// Inject profileOutbounds from profileEditor
const profileOutbounds = inject<ComputedRef<SingBoxOutbound[]>>('profileOutbounds');

const outboundOptions = computed(() => {
  if (!profileOutbounds?.value) {
    return [];
  }
  return profileOutbounds.value;
});

const selectedTag = computed({
  get: () => props.modelValue,
  set: (tag: string | undefined) => {
    emit('update:modelValue', tag);
  }
});

</script>

<template>
  <Select
    v-model="selectedTag"
    :options="outboundOptions"
    optionLabel="tag"
    optionValue="tag"
    placeholder="Select an Outbound"
    class="w-full"
    showClear
  />
</template>
