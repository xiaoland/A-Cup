<template>
  <div class="p-fluid form-grid">
    <!-- Basic Fields -->
    <div class="field col-span-4">
      <label for="interface_name">Interface Name</label>
      <InputText id="interface_name" v-model="form.interface_name" />
    </div>
    <div class="field col-span-4">
      <label for="mtu">MTU</label>
      <InputNumber id="mtu" v-model="form.mtu" />
    </div>
    <div class="field col-span-4">
      <label for="stack">Stack</label>
      <Select id="stack" v-model="form.stack" :options="stackOptions" />
    </div>

    <!-- Addresses -->
    <div class="col-span-12">
        <StringListEditor v-model="form.address" title="Addresses (CIDR)" />
    </div>

    <!-- Auto Route Settings -->
    <div class="col-span-12 grid grid-cols-3 gap-4">
        <div class="flex items-center">
            <Checkbox v-model="form.auto_route" inputId="auto_route" :binary="true" />
            <label for="auto_route" class="ml-2"> Auto Route </label>
        </div>
        <div class="flex items-center">
            <Checkbox v-model="form.auto_redirect" inputId="auto_redirect" :binary="true" :disabled="!form.auto_route" />
            <label for="auto_redirect" class="ml-2"> Auto Redirect </label>
        </div>
        <div class="flex items-center">
            <Checkbox v-model="form.strict_route" inputId="strict_route" :binary="true" :disabled="!form.auto_route" />
            <label for="strict_route" class="ml-2"> Strict Route </label>
        </div>
    </div>

    <!-- Advanced -->
    <div class="col-span-12">
      <Accordion>
        <AccordionPanel value="advanced" header="Advanced">
          <div class="p-fluid form-grid">
            <div class="field col-span-6">
              <label for="iproute2_table_index">iproute2 table index</label>
              <InputNumber id="iproute2_table_index" v-model="form.iproute2_table_index" :disabled="!form.auto_route" />
            </div>
            <div class="field col-span-6">
              <label for="iproute2_rule_index">iproute2 rule index</label>
              <InputNumber id="iproute2_rule_index" v-model="form.iproute2_rule_index" :disabled="!form.auto_route" />
            </div>
            <div class="col-span-6">
                <StringListEditor v-model="form.route_address" title="Route Address" :disabled="!form.auto_route" />
            </div>
            <div class="col-span-6">
                <StringListEditor v-model="form.route_exclude_address" title="Route Exclude Address" :disabled="!form.auto_route" />
            </div>
            <div class="col-span-6">
                <StringListEditor v-model="form.route_address_set" title="Route Address Set" :disabled="!form.auto_route" />
            </div>
            <div class="col-span-6">
                <StringListEditor v-model="form.route_exclude_address_set" title="Route Exclude Address Set" :disabled="!form.auto_route" />
            </div>
            <div class="field col-span-6">
              <label for="auto_redirect_input_mark">Auto Redirect Input Mark</label>
              <InputText id="auto_redirect_input_mark" v-model="form.auto_redirect_input_mark" :disabled="!form.auto_route || !form.auto_redirect" />
            </div>
            <div class="field col-span-6">
              <label for="auto_redirect_output_mark">Auto Redirect Output Mark</label>
              <InputText id="auto_redirect_output_mark" v-model="form.auto_redirect_output_mark" :disabled="!form.auto_route || !form.auto_redirect" />
            </div>
             <div class="field col-span-6 flex items-center">
                <div class="flex items-center">
                    <Checkbox v-model="form.endpoint_independent_nat" inputId="endpoint_independent_nat" :binary="true" />
                    <label for="endpoint_independent_nat" class="ml-2"> Endpoint Independent NAT (gvisor) </label>
                </div>
            </div>
            <div class="field col-span-6">
                <label for="udp_timeout">UDP Timeout</label>
                <InputText id="udp_timeout" v-model="form.udp_timeout" />
            </div>
            <div class="col-span-12">
                <StringListEditor v-model="form.loopback_address" title="Loopback Address" />
            </div>
            <div class="col-span-6">
                <StringListEditor v-model="form.include_interface" title="Include Interface" />
            </div>
            <div class="col-span-6">
                <StringListEditor v-model="form.exclude_interface" title="Exclude Interface" />
            </div>
            <div class="col-span-6">
                <NumberListEditor v-model="form.include_uid" title="Include UID" />
            </div>
            <div class="col-span-6">
                <NumberListEditor v-model="form.exclude_uid" title="Exclude UID" />
            </div>
            <div class="col-span-6">
                <StringListEditor v-model="form.include_uid_range" title="Include UID Range" />
            </div>
            <div class="col-span-6">
                <StringListEditor v-model="form.exclude_uid_range" title="Exclude UID Range" />
            </div>
            <div class="col-span-6">
                <NumberListEditor v-model="form.include_android_user" title="Include Android User" />
            </div>
            <div class="col-span-6">
                <StringListEditor v-model="form.include_package" title="Include Package" />
            </div>
            <div class="col-span-6">
                <StringListEditor v-model="form.exclude_package" title="Exclude Package" />
            </div>
          </div>
        </AccordionPanel>
      </Accordion>
    </div>

    <!-- Platform HTTP Proxy -->
    <div class="col-span-12">
        <Accordion>
            <AccordionPanel value="http-proxy" header="Platform: HTTP Proxy">
                <div class="p-fluid form-grid">
                    <div class="field col-span-4 flex items-center">
                         <div class="flex items-center">
                            <Checkbox v-model="platformHttpProxy.enabled" inputId="http_proxy_enabled" :binary="true" />
                            <label for="http_proxy_enabled" class="ml-2"> Enabled </label>
                        </div>
                    </div>
                    <div class="field col-span-4">
                        <label for="http_proxy_server">Server</label>
                        <InputText id="http_proxy_server" v-model="platformHttpProxy.server" :disabled="!platformHttpProxy.enabled" />
                    </div>
                    <div class="field col-span-4">
                        <label for="http_proxy_port">Server Port</label>
                        <InputNumber id="http_proxy_port" v-model="platformHttpProxy.server_port" :disabled="!platformHttpProxy.enabled" />
                    </div>
                    <div class="col-span-6">
                        <StringListEditor v-model="platformHttpProxy.bypass_domain" title="Bypass Domain" :disabled="!platformHttpProxy.enabled" />
                    </div>
                     <div class="col-span-6">
                        <StringListEditor v-model="platformHttpProxy.match_domain" title="Match Domain (Apple only)" :disabled="!platformHttpProxy.enabled" />
                    </div>
                </div>
            </AccordionPanel>
        </Accordion>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import Checkbox from 'primevue/checkbox'
import Accordion from 'primevue/accordion'
import AccordionPanel from 'primevue/accordionpanel'
import StringListEditor from '../../common/StringListEditor.vue'
import NumberListEditor from '../../common/NumberListEditor.vue'
import type { TunInbound, PlatformHTTPProxy } from './schema'

const props = defineProps<{ form: TunInbound }>()
const emit = defineEmits<{ (e: 'update:form', v: TunInbound): void }>()

const form = computed({
  get: () => props.form,
  set: (v) => emit('update:form', v),
})

const stackOptions = ['system', 'gvisor', 'mixed']

const platformHttpProxy = computed<PlatformHTTPProxy>({
    get: () => {
        if (!form.value.platform) form.value.platform = {}
        if (!form.value.platform.http_proxy) form.value.platform.http_proxy = {}
        return form.value.platform.http_proxy
    },
    set: (v) => {
        if (!form.value.platform) form.value.platform = {}
        form.value.platform.http_proxy = v
    }
})
</script>

<style scoped>
.form-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 1rem;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.col-span-4 {
  grid-column: span 4 / span 4;
}
.col-span-6 {
  grid-column: span 6 / span 6;
}
.col-span-12 {
  grid-column: span 12 / span 12;
}
</style>