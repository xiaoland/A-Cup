<script setup lang="ts">
import { ref, watch } from 'vue';
import { z } from 'zod';
import { DirectOutboundSchema } from './special-outbound';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';

const props = defineProps<{
  modelValue: z.infer<typeof DirectOutboundSchema>;
}>();

const emit = defineEmits(['update:modelValue']);

const outbound = ref(props.modelValue);

watch(() => props.modelValue, (newValue) => {
  outbound.value = newValue;
}, { deep: true });

watch(outbound, (newValue) => {
  emit('update:modelValue', newValue);
}, { deep: true });
</script>

<template>
  <div>
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label for="override_address">Override Address</label>
        <InputText id="override_address" v-model="outbound.override_address" class="w-full" />
      </div>
      <div>
        <label for="override_port">Override Port</label>
        <InputNumber id="override_port" v-model="outbound.override_port" class="w-full" />
      </div>
    </div>
  </div>
</template>
