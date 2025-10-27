import { describe, it, expect, vi } from 'vitest';
import { fromSingbox } from './from-singbox';
import { SingBoxRuleSetSchema } from '../../../schemas/route';

describe('fromSingbox', () => {
  it('should correctly transform a remote rule set', () => {
    const remoteRuleSet = SingBoxRuleSetSchema.parse({
      type: 'remote',
      tag: 'test-remote',
      format: 'source',
      url: 'http://example.com/rules.txt',
      download_detour: 'direct',
      update_interval: '1h',
    });

    const result = fromSingbox(remoteRuleSet);
    expect(result.tag).toBe('test-remote');
    expect(result.type).toBe('remote');
    expect(result.content).toBe('http://example.com/rules.txt');
  });

  it('should correctly transform an inline rule set', () => {
    const inlineRuleSet = SingBoxRuleSetSchema.parse({
      type: 'inline',
      tag: 'test-inline',
      rules: [{ domain_suffix: ['google.com', 'youtube.com'], outbound: 'direct' }],
    });

    const result = fromSingbox(inlineRuleSet);
    expect(result.tag).toBe('test-inline');
    expect(result.type).toBe('inline');
    expect(result.content).toBe(JSON.stringify(inlineRuleSet.rules));
  });

  it('should throw an error for local rule sets', () => {
    const localRuleSet = SingBoxRuleSetSchema.parse({
      type: 'local',
      tag: 'test-local',
      format: 'source',
      path: '/path/to/rules.txt',
    });

    window.alert = vi.fn(); // Mock alert
    expect(() => fromSingbox(localRuleSet)).toThrow('Unsupported rule set type: local');
    expect(window.alert).toHaveBeenCalledWith('Local rule sets are not supported for import.');
  });
});
