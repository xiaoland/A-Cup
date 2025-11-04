<template>
  <div class="profile-editor">
    <Fieldset legend="Basic">
      <div class="p-field">
        <label for="tags">Tags</label>
        <AutoComplete v-model="model.tags" :multiple="true" :typeahead="false" :suggestions="suggestions" id="tags" />
      </div>
    </Fieldset>
    <Tabs value="log">
      <TabList>
        <Tab value="log">Log</Tab>
        <Tab value="dns">DNS</Tab>
        <Tab value="route">Route</Tab>
        <Tab value="inbounds">Inbounds</Tab>
        <Tab value="outbounds">Outbounds</Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="log">
          <MonacoEditor
            :options="{ language: 'json', automaticLayout: true }"
            :value="logJson"
            @change="(value) => model.log = JSON.parse(value)"
            height="400px"
          />
        </TabPanel>
        <TabPanel value="dns">
          <MonacoEditor
            :options="{ language: 'json', automaticLayout: true }"
            :value="dnsJson"
            @change="(value) => model.dns = JSON.parse(value)"
            height="400px"
          />
        </TabPanel>
        <TabPanel value="route">
          <MonacoEditor
            :options="{ language: 'json', automaticLayout: true }"
            :value="routeJson"
            @change="(value) => model.route = JSON.parse(value)"
            height="400px"
          />
        </TabPanel>
        <TabPanel value="inbounds">
          <MonacoEditor
            :options="{ language: 'json', automaticLayout: true }"
            :value="inboundsJson"
            @change="(value) => model.inbounds = JSON.parse(value)"
            height="400px"
          />
        </TabPanel>
        <TabPanel value="outbounds">
          <MonacoEditor
            :options="{ language: 'json', automaticLayout: true }"
            :value="outboundsJson"
            @change="(value) => model.outbounds = JSON.parse(value)"
            height="400px"
          />
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>

<script setup lang="ts">
import Fieldset from 'primevue/fieldset';
import AutoComplete from 'primevue/autocomplete';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import MonacoEditor from '@guolao/vue-monaco-editor';
import { ref, computed } from 'vue';
import type { CreateProfile } from '~/schemas/profile';

const model = defineModel('modelValue', {
  type: Object as () => CreateProfile,
  required: true,
});

const suggestions = ref<string[]>([]);

// Computed properties for JSON strings
const logJson = computed(() => JSON.stringify(model.value.log || {}, null, 2));
const dnsJson = computed(() => JSON.stringify(model.value.dns, null, 2));
const routeJson = computed(() => JSON.stringify(model.value.route, null, 2));
const inboundsJson = computed(() => JSON.stringify(model.value.inbounds, null, 2));
const outboundsJson = computed(() => JSON.stringify(model.value.outbounds, null, 2));
</script>

<style scoped>
/* Add styles if needed */
</style>
