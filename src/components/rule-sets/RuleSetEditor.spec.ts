import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import RuleSetEditor from './RuleSetEditor.vue';
import PrimeVue from 'primevue/config';

// Mock the UsersPicker and ImportRuleSet components
vi.mock('../user/usersPicker.vue', () => ({
  default: {
    template: '<div class="users-picker-mock"></div>',
    props: ['modelValue'],
  },
}));
vi.mock('./importRuleSet.vue', () => ({
  default: {
    template: '<div class="import-rule-set-mock"></div>',
    props: ['visible'],
  },
}));

describe('RuleSetEditor.vue', () => {
  const mockRuleSet = {
    id: 1,
    tag: 'test-rule',
    type: 'remote' as const,
    format: 'source',
    content: 'http://example.com/rules.txt',
    readableBy: [],
    writeableBy: [],
  };

  const mountComponent = () => mount(RuleSetEditor, {
    props: {
      modelValue: mockRuleSet,
    },
    global: {
      plugins: [PrimeVue, createTestingPinia()],
    },
  });

  it('renders the form with the correct initial values', () => {
    const wrapper = mountComponent();
    const tagInput = wrapper.find('#tag');
    expect((tagInput.element as HTMLInputElement).value).toBe('test-rule');
    expect(wrapper.vm.localRuleSet.type).toBe('remote');
  });

  it('emits a save event with the updated data when the save button is clicked', async () => {
    const wrapper = mountComponent();
    await wrapper.find('#tag').setValue('updated-rule');
    await wrapper.find('button[aria-label="Save"]').trigger('click');

    expect(wrapper.emitted('save')).toHaveLength(1);
    const savedEvent = wrapper.emitted('save')?.[0]?.[0] as any;
    expect(savedEvent.tag).toBe('updated-rule');
  });

  it('emits a cancel event when the cancel button is clicked', async () => {
    const wrapper = mountComponent();
    await wrapper.find('button[aria-label="Cancel"]').trigger('click');
    expect(wrapper.emitted('cancel')).toHaveLength(1);
  });

  it('updates the local rule set when the import component emits a parsed event', async () => {
    const wrapper = mountComponent();
    const importedRuleSet = {
      tag: 'imported-rule',
      type: 'inline' as const,
      content: '[]',
    };

    // Directly call the method that would be triggered by the event
    wrapper.vm.onParsed(importedRuleSet);
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.localRuleSet.tag).toBe('imported-rule');
    expect(wrapper.vm.localRuleSet.type).toBe('inline');
  });
});
