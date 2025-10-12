<template>
  <div class="d-flex flex-column" style="gap: 8px">
    <div class="d-flex align-center" style="gap: 8px">
      <v-btn color="primary" variant="outlined" @click="dialog = true">Select Outbounds</v-btn>
      <span class="text-caption text-medium-emphasis">Selected: {{ modelValue.length }}</span>
    </div>
    <div class="d-flex" style="gap: 6px; flex-wrap: wrap">
      <v-chip v-for="id in modelValue" :key="id" size="small" class="ma-1" variant="tonal">
        {{ nameOf(id) || `#${id}` }}
      </v-chip>
    </div>

    <v-dialog v-model="dialog" max-width="900">
      <v-card>
        <v-card-title class="text-h6">Select Outbounds</v-card-title>
        <v-card-text>
          <v-text-field v-model="q" label="Search" prepend-inner-icon="mdi-magnify" variant="outlined" clearable />
          <v-divider class="my-2" />
          <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-2" />
          <v-list v-else lines="two" density="comfortable" class="border rounded">
            <v-list-item
              v-for="item in filtered"
              :key="item.id"
              :title="item.name || `#${item.id}`"
              :subtitle="`${item.type}${item.region ? ' · ' + item.region : ''}${item.provider ? ' · ' + item.provider : ''}`"
            >
              <template #prepend>
                <v-checkbox-btn :model-value="local.has(item.id)" @click.stop="toggle(item.id)" />
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="apply">Apply</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useUserStore } from '@/stores/user'

interface OutboundItem {
  id: number
  name?: string
  type?: string
  region?: string
  provider?: string
}

const props = defineProps<{ modelValue: number[] }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: number[]): void }>()

const user = useUserStore()
const dialog = ref(false)
const loading = ref(false)
const items = ref<OutboundItem[]>([])
const q = ref('')
const local = ref<Set<number>>(new Set(props.modelValue || []))

watch(
  () => props.modelValue,
  (v) => {
    local.value = new Set(v || [])
  }
)

const filtered = computed(() => {
  const needle = q.value.trim().toLowerCase()
  const list = items.value.filter((it) => it.type !== 'selector' && it.type !== 'urltest')
  if (!needle) return list
  return list.filter((it) =>
    (it.name || '').toLowerCase().includes(needle) ||
    (it.type || '').toLowerCase().includes(needle) ||
    (it.region || '').toLowerCase().includes(needle) ||
    (it.provider || '').toLowerCase().includes(needle)
  )
})

const nameOf = (id: number) => items.value.find((x) => x.id === id)?.name

const toggle = (id: number) => {
  const s = local.value
  if (s.has(id)) s.delete(id)
  else s.add(id)
}

const apply = () => {
  emit('update:modelValue', Array.from(local.value))
  dialog.value = false
}

const load = async () => {
  loading.value = true
  try {
    const res = await user.authorizedFetch('/api/outbounds')
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data)) items.value = data
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
</style>
