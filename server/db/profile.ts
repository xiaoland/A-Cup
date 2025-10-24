import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { Users } from "./schema";

export const Profiles = sqliteTable("profiles", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  created_by: int("created_by")
    .notNull()
    .references(() => Users.id),
  name: text("name").notNull(),
  tags: text("tags", { mode: "json" }).notNull().default("[]"), // text[] for what system,device,etc.
  outbounds: text("outbounds", { mode: "json" }).notNull().default("[]"), // int[] FK to outbounds.id
  rule_sets: text("rule_sets", { mode: "json" }).notNull().default("[]"), // int[] FK to rule_sets.id
});
