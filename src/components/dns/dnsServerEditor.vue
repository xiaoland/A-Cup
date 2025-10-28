<script setup lang="ts">
import { computed } from 'vue';
import type { DNSServer } from '../../../schemas/dns';
import DialFieldsEditor from '../common/DialFieldsEditor.vue';
import TLSClientFieldsEditor from '../common/TLSClientFieldsEditor.vue';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';

const props = defineProps<{
  modelValue: DNSServer;
}>();

const emit = defineEmits(['update:modelValue']);

const server = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const serverTypes = [
  { label: 'UDP', value: 'udp' },
  { label: 'TLS', value: 'tls' },
  { label: 'HTTPS', value: 'https' }
];

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
  <div class="flex flex-col gap-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label for="tag" class="block mb-2 font-medium">Tag</label>
        <InputText 
          id="tag" 
          v-model="server.tag" 
          class="w-full"
        />
      </div>

      <div>
        <label for="type" class="block mb-2 font-medium">Server Type</label>
        <Select 
          id="type" 
          :model-value="server.type" 
          :options="serverTypes"
          option-label="label"
          option-value="value"
          @update:model-value="onTypeChange" 
          placeholder="Select a Type" 
          class="w-full"
        />
      </div>
    </div>

    <div v-if="server.type">
      <label for="address" class="block mb-2 font-medium">Address</label>
      <InputText 
        id="address" 
        v-model="server.address" 
        class="w-full"
      />
    </div>

    <template v-if="(server.type === 'tls' || server.type === 'https') && server.tls">
      <TLSClientFieldsEditor v-model="server.tls" class="mt-3" />
    </template>

    <DialFieldsEditor v-model="server" class="mt-3" />
  </div>
</template>
