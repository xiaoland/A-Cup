import * as z from "zod";
import {
  DNSOptions,
  RouteOptions,
  LogOptions,
  Inbound,
  Outbound,
} from "@black-duty/sing-box-schema";
import { writeFileSync } from "fs";

console.log("⚙️ Generating JSON Schemas for Sing-Box sections...");

const sections = {
  dns: DNSOptions,
  route: RouteOptions,
  log: LogOptions,
  inbounds: z.array(Inbound),
  outbounds: z.array(Outbound),
};

for (const [name, schema] of Object.entries(sections)) {
  const jsonSchema = z.toJSONSchema(schema, {
    cycles: "ref",
    reused: "ref",
    override(ctx) {
      // Delete zh properties
      delete ctx.jsonSchema.title_zh;
      delete ctx.jsonSchema.description_zh;
    },
  });
  writeFileSync(`public/${name}.json`, JSON.stringify(jsonSchema, null, 2));
  console.log(`✅ Generated public/${name}.json`);
}

console.log("🎉 All JSON schemas generated successfully!");
