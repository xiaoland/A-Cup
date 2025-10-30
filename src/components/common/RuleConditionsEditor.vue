<script setup lang="ts">
import { computed, ref, inject } from 'vue';
import type { ComputedRef } from 'vue';
import InputChips from 'primevue/inputchips';
import Button from 'primevue/button';
import Select from 'primevue/select';
import MultiSelect from 'primevue/multiselect';
import type { SingBoxRuleSet } from '../../../schemas/route';

// Define available condition types
type ConditionConfig = {
  label: string;
  value: ConditionKey;
  placeholder: string;
  isSelect?: boolean;
  isMultiSelect?: boolean;
};

const conditionTypes: ConditionConfig[] = [
  { label: 'Rule Sets', value: 'rule_set', placeholder: 'Select Rule Sets', isMultiSelect: true },
  { label: 'Domain', value: 'domain', placeholder: 'Add domains' },
  { label: 'Domain Suffix', value: 'domain_suffix', placeholder: 'Add domain suffixes' },
  { label: 'Domain Keyword', value: 'domain_keyword', placeholder: 'Add domain keywords' },
  { label: 'Domain Regex', value: 'domain_regex', placeholder: 'Add regex patterns' },
  { label: 'Source IP CIDR', value: 'source_ip_cidr', placeholder: 'Add IP CIDR (e.g., 192.168.0.0/24)' },
  { label: 'Network Type', value: 'network', placeholder: 'Select Network Type', isSelect: true },
];

type ConditionKey = 'rule_set' | 'domain' | 'domain_suffix' | 'domain_keyword' | 'domain_regex' | 'source_ip_cidr' | 'network';

interface Conditions {
  rule_set?: string[];
  domain?: string[];
  domain_suffix?: string[];
  domain_keyword?: string[];
  domain_regex?: string[];
  source_ip_cidr?: string[];
  network?: 'tcp' | 'udp';
}

// Inject profileRuleSets for rule_set picker
const profileRuleSets = inject<ComputedRef<SingBoxRuleSet[]>>('profileRuleSets');

const props = defineProps<{
  modelValue: Conditions;
}>();

const emit = defineEmits(['update:modelValue']);

const conditions = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

// Track which conditions are currently visible
const visibleConditions = computed(() => {
  const visible: ConditionKey[] = [];
  for (const item of conditionTypes) {
    if (conditions.value[item.value] !== undefined) {
      visible.push(item.value);
    }
  }
  return visible;
});

// Available conditions to add (not already visible)
const availableConditions = computed(() => {
  return conditionTypes.filter(
    (type) => !visibleConditions.value.includes(type.value as ConditionKey)
  );
});

const selectedConditionToAdd = ref<string | null>(null);

const networkTypes = [
  { label: 'TCP', value: 'tcp' },
  { label: 'UDP', value: 'udp' },
];

const addCondition = () => {
  if (selectedConditionToAdd.value) {
    const conditionType = conditionTypes.find((c) => c.value === selectedConditionToAdd.value);
    if (conditionType) {
      const key = conditionType.value as ConditionKey;
      if (conditionType.isSelect) {
        conditions.value = { ...conditions.value, [key]: undefined };
      } else {
        // Both InputChips and MultiSelect use arrays
        conditions.value = { ...conditions.value, [key]: [] };
      }
    }
    selectedConditionToAdd.value = null;
  }
};

const ruleSetOptions = computed(() => {
  if (!profileRuleSets?.value) {
    return [];
  }
  return profileRuleSets.value;
});

const removeCondition = (key: ConditionKey) => {
  const newConditions = { ...conditions.value };
  delete newConditions[key];
  // Emit the new object to ensure reactivity
  emit('update:modelValue', newConditions);
};

const getConditionConfig = (key: ConditionKey) => {
  return conditionTypes.find((c) => c.value === key);
};
</script>

<template>
  <div class="rule-conditions-editor">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-for="key in visibleConditions" :key="key" class="condition-field">
        <div class="flex align-items-center justify-content-between mb-2">
          <label class="font-medium">
            {{ getConditionConfig(key)?.label }}
          </label>
          <Button
            icon="pi pi-times"
            size="small"
            text
            rounded
            severity="danger"
            @click="removeCondition(key)"
            class="h-2rem w-2rem flex-shrink-0"
          />
        </div>
        
        <MultiSelect
          v-if="getConditionConfig(key)?.isMultiSelect"
          v-model="conditions[key] as string[]"
          :options="ruleSetOptions"
          optionLabel="tag"
          optionValue="tag"
          :placeholder="getConditionConfig(key)?.placeholder"
          class="w-full"
          showClear
        />
        
        <InputChips
          v-else-if="!getConditionConfig(key)?.isSelect"
          v-model="conditions[key] as string[]"
          :placeholder="getConditionConfig(key)?.placeholder"
          class="w-full"
        />
        
        <Select
          v-else
          v-model="conditions[key] as 'tcp' | 'udp' | undefined"
          :options="networkTypes"
          optionLabel="label"
          optionValue="value"
          :placeholder="getConditionConfig(key)?.placeholder"
          class="w-full"
          showClear
        />
      </div>
    </div>

    <!-- Add Condition Button -->
    <div v-if="availableConditions.length > 0" class="mt-4 flex gap-2">
      <Select
        v-model="selectedConditionToAdd"
        :options="availableConditions"
        optionLabel="label"
        optionValue="value"
        placeholder="Select condition to add..."
        class="flex-1"
      />
      <Button
        label="Add Condition"
        icon="pi pi-plus"
        @click="addCondition"
        :disabled="!selectedConditionToAdd"
      />
    </div>
    <div v-else-if="visibleConditions.length === 0" class="text-center py-4 text-500">
      <p>No conditions added yet.</p>
      <p class="text-sm mt-2">Use the "Add Condition" button below to add conditions.</p>
    </div>
  </div>
</template>

<style scoped>
.condition-field {
  position: relative;
}

.flex {
  display: flex;
}

.align-items-center {
  align-items: center;
}

.justify-content-between {
  justify-content: space-between;
}

.flex-shrink-0 {
  flex-shrink: 0;
}
</style>
