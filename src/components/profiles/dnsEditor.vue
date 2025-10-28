<script setup lang="ts">
import { computed } from 'vue';
import type { Dns, DNSServer, DNSRule } from '../../../schemas/dns';
import DnsServerEditor from '@/components/dns/dnsServerEditor.vue';
import DnsRuleEditor from '@/components/dns/dnsRuleEditor.vue';
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';

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
  const newRule: DNSRule = { action: 'route', server: '' }; // simplified for example
  dns.value.rules = [...dns.value.rules, newRule];
};

const removeRule = (index: number) => {
  const newRules = [...dns.value.rules];
  newRules.splice(index, 1);
  dns.value.rules = newRules;
};

const domainStrategies = ['prefer_ipv4', 'prefer_ipv6', 'ipv4_only', 'ipv6_only'];

</script>

<template>
  <div class="p-fluid">
    <div class="p-field">
      <label for="final">Final Server</label>
      <InputText id="final" v-model="dns.final" />
    </div>
    <div class="p-field">
      <label for="strategy">Strategy</label>
      <Dropdown id="strategy" v-model="dns.strategy" :options="domainStrategies" placeholder="Select a Strategy" />
    </div>

    <h4 class="p-mt-4">Servers</h4>
    <Accordion :activeIndex="0">
      <AccordionTab v-for="(server, index) in dns.servers" :key="index" :header="server.tag">
        <Button icon="pi pi-trash" class="p-button-danger p-mb-2" @click="removeServer(index)" />
        <DnsServerEditor v-model="dns.servers[index]" />
      </AccordionTab>
    </Accordion>
    <Button label="Add Server" icon="pi pi-plus" class="p-button-success p-mt-2" @click="addServer" />

    <h4 class="p-mt-4">Rules</h4>
    <Accordion :activeIndex="0">
      <AccordionTab v-for="(rule, index) in dns.rules" :key="index" :header="`Rule ${index + 1}`">
        <Button icon="pi pi-trash" class="p-button-danger p-mb-2" @click="removeRule(index)" />
        <DnsRuleEditor v-model="dns.rules[index]" />
      </AccordionTab>
    </Accordion>
    <Button label="Add Rule" icon="pi pi-plus" class="p-button-success p-mt-2" @click="addRule" />
  </div>
</template>
