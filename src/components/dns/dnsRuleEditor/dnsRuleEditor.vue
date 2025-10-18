<template>
  <div>
    <!-- TODO: Refactor this component to use PrimeVue -->
  </div>
</template>

<script setup lang="ts">
// import { ref, watch, computed } from 'vue'
// import { type DnsRule, dnsRuleSchema } from '@/schemas/dns'
// import Editor from '@/components/common/Editor.vue'
// import ruleSetsSelector from '@/components/route/ruleSets/ruleSetsSelector.vue'

// const props = defineProps<{
//   modelValue?: DnsRule,
//   dnsServers: string[],
// }>()

// const emit = defineEmits(['update:modelValue', 'remove'])

// const rule = ref(props.modelValue || dnsRuleSchema.parse({ server: '' }))

// const allConditions = [
//   { title: 'Domains', value: 'domain' },
//   { title: 'Domain Suffixes', value: 'domain_suffix' },
//   { title: 'Domain Keywords', value: 'domain_keyword' },
//   { title: 'Domain Regex', value: 'domain_regex' },
//   { title: 'Rule Sets', value: 'rule_set' },
// ]

// const visibleFields = ref<Array<keyof DnsRule>>(([] as Array<keyof DnsRule>).concat(
//   (props.modelValue ? Object.keys(props.modelValue) : []).filter(k => allConditions.some(c => c.value === k)) as Array<keyof DnsRule>
// ))

// const availableConditions = computed(() => {
//   return allConditions.filter(
//     (condition) => !visibleFields.value.includes(condition.value as keyof DnsRule)
//   )
// })

// const isFieldVisible = (field: keyof DnsRule) => {
//   return visibleFields.value.includes(field)
// }

// const showField = (condition: { value: string }) => {
//   const field = condition.value as keyof DnsRule
//   if (!visibleFields.value.includes(field)) {
//     visibleFields.value.push(field)
//   }
// }

// const hideField = (field: keyof DnsRule) => {
//   visibleFields.value = visibleFields.value.filter((f) => f !== field)
//   if (field in rule.value) {
//     delete rule.value[field]
//   }
// }

// const updateField = (field: keyof DnsRule, value: string) => {
//   const arrayFields: (keyof DnsRule)[] = ['domain', 'domain_suffix', 'domain_keyword', 'domain_regex', 'rule_set']
//   if (arrayFields.includes(field)) {
//     if (value) {
//       (rule.value[field] as string[]) = value.split(',').map((s) => s.trim())
//     } else {
//       (rule.value[field] as string[]) = []
//     }
//   }
// }

// watch(
//   rule,
//   (newValue) => {
//     emit('update:modelValue', newValue)
//   },
//   { deep: true }
// )
</script>