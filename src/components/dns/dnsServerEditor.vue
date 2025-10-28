<script setup lang="ts">
import type { DNSServer } from '../../../schemas/dns';

defineProps<{
  modelValue: DNSServer;
}>();
</script>

<template>
  <div>
    <h2>DNS Server Editor</h2>
    <p>Editing: {{ modelValue.tag }}</p>
    <!-- TODO: Implement editor form -->
  </div>
</template>
