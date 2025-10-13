<template>
  <v-card variant="outlined" class="form-section">
    <v-card-title class="text-h6 d-flex align-center justify-space-between">
      Route
      <div class="d-flex" style="gap: 8px">
        <v-btn-toggle v-model="view" density="compact" mandatory>
          <v-btn value="form">Form</v-btn>
          <v-btn value="json">JSON</v-btn>
        </v-btn-toggle>
      </div>
    </v-card-title>

    <v-card-text v-if="view === 'form'">
      <v-text-field label="Final" v-model="value.final" />
      <RuleSetsSelector v-model="ruleSets" />
      <v-divider class="my-4" />
      <AdvancedSection>
        <v-checkbox label="Auto Detect Interface" v-model="value.auto_detect_interface" />
        <v-checkbox label="Override Android VPN" v-model="value.override_android_vpn" />
        <v-text-field label="Default Interface" v-model="value.default_interface" />
        <v-text-field label="Default Mark" v-model="value.default_mark" type="number" />
        <v-text-field label="Default Domain Resolver" v-model="value.default_domain_resolver" />
        <v-text-field label="Default Network Strategy" v-model="value.default_network_strategy" />
        <v-combobox
          label="Default Network Type"
          multiple
          chips
          v-model="value.default_network_type"
        />
        <v-combobox
          label="Default Fallback Network Type"
          multiple
          chips
          v-model="value.default_fallback_network_type"
        />
        <v-text-field label="Default Fallback Delay" v-model="value.default_fallback_delay" />
      </AdvancedSection>
      <v-divider class="my-4" />
      <!-- FIXME -->
      <!-- <ItemSelector
        title="Rules"
        :model-value="value.rule_sets"
        :create-item="createRule"
        @update:model-value="value.rule_sets = $event"
      >
        <template #form="{ item }">
          <RouteRuleEditor :modelValue="item" />
        </template>
        <template #readonly="{ item }">
          <pre>{{ item }}</pre>
        </template>
      </ItemSelector> -->
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

const ruleSets = computed({
  get: () => value.value.rule_sets || [],
  set: (val) => (value.value = { ...value.value, rule_sets: val }),
});

const createRule = async (item: RouteRule) => item;
</script>

<style scoped lang="scss" src="./index.scss"></style>
