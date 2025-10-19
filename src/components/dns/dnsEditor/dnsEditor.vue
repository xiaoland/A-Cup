<template>
  <Card>
    <template #title>
      <div class="text-2xl font-bold">DNS</div>
    </template>
    <template #content>
      <div class="flex flex-col gap-4">
        <div class="p-fluid grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="field col-span-1">
            <label>Final</label>
            <outboundsSelector v-model="dns.final" value-as="id" />
          </div>
          <div class="field col-span-1">
            <label for="strategy">Strategy</label>
            <Select
              id="strategy"
              v-model="dns.strategy"
              :options="['prefer_ipv4', 'prefer_ipv6', 'ipv4_only', 'ipv6_only']"
            />
          </div>
        </div>

        <Accordion :multiple="true" :value="['0', '1']">
          <AccordionPanel value="0" header="Servers">
            <div class="flex flex-col gap-2">
                <dns-server-card
                    v-for="(server, index) in dns.servers"
                    :key="index"
                    :server="server"
                    @edit="editServer(server, index)"
                    @delete="removeServer(index)"
                />
            </div>
            <Button class="mt-4" label="Add Server" icon="i-mdi-plus" @click="addServer" />
          </AccordionPanel>
          <AccordionPanel value="1" header="Rules">
            <div class="flex flex-col gap-2">
                <dns-rule-card
                    v-if="dns.rules"
                    v-for="(rule, index) in dns.rules"
                    :key="index"
                    :rule="rule"
                    @edit="editRule(rule, index)"
                    @delete="removeRule(index)"
                />
            </div>
            <Button class="mt-4" label="Add Rule" icon="i-mdi-plus" @click="addRule" />
          </AccordionPanel>
          <AccordionPanel value="2" header="Advanced">
            <div class="p-fluid grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
              <div class="field col-span-1">
                <label for="client_subnet">Client Subnet</label>
                <InputText id="client_subnet" v-model="dns.client_subnet" />
              </div>
              <div class="field col-span-1">
                <label for="cache_capacity">Cache Capacity</label>
                <InputNumber id="cache_capacity" v-model="dns.cache_capacity" />
              </div>
              <div class="field col-span-2">
                <div class="flex flex-wrap gap-4">
                  <div class="flex items-center">
                      <Checkbox v-model="dns.disable_cache" inputId="disable_cache" :binary="true" />
                      <label for="disable_cache" class="ml-2"> Disable Cache </label>
                  </div>
                  <div class="flex items-center">
                      <Checkbox v-model="dns.disable_expire" inputId="disable_expire" :binary="true" />
                      <label for="disable_expire" class="ml-2"> Disable Expire </label>
                  </div>
                  <div class="flex items-center">
                      <Checkbox v-model="dns.independent_cache" inputId="independent_cache" :binary="true" />
                      <label for="independent_cache" class="ml-2"> Independent Cache </label>
                  </div>
                  <div class="flex items-center">
                      <Checkbox v-model="dns.reverse_mapping" inputId="reverse_mapping" :binary="true" />
                      <label for="reverse_mapping" class="ml-2"> Reverse Mapping </label>
                  </div>
                </div>
              </div>
              <div class="field col-span-2">
                <fakeIpEditor v-model="dns.fakeip" />
              </div>
              <div class="field col-span-2">
                <label>Hosts (JSON)</label>
                <JSONEditor v-model="dns.hosts" :rows="6" />
              </div>
              <div class="field col-span-2">
                <label>Rewrite (JSON)</label>
                <JSONEditor v-model="dns.rewrite" :rows="6" />
              </div>
              <div class="field col-span-2">
                <label>Local Domain</label>
                <InputChips v-model="dns.local_domain" />
              </div>
            </div>
          </AccordionPanel>
        </Accordion>
      </div>
      <Dialog v-model:visible="showServerEditor" modal header="Edit DNS Server" class="w-full max-w-lg">
        <dns-server-editor v-if="editableServer" v-model="editableServer" @save="saveServer" @cancel="showServerEditor = false" />
      </Dialog>
      <Dialog v-model:visible="showRuleEditor" modal header="Edit DNS Rule" class="w-full max-w-lg">
        <dns-rule-editor v-if="editableRule" v-model="editableRule" :dns-servers="serverTags" @save="saveRule" @cancel="showRuleEditor = false" />
      </Dialog>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { type Dns, dnsSchema, type DnsRule } from '@/schemas/dns'
import Card from 'primevue/card'
import Tabs from 'primevue/tabs'
import Tab from 'primevue/tab'
import Button from 'primevue/button'
import Select from 'primevue/select'
import Checkbox from 'primevue/checkbox'
import dnsServerEditor from '../dnsServerEditor.vue'
import DnsServerCard from '../dnsServerCard.vue'
import DnsRuleCard from '../dnsRuleCard.vue'
import Dialog from 'primevue/dialog'
import dnsRuleEditor from '../dnsRuleEditor/dnsRuleEditor.vue'
import outboundsSelector from '@/components/outbounds/outboundsSelector/outboundsSelector.vue'
import fakeIpEditor from '../fakeIpEditor.vue'
import InputNumber from "primevue/inputnumber";
import JSONEditor from '@/components/common/JSONEditor.vue'
import InputChips from 'primevue/inputchips'

const props = defineProps<{
  modelValue?: Dns
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Dns): void
}>()

const dns = ref(props.modelValue || dnsSchema.parse({ servers: [] }))
const showServerEditor = ref(false)
const editableServer = ref<Dns['servers'][0] | null>(null)
const editingServerIndex = ref<number | null>(null)
const showRuleEditor = ref(false)
const editableRule = ref<DnsRule | null>(null)
const editingRuleIndex = ref<number | null>(null)

const serverTags = computed(() => dns.value.servers.map((s) => s.tag))

const addServer = () => {
  editableServer.value = dnsSchema.shape.servers.element.parse({ tag: 'new-server', address: '' })
  editingServerIndex.value = null
  showServerEditor.value = true
}

const editServer = (server: Dns['servers'][0], index: number) => {
  editableServer.value = JSON.parse(JSON.stringify(server))
  editingServerIndex.value = index
  showServerEditor.value = true
}

const saveServer = (savedServer: Dns['servers'][0]) => {
  if (editingServerIndex.value !== null) {
    dns.value.servers[editingServerIndex.value] = savedServer
  } else {
    dns.value.servers.push(savedServer)
  }
  showServerEditor.value = false
}

const removeServer = (index: number) => {
  dns.value.servers.splice(index, 1)
}

const addRule = () => {
  if (!dns.value.rules) {
    dns.value.rules = []
  }
  editableRule.value = { server: '' }
  editingRuleIndex.value = null
  showRuleEditor.value = true
}

const editRule = (rule: DnsRule, index: number) => {
  editableRule.value = JSON.parse(JSON.stringify(rule))
  editingRuleIndex.value = index
  showRuleEditor.value = true
}

const saveRule = (savedRule: DnsRule) => {
  if (editingRuleIndex.value !== null) {
    dns.value.rules![editingRuleIndex.value] = savedRule
  } else {
    dns.value.rules!.push(savedRule)
  }
  showRuleEditor.value = false
}

const removeRule = (index: number) => {
  dns.value.rules?.splice(index, 1)
}

watch(
  dns,
  (value) => {
    emit('update:modelValue', value)
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