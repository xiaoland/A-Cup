<template>
  <div class="edit-profile-view">
    <h1>Edit Profile</h1>
    <ProfileEditor v-if="profile" v-model="profile" @save="handleSave" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ProfileEditor from '@/components/profiles/profileEditor.vue';
import { useProfileStore } from '@/stores/profile';
import type { CreateProfile } from '~/schemas/profile';

const route = useRoute();
const router = useRouter();
const profileStore = useProfileStore();

const profile = ref<CreateProfile | null>(null);

onMounted(async () => {
  const profileId = route.params.id as string;
  if (profileId) {
    try {
      profile.value = await profileStore.getProfileForEdit(profileId);
    } catch (error) {
      console.error('Failed to load profile:', error);
      // Handle error, maybe redirect
    }
  }
});

const handleSave = async (updatedProfile: CreateProfile) => {
  const profileId = route.params.id as string;
  if (profileId) {
    try {
      await profileStore.updateProfile(profileId, updatedProfile);
      router.push('/profiles'); // Assuming there's a profiles list route
    } catch (error) {
      console.error('Failed to save profile:', error);
      // Handle error
    }
  }
};
</script>

<style scoped>
.edit-profile-view {
  padding: 1rem;
}
</style>
