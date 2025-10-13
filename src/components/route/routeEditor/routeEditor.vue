<template>
  <Editor
    v-model="editableValue"
    title="Route"
    :start-editable="true"
    @save="onSave"
    @cancel="onCancel"
  >
    <v-text-field label="Final" v-model="editableValue.final" />
    <RuleSetsSelector v-model="ruleSets" />
    <v-divider class="my-4" />
    <AdvancedSection>
      <v-checkbox label="Auto Detect Interface" v-model="editableValue.auto_detect_interface" />
      <v-checkbox label="Override Android VPN" v-model="editableValue.override_android_vpn" />
      <v-text-field label="Default Interface" v-model="editableValue.default_interface" />
      <v-text-field label="Default Mark" v-model="editableValue.default_mark" type="number" />
      <v-text-field
        label="Default Domain Resolver"
        v-model="editableValue.default_domain_resolver"
      />
      <v-text-field
        label="Default Network Strategy"
        v-model="editableValue.default_network_strategy"
      />
      <v-combobox
        label="Default Network Type"
        multiple
        chips
        v-model="editableValue.default_network_type"
      />
      <v-combobox
        label="Default Fallback Network Type"
        multiple
        chips
        v-model="editableValue.default_fallback_network_type"
      />
      <v-text-field label="Default Fallback Delay" v-model="editableValue.default_fallback_delay" />
    </AdvancedSection>
    <v-divider class="my-4" />
    <!-- FIXME -->
    <!-- <ItemSelector
      title="Rules"
      :model-value="editableValue.rule_sets"
      :create-item="createRule"
      @update:model-value="editableValue.rule_sets = $event"
    >
      <template #form="{ item }">
        <RouteRuleEditor :modelValue="item" />
      </template>
      <template #readonly="{ item }">
        <pre>{{ item }}</pre>
      </template>
    </ItemSelector> -->
  </Editor>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import Editor from '@/components/common/Editor.vue';
import AdvancedSection from '@/components/common/advancedSection/advancedSection.vue';
import ItemSelector from '@/components/common/itemSelector/itemSelector.vue';
import RuleSetsSelector from '../ruleSetsSelector/ruleSetsSelector.vue';
import RouteRuleEditor from '../routeRuleEditor/routeRuleEditor.vue';
import type { Route } from './routeEditor';
import type { RouteRule } from '../routeRuleEditor/types';

const props = defineProps<{
  modelValue: Route;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: Route): void;
}>();

const editableValue = ref<Route>(JSON.parse(JSON.stringify(props.modelValue)));

const ruleSets = computed({
  get: () => editableValue.value.rule_sets || [],
  set: (val) => (editableValue.value = { ...editableValue.value, rule_sets: val }),
});

const createRule = async (item: RouteRule) => item;

const onSave = () => {
  emit('update:modelValue', editableValue.value);
};

const onCancel = () => {
  editableValue.value = JSON.parse(JSON.stringify(props.modelValue));
};

// Watch for external changes to reset the editable value
watch(
  () => props.modelValue,
  (newValue) => {
    editableValue.value = JSON.parse(JSON.stringify(newValue));
  },
  { deep: true }
);
</script>

<style scoped lang="scss" src="./routeEditor.scss"></style>
