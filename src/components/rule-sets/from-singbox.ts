import { z } from 'zod';
import { SingBoxRuleSetSchema } from '../../../schemas/route';
import type { RuleSet } from '../../../schemas/ruleset';

type SingBoxRuleSet = z.infer<typeof SingBoxRuleSetSchema>;

export function fromSingbox(singboxRuleSet: SingBoxRuleSet): Partial<RuleSet> {
  const { type, tag } = singboxRuleSet;

  if (type === 'local') {
    alert('Local rule sets are not supported for import.');
    throw new Error('Unsupported rule set type: local');
  }

  let content: string;
  let format: string | undefined;

  if (singboxRuleSet.type === 'inline') {
    content = JSON.stringify(singboxRuleSet.rules);
    format = 'text'; // Or some default, since it doesn't exist on the source
  } else { // remote
    content = singboxRuleSet.url;
    format = singboxRuleSet.format;
  }

  return {
    tag,
    type,
    format: format,
    content,
  };
}
