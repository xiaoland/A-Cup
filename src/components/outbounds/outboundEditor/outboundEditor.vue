
<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { z } from 'zod';
import { OutboundSchema, VlessCredentialSchema, VmessCredentialSchema, ShadowsocksCredentialSchema, Hysteria2CredentialSchema } from '../../../schemas/outbound';
import ImportOutbound from '../importOutbound.vue';

import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import Fieldset from 'primevue/fieldset';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import UsersPicker from '../../user/usersPicker.vue';
import JSONEditor from '../../common/JSONEditor.vue';

import VlessForm from './vlessForm.vue';
import VmessForm from './vmessForm.vue';
import ShadowsocksForm from './shadowsocksForm.vue';
import Hysteria2Form from './hysteria2Form.vue';

type OutboundModel = z.infer<typeof OutboundSchema>;

const props = defineProps<{
  modelValue: OutboundModel;
}>();

const emit = defineEmits(['update:modelValue', 'save', 'cancel']);

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
];

watch(() => localOutbound.value.type, (newType, oldType) => {
  if (newType === oldType) return;

  const newOutbound = { ...localOutbound.value, type: newType };

  switch (newType) {
    case 'vless':
      newOutbound.credential = VlessCredentialSchema.parse({});
      break;
    case 'vmess':
      newOutbound.credential = VmessCredentialSchema.parse({});
      break;
    case 'shadowsocks':
      newOutbound.credential = ShadowsocksCredentialSchema.parse({});
      break;
    case 'hysteria2':
      newOutbound.credential = Hysteria2CredentialSchema.parse({});
      break;
  }
  localOutbound.value = newOutbound;
});

function save() {
  emit('save', localOutbound.value);
}

const isImportDialogVisible = ref(false);

function showImportDialog() {
  isImportDialogVisible.value = true;
}

function onParsed(parsedOutbound: OutboundModel) {
  localOutbound.value = { ...localOutbound.value, ...parsedOutbound };
}

function cancel() {
  emit('cancel');
}
</script>

<template>
  <div class="p-4">
    <ImportOutbound v-model:visible="isImportDialogVisible" @parsed="onParsed" />
    <Fieldset legend="Basic Info">
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
    </Fieldset>

    <Fieldset legend="Base" class="mt-4">
      <div class="grid grid-cols-2 gap-4">
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
      </div>
    </Fieldset>

    <Fieldset legend="Advanced" :toggleable="true" :collapsed="true" class="mt-4">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="readableBy">Readable By</label>
          <UsersPicker id="readableBy" v-model="localOutbound.readableBy" />
        </div>
        <div>
          <label for="writeableBy">Writeable By</label>
          <UsersPicker id="writeableBy" v-model="localOutbound.writeableBy" />
        </div>
        <div>
          <label for="tls">TLS</label>
          <JSONEditor id="tls" v-model="localOutbound.tls" />
        </div>
        <div>
          <label for="mux">Mux</label>
          <JSONEditor id="mux" v-model="localOutbound.mux" />
        </div>
        <div>
          <label for="other">Other</label>
          <JSONEditor id="other" v-model="localOutbound.other" />
        </div>
      </div>
    </Fieldset>

    <div class="flex justify-between mt-4">
      <Button label="Import" @click="showImportDialog" class="p-button-secondary" />
      <div class="flex">
        <Button label="Cancel" @click="cancel" class="p-button-text" />
        <Button label="Save" @click="save" />
      </div>
    </div>
  </div>
</template>
