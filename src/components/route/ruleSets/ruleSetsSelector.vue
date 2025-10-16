<template>
  <div class="d-flex align-center" style="gap: 8px;">
    <div class="flex-grow-1">
      <v-select
        v-model="selected"
        :items="ruleSetsWithTags"
        item-title="name"
        :item-value="itemValue"
        label="Rule Sets"
        multiple
        chips
        @update:modelValue="onSelection"
        hide-details
      ></v-select>
    </div>
    <v-btn @click="showCreateDialog = true" icon="mdi-plus" variant="text"></v-btn>
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
    type: Array as () => (string | number)[],
    default: () => [],
  },
  valueAs: {
    type: String as () => 'id' | 'tag',
    default: 'tag',
  },
});

const emit = defineEmits(['update:modelValue']);

const ruleSetStore = useRuleSetStore();
const userStore = useUserStore();
const ruleSetsWithTags = ref<RuleSetWithTag[]>([]);
const selected = ref<(string | number)[]>([]);
const showCreateDialog = ref(false);

const itemValue = computed(() => (props.valueAs === 'id' ? 'id' : 'tag'));

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
    return { ...ruleSet, tag: `rule-set-${ruleSet.id}` }; // Fallback tag
  });

  const resolvedTags = await Promise.all(tagsPromises);
  ruleSetsWithTags.value = resolvedTags.map((rs) => {
    const ruleSet = rs as any;
    return {
      ...ruleSet,
      type: ruleSet.type || 'remote',
      format: ruleSet.format || null,
      tag: ruleSet.tag,
    } as RuleSetWithTag;
  });

  updateSelected(props.modelValue);
};

onMounted(fetchRuleSets);

const onSelection = (value: (string | number)[]) => {
  emit('update:modelValue', value);
};

const onRuleSetCreated = () => {
  fetchRuleSets();
  showCreateDialog.value = false;
};

const updateSelected = (modelValue: (string | number)[]) => {
  if (!Array.isArray(modelValue)) {
    selected.value = [];
    return;
  }
  if (props.valueAs === 'id') {
    selected.value = modelValue.map((id) => (typeof id === 'number' ? id : parseInt(id, 10)));
  } else {
    selected.value = modelValue
      .map((tag) => {
        const found = ruleSetsWithTags.value.find((rs) => rs.tag === tag);
        return found ? found.tag : null;
      })
      .filter((t) => t !== null) as string[];
  }
};

watch(
  () => props.modelValue,
  (newValue) => {
    updateSelected(newValue);
  },
  { immediate: true, deep: true }
);

watch(ruleSetsWithTags, () => {
  updateSelected(props.modelValue);
});
</script>

<style scoped></style>