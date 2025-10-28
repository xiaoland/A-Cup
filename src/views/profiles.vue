<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Profile } from '../../schemas/profile';
import { useProfileStore } from '../stores/profile';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Chip from 'primevue/chip';
import { useRouter } from 'vue-router';

const router = useRouter();
const profileStore = useProfileStore();
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

const newProfile = () => {
  router.push('/profiles/new');
};
</script>

<template>
  <div class="card">
    <DataTable :value="profiles" responsiveLayout="scroll">
      <template #header>
        <div class="flex justify-between">
          <h2 class="text-2xl">Profiles</h2>
          <Button label="New Profile" icon="pi pi-plus" @click="newProfile" />
        </div>
      </template>
      <Column field="name" header="Name"></Column>
      <Column header="Tags">
        <template #body="slotProps">
          <Chip v-for="tag in slotProps.data.tags" :key="tag" :label="tag" class="mr-2" />
        </template>
      </Column>
      <Column header="Actions">
        <template #body="slotProps">
          <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2" @click="editProfile(slotProps.data.id)" />
          <Button icon="pi pi-trash" class="p-button-rounded p-button-danger" @click="deleteProfile(slotProps.data.id)" />
        </template>
      </Column>
    </DataTable>
  </div>
</template>
