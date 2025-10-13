<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import RuleSetEditor from '@/components/route/ruleSetEditor/ruleSetEditor.vue';
import type { RuleSet } from '@/components/route/ruleSetEditor/types';
import { useUserStore } from '@/stores/user';

interface Props {
  id: string;
}

const props = defineProps<Props>();
const route = useRoute();
const userStore = useUserStore();

const ruleSet = ref<RuleSet | null>(null);
const loading = ref(false);

const loadRuleSet = async () => {
  loading.value = true;
  try {
    const ruleSetId = props.id || route.params.id;
    const response = await userStore.authorizedFetch(`/api/rule_sets/${ruleSetId}`);
    if (response.ok) {
      ruleSet.value = await response.json();
    }
  } catch (error) {
    console.error('Failed to load rule set:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadRuleSet();
});
</script>

<template>
  <div>
    <v-skeleton-loader v-if="loading" type="card" />
    <RuleSetEditor v-if="ruleSet" v-model="ruleSet" />
  </div>
</template>

<style></style>
