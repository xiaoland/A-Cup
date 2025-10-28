import { shallowMount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import OutboundsEditor from '../../profiles/outboundsEditor.vue';
import Button from 'primevue/button';
import AccordionTab from 'primevue/accordiontab';

describe('outboundsEditor.vue', () => {
  const modelValue = [
    { type: 'vless', tag: 'normal-1' },
    { type: 'selector', tag: 'special-1' },
  ];

  it('renders correctly and separates outbounds', () => {
    const wrapper = shallowMount(OutboundsEditor, {
      props: {
        modelValue,
      },
    });
    expect(wrapper.findAllComponents(AccordionTab).length).toBe(2);
    expect(wrapper.find('hybirdoutboundeditor-stub').exists()).toBe(true);
    expect(wrapper.find('specialoutboundeditor-stub').exists()).toBe(true);
  });

  it('adds a new normal outbound when the "Add Outbound" button is clicked', async () => {
    const wrapper = shallowMount(OutboundsEditor, {
      props: {
        modelValue: [],
      },
    });
    await wrapper.find('button-stub[label="Add Outbound"]').trigger('click');
    expect(wrapper.findAllComponents(AccordionTab).length).toBe(1);
  });

  it('removes a special outbound when the remove button is clicked', async () => {
    const wrapper = shallowMount(OutboundsEditor, {
      props: {
        modelValue,
      },
    });
    await wrapper.findAll('button-stub[label="Remove"]').at(1).trigger('click');
    const emitted = wrapper.emitted('update:modelValue');
    expect(emitted).toHaveLength(1);
    expect(emitted[0][0].length).toBe(1);
    expect(emitted[0][0][0].type).toBe('vless');
  });
});
