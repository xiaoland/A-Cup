<template>
  <v-card variant="outlined" class="form-section">
    <v-card-title class="text-h6 d-flex align-center justify-space-between">
      Route
    </v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12" md="6">
          <v-switch
            v-model="localRoute.auto_detect_interface"
            label="Auto Detect Interface"
            color="primary"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="localRoute.final"
            label="Final Outbound Tag"
            variant="outlined"
            hint="Tag of the final outbound, e.g., direct/reject or a custom tag"
            persistent-hint
          />
        </v-col>
      </v-row>

      <v-divider class="my-4" />

      <RuleSetsEditor :route="localRoute" />

      <v-divider class="my-4" />

      <div class="mb-2 d-flex align-center justify-space-between">
        <div class="text-subtitle-1">Rules</div>
        <v-btn size="small" variant="outlined" prepend-icon="mdi-plus" @click="addRule">Add Rule</v-btn>
      </div>

      <v-expansion-panels multiple v-model="openPanels">
        <v-expansion-panel v-for="(rule, idx) in localRoute.rules" :key="idx">
          <v-expansion-panel-title>
            <div class="d-flex align-center w-100">
              <span class="me-3">Rule #{{ idx + 1 }}</span>
              <v-chip size="x-small" class="me-2">{{ rule.action || 'route' }}</v-chip>
              <span class="text-caption text-medium-emphasis">{{ rule.domains?.[0] || '—' }}</span>
              <v-spacer />
              <v-btn icon="mdi-delete" size="x-small" variant="text" @click.stop="removeRule(idx)" />
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-row>
              <v-col cols="12" md="4">
                <v-select
                  v-model="rule.action"
                  :items="actionItems"
                  label="Action"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="8" v-if="rule.action === 'route'">
                <v-text-field
                  v-model="rule.outbound"
                  label="Outbound Tag"
                  variant="outlined"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-combobox
                  v-model="rule.domains"
                  label="Domains"
                  placeholder="example.com"
                  multiple
                  chips
                  closable-chips
                  clearable
                  variant="outlined"
                />
              </v-col>
            </v-row>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import RuleSetsEditor from '../profileEditor/ruleSetsEditor.vue'

type RouteRule = {
  action: 'route' | 'reject'
  outbound?: string
  domains?: string[]
}

type RouteConfig = {
  final?: string
  auto_detect_interface?: boolean
  rule_set: number[]
  rules: RouteRule[]
}

const props = defineProps<{ route: RouteConfig }>()
const emit = defineEmits<{
  'update:route': [value: RouteConfig]
}>()

const localRoute = ref<RouteConfig>({ final: undefined, auto_detect_interface: true, rule_set: [], rules: [] })
const openPanels = ref<number[]>([])

const actionItems = [
  { title: 'route', value: 'route' },
  { title: 'reject', value: 'reject' }
]

const syncEmit = () => {
  emit('update:route', { ...localRoute.value })
}

watch(() => props.route, (val) => {
  if (!val) return
  localRoute.value = { ...val, rules: [...(val.rules || [])] }
}, { immediate: true, deep: true })

watch([localRoute], syncEmit, { deep: true })

const addRule = () => {
  localRoute.value.rules.push({ action: 'route', outbound: 'direct', domains: [] })
}

const removeRule = (idx: number) => {
  localRoute.value.rules.splice(idx, 1)
}

 
</script>

<style scoped>
</style>
