<template>
  <v-card variant="outlined" class="mb-4">
    <v-card-text>
      <v-row>
        <!-- Action and Outbound fields at top -->
        <v-col cols="12" md="6">
          <v-select
            v-model="rule.action"
            :items="actionOptions"
            item-title="title"
            item-value="value"
            label="Action"
            variant="outlined"
            clearable
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="rule.outbound"
            label="Outbound"
            variant="outlined"
            clearable
            hint="Outbound tag (e.g., out.vmess.hk.node1)"
          />
        </v-col>

        <!-- Domain fields -->
        <v-col cols="12">
          <v-combobox
            v-model="rule.domain"
            label="Domain"
            variant="outlined"
            multiple
            chips
            clearable
            hint="Exact domain matches"
          />
        </v-col>
        <v-col cols="12">
          <v-combobox
            v-model="rule.domain_suffix"
            label="Domain Suffix"
            variant="outlined"
            multiple
            chips
            clearable
            hint="Domain suffix matches (e.g., .com, .google.com)"
          />
        </v-col>
        <v-col cols="12">
          <v-combobox
            v-model="rule.domain_keyword"
            label="Domain Keyword"
            variant="outlined"
            multiple
            chips
            clearable
            hint="Domain keyword matches"
          />
        </v-col>
        <v-col cols="12">
          <v-combobox
            v-model="rule.domain_regex"
            label="Domain Regex"
            variant="outlined"
            multiple
            chips
            clearable
            hint="Regular expression patterns"
          />
        </v-col>

        <!-- Rule Set field -->
        <v-col cols="12">
          <v-combobox
            v-model="rule.rule_set"
            label="Rule Set"
            variant="outlined"
            multiple
            chips
            clearable
            hint="Rule set tags"
          />
        </v-col>
      </v-row>

      <v-divider class="my-4" />

      <div class="d-flex justify-end">
        <v-btn v-if="showDelete" color="error" variant="text" @click="emit('delete')">
          Delete Rule
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { RouteRule } from './routeRuleEditor';
import { actionOptions } from './routeRuleEditor';

interface Props {
  modelValue: RouteRule;
  showDelete?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showDelete: false,
});

const emit = defineEmits<{
  (e: 'update:modelValue', v: RouteRule): void;
  (e: 'delete'): void;
}>();

const rule = computed({
  get: () => props.modelValue,
  set: (v: RouteRule) => emit('update:modelValue', v),
});
</script>

<style scoped lang="scss" src="./routeRuleEditor.scss"></style>
