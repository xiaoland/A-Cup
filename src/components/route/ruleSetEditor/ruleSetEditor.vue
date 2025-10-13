<template>
  <v-form>
    <v-text-field label="Name" v-model="value.name" />
    <v-select
      label="Type"
      :items="['inline', 'remote']"
      v-model="value.type"
    />
    <v-text-field label="Format" v-model="value.format" />
    <v-textarea label="Content" v-model="value.content" />
    <v-text-field label="Download Detour" v-model="value.download_detour" />
    <v-text-field label="Update Interval" v-model="value.update_interval" />
  </v-form>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { RuleSet } from './types';

const props = defineProps<{
  modelValue: RuleSet;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: RuleSet): void;
}>();

const value = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});
</script>

<style scoped lang="scss" src="./index.scss"></style>