<script setup lang="ts">
import type { DNSRule } from '../../../schemas/dns';

defineProps<{
  modelValue: DNSRule;
}>();
</script>

<template>
  <div>
    <h2>DNS Rule Editor</h2>
    <p>Editing a DNS Rule</p>
    <!-- TODO: Implement editor form -->
  </div>
</template>
