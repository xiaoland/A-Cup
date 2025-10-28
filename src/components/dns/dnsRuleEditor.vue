<script setup lang="ts">
import { computed } from 'vue';
import type { DNSRule } from '../../../schemas/dns';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import Chips from 'primevue/chips';
import InputSwitch from 'primevue/inputswitch';
import Fieldset from 'primevue/fieldset';

const props = defineProps<{
  modelValue: DNSRule;
}>();

const emit = defineEmits(['update:modelValue']);

const rule = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const actionTypes = [
  { label: 'Route', value: 'route' },
  { label: 'Route Options', value: 'route-options' },
  { label: 'Reject', value: 'reject' },
  { label: 'Predefined', value: 'predefined' },
];

const networkTypes = [
  { label: 'TCP', value: 'tcp' },
  { label: 'UDP', value: 'udp' },
];

const rejectMethods = [
  { label: 'Default', value: 'default' },
  { label: 'Drop', value: 'drop' },
];

const onActionChange = (newAction: 'route' | 'route-options' | 'reject' | 'predefined') => {
  const { domain, domain_suffix, domain_keyword, domain_regex, source_ip_cidr, network } = rule.value;
  const newRule: Partial<DNSRule> = {
    domain,
    domain_suffix,
    domain_keyword,
    domain_regex,
    source_ip_cidr,
    network,
    action: newAction,
  };
  rule.value = newRule as DNSRule;
};

</script>

<template>
  <div class="dns-rule-editor">
    <Fieldset legend="Rule Conditions" :toggleable="true">
      <div class="formgrid grid">
        <div class="field col-12 md:col-6">
          <label for="domain">Domain</label>
          <Chips 
            id="domain" 
            v-model="rule.domain" 
            placeholder="Add domain"
            class="w-full"
          />
        </div>
        
        <div class="field col-12 md:col-6">
          <label for="domain_suffix">Domain Suffix</label>
          <Chips 
            id="domain_suffix" 
            v-model="rule.domain_suffix" 
            placeholder="Add domain suffix"
            class="w-full"
          />
        </div>
        
        <div class="field col-12 md:col-6">
          <label for="domain_keyword">Domain Keyword</label>
          <Chips 
            id="domain_keyword" 
            v-model="rule.domain_keyword" 
            placeholder="Add domain keyword"
            class="w-full"
          />
        </div>
        
        <div class="field col-12 md:col-6">
          <label for="domain_regex">Domain Regex</label>
          <Chips 
            id="domain_regex" 
            v-model="rule.domain_regex" 
            placeholder="Add domain regex pattern"
            class="w-full"
          />
        </div>
        
        <div class="field col-12 md:col-6">
          <label for="source_ip_cidr">Source IP CIDR</label>
          <Chips 
            id="source_ip_cidr" 
            v-model="rule.source_ip_cidr" 
            placeholder="Add IP CIDR (e.g., 192.168.0.0/24)"
            class="w-full"
          />
        </div>
        
        <div class="field col-12 md:col-6">
          <label for="network">Network Type</label>
          <Dropdown 
            id="network" 
            v-model="rule.network" 
            :options="networkTypes" 
            optionLabel="label"
            optionValue="value"
            placeholder="Select Network Type (optional)"
            class="w-full"
            showClear
          />
        </div>
      </div>
    </Fieldset>

    <Fieldset legend="Rule Action" :toggleable="true" class="mt-3">
      <div class="formgrid grid">
        <div class="field col-12">
          <label for="action">Action Type</label>
          <Dropdown 
            id="action" 
            :modelValue="rule.action" 
            :options="actionTypes" 
            optionLabel="label"
            optionValue="value"
            @update:modelValue="onActionChange" 
            placeholder="Select an Action"
            class="w-full"
          />
        </div>

        <!-- Route Action -->
        <template v-if="rule.action === 'route'">
          <div class="field col-12 md:col-8">
            <label for="route-server">Server</label>
            <InputText 
              id="route-server" 
              v-model="rule.server" 
              placeholder="DNS server tag"
              class="w-full"
            />
          </div>
          
          <div class="field col-12 md:col-4 flex align-items-center">
            <div class="field-checkbox">
              <InputSwitch 
                inputId="route-disable_cache" 
                v-model="rule.disable_cache" 
              />
              <label for="route-disable_cache" class="ml-2">Disable Cache</label>
            </div>
          </div>
        </template>

        <!-- Route Options Action -->
        <template v-if="rule.action === 'route-options'">
          <div class="field col-12">
            <div class="field-checkbox">
              <InputSwitch 
                inputId="ro-disable_cache" 
                v-model="rule.disable_cache" 
              />
              <label for="ro-disable_cache" class="ml-2">Disable Cache</label>
            </div>
          </div>
        </template>

        <!-- Reject Action -->
        <template v-if="rule.action === 'reject'">
          <div class="field col-12 md:col-6">
            <label for="reject-method">Reject Method</label>
            <Dropdown 
              id="reject-method" 
              v-model="rule.method" 
              :options="rejectMethods" 
              optionLabel="label"
              optionValue="value"
              placeholder="Select reject method"
              class="w-full"
            />
          </div>
        </template>

        <!-- Predefined Action -->
        <template v-if="rule.action === 'predefined'">
          <div class="field col-12">
            <label for="pre-answer">Answer (IP addresses)</label>
            <Chips 
              id="pre-answer" 
              v-model="rule.answer" 
              placeholder="Add IP addresses"
              class="w-full"
            />
          </div>
        </template>
      </div>
    </Fieldset>
  </div>
</template>
