<script setup lang="ts">
import { inject, computed } from 'vue';
import MultiSelect from 'primevue/multiselect';
import type { SingBoxOutbound } from '../../../schemas/singbox';
import type { ComputedRef } from 'vue';

const props = defineProps<{
  modelValue?: string[];
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string[] | undefined];
}>();

// Inject profileOutbounds from profileEditor
const profileOutbounds = inject<ComputedRef<SingBoxOutbound[]>>('profileOutbounds');

const outboundOptions = computed(() => {
  if (!profileOutbounds?.value) {
    return [];
  }
  return profileOutbounds.value;
});

const selectedTags = computed({
  get: () => props.modelValue,
  set: (tags: string[] | undefined) => {
    emit('update:modelValue', tags);
  }
});

</script>

<template>
  <MultiSelect
    v-model="selectedTags"
    :options="outboundOptions"
    optionLabel="tag"
    optionValue="tag"
    placeholder="Select Outbounds"
    class="w-full"
    showClear
  />
</template>
