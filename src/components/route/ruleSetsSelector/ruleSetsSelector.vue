<template>
  <ItemSelector
    title="Rule Sets"
    :model-value="ruleSets"
    :create-item="createRuleSet"
    :update-item="updateRuleSet"
    :delete-item="deleteRuleSet"
    @update:model-value="
      $emit(
        'update:modelValue',
        $event.map((i) => i.id)
      )
    "
  >
    <!-- FIXME v-model cannot be used on v-for or v-slot scope variables because they are not writable. -->
    <!-- <template #form="{ item }">
      <RuleSetEditor v-model="item" />
    </template> -->
    <template #readonly="{ item }">
      <pre>{{ item }}</pre>
    </template>
  </ItemSelector>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import ItemSelector from '@/components/common/itemSelector/itemSelector.vue';
import RuleSetEditor from '../ruleSetEditor/ruleSetEditor.vue';
import type { RuleSet } from '../ruleSetEditor/types';
import { apiClient } from '@/services/api';

const props = defineProps<{
  modelValue: number[];
}>();

defineEmits<{
  (e: 'update:modelValue', value: (number | undefined)[]): void;
}>();

const ruleSets = ref<RuleSet[]>([]);

const fetchRuleSets = async () => {
  if (props.modelValue) {
    const promises = props.modelValue.map((id) => apiClient.get<RuleSet>(`/rule_sets/${id}`));
    ruleSets.value = await Promise.all(promises);
  }
};

onMounted(fetchRuleSets);

const createRuleSet = (item: RuleSet) => {
  return apiClient.post<RuleSet>('/rule_sets', item);
};

const updateRuleSet = (item: RuleSet) => {
  return apiClient.put<RuleSet>(`/rule_sets/${item.id}`, item);
};

const deleteRuleSet = (item: RuleSet) => {
  return apiClient.delete<void>(`/rule_sets/${item.id}`);
};
</script>

<style scoped lang="scss" src="./index.scss"></style>
