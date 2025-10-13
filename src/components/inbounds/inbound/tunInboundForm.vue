<template>
  <div>
    <!-- Basic Fields -->
    <v-row dense>
      <v-col cols="12" md="4">
        <v-text-field v-model="form.interface_name" label="Interface Name" />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field type="number" v-model.number="form.mtu" label="MTU" />
      </v-col>
      <v-col cols="12" md="4">
        <v-select :items="stackOptions" v-model="form.stack" label="Stack" />
      </v-col>
    </v-row>

    <!-- Addresses -->
    <v-row dense>
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between">
          <div class="text-subtitle-2">Addresses (CIDR)</div>
          <v-btn size="small" variant="text" @click="addAddress" prepend-icon="mdi-plus">Add</v-btn>
        </div>
        <div class="d-flex flex-column" style="gap: 8px">
          <div v-for="(address, index) in (form.address || [])" :key="index" class="d-flex" style="gap: 8px">
            <v-text-field v-model="form.address![index]" density="comfortable" />
            <v-btn icon="mdi-close" size="small" variant="text" @click="removeAddress(index)" />
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Auto Route Settings -->
    <v-row dense>
      <v-col cols="12" md="4">
        <v-switch v-model="form.auto_route" label="Auto Route" />
      </v-col>
      <v-col cols="12" md="4">
        <v-switch v-model="form.auto_redirect" label="Auto Redirect" :disabled="!form.auto_route" />
      </v-col>
      <v-col cols="12" md="4">
        <v-switch v-model="form.strict_route" label="Strict Route" :disabled="!form.auto_route" />
      </v-col>
    </v-row>

    <!-- Advanced -->
    <v-expansion-panels variant="accordion" class="mt-4">
      <v-expansion-panel>
        <v-expansion-panel-title>Advanced</v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-row dense>
            <v-col cols="12" md="4">
              <v-text-field type="number" v-model.number="form.iproute2_table_index" label="iproute2 table index" :disabled="!form.auto_route" />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field type="number" v-model.number="form.iproute2_rule_index" label="iproute2 rule index" :disabled="!form.auto_route" />
            </v-col>
            <v-col cols="12" md="6">
              <div class="d-flex align-center justify-space-between">
                <div class="text-subtitle-2">Route Address</div>
                <v-btn size="x-small" variant="text" :disabled="!form.auto_route" @click="addArray('route_address')" icon="mdi-plus" />
              </div>
              <div class="d-flex flex-column" style="gap: 8px">
                <div v-for="(item, index) in (form.route_address || [])" :key="`ra-${index}`" class="d-flex" style="gap: 8px">
                  <v-text-field v-model="form.route_address![index]" :disabled="!form.auto_route" density="comfortable" />
                  <v-btn icon="mdi-close" size="small" variant="text" :disabled="!form.auto_route" @click="removeArray('route_address', index)" />
                </div>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="d-flex align-center justify-space-between">
                <div class="text-subtitle-2">Route Exclude Address</div>
                <v-btn size="x-small" variant="text" :disabled="!form.auto_route" @click="addArray('route_exclude_address')" icon="mdi-plus" />
              </div>
              <div class="d-flex flex-column" style="gap: 8px">
                <div v-for="(item, index) in (form.route_exclude_address || [])" :key="`rea-${index}`" class="d-flex" style="gap: 8px">
                  <v-text-field v-model="form.route_exclude_address![index]" :disabled="!form.auto_route" density="comfortable" />
                  <v-btn icon="mdi-close" size="small" variant="text" :disabled="!form.auto_route" @click="removeArray('route_exclude_address', index)" />
                </div>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="d-flex align-center justify-space-between">
                <div class="text-subtitle-2">Route Address Set</div>
                <v-btn size="x-small" variant="text" :disabled="!form.auto_route" @click="addArray('route_address_set')" icon="mdi-plus" />
              </div>
              <div class="d-flex flex-column" style="gap: 8px">
                <div v-for="(item, index) in (form.route_address_set || [])" :key="`ras-${index}`" class="d-flex" style="gap: 8px">
                  <v-text-field v-model="form.route_address_set![index]" :disabled="!form.auto_route" density="comfortable" />
                  <v-btn icon="mdi-close" size="small" variant="text" :disabled="!form.auto_route" @click="removeArray('route_address_set', index)" />
                </div>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="d-flex align-center justify-space-between">
                <div class="text-subtitle-2">Route Exclude Address Set</div>
                <v-btn size="x-small" variant="text" :disabled="!form.auto_route" @click="addArray('route_exclude_address_set')" icon="mdi-plus" />
              </div>
              <div class="d-flex flex-column" style="gap: 8px">
                <div v-for="(item, index) in (form.route_exclude_address_set || [])" :key="`reas-${index}`" class="d-flex" style="gap: 8px">
                  <v-text-field v-model="form.route_exclude_address_set![index]" :disabled="!form.auto_route" density="comfortable" />
                  <v-btn icon="mdi-close" size="small" variant="text" :disabled="!form.auto_route" @click="removeArray('route_exclude_address_set', index)" />
                </div>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.auto_redirect_input_mark" label="Auto Redirect Input Mark" :disabled="!form.auto_route || !form.auto_redirect" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.auto_redirect_output_mark" label="Auto Redirect Output Mark" :disabled="!form.auto_route || !form.auto_redirect" />
            </v-col>
            <v-col cols="12" md="4">
              <v-switch v-model="form.endpoint_independent_nat" label="Endpoint Independent NAT (gvisor)" />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model="form.udp_timeout" label="UDP Timeout (e.g. 5m)" />
            </v-col>
          </v-row>

          <!-- Loopback Address -->
          <v-row dense>
            <v-col cols="12">
              <div class="d-flex align-center justify-space-between">
                <div class="text-subtitle-2">Loopback Address</div>
                <v-btn size="small" variant="text" @click="addArray('loopback_address')" prepend-icon="mdi-plus">Add</v-btn>
              </div>
              <div class="d-flex flex-column" style="gap: 8px">
                <div v-for="(item, index) in (form.loopback_address || [])" :key="`la-${index}`" class="d-flex" style="gap: 8px">
                  <v-text-field v-model="form.loopback_address![index]" density="comfortable" />
                  <v-btn icon="mdi-close" size="small" variant="text" @click="removeArray('loopback_address', index)" />
                </div>
              </div>
            </v-col>
          </v-row>

          <!-- Interface Filters -->
          <v-row dense>
            <v-col cols="12" md="6">
              <div class="d-flex align-center justify-space-between">
                <div class="text-subtitle-2">Include Interface</div>
                <v-btn size="x-small" variant="text" @click="addArray('include_interface')" icon="mdi-plus" />
              </div>
              <div class="d-flex flex-column" style="gap: 8px">
                <div v-for="(item, index) in (form.include_interface || [])" :key="`ii-${index}`" class="d-flex" style="gap: 8px">
                  <v-text-field v-model="form.include_interface![index]" density="comfortable" />
                  <v-btn icon="mdi-close" size="small" variant="text" @click="removeArray('include_interface', index)" />
                </div>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="d-flex align-center justify-space-between">
                <div class="text-subtitle-2">Exclude Interface</div>
                <v-btn size="x-small" variant="text" @click="addArray('exclude_interface')" icon="mdi-plus" />
              </div>
              <div class="d-flex flex-column" style="gap: 8px">
                <div v-for="(item, index) in (form.exclude_interface || [])" :key="`ei-${index}`" class="d-flex" style="gap: 8px">
                  <v-text-field v-model="form.exclude_interface![index]" density="comfortable" />
                  <v-btn icon="mdi-close" size="small" variant="text" @click="removeArray('exclude_interface', index)" />
                </div>
              </div>
            </v-col>
          </v-row>

          <!-- UID Filters -->
          <v-row dense>
            <v-col cols="12" md="6">
              <div class="d-flex align-center justify-space-between">
                <div class="text-subtitle-2">Include UID</div>
                <v-btn size="x-small" variant="text" @click="addArray('include_uid')" icon="mdi-plus" />
              </div>
              <div class="d-flex flex-column" style="gap: 8px">
                <div v-for="(item, index) in (form.include_uid || [])" :key="`iuid-${index}`" class="d-flex" style="gap: 8px">
                  <v-text-field type="number" v-model.number="form.include_uid![index]" density="comfortable" />
                  <v-btn icon="mdi-close" size="small" variant="text" @click="removeArray('include_uid', index)" />
                </div>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="d-flex align-center justify-space-between">
                <div class="text-subtitle-2">Exclude UID</div>
                <v-btn size="x-small" variant="text" @click="addArray('exclude_uid')" icon="mdi-plus" />
              </div>
              <div class="d-flex flex-column" style="gap: 8px">
                <div v-for="(item, index) in (form.exclude_uid || [])" :key="`euid-${index}`" class="d-flex" style="gap: 8px">
                  <v-text-field type="number" v-model.number="form.exclude_uid![index]" density="comfortable" />
                  <v-btn icon="mdi-close" size="small" variant="text" @click="removeArray('exclude_uid', index)" />
                </div>
              </div>
            </v-col>
          </v-row>

          <!-- UID Range Filters -->
          <v-row dense>
            <v-col cols="12" md="6">
              <div class="d-flex align-center justify-space-between">
                <div class="text-subtitle-2">Include UID Range</div>
                <v-btn size="x-small" variant="text" @click="addArray('include_uid_range')" icon="mdi-plus" />
              </div>
              <div class="d-flex flex-column" style="gap: 8px">
                <div v-for="(item, index) in (form.include_uid_range || [])" :key="`iuidr-${index}`" class="d-flex" style="gap: 8px">
                  <v-text-field v-model="form.include_uid_range![index]" density="comfortable" />
                  <v-btn icon="mdi-close" size="small" variant="text" @click="removeArray('include_uid_range', index)" />
                </div>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="d-flex align-center justify-space-between">
                <div class="text-subtitle-2">Exclude UID Range</div>
                <v-btn size="x-small" variant="text" @click="addArray('exclude_uid_range')" icon="mdi-plus" />
              </div>
              <div class="d-flex flex-column" style="gap: 8px">
                <div v-for="(item, index) in (form.exclude_uid_range || [])" :key="`euidr-${index}`" class="d-flex" style="gap: 8px">
                  <v-text-field v-model="form.exclude_uid_range![index]" density="comfortable" />
                  <v-btn icon="mdi-close" size="small" variant="text" @click="removeArray('exclude_uid_range', index)" />
                </div>
              </div>
            </v-col>
          </v-row>

          <!-- Android Filters -->
          <v-row dense>
            <v-col cols="12" md="6">
              <div class="d-flex align-center justify-space-between">
                <div class="text-subtitle-2">Include Android User</div>
                <v-btn size="x-small" variant="text" @click="addArray('include_android_user')" icon="mdi-plus" />
              </div>
              <div class="d-flex flex-column" style="gap: 8px">
                <div v-for="(item, index) in (form.include_android_user || [])" :key="`iau-${index}`" class="d-flex" style="gap: 8px">
                  <v-text-field type="number" v-model.number="form.include_android_user![index]" density="comfortable" />
                  <v-btn icon="mdi-close" size="small" variant="text" @click="removeArray('include_android_user', index)" />
                </div>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="d-flex align-center justify-space-between">
                <div class="text-subtitle-2">Include Package</div>
                <v-btn size="x-small" variant="text" @click="addArray('include_package')" icon="mdi-plus" />
              </div>
              <div class="d-flex flex-column" style="gap: 8px">
                <div v-for="(item, index) in (form.include_package || [])" :key="`ip-${index}`" class="d-flex" style="gap: 8px">
                  <v-text-field v-model="form.include_package![index]" density="comfortable" />
                  <v-btn icon="mdi-close" size="small" variant="text" @click="removeArray('include_package', index)" />
                </div>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="d-flex align-center justify-space-between">
                <div class="text-subtitle-2">Exclude Package</div>
                <v-btn size="x-small" variant="text" @click="addArray('exclude_package')" icon="mdi-plus" />
              </div>
              <div class="d-flex flex-column" style="gap: 8px">
                <div v-for="(item, index) in (form.exclude_package || [])" :key="`ep-${index}`" class="d-flex" style="gap: 8px">
                  <v-text-field v-model="form.exclude_package![index]" density="comfortable" />
                  <v-btn icon="mdi-close" size="small" variant="text" @click="removeArray('exclude_package', index)" />
                </div>
              </div>
            </v-col>
          </v-row>

          <!-- Platform HTTP Proxy -->
          <v-row dense>
            <v-col cols="12">
              <div class="text-subtitle-2 mt-2">Platform: HTTP Proxy</div>
            </v-col>
            <v-col cols="12" md="4">
              <v-switch v-model="form.platform!.http_proxy!.enabled" label="Enabled" />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model="form.platform!.http_proxy!.server" label="Server" :disabled="!form.platform?.http_proxy?.enabled" />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field type="number" v-model.number="form.platform!.http_proxy!.server_port" label="Server Port" :disabled="!form.platform?.http_proxy?.enabled" />
            </v-col>
            <v-col cols="12" md="6">
              <div class="d-flex align-center justify-space-between">
                <div class="text-subtitle-2">Bypass Domain</div>
                <v-btn size="x-small" variant="text" :disabled="!form.platform?.http_proxy?.enabled" @click="addPlatformHttpArray('bypass_domain')" icon="mdi-plus" />
              </div>
              <div class="d-flex flex-column" style="gap: 8px">
                <div v-for="(item, index) in (form.platform?.http_proxy?.bypass_domain || [])" :key="`bpd-${index}`" class="d-flex" style="gap: 8px">
                  <v-text-field v-model="form.platform!.http_proxy!.bypass_domain![index]" :disabled="!form.platform?.http_proxy?.enabled" density="comfortable" />
                  <v-btn icon="mdi-close" size="small" variant="text" :disabled="!form.platform?.http_proxy?.enabled" @click="removePlatformHttpArray('bypass_domain', index)" />
                </div>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="d-flex align-center justify-space-between">
                <div class="text-subtitle-2">Match Domain (Apple only)</div>
                <v-btn size="x-small" variant="text" :disabled="!form.platform?.http_proxy?.enabled" @click="addPlatformHttpArray('match_domain')" icon="mdi-plus" />
              </div>
              <div class="d-flex flex-column" style="gap: 8px">
                <div v-for="(item, index) in (form.platform?.http_proxy?.match_domain || [])" :key="`md-${index}`" class="d-flex" style="gap: 8px">
                  <v-text-field v-model="form.platform!.http_proxy!.match_domain![index]" :disabled="!form.platform?.http_proxy?.enabled" density="comfortable" />
                  <v-btn icon="mdi-close" size="small" variant="text" :disabled="!form.platform?.http_proxy?.enabled" @click="removePlatformHttpArray('match_domain', index)" />
                </div>
              </div>
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { TunInbound } from './schema'

