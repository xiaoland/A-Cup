import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useUserStore } from './user'
import type { RuleSet } from '@/components/route/ruleSets/ruleSetList/types'

export const useRuleSetStore = defineStore('ruleSet', () => {
  const ruleSets = ref<RuleSet[]>([])
  const userStore = useUserStore()

  async function fetchRuleSets() {
    const response = await userStore.authorizedFetch('/api/rule_sets')
    if (response.ok) {
      ruleSets.value = await response.json()
    } else {
      console.error('Failed to fetch rule sets')
    }
  }

  async function createRuleSet(ruleSetData: any) {
    const response = await userStore.authorizedFetch('/api/rule_sets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ruleSetData),
    })
    if (response.ok) {
      fetchRuleSets()
    } else {
      console.error('Failed to create rule set')
    }
  }

  async function updateRuleSet(id: number, ruleSetData: any) {
    const response = await userStore.authorizedFetch(`/api/rule_sets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ruleSetData),
    })
    if (response.ok) {
      fetchRuleSets()
    } else {
      console.error('Failed to update rule set')
    }
  }

  async function deleteRuleSet(id: number) {
    const response = await userStore.authorizedFetch(`/api/rule_sets/${id}`, {
      method: 'DELETE',
    })
    if (response.ok) {
      fetchRuleSets()
    } else {
      console.error('Failed to delete rule set')
    }
  }

  return { ruleSets, fetchRuleSets, createRuleSet, updateRuleSet, deleteRuleSet }
})