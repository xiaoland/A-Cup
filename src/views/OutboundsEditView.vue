<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import OutboundEditor from '@/components/outbounds/outboundEditor/outboundEditor.vue'
import { useOutboundStore } from '@/stores/outbound'
import type { Outbound } from '@/types/outbound'

const route = useRoute()
const outboundStore = useOutboundStore()
const outbound = ref<Outbound | null>(null)

const outboundId = computed(() => Number(route.params.id))

onMounted(async () => {
  await outboundStore.fetchOutbounds()
  outbound.value = outboundStore.outbounds.find(o => o.id === outboundId.value) || null
})
</script>

<template>
  <OutboundEditor v-if="outbound" :form="outbound" />
  <v-alert v-else type="error" variant="tonal" class="ma-4">
    Outbound not found
  </v-alert>
</template>

<style>
</style>