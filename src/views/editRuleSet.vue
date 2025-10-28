<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useRuleSetStore } from '../stores/ruleset';
import RuleSetEditor from '../components/rule-sets/RuleSetEditor.vue';
import type { RuleSet } from '../../schemas/ruleset';

const route = useRoute();
const router = useRouter();
const ruleSetStore = useRuleSetStore();

const ruleSet = ref<RuleSet | null>(null);
const isNew = computed(() => !route.params.id);

onMounted(async () => {
  if (isNew.value) {
    ruleSet.value = {
      id: undefined,
      name: '',
      type: 'remote',
      format: '',
      content: '',
      readableBy: [],
      writeableBy: [],
    };
  } else {
    await ruleSetStore.fetchRuleSets();
    ruleSet.value = ruleSetStore.ruleSets.find(rs => rs.id === Number(route.params.id)) || null;
  }
});

async function saveRuleSet(updatedRuleSet: RuleSet) {
  if (isNew.value) {
    await ruleSetStore.createRuleSet(updatedRuleSet);
  } else {
    await ruleSetStore.updateRuleSet(updatedRuleSet);
  }
  router.push('/rulesets');
}

function cancel() {
  router.push('/rulesets');
}
</script>

<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">{{ isNew ? 'New Rule Set' : 'Edit Rule Set' }}</h1>
    <RuleSetEditor v-if="ruleSet" :modelValue="ruleSet" @save="saveRuleSet" @cancel="cancel" />
  </div>
</template>
