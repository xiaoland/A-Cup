<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useOutboundStore } from '../stores/outbound';
import OutboundEditor from '../components/outbounds/outboundEditor/outboundEditor.vue';
import type { Outbound } from '../../schemas/outbound';

const route = useRoute();
const router = useRouter();
const outboundStore = useOutboundStore();

const outbound = ref<Outbound | null>(null);
const isNew = computed(() => !route.params.id);

onMounted(async () => {
  if (isNew.value) {
    outbound.value = {
      id: undefined,
      name: '',
      type: 'vless',
      region: '',
      provider: '',
      server: '',
      server_port: 0,
      credential: { uuid: '', flow: '' },
      readableBy: [],
      writeableBy: [],
      tls: {},
      mux: {},
      other: {},
    };
  } else {
    await outboundStore.fetchOutbounds();
    outbound.value = outboundStore.outbounds.find(o => o.id === Number(route.params.id)) || null;
  }
});

async function saveOutbound(updatedOutbound: Outbound) {
  if (isNew.value) {
    await outboundStore.createOutbound(updatedOutbound);
  } else {
    await outboundStore.updateOutbound(updatedOutbound);
  }
  router.push('/outbounds');
}

function cancel() {
  router.push('/outbounds');
}
</script>

<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">{{ isNew ? 'New Outbound' : 'Edit Outbound' }}</h1>
    <OutboundEditor v-if="outbound" :modelValue="outbound" @save="saveOutbound" @cancel="cancel" />
  </div>
</template>
