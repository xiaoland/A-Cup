<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { z } from 'zod';
import { OutboundSchema, VlessCredentialSchema, VmessCredentialSchema, ShadowsocksCredentialSchema, Hysteria2CredentialSchema } from '../../../../schemas/outbound';
import { SelectorOutboundSchema, UrlTestOutboundSchema, DirectOutboundSchema } from './special-outbound';

import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import Panel from 'primevue/panel';
import InputNumber from 'primevue/inputnumber';

import VlessForm from './vlessForm.vue';
import VmessForm from './vmessForm.vue';
import ShadowsocksForm from './shadowsocksForm.vue';
import Hysteria2Form from './hysteria2Form.vue';
import SelectorForm from './selectorForm.vue';
import UrltestForm from './urltestForm.vue';
import DirectForm from './directForm.vue';

type OutboundModel = z.infer<typeof OutboundSchema> | z.infer<typeof SelectorOutboundSchema> | z.infer<typeof UrlTestOutboundSchema> | z.infer<typeof DirectOutboundSchema>;

const props = defineProps<{
  modelValue: OutboundModel;
}>();

const emit = defineEmits(['update:modelValue', 'save']);

const localOutbound = ref(JSON.parse(JSON.stringify(props.modelValue)));

watch(() => props.modelValue, (newValue) => {
  localOutbound.value = JSON.parse(JSON.stringify(newValue));
}, { deep: true });

watch(localOutbound, (newValue) => {
  emit('update:modelValue', newValue);
}, { deep: true });

const outboundTypes = [
  { label: 'VLESS', value: 'vless' },
  { label: 'VMess', value: 'vmess' },
  { label: 'Shadowsocks', value: 'shadowsocks' },
  { label: 'Hysteria2', value: 'hysteria2' },
  { label: 'Selector', value: 'selector' },
  { label: 'URLTest', value: 'urltest' },
  { label: 'Direct', value: 'direct' },
];

const isSpecialOutbound = computed(() => {
  const specialTypes = ['selector', 'urltest', 'direct'];
  return specialTypes.includes(localOutbound.value.type);
});

watch(() => localOutbound.value.type, (newType, oldType) => {
  if (newType === oldType) return;

  const commonData = {
    name: localOutbound.value.name,
    region: 'region' in localOutbound.value ? localOutbound.value.region : '',
    provider: 'provider' in localOutbound.value ? localOutbound.value.provider : '',
    type: newType,
  };

  switch (newType) {
    case 'vless':
      localOutbound.value = { ...commonData, server: '', server_port: 0, credential: { uuid: '', flow: '' } as z.infer<typeof VlessCredentialSchema> };
      break;
    case 'vmess':
      localOutbound.value = { ...commonData, server: '', server_port: 0, credential: { uuid: '', security: 'auto', alter_id: 0 } as z.infer<typeof VmessCredentialSchema> };
      break;
    case 'shadowsocks':
      localOutbound.value = { ...commonData, server: '', server_port: 0, credential: { method: '', password: '' } as z.infer<typeof ShadowsocksCredentialSchema> };
      break;
    case 'hysteria2':
      localOutbound.value = { ...commonData, server: '', server_port: 0, credential: { password: '' } as z.infer<typeof Hysteria2CredentialSchema> };
      break;
    case 'selector':
      localOutbound.value = { ...commonData, outbounds: [], default: '' };
      break;
    case 'urltest':
      localOutbound.value = { ...commonData, outbounds: [], url: 'https://www.gstatic.com/generate_204', interval: '3m' };
      break;
    case 'direct':
      localOutbound.value = { ...commonData };
      break;
  }
});

function save() {
  emit('save', localOutbound.value);
}
</script>

<template>
  <div class="p-4">
    <TabView>
      <TabPanel header="Basic" value="basic">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="name">Name</label>
            <InputText id="name" v-model="localOutbound.name" class="w-full" />
          </div>
          <div>
            <label for="type">Type</label>
            <Dropdown id="type" v-model="localOutbound.type" :options="outboundTypes" optionLabel="label" optionValue="value" class="w-full" />
          </div>
          <div>
            <label for="region">Region</label>
            <InputText id="region" v-model="localOutbound.region" class="w-full" />
          </div>
          <div>
            <label for="provider">Provider</label>
            <InputText id="provider" v-model="localOutbound.provider" class="w-full" />
          </div>
        </div>
      </TabPanel>
      <TabPanel header="Base" value="base">
        <div v-if="!isSpecialOutbound" class="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label for="server">Server</label>
            <InputText id="server" v-model="localOutbound.server" class="w-full" />
          </div>
          <div>
            <label for="server_port">Server Port</label>
            <InputNumber id="server_port" v-model="localOutbound.server_port" class="w-full" />
          </div>
        </div>

        <div class="mt-4">
          <VlessForm v-if="localOutbound.type === 'vless'" v-model="localOutbound.credential" />
          <VmessForm v-if="localOutbound.type === 'vmess'" v-model="localOutbound.credential" />
          <ShadowsocksForm v-if="localOutbound.type === 'shadowsocks'" v-model="localOutbound.credential" />
          <Hysteria2Form v-if="localOutbound.type === 'hysteria2'" v-model="localOutbound.credential" />
          <SelectorForm v-if="localOutbound.type === 'selector'" v-model="localOutbound" />
          <UrltestForm v-if="localOutbound.type === 'urltest'" v-model="localOutbound" />
          <DirectForm v-if="localOutbound.type === 'direct'" v-model="localOutbound" />
        </div>
      </TabPanel>
      <TabPanel header="Advanced" value="advanced">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="readableBy">Readable By</label>
            <Chips id="readableBy" v-model="localOutbound.readableBy" class="w-full" />
          </div>
          <div>
            <label for="writeableBy">Writeable By</label>
            <Chips id="writeableBy" v-model="localOutbound.writeableBy" class="w-full" />
          </div>
          <div>
            <label for="tls">TLS</label>
            <Textarea id="tls" v-model="localOutbound.tls" class="w-full" />
          </div>
          <div>
            <label for="mux">Mux</label>
            <Textarea id="mux" v-model="localOutbound.mux" class="w-full" />
          </div>
          <div>
            <label for="other">Other</label>
            <Textarea id="other" v-model="localOutbound.other" class="w-full" />
          </div>
        </div>
      </TabPanel>
    </TabView>

    <div class="flex justify-end mt-4">
      <Button label="Save" @click="save" />
    </div>
  </div>
</template>
