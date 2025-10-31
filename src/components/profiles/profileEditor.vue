<script setup lang="ts">
import {
    CreateProfileSchema,
    type CreateProfile,
} from "../../../schemas/profile";
import type { SingBoxOutbound, SingBoxProfile } from "../../../schemas/singbox";
import type { SingBoxRuleSet } from "../../../schemas/route";
import { getOutboundNickname } from "../../../schemas/outbound";
import { useOutboundStore } from "@/stores/outbound";
import { useRuleSetStore } from "@/stores/ruleset";
import InboundsEditor from "./inboundsEditor.vue";
import OutboundsEditor from "./outboundsEditor.vue";
import DnsEditor from "./dnsEditor.vue";
import RouteEditor from "./routeEditor.vue";
import Button from "primevue/button";
import Panel from "primevue/panel";
import InputText from "primevue/inputtext";
import Chips from "primevue/chips";
import Drawer from "primevue/drawer";
import JSONEditor from "@/components/common/JSONEditor.vue";
import { provide, computed, ref } from "vue";
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
const outboundStore = useOutboundStore();
const ruleSetStore = useRuleSetStore();

// Preview drawer state
const previewVisible = ref(false);

// Provide profileOutbounds to child components with type and nickname information
const profileOutbounds = computed<
    Array<{
        type: "common" | "special";
        tag: string;
        nickname?: string;
        outbound: SingBoxOutbound;
    }>
>(() => {
    const outbounds = props.modelValue.outbounds || [];
    return outbounds.map((outbound) => {
        const outboundId = parseInt(outbound.tag);
        const isCommon = !isNaN(outboundId);

        let nickname: string | undefined;
        if (isCommon) {
            const commonOutbound = outboundStore.outbounds.find(
                (o) => o.id === outboundId,
            );
            if (commonOutbound) {
                nickname = getOutboundNickname(commonOutbound);
            }
        }

        return {
            type: isCommon ? "common" : "special",
            tag: outbound.tag,
            nickname,
            outbound,
        };
    });
});
provide("profileOutbounds", profileOutbounds);

// Provide profileRuleSets to child components with tag (RuleSet id as string) and name
const profileRuleSets = computed<Array<{ tag: string; name: string }>>(() => {
    const ruleSets = props.modelValue.route?.rule_set || [];
    return ruleSets.map((singBoxRuleSet) => {
        const ruleSetId = parseInt(singBoxRuleSet.tag);
        const ruleSet = ruleSetStore.ruleSets.find((rs) => rs.id === ruleSetId);
        return {
            tag: singBoxRuleSet.tag,
            name: ruleSet?.name || singBoxRuleSet.tag, // fallback to tag if name not found
        };
    });
});
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

const onPreview = () => {
    previewVisible.value = true;
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

        <!-- Floating Preview Button -->
        <div class="fixed bottom-12 right-6 z-50">
            <Button
                v-tooltip.left="'Preview SingBox JSON'"
                icon="pi pi-eye"
                severity="info"
                rounded
                size="large"
                @click="onPreview"
                class="shadow-lg"
                aria-label="Preview Profile"
            />
        </div>

        <!-- Preview Drawer -->
        <Drawer
            v-model:visible="previewVisible"
            header="SingBox Profile Preview"
            position="right"
            class="!w-full md:!w-[600px] lg:!w-[800px]"
        >
            <div class="flex flex-col gap-3">
                <p class="text-surface-600 dark:text-surface-400">
                    This is how your profile will look in SingBox JSON format.
                </p>
                <pre>{{ JSON.stringify(modelValue, null, 2) }}</pre>
            </div>
        </Drawer>
    </div>
</template>
