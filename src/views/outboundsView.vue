<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useOutboundStore } from '../stores/outbound';
import OutboundCard from '../components/outbounds/outboundCard.vue';
import OutboundEditor from '../components/outbounds/outboundEditor/outboundEditor.vue';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import type { Outbound } from '../../schemas/outbound';

const outboundStore = useOutboundStore();
const showEditor = ref(false);
const selectedOutbound = ref<Outbound | null>(null);

onMounted(() => {
  outboundStore.fetchOutbounds();
});

function openEditor(outbound: Outbound | null = null) {
  selectedOutbound.value = outbound ? { ...outbound } : { name: '', type: 'vless', region: '', provider: '', server: '', server_port: 0, credential: { uuid: '' }, readableBy: [], writeableBy: [] };
  showEditor.value = true;
}

function closeEditor() {
  showEditor.value = false;
  selectedOutbound.value = null;
}

async function saveOutbound(outbound: Outbound) {
  if (outbound.id) {
    await outboundStore.updateOutbound(outbound);
  } else {
    await outboundStore.createOutbound(outbound);
  }
  closeEditor();
}

async function deleteOutbound(outbound: Outbound) {
  if (outbound.id) {
    await outboundStore.deleteOutbound(outbound.id);
  }
}
</script>

<template>
  <div class="p-4">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Outbounds</h1>
      <Button label="New Outbound" icon="pi pi-plus" @click="openEditor()" />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <OutboundCard
        v-for="outbound in outboundStore.outbounds"
        :key="outbound.id"
        :outbound="outbound"
        @edit="openEditor"
        @delete="deleteOutbound"
      />
    </div>

    <Dialog v-model:visible="showEditor" :header="selectedOutbound && selectedOutbound.id ? 'Edit Outbound' : 'New Outbound'" modal :style="{ width: '50vw' }">
      <OutboundEditor v-if="selectedOutbound" :modelValue="selectedOutbound" @save="saveOutbound" />
    </Dialog>
  </div>
</template>
