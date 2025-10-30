<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useOutboundStore } from "../stores/outbound";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import type { Outbound } from "../../schemas/outbound";

const outboundStore = useOutboundStore();
const router = useRouter();
const selectedOutbounds = ref<Outbound[]>([]);

onMounted(() => {
    outboundStore.fetchOutbounds();
});

function newOutbound() {
    router.push("/outbounds/new");
}

function editOutbound(outbound: Outbound) {
    router.push(`/outbounds/edit/${outbound.id}`);
}

async function deleteOutbound(outbound: Outbound) {
    if (outbound.id) {
        await outboundStore.deleteOutbound(outbound.id);
    }
}

async function deleteSelectedOutbounds() {
    const promises = selectedOutbounds.value.map((ob) => {
        if (ob.id) {
            return outboundStore.deleteOutbound(ob.id);
        }
    });
    await Promise.all(promises);
    selectedOutbounds.value = [];
}
</script>

<template>
    <div class="p-4">
        <div class="flex justify-between items-center mb-4">
            <h1 class="text-2xl font-bold">Outbounds</h1>
            <div>
                <Button
                    label="Delete Selected"
                    icon="pi pi-trash"
                    @click="deleteSelectedOutbounds"
                    :disabled="selectedOutbounds.length === 0"
                    class="mr-2 p-button-danger"
                />
                <Button
                    label="New Outbound"
                    icon="pi pi-plus"
                    @click="newOutbound"
                />
            </div>
        </div>

        <DataTable
            :value="outboundStore.outbounds"
            v-model:selection="selectedOutbounds"
            dataKey="id"
        >
            <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
            <Column field="name" header="Name"></Column>
            <Column field="type" header="Type"></Column>
            <Column field="server" header="Server"></Column>
            <Column field="server_port" header="Port"></Column>
            <Column field="provider" header="Provider"></Column>
            <Column field="region" header="Region"></Column>
            <Column header="Actions">
                <template #body="slotProps">
                    <Button
                        icon="pi pi-pencil"
                        class="p-button-rounded p-button-success mr-2"
                        @click="editOutbound(slotProps.data)"
                    />
                    <Button
                        icon="pi pi-trash"
                        class="p-button-rounded p-button-danger"
                        @click="deleteOutbound(slotProps.data)"
                    />
                </template>
            </Column>
        </DataTable>
    </div>
</template>
