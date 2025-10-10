import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const Users = sqliteTable("users", {
  id: int().primaryKey({ autoIncrement: true }),
  username: text().notNull(),
  password: text().notNull(),
});

export const Outbounds = sqliteTable("outbounds", {
  // 主键，自增整数 ID
  id: int("id").primaryKey({ autoIncrement: true }),

  // 节点名称（用于展示或标识）
  name: text("name").notNull(),

  // 节点所属地区，如 "HK"、"JP"、"US"
  region: text("region"),

  // 节点提供方，如 "自建"、"机场A"、"供应商X"
  provider: text("provider"),

  // 节点标签，如 "低延迟"、"游戏"、"备用"
  tag: text("tag"),

  // 出站类型（协议）
  type: text("type").notNull(),

  // 服务器地址（域名或 IP）
  server: text("server").notNull(),

  // 服务器端口号
  server_port: int("server_port").notNull(),

  // 认证信息（JSON）
  credential: text("credential", { mode: "json" }).notNull(),

  // 传输层配置（JSON）
  transport: text("transport", { mode: "json" }).default(sql`'{}'`),

  // TLS 配置（JSON）
  tls: text("tls", { mode: "json" }).default(sql`'{}'`),

  // 连接复用配置（JSON）
  mux: text("mux", { mode: "json" }).default(sql`'{}'`),

  // 其他未覆盖的协议字段（JSON）
  other: text("other", { mode: "json" }).default(sql`'{}'`),

  // 可读取的用户或组（JSON 数组）
  readable_by: text("readable_by", { mode: "json" }).default(sql`'[]'`),

  // 可修改的用户或组（JSON 数组）
  writable_by: text("writable_by", { mode: "json" }).default(sql`'[]'`),

  // 创建时间/更新时间（Unix 秒）
  created_at: int("created_at").default(sql`(strftime('%s', 'now'))`),
  updated_at: int("updated_at").default(sql`(strftime('%s', 'now'))`),
});

export const RuleSets = sqliteTable("rule_sets", {
  // Core fields
  id: int("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  type: text("type").notNull(), // "remote" | "inline"
  format: text("format").notNull().default(sql`'source'`), // e.g. "source" | "binary"
  path: text("path"), // optional local cache path for remote type
  content: text("content").notNull().default(sql`''`),

  // Access control lists (JSON arrays of userId: int)
  readable_by: text("readable_by", { mode: "json" }).notNull().default(sql`'[]'`),
  writeable_by: text("writeable_by", { mode: "json" }).notNull().default(sql`'[]'`),

  // Optional fields for remote updates
  download_detour: text("download_detour"),
  update_interval: text("update_interval"),

  // Deprecated fields kept for backward compatibility
  owner: int("owner").references(() => Users.id),
  share: int("share", { mode: "boolean" }).default(false),
  rules: text("rules", { mode: "json" }), // array of headless rule objects
  url: text("url"),
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
