<script setup lang="ts">
import { z } from 'zod';
import { SelectorOutboundSchema } from '../../../../schemas/singbox';
import Chips from 'primevue/chips';
import InputText from 'primevue/inputtext';

type SelectorOutboundModel = z.infer<typeof SelectorOutboundSchema>;

const props = defineProps<{
  modelValue: SelectorOutboundModel;
}>();

const emit = defineEmits(['update:modelValue']);

function updateOutbounds(outbounds: string[]) {
  emit('update:modelValue', { ...props.modelValue, outbounds });
}

function updateDefault(defaultValue: string | undefined) {
  emit('update:modelValue', { ...props.modelValue, default: defaultValue });
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Outbounds Field -->
    <div class="flex flex-col gap-2">
      <label for="outbounds" class="font-medium text-sm">
        Outbounds
        <span class="text-red-500">*</span>
      </label>
      <Chips
        id="outbounds"
        :model-value="modelValue.outbounds"
        @update:model-value="updateOutbounds"
        placeholder="Add outbound tags"
        class="w-full"
        :allow-duplicate="false"
        separator=","
      />
      <small class="text-surface-600">
        Enter outbound tags separated by commas
      </small>
    </div>

    <!-- Default Field -->
    <div class="flex flex-col gap-2">
      <label for="default" class="font-medium text-sm">
        Default Outbound
      </label>
      <InputText
        id="default"
        :model-value="modelValue.default"
        @update:model-value="updateDefault"
        placeholder="Select default outbound tag"
        class="w-full"
      />
      <small class="text-surface-600">
        Specify which outbound to use by default
      </small>
    </div>
  </div>
</template>

<style scoped>
small {
  display: block;
  margin-top: 0.25rem;
  opacity: 0.8;
}
</style>
