<template>
  <v-alert type="warning" variant="tonal">TODO: JSON editor removed</v-alert>
  <slot />
</template>

<script setup lang="ts">
// Placeholder component; JSON editor removed.
defineProps<{ modelValue?: any }>()
defineEmits<{ 'update:modelValue': [val: any] }>()
</script>

<style scoped>
</style>
