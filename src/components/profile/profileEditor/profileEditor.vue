<template>
  <div class="profile-editor">
    <div class="form">
      <InboundsEditor v-model="modelValue.inbounds" />
      <OutboundsListEditor v-model="modelValue.outbounds" />
      <RouteEditor v-model="modelValue.route" />
      <DnsEditor v-model="modelValue.dns" />
    </div>
  </div>
</template>

<script setup lang="ts">
import InboundsEditor from '@/components/inbounds/inboundsEditor/inboundsEditor.vue';
import OutboundsListEditor from '@/components/outbounds/outboundsListEditor/outboundsListEditor.vue';
import RouteEditor from '@/components/route/routeEditor/routeEditor.vue';
import DnsEditor from '@/components/dns/dnsEditor';

defineProps<{
  modelValue: any;
}>();
</script>

<style lang="sass" scoped src="./profileEditor.scss"></style>
