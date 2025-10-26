<script setup lang="ts">
import { ref, watch } from 'vue';
import { z } from 'zod';
import { VmessCredentialSchema } from '../../../../schemas/outbound';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';

const props = defineProps<{
  modelValue: z.infer<typeof VmessCredentialSchema>;
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
        <label for="security">Security</label>
        <InputText id="security" v-model="credential.security" class="w-full" />
      </div>
      <div>
        <label for="alter_id">Alter ID</label>
        <InputNumber id="alter_id" v-model="credential.alter_id" class="w-full" />
      </div>
    </div>
  </div>
</template>
