<script setup lang="ts">
import { computed } from 'vue';
import type { Dns } from '../../../schemas/dns';
import DnsServerEditor from '@/components/dns/dnsServerEditor.vue';
import DnsRuleEditor from '@/components/dns/dnsRuleEditor.vue';

const props = defineProps<{
  modelValue: Dns;
}>();

const emit = defineEmits(['update:modelValue']);

const dns = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});
</script>

<template>
  <div>
    <h3>DNS</h3>
    <!-- TODO: Add inputs for top-level DnsSchema fields -->

    <h4>Servers</h4>
    <div v-for="(server, index) in dns.servers" :key="index">
      <DnsServerEditor v-model="dns.servers[index]" />
    </div>

    <h4>Rules</h4>
    <div v-for="(rule, index) in dns.rules" :key="index">
      <DnsRuleEditor v-model="dns.rules[index]" />
    </div>
  </div>
</template>
