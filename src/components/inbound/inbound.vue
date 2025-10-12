<template>
  <v-container class="inbound-editor">
    <v-card>
      <v-card-title>
        <v-icon class="me-2">mdi-router-network</v-icon>
        {{ titleText }}
      </v-card-title>
      
      <v-card-text>
        <v-alert type="info" variant="tonal" class="mb-4">
          Edit inbound JSON with schema-based hints, completion and validation.
        </v-alert>
        <JsonEditor
          v-model="jsonData"
          :read-only="!canEdit"
          height="420px"
          :schema-url="schemaUrl"
          :schema-ref-path="schemaRefPath"
          @valid="(ok) => (isValid = ok)"
        />
      </v-card-text>

      <!-- Form Actions -->
      <v-card-actions class="px-6 pb-6">
        <v-spacer />
        <v-btn
          v-if="canEdit"
          variant="outlined"
          @click="$emit('cancel')"
        >
          Cancel
        </v-btn>
        <v-btn
          v-if="canEdit"
          color="primary"
          :loading="loading"
          :disabled="!isValid"
          @click="saveInbound"
        >
          Save Inbound
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Inbound, Props } from './types'
import JsonEditor from '@/components/common/JsonEditor.vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const props = withDefaults(defineProps<Props>(), {
  editable: false
})

const emit = defineEmits<{
  save: [inbound: Inbound]
  cancel: []
}>()

// JSON editor state
const jsonData = ref<Record<string, any>>({
  share: false,
  type: 'mixed',
})
const isValid = ref(true)
const schemaUrl = 'https://raw.githubusercontent.com/BlackDuty/sing-box-schema/refs/heads/main/schema.json'
const schemaRefPath = '#/$defs/inbound'

// State
const loading = ref(false)

// Computed properties
const canEdit = computed(() => props.editable === true || !(jsonData.value as any).id)
const titleText = computed(() => {
  if (!(jsonData.value as any).id) return 'New Inbound'
  return canEdit.value ? 'Edit Inbound' : 'Inbound Details'
})

// Initialize form data
const initializeForm = () => {
  if (props.inbound) {
    jsonData.value = { ...props.inbound }
  }
}

// Save inbound
const saveInbound = async () => {
  if (!canEdit.value) return
  loading.value = true
  
  try {
    const isUpdate = !!(jsonData.value as any).id
    const url = isUpdate ? `/api/inbounds/${(jsonData.value as any).id}` : '/api/inbounds'
    const method = isUpdate ? 'PUT' : 'POST'
    
    const cleanedData = jsonData.value
    
    const response = await userStore.authorizedFetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cleanedData)
    })
    
    if (response.ok) {
      const savedInbound = await response.json()
      emit('save', savedInbound)
    } else {
      const error = await response.text()
      console.error('Failed to save inbound:', error)
      // Handle error (show toast, etc.)
    }
  } catch (error) {
    console.error('Failed to save inbound:', error)
    // Handle error
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  initializeForm()
})
</script>

<style scoped lang="scss">
@use './index.scss';
</style>
