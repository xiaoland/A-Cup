<template>
  <div class="d-flex align-center">
    <v-select
      v-model="selected"
      :items="ruleSetsWithTags"
      item-title="name"
      item-value="tag"
      label="Rule Sets"
      multiple
      chips
      @update:modelValue="onSelection"
      class="flex-grow-1"
    ></v-select>
    <v-btn @click="showCreateDialog = true" icon="mdi-plus" variant="text" class="ml-2"></v-btn>
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
import { ref, onMounted, computed, watch } from 'vue';
import { useRuleSetStore } from '@/stores/ruleSet';
import { useUserStore } from '@/stores/user';
import RuleSetEditor from './ruleSetEditor/ruleSetEditor.vue';
import type { RuleSet as RuleSetSchemaType } from '@/schemas/route';

interface RuleSetWithTag extends RuleSetSchemaType {
  tag: string;
}

const props = defineProps({
  modelValue: {
    type: Array as () => string[],
    default: () => [],
  },
});

const emit = defineEmits(['update:modelValue']);

const ruleSetStore = useRuleSetStore();
const userStore = useUserStore();
const ruleSetsWithTags = ref<RuleSetWithTag[]>([]);
const selected = ref<string[]>(props.modelValue);
const showCreateDialog = ref(false);

const fetchRuleSets = async () => {
  await ruleSetStore.fetchRuleSets();
  const ruleSets = ruleSetStore.ruleSets;
  const tagsPromises = ruleSets.map(async (ruleSet) => {
    if (ruleSet.id) {
      const response = await userStore.authorizedFetch(`/api/rule_sets/${ruleSet.id}/tag`);
      if (response.ok) {
        const data = await response.json();
        return { ...ruleSet, tag: data.tag };
      }
    }
    return null;
  });

  const resolvedTags = await Promise.all(tagsPromises);
  ruleSetsWithTags.value = resolvedTags
    .filter((rs) => rs !== null)
    .map((rs) => {
      const ruleSet = rs as any;
      return {
        ...ruleSet,
        type: ruleSet.type || 'remote',
        format: ruleSet.format || null,
        tag: ruleSet.tag,
      } as RuleSetWithTag;
    });
};

onMounted(fetchRuleSets);

const onSelection = (value: string[]) => {
  emit('update:modelValue', value);
};

const onRuleSetCreated = () => {
  fetchRuleSets();
  showCreateDialog.value = false;
};

watch(
  () => props.modelValue,
  (newValue) => {
    selected.value = newValue;
  }
);
</script>

<style scoped></style>