<template>
  <div class="p-fluid form-grid">
    <!-- Listen Fields -->
    <div class="field col-span-4">
      <label for="listen">Listen</label>
      <InputText id="listen" v-model="form.listen" />
    </div>
    <div class="field col-span-4">
      <label for="listen_port">Listen Port</label>
      <InputNumber id="listen_port" v-model="form.listen_port" />
    </div>
    <div class="field col-span-4 flex items-center">
      <div class="flex items-center">
        <Checkbox v-model="form.set_system_proxy" inputId="set_system_proxy" :binary="true"/>
        <label for="set_system_proxy" class="ml-2"> Set System Proxy </label>
      </div>
    </div>

    <!-- Users -->
    <div class="col-span-12">
      <Accordion>
        <AccordionPanel value="users" header="Users">
          <div class="flex flex-col gap-2">
            <div v-for="(user, index) in form.users || []" :key="index" class="flex gap-2 items-center">
              <InputText v-model="user.username" placeholder="Username" class="flex-1" />
              <Password v-model="user.password" placeholder="Password" class="flex-1" :feedback="false" toggleMask/>
              <Button icon="i-mdi-close" severity="danger" text rounded @click="removeUser(index)" />
            </div>
            <Button label="Add user" text @click="addUser" class="self-start" />
          </div>
        </AccordionPanel>
      </Accordion>
    </div>

    <!-- Advanced -->
    <div class="col-span-12">
        <Accordion>
            <AccordionPanel value="advanced" header="Advanced">
                <div class="p-fluid form-grid">
                    <div class="field col-span-4">
                        <label for="bind_interface">Bind Interface</label>
                        <InputText id="bind_interface" v-model="form.bind_interface" />
                    </div>
                    <div class="field col-span-4">
                        <label for="routing_mark">Routing Mark</label>
                        <InputNumber id="routing_mark" v-model.number="form.routing_mark" />
                    </div>
                    <div class="field col-span-4 flex items-center">
                        <div class="flex items-center">
                            <Checkbox v-model="form.reuse_addr" inputId="reuse_addr" :binary="true"/>
                            <label for="reuse_addr" class="ml-2"> Reuse Addr </label>
                        </div>
                    </div>
                    <div class="field col-span-4">
                        <label for="netns">netns</label>
                        <InputText id="netns" v-model="form.netns" />
                    </div>
                    <div class="field col-span-4 flex items-center">
                        <div class="flex items-center">
                            <Checkbox v-model="form.tcp_fast_open" inputId="tcp_fast_open" :binary="true"/>
                            <label for="tcp_fast_open" class="ml-2"> TCP Fast Open </label>
                        </div>
                    </div>
                    <div class="field col-span-4 flex items-center">
                        <div class="flex items-center">
                            <Checkbox v-model="form.tcp_multi_path" inputId="tcp_multi_path" :binary="true"/>
                            <label for="tcp_multi_path" class="ml-2"> TCP Multi Path </label>
                        </div>
                    </div>
                    <div class="field col-span-4 flex items-center">
                        <div class="flex items-center">
                            <Checkbox v-model="form.udp_fragment" inputId="udp_fragment" :binary="true"/>
                            <label for="udp_fragment" class="ml-2"> UDP Fragment </label>
                        </div>
                    </div>
                    <div class="field col-span-4">
                        <label for="udp_timeout">UDP Timeout</label>
                        <InputText id="udp_timeout" v-model="form.udp_timeout" />
                    </div>
                    <div class="field col-span-4">
                        <label for="detour">Detour</label>
                        <InputText id="detour" v-model="form.detour" />
                    </div>
                </div>
            </AccordionPanel>
        </Accordion>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Checkbox from 'primevue/checkbox'
import Accordion from 'primevue/accordion'
import AccordionPanel from 'primevue/accordionpanel'
import Button from 'primevue/button'
import Password from 'primevue/password'
import type { MixedInbound } from './schema'

const props = defineProps<{ form: MixedInbound }>()
const emit = defineEmits<{ (e: 'update:form', v: MixedInbound): void }>()

const form = computed({
  get: () => props.form,
  set: (v) => emit('update:form', v),
})

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
.form-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 1rem;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.col-span-4 {
  grid-column: span 4 / span 4;
}
.col-span-12 {
  grid-column: span 12 / span 12;
}
</style>