<script setup lang="ts">
import type { SingBoxProfile, SingBoxOutbound } from '../../../schemas/singbox';
import InboundsEditor from './inboundsEditor.vue';
import OutboundsEditor from './outboundsEditor.vue';
import DnsEditor from './dnsEditor.vue';
import RouteEditor from './routeEditor.vue';
import Button from 'primevue/button';
import Panel from 'primevue/panel';
import { provide, computed } from 'vue';

const props = defineProps<{
  modelValue: SingBoxProfile;
}>();

const emit = defineEmits(['save', 'cancel', 'update:modelValue']);

// Provide profileOutbounds to child components
const profileOutbounds = computed<SingBoxOutbound[]>(() => props.modelValue.outbounds || []);
provide('profileOutbounds', profileOutbounds);

</script>

<template>
  <div>
    <Panel header="Inbounds" :toggleable="true">
      <InboundsEditor v-model="modelValue.inbounds"/>
    </Panel>

    <Panel header="Outbounds" :toggleable="true" class="mt-4">
      <OutboundsEditor v-model="modelValue.outbounds" />
    </Panel>

    <Panel header="DNS" :toggleable="true" class="mt-4">
      <DnsEditor v-model="modelValue.dns" />
    </Panel>

    <Panel header="Route" :toggleable="true" class="mt-4">
      <RouteEditor v-model="modelValue.route" />
    </Panel>

    <div class="flex justify-content-end mt-4">
      <Button label="Cancel" icon="pi pi-times" severity="secondary" class="mr-2" @click="emit('cancel')" />
      <Button label="Save" icon="pi pi-check" @click="emit('save')" />
    </div>
  </div>
</template>
