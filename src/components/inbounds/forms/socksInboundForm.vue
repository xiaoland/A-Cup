<template>
  <div class="p-fluid grid grid-cols-1 md:grid-cols-2 gap-4">
    <div class="field col-span-2">
      <label for="users">Users</label>
      <InputChips id="users" v-model="form.users" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import InputChips from 'primevue/inputchips'

const props = defineProps<{ form: any }>()
const form = ref(props.form)
</script>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>