# A-Cup | A罩杯

服务小型机场的代理配置管理平台。

小型机场指的是非经营目的的，几个人一起A钱自建的机场。

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

## Developer Manual

### Tech Stacks
- 后端：手搓Router + DrizzleORM + Zod
- 前端：Vue3 + TS + Vite + Vuetify

INSERT INTO users (username, password, roles) VALUES ('admin', '21232f297a57a5a743894a0e4a801fc3', '["admin"]');
```

这样就有admin权限的用户admin，密码admin
