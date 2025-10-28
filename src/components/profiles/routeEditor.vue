<script setup lang="ts">
import { computed } from 'vue';
import type { Route } from '../../../schemas/route';
import JSONEditor from '@/components/common/JSONEditor.vue';
import InputText from 'primevue/inputtext';
import InputSwitch from 'primevue/inputswitch';
import Fieldset from 'primevue/fieldset';

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
    <div class="formgrid grid">
      <div class="field col-12 md:col-6">
        <label for="final">Final</label>
        <InputText id="final" v-model="final" />
      </div>
      <div class="field col-12 md:col-6 flex align-items-center">
        <div class="field-checkbox">
          <InputSwitch id="auto_detect_interface" v-model="autoDetectInterface" />
          <label for="auto_detect_interface" class="ml-2">Auto Detect Interface</label>
        </div>
      </div>
    </div>

    <!-- TODO: Implement editor for rules array -->
    <p>TODO: Rules array editor</p>
    <!-- TODO: Implement editor for rule_set array -->
    <p>TODO: Rule Set array editor</p>

    <Fieldset legend="Advanced" :toggleable="true" class="mt-3">
      <JSONEditor :modelValue="advancedFields" @update:modelValue="onAdvancedChange" />
    </Fieldset>
  </div>
</template>
