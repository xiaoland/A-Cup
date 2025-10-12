<template>
  <v-container class="py-4">
    <v-card>
      <v-card-title class="text-h6">Outbound Editor</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="onSave">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field v-model="local.name" label="Name" variant="outlined" required />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="local.type"
                :items="typeOptions"
                item-title="title"
                item-value="value"
                label="Type"
                variant="outlined"
                required
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="local.region"
                :items="regionOptions"
                item-title="title"
                item-value="value"
                label="Region"
                variant="outlined"
                clearable
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="local.provider" label="Provider" variant="outlined" />
            </v-col>

            <v-col cols="12" md="8">
              <v-text-field v-model="local.server" label="Server" variant="outlined" required />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model.number="local.server_port" label="Port" type="number" variant="outlined" required />
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="credentialText"
                label="Credential (JSON)"
                variant="outlined"
                rows="6"
                :error-messages="credentialError || undefined"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="onCancel">Cancel</v-btn>
        <v-btn color="primary" :loading="saving" @click="onSave">Save</v-btn>
        <v-btn
          v-if="local.id"
          color="error"
          variant="outlined"
          :loading="deleting"
          @click="onDelete"
        >Delete</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import type { Outbound } from './types'
import { typeOptions, regionOptions } from './types'

const props = defineProps<{ form: Outbound }>()
const emit = defineEmits<{ (e: 'saved', value: Outbound): void; (e: 'cancel'): void; (e: 'deleted', id: number): void }>()

const router = useRouter()
const userStore = useUserStore()

const local = ref<Outbound>({ ...(props.form as any) })
watch(() => props.form, (v) => { local.value = { ...(v as any) } }, { deep: true })

const saving = ref(false)
const deleting = ref(false)

const credentialText = ref<string>('')
const credentialError = ref<string>('')

const syncFromObject = () => {
  try {
    credentialText.value = JSON.stringify(local.value.credential ?? {}, null, 2)
    credentialError.value = ''
  } catch (e) {
    credentialText.value = '{}'
  }
}
const parseCredential = () => {
  try {
    local.value.credential = credentialText.value ? JSON.parse(credentialText.value) : {}
    credentialError.value = ''
    return true
  } catch (e: any) {
    credentialError.value = 'Invalid JSON'
    return false
  }
}

syncFromObject()

const onCancel = () => {
  emit('cancel')
  router.back()
}

const onSave = async () => {
  if (!parseCredential()) return
  saving.value = true
  try {
    const body = { ...local.value }
    const hasId = !!body.id
    const url = hasId ? `/api/outbounds/${body.id}` : '/api/outbounds'
    const method = hasId ? 'PUT' : 'POST'
    const res = await userStore.authorizedFetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    if (!res.ok) throw new Error(`Save failed: ${res.status}`)
    const saved = await res.json()
    emit('saved', saved)
    router.push('/outbounds')
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}

const onDelete = async () => {
  if (!local.value.id) return
  deleting.value = true
  try {
    const res = await userStore.authorizedFetch(`/api/outbounds/${local.value.id}`, { method: 'DELETE' })
    if (!res.ok && res.status !== 204) throw new Error(`Delete failed: ${res.status}`)
    emit('deleted', local.value.id)
    router.push('/outbounds')
  } catch (e) {
    console.error(e)
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped>
</style>