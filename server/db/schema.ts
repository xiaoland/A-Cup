import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const Users = sqliteTable("users", {
  id: int().primaryKey({ autoIncrement: true }),
  username: text().notNull(),
  password: text().notNull(),
});

export { OutboundTable as Outbounds } from './outbound';

export const RuleSets = sqliteTable("rule_sets", {
  // Core fields
  id: int("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  type: text("type").notNull(), // "remote" | "inline"
  format: text("format").notNull(), // e.g. "source" | "binary"
  content: text("content").notNull(),

  // Access control lists (JSON arrays of userId: int)
  readableBy: text("readable_by", { mode: "json" }).notNull(),
  writeableBy: text("writeable_by", { mode: "json" }).notNull(),

  // Optional fields for remote updates
  download_detour: text("download_detour"),
  update_interval: text("update_interval"),
});

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
