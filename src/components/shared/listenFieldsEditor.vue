<template>
  <Accordion :value="[]">
    <AccordionPanel value="listen" header="Listen Fields">
      <div class="p-fluid grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="field col-span-1">
          <label for="listen">Listen</label>
          <InputText id="listen" v-model="form.listen" />
        </div>
        <div class="field col-span-1">
          <label for="listen_port">Listen Port</label>
          <InputNumber id="listen_port" v-model="form.listen_port" />
        </div>
        <div class="field col-span-1">
          <label for="detour">Detour</label>
          <inboundPicker v-model="form.detour" :inbounds="inbounds" />
        </div>
        <div class="field col-span-1">
          <label for="bind_interface">Bind Interface</label>
          <InputText id="bind_interface" v-model="form.bind_interface" />
        </div>
        <div class="field col-span-1">
          <label for="routing_mark">Routing Mark</label>
          <InputNumber id="routing_mark" v-model="form.routing_mark" />
        </div>
        <div class="field col-span-1">
          <label for="netns">Netns</label>
          <InputText id="netns" v-model="form.netns" />
        </div>
        <div class="field col-span-1">
          <label for="udp_timeout">UDP Timeout</label>
          <InputText id="udp_timeout" v-model="form.udp_timeout" />
        </div>
        <div class="field col-span-1 flex items-center">
          <div class="flex items-center">
            <Checkbox v-model="form.reuse_addr" inputId="reuse_addr" :binary="true" />
            <label for="reuse_addr" class="ml-2"> Reuse Address </label>
          </div>
        </div>
        <div class="field col-span-1 flex items-center">
          <div class="flex items-center">
            <Checkbox v-model="form.tcp_fast_open" inputId="tcp_fast_open" :binary="true" />
            <label for="tcp_fast_open" class="ml-2"> TCP Fast Open </label>
          </div>
        </div>
        <div class="field col-span-1 flex items-center">
          <div class="flex items-center">
            <Checkbox v-model="form.tcp_multi_path" inputId="tcp_multi_path" :binary="true" />
            <label for="tcp_multi_path" class="ml-2"> TCP Multi Path </label>
          </div>
        </div>
        <div class="field col-span-1 flex items-center">
          <div class="flex items-center">
            <Checkbox v-model="form.udp_fragment" inputId="udp_fragment" :binary="true" />
            <label for="udp_fragment" class="ml-2"> UDP Fragment </label>
          </div>
        </div>
      </div>
    </AccordionPanel>
  </Accordion>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Accordion from 'primevue/accordion'
import AccordionPanel from 'primevue/accordionpanel'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Checkbox from 'primevue/checkbox'
import inboundPicker from '@/components/inbounds/inboundPicker.vue'
import type { Inbound } from '@/components/inbounds/inboundEditor/schema'

const props = defineProps<{
  form: any
  inbounds: Inbound[]
}>()

const emit = defineEmits(['update:form'])

const form = ref(props.form)

watch(
  form,
  (value) => {
    emit('update:form', value)
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