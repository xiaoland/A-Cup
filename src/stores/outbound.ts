import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useUserStore } from './user'
import type { Outbound } from '@/components/outbounds/outboundEditor/types'

export const useOutboundStore = defineStore('outbound', () => {
  const outbounds = ref<Outbound[]>([])
  const userStore = useUserStore()

  async function fetchOutbounds() {
    const response = await userStore.authorizedFetch('/api/outbounds')
    if (response.ok) {
      outbounds.value = await response.json()
    } else {
      console.error('Failed to fetch outbounds')
    }
  }

  async function createOutbound(outboundData: any): Promise<Outbound | undefined> {
    const response = await userStore.authorizedFetch('/api/outbounds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(outboundData),
    })
    if (response.ok) {
      const newOutbound = await response.json()
      fetchOutbounds()
      return newOutbound
    } else {
      console.error('Failed to create outbound')
      return undefined
    }
  }

  async function updateOutbound(id: number, outboundData: any) {
    const response = await userStore.authorizedFetch(`/api/outbounds/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(outboundData),
    })
    if (response.ok) {
      fetchOutbounds()
    } else {
      console.error('Failed to update outbound')
    }
  }

  async function deleteOutbound(id: number) {
    const response = await userStore.authorizedFetch(`/api/outbounds/${id}`, {
      method: 'DELETE',
    })
    if (response.ok) {
      fetchOutbounds()
    } else {
      console.error('Failed to delete outbound')
    }
  }

  return { outbounds, fetchOutbounds, createOutbound, updateOutbound, deleteOutbound }
})