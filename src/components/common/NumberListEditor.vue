<template>
  <div>
    <div class="flex items-center justify-between mb-2">
      <label>{{ title }}</label>
      <Button
        icon="i-mdi-plus"
        size="small"
        text
        rounded
        @click="addItem"
        :disabled="disabled"
      />
    </div>
    <div class="flex flex-col gap-2">
      <div v-for="(item, index) in modelValue" :key="index" class="flex gap-2 items-center">
        <InputNumber v-if="modelValue" v-model="modelValue[index]" class="flex-1" :disabled="disabled" />
        <Button
          icon="i-mdi-close"
          severity="danger"
          size="small"
          text
          rounded
          @click="removeItem(index)"
          :disabled="disabled"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'

const props = defineProps<{
  modelValue: number[] | undefined,
  title: string,
  disabled?: boolean,
}>()

const emit = defineEmits(['update:modelValue'])

const addItem = () => {
  const newValue = [...(props.modelValue || []), 0]
  emit('update:modelValue', newValue)
}

const removeItem = (index: number) => {
  const newValue = [...(props.modelValue || [])]
  newValue.splice(index, 1)
  emit('update:modelValue', newValue)
}
</script>