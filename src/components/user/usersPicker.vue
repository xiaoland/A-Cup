<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useUserStore } from '@/stores/user';
import MultiSelect from 'primevue/multiselect';

const props = defineProps<{
  modelValue: string[];
}>();

const emit = defineEmits(['update:modelValue']);

const users = ref([]);
const userStore = useUserStore();

onMounted(async () => {
  users.value = await userStore.authorizedRequest('/api/users');
});

const selectedUsers = ref(props.modelValue);

watch(selectedUsers, (newValue) => {
  emit('update:modelValue', newValue);
});
</script>

<template>
  <MultiSelect v-model="selectedUsers" :options="users" optionLabel="username" optionValue="id" placeholder="Select Users" class="w-full" />
</template>
