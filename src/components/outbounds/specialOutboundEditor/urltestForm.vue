<script setup lang="ts">
import { z } from 'zod';
import { UrlTestOutboundSchema } from '../../../../schemas/singbox';
import InputChips from 'primevue/inputchips';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';

type UrlTestOutboundModel = z.infer<typeof UrlTestOutboundSchema>;

const props = defineProps<{
  modelValue: UrlTestOutboundModel;
}>();

const emit = defineEmits(['update:modelValue']);

function updateOutbounds(outbounds: string[]) {
  emit('update:modelValue', { ...props.modelValue, outbounds });
}

function updateUrl(url: string | undefined) {
  emit('update:modelValue', { ...props.modelValue, url });
}

function updateInterval(interval: string | undefined) {
  emit('update:modelValue', { ...props.modelValue, interval });
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
      <InputChips
        id="outbounds"
        :model-value="modelValue.outbounds"
        @update:model-value="updateOutbounds"
        placeholder="Add outbound tags"
        class="w-full"
        :allow-duplicate="false"
        separator=","
      />
      <small class="text-surface-600">
        Enter outbound tags to test
      </small>
    </div>

    <!-- URL Field -->
    <div class="flex flex-col gap-2">
      <label for="url" class="font-medium text-sm">
        Test URL
        <span class="text-red-500">*</span>
      </label>
      <InputText
        id="url"
        :model-value="modelValue.url"
        @update:model-value="updateUrl"
        placeholder="https://www.gstatic.com/generate_204"
        class="w-full"
      />
      <small class="text-surface-600">
        URL used for connectivity testing
      </small>
    </div>

    <!-- Interval Field -->
    <div class="flex flex-col gap-2">
      <label for="interval" class="font-medium text-sm">
        Test Interval
      </label>
      <InputText
        id="interval"
        :model-value="modelValue.interval"
        @update:model-value="updateInterval"
        placeholder="e.g., 10m, 30s"
        class="w-full"
      />
      <small class="text-surface-600">
        Time between tests (e.g., 10m for 10 minutes, 30s for 30 seconds)
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
