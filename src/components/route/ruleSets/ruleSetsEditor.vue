<template>
  <v-card variant="outlined" class="form-section">
    <v-card-title class="text-h6 d-flex align-center justify-space-between">
      Rule Sets
      <v-btn color="primary" variant="outlined" size="small" @click="openDialog" prepend-icon="mdi-plus">
        Select Rule Sets
      </v-btn>
    </v-card-title>
    <v-card-text class="selection-section">
      <div v-if="selectedRuleSets.length === 0" class="text-body-2 text-medium-emphasis">
        No rule sets selected.
      </div>
      <div v-else class="selection-chips">
        <v-chip
          v-for="item in selectedRuleSets"
          :key="item.id"
          closable
          variant="outlined"
          @click:close="removeRuleSet(item.id)"
        >
          {{ item.name || `RuleSet #${item.id}` }}
        </v-chip>
      </div>
    </v-card-text>
  </v-card>

  <v-dialog v-model="dialog.show" max-width="600px" scrollable>
    <v-card>
      <v-card-title>Select Rule Sets</v-card-title>
      <v-card-text>
        <v-text-field v-model="dialog.search" label="Search" variant="outlined" prepend-inner-icon="mdi-magnify" clearable />
        <v-list>
          <v-list-item
            v-for="item in filteredRuleSets"
            :key="item.id"
            :title="item.name"
            :subtitle="item.type || ''"
            :active="isSelected(item.id)"
            :color="isSelected(item.id) ? 'primary' : undefined"
            @click="toggle(item.id)"
          >
            <template #prepend>
              <v-checkbox :model-value="isSelected(item.id)" color="primary" hide-details />
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="outlined" @click="dialog.show = false">Cancel</v-btn>
        <v-btn color="primary" @click="confirm">Confirm</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
// import type { RuleSet } from '../../profile/profileEditor/types' // TODO: Uncomment when implemented

const props = defineProps<{ route: any }>()

const userStore = useUserStore()
const ruleSets = ref<RuleSet[]>([])
const loading = ref(false)

const dialog = ref({ show: false, search: '', selected: [] as number[] })

const selectedRuleSets = computed(() =>
  ruleSets.value.filter(rs => props.route.rule_set?.includes(rs.id))
)

const filteredRuleSets = computed(() => {
  if (!dialog.value.search) return ruleSets.value
  const s = dialog.value.search.toLowerCase()
  return ruleSets.value.filter(rs =>
    (rs.name || '').toLowerCase().includes(s) ||
    (rs.type || '').toLowerCase().includes(s)
  )
})

const openDialog = () => {
  dialog.value = {
    show: true,
    search: '',
    selected: [...(props.route.rule_set || [])]
  }
}

const isSelected = (id: number) => dialog.value.selected.includes(id)
const toggle = (id: number) => {
  const i = dialog.value.selected.indexOf(id)
  if (i >= 0) dialog.value.selected.splice(i, 1)
  else dialog.value.selected.push(id)
}
const confirm = () => {
  props.route.rule_set = [...dialog.value.selected]
  dialog.value.show = false
}

const removeRuleSet = (id: number) => {
  props.route.rule_set = (props.route.rule_set || []).filter((i: number) => i !== id)
}

const loadRuleSets = async () => {
  loading.value = true
  try {
    const res = await userStore.authorizedFetch('/api/rule_sets')
    if (res.ok) ruleSets.value = await res.json()
  } finally {
    loading.value = false
  }
}

onMounted(loadRuleSets)
</script>

<style scoped>
.selection-chips { display: flex; flex-wrap: wrap; gap: 8px; }
</style>
