<template>
  <Card>
    <template #title>
      <div class="flex justify-between items-center">
        <div class="text-xl font-bold">Route Rule</div>
        <Button icon="i-mdi-delete" severity="danger" text rounded @click="emit('remove')" />
      </div>
    </template>
    <template #content>
      <div class="p-fluid flex flex-col gap-4">
        <div class="field">
          <label for="action">Action</label>
          <Select
            id="action"
            v-model="rule.action"
            :options="['route', 'reject', 'hijack-dns']"
          />
        </div>
        <div v-if="rule.action === 'route'" class="field">
            <label>Outbound</label>
            <outbounds-selector v-model="rule.outbound" />
        </div>

        <div v-if="isFieldVisible('domain')" class="field">
          <label for="domain">Domains</label>
          <InputChips id="domain" v-model="rule.domain" />
        </div>
        <div v-if="isFieldVisible('domain_suffix')" class="field">
          <label for="domain_suffix">Domain Suffixes</label>
          <InputChips id="domain_suffix" v-model="rule.domain_suffix" />
        </div>
        <div v-if="isFieldVisible('domain_keyword')" class="field">
          <label for="domain_keyword">Domain Keywords</label>
          <InputChips id="domain_keyword" v-model="rule.domain_keyword" />
        </div>
        <div v-if="isFieldVisible('domain_regex')" class="field">
          <label for="domain_regex">Domain Regex</label>
          <InputChips id="domain_regex" v-model="rule.domain_regex" />
        </div>
        <div v-if="isFieldVisible('rule_set')" class="field">
          <label>Rule Sets</label>
          <rule-sets-selector v-model="rule.rule_set" />
        </div>

        <SplitButton
          label="Add Condition"
          icon="i-mdi-plus"
          :model="availableConditions.map(c => ({ label: c.title, command: () => showField(c) }))"
          :disabled="availableConditions.length === 0"
        />
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { type RouteRule } from '@/schemas/route'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Select from 'primevue/select'
import InputChips from 'primevue/inputchips'
import SplitButton from 'primevue/splitbutton'
import OutboundsSelector from '@/components/outbounds/outboundsSelector/outboundsSelector.vue'
import RuleSetsSelector from '@/components/route/ruleSets/ruleSetsSelector.vue'

const props = defineProps({
  modelValue: {
    type: Object as () => RouteRule,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue', 'remove'])

const rule = ref(props.modelValue)

const allConditions = [
  { title: 'Domains', value: 'domain' },
  { title: 'Domain Suffixes', value: 'domain_suffix' },
  { title: 'Domain Keywords', value: 'domain_keyword' },
  { title: 'Domain Regex', value: 'domain_regex' },
  { title: 'Rule Sets', value: 'rule_set' },
]

const visibleFields = ref<Array<keyof RouteRule>>(([] as Array<keyof RouteRule>).concat(
  Object.keys(props.modelValue).filter(k => allConditions.some(c => c.value === k)) as Array<keyof RouteRule>
))

const availableConditions = computed(() => {
  return allConditions.filter(
    (condition) => !visibleFields.value.includes(condition.value as keyof RouteRule)
  )
})

const isFieldVisible = (field: keyof RouteRule) => {
  return visibleFields.value.includes(field)
}

const showField = (condition: { value: string }) => {
  const field = condition.value as keyof RouteRule
  if (!visibleFields.value.includes(field)) {
    visibleFields.value.push(field)
  }
}

watch(
  rule,
  (newValue) => {
    emit('update:modelValue', newValue)
  },
  { deep: true }
)
</script>

<style scoped>
.field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}
</style>