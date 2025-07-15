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
