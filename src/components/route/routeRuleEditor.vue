<script setup lang="ts">
import { computed } from 'vue';
import type { RouteRule } from '../../../schemas/route';
import InputText from 'primevue/inputtext';
import InputChips from 'primevue/inputchips';
import Select from 'primevue/select';
import Fieldset from 'primevue/fieldset';

const props = defineProps<{
  modelValue: RouteRule;
}>();

const emit = defineEmits(['update:modelValue']);

const rule = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const actionTypes = [
  { label: 'Route', value: 'route' },
  { label: 'Reject', value: 'reject' },
  { label: 'Hijack DNS', value: 'hijack-dns' },
];

const onActionChange = (newAction: 'route' | 'reject' | 'hijack-dns') => {
  // Preserve existing fields while changing the action
  const newRule = { ...rule.value, action: newAction };

  // Clear action-specific fields that are no longer relevant
  if (newAction !== 'route') {
    delete newRule.outbound;
  }
  if (newAction !== 'hijack-dns') {
    delete newRule.server;
  }

  rule.value = newRule as RouteRule;
};
</script>

<template>
  <div>
    <Fieldset legend="Rule Action">
      <div class="grid">
        <div class="col-12">
          <label for="action" class="block mb-2 font-medium">Action Type</label>
          <Select
            id="action"
            :modelValue="rule.action"
            @update:modelValue="onActionChange"
            :options="actionTypes"
            optionLabel="label"
            optionValue="value"
            placeholder="Select an action"
            class="w-full"
          />
        </div>

        <template v-if="rule.action === 'route'">
          <div class="col-12 mt-4">
            <label for="outbound" class="block mb-2 font-medium">Outbound</label>
            <InputText
              id="outbound"
              v-model="rule.outbound"
              class="w-full"
              placeholder="Outbound tag"
            />
          </div>
        </template>

        <template v-if="rule.action === 'hijack-dns'">
          <div class="col-12 mt-4">
            <label for="server" class="block mb-2 font-medium">DNS Server</label>
            <InputText
              id="server"
              v-model="rule.server"
              class="w-full"
              placeholder="DNS server tag"
            />
          </div>
        </template>
      </div>
    </Fieldset>

    <Fieldset legend="Rule Conditions" class="mt-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block mb-2 font-medium">
            Rule Sets
          </label>
          <InputChips
            v-model="rule.rule_set"
            placeholder="Add rule set tags"
            class="w-full"
          />
        </div>

        <div>
          <label class="block mb-2 font-medium">
            Domain
          </label>
          <InputChips
            v-model="rule.domain"
            placeholder="Add domains"
            class="w-full"
          />
        </div>

        <div>
          <label class="block mb-2 font-medium">
            Domain Suffix
          </label>
          <InputChips
            v-model="rule.domain_suffix"
            placeholder="Add domain suffixes"
            class="w-full"
          />
        </div>

        <div>
          <label class="block mb-2 font-medium">
            Domain Keyword
          </label>
          <InputChips
            v-model="rule.domain_keyword"
            placeholder="Add domain keywords"
            class="w-full"
          />
        </div>

        <div>
          <label class="block mb-2 font-medium">
            Domain Regex
          </label>
          <InputChips
            v-model="rule.domain_regex"
            placeholder="Add regex patterns"
            class="w-full"
          />
        </div>
      </div>
    </Fieldset>
  </div>
</template>
