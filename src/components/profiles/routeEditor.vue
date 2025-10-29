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
import InputText from 'primevue/inputtext';
import ToggleButton from 'primevue/togglebutton';
import Fieldset from 'primevue/fieldset';
import InputChips from 'primevue/inputchips';
import Select from 'primevue/select';

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
  const newRule: RouteRule = { outbound: '' };
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
    type: 'remote', 
    tag: `rule-set-${(route.value.rule_set?.length || 0) + 1}`,
    url: ''
  };
  route.value.rule_set = [...(route.value.rule_set || []), newRuleSet];
};

const removeRuleSet = (index: number) => {
  const newRuleSets = [...(route.value.rule_set || [])];
  newRuleSets.splice(index, 1);
  route.value.rule_set = newRuleSets;
};

const ruleSetTypes = [
  { label: 'Remote', value: 'remote' },
  { label: 'Local', value: 'local' },
  { label: 'Inline', value: 'inline' },
];

const formatOptions = [
  { label: 'Source', value: 'source' },
  { label: 'Binary', value: 'binary' },
];

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
  if (rule.outbound) return `Rule ${index + 1}: → ${rule.outbound}`;
  if (rule.outbounds) return `Rule ${index + 1}: → [${rule.outbounds.join(', ')}]`;
  return `Rule ${index + 1}`;
};

const getRuleSetTypeLabel = (ruleSet: SingBoxRuleSet): string => {
  return ruleSet.type.charAt(0).toUpperCase() + ruleSet.type.slice(1);
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

            <div class="grid gap-4">
              <!-- Outbound Selection -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label :for="`rule-outbound-${index}`" class="block mb-2 font-medium">
                    Single Outbound
                  </label>
                  <InputText 
                    :id="`rule-outbound-${index}`"
                    v-model="rule.outbound" 
                    class="w-full" 
                    placeholder="Outbound tag"
                    :disabled="!!rule.outbounds"
                  />
                </div>
                
                <div>
                  <label :for="`rule-outbounds-${index}`" class="block mb-2 font-medium">
                    Multiple Outbounds
                  </label>
                  <InputChips 
                    :id="`rule-outbounds-${index}`"
                    v-model="rule.outbounds" 
                    placeholder="Add outbound tags"
                    class="w-full"
                    :disabled="!!rule.outbound"
                  />
                </div>
              </div>

              <!-- Rule Conditions -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label :for="`rule-ruleset-${index}`" class="block mb-2 font-medium">
                    Rule Sets
                  </label>
                  <InputChips 
                    :id="`rule-ruleset-${index}`"
                    v-model="rule.rule_set" 
                    placeholder="Add rule set tags"
                    class="w-full"
                  />
                </div>

                <div>
                  <label :for="`rule-domain-${index}`" class="block mb-2 font-medium">
                    Domain
                  </label>
                  <InputChips 
                    :id="`rule-domain-${index}`"
                    v-model="rule.domain" 
                    placeholder="Add domains"
                    class="w-full"
                  />
                </div>

                <div>
                  <label :for="`rule-domain-suffix-${index}`" class="block mb-2 font-medium">
                    Domain Suffix
                  </label>
                  <InputChips 
                    :id="`rule-domain-suffix-${index}`"
                    v-model="rule.domain_suffix" 
                    placeholder="Add domain suffixes"
                    class="w-full"
                  />
                </div>

                <div>
                  <label :for="`rule-domain-keyword-${index}`" class="block mb-2 font-medium">
                    Domain Keyword
                  </label>
                  <InputChips 
                    :id="`rule-domain-keyword-${index}`"
                    v-model="rule.domain_keyword" 
                    placeholder="Add domain keywords"
                    class="w-full"
                  />
                </div>

                <div>
                  <label :for="`rule-domain-regex-${index}`" class="block mb-2 font-medium">
                    Domain Regex
                  </label>
                  <InputChips 
                    :id="`rule-domain-regex-${index}`"
                    v-model="rule.domain_regex" 
                    placeholder="Add regex patterns"
                    class="w-full"
                  />
                </div>
              </div>
            </div>
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
                <span class="text-sm text-gray-500 ml-2">({{ getRuleSetTypeLabel(ruleSet) }})</span>
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

            <div class="grid gap-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label :for="`ruleset-type-${index}`" class="block mb-2 font-medium">
                    Type
                  </label>
                  <Select 
                    :id="`ruleset-type-${index}`"
                    v-model="ruleSet.type" 
                    :options="ruleSetTypes"
                    optionLabel="label"
                    optionValue="value"
                    class="w-full"
                  />
                </div>

                <div>
                  <label :for="`ruleset-tag-${index}`" class="block mb-2 font-medium">
                    Tag
                  </label>
                  <InputText 
                    :id="`ruleset-tag-${index}`"
                    v-model="ruleSet.tag" 
                    class="w-full" 
                    placeholder="Rule set identifier"
                  />
                </div>
              </div>

              <!-- Remote Type Fields -->
              <template v-if="ruleSet.type === 'remote'">
                <div>
                  <label :for="`ruleset-url-${index}`" class="block mb-2 font-medium">
                    URL
                  </label>
                  <InputText 
                    :id="`ruleset-url-${index}`"
                    v-model="ruleSet.url" 
                    class="w-full" 
                    placeholder="https://example.com/ruleset.json"
                  />
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label :for="`ruleset-format-${index}`" class="block mb-2 font-medium">
                      Format
                    </label>
                    <Select 
                      :id="`ruleset-format-${index}`"
                      v-model="ruleSet.format" 
                      :options="formatOptions"
                      optionLabel="label"
                      optionValue="value"
                      placeholder="Select format"
                      class="w-full"
                    />
                  </div>

                  <div>
                    <label :for="`ruleset-download-detour-${index}`" class="block mb-2 font-medium">
                      Download Detour
                    </label>
                    <InputText 
                      :id="`ruleset-download-detour-${index}`"
                      v-model="ruleSet.download_detour" 
                      class="w-full" 
                      placeholder="Outbound tag"
                    />
                  </div>

                  <div>
                    <label :for="`ruleset-update-interval-${index}`" class="block mb-2 font-medium">
                      Update Interval
                    </label>
                    <InputText 
                      :id="`ruleset-update-interval-${index}`"
                      v-model="ruleSet.update_interval" 
                      class="w-full" 
                      placeholder="1h, 24h, etc."
                    />
                  </div>
                </div>
              </template>

              <!-- Local Type Fields -->
              <template v-if="ruleSet.type === 'local'">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label :for="`ruleset-path-${index}`" class="block mb-2 font-medium">
                      Path
                    </label>
                    <InputText 
                      :id="`ruleset-path-${index}`"
                      v-model="ruleSet.path" 
                      class="w-full" 
                      placeholder="/path/to/ruleset.json"
                    />
                  </div>

                  <div>
                    <label :for="`ruleset-format-${index}`" class="block mb-2 font-medium">
                      Format
                    </label>
                    <Select 
                      :id="`ruleset-format-${index}`"
                      v-model="ruleSet.format" 
                      :options="formatOptions"
                      optionLabel="label"
                      optionValue="value"
                      placeholder="Select format"
                      class="w-full"
                    />
                  </div>
                </div>
              </template>

              <!-- Inline Type Fields -->
              <template v-if="ruleSet.type === 'inline'">
                <div>
                  <label class="block mb-2 font-medium">Inline Rules</label>
                  <p class="text-sm text-gray-500 mb-2">
                    Use the Advanced section below to configure inline rules (JSON editor)
                  </p>
                </div>
              </template>
            </div>
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
