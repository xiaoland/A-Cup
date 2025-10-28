<script setup lang="ts">
import { computed } from 'vue';
import type { Inbound } from '../../../schemas/inbound';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import InputSwitch from 'primevue/inputswitch';
import Chips from 'primevue/chips';
import Fieldset from 'primevue/fieldset';

const props = defineProps<{
  modelValue: Inbound;
}>();

const emit = defineEmits(['update:modelValue']);

const inbound = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const inboundTypes = ['mixed', 'tun'];
const tunStacks = ['system', 'gvisor', 'mixed'];

const onTypeChange = (newType: 'mixed' | 'tun') => {
  const tag = inbound.value.tag;
  if (newType === 'mixed') {
    inbound.value = { tag, type: 'mixed', listen: '0.0.0.0', listen_port: 1080 };
  } else {
    inbound.value = { tag, type: 'tun', address: [] };
  }
};

const tunAddress = computed({
    get: () => {
        if (inbound.value.type === 'tun') {
            if (Array.isArray(inbound.value.address)) return inbound.value.address;
            if (typeof inbound.value.address === 'string') return [inbound.value.address];
        }
        return [];
    },
    set: (value) => {
        if (inbound.value.type === 'tun') {
            inbound.value = { ...inbound.value, address: value };
        }
    }
});

</script>

<template>
  <div>
    <div class="field">
      <label for="tag">Tag</label>
      <InputText id="tag" v-model="inbound.tag" />
    </div>
    <div class="field">
      <label for="type">Inbound Type</label>
      <Dropdown id="type" :modelValue="inbound.type" :options="inboundTypes" @update:modelValue="onTypeChange" placeholder="Select a Type" />
    </div>

    <template v-if="inbound.type === 'mixed'">
      <div class="formgrid grid">
        <div class="field col-12 md:col-6">
          <label for="listen">Listen Address</label>
          <InputText id="listen" v-model="inbound.listen" />
        </div>
        <div class="field col-12 md:col-6">
          <label for="listen_port">Listen Port</label>
          <InputNumber id="listen_port" v-model="inbound.listen_port" />
        </div>
      </div>
      <div class="field-checkbox">
        <InputSwitch id="set_system_proxy" v-model="inbound.set_system_proxy" />
        <label for="set_system_proxy">Set System Proxy</label>
      </div>
      <!-- TODO: Editor for users array -->
    </template>

    <template v-if="inbound.type === 'tun'">
      <Fieldset legend="TUN Configuration" :toggleable="true" class="mt-3">
        <div class="formgrid grid">
          <div class="field col-12 md:col-6">
            <div class="field">
              <label for="interface_name">Interface Name</label>
              <InputText id="interface_name" v-model="inbound.interface_name" />
            </div>
            <div class="field">
              <label for="address">Address</label>
              <Chips id="address" v-model="tunAddress" />
            </div>
            <div class="field">
              <label for="mtu">MTU</label>
              <InputNumber id="mtu" v-model="inbound.mtu" />
            </div>
            <div class="field">
              <label for="stack">Stack</label>
              <Dropdown id="stack" v-model="inbound.stack" :options="tunStacks" />
            </div>
          </div>
          <div class="field col-12 md:col-6">
            <div class="field-checkbox">
              <InputSwitch id="auto_route" v-model="inbound.auto_route" />
              <label for="auto_route">Auto Route</label>
            </div>
            <div class="field-checkbox">
              <InputSwitch id="strict_route" v-model="inbound.strict_route" />
              <label for="strict_route">Strict Route</label>
            </div>
             <div class="field-checkbox">
              <InputSwitch id="endpoint_independent_nat" v-model="inbound.endpoint_independent_nat" />
              <label for="endpoint_independent_nat">Endpoint Independent NAT</label>
            </div>
          </div>
        </div>
      </Fieldset>
    </template>
  </div>
</template>
