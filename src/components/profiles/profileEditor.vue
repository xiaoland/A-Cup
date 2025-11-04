<template>
    <div class="profile-editor">
        <Fieldset legend="Basic">
            <div class="p-field">
                <label for="tags">Tags</label>
                <AutoComplete
                    v-model="model.tags"
                    :multiple="true"
                    :typeahead="false"
                    :suggestions="suggestions"
                    id="tags"
                />
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
                    <LogEditor v-model="model.log" />
                </TabPanel>
                <TabPanel value="dns">
                    <DnsEditor v-model="model.dns" />
                </TabPanel>
                <TabPanel value="route">
                    <RouteEditor v-model="model.route" />
                </TabPanel>
                <TabPanel value="inbounds">
                    <InboundsEditor v-model="model.inbounds" />
                </TabPanel>
                <TabPanel value="outbounds">
                    <OutboundsEditor v-model="model.outbounds" />
                </TabPanel>
            </TabPanels>
        </Tabs>
    </div>
</template>

<script setup lang="ts">
import Fieldset from "primevue/fieldset";
import AutoComplete from "primevue/autocomplete";
import Tabs from "primevue/tabs";
import TabList from "primevue/tablist";
import Tab from "primevue/tab";
import TabPanels from "primevue/tabpanels";
import TabPanel from "primevue/tabpanel";
import LogEditor from "../log/LogEditor.vue";
import DnsEditor from "../dns/DnsEditor.vue";
import RouteEditor from "../route/RouteEditor.vue";
import InboundsEditor from "../inbounds/InboundsEditor.vue";
import OutboundsEditor from "../outbounds/OutboundsEditor.vue";
import { ref } from "vue";
import type { CreateProfile } from "~/schemas/profile";

const model = defineModel("modelValue", {
    type: Object as () => CreateProfile,
    required: true,
});

const suggestions = ref<string[]>([]);
</script>

<style scoped>
/* Add styles if needed */
</style>
