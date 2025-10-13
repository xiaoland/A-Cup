<template>
  <v-form>
    <v-select
      label="Action"
      :items="['proxy', 'direct', 'block']"
      v-model="value.action"
    />
    <v-combobox
      label="Outbound"
      :items="outboundTags"
      v-model="value.outbound"
    />
    <v-combobox
      label="Domain"
      multiple
      chips
      v-model="value.domain"
    />
    <v-combobox
      label="Domain Suffix"
      multiple
      chips
      v-model="value.domain_suffix"
    />
    <v-combobox
      label="Domain Keyword"
      multiple
      chips
      v-model="value.domain_keyword"
    />
    <v-combobox
      label="Domain Regex"
      multiple
      chips
      v-model="value.domain_regex"
    />
    <v-combobox
      label="Rule Set"
      :items="ruleSetTags"
      multiple
      chips
      v-model="value.rule_set"
    />
  </v-form>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { RouteRule } from './types';
import { apiClient } from '@/services/api';
import type { Outbound } from '@/components/outbounds/outboundEditor/types';
import type { RuleSet } from '../ruleSetEditor/types';

const props = defineProps<{
  modelValue: RouteRule;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: RouteRule): void;
}>();

const value = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const outboundTags = ref<string[]>([]);
const ruleSetTags = ref<string[]>([]);

const fetchOutbounds = async () => {
  const outbounds = await apiClient.get<Outbound[]>('/outbounds');
  const tags = await Promise.all(
    outbounds.map(o => apiClient.get<{ tag: string }>(`/outbounds/${o.id}/tag`))
  );
  outboundTags.value = tags.map(t => t.tag);
};

const fetchRuleSets = async () => {
  const ruleSets = await apiClient.get<RuleSet[]>('/rule_sets');
  const tags = await Promise.all(
    ruleSets.map(rs => apiClient.get<{ tag: string }>(`/rule_sets/${rs.id}/tag`))
  );
  ruleSetTags.value = tags.map(t => t.tag);
};

onMounted(() => {
  fetchOutbounds();
  fetchRuleSets();
});
</script>

<style scoped lang="scss" src="./index.scss"></style>