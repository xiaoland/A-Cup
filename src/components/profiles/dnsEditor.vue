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
  <div>
    <div class="formgrid grid">
      <div class="field col-12 md:col-6">
        <label for="final">Final Server</label>
        <InputText id="final" v-model="dns.final" />
      </div>
      <div class="field col-12 md:col-6">
        <label for="strategy">Strategy</label>
        <Dropdown id="strategy" v-model="dns.strategy" :options="domainStrategies" placeholder="Select a Strategy" />
      </div>
    </div>

    <Accordion :activeIndex="0" class="mt-3">
      <AccordionTab v-for="(server, index) in dns.servers" :key="index" :header="server.tag">
        <div class="flex justify-content-end">
          <Button icon="pi pi-trash" severity="danger" @click="removeServer(index)" />
        </div>
        <DnsServerEditor v-model="dns.servers[index]" class="mt-3" />
      </AccordionTab>
    </Accordion>
    <Button label="Add Server" icon="pi pi-plus" severity="success" class="mt-2" @click="addServer" />

    <Accordion :activeIndex="0" class="mt-4">
      <AccordionTab v-for="(rule, index) in dns.rules" :key="index" :header="`Rule ${index + 1}`">
        <div class="flex justify-content-end">
          <Button icon="pi pi-trash" severity="danger" @click="removeRule(index)" />
        </div>
        <DnsRuleEditor v-model="dns.rules[index]" class="mt-3" />
      </AccordionTab>
    </Accordion>
    <Button label="Add Rule" icon="pi pi-plus" severity="success" class="mt-2" @click="addRule" />
  </div>
</template>
