import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const Users = sqliteTable("users", {
  id: int().primaryKey({ autoIncrement: true }),
  username: text().notNull(),
  password: text().notNull(),
  roles: text("roles", {mode: "json"}).notNull().default("[]"), 
});

export const Inbounds = sqliteTable("inbounds", {
  id: int().primaryKey({ autoIncrement: true }),
  owner: int().notNull().references(() => Users.id),
  share: int({ mode: "boolean" }).notNull().default(false),
  type: text().notNull(),
  address: text(),
  port: int(),
  stack: text().default("mixed"),
  mtu: int().default(9000),
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

export const RouteRules = sqliteTable("route_rules", {
  id: int().primaryKey({ autoIncrement: true }),
  owner: int().notNull().references(() => Users.id),
  share: int({ mode: "boolean" }).notNull().default(false),
  name: text().notNull(),
  action: text().notNull(),
  outbound: int().references(() => Outbounds.id),
  domains: text({ mode: "json" }),
  domain_suffixes: text({ mode: "json" }),
  domain_keywords: text({ mode: "json" }),
  domain_regexes: text({ mode: "json" }),
  rule_sets: text({ mode: "json" }), // int[] FK to rule_sets.id
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

export const EndpointWireguards = sqliteTable("endpoint_wireguards", {
  id: int().primaryKey({ autoIncrement: true }),
  owner: int().notNull().references(() => Users.id),
  share: int({ mode: "boolean" }).notNull().default(false),
  name: text().notNull(),
  system: int({ mode: "boolean" }).notNull().default(false),
  addresses: text({ mode: "json" }).notNull(), // text[]
  private_key: text().notNull(),
  public_key: text().notNull(),
  preshared_key: text(),
  peers: text({ mode: "json" }).notNull().default("[]"), // json array
  mtu: int().default(1408),
});

export const DNSServers = sqliteTable("dns_servers", {
  id: int().primaryKey({ autoIncrement: true }),
  owner: int().notNull().references(() => Users.id),
  share: int({ mode: "boolean" }).notNull().default(false),
  name: text().notNull(),
  type: text().notNull(),
  address: text().notNull(),
  port: int(),
  outbound_detour: int().references(() => Outbounds.id),
  wg_endpoint_detour: int().references(() => EndpointWireguards.id),
  tls: text({ mode: "json" }),
  https: text({ mode: "json" }),
});

export const DNSRules = sqliteTable("dns_rules", {
  id: int().primaryKey({ autoIncrement: true }),
  owner: int().notNull().references(() => Users.id),
  share: int({ mode: "boolean" }).notNull().default(false),
  name: text().notNull(),
  action: text(),
  server: int().notNull().references(() => DNSServers.id),
  domains: text({ mode: "json" }),
  domain_suffixes: text({ mode: "json" }),
  domain_keywords: text({ mode: "json" }),
  rule_sets: text({ mode: "json" }), // int[] FK to rule_sets.id
});

export const Profiles = sqliteTable("profiles", {
  id: int().primaryKey({ autoIncrement: true }),
  created_by: int().notNull().references(() => Users.id),
  name: text().notNull(),
  tags: text({ mode: "json" }).notNull().default("[]"), // text[] for what system,device,etc.
  inbounds: text({ mode: "json" }).notNull().default("[]"), // int[] FK to inbounds.id
  outbounds: text({ mode: "json" }).notNull().default("[]"), // int[] FK to outbounds.id
  route_final: int().references(() => Outbounds.id), // FK to outbounds.id
  wg_endpoints: text({ mode: "json" }).notNull().default("[]"), // int[] FK to endpoint_wireguards.id
  rules: text({ mode: "json" }).notNull().default("[]"), // int[] FK to route_rules.id
  rule_sets: text({ mode: "json" }).notNull().default("[]"), // int[] FK to rule_sets.id
  dns_rules: text({ mode: "json" }).notNull().default("[]"), // int[] FK to dns_rules.id
  dns: text({ mode: "json" }).notNull().default("[]"), // int[] FK to dns_servers.id
});
