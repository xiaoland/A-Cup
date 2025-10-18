<template>
  <Card>
    <template #title>
        <div class="text-2xl font-bold">Route</div>
    </template>
    <template #content>
      <div class="flex flex-col gap-4">
        <div>
            <h3 class="text-lg font-bold mb-2">Rules</h3>
            <div v-if="route.rules" v-for="(rule, index) in route.rules" :key="index" class="mb-2">
                <route-rule-editor v-model="route.rules[index]" @remove="removeRule(index)" />
            </div>
            <Button label="Add Rule" icon="i-mdi-plus" @click="addRule" />
        </div>

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

        <Accordion>
          <AccordionPanel value="additional_settings" header="Additional Settings">
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
import RouteRuleEditor from '../routeRuleEditor/routeRuleEditor.vue'
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

if (!route.value.rules) {
  route.value.rules = []
}

const addRule = () => {
  if (!route.value.rules) {
    route.value.rules = []
  }
  route.value.rules.push({
    action: 'route',
    outbound: undefined,
  } as RouteRule)
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