import { Hono } from "hono";
import { z } from "zod";
import { RuleSetService } from "../services/rule-set.service";
import { zValidator } from "@hono/zod-validator";
import { RuleSet } from "../business/rule-set";

export const ruleSetRouter = new Hono();

const CreateRuleSetSchema = RuleSet.schema().omit({ id: true });

const IDPathParamSchema = z.object({
  id: z.string().transform((val) => parseInt(val)),
});

ruleSetRouter.post(
  "/",
  zValidator("json", CreateRuleSetSchema),
  async (c) => {
    try {
      const body = c.req.valid("json");
      const user_id = parseInt((c.get("jwtPayload")?.sub || "0").toString());
      const ruleSetService = new RuleSetService(c.get("db"), c.env);

      const newRuleSet = await ruleSetService.createRuleSet(user_id, body);
      return c.json(newRuleSet, 201);
    } catch (error: any) {
      return c.json(
        { error: "Internal Server Error", message: error.message },
        500
      );
    }
  }
);

ruleSetRouter.put(
  "/:id",
  zValidator("param", IDPathParamSchema),
  zValidator("json", CreateRuleSetSchema.partial()),
  async (c) => {
    try {
      const { id } = c.req.valid("param");
      const body = c.req.valid("json");
      const user_id = parseInt((c.get("jwtPayload")?.sub || "0").toString());
      const ruleSetService = new RuleSetService(c.get("db"), c.env);

      const updatedRuleSet = await ruleSetService.updateRuleSet(
        user_id,
        id,
        body
      );
      if (!updatedRuleSet) {
        return c.text("Rule set not found", 404);
      }
      return c.json(updatedRuleSet);
    } catch (error: any) {
      return c.json(
        { error: "Internal Server Error", message: error.message },
        500
      );
    }
  }
);

ruleSetRouter.get("/:id", zValidator("param", IDPathParamSchema), async (c) => {
  try {
    const { id } = c.req.valid("param");
    const user_id = parseInt((c.get("jwtPayload")?.sub || "0").toString());
    const ruleSetService = new RuleSetService(c.get("db"), c.env);

    const ruleSet = await ruleSetService.getRuleSetById(user_id, id);
    if (!ruleSet) {
      return c.text("Rule set not found", 404);
    }
    return c.json(ruleSet);
  } catch (error: any) {
    return c.json(
      { error: "Internal Server Error", message: error.message },
      500
    );
  }
});

ruleSetRouter.get(
  "/:id/tag",
  zValidator("param", IDPathParamSchema),
  async (c) => {
    try {
      const { id } = c.req.valid("param");
      const user_id = parseInt((c.get("jwtPayload")?.sub || "0").toString());
      const ruleSetService = new RuleSetService(c.get("db"), c.env);

      const ruleSet = await ruleSetService.getRuleSetById(user_id, id);
      if (!ruleSet) {
        return c.text("Rule set not found", 404);
      }
      return c.json({ tag: ruleSet.getTag() });
    } catch (error: any) {
      return c.json(
        { error: "Internal Server Error", message: error.message },
        500
      );
    }
  }
);

ruleSetRouter.get("/", async (c) => {
  try {
    const user_id = parseInt((c.get("jwtPayload")?.sub || "0").toString());
    const ruleSetService = new RuleSetService(c.get("db"), c.env);

    const ruleSets = await ruleSetService.getRuleSets(user_id);
    return c.json(ruleSets);
  } catch (error: any) {
    return c.json(
      { error: "Internal Server Error", message: error.message },
      500
    );
  }
});

ruleSetRouter.delete(
  "/:id",
  zValidator("param", IDPathParamSchema),
  async (c) => {
    try {
      const { id } = c.req.valid("param");
      const user_id = parseInt((c.get("jwtPayload")?.sub || "0").toString());
      const ruleSetService = new RuleSetService(c.get("db"), c.env);

      const deleted = await ruleSetService.deleteRuleSet(user_id, id);
      if (!deleted) {
        return c.text("Rule set not found", 404);
      }
      return new Response(null, { status: 204 });
    } catch (error: any) {
      return c.json(
        { error: "Internal Server Error", message: error.message },
        500
      );
    }
  }
);
