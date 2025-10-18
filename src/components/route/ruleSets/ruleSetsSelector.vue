<template>
  <div class="flex items-center gap-2">
    <div class="flex-grow-1">
      <MultiSelect
        v-model="selected"
        :options="ruleSetsWithTags"
        option-label="name"
        :option-value="itemValue"
        placeholder="Select Rule Sets"
        display="chip"
        class="w-full"
        @update:modelValue="onSelection"
      />
    </div>
    <Button icon="i-mdi-plus" text rounded @click="showCreateDialog = true" />
    <Dialog v-model:visible="showCreateDialog" modal header="Create New Rule Set" class="w-full max-w-lg">
      <div class="p-4">
        <rule-set-editor @close="showCreateDialog = false" @created="onRuleSetCreated" />
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRuleSetStore } from '@/stores/ruleSet'
import { useUserStore } from '@/stores/user'
import MultiSelect from 'primevue/multiselect'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import RuleSetEditor from './ruleSetEditor/ruleSetEditor.vue'
import type { RuleSet as RuleSetSchemaType } from '@/schemas/route'

interface RuleSetWithTag extends RuleSetSchemaType {
  tag: string
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
})

const emit = defineEmits(['update:modelValue'])

const ruleSetStore = useRuleSetStore()
const userStore = useUserStore()
const ruleSetsWithTags = ref<RuleSetWithTag[]>([])
const selected = ref<(string | number)[]>(props.modelValue)
const showCreateDialog = ref(false)

const itemValue = computed(() => (props.valueAs === 'id' ? 'id' : 'tag'))

const fetchRuleSets = async () => {
  await ruleSetStore.fetchRuleSets()
  const ruleSets = ruleSetStore.ruleSets
  const tagsPromises = ruleSets.map(async (ruleSet) => {
    if (ruleSet.id) {
      const response = await userStore.authorizedFetch(`/api/rule_sets/${ruleSet.id}/tag`)
      if (response.ok) {
        const data = await response.json()
        return { ...ruleSet, tag: data.tag }
      }
    }
    return { ...ruleSet, tag: `rule-set-${ruleSet.id}` } // Fallback tag
  })

  const resolvedTags = await Promise.all(tagsPromises)
  ruleSetsWithTags.value = resolvedTags.map((rs) => {
    const ruleSet = rs as any
    return {
      ...ruleSet,
      type: ruleSet.type || 'remote',
      format: ruleSet.format || null,
      tag: ruleSet.tag,
    } as RuleSetWithTag
  })
}

onMounted(fetchRuleSets)

const onSelection = (value: any[]) => {
    emit('update:modelValue', value)
}

const onRuleSetCreated = () => {
  fetchRuleSets()
  showCreateDialog.value = false
}

watch(
  () => props.modelValue,
  (newValue) => {
    selected.value = newValue
  },
  { immediate: true, deep: true }
)
</script>