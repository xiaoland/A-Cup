<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import type { SingBoxProfile } from '../../schemas/singbox';
import ProfileEditor from '@/components/profiles/profileEditor.vue';

const router = useRouter();

// TODO: Fetch profile data from store/API
const profile = ref<SingBoxProfile>({
  dns: {
    servers: [],
    rules: [],
  },
  inbounds: [],
  outbounds: [],
  route: {},
});

const onSave = () => {
  router.push('/profiles');
};

const onCancel = () => {
  router.push('/profiles');
};
</script>

<template>
  <div>
    <h1>Edit Profile</h1>
    <ProfileEditor
      :modelValue="profile"
      @save="onSave"
      @cancel="onCancel"
    />
  </div>
</template>
