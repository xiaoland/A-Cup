import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useRuleSetStore } from './ruleset';
import { useUserStore } from './user';

vi.mock('./user', () => {
  const authorizedRequest = vi.fn();
  return {
    useUserStore: () => ({
      authorizedRequest,
    }),
  };
});

describe('RuleSet Store', () => {
  let userStore: ReturnType<typeof useUserStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    userStore = useUserStore();
    (userStore.authorizedRequest as vi.Mock).mockClear();
  });

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

  it('fetchRuleSets calls the correct endpoint and updates state', async () => {
    (userStore.authorizedRequest as vi.Mock).mockResolvedValueOnce([mockRuleSet]);

    const ruleSetStore = useRuleSetStore();
    await ruleSetStore.fetchRuleSets();

    expect(userStore.authorizedRequest).toHaveBeenCalledWith('/api/rulesets');
    expect(ruleSetStore.ruleSets).toEqual([mockRuleSet]);
  });

  it('createRuleSet sends a POST request and adds the new rule set', async () => {
    (userStore.authorizedRequest as vi.Mock).mockResolvedValueOnce({ ...mockRuleSet, id: 2 });

    const ruleSetStore = useRuleSetStore();
    await ruleSetStore.createRuleSet(mockRuleSet);

    expect(userStore.authorizedRequest).toHaveBeenCalledWith('/api/rulesets', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify(mockRuleSet),
    }));
    expect(ruleSetStore.ruleSets).toHaveLength(1);
    expect(ruleSetStore.ruleSets[0].id).toBe(2);
  });

  it('updateRuleSet sends a PUT request and updates the rule set in state', async () => {
    const updatedRuleSet = { ...mockRuleSet, tag: 'updated' };
    (userStore.authorizedRequest as vi.Mock).mockResolvedValueOnce(updatedRuleSet);

    const ruleSetStore = useRuleSetStore();
    ruleSetStore.ruleSets = [mockRuleSet]; // Pre-populate state
    await ruleSetStore.updateRuleSet(updatedRuleSet);

    expect(userStore.authorizedRequest).toHaveBeenCalledWith(`/api/rulesets/${mockRuleSet.id}`, expect.objectContaining({
      method: 'PUT',
    }));
    expect(ruleSetStore.ruleSets[0].tag).toBe('updated');
  });

  it('deleteRuleSet sends a DELETE request and removes the rule set from state', async () => {
    (userStore.authorizedRequest as vi.Mock).mockResolvedValueOnce(undefined);

    const ruleSetStore = useRuleSetStore();
    ruleSetStore.ruleSets = [mockRuleSet];
    await ruleSetStore.deleteRuleSet(mockRuleSet.id as number);

    expect(userStore.authorizedRequest).toHaveBeenCalledWith(`/api/rulesets/${mockRuleSet.id}`, expect.objectContaining({
      method: 'DELETE',
    }));
    expect(ruleSetStore.ruleSets).toHaveLength(0);
  });
});
