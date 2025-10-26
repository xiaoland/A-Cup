import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Outbound } from '../../schemas/outbound';
import { useUserStore } from './user';

export const useOutboundStore = defineStore('outbound', () => {
  const outbounds = ref<Outbound[]>([]);
  const userStore = useUserStore();

  async function fetchOutbounds() {
    outbounds.value = await userStore.authorizedRequest<Outbound[]>('/api/outbounds');
  }

  async function createOutbound(outbound: Outbound) {
    const newOutbound = await userStore.authorizedRequest<Outbound>('/api/outbounds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(outbound),
    });
    outbounds.value.push(newOutbound);
  }

  async function updateOutbound(outbound: Outbound) {
    const updatedOutbound = await userStore.authorizedRequest<Outbound>(`/api/outbounds/${outbound.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(outbound),
    });
    const index = outbounds.value.findIndex((o) => o.id === updatedOutbound.id);
    if (index !== -1) {
      outbounds.value[index] = updatedOutbound;
    }
  }

  async function deleteOutbound(id: number) {
    await userStore.authorizedRequest(`/api/outbounds/${id}`, {
      method: 'DELETE',
    });
    outbounds.value = outbounds.value.filter((o) => o.id !== id);
  }

  return {
    outbounds,
    fetchOutbounds,
    createOutbound,
    updateOutbound,
    deleteOutbound,
  };
});
