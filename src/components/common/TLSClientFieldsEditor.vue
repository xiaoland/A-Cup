<script setup lang="ts">
import { computed } from 'vue';
import type { TLSClientFields } from '../../../schemas/shared';
import Fieldset from 'primevue/fieldset';
import InputText from 'primevue/inputtext';
import InputSwitch from 'primevue/inputswitch';
import Chips from 'primevue/chips';

const props = defineProps<{
  modelValue: TLSClientFields;
}>();

const emit = defineEmits(['update:modelValue']);

const tlsFields = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

// Safely handle potentially undefined nested objects
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
    <div class="grid formgrid">
      <div class="col-12">
        <div class="field-checkbox">
          <InputSwitch id="tls_enabled" v-model="tlsFields.enabled" />
          <label for="tls_enabled">Enable TLS</label>
        </div>
      </div>

      <template v-if="tlsFields.enabled">
        <div class="col-12 md:col-6">
          <div class="field">
            <label for="server_name">Server Name (SNI)</label>
            <InputText id="server_name" v-model="tlsFields.server_name" />
          </div>
          <div class="field">
            <label for="alpn">ALPN</label>
            <Chips id="alpn" v-model="tlsFields.alpn" />
          </div>
          <div class="field">
            <label for="min_version">Min Version</label>
            <InputText id="min_version" v-model="tlsFields.min_version" />
          </div>
          <div class="field">
            <label for="max_version">Max Version</label>
            <InputText id="max_version" v-model="tlsFields.max_version" />
          </div>
          <div class="field">
            <label for="cipher_suites">Cipher Suites</label>
            <Chips id="cipher_suites" v-model="tlsFields.cipher_suites" />
          </div>
        </div>
        <div class="col-12 md:col-6">
          <div class="field-checkbox">
            <InputSwitch id="disable_sni" v-model="tlsFields.disable_sni" />
            <label for="disable_sni">Disable SNI</label>
          </div>
          <div class="field-checkbox">
            <InputSwitch id="insecure" v-model="tlsFields.insecure" />
            <label for="insecure">Insecure (Skip Cert Verification)</label>
          </div>

          <Fieldset legend="uTLS" :toggleable="true" class="mt-4">
            <div class="field-checkbox">
              <InputSwitch id="utls_enabled" v-model="utls.enabled" />
              <label for="utls_enabled">Enable uTLS</label>
            </div>
            <div class="field" v-if="utls.enabled">
              <label for="utls_fingerprint">Fingerprint</label>
              <InputText id="utls_fingerprint" v-model="utls.fingerprint" />
            </div>
          </Fieldset>

          <Fieldset legend="Reality" :toggleable="true" class="mt-4">
            <div class="field-checkbox">
              <InputSwitch id="reality_enabled" v-model="reality.enabled" />
              <label for="reality_enabled">Enable Reality</label>
            </div>
            <template v-if="reality.enabled">
              <div class="field">
                <label for="reality_public_key">Public Key</label>
                <InputText id="reality_public_key" v-model="reality.public_key" />
              </div>
              <div class="field">
                <label for="reality_short_id">Short ID</label>
                <InputText id="reality_short_id" v-model="reality.short_id" />
              </div>
            </template>
          </Fieldset>
        </div>
      </template>
    </div>
  </Fieldset>
</template>
