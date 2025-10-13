<template>
  <div>
    <InboundsEditor :form="form" />
  </div>
</template>

<script setup lang="ts">
import InboundsEditor from '@/components/inbounds/inboundsEditor/inboundsEditor.vue'

defineProps<{
  form: any
}>()
</script>