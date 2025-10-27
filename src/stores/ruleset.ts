import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { RuleSet } from '../../schemas/ruleset';
import { useUserStore } from './user';

export const useRuleSetStore = defineStore('ruleSet', () => {
  const ruleSets = ref<RuleSet[]>([]);
  const userStore = useUserStore();

  async function fetchRuleSets() {
    ruleSets.value = await userStore.authorizedRequest<RuleSet[]>('/api/rulesets');
  }

  async function createRuleSet(ruleSet: RuleSet) {
    const newRuleSet = await userStore.authorizedRequest<RuleSet>('/api/rulesets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ruleSet),
    });
    ruleSets.value.push(newRuleSet);
  }

  async function updateRuleSet(ruleSet: RuleSet) {
    const updatedRuleSet = await userStore.authorizedRequest<RuleSet>(`/api/rulesets/${ruleSet.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ruleSet),
    });
    const index = ruleSets.value.findIndex((rs) => rs.id === updatedRuleSet.id);
    if (index !== -1) {
      ruleSets.value[index] = updatedRuleSet;
    }
  }

  async function deleteRuleSet(id: number) {
    await userStore.authorizedRequest(`/api/rulesets/${id}`, {
      method: 'DELETE',
    });
    ruleSets.value = ruleSets.value.filter((rs) => rs.id !== id);
  }

  return {
    ruleSets,
    fetchRuleSets,
    createRuleSet,
    updateRuleSet,
    deleteRuleSet,
  };
});
