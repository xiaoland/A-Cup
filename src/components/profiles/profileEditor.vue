<script setup lang="ts">
import {
    CreateProfileSchema,
    type CreateProfile,
} from "../../../schemas/profile";
import type { SingBoxOutbound } from "../../../schemas/singbox";
import type { SingBoxRuleSet } from "../../../schemas/route";
import InboundsEditor from "./inboundsEditor.vue";
import OutboundsEditor from "./outboundsEditor.vue";
import DnsEditor from "./dnsEditor.vue";
import RouteEditor from "./routeEditor.vue";
import Button from "primevue/button";
import Panel from "primevue/panel";
import InputText from "primevue/inputtext";
import Chips from "primevue/chips";
import { provide, computed } from "vue";
import { useRouter } from "vue-router";
import { useProfileStore } from "@/stores/profile";

const props = defineProps<{
    modelValue: CreateProfile;
    profileId?: string;
    isNewProfile?: boolean;
}>();

const emit = defineEmits(["update:modelValue", "save", "cancel", "clearDraft"]);

const router = useRouter();
const profileStore = useProfileStore();

// Provide profileOutbounds to child components
const profileOutbounds = computed<SingBoxOutbound[]>(
    () => props.modelValue.outbounds || [],
);
provide("profileOutbounds", profileOutbounds);

// Provide profileRuleSets to child components
const profileRuleSets = computed<SingBoxRuleSet[]>(
    () => props.modelValue.route?.rule_set || [],
);
provide("profileRuleSets", profileRuleSets);

const onUpdateReferencedOutbounds = (value: number[]) => {
    props.modelValue.referencedOutbounds = value;
};

const onUpdateReferencedRuleSets = (value: number[]) => {
    props.modelValue.referencedRuleSets = value;
};

const onSave = async () => {
    // Validate with schema before saving
    try {
        const validated = CreateProfileSchema.parse(props.modelValue);

        if (props.isNewProfile) {
            await profileStore.createProfile(validated).then(() => {
                emit("clearDraft");
                emit("save");
            });
        } else if (props.profileId) {
            await profileStore
                .updateProfile(props.profileId, validated)
                .then(() => {
                    emit("clearDraft");
                    emit("save");
                });
        }
    } catch (error) {
        console.error("Profile validation error:", error);
        // You might want to show a toast/notification here
        throw error;
    }
};

const onCancel = () => {
    emit("cancel");
};

const onClearDraft = () => {
    emit("clearDraft");
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

        <Panel
            header="In JSON"
            :toggleable="true"
            :collapsed="true"
            class="mb-4"
        >
            <pre>{{ JSON.stringify(modelValue, null, 2) }}</pre>
        </Panel>

        <Panel header="Inbounds" :toggleable="true">
            <InboundsEditor v-model="modelValue.inbounds" />
        </Panel>

        <Panel header="Outbounds" :toggleable="true" class="mt-4">
            <OutboundsEditor
                v-model="modelValue.outbounds"
                @update:referencedOutbounds="onUpdateReferencedOutbounds"
            />
        </Panel>

        <Panel header="DNS" :toggleable="true" class="mt-4">
            <DnsEditor v-model="modelValue.dns" />
        </Panel>

        <Panel header="Route" :toggleable="true" class="mt-4">
            <RouteEditor
                v-model="modelValue.route"
                @update:referencedRuleSets="onUpdateReferencedRuleSets"
            />
        </Panel>

        <div class="flex flex-wrap gap-2 mt-4 justify-content-end">
            <Button
                v-if="isNewProfile"
                label="Clear Draft"
                icon="pi pi-trash"
                severity="danger"
                outlined
                @click="onClearDraft"
                class="mr-auto"
            />
            <Button
                label="Cancel"
                icon="pi pi-times"
                severity="secondary"
                @click="onCancel"
            />
            <Button label="Save" icon="pi pi-check" @click="onSave" />
        </div>
    </div>
</template>
