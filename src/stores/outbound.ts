import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Outbound } from '../../schemas/outbound';

export const useOutboundStore = defineStore('outbound', () => {
  const outbounds = ref<Outbound[]>([]);

  async function fetchOutbounds() {
    const response = await fetch('/api/outbounds');
    outbounds.value = await response.json();
  }

  async function createOutbound(outbound: Outbound) {
    const response = await fetch('/api/outbounds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(outbound),
    });
    const newOutbound = await response.json();
    outbounds.value.push(newOutbound);
  }

  async function updateOutbound(outbound: Outbound) {
    const response = await fetch(`/api/outbounds/${outbound.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(outbound),
    });
    const updatedOutbound = await response.json();
    const index = outbounds.value.findIndex((o) => o.id === updatedOutbound.id);
    if (index !== -1) {
      outbounds.value[index] = updatedOutbound;
    }
  }

  async function deleteOutbound(id: number) {
    await fetch(`/api/outbounds/${id}`, {
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
