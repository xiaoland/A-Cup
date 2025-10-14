<template>
  <div>
    <v-select
      v-model="selected"
      :items="ruleSets"
      item-title="name"
      item-value="id"
      label="Rule Sets"
      multiple
      chips
      @update:modelValue="onSelection"
    ></v-select>
    <v-btn @click="showCreateDialog = true">Create New Rule Set</v-btn>
    <v-dialog v-model="showCreateDialog" max-width="600px">
      <v-card>
        <v-card-title>Create New Rule Set</v-card-title>
        <v-card-text>
          <rule-set-editor @close="showCreateDialog = false" @created="onRuleSetCreated" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '@/api';
import RuleSetEditor from './ruleSetEditor/ruleSetEditor.vue';
import type { RuleSet } from '@/schemas/route';

const props = defineProps({
  modelValue: {
    type: Array as () => number[],
    default: () => [],
  },
});

const emit = defineEmits(['update:modelValue']);

const ruleSets = ref<RuleSet[]>([]);
const selected = ref<number[]>(props.modelValue);
const showCreateDialog = ref(false);

const fetchRuleSets = async () => {
  const response = await api.get<RuleSet[]>('/rule_sets');
  ruleSets.value = response.data;
};

onMounted(fetchRuleSets);

const onSelection = (value: number[]) => {
  emit('update:modelValue', value);
};

const onRuleSetCreated = () => {
  fetchRuleSets();
  showCreateDialog.value = false;
};
</script>

<style scoped></style>