<script setup lang="ts">
import { ref, watch } from "vue";
import { z } from "zod";
import { ShadowsocksCredentialSchema } from "../../../../schemas/outbound";
import InputText from "primevue/inputtext";

const props = defineProps<{
    modelValue: z.infer<typeof ShadowsocksCredentialSchema>;
}>();

const emit = defineEmits(["update:modelValue"]);

const credential = ref(props.modelValue);

watch(
    () => props.modelValue,
    (newValue) => {
        credential.value = newValue;
    },
    { deep: true },
);

watch(
    credential,
    (newValue) => {
        emit("update:modelValue", newValue);
    },
    { deep: true },
);
</script>

<template>
    <div>
        <div class="grid grid-cols-2 gap-4">
            <div>
                <label for="method">Method</label>
                <InputText
                    id="method"
                    v-model="credential.method"
                    class="w-full"
                    placeholder="e.g., aes-128-gcm"
                />
            </div>
            <div>
                <label for="password">Password</label>
                <InputText
                    id="password"
                    v-model="credential.password"
                    class="w-full"
                    type="password"
                />
            </div>
        </div>
    </div>
</template>
