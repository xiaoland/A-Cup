<script setup lang="ts">
import { computed } from 'vue';
import type { Route, RouteRule, SingBoxRuleSet } from '../../../schemas/route';
import JSONEditor from '@/components/common/JSONEditor.vue';
import SingBoxOutboundPicker from '@/components/outbounds/singBoxOutboundPicker.vue';
import Accordion from 'primevue/accordion';
import AccordionPanel from 'primevue/accordionpanel';
import AccordionHeader from 'primevue/accordionheader';
import AccordionContent from 'primevue/accordioncontent';
import Button from 'primevue/button';
import ToggleButton from 'primevue/togglebutton';
import Fieldset from 'primevue/fieldset';
import HybirdRuleSetEditor from '../rule-sets/hybirdRuleSetEditor.vue';
import RouteRuleEditor from '../route/routeRuleEditor.vue';

const props = defineProps<{
  modelValue: Route;
}>();

const emit = defineEmits(['update:modelValue']);

const route = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

// Basic Settings
const final = computed({
  get: () => props.modelValue.final || undefined,
  set: (value) => emit('update:modelValue', { ...props.modelValue, final: value }),
});

const autoDetectInterface = computed({
  get: () => props.modelValue.auto_detect_interface || false,
  set: (value) => emit('update:modelValue', { ...props.modelValue, auto_detect_interface: value }),
});

// Rules Management
const addRule = () => {
  const newRule: RouteRule = { action: 'route', outbound: '' };
  route.value.rules = [...(route.value.rules || []), newRule];
};

const removeRule = (index: number) => {
  const newRules = [...(route.value.rules || [])];
  newRules.splice(index, 1);
  route.value.rules = newRules;
};

// Rule Sets Management
const addRuleSet = () => {
  const newRuleSet: SingBoxRuleSet = {
    type: 'inline',
    tag: `rule-set-${(route.value.rule_set?.length || 0) + 1}`,
    rules: [],
  };
  route.value.rule_set = [...(route.value.rule_set || []), newRuleSet];
};

const removeRuleSet = (index: number) => {
  const newRuleSets = [...(route.value.rule_set || [])];
  newRuleSets.splice(index, 1);
  route.value.rule_set = newRuleSets;
};

// Advanced Fields
const advancedFields = computed(() => {
  const { rules, rule_set, final, auto_detect_interface, ...rest } = props.modelValue;
  return rest;
});

const onAdvancedChange = (newValue: any) => {
  emit('update:modelValue', {
    ...props.modelValue,
    ...newValue,
  });
};

const getRuleLabel = (rule: RouteRule, index: number): string => {
  if (rule.action === 'route' && rule.outbound) {
    return `Rule ${index + 1}: → ${rule.outbound}`;
  }
  if (rule.action === 'hijack-dns' && rule.server) {
    return `Rule ${index + 1}: dns → ${rule.server}`;
  }
  return `Rule ${index + 1}: ${rule.action}`;
};
</script>

<template>
  <div class="p-4">
    <!-- Basic Settings -->
    <div class="border border-gray-300 rounded-lg p-4 mb-4 bg-gray-50">
      <h3 class="text-lg font-semibold mb-4">Basic Settings</h3>
      <div class="grid gap-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="final" class="block mb-2 font-medium">Final Outbound</label>
            <SingBoxOutboundPicker
              id="final" 
              v-model="final"
            />
            <small class="block mt-1 text-gray-500">Outbound to use when no rule matches</small>
          </div>
          
          <div class="flex items-center gap-3">
            <ToggleButton 
              id="auto_detect_interface" 
              v-model="autoDetectInterface" 
            />
            <label for="auto_detect_interface" class="font-medium cursor-pointer">
              Auto Detect Interface
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Route Rules -->
    <Fieldset legend="Route Rules" class="mt-4">
      <div v-if="route.rules && route.rules.length > 0">
        <Accordion :multiple="true" class="mb-3">
          <AccordionPanel v-for="(rule, index) in route.rules" :key="index" :value="index.toString()">
            <AccordionHeader>
              <span class="font-medium">{{ getRuleLabel(rule, index) }}</span>
            </AccordionHeader>
            <AccordionContent>
              <div class="flex justify-end mb-3">
                <Button 
                  icon="pi pi-trash" 
                  severity="danger" 
                  size="small"
                  text
                  @click="removeRule(index)" 
                  label="Remove"
                />
              </div>
              <RouteRuleEditor v-model="route.rules[index]" />
            </AccordionContent>
          </AccordionPanel>
        </Accordion>
      </div>
      <div v-else class="text-center py-6 text-gray-500">
        No route rules configured. Add one to route traffic based on conditions.
      </div>
      <Button 
        label="Add Route Rule" 
        icon="pi pi-plus" 
        severity="success" 
        @click="addRule" 
        outlined
      />
    </Fieldset>

    <!-- Rule Sets -->
    <Fieldset legend="Rule Sets" class="mt-4">
      <div v-if="route.rule_set && route.rule_set.length > 0">
        <Accordion :multiple="true" class="mb-3">
          <AccordionPanel v-for="(ruleSet, index) in route.rule_set" :key="index" :value="`ruleset-${index}`">
            <AccordionHeader>
              <div class="flex items-center justify-between w-full pr-4">
                <span class="font-medium">{{ ruleSet.tag || `Rule Set ${index + 1}` }}</span>
              </div>
            </AccordionHeader>
            <AccordionContent>
              <div class="flex justify-end mb-3">
                <Button
                  icon="pi pi-trash"
                  severity="danger"
                  size="small"
                  text
                  @click="removeRuleSet(index)"
                  label="Remove"
                />
              </div>
              <HybirdRuleSetEditor v-model="route.rule_set[index]" />
            </AccordionContent>
          </AccordionPanel>
        </Accordion>
      </div>
      <div v-else class="text-center py-6 text-gray-500">
        No rule sets configured. Add one to define reusable routing rules.
      </div>
      <Button
        label="Add Rule Set"
        icon="pi pi-plus"
        severity="success"
        @click="addRuleSet"
        outlined
      />
    </Fieldset>

    <!-- Advanced Settings -->
    <Fieldset legend="Advanced Settings" :toggleable="true" :collapsed="true" class="mt-4">
      <JSONEditor :modelValue="advancedFields" @update:modelValue="onAdvancedChange" />
      <div class="mt-3 text-sm text-gray-500">
        <p class="mb-2"><strong>Available advanced options:</strong></p>
        <ul class="list-disc list-inside space-y-1">
          <li>override_android_vpn (boolean)</li>
          <li>default_interface (string)</li>
          <li>default_mark (integer)</li>
          <li>default_domain_resolver (string)</li>
          <li>default_network_strategy (string)</li>
          <li>default_network_type (array of strings)</li>
          <li>default_fallback_network_type (array of strings)</li>
          <li>default_fallback_delay (string)</li>
        </ul>
      </div>
    </Fieldset>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
}

.gap-4 {
  gap: 1rem;
}

.gap-3 {
  gap: 0.75rem;
}

.grid-cols-1 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

@media (min-width: 768px) {
  .md\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  
  .md\:grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
