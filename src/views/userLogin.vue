<template>
    <div class="login-view">
        <Card class="login-card">
            <template #title>Login</template>
            <template #content>
                <form @submit.prevent="handleLogin">
                    <div class="field">
                        <label for="password">Password</label>
                        <Password
                            id="password"
                            v-model="password"
                            required
                            autofocus
                            :feedback="false"
                            toggleMask
                        />
                    </div>
                    <Button type="submit" label="Login" :loading="loading" />
                </form>
            </template>
        </Card>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import Card from "primevue/card";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import Button from "primevue/button";
import { useUserStore } from "@/stores/user";

const router = useRouter();
const toast = useToast();
const userStore = useUserStore();

const password = ref("");
const loading = ref(false);

const handleLogin = async () => {
    loading.value = true;
    try {
        const response = await fetch("/api/user/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ password: password.value }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Login failed");
        }

        const token = response.headers.get("Authorization");
        if (token && token.startsWith("Bearer ")) {
            userStore.setToken(token.replace("Bearer ", ""));
            router.push("/profiles");
        } else {
            throw new Error("No token received");
        }
    } catch (error) {
        toast.add({
            severity: "error",
            summary: "Login Failed",
            detail:
                error instanceof Error ? error.message : "An error occurred",
            life: 5000,
        });
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped>
.login-view {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
}

.login-card {
    width: 100%;
    max-width: 400px;
}

.field {
    margin-bottom: 1rem;
}

.field label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
}
</style>
