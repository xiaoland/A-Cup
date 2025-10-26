<script setup lang="ts">
import { ref, watch } from 'vue';
import { z } from 'zod';
import { UrlTestOutboundSchema } from './special-outbound';
import Chips from 'primevue/chips';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';

const props = defineProps<{
  modelValue: z.infer<typeof UrlTestOutboundSchema>;
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
        <label for="url">URL</label>
        <InputText id="url" v-model="outbound.url" class="w-full" />
      </div>
      <div>
        <label for="interval">Interval</label>
        <InputText id="interval" v-model="outbound.interval" class="w-full" />
      </div>
      <div>
        <label for="tolerance">Tolerance</label>
        <InputNumber id="tolerance" v-model="outbound.tolerance" class="w-full" />
      </div>
    </div>
  </div>
</template>
