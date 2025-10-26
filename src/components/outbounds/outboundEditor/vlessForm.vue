<script setup lang="ts">
import { ref, watch } from 'vue';
import { z } from 'zod';
import { VlessCredentialSchema } from '../../../../schemas/outbound';
import InputText from 'primevue/inputtext';

const props = defineProps<{
  modelValue: z.infer<typeof VlessCredentialSchema>;
}>();

const emit = defineEmits(['update:modelValue']);

const credential = ref(props.modelValue);

watch(() => props.modelValue, (newValue) => {
  credential.value = newValue;
}, { deep: true });

watch(credential, (newValue) => {
  emit('update:modelValue', newValue);
}, { deep: true });
</script>

<template>
  <div>
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label for="uuid">UUID</label>
        <InputText id="uuid" v-model="credential.uuid" class="w-full" />
      </div>
      <div>
        <label for="flow">Flow</label>
        <InputText id="flow" v-model="credential.flow" class="w-full" />
      </div>
    </div>
  </div>
</template>
