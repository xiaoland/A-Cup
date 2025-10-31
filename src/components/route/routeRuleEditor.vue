<script setup lang="ts">
import { computed } from "vue";
import type { RouteRule } from "../../../schemas/route";
import Select from "primevue/select";
import Fieldset from "primevue/fieldset";
import SingBoxOutboundPicker from "@/components/outbounds/singBoxOutboundPicker.vue";
import RuleConditionsEditor from "@/components/common/RuleConditionsEditor.vue";
import InputText from "primevue/inputtext";

const props = defineProps<{
    modelValue: RouteRule;
}>();

const emit = defineEmits(["update:modelValue"]);

const rule = computed({
    get: () => props.modelValue,
    set: (value) => emit("update:modelValue", value),
});

const actionTypes = [
    { label: "Route", value: "route" },
    { label: "Reject", value: "reject" },
    { label: "Hijack DNS", value: "hijack-dns" },
];

const onActionChange = (newAction: "route" | "reject" | "hijack-dns") => {
    // Preserve existing fields while changing the action
    const newRule = { ...rule.value, action: newAction };

    // Clear action-specific fields that are no longer relevant
    if (newAction !== "route") {
        delete newRule.outbound;
    }
    if (newAction !== "hijack-dns") {
        delete newRule.server;
    }

    rule.value = newRule as RouteRule;
};
</script>

<template>
    <div class="route-rule-editor">
        <Fieldset legend="Rule Conditions" :toggleable="true">
            <RuleConditionsEditor v-model="rule" />
        </Fieldset>

        <Fieldset legend="Rule Action" :toggleable="true" class="mt-3">
            <div class="formgrid grid">
                <div class="field col-12">
                    <label for="action">Action Type</label>
                    <Select
                        id="action"
                        :modelValue="rule.action"
                        @update:modelValue="onActionChange"
                        :options="actionTypes"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Select an action"
                        class="w-full"
                    />
                </div>

                <!-- Route Action -->
                <template v-if="rule.action === 'route'">
                    <div class="field col-12">
                        <label for="outbound">Outbound</label>
                        <SingBoxOutboundPicker
                            id="outbound"
                            v-model="rule.outbound"
                        />
                    </div>
                </template>

                <!-- Hijack DNS Action -->
                <template v-if="rule.action === 'hijack-dns'">
                    <div class="field col-12">
                        <label for="server">DNS Server</label>
                        <InputText
                            id="server"
                            v-model="rule.server"
                            class="w-full"
                            placeholder="DNS server tag"
                        />
                    </div>
                </template>
            </div>
        </Fieldset>
    </div>
</template>
