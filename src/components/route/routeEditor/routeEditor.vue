<template>
  <v-card>
    <v-toolbar>
      <v-toolbar-title>Route</v-toolbar-title>
      <v-spacer />
      <v-btn-toggle v-model="view" density="compact" mandatory>
        <v-btn value="form">Form</v-btn>
        <v-btn value="json">JSON</v-btn>
      </v-btn-toggle>
    </v-toolbar>

    <v-card-text v-if="view === 'form'">
      <v-text-field label="Final" v-model="value.final" />
      <RuleSetsSelector v-model="value.rule_set" />
      <v-divider class="my-4" />
      <AdvancedSection>
        <v-checkbox label="Auto Detect Interface" v-model="value.auto_detect_interface" />
        <v-checkbox label="Override Android VPN" v-model="value.override_android_vpn" />
        <v-text-field label="Default Interface" v-model="value.default_interface" />
        <v-text-field label="Default Mark" v-model="value.default_mark" type="number" />
        <v-text-field label="Default Domain Resolver" v-model="value.default_domain_resolver" />
        <v-text-field label="Default Network Strategy" v-model="value.default_network_strategy" />
        <v-combobox label="Default Network Type" multiple chips v-model="value.default_network_type" />
        <v-combobox label="Default Fallback Network Type" multiple chips v-model="value.default_fallback_network_type" />
        <v-text-field label="Default Fallback Delay" v-model="value.default_fallback_delay" />
      </AdvancedSection>
      <v-divider class="my-4" />
      <ItemSelector
        title="Rules"
        :model-value="value.rules"
        :create-item="createRule"
        :update-item="updateRule"
        :delete-item="deleteRule"
        @update:model-value="value.rules = $event"
      >
        <template #form="{ item }">
          <RouteRuleEditor v-model="item" />
        </template>
        <template #readonly="{ item }">
          <pre>{{ item }}</pre>
        </template>
      </ItemSelector>
    </v-card-text>

    <v-card-text v-else>
      <JSONEditor v-model="value" />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import JSONEditor from '@/components/common/JSONEditor.vue';
import AdvancedSection from '@/components/common/advancedSection/advancedSection.vue';
import ItemSelector from '@/components/common/itemSelector/itemSelector.vue';
import RuleSetsSelector from '../ruleSetsSelector/ruleSetsSelector.vue';
import RouteRuleEditor from '../routeRuleEditor/routeRuleEditor.vue';
import type { Route } from './types';
import type { RouteRule } from '../routeRuleEditor/types';

const props = defineProps<{
  modelValue: Route;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: Route): void;
}>();

const view = ref<'form' | 'json'>('form');

const value = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const createRule = async (item: RouteRule) => item;
const updateRule = async (item: RouteRule) => item;
const deleteRule = async (item: RouteRule) => {};
</script>

<style scoped lang="scss" src="./index.scss"></style>