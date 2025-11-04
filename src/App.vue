<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
</script>

<template>
    <div id="app">
        <main class="main-content">
            <router-view />
        </main>
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
