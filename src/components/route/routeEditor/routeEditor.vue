<template>
  <Editor v-model="model" title="Route" @save="onSave">
    <template #default>
      <v-checkbox v-model="model.final" label="Final" />
      <AdvancedSection>
        <v-text-field v-model="model.auto_detect_interface" label="Auto Detect Interface" />
        <v-text-field v-model="model.override_android_vpn" label="Override Android VPN" />
        <v-text-field v-model="model.default_interface" label="Default Interface" />
      </AdvancedSection>

      <v-divider class="my-4" />

      <div class="d-flex align-center mb-2">
        <h3 class="text-subtitle-1">Rules</h3>
        <v-spacer />
        <v-btn
          variant="text"
          prepend-icon="mdi-plus"
          @click="addRule"
        >
          New Rule
        </v-btn>
      </div>

      <v-expansion-panels v-if="model.rules && model.rules.length">
        <v-expansion-panel
          v-for="(rule, i) in model.rules"
          :key="i"
        >
          <v-expansion-panel-title>
            Rule {{ i + 1 }}
            <v-spacer />
            <v-btn
              icon="mdi-delete"
              variant="text"
              color="error"
              size="small"
              @click.stop="removeRule(i)"
            />
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <RouteRuleEditor v-model="model.rules[i]" />
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
      <div v-else class="text-center text-caption text-disabled">
        No rules
      </div>
    </template>
  </Editor>
</template>

<script setup lang="ts">
import { useOptionalModel } from '~/composables/useOptionalModel'
import Editor from '~/components/common/Editor.vue'
import AdvancedSection from '~/components/common/advancedSection/advancedSection.vue'
import RouteRuleEditor from '../routeRuleEditor/routeRuleEditor.vue'
import type { Route } from './types'

const props = defineProps<{
  modelValue?: Route
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: Route): void
  (e: 'save', v: Route): void
}>()

const model = useOptionalModel(props, emit)

const addRule = () => {
  if (!model.value.rules) {
    model.value.rules = []
  }
  model.value.rules.push({ action: 'accept' })
}

const removeRule = (index: number) => {
  model.value.rules?.splice(index, 1)
}

const onSave = () => {
  emit('save', model.value)
}
</script>