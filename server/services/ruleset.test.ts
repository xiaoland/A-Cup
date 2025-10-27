import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RuleSetService } from './ruleset';
import { DrizzleD1Database } from 'drizzle-orm/d1';

// A more robust Drizzle mock that handles chaining
const createMockDb = () => {
  const mock = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    get: vi.fn(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    // Drizzle's query builder is then-able
    then: vi.fn(),
  };
  return mock as unknown as DrizzleD1Database;
};


describe('RuleSetService', () => {
  let service: RuleSetService;
  let mockDb: DrizzleD1Database;
  const testUserId = 'user-123';

  beforeEach(() => {
    mockDb = createMockDb();
    service = new RuleSetService(mockDb);
    vi.clearAllMocks();
  });

  const mockRuleSet = {
    id: 1,
    tag: 'test-rule',
    type: 'remote' as const,
    format: 'source',
    content: 'http://example.com',
    download_detour: 1,
    update_interval: 3600,
    readableBy: JSON.stringify([testUserId]),
    writeableBy: JSON.stringify([testUserId]),
  };

  const mockRuleSetParsed = {
    ...mockRuleSet,
    readableBy: [testUserId],
    writeableBy: [testUserId],
  };

  it('getRuleSets should return readable rule sets', async () => {
    (mockDb as any).then.mockImplementationOnce((resolve: any) => resolve([mockRuleSet]));

    const result = await service.getRuleSets(testUserId);
    expect(result).toEqual([mockRuleSetParsed]);
    expect(mockDb.where).toHaveBeenCalled();
  });

  it('getRuleSetById should return rule set if user has read access', async () => {
    (mockDb as any).get.mockResolvedValueOnce(mockRuleSet);

    const result = await service.getRuleSetById(1, testUserId);
    expect(result).toEqual(mockRuleSetParsed);
  });

  it('getRuleSetById should throw Forbidden error if user lacks read access', async () => {
    const ruleSetNoAccess = { ...mockRuleSet, readableBy: JSON.stringify(['another-user']) };
    (mockDb as any).get.mockResolvedValueOnce(ruleSetNoAccess);

    await expect(service.getRuleSetById(1, testUserId)).rejects.toThrow('Forbidden');
  });

  it('createRuleSet should create a new rule set', async () => {
    const newRuleSetData = {
      tag: 'new-rule',
      type: 'inline' as const,
      content: 'domain-suffix,google.com,DIRECT',
      readableBy: [testUserId],
      writeableBy: [testUserId],
      download_detour: 1,
      update_interval: 1,
      format: 'text',
    };
    const createdRuleSet = { ...mockRuleSet, id: 2, tag: 'new-rule' };
    const createdRuleSetParsed = { ...createdRuleSet, readableBy: [testUserId], writeableBy: [testUserId] };

    (mockDb as any).get.mockResolvedValueOnce(createdRuleSet); // For the insert's returning().get()
    (mockDb as any).get.mockResolvedValueOnce(createdRuleSet); // For the subsequent getRuleSetById call

    const result = await service.createRuleSet(newRuleSetData, testUserId);
    expect(result).toEqual(createdRuleSetParsed);
    expect(mockDb.values).toHaveBeenCalledWith(expect.objectContaining({
      tag: 'new-rule',
      readableBy: JSON.stringify([testUserId]),
    }));
  });

  it('updateRuleSet should update a rule set if user has write access', async () => {
    const updatedData = { ...mockRuleSetParsed, tag: 'updated-rule' };

    // Mock for the permission check inside updateRuleSet
    (mockDb as any).get.mockResolvedValueOnce(mockRuleSet);
    // Mock for the chain: db.update().set().where()
    (mockDb as any).then.mockImplementationOnce((resolve: any) => resolve({ success: true }));
    // Mock for the final getRuleSetById call
    (mockDb as any).get.mockResolvedValueOnce({ ...mockRuleSet, tag: 'updated-rule' });

    const result = await service.updateRuleSet(1, updatedData, testUserId);

    expect(result.tag).toBe('updated-rule');
    expect(mockDb.set).toHaveBeenCalledWith(expect.objectContaining({
      tag: 'updated-rule',
    }));
  });

  it('updateRuleSet should throw Forbidden error if user lacks write access', async () => {
    const ruleSetNoWriteAccess = { ...mockRuleSet, writeableBy: JSON.stringify(['another-user']) };
    const ruleSetNoWriteAccessParsed = { ...mockRuleSetParsed, writeableBy: ['another-user'] };

    (mockDb as any).get.mockResolvedValueOnce(ruleSetNoWriteAccess);

    await expect(service.updateRuleSet(1, ruleSetNoWriteAccessParsed, testUserId)).rejects.toThrow('Forbidden');
  });

  it('deleteRuleSet should delete a rule set if user has write access', async () => {
    (mockDb as any).get.mockResolvedValueOnce(mockRuleSet);
    (mockDb as any).then.mockImplementationOnce((resolve: any) => resolve({ success: true }));

    const result = await service.deleteRuleSet(1, testUserId);
    expect(result).toBeDefined();
    expect(mockDb.delete).toHaveBeenCalled();
  });

  it('deleteRuleSet should throw Forbidden error if user lacks write access', async () => {
    const ruleSetNoWriteAccess = { ...mockRuleSet, writeableBy: JSON.stringify(['another-user']) };
    (mockDb as any).get.mockResolvedValueOnce(ruleSetNoWriteAccess);

    await expect(service.deleteRuleSet(1, testUserId)).rejects.toThrow('Forbidden');
  });
});
