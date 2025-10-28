<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue';
import type { SingBoxOutbound } from '../../../schemas/singbox';
import type { Outbound } from '../../../schemas/outbound';
import { exportOutboundToSingBox } from '../../../schemas/outbound';
import { VlessCredentialSchema } from '../../../schemas/outbound';
import OutboundPicker from './outboundPicker.vue';
import DialFieldsEditor from '../common/DialFieldsEditor.vue';
import JSONEditor from '../common/JSONEditor.vue';
import Fieldset from 'primevue/fieldset';
import { z } from 'zod';

const props = defineProps<{
  modelValue?: SingBoxOutbound;
}>();

const emit = defineEmits(['update:modelValue']);

const localOutbound = ref<SingBoxOutbound>();

watch(() => props.modelValue, (newValue) => {
    localOutbound.value = newValue;
}, { deep: true, immediate: true });

onMounted(() => {
    if (!localOutbound.value) {
        const cred = VlessCredentialSchema.parse({})
        localOutbound.value = {
            type: 'vless',
            tag: 'new-outbound',
            server: '127.0.0.1',
            server_port: 443,
            ...cred,
        }
    }
})

watch(localOutbound, (newValue) => {
  emit('update:modelValue', newValue);
}, { deep: true });

function onBaseOutboundSelected(selectedOutbound: Outbound) {
  if (selectedOutbound) {
    const converted = exportOutboundToSingBox(selectedOutbound) as z.infer<typeof SingBoxOutboundSchema>;
    localOutbound.value = { ...localOutbound.value, ...converted };
  }
}

const dialFields = computed({
  get: () => {
    return {
      detour: localOutbound.value?.detour,
      bind_interface: localOutbound.value?.bind_interface,
      inet4_bind_address: localOutbound.value?.inet4_bind_address,
      inet6_bind_address: localOutbound.value?.inet6_bind_address,
      routing_mark: localOutbound.value?.routing_mark,
      reuse_addr: localOutbound.value?.reuse_addr,
      connect_timeout: localOutbound.value?.connect_timeout,
      tcp_fast_open: localOutbound.value?.tcp_fast_open,
      tcp_multi_path: localOutbound.value?.tcp_multi_path,
      udp_fragment: localOutbound.value?.udp_fragment,
      domain_strategy: localOutbound.value?.domain_strategy,
      domain_resolver: localOutbound.value?.domain_resolver,
    }
  },
  set: (newDialFields) => {
    if (localOutbound.value) {
        localOutbound.value = { ...localOutbound.value, ...newDialFields };
    }
  }
});

const otherFields = computed({
  get: () => {
    const dialKeys = [
        'detour', 'bind_interface', 'inet4_bind_address', 'inet6_bind_address',
        'routing_mark', 'reuse_addr', 'connect_timeout', 'tcp_fast_open',
        'tcp_multi_path', 'udp_fragment', 'domain_strategy', 'domain_resolver'
    ];
    const other: any = {};
    if (localOutbound.value) {
        for (const key in localOutbound.value) {
            if (!dialKeys.includes(key)) {
                other[key] = localOutbound.value[key];
            }
        }
    }
    return other;
  },
  set: (newOtherFields) => {
    const newDialFields = {};
    if (localOutbound.value) {
        for (const key in dialFields.value) {
            newDialFields[key] = localOutbound.value[key];
        }
        localOutbound.value = { ...newDialFields, ...newOtherFields };
    }
  }
});

</script>

<template>
  <div>
    <Fieldset legend="Base Outbound">
      <OutboundPicker @update:modelValue="onBaseOutboundSelected" />
    </Fieldset>

    <DialFieldsEditor v-if="localOutbound" v-model="dialFields" class="mt-4" />

    <Fieldset legend="Other Fields" class="mt-4">
      <JSONEditor v-model="otherFields" />
    </Fieldset>
  </div>
</template>
