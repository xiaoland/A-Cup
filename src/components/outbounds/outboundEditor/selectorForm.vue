<script setup lang="ts">
import { ref, watch } from 'vue';
import { z } from 'zod';
import { SelectorOutboundSchema } from './special-outbound';
import Chips from 'primevue/chips';

const props = defineProps<{
  modelValue: z.infer<typeof SelectorOutboundSchema>;
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
        <label for="outbounds">Outbounds</label>
        <Chips id="outbounds" v-model="outbound.outbounds" class="w-full" />
      </div>
      <div>
        <label for="default">Default</label>
        <InputText id="default" v-model="outbound.default" class="w-full" />
      </div>
    </div>
  </div>
</template>
