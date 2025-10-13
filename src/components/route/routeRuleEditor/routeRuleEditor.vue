<template>
  <v-form>
    <v-select
      v-model="model.action"
      label="Action"
      :items="['accept', 'reject']"
    />
    <v-autocomplete
      v-model="model.outbound"
      label="Outbound"
      :items="outboundTags"
    />
    <v-text-field v-model="model.domain" label="Domain" />
    <v-text-field v-model="model.domain_suffix" label="Domain Suffix" />
    <v-text-field v-model="model.domain_keyword" label="Domain Keyword" />
    <v-text-field v-model="model.domain_regex" label="Domain Regex" />
    <RuleSetsSelector v-model="model.rule_set" />
  </v-form>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useVFetch } from '#imports'
import RuleSetsSelector from '../ruleSetsSelector/ruleSetsSelector.vue'
import type { RouteRule } from './types'
import { useOptionalModel } from '~/composables/useOptionalModel'

const props = defineProps<{
  modelValue?: RouteRule
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: RouteRule): void
}>()

const model = useOptionalModel(props, emit)

const outboundTags = ref<string[]>([])

onMounted(async () => {
  const { data } = await useVFetch('/api/outbounds')
  if (data.value) {
    const outbounds = data.value as any[]
    const tags = await Promise.all(outbounds.map(async (o) => {
      const { data: tagData } = await useVFetch(`/api/outbounds/${o.id}/tag`).json<{ tag: string }>()
      return tagData.value?.tag
    }))
    outboundTags.value = tags.filter(Boolean) as string[]
  }
})
</script>