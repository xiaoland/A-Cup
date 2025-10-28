import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import OutboundsEditor from '../../profiles/outboundsEditor.vue';
import Button from 'primevue/button';
import AccordionPanel from 'primevue/accordionpanel';
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';

describe('outboundsEditor.vue', () => {
  const modelValue = [
    { type: 'vless', tag: 'normal-1' },
    { type: 'selector', tag: 'special-1' },
  ];

  it('renders correctly and separates outbounds', () => {
    const wrapper = mount(OutboundsEditor, {
      props: {
        modelValue,
      },
      global: {
        plugins: [
          [PrimeVue, { theme: { preset: Aura } }]
        ],
        stubs: {
          HybirdOutboundEditor: true,
          SpecialOutboundEditor: true,
        },
      },
    });
    expect(wrapper.findAllComponents(AccordionPanel).length).toBe(2);
    expect(wrapper.find('hybirdoutboundeditor-stub').exists()).toBe(true);
    expect(wrapper.find('specialoutboundeditor-stub').exists()).toBe(true);
  });

  it('adds a new normal outbound when the "Add Outbound" button is clicked', async () => {
    const wrapper = mount(OutboundsEditor, {
      props: {
        modelValue: [],
      },
      global: {
        plugins: [
          [PrimeVue, { theme: { preset: Aura } }]
        ],
        stubs: {
          HybirdOutboundEditor: true,
          SpecialOutboundEditor: true,
        },
      },
    });
    await wrapper.findAll('button').find(btn => btn.text() === 'Add Outbound')?.trigger('click');
    expect(wrapper.findAllComponents(AccordionPanel).length).toBe(1);
  });

  it('removes a special outbound when the remove button is clicked', async () => {
    const wrapper = mount(OutboundsEditor, {
      props: {
        modelValue,
      },
      global: {
        plugins: [
          [PrimeVue, { theme: { preset: Aura } }]
        ],
        stubs: {
          HybirdOutboundEditor: true,
          SpecialOutboundEditor: true,
        },
      },
    });
    const removeButtons = wrapper.findAll('button').filter(btn => btn.text() === 'Remove');
    await removeButtons.at(1)?.trigger('click');
    const emitted = wrapper.emitted('update:modelValue');
    expect(emitted).toHaveLength(1);
    expect(emitted[0][0].length).toBe(1);
    expect(emitted[0][0][0].type).toBe('vless');
  });
});