const props = defineProps<{ form: TunInbound }>()
const emit = defineEmits<{ (e: 'update:form', v: TunInbound): void }>()

const form = computed({
  get: () => props.form,
  set: (v) => emit('update:form', v)
})

const stackOptions = ['system', 'gvisor', 'mixed']

// Address helpers
const addAddress = () => {
  if (!form.value.address) form.value.address = []
  form.value.address.push('')
}

const removeAddress = (index: number) => {
  if (form.value.address) {
    form.value.address.splice(index, 1)
    if (form.value.address.length === 0) {
      delete form.value.address
    }
  }
}

// Generic array helpers
const addArray = (key: keyof TunInbound) => {
  const arr = form.value[key] as string[] | number[] | undefined
  if (!arr) {
    (form.value as any)[key] = []
  }
  ;(form.value as any)[key].push('')
}

const removeArray = (key: keyof TunInbound, index: number) => {
  const arr = form.value[key] as string[] | number[] | undefined
  if (arr) {
    arr.splice(index, 1)
    if (arr.length === 0) {
      delete (form.value as any)[key]
    }
  }
}

// Platform HTTP proxy helpers
const addPlatformHttpArray = (key: 'bypass_domain' | 'match_domain') => {
  if (!form.value.platform) form.value.platform = {}
  if (!form.value.platform.http_proxy) form.value.platform.http_proxy = {}
  if (!form.value.platform.http_proxy[key]) form.value.platform.http_proxy[key] = []
  form.value.platform.http_proxy[key]!.push('')
}

const removePlatformHttpArray = (key: 'bypass_domain' | 'match_domain', index: number) => {
  const arr = form.value.platform?.http_proxy?.[key]
  if (arr) {
    arr.splice(index, 1)
    if (arr.length === 0) {
      delete form.value.platform!.http_proxy![key]
    }
  }
}
</script>

<style scoped>
</style>