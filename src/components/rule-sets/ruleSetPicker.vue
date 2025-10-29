<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRuleSetStore } from '@/stores/ruleset';
import Select from 'primevue/select';
import type { RuleSet } from '../../../schemas/ruleset';

const props = defineProps<{
  modelValue?: number;
  availableRuleSets?: number[];
}>();

const emit = defineEmits<{
  'update:modelValue': [value: number | undefined];
}>();

const ruleSetStore = useRuleSetStore();
const allRuleSets = ref<RuleSet[]>([]);

onMounted(async () => {
  await ruleSetStore.fetchRuleSets();
  allRuleSets.value = ruleSetStore.ruleSets;
});

const filteredRuleSets = computed(() => {
  if (props.availableRuleSets) {
    return allRuleSets.value.filter(rs => props.availableRuleSets!.includes(rs.id!));
  }
  return allRuleSets.value;
});

const selectedId = computed({
  get: () => props.modelValue,
  set: (id: number | undefined) => {
    emit('update:modelValue', id);
  }
});

</script>

<template>
  <Select
    v-model="selectedId"
    :options="filteredRuleSets"
    optionLabel="name"
    optionValue="id"
    placeholder="Select a RuleSet"
    class="w-full"
    showClear
  />
</template>
