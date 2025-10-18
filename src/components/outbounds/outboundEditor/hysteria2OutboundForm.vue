<template>
  <div class="p-fluid grid grid-cols-1 md:grid-cols-2 gap-4">
    <div class="field col-span-1">
      <label for="password">Password</label>
      <Password
        id="password"
        v-model="form.credential.password"
        :feedback="false"
        toggleMask
      />
    </div>
     <div class="field col-span-1 grid grid-cols-2 gap-4">
        <div class="field">
            <label for="up_mbps">Up Mbps</label>
            <InputNumber id="up_mbps" v-model.number="form.credential.up_mbps" />
        </div>
        <div class="field">
            <label for="down_mbps">Down Mbps</label>
            <InputNumber id="down_mbps" v-model.number="form.credential.down_mbps" />
        </div>
    </div>
    <div class="field col-span-1">
      <label for="obfs_type">Obfs Type</label>
      <Select
        id="obfs_type"
        v-model="form.credential.obfs.type"
        :options="hy2ObfsTypes"
        show-clear
        placeholder="Select an obfs type"
      />
    </div>
    <div class="field col-span-1">
      <label for="obfs_password">Obfs Password</label>
      <InputText id="obfs_password" v-model="form.credential.obfs.password" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Password from 'primevue/password'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import type { Outbound } from './types'

defineProps<{ form: Outbound }>()

const hy2ObfsTypes = ['salamander']
</script>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>