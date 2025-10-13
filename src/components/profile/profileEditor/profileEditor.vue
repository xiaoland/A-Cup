<template>
  <div class="profile-editor">
    <div class="form">
      <InboundsEditor v-model="modelValue.inbounds" />
      <OutboundsEditor v-model="modelValue.outbounds" />
      <RouteEditor v-model="modelValue.route" />
      <DnsEditor v-model="modelValue.dns" />
    </div>
  </div>
</template>

<script setup lang="ts">
import InboundsEditor from '@/components/inbounds/inboundsEditor/inboundsEditor.vue';
import OutboundsEditor from '@/components/outbounds/outboundsEditor/outboundsEditor.vue';
import RouteEditor from '@/components/route/routeEditor/routeEditor.vue';
import DnsEditor from '@/components/dns/dnsEditor/dnsEditor.vue';

withDefaults(
  defineProps<{
    modelValue?: any;
  }>(),
  {
    modelValue: () => ({
      inbounds: [],
      outbounds: [],
      route: {},
      dns: {},
    }),
  }
);
</script>

<style scoped lang="scss" src="./profileEditor.scss"></style>
