import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const Users = sqliteTable("users", {
  id: int().primaryKey({ autoIncrement: true }),
  username: text().notNull(),
  password: text().notNull(),
  roles: text("roles", {mode: "json"}).notNull().default("[]"), 
});

export const Outbounds = sqliteTable("outbounds", {
  id: int("id").primaryKey({ autoIncrement: true }),
  owner: int("owner")
    .notNull()
    .references(() => Users.id),
  share: int("share", { mode: "boolean" }).notNull().default(false),
  name: text("name"),
  type: text("type").notNull(),
  outbounds: text("outbounds", { mode: "json" }), // int[] FK to outbounds.id
  region: text("region"),
  address: text("address"),
  port: int("port"),
  network: text("network"), // 'udp' or 'tcp'
  encryption: text("encryption"),
  packet_encoding: text("packet_encoding"),
  uuid: text("uuid"),
  password: text("password"),
  alter_id: int("alter_id"),
  flow: text("flow"),
  transport: text("transport", { mode: "json" }),
  tls: text("tls", { mode: "json" }),
});

export const RuleSets = sqliteTable("rule_sets", {
  id: int().primaryKey({ autoIncrement: true }),
  owner: int().notNull().references(() => Users.id),
  share: int({ mode: "boolean" }).notNull().default(false),
  type: text().notNull().default("remote"),
  name: text().notNull(),
  rules: text({ mode: "json" }), // array of headless rule objects
  url: text(),
});

export const Profiles = sqliteTable("profiles", {
  id: int().primaryKey({ autoIncrement: true }),
  created_by: int().notNull().references(() => Users.id),
  name: text().notNull(),
  tags: text({ mode: "json" }).notNull().default("[]"), // text[] for what system,device,etc.
  outbounds: text({ mode: "json" }).notNull().default("[]"), // int[] FK to outbounds.id
  route_final: int().references(() => Outbounds.id), // FK to outbounds.id
  rule_sets: text({ mode: "json" }).notNull().default("[]"), // int[] FK to rule_sets.id
});
