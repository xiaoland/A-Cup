<template>
  <ItemSelector
    v-model="model"
    v-model:items="items"
    title="Rule Set"
    :create="createRuleSet"
    item-value="name"
  >
    <template #creator="{ onCancel, onSave }">
      <RuleSetCreator :on-cancel="onCancel" :on-save="onSave" />
    </template>
  </ItemSelector>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useVFetch } from '#imports'
import ItemSelector from '~/components/common/itemSelector/itemSelector.vue'
import RuleSetCreator from './ruleSetCreator.vue'
import type { RuleSet } from './types'

const model = defineModel<string>()

const items = ref<RuleSet[]>([])

const { data, execute } = useVFetch('/api/rule-sets')

onMounted(async () => {
  await execute()
  if (data.value) {
    items.value = data.value as RuleSet[]
  }
})

const createRuleSet = async (newRuleSet: Omit<RuleSet, 'id'>): Promise<RuleSet> => {
  const { data: created } = await useVFetch('/api/rule-sets', {
    method: 'POST',
    body: newRuleSet,
  }).json<RuleSet>()
  return created.value as RuleSet
}
</script>