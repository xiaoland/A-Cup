import { z } from "zod";
import { Z } from "zod-class";
import { RuleSetInSingBoxSchema, type RuleSetInSingBox } from "../schemas/export";

export class RuleSet extends Z.class({
  id: z.number().int(),
  name: z.string(),
  type: z.enum(["remote", "inline"]),
  format: z.string(),
  content: z.string(),
  readableBy: z.preprocess(
    (v) => (typeof v === 'string' ? JSON.parse(v) : v),
    z.array(z.number())
  ),
  writeableBy: z.preprocess(
    (v) => (typeof v === 'string' ? JSON.parse(v) : v),
    z.array(z.number())
  ),
  download_detour: z.string().nullable(),
  update_interval: z.string().nullable(),
}) {
  exportToSingBox(): RuleSetInSingBox | null {
    const config: RuleSetInSingBox = {
      tag: this.getTag(),
      type: this.type,
    };

    if (this.type === "remote") {
      if (this.content) config.url = this.content;
    } else if (this.type === "inline") {
      try {
        if (this.content) config.rules = JSON.parse(this.content);
      } catch {
        config.rules = [] as any;
      }
    }

    return RuleSetInSingBoxSchema.parse(config);
  }

  getTag() {
    return `rule_set.${this.type}.${this.id}`;
  }
}
