import { setActivePinia, createPinia } from 'pinia';
import { useProfileStore } from '../profile';
import { describe, it, expect, beforeEach, vi } from 'vitest';

global.fetch = vi.fn();

describe('useProfileStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    (fetch as any).mockClear();
  });

  it('fetches profiles', async () => {
    const store = useProfileStore();
    const mockProfiles = [{ id: '1', name: 'Test Profile' }];
    (fetch as any).mockResolvedValueOnce({
      json: () => Promise.resolve(mockProfiles),
    });
    await store.fetchProfiles();
    expect(store.profiles).toEqual(mockProfiles);
  });

  it('creates a profile', async () => {
    const store = useProfileStore();
    const newProfile = { name: 'New Profile' };
    (fetch as any)
      .mockResolvedValueOnce({ json: () => Promise.resolve({}) })
      .mockResolvedValueOnce({ json: () => Promise.resolve([]) });
    await store.createProfile(newProfile as any);
    expect(fetch).toHaveBeenCalledWith('/api/profiles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newProfile),
    });
  });

  it('updates a profile', async () => {
    const store = useProfileStore();
    const updatedProfile = { id: '1', name: 'Updated Profile' };
    (fetch as any)
      .mockResolvedValueOnce({ json: () => Promise.resolve({}) })
      .mockResolvedValueOnce({ json: () => Promise.resolve([]) });
    await store.updateProfile('1', updatedProfile as any);
    expect(fetch).toHaveBeenCalledWith('/api/profiles/1', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedProfile),
    });
  });
});
