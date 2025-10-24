import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

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
