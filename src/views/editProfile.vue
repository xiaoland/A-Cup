<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useProfileStore } from '@/stores/profile';
import ProfileEditor from '@/components/profiles/profileEditor.vue';
import type { CreateProfile, UpdateProfile } from '../../schemas/profile';

const router = useRouter();
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

onMounted(async () => {
  const profileId = route.params.id as string;
  if (profileId && profileId !== 'new') {
    const existingProfile = await profileStore.getProfile(profileId);
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
  } else {
    isNewProfile.value = true;
  }
});

const onSave = async () => {
  if (isNewProfile.value) {
    await profileStore.createProfile(profile.value);
  } else {
    await profileStore.updateProfile(route.params.id as string, profile.value);
  }
  router.push('/profiles');
};

const onCancel = () => {
  router.push('/profiles');
};
</script>

<template>
  <div>
    <h1>{{ isNewProfile ? 'Create Profile' : 'Edit Profile' }}</h1>
    <ProfileEditor
      :modelValue="profile"
      @save="onSave"
      @cancel="onCancel"
    />
  </div>
</template>
