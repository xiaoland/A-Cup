<script setup lang="ts">
import type { SingBoxProfile } from '../../../schemas/singbox';
import type { Inbound } from '../../../schemas/inbound';
import type { Dns } from '../../../schemas/dns';
import type { Route } from '../../../schemas/route';
import InboundsEditor from './inboundsEditor.vue';
import DnsEditor from './dnsEditor.vue';
import RouteEditor from './routeEditor.vue';
import Button from 'primevue/button';
import Panel from 'primevue/panel';

const props = defineProps<{
  modelValue: SingBoxProfile;
}>();

const emit = defineEmits(['save', 'cancel', 'update:modelValue']);

const updateInbounds = (inbounds: Inbound[]) => {
  emit('update:modelValue', { ...props.modelValue, inbounds });
};

const updateDns = (dns: Dns) => {
  emit('update:modelValue', { ...props.modelValue, dns });
};

const updateRoute = (route: Route) => {
  emit('update:modelValue', { ...props.modelValue, route });
};

</script>

<template>
  <div>
    <Panel header="Inbounds" :toggleable="true">
      <InboundsEditor :modelValue="modelValue.inbounds" @update:modelValue="updateInbounds" />
    </Panel>

    <Panel header="Outbounds" :toggleable="true" class="mt-4">
      <!-- TODO: Implement Outbounds Editor -->
      <p>TODO: Outbounds editor placeholder</p>
    </Panel>

    <Panel header="DNS" :toggleable="true" class="mt-4">
      <DnsEditor :modelValue="modelValue.dns" @update:modelValue="updateDns" />
    </Panel>

    <Panel header="Route" :toggleable="true" class="mt-4">
      <RouteEditor :modelValue="modelValue.route" @update:modelValue="updateRoute" />
    </Panel>

    <div class="flex justify-content-end mt-4">
      <Button label="Cancel" icon="pi pi-times" severity="secondary" class="mr-2" @click="emit('cancel')" />
      <Button label="Save" icon="pi pi-check" @click="emit('save')" />
    </div>
  </div>
</template>
