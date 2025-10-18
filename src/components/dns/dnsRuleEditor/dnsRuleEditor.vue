<template>
  <Card>
    <template #title>
      <div class="flex justify-between items-center">
        <div class="text-xl font-bold">DNS Rule</div>
        <Button icon="i-mdi-delete" severity="danger" text rounded @click="emit('remove')" />
      </div>
    </template>
    <template #content>
      <div class="p-fluid flex flex-col gap-4">
        <div class="field">
          <label for="server">Server</label>
          <Select
            id="server"
            v-model="rule.server"
            :options="dnsServers"
          />
        </div>

        <div v-if="isFieldVisible('domain')" class="field">
          <label for="domain">Domains</label>
          <Chips id="domain" v-model="rule.domain" />
        </div>
        <div v-if="isFieldVisible('domain_suffix')" class="field">
          <label for="domain_suffix">Domain Suffixes</label>
          <Chips id="domain_suffix" v-model="rule.domain_suffix" />
        </div>
        <div v-if="isFieldVisible('domain_keyword')" class="field">
          <label for="domain_keyword">Domain Keywords</label>
          <Chips id="domain_keyword" v-model="rule.domain_keyword" />
        </div>
        <div v-if="isFieldVisible('domain_regex')" class="field">
          <label for="domain_regex">Domain Regex</label>
          <Chips id="domain_regex" v-model="rule.domain_regex" />
        </div>
        <div v-if="isFieldVisible('rule_set')" class="field">
          <label>Rule Sets</label>
          <ruleSetsSelector v-model="rule.rule_set" />
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
import { type DnsRule, dnsRuleSchema } from '@/schemas/dns'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Select from 'primevue/select'
import Chips from 'primevue/chips'
import SplitButton from 'primevue/splitbutton'
import ruleSetsSelector from '@/components/route/ruleSets/ruleSetsSelector.vue'

const props = defineProps<{
  modelValue?: DnsRule,
  dnsServers: string[],
}>()

const emit = defineEmits(['update:modelValue', 'remove'])

const rule = ref(props.modelValue || dnsRuleSchema.parse({ server: '' }))

const allConditions = [
  { title: 'Domains', value: 'domain' },
  { title: 'Domain Suffixes', value: 'domain_suffix' },
  { title: 'Domain Keywords', value: 'domain_keyword' },
  { title: 'Domain Regex', value: 'domain_regex' },
  { title: 'Rule Sets', value: 'rule_set' },
]

const visibleFields = ref<Array<keyof DnsRule>>(([] as Array<keyof DnsRule>).concat(
  (props.modelValue ? Object.keys(props.modelValue) : []).filter(k => allConditions.some(c => c.value === k)) as Array<keyof DnsRule>
))

const availableConditions = computed(() => {
  return allConditions.filter(
    (condition) => !visibleFields.value.includes(condition.value as keyof DnsRule)
  )
})

const isFieldVisible = (field: keyof DnsRule) => {
  return visibleFields.value.includes(field)
}

const showField = (condition: { value: string }) => {
  const field = condition.value as keyof DnsRule
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