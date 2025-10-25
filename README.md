# A-Cup | A罩杯

服务小型机场的代理配置管理平台。

小型机场指的是非经营目的的，几个人一起A钱自建的机场。

[体验demo](https://a-cup.lanzhijiang.workers.dev)，账号admin，密码admin

## Features
- 多用户
- 导出与托管配置文件
  - 托管到D2 OSS
  - 导出为Sing-Box
- 编辑配置文件（所有选项都可以被复用）
  - 入站
    - TUN
    - Mixed System Proxy
  - 出站
    - VLESS
    - VMESS
    - Shadowsocks
    - 手动选择器
    - URLTest自动选择器
  - 端点
    - Wireguard
  - 路由规则与规则集
  - DNS服务器以及DNS规则
    - UDP
    - TLS, HTTPS, HTTP3, QUIC
- 共享、复用配置项
- 自动命名tag
- 深色自适应
- 响应式布局

## Installation

[直接部署到Cloudflare](https://deploy.workers.cloudflare.com/?url=https://github.com/xiaoland/a-cup)

1. `git clone https://github.com/xiaoland/a-cup`
2. `git checkout -b my-deploy`
3. 修改 `wrangler.jsonc` ，配置为你自己的值
   - d1_databases[0].database_name
   - d1_databases[0].database_id
   - r2_buckets[0].bucket_name
   - vars.JWT_SECRET
   - vars.OSS_PUBLIC_DOMAIN
4. `pnpm install`
5. `wrangler d1 migrations apply YOUR_DB_NAME --remote`
6. `pnpm run deploy`

目前初始化没有配置用户，你可以到查询台运行：


```sql
INSERT INTO users (username, password, roles) VALUES ('admin', '21232f297a57a5a743894a0e4a801fc3', '["admin"]');
```

这样就有admin权限的用户admin，密码admin

## Developer Manual

### Tech Stacks
- 后端：Hono + DrizzleORM + Zod
- 前端：Vue3 + TypeScript + Pinia + Zod + PrimeVue

## OpenAPI specs

OpenAPI (OpenAPI 3) spec files live in the `openapi/` folder at the repository root. Two useful helpers are included:

- `openapi/openapi.yaml` — the canonical YAML spec (example/starting point).
- `openapi/viewer.html` — a simple static viewer (Redoc via CDN) that loads `openapi.yaml`.

Helpful npm scripts (run with `pnpm`/`npm`/`npx`):

- `pnpm run openapi:serve:redoc` — use `redoc-cli` to serve the spec and auto-reload during edits (requires `npx` to fetch `redoc-cli`).
- `pnpm run openapi:serve:http` — serve the `openapi/` directory as static files on port 8080 (uses `http-server` via `npx`). Open `http://localhost:8080/viewer.html`.
- `pnpm run openapi:validate` — validate the spec with the Swagger/OpenAPI CLI (`npx @apidevtools/swagger-cli validate openapi/openapi.yaml`).

Editing tips:

- Edit `openapi/openapi.yaml` in your editor (editor YAML plugins and OpenAPI/Swagger extensions give linting/autocomplete).
- The `viewer.html` file uses Redoc from CDN for quick local preview; you can also use `redoc-cli` (installed on demand by `npx`) for a richer dev serve.

If you prefer a richer web editor, consider running the official Swagger Editor locally or using Redocly's tooling. See the repository `openapi/` folder for the example spec to start from.
