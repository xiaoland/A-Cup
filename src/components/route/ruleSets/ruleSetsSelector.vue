<template>
  <ItemSelector
    v-model="modelValue"
    api-endpoint="/api/rule_sets"
    select-button-text="Select Rule Sets"
    dialog-title="Select Rule Sets"
    item-subtitle-field="type"
    :authorized-fetch="userStore.authorizedFetch"
  >
    <template #create="{ onCreated }">
      <v-form @submit.prevent="createRuleSet(onCreated)">
        <v-row>
          <v-col cols="12">
            <v-text-field v-model="newRuleSet.name" label="Name" variant="outlined" required />
          </v-col>
          <v-col cols="12" md="6">
            <v-select
              v-model="newRuleSet.type"
              :items="typeOptions"
              item-title="title"
              item-value="value"
              label="Type"
              variant="outlined"
              required
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-select
              v-model="newRuleSet.format"
              :items="formatOptions"
              item-title="title"
              item-value="value"
              label="Format"
              variant="outlined"
              required
            />
          </v-col>
          <v-col cols="12">
            <v-textarea
              v-model="newRuleSet.content"
              label="Content"
              variant="outlined"
              rows="5"
              hint="For inline: JSON rules array. For remote: URL"
            />
          </v-col>
        </v-row>
        <v-btn type="submit" color="primary" :loading="creating" class="mt-2"> Create </v-btn>
      </v-form>
    </template>
  </ItemSelector>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useUserStore } from '@/stores/user';
import ItemSelector from '@/components/common/itemSelector/itemSelector.vue';
import { typeOptions, formatOptions } from './ruleSetEditor/types';

interface Props {
  modelValue?: number[];
}

defineProps<Props>();
const emit = defineEmits<{ (e: 'update:modelValue', v: number[]): void }>();

const userStore = useUserStore();
const creating = ref(false);

const newRuleSet = ref({
  name: '',
  type: 'inline' as 'inline' | 'remote',
  format: 'source',
  content: '',
});

const createRuleSet = async (onCreated: (item: any) => void) => {
  creating.value = true;
  try {
    const res = await userStore.authorizedFetch('/api/rule_sets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRuleSet.value),
    });
    if (res.ok) {
      const created = await res.json();
      newRuleSet.value = { name: '', type: 'inline', format: 'source', content: '' };
      onCreated(created);
    }
  } catch (e) {
    console.error('Failed to create rule set:', e);
  } finally {
    creating.value = false;
  }
};

const modelValue = defineModel<number[]>();
</script>

<style scoped></style>
