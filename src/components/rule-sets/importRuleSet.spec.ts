import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ImportRuleSet from './importRuleSet.vue';
import PrimeVue from 'primevue/config';
import Dialog from 'primevue/dialog';

describe('importRuleSet.vue', () => {
  const mountComponent = () => mount(ImportRuleSet, {
    props: {
      visible: true,
    },
    global: {
      plugins: [PrimeVue],
      stubs: {
        Dialog: {
          template: '<div v-if="visible"><slot /><slot name="footer" /></div>',
          props: ['visible'],
        },
      },
    },
  });

  it('emits a parsed event with the transformed data on successful import', async () => {
    const wrapper = mountComponent();
    const remoteRuleSet = {
      type: 'remote',
      tag: 'test-remote',
      format: 'source',
      url: 'http://example.com/rules.txt',
    };

    await wrapper.find('textarea').setValue(JSON.stringify(remoteRuleSet));
    await wrapper.find('button[aria-label="Confirm"]').trigger('click');

    expect(wrapper.emitted('parsed')).toHaveLength(1);
    const parsedEvent = wrapper.emitted('parsed')?.[0]?.[0] as any;
    expect(parsedEvent.tag).toBe('test-remote');
  });

  it('displays an error message when the input is invalid JSON', async () => {
    const wrapper = mountComponent();
    await wrapper.find('textarea').setValue('invalid json');
    await wrapper.find('button[aria-label="Confirm"]').trigger('click');

    expect(wrapper.find('.p-error').text()).toContain('Unexpected token');
  });

  it('displays an error message for unsupported rule set types', async () => {
    const wrapper = mountComponent();
    const localRuleSet = {
      type: 'local',
      tag: 'test-local',
      format: 'source',
      path: '/path/to/rules.txt',
    };
    window.alert = vi.fn(); // Mock alert

    await wrapper.find('textarea').setValue(JSON.stringify(localRuleSet));
    await wrapper.find('button[aria-label="Confirm"]').trigger('click');

    expect(wrapper.find('.p-error').text()).toContain('Unsupported rule set type: local');
  });
});
