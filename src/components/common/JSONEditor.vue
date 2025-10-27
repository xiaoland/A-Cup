<script setup lang="ts">
import { ref, watch } from 'vue';
import JsonEditor from 'vue3-ts-jsoneditor';

const props = defineProps<{
  modelValue: object | null | undefined;
}>();

const emit = defineEmits(['update:modelValue']);

const localText = ref(JSON.stringify(props.modelValue, null, 2));

watch(() => props.modelValue, (newValue) => {
  try {
    const newText = JSON.stringify(newValue, null, 2);
    // Avoids an infinite loop by only updating if the text has changed
    if (JSON.parse(localText.value) !== newValue) {
        localText.value = newText;
    }
  } catch (e) {
    // If the new value is not valid JSON, do nothing.
  }
}, { deep: true });

watch(localText, (newText) => {
  try {
    emit('update:modelValue', JSON.parse(newText));
  } catch (e) {
    // If the user input is not valid JSON, do not emit an update.
  }
});
</script>

<template>
  <JsonEditor
    v-model:text="localText"
    mode="text"
    :height="200"
  />
</template>
