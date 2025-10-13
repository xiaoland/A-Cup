<template>
  <div>
    <!-- Listen Fields -->
    <v-row dense>
      <v-col cols="12" md="4">
        <v-text-field v-model="form.listen" label="Listen" />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field type="number" v-model.number="form.listen_port" label="Listen Port" />
      </v-col>
      <v-col cols="12" md="4" class="d-flex align-center">
        <v-switch v-model="form.set_system_proxy" label="Set System Proxy" />
      </v-col>
    </v-row>

    <!-- Users -->
    <v-expansion-panels variant="accordion" class="mt-2">
      <v-expansion-panel>
        <v-expansion-panel-title>Users</v-expansion-panel-title>
        <v-expansion-panel-text>
          <div class="d-flex flex-column" style="gap: 8px">
            <div v-for="(user, index) in (form.users || [])" :key="index" class="d-flex" style="gap: 8px">
              <v-text-field v-model="user.username" label="Username" density="comfortable" />
              <v-text-field v-model="user.password" label="Password" type="password" density="comfortable" />
              <v-btn icon="mdi-close" size="small" variant="text" @click="removeUser(index)" />
            </div>
            <div>
              <v-btn size="small" variant="text" @click="addUser" prepend-icon="mdi-plus">Add user</v-btn>
            </div>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <!-- Advanced (Listen Fields) -->
    <v-expansion-panels variant="accordion" class="mt-4">
      <v-expansion-panel>
        <v-expansion-panel-title>Advanced</v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-row dense>
            <v-col cols="12" md="4">
              <v-text-field v-model="form.bind_interface" label="Bind Interface" />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model="form.routing_mark" label="Routing Mark" />
            </v-col>
            <v-col cols="12" md="4">
              <v-switch v-model="form.reuse_addr" label="Reuse Addr" />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model="form.netns" label="netns" />
            </v-col>
            <v-col cols="12" md="4">
              <v-switch v-model="form.tcp_fast_open" label="TCP Fast Open" />
            </v-col>
            <v-col cols="12" md="4">
              <v-switch v-model="form.tcp_multi_path" label="TCP Multi Path" />
            </v-col>
            <v-col cols="12" md="4">
              <v-switch v-model="form.udp_fragment" label="UDP Fragment" />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model="form.udp_timeout" label="UDP Timeout (e.g. 5m)" />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model="form.detour" label="Detour" />
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { MixedInbound } from './schema'

const props = defineProps<{ form: MixedInbound }>()
const emit = defineEmits<{ (e: 'update:form', v: MixedInbound): void }>()

const form = computed({
  get: () => props.form,
  set: (v) => emit('update:form', v)
})

// Users helpers
const addUser = () => {
  if (!form.value.users) form.value.users = []
  form.value.users.push({ username: '', password: '' })
}

const removeUser = (index: number) => {
  if (form.value.users) {
    form.value.users.splice(index, 1)
    if (form.value.users.length === 0) {
      delete form.value.users
    }
  }
}
</script>

<style scoped>
</style>