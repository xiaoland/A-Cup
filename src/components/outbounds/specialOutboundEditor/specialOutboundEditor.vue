<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { z } from 'zod';
import { SelectorOutboundSchema, UrlTestOutboundSchema, DirectOutboundSchema, SingBoxOutboundSchema, type SingBoxOutbound } from '../../../../schemas/singbox';
import Select from 'primevue/select';
import InputText from 'primevue/inputtext';
import Fieldset from 'primevue/fieldset';
import SelectorForm from './selectorForm.vue';
import UrltestForm from './urltestForm.vue';
import DirectForm from './directForm.vue';

type SpecialOutboundModel = z.infer<typeof SelectorOutboundSchema> | z.infer<typeof UrlTestOutboundSchema> | z.infer<typeof DirectOutboundSchema>;

const props = defineProps<{
  modelValue?: SingBoxOutbound;
}>();

const emit = defineEmits(['update:modelValue']);

const localOutbound = ref<SingBoxOutbound | undefined>();

watch(() => props.modelValue, (newValue) => {
  localOutbound.value = newValue;
}, { deep: true, immediate: true });

onMounted(() => {
  if (!localOutbound.value) {
    localOutbound.value = {
      type: 'selector',
      tag: 'new-special-outbound',
      outbounds: [],
    };
  }
});

watch(localOutbound, (newValue) => {
  emit('update:modelValue', newValue);
}, { deep: true });

const outboundTypes = [
  { label: 'Selector', value: 'selector' },
  { label: 'URLTest', value: 'urltest' },
  { label: 'Direct', value: 'direct' },
];

watch(() => localOutbound.value?.type, (newType, oldType) => {
  if (!newType || newType === oldType) return;

  switch (newType) {
    case 'selector':
      localOutbound.value = SelectorOutboundSchema.parse({ type: 'selector', tag: localOutbound.value?.tag });
      break;
    case 'urltest':
      localOutbound.value = UrlTestOutboundSchema.parse({ type: 'urltest', tag: localOutbound.value?.tag });
      break;
    case 'direct':
      localOutbound.value = DirectOutboundSchema.parse({ type: 'direct', tag: localOutbound.value?.tag });
      break;
  }
});
</script>

<template>
  <div v-if="localOutbound" class="flex flex-col gap-4">
    <!-- Basic Information Section -->
    <div class="grid grid-cols-2 gap-4">
      <div class="flex flex-col gap-2">
        <label for="tag" class="font-medium text-sm">Tag</label>
        <InputText
          id="tag"
          v-model="localOutbound.tag"
          class="w-full"
          placeholder="Enter outbound tag"
        />
      </div>
      <div class="flex flex-col gap-2">
        <label for="type" class="font-medium text-sm">Type</label>
        <Select
          id="type"
          v-model="localOutbound.type"
          :options="outboundTypes"
          optionLabel="label"
          optionValue="value"
          class="w-full"
          placeholder="Select outbound type"
        />
      </div>
    </div>

    <!-- Type-Specific Configuration Section -->
    <Fieldset legend="Configuration" class="w-full">
      <div class="flex flex-col gap-4">
        <SelectorForm v-if="localOutbound.type === 'selector'" v-model="localOutbound" />
        <UrltestForm v-if="localOutbound.type === 'urltest'" v-model="localOutbound" />
        <DirectForm v-if="localOutbound.type === 'direct'" v-model="localOutbound" />
      </div>
    </Fieldset>
  </div>
</template>

<style scoped>
:deep(.p-fieldset) {
  border: 1px solid var(--surface-border);
  border-radius: var(--border-radius);
}

:deep(.p-fieldset-legend) {
  padding: 0.5rem 0;
}

:deep(.p-fieldset-content) {
  padding: 1rem 0;
}
</style>
