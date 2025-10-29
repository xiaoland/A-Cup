import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import OutboundsPicker from '../outboundsPicker.vue';
import { useOutboundStore } from '../../../stores/outbound';
import MultiSelect from 'primevue/multiselect';

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

describe('outboundsPicker.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a multiselect with all outbounds when no filter is provided', async () => {
    const wrapper = shallowMount(OutboundsPicker);
    await wrapper.vm.$nextTick();
    const options = wrapper.findComponent(MultiSelect).props('options');
    expect(options.length).toBe(3);
  });

  it('filters the multiselect options based on the availableOutbounds prop', async () => {
    const wrapper = shallowMount(OutboundsPicker, {
      props: {
        availableOutbounds: [1, 3],
      },
    });
    await wrapper.vm.$nextTick();
    const options = wrapper.findComponent(MultiSelect).props('options');
    expect(options.length).toBe(2);
    expect(options.every(o => [1, 3].includes(o.id))).toBe(true);
  });
});
