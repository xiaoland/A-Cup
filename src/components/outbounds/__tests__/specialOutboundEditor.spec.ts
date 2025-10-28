import { mount, shallowMount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import SpecialOutboundEditor from '../specialOutboundEditor.vue';
import Dropdown from 'primevue/dropdown';

describe('specialOutboundEditor.vue', () => {
  it('renders correctly', () => {
    const wrapper = shallowMount(SpecialOutboundEditor, {
      props: {
        modelValue: {
          type: 'selector',
          tag: 'test',
          outbounds: [],
        },
      },
      global: {
        stubs: {
            SelectorForm: true,
            UrltestForm: true,
            DirectForm: true,
        }
      }
    });
    expect(wrapper.findComponent(Dropdown).exists()).toBe(true);
  });

  it('initializes with a default selector outbound if no modelValue is provided', async () => {
    const wrapper = mount(SpecialOutboundEditor, {
        global: {
            stubs: {
                SelectorForm: true,
                UrltestForm: true,
                DirectForm: true,
            }
        }
    });
    await wrapper.vm.$nextTick();

    const emitted = wrapper.emitted('update:modelValue');
    expect(emitted).toHaveLength(1);
    expect(emitted[0][0].type).toBe('selector');
  });

  it('updates the model when the outbound type is changed', async () => {
    const wrapper = mount(SpecialOutboundEditor, {
      props: {
        modelValue: {
          type: 'selector',
          tag: 'test',
          outbounds: [],
        },
      },
      global: {
        stubs: {
            SelectorForm: true,
            UrltestForm: true,
            DirectForm: true,
        }
      }
    });

    await wrapper.findComponent(Dropdown).vm.$emit('update:modelValue', 'urltest');

    const emitted = wrapper.emitted('update:modelValue');
    expect(emitted).toHaveLength(1);
    expect(emitted[0][0].type).toBe('urltest');
    expect(emitted[0][0].tag).toBe('test');
  });
});
