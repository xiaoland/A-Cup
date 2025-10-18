<template>
  <div class="profile-editor">
    <div class="grid grid-cols-1 gap-4">
      <Card>
        <template #content>
          <div class="p-fluid grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="field">
              <label :for="`name-${uniqueId}`">Name</label>
              <InputText :id="`name-${uniqueId}`" v-model="modelValue.name" />
            </div>
            <div class="field">
              <label :for="`tags-${uniqueId}`">Tags</label>
              <InputChips :id="`tags-${uniqueId}`" v-model="modelValue.tags" />
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <InboundsEditor v-model="modelValue.inbounds" />
        </template>
      </Card>

      <Card>
        <template #content>
          <OutboundsListEditor v-model="modelValue.outbounds" />
        </template>
      </Card>

      <Card>
        <template #content>
          <RouteEditor v-model="modelValue.route" />
        </template>
      </Card>

      <Card>
        <template #content>
          <DnsEditor v-model="modelValue.dns" />
        </template>
      </Card>
    </div>

    <input ref="fileInput" type="file" accept="application/json" @change="onFileChange" hidden />

    <div class="flex justify-end gap-2 mt-4">
      <Button label="Cancel" severity="secondary" @click="$emit('cancel')" />
      <Button label="Import" severity="info" @click="onImport" />
      <Button label="Save" @click="onSave" :loading="saving" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import InputText from 'primevue/inputtext'
import InputChips from 'primevue/inputchips'
import Button from 'primevue/button'
import Card from 'primevue/card'
import InboundsEditor from '@/components/inbounds/inboundsEditor/inboundsEditor.vue'
import OutboundsListEditor from '@/components/outbounds/outboundsListEditor/outboundsListEditor.vue'
import RouteEditor from '@/components/route/routeEditor/routeEditor.vue'
import DnsEditor from '@/components/dns/dnsEditor/dnsEditor.vue'
import type { Profile } from './schema'
import { SingboxProfileSchema } from '@/schemas/singbox'
import { transformSingboxToProfile } from './transform'

const props = defineProps<{
  modelValue: Profile
}>()

const emit = defineEmits(['save', 'cancel', 'update:modelValue'])

const userStore = useUserStore()
const saving = ref(false)
const uniqueId = computed(() => Math.random().toString(36).substring(7))
const fileInput = ref<HTMLInputElement | null>(null)

const onImport = () => {
  fileInput.value?.click()
}

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      const content = e.target?.result
      if (typeof content !== 'string') {
        throw new Error('File content is not a string')
      }
      const data = JSON.parse(content)
      const parsed = SingboxProfileSchema.parse(data)
      const profile = await transformSingboxToProfile(parsed, props.modelValue)
      emit('update:modelValue', profile)
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
    const { id, created_by, rule_sets, ...rest } = props.modelValue
    const body = {
        ...rest,
        route: {
            ...rest.route,
            rule_set: rule_sets,
        }
    }
    const url = id ? `/api/profiles/${id}` : '/api/profiles'
    const method = id ? 'PUT' : 'POST'
    const res = await userStore.authorizedFetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
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

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>