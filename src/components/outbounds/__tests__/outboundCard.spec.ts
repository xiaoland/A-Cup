import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import OutboundCard from '../outboundCard.vue';
import { z } from 'zod';
import { OutboundSchema } from '../../../schemas/outbound';
import PrimeVue from 'primevue/config';

describe('OutboundCard', () => {
  const outbound = {
    name: 'Test Outbound',
    type: 'direct',
    region: 'Test Region',
    provider: 'Test Provider',
  } as z.infer<typeof OutboundSchema>;

  it('renders the outbound card with the correct data', () => {
    const wrapper = mount(OutboundCard, {
      props: {
        outbound,
      },
      global: {
        plugins: [PrimeVue],
      },
    });

    expect(wrapper.text()).toContain('Test Outbound');
    expect(wrapper.text()).toContain('direct');
    expect(wrapper.text()).toContain('Region: Test Region');
    expect(wrapper.text()).toContain('Provider: Test Provider');
  });
});
