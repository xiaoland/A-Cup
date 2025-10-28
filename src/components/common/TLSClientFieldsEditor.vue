<script setup lang="ts">
import { computed } from 'vue';
import type { TLSClientFields } from '../../../schemas/shared';
import Fieldset from 'primevue/fieldset';
import InputText from 'primevue/inputtext';
import ToggleSwitch from 'primevue/toggleswitch';
import Chips from 'primevue/chips';
import Card from 'primevue/card';
import Divider from 'primevue/divider';

const props = defineProps<{
  modelValue: TLSClientFields;
}>();

const emit = defineEmits(['update:modelValue']);

const tlsFields = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const utls = computed({
  get: () => tlsFields.value.utls ?? { enabled: false },
  set: (value) => tlsFields.value = { ...tlsFields.value, utls: value },
});

const reality = computed({
  get: () => tlsFields.value.reality ?? { enabled: false },
  set: (value) => tlsFields.value = { ...tlsFields.value, reality: value },
});

</script>

<template>
  <Fieldset legend="TLS Client Fields" :toggleable="true">
    <!-- Enable TLS Toggle -->
    <div class="mb-4">
      <div class="flex items-center gap-3">
        <ToggleSwitch id="tls_enabled" v-model="tlsFields.enabled" />
        <label for="tls_enabled" class="font-semibold cursor-pointer">Enable TLS</label>
      </div>
    </div>

    <!-- Main TLS Configuration -->
    <template v-if="tlsFields.enabled">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Left Column: Basic TLS Settings -->
        <div class="flex flex-col gap-4">
          <div>
            <label for="server_name" class="block mb-2 font-medium">Server Name (SNI)</label>
            <InputText 
              id="server_name" 
              v-model="tlsFields.server_name" 
              class="w-full"
            />
          </div>

          <div>
            <label for="min_version" class="block mb-2 font-medium">Min Version</label>
            <InputText 
              id="min_version" 
              v-model="tlsFields.min_version" 
              class="w-full"
              placeholder="e.g., 1.2"
            />
          </div>

          <div>
            <label for="max_version" class="block mb-2 font-medium">Max Version</label>
            <InputText 
              id="max_version" 
              v-model="tlsFields.max_version" 
              class="w-full"
              placeholder="e.g., 1.3"
            />
          </div>

          <div class="pt-2">
            <label class="text-sm font-medium text-surface-700 dark:text-surface-300 mb-3 block">ALPN Protocols</label>
            <Chips 
              id="alpn" 
              v-model="tlsFields.alpn" 
              class="w-full"
              placeholder="Press Enter to add protocol"
            />
          </div>

          <div class="pt-2">
            <label class="text-sm font-medium text-surface-700 dark:text-surface-300 mb-3 block">Cipher Suites</label>
            <Chips 
              id="cipher_suites" 
              v-model="tlsFields.cipher_suites" 
              class="w-full"
              placeholder="Press Enter to add cipher"
            />
          </div>
        </div>

        <!-- Right Column: Advanced TLS Settings & Options -->
        <div class="flex flex-col gap-4">
          <!-- Boolean Toggles -->
          <div class="flex flex-col gap-3 p-4 bg-surface-50 dark:bg-surface-900 rounded-lg">
            <div class="flex items-center gap-3">
              <ToggleSwitch id="disable_sni" v-model="tlsFields.disable_sni" />
              <label for="disable_sni" class="cursor-pointer">Disable SNI</label>
            </div>
            <div class="flex items-center gap-3">
              <ToggleSwitch id="insecure" v-model="tlsFields.insecure" />
              <label for="insecure" class="cursor-pointer">Insecure (Skip Cert Verification)</label>
            </div>
          </div>
        </div>

        <!-- Right Column: Advanced TLS Settings & Options -->
        <div class="flex flex-col gap-4">
          <!-- Boolean Toggles -->
          <div class="flex flex-col gap-3 p-4 bg-surface-50 dark:bg-surface-900 rounded-lg">
            <div class="flex items-center gap-3">
              <ToggleSwitch id="disable_sni_2" v-model="tlsFields.disable_sni" />
              <label for="disable_sni_2" class="cursor-pointer">Disable SNI</label>
            </div>
            <div class="flex items-center gap-3">
              <ToggleSwitch id="insecure_2" v-model="tlsFields.insecure" />
              <label for="insecure_2" class="cursor-pointer">Insecure (Skip Cert Verification)</label>
            </div>
          </div>
        </div>
      </div>

      <Divider class="my-6" />

      <!-- Advanced Sections: uTLS and Reality -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- uTLS Section -->
        <Card class="p-0">
          <template #header>
            <div class="flex items-center gap-3 p-4 border-b border-surface-200 dark:border-surface-700">
              <ToggleSwitch id="utls_enabled" v-model="utls.enabled" />
              <label for="utls_enabled" class="font-semibold cursor-pointer">uTLS</label>
            </div>
          </template>
          
          <div v-if="utls.enabled" class="p-4">
            <div>
              <label for="utls_fingerprint" class="block mb-2 font-medium">Fingerprint</label>
              <InputText 
                id="utls_fingerprint" 
                v-model="utls.fingerprint" 
                class="w-full"
                placeholder="e.g., chrome, firefox"
              />
            </div>
          </div>
          <div v-else class="p-4 text-surface-500 text-sm italic">
            Disabled
          </div>
        </Card>

        <!-- Reality Section -->
        <Card class="p-0">
          <template #header>
            <div class="flex items-center gap-3 p-4 border-b border-surface-200 dark:border-surface-700">
              <ToggleSwitch id="reality_enabled" v-model="reality.enabled" />
              <label for="reality_enabled" class="font-semibold cursor-pointer">Reality</label>
            </div>
          </template>

          <div v-if="reality.enabled" class="p-4 flex flex-col gap-4">
            <div>
              <label for="reality_public_key" class="block mb-2 font-medium">Public Key</label>
              <InputText 
                id="reality_public_key" 
                v-model="reality.public_key" 
                class="w-full"
              />
            </div>
            <div>
              <label for="reality_short_id" class="block mb-2 font-medium">Short ID</label>
              <InputText 
                id="reality_short_id" 
                v-model="reality.short_id" 
                class="w-full"
              />
            </div>
          </div>
          <div v-else class="p-4 text-surface-500 text-sm italic">
            Disabled
          </div>
        </Card>
      </div>
    </template>
  </Fieldset>
</template>
