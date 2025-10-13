<script setup lang="ts">
import { ref } from 'vue';
import RuleSetEditor from '@/components/route/ruleSetEditor/ruleSetEditor.vue';
import { type RuleSet } from '@/components/route/ruleSetEditor/types';

const form = ref<RuleSet>({
  name: '',
  type: 'inline',
  content: '',
});
</script>

<template>
  <RuleSetEditor v-model="form" />
</template>

<style></style>
