<template>
    <div class="profile-editor">
        <Fieldset legend="Basic">
            <div class="p-field">
                <label for="tags" class="mr-4">Tags</label>
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
                    <DnsEditor
                        v-model="model.dns"
                        :inbound-tags="inboundTags"
                        :outbound-tags="outboundTags"
                    />
                </TabPanel>
                <TabPanel value="route">
                    <RouteEditor
                        v-model="model.route"
                        :outbound-tags="outboundTags"
                        :inbound-tags="inboundTags"
                        :dns-server-tags="dnsServerTags"
                    />
                </TabPanel>
                <TabPanel value="inbounds">
                    <InboundsEditor v-model="model.inbounds" />
                </TabPanel>
                <TabPanel value="outbounds">
                    <OutboundsEditor
                        v-model="model.outbounds"
                        :outbound-tags="outboundTags"
                    />
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
import { ref, computed } from "vue";
import type { CreateProfile } from "~/schemas/profile";

const model = defineModel("modelValue", {
    type: Object as () => CreateProfile,
    required: true,
});

const suggestions = ref<string[]>([]);

// Computed property to extract outbound tags from profile outbounds
const outboundTags = computed(() => {
    return (model.value.outbounds || [])
        .map((outbound) => outbound.tag)
        .filter((tag): tag is string => !!tag);
});

// Computed property to extract inbound tags from profile inbounds
const inboundTags = computed(() => {
    return (model.value.inbounds || [])
        .map((inbound) => inbound.tag)
        .filter((tag): tag is string => !!tag);
});

// Computed property to extract DNS server tags from profile dns servers
const dnsServerTags = computed(() => {
    return (model.value.dns?.servers || [])
        .map((server) => server.tag)
        .filter((tag): tag is string => !!tag);
});
</script>

<style scoped>
/* Add styles if needed */
</style>
