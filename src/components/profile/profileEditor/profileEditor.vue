<template>
  <div class="profile-editor">
    <div class="form">
      <v-text-field v-model="modelValue.name" label="Name" variant="outlined" required />
      <v-combobox
        v-model="modelValue.tags"
        label="Tags"
        multiple
        chips
        closable-chips
        variant="outlined"
      />
      <InboundsEditor v-model="modelValue.inbounds" />
      <OutboundsListEditor v-model="modelValue.outbounds" />
      <RouteEditor v-model="modelValue.route" />
      <DnsEditor v-model="modelValue.dns" />
    </div>
    <input ref="fileInput" type="file" accept="application/json" @change="onFileChange" hidden />
    <div class="actions">
      <v-btn @click="$emit('cancel')">Cancel</v-btn>
      <v-btn @click="onImport">Import</v-btn>
      <v-btn color="primary" @click="onSave" :loading="saving">Save</v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import InboundsEditor from '@/components/inbounds/inboundsEditor/inboundsEditor.vue';
import OutboundsListEditor from '@/components/outbounds/outboundsListEditor/outboundsListEditor.vue';
import RouteEditor from '@/components/route/routeEditor/routeEditor.vue';
import DnsEditor from '@/components/dns/dnsEditor';
import type { Profile } from './schema';
import { ProfileSchema } from './schema';

const props = defineProps<{
  modelValue: Profile;
}>();

const emit = defineEmits(['save', 'cancel'])

const userStore = useUserStore()
const saving = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const onImport = () => {
  fileInput.value?.click()
}

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const content = e.target?.result
      if (typeof content !== 'string') {
        throw new Error('File content is not a string')
      }
      const data = JSON.parse(content)
      const parsed = ProfileSchema.parse(data)
      Object.assign(props.modelValue, parsed)
    } catch (error) {
      if (error instanceof Error) {
        alert(`Error: ${error.message}`)
      } else {
        alert('An unknown error occurred')
      }
    }
  }
  reader.readAsText(file)
}

const onSave = async () => {
  saving.value = true
  try {
    const body = { ...props.modelValue }
    const url = body.id ? `/api/profiles/${body.id}` : '/api/profiles'
    const method = body.id ? 'PUT' : 'POST'
    const res = await userStore.authorizedFetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    if (!res.ok) throw new Error(`Save failed: ${res.status}`)
    const saved = await res.json()
    emit('save', saved)
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}

</script>

<style lang="sass" scoped src="./profileEditor.scss"></style>
