import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import OutboundPicker from '../outboundPicker.vue';
import { useOutboundStore } from '@/stores/outbound';
import Dropdown from 'primevue/dropdown';

const mockOutbounds = [
  { id: 1, name: 'Outbound 1' },
  { id: 2, name: 'Outbound 2' },
  { id: 3, name: 'Outbound 3' },
];

vi.mock('@/stores/outbound', () => ({
  useOutboundStore: vi.fn(() => ({
    outbounds: mockOutbounds,
    fetchOutbounds: vi.fn(),
  })),
}));

describe('outboundPicker.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a dropdown with all outbounds when no filter is provided', async () => {
    const wrapper = shallowMount(OutboundPicker);
    await wrapper.vm.$nextTick();
    expect(wrapper.findComponent(Dropdown).props('options').length).toBe(3);
  });

  it('filters the dropdown options based on the availableOutbounds prop', async () => {
    const wrapper = shallowMount(OutboundPicker, {
      props: {
        availableOutbounds: [1, 3],
      },
    });
    await wrapper.vm.$nextTick();
    const options = wrapper.findComponent(Dropdown).props('options');
    expect(options.length).toBe(2);
    expect(options.every(o => [1, 3].includes(o.id))).toBe(true);
  });
});
