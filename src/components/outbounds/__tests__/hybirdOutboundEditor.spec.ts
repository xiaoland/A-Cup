import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import HybirdOutboundEditor from '../hybirdOutboundEditor.vue';
import { exportOutboundToSingBox } from '../../../../schemas/outbound';
import { v4 as uuidv4 } from 'uuid';
import OutboundPicker from '../outboundPicker.vue';

vi.mock('../../../../schemas/outbound', () => ({
  exportOutboundToSingBox: vi.fn(outbound => ({
    ...outbound,
    tag: String(outbound.id),
  })),
  VlessCredentialSchema: {
    parse: vi.fn(() => ({
        uuid: 'uuid',
        flow: '',
    }))
  }
}));

describe('hybirdOutboundEditor.vue', () => {
  const baseModelValue = {
    type: 'vless',
    tag: 'test',
    server: 'localhost',
    server_port: 443,
    uuid: 'a-uuid',
  };

  it('renders correctly', () => {
    const wrapper = shallowMount(HybirdOutboundEditor, {
      props: {
        modelValue: baseModelValue,
      },
    });
    expect(wrapper.findComponent(OutboundPicker).exists()).toBe(true);
  });

  it('updates the model when a base outbound is selected', async () => {
    const wrapper = shallowMount(HybirdOutboundEditor, {
      props: {
        modelValue: baseModelValue,
      },
    });

    const selectedOutbound = {
      id: 1,
      type: 'vmess',
      server: 'remote-server',
      server_port: 8080,
      credential: { uuid: uuidv4(), security: 'auto', alter_id: 0 },
    };

    await wrapper.findComponent(OutboundPicker).vm.$emit('update:modelValue', selectedOutbound);

    expect(exportOutboundToSingBox).toHaveBeenCalledWith(selectedOutbound);
    const emitted = wrapper.emitted('update:modelValue');
    expect(emitted).toHaveLength(1);
    expect(emitted[0][0].type).toBe('vmess');
    expect(emitted[0][0].server).toBe('remote-server');
  });
});
