<template>
  <Card>
    <template #title>
      <div class="text-2xl font-bold">DNS</div>
    </template>
    <template #content>
      <Tabs value="0">
        <Tab value="0" header="Servers">
          <div class="flex flex-col gap-4 p-4">
            <dnsServerEditor
              v-for="(server, i) in dns.servers"
              :key="i"
              v-model="dns.servers[i]"
              @remove="removeServer(i)"
            />
          </div>
          <Button class="mt-4" label="Add Server" icon="i-mdi-plus" @click="addServer" />
        </Tab>
        <Tab value="1" header="Rules">
          <div class="flex flex-col gap-4 p-4">
            <dnsRuleEditor
              v-if="dns.rules"
              v-for="(rule, i) in dns.rules"
              :key="i"
              v-model="dns.rules[i]"
              :dns-servers="serverTags"
              @remove="removeRule(i)"
            />
          </div>
          <Button class="mt-4" label="Add Rule" icon="i-mdi-plus" @click="addRule" />
        </Tab>
        <Tab value="2" header="Advanced">
          <div class="p-fluid grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            <div class="field col-span-1">
                <label>Final</label>
                <outboundsSelector v-model="dns.final" />
            </div>
            <div class="field col-span-1">
              <label for="strategy">Strategy</label>
              <Select
                id="strategy"
                v-model="dns.strategy"
                :options="['prefer_ipv4', 'prefer_ipv6', 'ipv4_only', 'ipv6_only']"
              />
            </div>
            <div class="field col-span-1 flex items-center">
                <div class="flex items-center">
                    <Checkbox v-model="dns.disable_cache" inputId="disable_cache" :binary="true" />
                    <label for="disable_cache" class="ml-2"> Disable Cache </label>
                </div>
            </div>
             <div class="field col-span-1 flex items-center">
                <div class="flex items-center">
                    <Checkbox v-model="dns.disable_expire" inputId="disable_expire" :binary="true" />
                    <label for="disable_expire" class="ml-2"> Disable Expire </label>
                </div>
            </div>
          </div>
        </Tab>
      </Tabs>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { type Dns, dnsSchema } from '@/schemas/dns'
import Card from 'primevue/card'
import Tabs from 'primevue/tabs'
import Tab from 'primevue/tab'
import Button from 'primevue/button'
import Select from 'primevue/select'
import Checkbox from 'primevue/checkbox'
import dnsServerEditor from '../dnsServerEditor.vue'
import dnsRuleEditor from '../dnsRuleEditor/dnsRuleEditor.vue'
import outboundsSelector from '@/components/outbounds/outboundsSelector/outboundsSelector.vue'

const props = defineProps<{
  modelValue?: Dns
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Dns): void
}>()

const dns = ref(props.modelValue || dnsSchema.parse({ servers: [] }))

const serverTags = computed(() => dns.value.servers.map((s) => s.tag))

const addServer = () => {
  dns.value.servers.push(dnsSchema.shape.servers.element.parse({ tag: 'new-server', address: '' }))
}

const removeServer = (index: number) => {
  dns.value.servers.splice(index, 1)
}

const addRule = () => {
  if (!dns.value.rules) {
    dns.value.rules = []
  }
  dns.value.rules.push(dnsSchema.shape.rules.unwrap().element.parse({ server: '' }))
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