import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { RuleSetSchema } from '../../schemas/ruleset';
import { RuleSetService } from '../services/ruleset';
import { authMiddleware } from '../auth';

export const ruleSetApi = new Hono()
  .use(authMiddleware)
  .get('/', async (c) => {
    const userId = c.get('userId');
    const ruleSetService = new RuleSetService(c.get('db'));
    const ruleSets = await ruleSetService.getRuleSets(userId);
    return c.json(ruleSets);
  })
  .get('/:id', async (c) => {
    const userId = c.get('userId');
    const ruleSetService = new RuleSetService(c.get('db'));
    const id = parseInt(c.req.param('id'));
    const ruleSet = await ruleSetService.getRuleSetById(id, userId);
    if (!ruleSet) {
      return c.notFound();
    }
    return c.json(ruleSet);
  })
  .post('/', zValidator('json', RuleSetSchema), async (c) => {
    const userId = c.get('userId');
    const ruleSetService = new RuleSetService(c.get('db'));
    const ruleSet = c.req.valid('json');
    const newRuleSet = await ruleSetService.createRuleSet(ruleSet, userId);
    return c.json(newRuleSet, 201);
  })
  .put('/:id', zValidator('json', RuleSetSchema), async (c) => {
    const userId = c.get('userId');
    const ruleSetService = new RuleSetService(c.get('db'));
    const id = parseInt(c.req.param('id'));
    const ruleSet = c.req.valid('json');
    const updatedRuleSet = await ruleSetService.updateRuleSet(id, ruleSet, userId);
    if (!updatedRuleSet) {
      return c.notFound();
    }
    return c.json(updatedRuleSet);
  })
  .delete('/:id', async (c) => {
    const userId = c.get('userId');
    const ruleSetService = new RuleSetService(c.get('db'));
    const id = parseInt(c.req.param('id'));
    try {
      await ruleSetService.deleteRuleSet(id, userId);
      return c.body(null, 204);
    } catch (error) {
      if (error.message === 'Forbidden') {
        return c.json({ message: error.message }, 403);
      }
      return c.json({ message: error.message }, 500);
    }
  });
