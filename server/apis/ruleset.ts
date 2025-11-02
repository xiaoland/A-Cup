import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { RuleSetSchema } from '../../schemas/ruleset';
import { RuleSetService } from '../services/ruleset';
import { authMiddleware } from '../auth';

export const ruleSetApi = new Hono()
  .use(authMiddleware)
  .get('/', async (c) => {
    const ruleSetService = new RuleSetService(c.get('db'));
    const ruleSets = await ruleSetService.getRuleSets();
    return c.json(ruleSets);
  })
  .get('/:id', async (c) => {
    const ruleSetService = new RuleSetService(c.get('db'));
    const id = parseInt(c.req.param('id'));
    const ruleSet = await ruleSetService.getRuleSetById(id);
    if (!ruleSet) {
      return c.notFound();
    }
    return c.json(ruleSet);
  })
  .post('/', zValidator('json', RuleSetSchema), async (c) => {
    const ruleSetService = new RuleSetService(c.get('db'));
    const ruleSet = c.req.valid('json');
    const newRuleSet = await ruleSetService.createRuleSet(ruleSet);
    return c.json(newRuleSet, 201);
  })
  .put('/:id', zValidator('json', RuleSetSchema), async (c) => {
    const ruleSetService = new RuleSetService(c.get('db'));
    const id = parseInt(c.req.param('id'));
    const ruleSet = c.req.valid('json');
    const updatedRuleSet = await ruleSetService.updateRuleSet(id, ruleSet);
    if (!updatedRuleSet) {
      return c.notFound();
    }
    return c.json(updatedRuleSet);
  })
  .delete('/:id', async (c) => {
    const ruleSetService = new RuleSetService(c.get('db'));
    const id = parseInt(c.req.param('id'));
    try {
      await ruleSetService.deleteRuleSet(id);
      return c.body(null, 204);
    } catch (error) {
      if (error.message === 'Forbidden') {
        return c.json({ message: error.message }, 403);
      }
      return c.json({ message: error.message }, 500);
    }
  });
