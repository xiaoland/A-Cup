<script setup lang="ts">
import { z } from 'zod';
import { SelectorOutboundSchema } from '../../../../schemas/singbox';
import SingBoxOutboundsPicker from '../singBoxOutboundsPicker.vue';
import SingBoxOutboundPicker from '../singBoxOutboundPicker.vue';

type SelectorOutboundModel = z.infer<typeof SelectorOutboundSchema>;

const props = defineProps<{
  modelValue: SelectorOutboundModel;
}>();

const emit = defineEmits(['update:modelValue']);

function updateOutbounds(outbounds: string[] | undefined) {
  emit('update:modelValue', { ...props.modelValue, outbounds: outbounds || [] });
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
      <SingBoxOutboundsPicker
        id="outbounds"
        :model-value="modelValue.outbounds"
        @update:model-value="updateOutbounds"
      />
      <small class="text-surface-600">
        Select outbound tags from the profile
      </small>
    </div>

    <!-- Default Field -->
    <div class="flex flex-col gap-2">
      <label for="default" class="font-medium text-sm">
        Default Outbound
      </label>
      <SingBoxOutboundPicker
        id="default"
        :model-value="modelValue.default"
        @update:model-value="updateDefault"
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
