<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ProfileEditor from '@/components/profile/profileEditor/profileEditor.vue'

const router = useRouter()
const profileEditorRef = ref<InstanceType<typeof ProfileEditor> | null>(null)

const handleSave = (profile: any) => {
  // Profile creation is handled by the ProfileEditor component
  console.log('Profile created:', profile)
  router.push('/profiles')
}

const handleCancel = () => {
  router.push('/profiles')
}
</script>

<template>
  <ProfileEditor 
    ref="profileEditorRef"
    mode="create"
    @save="handleSave"
    @cancel="handleCancel"
  />
</template>

<style>
</style>
