<script setup lang="ts">
import { computed } from "vue";
import { DNSServerSchema, type DNSServer } from "../../../schemas/dns";
import { TLSClientFieldsSchema } from "../../../schemas/shared";
import DialFieldsEditor from "../common/DialFieldsEditor.vue";
import TLSClientFieldsEditor from "../common/TLSClientFieldsEditor.vue";
import InputText from "primevue/inputtext";
import Select from "primevue/select";

const props = defineProps<{
    modelValue: DNSServer;
}>();

const emit = defineEmits(["update:modelValue"]);

const server = computed({
    get: () => props.modelValue,
    set: (value) => emit("update:modelValue", value),
});

const serverTypes = [
    { label: "UDP", value: "udp" },
    { label: "TLS", value: "tls" },
    { label: "HTTPS", value: "https" },
];

const onTypeChange = (newType: "udp" | "tls" | "https") => {
    const tag = server.value.tag;

    // Use schema.parse() to get proper defaults and validation
    try {
        if (newType === "tls") {
            server.value = DNSServerSchema.parse({
                tag,
                type: "tls",
                address: "tls://8.8.8.8",
                tls: TLSClientFieldsSchema.parse({ enabled: true }),
            });
        } else if (newType === "https") {
            server.value = DNSServerSchema.parse({
                tag,
                type: "https",
                address: "https://dns.google/dns-query",
                tls: TLSClientFieldsSchema.parse({ enabled: true }),
            });
        } else {
            server.value = DNSServerSchema.parse({
                tag,
                type: "udp",
                address: "8.8.8.8",
            });
        }
    } catch (error) {
        console.error("Failed to parse DNS server configuration:", error);
    }
};
</script>

<template>
    <div class="flex flex-col gap-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label for="tag" class="block mb-2 font-medium">Tag</label>
                <InputText id="tag" v-model="server.tag" class="w-full" />
            </div>

            <div>
                <label for="type" class="block mb-2 font-medium"
                    >Server Type</label
                >
                <Select
                    id="type"
                    :model-value="server.type"
                    :options="serverTypes"
                    option-label="label"
                    option-value="value"
                    @update:model-value="onTypeChange"
                    placeholder="Select a Type"
                    class="w-full"
                />
            </div>
        </div>

        <div v-if="server.type">
            <label for="address" class="block mb-2 font-medium">Address</label>
            <InputText id="address" v-model="server.address" class="w-full" />
        </div>

        <template
            v-if="
                (server.type === 'tls' || server.type === 'https') && server.tls
            "
        >
            <TLSClientFieldsEditor v-model="server.tls" class="mt-3" />
        </template>

        <DialFieldsEditor v-model="server" class="mt-3" />
    </div>
</template>
