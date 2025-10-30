<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useProfileStore } from '@/stores/profile';
import ProfileEditor from '@/components/profiles/profileEditor.vue';
import type { CreateProfile } from '../../schemas/profile';

const route = useRoute();
const profileStore = useProfileStore();

const profile = ref<CreateProfile>({
  name: '',
  tags: [],
  referencedOutbounds: [],
  referencedRuleSets: [],
  outbounds: [],
  route: {
    rules: [],
  },
  dns: {
    servers: [],
    rules: [],
  },
  inbounds: [],
});

const isNewProfile = ref(false);
const profileId = ref<string | undefined>(undefined);
const DRAFT_PROFILE_KEY = 'draft_profile';

onMounted(async () => {
  const id = route.params.id as string;
  if (id && id !== 'new') {
    const existingProfile = await profileStore.getProfile(id);
    if (existingProfile) {
      // Note: This is a simplified transformation. A real implementation
      // would need to fetch the full singbox profile from R2.
      profile.value = {
        name: existingProfile.name,
        tags: existingProfile.tags,
        referencedOutbounds: existingProfile.outbounds,
        referencedRuleSets: existingProfile.rule_sets,
        outbounds: [],
        route: { rules: [] },
        dns: { servers: [], rules: [] },
        inbounds: [],
      };
    }
    isNewProfile.value = false;
    profileId.value = id;
  } else {
    isNewProfile.value = true;
    const savedDraft = localStorage.getItem(DRAFT_PROFILE_KEY);
    if (savedDraft) {
      profile.value = JSON.parse(savedDraft);
    }
  }
});

watch(
  profile,
  (newProfile) => {
    if (isNewProfile.value) {
      localStorage.setItem(DRAFT_PROFILE_KEY, JSON.stringify(newProfile));
    }
  },
  { deep: true }
);

const clearDraft = () => {
  localStorage.removeItem(DRAFT_PROFILE_KEY);
};

const onClearDraft = () => {
  localStorage.removeItem(DRAFT_PROFILE_KEY);
  // Reset profile to initial state
  profile.value = {
    name: '',
    tags: [],
    referencedOutbounds: [],
    referencedRuleSets: [],
    outbounds: [],
    route: {
      rules: [],
    },
    dns: {
      servers: [],
      rules: [],
    },
    inbounds: [],
  };
};
</script>

<template>
  <div>
    <h1>{{ isNewProfile ? 'Create Profile' : 'Edit Profile' }}</h1>
    <ProfileEditor
      v-model="profile"
      :profile-id="profileId"
      :is-new-profile="isNewProfile"
      @save="clearDraft"
      @cancel="clearDraft"
      @clear-draft="onClearDraft"
    />
  </div>
</template>
