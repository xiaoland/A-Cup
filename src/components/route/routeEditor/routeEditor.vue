
<template>
  <Editor v-model="route" title="Route">
    <template #default>
      <h3>Rules</h3>
      <div v-if="route.rules" v-for="(rule, index) in route.rules" :key="index">
        <route-rule-editor :class="{'my-2': index !== 0}" v-model="route.rules[index]" @remove="removeRule(index)" />
      </div>
      <v-btn class="my-4" @click="addRule">Add Rule</v-btn>

      <v-divider class="my-4"></v-divider>

      <h3>Rule Sets</h3>
      <rule-sets-selector v-model="route.rule_set" value-as="id" class="mb-4" />

      <v-divider class="my-4"></v-divider>

      <outbounds-selector v-model="route.final" label="Final Outbound" class="mb-4" />
      <v-expansion-panels class="mb-4">
        <v-expansion-panel>
          <v-expansion-panel-title>Advanced</v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-checkbox v-model="route.auto_detect_interface" label="Auto Detect Interface"></v-checkbox>
            <v-text-field v-model="route.default_interface" label="Default Interface"></v-text-field>
            <v-text-field v-model="route.default_mark" label="Default Mark" type="number"></v-text-field>
            <v-text-field v-model="route.default_domain_resolver" label="Default Domain Resolver"></v-text-field>
            <v-text-field v-model="route.default_network_strategy" label="Default Network Strategy"></v-text-field>
            <v-text-field v-model="route.default_network_type" label="Default Network Type"></v-text-field>
            <v-text-field v-model="route.default_fallback_network_type" label="Default Fallback Network Type"></v-text-field>
            <v-text-field v-model="route.default_fallback_delay" label="Default Fallback Delay" type="number"></v-text-field>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </template>

    <template #readonly>
      <pre class="readonly-json">{{ pretty(route) }}</pre>
    </template>
  </Editor>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { type Route, type RouteRule } from '@/schemas/route';
import Editor from '@/components/common/Editor.vue';
import RouteRuleEditor from '../routeRuleEditor/routeRuleEditor.vue';
import RuleSetsSelector from '../ruleSets/ruleSetsSelector.vue';
import OutboundsSelector from '@/components/outbounds/outboundsSelector/outboundsSelector.vue';

const props = withDefaults(defineProps<{
  modelValue: Route;
}>(), {
  modelValue: () => ({
    rules: [],
    rule_set: [] as number[],
  }),
});

const emit = defineEmits(['update:modelValue']);

const route = ref(props.modelValue);

if (!route.value.rules) {
  route.value.rules = [];
}

const addRule = () => {
  if (!route.value.rules) {
    route.value.rules = [];
  }
  route.value.rules.push({
    action: 'route',
    outbound: '',
  } as RouteRule);
};

const removeRule = (index: number) => {
  if (route.value.rules) {
    route.value.rules.splice(index, 1);
  }
};

watch(
  route,
  (newValue) => {
    emit('update:modelValue', newValue);
  },
  { deep: true }
);

watch(
  () => props.modelValue,
  (newValue) => {
    route.value = newValue;
  },
  { deep: true }
);

const pretty = (v: any) => {
  try { return JSON.stringify(v ?? {}, null, 2) } catch { return '' }
}
</script>

<style scoped></style>