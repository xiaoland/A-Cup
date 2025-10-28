<script setup lang="ts">
import { computed } from 'vue';
import type { Dns, DNSServer, DNSRule } from '../../../schemas/dns';
import DnsServerEditor from '@/components/dns/dnsServerEditor.vue';
import DnsRuleEditor from '@/components/dns/dnsRuleEditor.vue';
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import Fieldset from 'primevue/fieldset';

const props = defineProps<{
  modelValue: Dns;
}>();

const emit = defineEmits(['update:modelValue']);

const dns = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const addServer = () => {
  const newServer: DNSServer = { type: 'udp', tag: `new-server-${dns.value.servers.length + 1}`, address: '' };
  dns.value.servers = [...dns.value.servers, newServer];
};

const removeServer = (index: number) => {
  const newServers = [...dns.value.servers];
  newServers.splice(index, 1);
  dns.value.servers = newServers;
};

const addRule = () => {
  const newRule: DNSRule = { action: 'route', server: '' };
  dns.value.rules = [...dns.value.rules, newRule];
};

const removeRule = (index: number) => {
  const newRules = [...dns.value.rules];
  newRules.splice(index, 1);
  dns.value.rules = newRules;
};

const domainStrategies = [
  { label: 'Prefer IPv4', value: 'prefer_ipv4' },
  { label: 'Prefer IPv6', value: 'prefer_ipv6' },
  { label: 'IPv4 Only', value: 'ipv4_only' },
  { label: 'IPv6 Only', value: 'ipv6_only' },
];

const serverTags = computed(() => dns.value.servers.map(server => ({ label: server.tag, value: server.tag })));

</script>

<template>
  <div class="p-4">
    <!-- Basic Settings -->
    <div class="border border-gray-300 rounded-lg p-4 mb-4 bg-gray-50">
      <h3 class="text-lg font-semibold mb-4">Basic Settings</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="final" class="block mb-2 font-medium">Final Server</label>
          <Dropdown 
            id="final" 
            v-model="dns.final" 
            :options="serverTags" 
            optionLabel="label"
            optionValue="value"
            placeholder="Select final DNS server" 
            class="w-full"
            :showClear="true"
          />
        </div>
        <div>
          <label for="strategy" class="block mb-2 font-medium">Domain Strategy</label>
          <Dropdown 
            id="strategy" 
            v-model="dns.strategy" 
            :options="domainStrategies" 
            optionLabel="label"
            optionValue="value"
            placeholder="Select domain strategy" 
            class="w-full" 
          />
        </div>
      </div>
    </div>

    <!-- DNS Servers -->
    <Fieldset legend="DNS Servers" class="mt-4">
      <div v-if="dns.servers.length > 0">
        <Accordion :multiple="true" class="mb-3">
          <AccordionTab v-for="(server, index) in dns.servers" :key="index">
            <template #header>
              <div class="flex items-center justify-between w-full">
                <span class="font-medium">{{ server.tag || `Server ${index + 1}` }}</span>
                <span class="text-sm text-gray-500 ml-2">({{ server.type }})</span>
              </div>
            </template>
            <div class="flex justify-end mb-3">
              <Button 
                icon="pi pi-trash" 
                severity="danger" 
                size="small"
                text
                @click="removeServer(index)" 
                label="Remove"
              />
            </div>
            <DnsServerEditor v-model="dns.servers[index]" />
          </AccordionTab>
        </Accordion>
      </div>
      <div v-else class="text-center py-4 text-gray-500">
        No DNS servers configured. Add one to get started.
      </div>
      <Button 
        label="Add DNS Server" 
        icon="pi pi-plus" 
        severity="success" 
        @click="addServer" 
        outlined
      />
    </Fieldset>

    <!-- DNS Rules -->
    <Fieldset legend="DNS Rules" class="mt-4">
      <div v-if="dns.rules.length > 0">
        <Accordion :multiple="true" class="mb-3">
          <AccordionTab v-for="(rule, index) in dns.rules" :key="index">
            <template #header>
              <div class="flex items-center justify-between w-full">
                <span class="font-medium">Rule {{ index + 1 }}</span>
                <span class="text-sm text-gray-500 ml-2">({{ rule.action || 'route' }})</span>
              </div>
            </template>
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
            <DnsRuleEditor v-model="dns.rules[index]" />
          </AccordionTab>
        </Accordion>
      </div>
      <div v-else class="text-center py-4 text-gray-500">
        No DNS rules configured. Add one to route DNS queries.
      </div>
      <Button 
        label="Add DNS Rule" 
        icon="pi pi-plus" 
        severity="success" 
        @click="addRule" 
        outlined
      />
    </Fieldset>
  </div>
</template>
