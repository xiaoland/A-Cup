<template>
    <div class="new-profile-view">
        <h1>New Profile</h1>
        <ProfileEditor v-model="profile" @save="handleSave" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import ProfileEditor from "@/components/profiles/profileEditor.vue";
import { useProfileStore } from "@/stores/profile";
import type { CreateProfile } from "~/schemas/profile";

const router = useRouter();
const profileStore = useProfileStore();

const profile = ref<CreateProfile>({
    tags: [],
    referencedOutbounds: [],
    referencedRuleSets: [],
    log: {
        level: "info",
        timestamp: true,
    },
    outbounds: [],
    route: {
        rules: [],
        rule_set: [],
        final: "direct",
    },
    dns: {
        servers: [],
        rules: [],
        final: "system",
    },
    inbounds: [],
});

onMounted(() => {
    const draft = profileStore.loadDraft(profileStore.getDraftKeyForNew());
    if (draft) {
        profile.value = draft;
    }
});

watch(
    profile,
    () => {
        profileStore.saveDraft(profileStore.getDraftKeyForNew(), profile.value);
    },
    { deep: true },
);

const handleSave = async (newProfile: CreateProfile) => {
    try {
        await profileStore.createProfile(newProfile);
        profileStore.clearDraft(profileStore.getDraftKeyForNew());
        router.push("/profiles"); // Assuming there's a profiles list route
    } catch (error) {
        console.error("Failed to create profile:", error);
        // Handle error
    }
};
</script>

<style scoped>
.new-profile-view {
    padding: 1rem;
}
</style>
