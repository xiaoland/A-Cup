<script setup lang="ts">
import { ref, watch } from "vue";
import { z } from "zod";
import { Hysteria2CredentialSchema } from "../../../../schemas/outbound";
import InputText from "primevue/inputtext";

const props = defineProps<{
    modelValue: z.infer<typeof Hysteria2CredentialSchema>;
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
                <label for="password">Password</label>
                <InputText
                    id="password"
                    v-model="credential.password"
                    class="w-full"
                    type="password"
                />
            </div>
            <div>
                <label for="obfs">OBFS</label>
                <InputText
                    id="obfs"
                    v-model="credential.obfs"
                    class="w-full"
                    placeholder="salamander"
                />
            </div>
            <div>
                <label for="obfs_password">OBFS Password</label>
                <InputText
                    id="obfs_password"
                    v-model="credential.obfs_password"
                    class="w-full"
                    type="password"
                />
            </div>
        </div>
    </div>
</template>
