<template>
  <Card>
    <template #title>
        <div class="text-2xl font-bold">Route</div>
    </template>
    <template #content>
      <div class="flex flex-col gap-4">
        <div>
            <h3 class="text-lg font-bold mb-2">Rules</h3>
            <div v-if="route.rules" class="flex flex-col gap-2">
                <route-rule-card
                    v-for="(rule, index) in route.rules"
                    :key="index"
                    :rule="rule"
                    @edit="editRule(rule, index)"
                    @delete="removeRule(index)"
                />
            </div>
            <Button label="Add Rule" icon="i-mdi-plus" @click="addRule" class="mt-2" />
        </div>

        <Dialog v-model:visible="showRuleEditor" modal header="Edit Rule" class="w-full max-w-lg">
            <route-rule-editor v-if="editableRule" v-model="editableRule" @save="saveRule" @cancel="showRuleEditor = false" />
        </Dialog>

        <Divider />

        <div>
            <h3 class="text-lg font-bold mb-2">Rule Sets</h3>
            <rule-sets-selector v-model="route.rule_set" value-as="id" />
        </div>

        <Divider />

        <div>
            <h3 class="text-lg font-bold mb-2">Final Outbound</h3>
            <outbounds-selector v-model="route.final" value-as="id" />
        </div>

        <Accordion :value="[]">
          <AccordionPanel value="advanced" header="Advanced">
             <div class="p-fluid grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="field col-span-1 flex items-center">
                    <div class="flex items-center">
                        <Checkbox v-model="route.auto_detect_interface" inputId="auto_detect_interface" :binary="true" />
                        <label for="auto_detect_interface" class="ml-2"> Auto Detect Interface </label>
                    </div>
                </div>
                <div class="field col-span-1">
                    <label for="default_interface">Default Interface</label>
                    <InputText id="default_interface" v-model="route.default_interface" />
                </div>
                <div class="field col-span-1">
                    <label for="default_mark">Default Mark</label>
                    <InputNumber id="default_mark" v-model="route.default_mark" />
                </div>
                <div class="field col-span-1">
                    <label for="geoip_code">GeoIP Code</label>
                    <InputText id="geoip_code" v-model="route.geoip_code" />
                </div>
                <div class="field col-span-1">
                    <label for="geosite_code">GeoSite Code</label>
                    <InputText id="geosite_code" v-model="route.geosite_code" />
                </div>
                <div class="field col-span-1">
                    <label for="default_domain_resolver">Default Domain Resolver</label>
                    <InputText id="default_domain_resolver" v-model="route.default_domain_resolver" />
                </div>
                <div class="field col-span-1">
                    <label for="default_network_strategy">Default Network Strategy</label>
                    <InputText id="default_network_strategy" v-model="route.default_network_strategy" />
                </div>
                <div class="field col-span-1">
                    <label for="default_network_type">Default Network Type</label>
                    <InputText id="default_network_type" v-model="route.default_network_type" />
                </div>
                <div class="field col-span-1">
                    <label for="default_fallback_network_type">Default Fallback Network Type</label>
                    <InputText id="default_fallback_network_type" v-model="route.default_fallback_network_type" />
                </div>
                <div class="field col-span-1">
                    <label for="default_fallback_delay">Default Fallback Delay</label>
                    <InputNumber id="default_fallback_delay" v-model="route.default_fallback_delay" />
                </div>
             </div>
          </AccordionPanel>
        </Accordion>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { type Route, type RouteRule } from '@/schemas/route'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Divider from 'primevue/divider'
import Accordion from 'primevue/accordion'
import AccordionPanel from 'primevue/accordionpanel'
import Checkbox from 'primevue/checkbox'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Dialog from 'primevue/dialog'
import RouteRuleEditor from '../routeRuleEditor/routeRuleEditor.vue'
import RouteRuleCard from '../routeRuleCard.vue'
import RuleSetsSelector from '../ruleSets/ruleSetsSelector.vue'
import OutboundsSelector from '@/components/outbounds/outboundsSelector/outboundsSelector.vue'

const props = withDefaults(defineProps<{
  modelValue: Route
}>(), {
  modelValue: () => ({
    rules: [],
    rule_set: [] as number[],
  }),
})

const emit = defineEmits(['update:modelValue'])

const route = ref(props.modelValue)
const showRuleEditor = ref(false)
const editableRule = ref<RouteRule | null>(null)
const editingRuleIndex = ref<number | null>(null)

if (!route.value.rules) {
  route.value.rules = []
}

const addRule = () => {
  if (!route.value.rules) {
    route.value.rules = []
  }
  editableRule.value = { action: 'route', outbound: undefined } as RouteRule
  editingRuleIndex.value = null
  showRuleEditor.value = true
}

const editRule = (rule: RouteRule, index: number) => {
  editableRule.value = JSON.parse(JSON.stringify(rule))
  editingRuleIndex.value = index
  showRuleEditor.value = true
}

const saveRule = (savedRule: RouteRule) => {
  if (editingRuleIndex.value !== null) {
    route.value.rules![editingRuleIndex.value] = savedRule
  } else {
    route.value.rules!.push(savedRule)
  }
  showRuleEditor.value = false
}

const removeRule = (index: number) => {
  if (route.value.rules) {
    route.value.rules.splice(index, 1)
  }
}

watch(
  route,
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