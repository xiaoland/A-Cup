<script setup lang="ts">
import { computed } from 'vue';
import type { DNSServer } from '../../../schemas/dns';
import DialFieldsEditor from '../common/DialFieldsEditor.vue';
import TLSClientFieldsEditor from '../common/TLSClientFieldsEditor.vue';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';

const props = defineProps<{
  modelValue: DNSServer;
}>();

const emit = defineEmits(['update:modelValue']);

const server = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const serverTypes = ['udp', 'tls', 'https'];

const onTypeChange = (newType: 'udp' | 'tls' | 'https') => {
  const tag = server.value.tag;
  if (newType === 'tls') {
    server.value = {
      tag,
      type: 'tls',
      address: '',
      tls: { enabled: true, utls: { enabled: false }, reality: { enabled: false } }
    };
  } else if (newType === 'https') {
    server.value = {
      tag,
      type: 'https',
      address: '',
      tls: { enabled: true, utls: { enabled: false }, reality: { enabled: false } }
    };
  } else {
    server.value = { tag, type: 'udp', address: '' };
  }
};

</script>

<template>
  <div class="p-fluid">
    <div class="field">
      <label for="tag">Tag</label>
      <InputText id="tag" v-model="server.tag" />
    </div>
    <div class="field">
      <label for="type">Server Type</label>
      <Dropdown id="type" :modelValue="server.type" :options="serverTypes" @update:modelValue="onTypeChange" placeholder="Select a Type" />
    </div>

    <div class="field" v-if="server.type">
      <label for="address">Address</label>
      <InputText id="address" v-model="server.address" />
    </div>

    <template v-if="(server.type === 'tls' || server.type === 'https') && server.tls">
      <TLSClientFieldsEditor v-model="server.tls" class="mt-2" />
    </template>

    <DialFieldsEditor v-model="server" class="mt-2" />
  </div>
</template>
