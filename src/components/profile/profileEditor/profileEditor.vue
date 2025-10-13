<template>
  <div>
    <InboundsEditor v-model="modelValue.inbounds" />
  </div>
</template>

<script setup lang="ts">
import InboundsEditor from '@/components/inbounds/inboundsEditor/inboundsEditor.vue'

defineProps<{
  modelValue: any
}>()
</script>