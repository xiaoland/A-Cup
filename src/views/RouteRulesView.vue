<script setup lang="ts">
import RouteRuleList from '@/components/routeRuleList/routeRuleList.vue';
import RuleSetList from '@/components/ruleSetList/ruleSetList.vue';
import { ref } from 'vue';

const activeTab = ref('route-rules');
</script>

<template>
  <v-container class="rules-unified-view">
    <!-- Header with tabs -->
    <v-card class="mb-4">
      <v-card-title class="d-flex align-center">
        <v-icon class="me-2">mdi-routes</v-icon>
        Rules Management
      </v-card-title>
      
      <v-tabs v-model="activeTab" class="px-6">
        <v-tab value="route-rules">
          <v-icon class="me-2">mdi-routes</v-icon>
          Route Rules
        </v-tab>
        <v-tab value="rule-sets">
          <v-icon class="me-2">mdi-file-document-outline</v-icon>
          Rule Sets
        </v-tab>
      </v-tabs>
    </v-card>

    <!-- Content tabs -->
    <v-window v-model="activeTab">
      <v-window-item value="route-rules">
        <RouteRuleList />
      </v-window-item>
      <v-window-item value="rule-sets">
        <RuleSetList />
      </v-window-item>
    </v-window>
  </v-container>
</template>

<style>
.rules-unified-view .v-window {
  background: transparent;
}
</style>
