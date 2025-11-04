<script setup lang="ts">
import { computed, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { useToast } from "primevue/usetoast";
import Toast from "primevue/toast";

const route = useRoute();
const toast = useToast();

let handleKeydown: (event: KeyboardEvent) => void;

onMounted(() => {
    handleKeydown = (event: KeyboardEvent) => {
        if (event.ctrlKey && event.key === "s") {
            event.preventDefault();
            toast.add({
                severity: "info",
                summary: "Auto-Saved",
                detail: "Your changes are already auto-saved.",
                life: 3000,
            });
        }
    };
    window.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
    window.removeEventListener("keydown", handleKeydown);
});
</script>

<template>
    <div id="app">
        <main class="main-content">
            <router-view />
        </main>
        <Toast />
    </div>
</template>

<style>
body {
    font-family:
        system-ui,
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        Roboto,
        "Helvetica Neue",
        Arial,
        sans-serif;
    margin: 0;
    padding: 0;
    background: var(--surface-ground);
}

#app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.main-content {
    flex: 1;
    padding: 1rem;
}
</style>
