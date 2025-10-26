<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useOutboundStore } from '../stores/outbound';
import OutboundCard from '../components/outbounds/outboundCard.vue';
import Button from 'primevue/button';
import type { Outbound } from '../../schemas/outbound';

const outboundStore = useOutboundStore();
const router = useRouter();

onMounted(() => {
  outboundStore.fetchOutbounds();
});

function newOutbound() {
  router.push('/outbounds/new');
}

function editOutbound(outbound: Outbound) {
  router.push(`/outbounds/edit/${outbound.id}`);
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
      <Button label="New Outbound" icon="pi pi-plus" @click="newOutbound" />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <OutboundCard
        v-for="outbound in outboundStore.outbounds"
        :key="outbound.id"
        :outbound="outbound"
        @edit="editOutbound"
        @delete="deleteOutbound"
      />
    </div>
  </div>
</template>
