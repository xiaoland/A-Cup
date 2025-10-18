<template>
  <div>
    <Textarea
      :model-value="text"
      :rows="rows"
      :class="{ 'p-invalid': error }"
      class="w-full"
      @update:model-value="onInput"
      @blur="onBlur"
    />
    <small v-if="error" class="p-error">{{ error }}</small>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Textarea from 'primevue/textarea'

const props = defineProps<{ modelValue: any; label?: string; rows?: number }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: any): void }>()

const rows = props.rows ?? 10
const text = ref('')
const error = ref('')

const refresh = () => {
  try {
    text.value = JSON.stringify(props.modelValue ?? {}, null, 2)
    error.value = ''
  } catch {
    text.value = ''
  }
}

watch(() => props.modelValue, refresh, { immediate: true, deep: true })

const onInput = (v: string) => {
  text.value = v
}

const onBlur = () => {
  try {
    const parsed = text.value ? JSON.parse(text.value) : {}
    emit('update:modelValue', parsed)
    error.value = ''
  } catch {
    error.value = 'Invalid JSON'
  }
}
</script>

<style scoped>
</style>