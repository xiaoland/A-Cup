<template>
  <v-container class="py-4">
    <v-card>
      <v-card-title class="text-h6">Outbound Editor</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="onSave">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.name" label="Name" variant="outlined" required />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="form.type"
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
                v-model="form.region"
                :items="regionOptions"
                item-title="title"
                item-value="value"
                label="Region"
                variant="outlined"
                clearable
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.provider" label="Provider" variant="outlined" />
            </v-col>

            <v-col cols="12" md="8">
              <v-text-field v-model="form.server" label="Server" variant="outlined" required />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model.number="form.server_port" label="Port" type="number" variant="outlined" required />
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

            <!-- Advanced section -->
            <v-col cols="12">
              <v-expansion-panels variant="accordion">
                <v-expansion-panel>
                  <v-expansion-panel-title>Advanced</v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <v-row>
                      <v-col cols="12" md="6">
                        <v-textarea
                          v-model="transportText"
                          label="Transport (JSON)"
                          variant="outlined"
                          rows="6"
                          :error-messages="transportError || undefined"
                        />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-textarea
                          v-model="tlsText"
                          label="TLS (JSON)"
                          variant="outlined"
                          rows="6"
                          :error-messages="tlsError || undefined"
                        />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-textarea
                          v-model="muxText"
                          label="Mux (JSON)"
                          variant="outlined"
                          rows="6"
                          :error-messages="muxError || undefined"
                        />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-textarea
                          v-model="otherText"
                          label="Other (JSON)"
                          variant="outlined"
                          rows="6"
                          :error-messages="otherError || undefined"
                        />
                      </v-col>
                    </v-row>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="onCancel">Cancel</v-btn>
        <v-btn color="primary" :loading="saving" @click="onSave">Save</v-btn>
        <v-btn
          v-if="form.id"
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import type { Outbound } from './types'
import { typeOptions, regionOptions } from './types'

const props = defineProps<{ form: Outbound }>()
const emit = defineEmits<{ (e: 'saved', value: Outbound): void; (e: 'cancel'): void; (e: 'deleted', id: number): void }>()

const router = useRouter()
const userStore = useUserStore()

const form = props.form

const saving = ref(false)
const deleting = ref(false)

const credentialText = ref<string>('')
const credentialError = ref<string>('')
const transportText = ref<string>('')
const transportError = ref<string>('')
const tlsText = ref<string>('')
const tlsError = ref<string>('')
const muxText = ref<string>('')
const muxError = ref<string>('')
const otherText = ref<string>('')
const otherError = ref<string>('')

const syncFromObject = () => {
  try {
    credentialText.value = JSON.stringify(form.credential ?? {}, null, 2)
    credentialError.value = ''
  } catch (e) {
    credentialText.value = '{}'
  }
  try { transportText.value = JSON.stringify(form.transport ?? {}, null, 2); transportError.value = '' } catch { transportText.value = '{}' }
  try { tlsText.value = JSON.stringify(form.tls ?? {}, null, 2); tlsError.value = '' } catch { tlsText.value = '{}' }
  try { muxText.value = JSON.stringify(form.mux ?? {}, null, 2); muxError.value = '' } catch { muxText.value = '{}' }
  try { otherText.value = JSON.stringify(form.other ?? {}, null, 2); otherError.value = '' } catch { otherText.value = '{}' }
}
const parseCredential = () => {
  try {
    form.credential = credentialText.value ? JSON.parse(credentialText.value) : {}
    credentialError.value = ''
    return true
  } catch (e: any) {
    credentialError.value = 'Invalid JSON'
    return false
  }
}
const parseAdvanced = () => {
  let ok = true
  try { form.transport = transportText.value ? JSON.parse(transportText.value) : {}; transportError.value = '' } catch { transportError.value = 'Invalid JSON'; ok = false }
  try { form.tls = tlsText.value ? JSON.parse(tlsText.value) : {}; tlsError.value = '' } catch { tlsError.value = 'Invalid JSON'; ok = false }
  try { form.mux = muxText.value ? JSON.parse(muxText.value) : {}; muxError.value = '' } catch { muxError.value = 'Invalid JSON'; ok = false }
  try { form.other = otherText.value ? JSON.parse(otherText.value) : {}; otherError.value = 'Invalid JSON'; ok = false } catch { otherError.value = 'Invalid JSON'; ok = false }
  return ok
}
onMounted(syncFromObject)

const onCancel = () => {
  emit('cancel')
  router.back()
}

const onSave = async () => {
  if (!parseCredential()) return
  if (!parseAdvanced()) return
  saving.value = true
  try {
    const body = { ...form }
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
  if (!form.id) return
  deleting.value = true
  try {
    const res = await userStore.authorizedFetch(`/api/outbounds/${form.id}`, { method: 'DELETE' })
    if (!res.ok && res.status !== 204) throw new Error(`Delete failed: ${res.status}`)
    emit('deleted', form.id)
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