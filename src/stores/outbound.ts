import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useUserStore } from './user'
import type { Outbound } from '@/types/outbound'

export const useOutboundStore = defineStore('outbound', () => {
  const outbounds = ref<Outbound[]>([])
  const userStore = useUserStore()

  async function fetchOutbounds() {
    try {
      const response = await userStore.authorizedFetch('/api/outbounds')
      if (!response.ok) {
        throw new Error('Failed to fetch outbounds')
      }
      outbounds.value = await response.json()
    } catch (error) {
      console.error(error)
    }
  }

  async function createOutbound(outboundData: Omit<Outbound, 'id'>): Promise<Outbound | undefined> {
    try {
      const response = await userStore.authorizedFetch('/api/outbounds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(outboundData),
      })
      if (!response.ok) {
        throw new Error('Failed to create outbound')
      }
      const newOutbound = await response.json()
      await fetchOutbounds()
      return newOutbound
    } catch (error) {
      console.error(error)
      return undefined
    }
  }

  async function updateOutbound(id: number, outboundData: Partial<Outbound>): Promise<Outbound | undefined> {
    try {
      const response = await userStore.authorizedFetch(`/api/outbounds/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(outboundData),
      })
      if (!response.ok) {
        throw new Error('Failed to update outbound')
      }
      const updatedOutbound = await response.json()
      await fetchOutbounds()
      return updatedOutbound
    } catch (error) {
      console.error(error)
      return undefined
    }
  }

  async function deleteOutbound(id: number): Promise<boolean> {
    try {
      const response = await userStore.authorizedFetch(`/api/outbounds/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to delete outbound')
      }
      await fetchOutbounds()
      return true
    } catch (error) {
      console.error(error)
      return false
    }
  }

  return { outbounds, fetchOutbounds, createOutbound, updateOutbound, deleteOutbound }
})