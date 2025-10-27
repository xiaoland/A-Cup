import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import RuleSetEditor from './RuleSetEditor.vue';
import PrimeVue from 'primevue/config';

// Mock the UsersPicker component
vi.mock('../../user/usersPicker.vue', () => ({
  default: {
    template: '<div class="users-picker-mock"></div>',
    props: ['modelValue'],
  },
}));

describe('RuleSetEditor.vue', () => {
  const mockRuleSet = {
    id: 1,
    tag: 'test-rule',
    type: 'remote' as const,
    format: 'source',
    content: 'http://example.com/rules.txt',
    download_detour: 1,
    update_interval: 3600,
    readableBy: [],
    writeableBy: [],
  };

  const a = () => mount(RuleSetEditor, {
    props: {
      modelValue: mockRuleSet,
    },
    global: {
      plugins: [PrimeVue, createTestingPinia()],
    },
  })

  it('renders the form with the correct initial values', () => {
    const wrapper = a()
    const tagInput = wrapper.find('#tag');
    expect((tagInput.element as HTMLInputElement).value).toBe('test-rule');

    // Note: PrimeVue Dropdown does not easily expose its selected value in testing
    // We can infer it's working if the model is correct
    expect(wrapper.vm.localRuleSet.type).toBe('remote');
  });

  it('emits a save event with the updated data when the save button is clicked', async () => {
    const wrapper = a()

    // Simulate user input
    await wrapper.find('#tag').setValue('updated-rule');

    // Simulate save button click
    await wrapper.find('button[aria-label="Save"]').trigger('click');

    // Check emitted event
    expect(wrapper.emitted('save')).toHaveLength(1);
    const savedEvent = wrapper.emitted('save')?.[0]?.[0] as any;
    expect(savedEvent.tag).toBe('updated-rule');
  });

  it('emits a cancel event when the cancel button is clicked', async () => {
    const wrapper = a()
    await wrapper.find('button[aria-label="Cancel"]').trigger('click');
    expect(wrapper.emitted('cancel')).toHaveLength(1);
  });
});
