<script setup lang="ts">
import { computed } from "vue";
import type { DNSRule } from "../../../schemas/dns";
import Select from "primevue/select";
import InputText from "primevue/inputtext";
import InputChips from "primevue/inputchips";
import ToggleSwitch from "primevue/toggleswitch";
import Fieldset from "primevue/fieldset";
import RuleConditionsEditor from "@/components/common/RuleConditionsEditor.vue";

const props = defineProps<{
    modelValue: DNSRule;
}>();

const emit = defineEmits(["update:modelValue"]);

const rule = computed({
    get: () => props.modelValue,
    set: (value) => emit("update:modelValue", value),
});

const actionTypes = [
    { label: "Route", value: "route" },
    { label: "Route Options", value: "route-options" },
    { label: "Reject", value: "reject" },
    { label: "Predefined", value: "predefined" },
];

const networkTypes = [
    { label: "TCP", value: "tcp" },
    { label: "UDP", value: "udp" },
];

const rejectMethods = [
    { label: "Default", value: "default" },
    { label: "Drop", value: "drop" },
];

const onActionChange = (
    newAction: "route" | "route-options" | "reject" | "predefined",
) => {
    const {
        domain,
        domain_suffix,
        domain_keyword,
        domain_regex,
        source_ip_cidr,
        network,
    } = rule.value;
    const newRule: Partial<DNSRule> = {
        domain,
        domain_suffix,
        domain_keyword,
        domain_regex,
        source_ip_cidr,
        network,
        action: newAction,
    };
    rule.value = newRule as DNSRule;
};

// Computed property for conditions
const conditions = computed({
    get: () => {
        const {
            domain,
            domain_suffix,
            domain_keyword,
            domain_regex,
            source_ip_cidr,
            network,
        } = rule.value;
        return {
            domain,
            domain_suffix,
            domain_keyword,
            domain_regex,
            source_ip_cidr,
            network,
        };
    },
    set: (value) => {
        rule.value = { ...rule.value, ...value };
    },
});
</script>

<template>
    <div class="dns-rule-editor">
        <Fieldset legend="Rule Conditions" :toggleable="true">
            <RuleConditionsEditor v-model="conditions" />
        </Fieldset>

        <Fieldset legend="Rule Action" :toggleable="true" class="mt-3">
            <div class="formgrid grid">
                <div class="field col-12">
                    <label for="action">Action Type</label>
                    <Select
                        id="action"
                        :modelValue="rule.action"
                        :options="actionTypes"
                        optionLabel="label"
                        optionValue="value"
                        @update:modelValue="onActionChange"
                        placeholder="Select an Action"
                        class="w-full"
                    />
                </div>

                <!-- Route Action -->
                <template v-if="rule.action === 'route'">
                    <div class="field col-12 md:col-8">
                        <label for="route-server">Server</label>
                        <InputText
                            id="route-server"
                            v-model="rule.server"
                            placeholder="DNS server tag"
                            class="w-full"
                        />
                    </div>

                    <div class="field col-12 md:col-4 flex align-items-center">
                        <div class="field-checkbox">
                            <ToggleSwitch
                                inputId="route-disable_cache"
                                v-model="rule.disable_cache"
                            />
                            <label for="route-disable_cache" class="ml-2"
                                >Disable Cache</label
                            >
                        </div>
                    </div>
                </template>

                <!-- Route Options Action -->
                <template v-if="rule.action === 'route-options'">
                    <div class="field col-12">
                        <div class="field-checkbox">
                            <ToggleSwitch
                                inputId="ro-disable_cache"
                                v-model="rule.disable_cache"
                            />
                            <label for="ro-disable_cache" class="ml-2"
                                >Disable Cache</label
                            >
                        </div>
                    </div>
                </template>

                <!-- Reject Action -->
                <template v-if="rule.action === 'reject'">
                    <div class="field col-12 md:col-6">
                        <label for="reject-method">Reject Method</label>
                        <Select
                            id="reject-method"
                            v-model="rule.method"
                            :options="rejectMethods"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Select reject method"
                            class="w-full"
                        />
                    </div>
                </template>

                <!-- Predefined Action -->
                <template v-if="rule.action === 'predefined'">
                    <div class="field col-12">
                        <label for="pre-answer">Answer (IP addresses)</label>
                        <InputChips
                            id="pre-answer"
                            v-model="rule.answer"
                            placeholder="Add IP addresses"
                            class="w-full"
                        />
                    </div>
                </template>
            </div>
        </Fieldset>
    </div>
</template>
