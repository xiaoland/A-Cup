<script setup lang="ts">
import { computed } from 'vue';
import type { Route } from '../../../schemas/route';
import JSONEditor from '@/components/common/JSONEditor.vue';
import InputText from 'primevue/inputtext';
import Checkbox from 'primevue/checkbox';

const props = defineProps<{
  modelValue: Route;
}>();

const emit = defineEmits(['update:modelValue']);

const final = computed({
  get: () => props.modelValue.final,
  set: (value) => emit('update:modelValue', { ...props.modelValue, final: value }),
});

const autoDetectInterface = computed({
  get: () => props.modelValue.auto_detect_interface,
  set: (value) => emit('update:modelValue', { ...props.modelValue, auto_detect_interface: value }),
});

const advancedFields = computed(() => {
  const { rules, final, auto_detect_interface, ...rest } = props.modelValue;
  return rest;
});

const onAdvancedChange = (newValue: any) => {
  emit('update:modelValue', {
    ...props.modelValue,
    ...newValue,
  });
};

</script>

<template>
  <div>
    <h3>Route</h3>
    <div class="p-field">
      <label for="final">Final</label>
      <InputText id="final" v-model="final" />
    </div>
    <div class="p-field">
      <label for="auto_detect_interface">Auto Detect Interface</label>
      <Checkbox id="auto_detect_interface" v-model="autoDetectInterface" :binary="true" />
    </div>
    <!-- TODO: Implement editor for rules array -->
    <p>TODO: Rules array editor</p>
    <!-- TODO: Implement editor for rule_set array -->
    <p>TODO: Rule Set array editor</p>

    <h4>Advanced</h4>
    <JSONEditor :modelValue="advancedFields" @update:modelValue="onAdvancedChange" />
  </div>
</template>
