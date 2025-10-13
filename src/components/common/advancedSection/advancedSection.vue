<template>
  <v-card variant="tonal">
    <v-card-title class="d-flex align-center cursor-pointer" @click="isOpen = !isOpen">
      Advanced
      <v-spacer />
      <v-icon :icon="isOpen ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
    </v-card-title>
    <v-expand-transition>
      <div v-show="isOpen">
        <v-card-text>
          <slot />
        </v-card-text>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const isOpen = ref(false);
</script>

<style scoped lang="scss" src="./index.scss"></style>