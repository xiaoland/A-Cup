<template>
  <v-card
    variant="outlined"
    class="profile-item"
  >
    <v-card-text>
      <div class="profile-header">
        <div>
          <div class="profile-title">{{ profile.name }}</div>
          <div class="text-caption text-medium-emphasis">
            ID: {{ profile.id }}
          </div>
        </div>
        <div class="profile-actions">
          <v-btn
            icon="mdi-export"
            size="small"
            variant="text"
            @click.stop="$emit('export', profile)"
          />
          <v-btn
            icon="mdi-pencil"
            size="small"
            variant="text"
            @click.stop="$emit('edit', profile.id)"
          />
          <v-menu>
            <template #activator="{ props: menuProps }">
              <v-btn
                icon="mdi-dots-vertical"
                size="small"
                variant="text"
                v-bind="menuProps"
                @click.stop
              />
            </template>
            <v-list>
              <v-list-item @click="$emit('duplicate', profile)">
                <template #prepend>
                  <v-icon>mdi-content-copy</v-icon>
                </template>
                <v-list-item-title>Duplicate</v-list-item-title>
              </v-list-item>
              <v-list-item @click="$emit('delete', profile)">
                <template #prepend>
                  <v-icon color="error">mdi-delete</v-icon>
                </template>
                <v-list-item-title>Delete</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </div>

      <!-- Tags -->
      <div v-if="profile.tags.length > 0" class="profile-tags">
        <v-chip
          v-for="tag in profile.tags"
          :key="tag"
          size="small"
          variant="outlined"
        >
          {{ tag }}
        </v-chip>
      </div>

      <!-- Component Statistics -->
      <div class="profile-components">
        <div class="component-info">
          <div class="component-label">Outbounds</div>
          <div class="component-count">{{ profile.outbounds.length }}</div>
        </div>
        <div class="component-info">
          <div class="component-label">Rule Sets</div>
          <div class="component-count">{{ profile.rule_sets.length }}</div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { Props, Emits } from './profileCard.ts';

defineProps<Props>();
defineEmits<Emits>();
</script>

<style scoped lang="scss" src="./profileCard.scss"></style>