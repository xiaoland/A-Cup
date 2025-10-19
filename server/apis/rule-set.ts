import { Hono } from 'hono';
import { z } from 'zod';
import { RuleSetService } from '../services/rule-set.service';
import { zValidator } from '@hono/zod-validator';

export const ruleSetRouter = new Hono();

const CreateRuleSetSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['inline', 'remote']),
  format: z.string().min(1),
  content: z.string().default(''),
  readableBy: z.array(z.number().int()).optional(),
  writeableBy: z.array(z.number().int()).optional(),
  download_detour: z.string().optional(),
  update_interval: z.string().optional()
});

const IDPathParamSchema = z.object({
  id: z.string().transform(val => parseInt(val))
});

ruleSetRouter.post('/', zValidator('json', CreateRuleSetSchema), async (c) => {
  const body = c.req.valid('json');
  const user_id = parseInt((c.get('token_payload')?.sub || '0').toString());
  const ruleSetService = new RuleSetService(c.get('db'), c.env);

  const newRuleSet = await ruleSetService.createRuleSet(user_id, body);
  return c.json(newRuleSet, 201);
});

ruleSetRouter.put('/:id', zValidator('param', IDPathParamSchema), zValidator('json', CreateRuleSetSchema.partial()), async (c) => {
  const { id } = c.req.valid('param');
  const body = c.req.valid('json');
  const user_id = parseInt((c.get('token_payload')?.sub || '0').toString());
  const ruleSetService = new RuleSetService(c.get('db'), c.env);

  try {
    const updatedRuleSet = await ruleSetService.updateRuleSet(user_id, id, body);
    if (!updatedRuleSet) {
      return c.text('Rule set not found', 404);
    }
    return c.json(updatedRuleSet);
  } catch (error) {
    return c.text(error instanceof Error ? error.message : 'Forbidden', 403);
  }
});

ruleSetRouter.get('/:id', zValidator('param', IDPathParamSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user_id = parseInt((c.get('token_payload')?.sub || '0').toString());
  const ruleSetService = new RuleSetService(c.get('db'), c.env);

  const ruleSet = await ruleSetService.getRuleSetById(user_id, id);
  if (!ruleSet) {
    return c.text('Rule set not found', 404);
  }
  return c.json(ruleSet);
});

ruleSetRouter.get('/:id/tag', zValidator('param', IDPathParamSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user_id = parseInt((c.get('token_payload')?.sub || '0').toString());
  const ruleSetService = new RuleSetService(c.get('db'), c.env);

  try {
    const tag = await ruleSetService.getRuleSetTag(user_id, id);
    if (!tag) {
      return c.text('Rule set not found', 404);
    }
    return c.json(tag);
  } catch (error) {
    return c.text(error instanceof Error ? error.message : 'Forbidden', 403);
  }
});

ruleSetRouter.get('/', async (c) => {
  const user_id = parseInt((c.get('token_payload')?.sub || '0').toString());
  const ruleSetService = new RuleSetService(c.get('db'), c.env);

  const ruleSets = await ruleSetService.getRuleSets(user_id);
  return c.json(ruleSets);
});

ruleSetRouter.delete('/:id', zValidator('param', IDPathParamSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user_id = parseInt((c.get('token_payload')?.sub || '0').toString());
  const ruleSetService = new RuleSetService(c.get('db'), c.env);

  try {
    const deleted = await ruleSetService.deleteRuleSet(user_id, id);
    if (!deleted) {
      return c.text('Rule set not found', 404);
    }
    return new Response(null, { status: 204 });
  } catch (error) {
    return c.text(error instanceof Error ? error.message : 'Forbidden', 403);
  }
});
