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

const actionTypes = ['route', 'route-options', 'reject', 'predefined'];
const networkTypes = ['tcp', 'udp'];

const onActionChange = (newAction: 'route' | 'route-options' | 'reject' | 'predefined') => {
  const { domain, domain_suffix, domain_keyword, domain_regex, source_ip_cidr } = rule.value;
  const newRule: Partial<DNSRule> = {
    domain, domain_suffix, domain_keyword, domain_regex, source_ip_cidr,
    action: newAction
  };
  rule.value = newRule as DNSRule;
};

</script>

<template>
  <div>
    <Fieldset legend="Rule Conditions" :toggleable="true">
      <div class="formgrid grid">
        <div class="field col-12 md:col-6">
          <div class="field">
            <label for="domain">Domain</label>
            <Chips id="domain" v-model="rule.domain" />
          </div>
          <div class="field">
            <label for="domain_suffix">Domain Suffix</label>
            <Chips id="domain_suffix" v-model="rule.domain_suffix" />
          </div>
          <div class="field">
            <label for="domain_keyword">Domain Keyword</label>
            <Chips id="domain_keyword" v-model="rule.domain_keyword" />
          </div>
        </div>
        <div class="field col-12 md:col-6">
          <div class="field">
            <label for="domain_regex">Domain Regex</label>
            <Chips id="domain_regex" v-model="rule.domain_regex" />
          </div>
          <div class="field">
            <label for="source_ip_cidr">Source IP CIDR</label>
            <Chips id="source_ip_cidr" v-model="rule.source_ip_cidr" />
          </div>
           <div class="field">
            <label for="network">Network</label>
            <Dropdown id="network" v-model="rule.network" :options="networkTypes" placeholder="Select Network Type" />
          </div>
        </div>
      </div>
    </Fieldset>

    <Fieldset legend="Rule Action" :toggleable="true" class="mt-3">
      <div class="field">
        <label for="action">Action Type</label>
        <Dropdown id="action" :modelValue="rule.action" :options="actionTypes" @update:modelValue="onActionChange" placeholder="Select an Action" />
      </div>

      <template v-if="rule.action === 'route'">
        <div class="field">
          <label for="route-server">Server</label>
          <InputText id="route-server" v-model="rule.server" />
        </div>
        <div class="field-checkbox">
          <InputSwitch id="route-disable_cache" v-model="rule.disable_cache" />
          <label for="route-disable_cache">Disable Cache</label>
        </div>
      </template>

      <template v-if="rule.action === 'route-options'">
        <div class="field-checkbox">
          <InputSwitch id="ro-disable_cache" v-model="rule.disable_cache" />
          <label for="ro-disable_cache">Disable Cache</label>
        </div>
      </template>

      <template v-if="rule.action === 'reject'">
        <div class="field">
          <label for="reject-method">Method</label>
          <Dropdown id="reject-method" v-model="rule.method" :options="['default', 'drop']" />
        </div>
      </template>

      <template v-if="rule.action === 'predefined'">
        <div class="field">
          <label for="pre-answer">Answer</label>
          <Chips id="pre-answer" v-model="rule.answer" />
        </div>
      </template>

    </Fieldset>
  </div>
</template>
