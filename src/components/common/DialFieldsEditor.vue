<script setup lang="ts">
import { computed } from 'vue';
import type { DialFields } from '../../../schemas/shared';
import Fieldset from 'primevue/fieldset';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import InputSwitch from 'primevue/inputswitch';
import Dropdown from 'primevue/dropdown';

const props = defineProps<{
  modelValue: DialFields;
}>();

const emit = defineEmits(['update:modelValue']);

const dialFields = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const domainResolver = computed({
    get: () => typeof dialFields.value.domain_resolver === 'string' ? dialFields.value.domain_resolver : '',
    set: (value) => dialFields.value = { ...dialFields.value, domain_resolver: value }
})

const domainStrategies = ['prefer_ipv4', 'prefer_ipv6', 'ipv4_only', 'ipv6_only'];

</script>

<template>
  <Fieldset legend="Dial Fields" :toggleable="true">
    <div class="grid formgrid">
      <div class="col-12 md:col-6">
        <div class="field">
          <label for="detour">Detour</label>
          <InputText id="detour" v-model="dialFields.detour" />
        </div>
        <div class="field">
          <label for="bind_interface">Bind Interface</label>
          <InputText id="bind_interface" v-model="dialFields.bind_interface" />
        </div>
        <div class="field">
          <label for="inet4_bind_address">IPv4 Bind Address</label>
          <InputText id="inet4_bind_address" v-model="dialFields.inet4_bind_address" />
        </div>
        <div class="field">
          <label for="inet6_bind_address">IPv6 Bind Address</label>
          <InputText id="inet6_bind_address" v-model="dialFields.inet6_bind_address" />
        </div>
        <div class="field">
          <label for="routing_mark">Routing Mark</label>
          <InputNumber id="routing_mark" v-model="dialFields.routing_mark" />
        </div>
      </div>
      <div class="col-12 md:col-6">
        <div class="field">
          <label for="connect_timeout">Connect Timeout</label>
          <InputText id="connect_timeout" v-model="dialFields.connect_timeout" />
        </div>
        <div class="field">
          <label for="domain_resolver">Domain Resolver</label>
          <InputText id="domain_resolver" v-model="domainResolver" />
        </div>
        <div class="field">
          <label for="domain_strategy">Domain Strategy</label>
          <Dropdown id="domain_strategy" v-model="dialFields.domain_strategy" :options="domainStrategies" placeholder="Select a Strategy" />
        </div>
        <div class="field-checkbox">
          <InputSwitch id="reuse_addr" v-model="dialFields.reuse_addr" />
          <label for="reuse_addr">Reuse Address</label>
        </div>
        <div class="field-checkbox">
          <InputSwitch id="tcp_fast_open" v-model="dialFields.tcp_fast_open" />
          <label for="tcp_fast_open">TCP Fast Open</label>
        </div>
        <div class="field-checkbox">
          <InputSwitch id="tcp_multi_path" v-model="dialFields.tcp_multi_path" />
          <label for="tcp_multi_path">TCP Multi Path</label>
        </div>
        <div class="field-checkbox">
          <InputSwitch id="udp_fragment" v-model="dialFields.udp_fragment" />
          <label for="udp_fragment">UDP Fragment</label>
        </div>
      </div>
    </div>
  </Fieldset>
</template>
