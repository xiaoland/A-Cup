<script setup lang="ts">
import type { Inbound } from '../../../schemas/inbound';

defineProps<{
  modelValue: Inbound;
}>();
</script>

<template>
  <div>
    <h4>Editing Inbound: {{ modelValue.tag }}</h4>
    <p>Type: {{ modelValue.type }}</p>
    <!-- TODO: Implement a full editor for all inbound fields -->
  </div>
</template>
