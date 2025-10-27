<script setup lang="ts">
import { ref } from 'vue';
import Dialog from 'primevue/dialog';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import { SingBoxRuleSetSchema } from '../../../schemas/route';
import { fromSingbox } from './from-singbox';

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits(['update:visible', 'parsed']);

const jsonInput = ref('');
const error = ref<string | null>(null);

function confirmImport() {
  try {
    const parsed = SingBoxRuleSetSchema.parse(JSON.parse(jsonInput.value));
    const transformed = fromSingbox(parsed);
    emit('parsed', transformed);
    emit('update:visible', false);
    jsonInput.value = '';
    error.value = null;
  } catch (e) {
    if (e instanceof Error) {
      error.value = e.message;
    } else {
      error.value = 'An unknown error occurred.';
    }
    console.error(e);
  }
}

function onHide() {
  emit('update:visible', false);
  jsonInput.value = '';
  error.value = null;
}
</script>

<template>
  <Dialog :visible="visible" modal header="Import Rule Set" @update:visible="onHide">
    <div class="p-fluid">
      <Textarea v-model="jsonInput" rows="10" cols="50" placeholder="Paste your Sing-Box JSON here" />
      <small v-if="error" class="p-error">{{ error }}</small>
    </div>
    <template #footer>
      <Button label="Cancel" icon="pi pi-times" @click="onHide" class="p-button-text" />
      <Button label="Confirm" icon="pi pi-check" @click="confirmImport" />
    </template>
  </Dialog>
</template>
