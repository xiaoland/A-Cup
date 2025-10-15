<template>
  <Editor
    v-model="rule"
    title="DNS Rule"
    :show-delete="true"
    @delete="emit('remove')"
    :start-editable="true"
  >
    <v-form>
      <v-select
        v-model="rule.server"
        :items="dnsServers"
        label="Server"
      ></v-select>
      <div v-if="isFieldVisible('domain')" class="d-flex align-center my-2" style="gap: 8px;">
        <v-text-field
          :model-value="rule.domain?.join(', ')"
          label="Domains (comma-separated)"
          @update:model-value="updateField('domain', $event)"
          class="flex-grow-1"
          hide-details
        ></v-text-field>
        <v-btn icon="mdi-close" variant="text" @click="hideField('domain')"></v-btn>
      </div>
      <div v-if="isFieldVisible('domain_suffix')" class="d-flex align-center my-2" style="gap: 8px;">
        <v-text-field
          :model-value="rule.domain_suffix?.join(', ')"
          label="Domain Suffixes (comma-separated)"
          @update:model-value="updateField('domain_suffix', $event)"
          class="flex-grow-1"
          hide-details
        ></v-text-field>
        <v-btn icon="mdi-close" variant="text" @click="hideField('domain_suffix')"></v-btn>
      </div>
      <div v-if="isFieldVisible('domain_keyword')" class="d-flex align-center my-2" style="gap: 8px;">
        <v-text-field
          :model-value="rule.domain_keyword?.join(', ')"
          label="Domain Keywords (comma-separated)"
          @update:model-value="updateField('domain_keyword', $event)"
          class="flex-grow-1"
          hide-details
        ></v-text-field>
        <v-btn icon="mdi-close" variant="text" @click="hideField('domain_keyword')"></v-btn>
      </div>
      <div v-if="isFieldVisible('domain_regex')" class="d-flex align-center my-2" style="gap: 8px;">
        <v-text-field
          :model-value="rule.domain_regex?.join(', ')"
          label="Domain Regex (comma-separated)"
          @update:model-value="updateField('domain_regex', $event)"
          class="flex-grow-1"
          hide-details
        ></v-text-field>
        <v-btn icon="mdi-close" variant="text" @click="hideField('domain_regex')"></v-btn>
      </div>
      <div v-if="isFieldVisible('rule_set')" class="d-flex align-center my-2" style="gap: 8px;">
        <v-text-field
          :model-value="rule.rule_set?.join(', ')"
          label="Rule Sets (comma-separated)"
          @update:model-value="updateField('rule_set', $event)"
          class="flex-grow-1"
          hide-details
        ></v-text-field>
        <v-btn icon="mdi-close" variant="text" @click="hideField('rule_set')"></v-btn>
      </div>

      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" :disabled="availableConditions.length === 0">Add Condition</v-btn>
        </template>
        <v-list>
          <v-list-item
            v-for="condition in availableConditions"
            :key="condition.value"
            @click="showField(condition)"
          >
            <v-list-item-title>{{ condition.title }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-form>
  </Editor>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { type DnsRule } from '@/schemas/dns'
import Editor from '@/components/common/Editor.vue'

const props = defineProps<{
  modelValue: DnsRule,
  dnsServers: string[],
}>()

const emit = defineEmits(['update:modelValue', 'remove'])

const rule = ref(props.modelValue)

const allConditions = [
  { title: 'Domains', value: 'domain' },
  { title: 'Domain Suffixes', value: 'domain_suffix' },
  { title: 'Domain Keywords', value: 'domain_keyword' },
  { title: 'Domain Regex', value: 'domain_regex' },
  { title: 'Rule Sets', value: 'rule_set' },
]

const visibleFields = ref<Array<keyof DnsRule>>(([] as Array<keyof DnsRule>).concat(
  Object.keys(props.modelValue).filter(k => allConditions.some(c => c.value === k)) as Array<keyof DnsRule>
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

const hideField = (field: keyof DnsRule) => {
  visibleFields.value = visibleFields.value.filter((f) => f !== field)
  if (field in rule.value) {
    delete rule.value[field]
  }
}

const updateField = (field: keyof DnsRule, value: string) => {
  const arrayFields: (keyof DnsRule)[] = ['domain', 'domain_suffix', 'domain_keyword', 'domain_regex', 'rule_set']
  if (arrayFields.includes(field)) {
    if (value) {
      (rule.value[field] as string[]) = value.split(',').map((s) => s.trim())
    } else {
      (rule.value[field] as string[]) = []
    }
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