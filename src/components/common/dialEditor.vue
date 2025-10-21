<template>
  <div>
    <div class="field">
        <label>Detour</label>
        <outboundsPicker v-model="dial.detour" />
    </div>
    <template v-if="!dial.detour">
      <Accordion class="mt-4">
        <AccordionPanel value="advanced" header="Advanced">
          <div class="p-fluid grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="field">
              <label for="bind_interface">Bind Interface</label>
              <InputText id="bind_interface" v-model="dial.bind_interface" />
            </div>
            <div class="field">
              <label for="inet4_bind_address">IPv4 Bind Address</label>
              <InputText id="inet4_bind_address" v-model="dial.inet4_bind_address" />
            </div>
            <div class="field">
              <label for="inet6_bind_address">IPv6 Bind Address</label>
              <InputText id="inet6_bind_address" v-model="dial.inet6_bind_address" />
            </div>
            <div class="field">
              <label for="routing_mark">Routing Mark</label>
              <InputNumber id="routing_mark" v-model.number="dial.routing_mark" />
            </div>
            <div class="field flex items-center">
                <div class="flex items-center">
                    <Checkbox v-model="dial.reuse_addr" inputId="reuse_addr" :binary="true" />
                    <label for="reuse_addr" class="ml-2"> Reuse Address </label>
                </div>
            </div>
            <div class="field">
              <label for="netns">Network Namespace</label>
              <InputText id="netns" v-model="dial.netns" />
            </div>
            <div class="field">
              <label for="connect_timeout">Connect Timeout</label>
              <InputText id="connect_timeout" v-model="dial.connect_timeout" />
            </div>
             <div class="field flex items-center">
                <div class="flex items-center">
                    <Checkbox v-model="dial.tcp_fast_open" inputId="tcp_fast_open" :binary="true" />
                    <label for="tcp_fast_open" class="ml-2"> TCP Fast Open </label>
                </div>
            </div>
             <div class="field flex items-center">
                <div class="flex items-center">
                    <Checkbox v-model="dial.tcp_multi_path" inputId="tcp_multi_path" :binary="true" />
                    <label for="tcp_multi_path" class="ml-2"> TCP Multi Path </label>
                </div>
            </div>
            <div class="field flex items-center">
                <div class="flex items-center">
                    <Checkbox v-model="dial.udp_fragment" inputId="udp_fragment" :binary="true" />
                    <label for="udp_fragment" class="ml-2"> UDP Fragment </label>
                </div>
            </div>
            <div class="field">
              <label for="domain_resolver">Domain Resolver</label>
              <InputText id="domain_resolver" v-model="dial.domain_resolver" />
            </div>
            <div class="field">
              <label for="network_strategy">Network Strategy</label>
              <InputText id="network_strategy" v-model="dial.network_strategy" />
            </div>
            <div class="field">
              <label for="network_type">Network Type</label>
              <InputChips id="network_type" v-model="dial.network_type" />
            </div>
            <div class="field">
              <label for="fallback_network_type">Fallback Network Type</label>
              <InputChips id="fallback_network_type" v-model="dial.fallback_network_type" />
            </div>
            <div class="field">
              <label for="fallback_delay">Fallback Delay</label>
              <InputText id="fallback_delay" v-model="dial.fallback_delay" />
            </div>
            <div class="field">
              <label for="domain_strategy">Domain Strategy</label>
              <InputText id="domain_strategy" v-model="dial.domain_strategy" />
            </div>
          </div>
        </AccordionPanel>
      </Accordion>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Accordion from 'primevue/accordion'
import AccordionPanel from 'primevue/accordionpanel'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Checkbox from 'primevue/checkbox'
import InputChips from 'primevue/inputchips'
import outboundsPicker from '@/components/outbounds/outboundsPicker/outboundsPicker.vue'

const props = defineProps<{
  modelValue: any
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()

const dial = ref(props.modelValue || {})

watch(
  dial,
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