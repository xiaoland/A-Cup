<script setup lang="ts">
import { computed } from 'vue';
import type { Inbound } from '../../../schemas/inbound';
import Select from 'primevue/select';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import ToggleSwitch from 'primevue/toggleswitch';
import Chips from 'primevue/chips';

const props = defineProps<{
  modelValue: Inbound;
}>();

const emit = defineEmits(['update:modelValue']);

const inbound = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const inboundTypes = [
  { label: 'Mixed (HTTP/SOCKS)', value: 'mixed' },
  { label: 'TUN', value: 'tun' }
];

const tunStacks = [
  { label: 'System', value: 'system' },
  { label: 'gVisor', value: 'gvisor' },
  { label: 'Mixed', value: 'mixed' }
];

const onTypeChange = (newType: 'mixed' | 'tun') => {
  const tag = inbound.value.tag;
  if (newType === 'mixed') {
    inbound.value = { tag, type: 'mixed', listen: '0.0.0.0', listen_port: 1080 };
  } else {
    inbound.value = { tag, type: 'tun', address: [] };
  }
};

const tunAddress = computed({
    get: () => {
        if (inbound.value.type === 'tun') {
            if (Array.isArray(inbound.value.address)) return inbound.value.address;
            if (typeof inbound.value.address === 'string') return [inbound.value.address];
        }
        return [];
    },
    set: (value) => {
        if (inbound.value.type === 'tun') {
            inbound.value = { ...inbound.value, address: value };
        }
    }
});

</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label for="tag" class="block mb-2 font-medium">Tag</label>
        <InputText 
          id="tag" 
          v-model="inbound.tag" 
          class="w-full"
        />
      </div>

      <div>
        <label for="type" class="block mb-2 font-medium">Inbound Type</label>
        <Select 
          id="type" 
          v-model="inbound.type"
          :options="inboundTypes" 
          optionLabel="label"
          optionValue="value"
          @update:modelValue="onTypeChange"
          class="w-full"
        />
      </div>
    </div>

    <!-- Mixed Inbound Configuration -->
    <template v-if="inbound.type === 'mixed'">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="listen" class="block mb-2 font-medium">Listen Address</label>
          <InputText 
            id="listen" 
            v-model="inbound.listen" 
            class="w-full"
            placeholder="0.0.0.0"
          />
        </div>

        <div>
          <label for="listen_port" class="block mb-2 font-medium">Listen Port</label>
          <InputNumber 
            id="listen_port" 
            v-model="inbound.listen_port"
            class="w-full"
            :use-grouping="false"
            :min="1"
            :max="65535"
          />
        </div>
      </div>

      <div class="flex items-center gap-3">
        <ToggleSwitch 
          id="set_system_proxy" 
          v-model="inbound.set_system_proxy"
        />
        <label for="set_system_proxy" class="cursor-pointer">
          Set System Proxy
        </label>
      </div>

      <!-- TODO: Editor for users array -->
    </template>

    <!-- TUN Inbound Configuration -->
    <template v-if="inbound.type === 'tun'">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Left Column -->
        <div class="flex flex-col gap-4">
          <div>
            <label for="interface_name" class="block mb-2 font-medium">Interface Name</label>
            <InputText 
              id="interface_name" 
              v-model="inbound.interface_name"
              class="w-full"
              placeholder="tun0"
            />
          </div>

          <div>
            <label for="address" class="block mb-2 font-medium">IP Addresses</label>
            <Chips 
              id="address" 
              v-model="tunAddress"
              class="w-full"
              placeholder="e.g., 172.19.0.1/30"
            />
            <small class="text-gray-500">Press Enter to add multiple addresses</small>
          </div>

          <div>
            <label for="mtu" class="block mb-2 font-medium">MTU</label>
            <InputNumber 
              id="mtu" 
              v-model="inbound.mtu"
              class="w-full"
              :use-grouping="false"
              :min="1280"
              :max="9000"
            />
          </div>

          <div>
            <label for="stack" class="block mb-2 font-medium">Network Stack</label>
            <Select 
              id="stack" 
              v-model="inbound.stack"
              :options="tunStacks"
              optionLabel="label"
              optionValue="value"
              class="w-full"
            />
          </div>
        </div>

        <!-- Right Column - Switches -->
        <div class="flex flex-col gap-4">
          <div class="flex items-center gap-3">
            <ToggleSwitch 
              id="auto_route" 
              v-model="inbound.auto_route"
            />
            <label for="auto_route" class="cursor-pointer">
              Auto Route
            </label>
          </div>

          <div class="flex items-center gap-3">
            <ToggleSwitch 
              id="strict_route" 
              v-model="inbound.strict_route"
            />
            <label for="strict_route" class="cursor-pointer">
              Strict Route
            </label>
          </div>

          <div class="flex items-center gap-3">
            <ToggleSwitch 
              id="endpoint_independent_nat" 
              v-model="inbound.endpoint_independent_nat"
            />
            <label for="endpoint_independent_nat" class="cursor-pointer">
              Endpoint Independent NAT
            </label>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
