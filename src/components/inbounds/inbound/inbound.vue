<template>
  <v-card variant="outlined">
    <v-card-title class="text-h6 d-flex align-center justify-space-between">
      Inbound
      <div class="d-flex" style="gap: 8px">
        <v-btn v-if="!editing" size="small" variant="text" @click="startEdit" prepend-icon="mdi-pencil">Edit</v-btn>
        <template v-else>
          <v-btn color="primary" size="small" @click="onSave" prepend-icon="mdi-content-save">Save</v-btn>
          <v-btn size="small" variant="text" @click="onCancel" prepend-icon="mdi-cancel">Cancel</v-btn>
        </template>
        <v-btn size="small" variant="text" color="error" @click="$emit('delete')" prepend-icon="mdi-delete">Delete</v-btn>
      </div>
    </v-card-title>

    <v-card-text>
      <v-row dense>
        <v-col cols="12" md="4">
          <v-select :items="types" v-model="form.type" label="Type" :disabled="!editing" />
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field v-model="form.tag" label="Tag" :disabled="!editing" />
        </v-col>
      </v-row>

      <template v-if="form.type === 'mixed'">
        <!-- Basic fields for mixed -->
        <v-row dense>
          <v-col cols="12" md="4">
            <v-text-field :model-value="form.listen ?? ''" @update:model-value="v=>setOrDel(form,'listen',v)" label="Listen" :disabled="!editing" />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field type="number" :model-value="form.listen_port ?? ''" @update:model-value="v=>setNum(form,'listen_port',v)" label="Listen Port" :disabled="!editing" />
          </v-col>
          <v-col cols="12" md="4" class="d-flex align-center">
            <v-switch inset :model-value="form.set_system_proxy ?? false" @update:model-value="v=>setBool(form,'set_system_proxy',v)" :disabled="!editing" label="Set System Proxy" />
          </v-col>
        </v-row>

        <!-- Users -->
        <v-expansion-panels variant="accordion" class="mt-2">
          <v-expansion-panel>
            <v-expansion-panel-title>Users</v-expansion-panel-title>
            <v-expansion-panel-text>
              <div class="d-flex flex-column" style="gap: 8px">
                <div v-for="(u, i) in (form.users ?? [])" :key="i" class="d-flex" style="gap: 8px">
                  <v-text-field v-model="u.username" label="Username" :disabled="!editing" density="comfortable" />
                  <v-text-field v-model="u.password" label="Password" :disabled="!editing" type="password" density="comfortable" />
                  <v-btn icon="mdi-close" size="small" variant="text" :disabled="!editing" @click="removeUser(i)" />
                </div>
                <div>
                  <v-btn size="small" variant="text" :disabled="!editing" @click="addUser" prepend-icon="mdi-plus">Add user</v-btn>
                </div>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>

        <!-- Advanced (listen fields) -->
        <v-expansion-panels variant="accordion" class="mt-4">
          <v-expansion-panel>
            <v-expansion-panel-title>Advanced</v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-row dense>
                <v-col cols="12" md="4">
                  <v-text-field :model-value="form.bind_interface ?? ''" @update:model-value="v=>setOrDel(form,'bind_interface',v)" label="Bind Interface" :disabled="!editing" />
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field :model-value="routingMarkStr" @update:model-value="v=>setRoutingMark(v)" label="Routing Mark (int or 0xHEX)" :disabled="!editing" />
                </v-col>
                <v-col cols="12" md="4">
                  <v-switch inset :model-value="form.reuse_addr ?? false" @update:model-value="v=>setBool(form,'reuse_addr',v)" :disabled="!editing" label="Reuse Addr" />
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field :model-value="form.netns ?? ''" @update:model-value="v=>setOrDel(form,'netns',v)" label="netns" :disabled="!editing" />
                </v-col>
                <v-col cols="12" md="4"><v-switch inset :model-value="form.tcp_fast_open ?? false" @update:model-value="v=>setBool(form,'tcp_fast_open',v)" :disabled="!editing" label="TCP Fast Open" /></v-col>
                <v-col cols="12" md="4"><v-switch inset :model-value="form.tcp_multi_path ?? false" @update:model-value="v=>setBool(form,'tcp_multi_path',v)" :disabled="!editing" label="TCP Multi Path" /></v-col>
                <v-col cols="12" md="4"><v-switch inset :model-value="form.udp_fragment ?? false" @update:model-value="v=>setBool(form,'udp_fragment',v)" :disabled="!editing" label="UDP Fragment" /></v-col>
                <v-col cols="12" md="4">
                  <v-text-field :model-value="form.udp_timeout ?? ''" @update:model-value="v=>setOrDel(form,'udp_timeout',v)" label="UDP Timeout (e.g. 5m)" :disabled="!editing" />
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field :model-value="form.detour ?? ''" @update:model-value="v=>setOrDel(form,'detour',v)" label="Detour" :disabled="!editing" />
                </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </template>

      <template v-else-if="form.type === 'tun'">
        <!-- Basic fields for tun -->
        <v-row dense>
          <v-col cols="12" md="4">
            <v-text-field :model-value="form.interface_name ?? ''" @update:model-value="v=>setOrDel(form,'interface_name',v)" label="Interface Name" :disabled="!editing" />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field type="number" :model-value="form.mtu ?? ''" @update:model-value="v=>setNum(form,'mtu',v)" label="MTU" :disabled="!editing" />
          </v-col>
          <v-col cols="12" md="4">
            <v-select :items="stacks" :model-value="form.stack ?? 'mixed'" @update:model-value="v=>setOrDel(form,'stack',v)" label="Stack" :disabled="!editing" />
          </v-col>
        </v-row>
        <v-row dense>
          <v-col cols="12">
            <div class="d-flex align-center justify-space-between">
              <div class="text-subtitle-2">Addresses (CIDR)</div>
              <v-btn size="small" variant="text" :disabled="!editing" @click="addAddress" prepend-icon="mdi-plus">Add</v-btn>
            </div>
            <div class="d-flex flex-column" style="gap: 8px">
              <div v-for="(a,i) in (form.address ?? [])" :key="i" class="d-flex" style="gap: 8px">
                <v-text-field v-model="form.address![i]" :disabled="!editing" density="comfortable" />
                <v-btn icon="mdi-close" size="small" variant="text" :disabled="!editing" @click="removeAddress(i)" />
              </div>
            </div>
          </v-col>
        </v-row>

        <v-row dense>
          <v-col cols="12" md="4"><v-switch inset :model-value="form.auto_route ?? false" @update:model-value="v=>setBool(form,'auto_route',v)" :disabled="!editing" label="Auto Route" /></v-col>
          <v-col cols="12" md="4"><v-switch inset :model-value="form.auto_redirect ?? false" @update:model-value="v=>setBool(form,'auto_redirect',v)" :disabled="!editing || !form.auto_route" label="Auto Redirect" /></v-col>
          <v-col cols="12" md="4"><v-switch inset :model-value="form.strict_route ?? false" @update:model-value="v=>setBool(form,'strict_route',v)" :disabled="!editing || !form.auto_route" label="Strict Route" /></v-col>
        </v-row>

        <!-- Advanced for tun -->
        <v-expansion-panels variant="accordion" class="mt-4">
          <v-expansion-panel>
            <v-expansion-panel-title>Advanced</v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-row dense>
                <v-col cols="12" md="4"><v-text-field type="number" :model-value="form.iproute2_table_index ?? ''" @update:model-value="v=>setNum(form,'iproute2_table_index',v)" label="iproute2 table index" :disabled="!editing || !form.auto_route" /></v-col>
                <v-col cols="12" md="4"><v-text-field type="number" :model-value="form.iproute2_rule_index ?? ''" @update:model-value="v=>setNum(form,'iproute2_rule_index',v)" label="iproute2 rule index" :disabled="!editing || !form.auto_route" /></v-col>
                <v-col cols="12" md="6">
                  <div class="d-flex align-center justify-space-between">
                    <div class="text-subtitle-2">Route Address</div>
                    <v-btn size="x-small" variant="text" :disabled="!editing || !form.auto_route" @click="addArray('route_address')" icon="mdi-plus" />
                  </div>
                  <div class="d-flex flex-column" style="gap: 8px">
                    <div v-for="(v,i) in (form.route_address ?? [])" :key="`ra-${i}`" class="d-flex" style="gap: 8px">
                      <v-text-field v-model="form.route_address![i]" :disabled="!editing || !form.auto_route" density="comfortable" />
                      <v-btn icon="mdi-close" size="small" variant="text" :disabled="!editing || !form.auto_route" @click="removeArray('route_address', i)" />
                    </div>
                  </div>
                </v-col>
                <v-col cols="12" md="6">
                  <div class="d-flex align-center justify-space-between">
                    <div class="text-subtitle-2">Route Exclude Address</div>
                    <v-btn size="x-small" variant="text" :disabled="!editing || !form.auto_route" @click="addArray('route_exclude_address')" icon="mdi-plus" />
                  </div>
                  <div class="d-flex flex-column" style="gap: 8px">
                    <div v-for="(v,i) in (form.route_exclude_address ?? [])" :key="`rea-${i}`" class="d-flex" style="gap: 8px">
                      <v-text-field v-model="form.route_exclude_address![i]" :disabled="!editing || !form.auto_route" density="comfortable" />
                      <v-btn icon="mdi-close" size="small" variant="text" :disabled="!editing || !form.auto_route" @click="removeArray('route_exclude_address', i)" />
                    </div>
                  </div>
                </v-col>

                <v-col cols="12" md="6">
                  <div class="d-flex align-center justify-space-between">
                    <div class="text-subtitle-2">Route Address Set</div>
                    <v-btn size="x-small" variant="text" :disabled="!editing || !form.auto_route" @click="addArray('route_address_set')" icon="mdi-plus" />
                  </div>
                  <div class="d-flex flex-column" style="gap: 8px">
                    <div v-for="(v,i) in (form.route_address_set ?? [])" :key="`ras-${i}`" class="d-flex" style="gap: 8px">
                      <v-text-field v-model="form.route_address_set![i]" :disabled="!editing || !form.auto_route" density="comfortable" />
                      <v-btn icon="mdi-close" size="small" variant="text" :disabled="!editing || !form.auto_route" @click="removeArray('route_address_set', i)" />
                    </div>
                  </div>
                </v-col>
                <v-col cols="12" md="6">
                  <div class="d-flex align-center justify-space-between">
                    <div class="text-subtitle-2">Route Exclude Address Set</div>
                    <v-btn size="x-small" variant="text" :disabled="!editing || !form.auto_route" @click="addArray('route_exclude_address_set')" icon="mdi-plus" />
                  </div>
                  <div class="d-flex flex-column" style="gap: 8px">
                    <div v-for="(v,i) in (form.route_exclude_address_set ?? [])" :key="`reas-${i}`" class="d-flex" style="gap: 8px">
                      <v-text-field v-model="form.route_exclude_address_set![i]" :disabled="!editing || !form.auto_route" density="comfortable" />
                      <v-btn icon="mdi-close" size="small" variant="text" :disabled="!editing || !form.auto_route" @click="removeArray('route_exclude_address_set', i)" />
                    </div>
                  </div>
                </v-col>

                <v-col cols="12" md="6"><v-text-field :model-value="form.auto_redirect_input_mark ?? ''" @update:model-value="v=>setOrDel(form,'auto_redirect_input_mark',v)" label="Auto Redirect Input Mark" :disabled="!editing || !form.auto_route || !form.auto_redirect" /></v-col>
                <v-col cols="12" md="6"><v-text-field :model-value="form.auto_redirect_output_mark ?? ''" @update:model-value="v=>setOrDel(form,'auto_redirect_output_mark',v)" label="Auto Redirect Output Mark" :disabled="!editing || !form.auto_route || !form.auto_redirect" /></v-col>

                <v-col cols="12" md="4"><v-switch inset :model-value="form.endpoint_independent_nat ?? false" @update:model-value="v=>setBool(form,'endpoint_independent_nat',v)" :disabled="!editing" label="Endpoint Independent NAT (gvisor)" /></v-col>
                <v-col cols="12" md="4"><v-text-field :model-value="form.udp_timeout ?? ''" @update:model-value="v=>setOrDel(form,'udp_timeout',v)" label="UDP Timeout (e.g. 5m)" :disabled="!editing" /></v-col>

                <!-- Platform HTTP Proxy -->
                <v-col cols="12"><div class="text-subtitle-2 mt-2">Platform: HTTP Proxy</div></v-col>
                <v-col cols="12" md="4"><v-switch inset :model-value="form.platform?.http_proxy?.enabled ?? false" @update:model-value="v=>setPlatformHttp('enabled', v)" :disabled="!editing" label="Enabled" /></v-col>
                <v-col cols="12" md="4"><v-text-field :model-value="form.platform?.http_proxy?.server ?? ''" @update:model-value="v=>setPlatformHttp('server', v)" label="Server" :disabled="!editing || !(form.platform?.http_proxy?.enabled)" /></v-col>
                <v-col cols="12" md="4"><v-text-field type="number" :model-value="form.platform?.http_proxy?.server_port ?? ''" @update:model-value="v=>setPlatformHttpNumber('server_port', v)" label="Server Port" :disabled="!editing || !(form.platform?.http_proxy?.enabled)" /></v-col>
                <v-col cols="12" md="6">
                  <div class="d-flex align-center justify-space-between">
                    <div class="text-subtitle-2">Bypass Domain</div>
                    <v-btn size="x-small" variant="text" :disabled="!editing || !(form.platform?.http_proxy?.enabled)" @click="addPlatformHttpArray('bypass_domain')" icon="mdi-plus" />
                  </div>
                  <div class="d-flex flex-column" style="gap: 8px">
                    <div v-for="(v,i) in (form.platform?.http_proxy?.bypass_domain ?? [])" :key="`bpd-${i}`" class="d-flex" style="gap: 8px">
                      <v-text-field v-model="form.platform!.http_proxy!.bypass_domain![i]" :disabled="!editing || !(form.platform?.http_proxy?.enabled)" density="comfortable" />
                      <v-btn icon="mdi-close" size="small" variant="text" :disabled="!editing || !(form.platform?.http_proxy?.enabled)" @click="removePlatformHttpArray('bypass_domain', i)" />
                    </div>
                  </div>
                </v-col>
                <v-col cols="12" md="6">
                  <div class="d-flex align-center justify-space-between">
                    <div class="text-subtitle-2">Match Domain (Apple only)</div>
                    <v-btn size="x-small" variant="text" :disabled="!editing || !(form.platform?.http_proxy?.enabled)" @click="addPlatformHttpArray('match_domain')" icon="mdi-plus" />
                  </div>
                  <div class="d-flex flex-column" style="gap: 8px">
                    <div v-for="(v,i) in (form.platform?.http_proxy?.match_domain ?? [])" :key="`md-${i}`" class="d-flex" style="gap: 8px">
                      <v-text-field v-model="form.platform!.http_proxy!.match_domain![i]" :disabled="!editing || !(form.platform?.http_proxy?.enabled)" density="comfortable" />
                      <v-btn icon="mdi-close" size="small" variant="text" :disabled="!editing || !(form.platform?.http_proxy?.enabled)" @click="removePlatformHttpArray('match_domain', i)" />
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </template>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
// @ts-nocheck
import { ref, computed } from 'vue'
import { InboundSchema, MixedInboundSchema, TunInboundSchema, type Inbound } from './schema'

