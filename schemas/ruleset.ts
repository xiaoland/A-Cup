import { z } from 'zod';
import { HeadlessRuleSchema, type SingBoxRuleSet } from './route';

export const RuleSetSchema = z.object({
  id: z.int().optional(),
  readableBy: z.array(z.uuid()),
  writeableBy: z.array(z.uuid()),
  name: z.string(),
  type: z.enum(['remote', 'inline']),
  format: z.string().nullable(),
  content: z.string(),
});

export type RuleSet = z.infer<typeof RuleSetSchema>;

export function exportRuleSetToSingBox(ruleSet: RuleSet): SingBoxRuleSet {
  if (!ruleSet.id) {
    throw new Error("Cannot export RuleSet not inserted")
  }
  return {
    tag: ruleSet.id.toString(),
    type: ruleSet.type,
    url: ruleSet.type === 'remote' ? ruleSet.content : undefined,
    rules: ruleSet.type === 'inline' ? z.array(HeadlessRuleSchema).parse(JSON.parse(ruleSet.content)) : undefined,
  } as SingBoxRuleSet;
}
