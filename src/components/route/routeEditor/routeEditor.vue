<template>
  <Editor
    v-model="localValue"
    title="Route Configuration"
    :start-editable="startEditable"
    @save="handleSave"
    @cancel="handleCancel"
  >
    <!-- Form view -->
    <template #default>
      <v-row>
        <!-- Final outbound -->
        <v-col cols="12">
          <v-text-field
            v-model="localValue.final"
            label="Final Outbound"
            variant="outlined"
            hint="Default outbound for unmatched traffic"
          />
        </v-col>

        <!-- Rules section -->
        <v-col cols="12">
          <div class="d-flex align-center justify-space-between mb-2">
            <h3 class="text-h6">Rules</h3>
            <v-btn color="primary" variant="outlined" prepend-icon="mdi-plus" @click="addRule">
              Add Rule
            </v-btn>
          </div>

          <div
            v-if="!localValue.rules || localValue.rules.length === 0"
            class="text-center text-medium-emphasis py-4"
          >
            No rules defined. Click "Add Rule" to create one.
          </div>

          <RouteRuleEditor
            v-for="(rule, index) in localValue.rules || []"
            :key="index"
            v-model="localValue.rules![index]"
            :show-delete="true"
            @delete="removeRule(index)"
          />
        </v-col>

        <!-- Advanced section -->
        <v-col cols="12">
          <v-expansion-panels variant="accordion">
            <v-expansion-panel>
              <v-expansion-panel-title>Advanced Settings</v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="localValue.auto_detect_interface"
                      label="Auto Detect Interface"
                      variant="outlined"
                      type="boolean"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="localValue.override_android_vpn"
                      label="Override Android VPN"
                      variant="outlined"
                      type="boolean"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="localValue.default_interface"
                      label="Default Interface"
                      variant="outlined"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="localValue.default_mark"
                      label="Default Mark"
                      variant="outlined"
                      type="number"
                    />
                  </v-col>
                </v-row>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-col>
      </v-row>
    </template>

    <!-- Readonly view -->
    <template #readonly>
      <pre class="readonly-json">{{ pretty(localValue) }}</pre>
    </template>
  </Editor>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import Editor from '@/components/common/Editor.vue';
import RouteRuleEditor from '@/components/route/routeRuleEditor/routeRuleEditor.vue';
import type { RouteRule } from '@/components/route/routeRuleEditor/routeRuleEditor';

interface Route {
  final?: string;
  rules?: RouteRule[];
  auto_detect_interface?: boolean;
  override_android_vpn?: boolean;
  default_interface?: string;
  default_mark?: number;
  [key: string]: any;
}

interface Props {
  modelValue?: Route;
  startEditable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({}),
  startEditable: false,
});

const emit = defineEmits<{
  (e: 'update:modelValue', v: Route): void;
  (e: 'save', v: Route): void;
  (e: 'cancel'): void;
}>();

const localValue = ref<Route>({ ...props.modelValue });

watch(
  () => props.modelValue,
  (newVal) => {
    localValue.value = { ...newVal };
  },
  { deep: true }
);

const addRule = () => {
  if (!localValue.value.rules) {
    localValue.value.rules = [];
  }
  localValue.value.rules.push({});
};

const removeRule = (index: number) => {
  if (localValue.value.rules) {
    localValue.value.rules.splice(index, 1);
  }
};

const handleSave = () => {
  emit('update:modelValue', localValue.value);
  emit('save', localValue.value);
};

const handleCancel = () => {
  localValue.value = { ...props.modelValue };
  emit('cancel');
};

const pretty = (obj: any) => JSON.stringify(obj, null, 2);
</script>

<style scoped></style>
