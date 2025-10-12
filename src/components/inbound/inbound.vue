<template>
  <v-container class="inbound-editor">
    <v-card>
      <v-card-title>
        <v-icon class="me-2">mdi-router-network</v-icon>
        {{ titleText }}
      </v-card-title>
      
      <v-card-text>
        <v-alert type="warning" variant="tonal">
          TODO: Inbound editor is temporarily removed.
        </v-alert>
      </v-card-text>

      <!-- Form Actions -->
      <v-card-actions class="px-6 pb-6">
        <v-spacer />
        <v-btn v-if="canEdit" variant="outlined" @click="$emit('cancel')">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Props } from './types'

const props = withDefaults(defineProps<Props>(), {
  editable: false
})

defineEmits<{ cancel: [] }>()

const canEdit = computed(() => props.editable === true)
const titleText = computed(() => 'Inbound Editor')
</script>

<style scoped lang="scss">
@use './index.scss';
</style>
