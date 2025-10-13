<template>
  <div class="advanced-section">
    <v-btn
      variant="text"
      :prepend-icon="isOpen ? 'mdi-chevron-down' : 'mdi-chevron-right'"
      @click="isOpen = !isOpen"
    >
      Advanced
    </v-btn>
    <v-expand-transition>
      <div v-show="isOpen" class="pt-2 pl-4">
        <slot />
      </div>
    </v-expand-transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isOpen = ref(false)
</script>

<style scoped>
.advanced-section {
  margin-top: 16px;
}
</style>