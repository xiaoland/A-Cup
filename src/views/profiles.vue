<script setup lang="ts">
import { ref, onMounted } from "vue";
import type { Profile } from "../../schemas/profile";
import { useProfileStore } from "../stores/profile";
import { useUserStore } from "../stores/user";
import { useToast } from "primevue/usetoast";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import Chip from "primevue/chip";
import Toast from "primevue/toast";
import { useRouter } from "vue-router";

const router = useRouter();
const profileStore = useProfileStore();
const userStore = useUserStore();
const toast = useToast();
const profiles = ref<Profile[]>([]);

onMounted(async () => {
    await profileStore.fetchProfiles();
    profiles.value = profileStore.profiles;
});

const editProfile = (id: string) => {
    router.push(`/profiles/${id}`);
};

const deleteProfile = async (id: string) => {
    await profileStore.deleteProfile(id);
    profiles.value = profileStore.profiles;
};

const duplicateProfile = async (id: string) => {
    try {
        await profileStore.duplicateProfile(id);
        profiles.value = profileStore.profiles;
        toast.add({
            severity: "success",
            summary: "Success",
            detail: "Profile duplicated successfully",
            life: 3000,
        });
    } catch (err) {
        console.error(err);
        toast.add({
            severity: "error",
            summary: "Error",
            detail: "Failed to duplicate profile",
            life: 3000,
        });
    }
};

const newProfile = () => {
    router.push("/profiles/new");
};

const copyUrl = async (id: string) => {
    try {
        const response = await userStore.authorizedRequest<{ url: string }>(
            `/api/profiles/${id}/singbox`,
        );
        await navigator.clipboard.writeText(response.url);
        toast.add({
            severity: "success",
            summary: "Success",
            detail: "URL copied to clipboard",
            life: 3000,
        });
    } catch (err) {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: "Failed to copy URL",
            life: 3000,
        });
    }
};
</script>
<template>
    <div class="p-4">
        <Toast />
        <div class="flex justify-between items-center mb-4">
            <h1 class="text-2xl font-bold">Profiles</h1>
            <Button label="New Profile" icon="pi pi-plus" @click="newProfile" />
        </div>

        <DataTable :value="profiles" responsiveLayout="scroll">
            <Column field="name" header="Name"></Column>
            <Column header="Tags">
                <template #body="slotProps">
                    <Chip
                        v-for="tag in slotProps.data.tags"
                        :key="tag"
                        :label="tag"
                        class="mr-2"
                    />
                </template>
            </Column>
            <Column header="Actions">
                <template #body="slotProps">
                    <Button
                        icon="pi pi-pencil"
                        class="p-button-rounded p-button-success mr-2"
                        @click="editProfile(slotProps.data.id)"
                        v-tooltip.top="'Edit Profile'"
                    />
                    <Button
                        icon="pi pi-copy"
                        class="p-button-rounded p-button-info mr-2"
                        @click="copyUrl(slotProps.data.id)"
                        v-tooltip.top="'Copy SingBox URL'"
                    />
                    <Button
                        icon="pi pi-clone"
                        class="p-button-rounded p-button-secondary mr-2"
                        @click="duplicateProfile(slotProps.data.id)"
                        v-tooltip.top="'Duplicate Profile'"
                    />
                    <Button
                        icon="pi pi-trash"
                        class="p-button-rounded p-button-danger"
                        @click="deleteProfile(slotProps.data.id)"
                        v-tooltip.top="'Delete Profile'"
                    />
                </template>
            </Column>
        </DataTable>
    </div>
</template>
