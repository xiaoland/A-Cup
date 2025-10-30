<script setup lang="ts">
import type { CreateProfile } from '../../../schemas/profile';
import type { SingBoxOutbound } from '../../../schemas/singbox';
import type { SingBoxRuleSet } from '../../../schemas/route';
import InboundsEditor from './inboundsEditor.vue';
import OutboundsEditor from './outboundsEditor.vue';
import DnsEditor from './dnsEditor.vue';
import RouteEditor from './routeEditor.vue';
import Button from 'primevue/button';
import Panel from 'primevue/panel';
import InputText from 'primevue/inputtext';
import Chips from 'primevue/chips';
import { provide, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useProfileStore } from '@/stores/profile';

const props = defineProps<{
  modelValue: CreateProfile;
  profileId?: string;
  isNewProfile?: boolean;
}>();

const emit = defineEmits(['update:modelValue']);

const router = useRouter();
const profileStore = useProfileStore();

// Provide profileOutbounds to child components
const profileOutbounds = computed<SingBoxOutbound[]>(() => props.modelValue.outbounds || []);
provide('profileOutbounds', profileOutbounds);

// Provide profileRuleSets to child components
const profileRuleSets = computed<SingBoxRuleSet[]>(() => props.modelValue.route?.rule_set || []);
provide('profileRuleSets', profileRuleSets);

const onSave = async () => {
  if (props.isNewProfile) {
    await profileStore.createProfile(props.modelValue);
  } else if (props.profileId) {
    await profileStore.updateProfile(props.profileId, props.modelValue);
  }
  router.push('/profiles');
};

const onCancel = () => {
  router.push('/profiles');
};

</script>

<template>
  <div>
    <Panel header="Basic Information" :toggleable="false" class="mb-4">
      <div class="flex flex-col gap-3">
        <div class="flex flex-col gap-2">
          <label for="profile-name">Name</label>
          <InputText 
            id="profile-name"
            v-model="modelValue.name" 
            placeholder="Enter profile name"
            :required="true"
          />
        </div>
        
        <div class="flex flex-col gap-2">
          <label for="profile-tags">Tags</label>
          <Chips 
            id="profile-tags"
            v-model="modelValue.tags" 
            placeholder="Add tags (press Enter to add)"
            separator=","
          />
        </div>
      </div>
    </Panel>

    <Panel header="In JSON" :toggleable="true" :collapsed="true" class="mb-4">
      <pre>{{ JSON.stringify(modelValue, null, 2) }}</pre>
    </Panel>
    
    <Panel header="Inbounds" :toggleable="true">
      <InboundsEditor v-model="modelValue.inbounds"/>
    </Panel>

    <Panel header="Outbounds" :toggleable="true" class="mt-4">
      <OutboundsEditor v-model="modelValue.outbounds" />
    </Panel>

    <Panel header="DNS" :toggleable="true" class="mt-4">
      <DnsEditor v-model="modelValue.dns" />
    </Panel>

    <Panel header="Route" :toggleable="true" class="mt-4">
      <RouteEditor v-model="modelValue.route" />
    </Panel>

    <div class="flex justify-content-end mt-4">
      <Button label="Cancel" icon="pi pi-times" severity="secondary" class="mr-2" @click="onCancel" />
      <Button label="Save" icon="pi pi-check" @click="onSave" />
    </div>
  </div>
</template>
