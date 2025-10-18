<template>
  <div class="p-fluid grid grid-cols-1 md:grid-cols-2 gap-4">
    <div class="field col-span-1">
      <label for="uuid">UUID</label>
      <InputText id="uuid" v-model="form.credential.uuid" />
    </div>
    <div class="field col-span-1">
      <label for="security">Security</label>
      <Select
        id="security"
        v-model="form.credential.security"
        :options="vmessSecurities"
      />
    </div>
    <div class="field col-span-1">
      <label for="alter_id">Alter ID</label>
      <InputNumber id="alter_id" v-model.number="form.credential.alter_id" />
    </div>
    <div class="field col-span-1 flex items-center">
      <div class="flex items-center">
        <Checkbox v-model="form.credential.global_padding" inputId="global_padding" :binary="true" />
        <label for="global_padding" class="ml-2"> Global Padding </label>
      </div>
    </div>
     <div class="field col-span-1 flex items-center">
      <div class="flex items-center">
        <Checkbox v-model="form.credential.authenticated_length" inputId="authenticated_length" :binary="true" />
        <label for="authenticated_length" class="ml-2"> Authenticated Length </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import InputNumber from 'primevue/inputnumber'
import Checkbox from 'primevue/checkbox'
import type { Outbound } from './types'

defineProps<{ form: Outbound }>()

const vmessSecurities = ['auto','none','zero','aes-128-gcm','chacha20-poly1305']
</script>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>