const props = defineProps<{ form: Inbound }>()
const emit = defineEmits<{ (e: 'save', v: Inbound): void; (e: 'delete'): void }>()

const form = props.form
const types = ['mixed', 'tun']
const stacks = ['system', 'gvisor', 'mixed']

// Editing state: default to edit when no id
const editing = ref(form.id == null)
const startEdit = () => (editing.value = true)
const onCancel = () => (editing.value = false)

// Helpers to keep optional fields undefined if empty
const isBlank = (v: any) => v === '' || v === null || v === undefined
const setOrDel = (obj: any, key: string, v: any) => {
  if (isBlank(v)) delete obj[key]
  else obj[key] = v
}
const setBool = (obj: any, key: string, v: boolean) => {
  if (!v) delete obj[key]
  else obj[key] = v
}
const setNum = (obj: any, key: string, v: any) => {
  const n = v === '' ? undefined : Number(v)
  if (isNaN(n as number) || n === undefined) delete obj[key]
  else obj[key] = n
}

// mixed: routing_mark can be number or string, we accept string input
const routingMarkStr = computed(() => (typeof (form as any).routing_mark === 'number' ? String((form as any).routing_mark) : (form as any).routing_mark ?? ''))
const setRoutingMark = (val: string) => {
  if (isBlank(val)) delete (form as any).routing_mark
  else (form as any).routing_mark = val
}

