<script setup lang="ts">
import { computed } from 'vue';
import type { DialFields } from '../../../schemas/shared';
import Fieldset from 'primevue/fieldset';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Select from 'primevue/select';
import SingBoxOutboundPicker from '../outbounds/singBoxOutboundPicker.vue';

const props = defineProps<{
  modelValue: DialFields;
}>();

const emit = defineEmits(['update:modelValue']);

const dialFields = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const domainResolver = computed({
  get: () => typeof dialFields.value.domain_resolver === 'string' ? dialFields.value.domain_resolver : '',
  set: (value) => {
    dialFields.value = { ...dialFields.value, domain_resolver: value };
  }
});

const domainStrategies = [
  { label: 'Prefer IPv4', value: 'prefer_ipv4' },
  { label: 'Prefer IPv6', value: 'prefer_ipv6' },
  { label: 'IPv4 Only', value: 'ipv4_only' },
  { label: 'IPv6 Only', value: 'ipv6_only' }
];

</script>

<template>
  <Fieldset legend="Dial Fields" :toggleable="true" :collapsed="true">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Left Column -->
      <div class="flex flex-col gap-4">
        <div>
          <label for="detour" class="block mb-2 font-medium">Detour</label>
          <SingBoxOutboundPicker
            id="detour" 
            v-model="dialFields.detour"
          />
        </div>

        <div>
          <label for="bind_interface" class="block mb-2 font-medium">Bind Interface</label>
          <InputText 
            id="bind_interface" 
            v-model="dialFields.bind_interface" 
            class="w-full"
          />
        </div>

        <div>
          <label for="inet4_bind_address" class="block mb-2 font-medium">IPv4 Bind Address</label>
          <InputText 
            id="inet4_bind_address" 
            v-model="dialFields.inet4_bind_address" 
            class="w-full"
          />
        </div>

        <div>
          <label for="inet6_bind_address" class="block mb-2 font-medium">IPv6 Bind Address</label>
          <InputText 
            id="inet6_bind_address" 
            v-model="dialFields.inet6_bind_address" 
            class="w-full"
          />
        </div>

        <div>
          <label for="routing_mark" class="block mb-2 font-medium">Routing Mark</label>
          <InputNumber 
            id="routing_mark" 
            v-model="dialFields.routing_mark"
            class="w-full"
            :use-grouping="false"
          />
        </div>
      </div>

      <!-- Right Column -->
      <div class="flex flex-col gap-4">
        <div>
          <label for="connect_timeout" class="block mb-2 font-medium">Connect Timeout</label>
          <InputText 
            id="connect_timeout" 
            v-model="dialFields.connect_timeout"
            class="w-full"
            placeholder="e.g., 5s"
          />
        </div>

        <div>
          <label for="domain_resolver" class="block mb-2 font-medium">Domain Resolver</label>
          <InputText 
            id="domain_resolver" 
            v-model="domainResolver"
            class="w-full"
          />
        </div>

        <div>
          <label for="domain_strategy" class="block mb-2 font-medium">Domain Strategy</label>
          <Select 
            id="domain_strategy" 
            v-model="dialFields.domain_strategy"
            :options="domainStrategies"
            option-label="label"
            option-value="value"
            placeholder="Select a Strategy"
            class="w-full"
          />
        </div>

        <!-- Boolean Toggles -->
        <div class="flex flex-col gap-3 mt-2">
          <div class="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="reuse_addr" 
              v-model="dialFields.reuse_addr"
              class="cursor-pointer"
            />
            <label for="reuse_addr" class="cursor-pointer">Reuse Address</label>
          </div>

          <div class="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="tcp_fast_open" 
              v-model="dialFields.tcp_fast_open"
              class="cursor-pointer"
            />
            <label for="tcp_fast_open" class="cursor-pointer">TCP Fast Open</label>
          </div>

          <div class="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="tcp_multi_path" 
              v-model="dialFields.tcp_multi_path"
              class="cursor-pointer"
            />
            <label for="tcp_multi_path" class="cursor-pointer">TCP Multi Path</label>
          </div>

          <div class="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="udp_fragment" 
              v-model="dialFields.udp_fragment"
              class="cursor-pointer"
            />
            <label for="udp_fragment" class="cursor-pointer">UDP Fragment</label>
          </div>
        </div>
      </div>
    </div>
  </Fieldset>
</template>
