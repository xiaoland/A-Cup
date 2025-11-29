import { defineStore } from "pinia";
import { ref } from "vue";
import type {
  Profile,
  CreateProfile,
  UpdateProfile,
} from "../../schemas/profile";
import { useUserStore } from "./user";

const DRAFT_KEY_NEW = "profile-draft-new";
const DRAFT_KEY_EDIT_PREFIX = "profile-draft-edit-";

export const useProfileStore = defineStore("profile", () => {
  const profiles = ref<Profile[]>([]);
  const currentProfile = ref<Profile | null>(null);
  const userStore = useUserStore();

  async function fetchProfiles() {
    profiles.value =
      await userStore.authorizedRequest<Profile[]>("/api/profiles");
  }

  async function getProfile(id: string) {
    currentProfile.value = await userStore.authorizedRequest<Profile>(
      `/api/profiles/${id}`,
    );
    return currentProfile.value;
  }

  async function getProfileForEdit(id: string) {
    return await userStore.authorizedRequest<CreateProfile>(
      `/api/profiles/${id}?mode=edit`,
    );
  }

  async function deleteProfile(id: string) {
    await userStore.authorizedRequest(`/api/profiles/${id}`, {
      method: "DELETE",
    });
    await fetchProfiles();
  }

  async function createProfile(profile: CreateProfile) {
    await userStore.authorizedRequest("/api/profiles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profile),
    });
    await fetchProfiles();
  }

  async function updateProfile(id: string, profile: UpdateProfile) {
    await userStore.authorizedRequest(`/api/profiles/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profile),
    });
    await fetchProfiles();
  }

  async function duplicateProfile(id: string) {
    const profileToDuplicate = await getProfileForEdit(id);

    // Create a copy of the profile
    const duplicatedProfile: CreateProfile = {
      ...profileToDuplicate,
    };

    await userStore.authorizedRequest("/api/profiles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(duplicatedProfile),
    });
    await fetchProfiles();
  }

  function saveDraft(key: string, data: CreateProfile) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  function loadDraft(key: string): CreateProfile | null {
    const item = localStorage.getItem(key);
    if (item) {
      try {
        return JSON.parse(item);
      } catch {
        return null;
      }
    }
    return null;
  }

  function clearDraft(key: string) {
    localStorage.removeItem(key);
  }

  function getDraftKeyForNew(): string {
    return DRAFT_KEY_NEW;
  }

  function getDraftKeyForEdit(id: string): string {
    return `${DRAFT_KEY_EDIT_PREFIX}${id}`;
  }

  return {
    profiles,
    currentProfile,
    fetchProfiles,
    getProfile,
    getProfileForEdit,
    deleteProfile,
    createProfile,
    updateProfile,
    duplicateProfile,
    saveDraft,
    loadDraft,
    clearDraft,
    getDraftKeyForNew,
    getDraftKeyForEdit,
  };
});
