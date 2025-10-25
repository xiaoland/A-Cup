import { RuleSet } from '../../schemas/ruleset';
import { SingBoxRuleSet } from '../../schemas/route';
import { z } from 'zod';

export function exportRuleSetToSingBox(ruleSet: RuleSet): SingBoxRuleSet {
  const { type, tag, format, content, download_detour, update_interval } = ruleSet;

  switch (type) {
    case 'inline':
      return {
        type,
        tag,
        rules: JSON.parse(content),
      };
    case 'remote':
      return {
        type,
        tag,
        format: format as 'source' | 'binary',
        url: content,
        download_detour: download_detour?.toString(),
        update_interval: update_interval?.toString(),
      };
    default:
      throw new Error(`Unsupported rule set type: ${type}`);
  }
}
