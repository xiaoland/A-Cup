<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useRuleSetStore } from '../stores/ruleset';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import type { RuleSet } from '../../schemas/ruleset';

const ruleSetStore = useRuleSetStore();
const router = useRouter();
const selectedRuleSets = ref<RuleSet[]>([]);

onMounted(() => {
  ruleSetStore.fetchRuleSets();
});

function newRuleSet() {
  router.push('/rulesets/new');
}

function editRuleSet(ruleSet: RuleSet) {
  router.push(`/rulesets/edit/${ruleSet.id}`);
}

async function deleteRuleSet(ruleSet: RuleSet) {
  if (ruleSet.id) {
    await ruleSetStore.deleteRuleSet(ruleSet.id);
  }
}

async function deleteSelectedRuleSets() {
  const promises = selectedRuleSets.value.map((rs) => {
    if (rs.id) {
      return ruleSetStore.deleteRuleSet(rs.id);
    }
  });
  await Promise.all(promises);
  selectedRuleSets.value = [];
}
</script>

<template>
  <div class="p-4">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Rule Sets</h1>
      <div>
        <Button label="Delete Selected" icon="pi pi-trash" @click="deleteSelectedRuleSets" :disabled="selectedRuleSets.length === 0" class="mr-2 p-button-danger" />
        <Button label="New Rule Set" icon="pi pi-plus" @click="newRuleSet" />
      </div>
    </div>

    <DataTable :value="ruleSetStore.ruleSets" v-model:selection="selectedRuleSets" dataKey="id">
      <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
      <Column field="name" header="Name"></Column>
      <Column field="type" header="Type"></Column>
      <Column header="Actions">
        <template #body="slotProps">
          <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2" @click="editRuleSet(slotProps.data)" />
          <Button icon="pi pi-trash" class="p-button-rounded p-button-danger" @click="deleteRuleSet(slotProps.data)" />
        </template>
      </Column>
    </DataTable>
  </div>
</template>
