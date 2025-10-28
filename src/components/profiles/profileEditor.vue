<script setup lang="ts">
import type { SingBoxProfile } from '../../../schemas/singbox';
import type { Inbound } from '../../../schemas/inbound';
import type { Dns } from '../../../schemas/dns';
import type { Route } from '../../../schemas/route';
import InboundsEditor from './inboundsEditor.vue';
import DnsEditor from './dnsEditor.vue';
import RouteEditor from './routeEditor.vue';
import Button from 'primevue/button';

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
    <InboundsEditor :modelValue="modelValue.inbounds" @update:modelValue="updateInbounds" />
    <hr />
    <!-- TODO: Implement Outbounds Editor -->
    <h3>Outbounds</h3>
    <p>TODO: Outbounds editor placeholder</p>
    <hr />
    <DnsEditor :modelValue="modelValue.dns" @update:modelValue="updateDns" />
    <hr />
    <RouteEditor :modelValue="modelValue.route" @update:modelValue="updateRoute" />
    <hr />
    <div class="p-d-flex p-jc-end">
      <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="emit('cancel')" />
      <Button label="Save" icon="pi pi-check" @click="emit('save')" />
    </div>
  </div>
</template>