// Users helpers
const addUser = () => {
  if (!('users' in form) || (form as any).users == null) (form as any).users = []
  ;(form as any).users!.push({ username: '', password: '' })
}
const removeUser = (i: number) => {
  const arr = (form as any).users as Array<any> | undefined
  if (!arr) return
  arr.splice(i, 1)
  if (arr.length === 0) delete (form as any).users
}

// tun: addresses
const addAddress = () => {
  if (!(form as any).address) (form as any).address = []
  ;(form as any).address!.push('')
}
const removeAddress = (i: number) => {
  const arr = (form as any).address as string[] | undefined
  if (!arr) return
  arr.splice(i, 1)
  if (arr.length === 0) delete (form as any).address
}

// generic array helpers for string arrays
const addArray = (key: 'route_address'|'route_exclude_address'|'route_address_set'|'route_exclude_address_set') => {
  if (!(form as any)[key]) (form as any)[key] = []
  ;(form as any)[key].push('')
}
const removeArray = (key: 'route_address'|'route_exclude_address'|'route_address_set'|'route_exclude_address_set', i: number) => {
  const arr = (form as any)[key] as string[] | undefined
  if (!arr) return
  arr.splice(i, 1)
  if (arr.length === 0) delete (form as any)[key]
}

// platform.http_proxy helpers
const ensurePlatformHttp = () => {
  if (!(form as any).platform) (form as any).platform = {}
  if (!(form as any).platform.http_proxy) (form as any).platform.http_proxy = {}
}
const setPlatformHttp = (key: 'enabled'|'server', v: any) => {
  ensurePlatformHttp()
  if (key === 'enabled') {
    if (!v) delete (form as any).platform.http_proxy
    else (form as any).platform.http_proxy = { ...(form as any).platform.http_proxy, enabled: !!v }
  } else {
    if (isBlank(v)) delete (form as any).platform.http_proxy[key]
    else (form as any).platform.http_proxy[key] = v
  }
}
const setPlatformHttpNumber = (key: 'server_port', v: any) => {
  ensurePlatformHttp()
  const n = v === '' ? undefined : Number(v)
  if (isNaN(n as number) || n === undefined) delete (form as any).platform.http_proxy[key]
  else (form as any).platform.http_proxy[key] = n
}
const addPlatformHttpArray = (key: 'bypass_domain'|'match_domain') => {
  ensurePlatformHttp()
  if (!(form as any).platform.http_proxy[key]) (form as any).platform.http_proxy[key] = []
  ;(form as any).platform.http_proxy[key].push('')
}
const removePlatformHttpArray = (key: 'bypass_domain'|'match_domain', i: number) => {
  const arr = (form as any).platform?.http_proxy?.[key] as string[] | undefined
  if (!arr) return
  arr.splice(i, 1)
  if (arr.length === 0) delete (form as any).platform!.http_proxy![key]
}

const onSave = () => {
  const schema = form.type === 'mixed' ? MixedInboundSchema : TunInboundSchema
  const parsed = schema.safeParse(form)
  if (!parsed.success) {
    // Simple alert; project may have a snackbar/toast system
    alert(parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('\n'))
    return
  }
  editing.value = false
  emit('save', form)
}
</script>

<style scoped>
</style>