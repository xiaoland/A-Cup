# A-Cup | A罩杯

服务小型机场的代理配置管理平台。

小型机场指的是非经营目的的，几个人一起A钱自建的机场。

提供这些功能：
- 多用户登陆
- 托管配置文件
- 编辑配置文件
  - 配置项
    - 节点与节点组
    - 路由规则
    - DNS以及DNS规则
  - 一个用户可以有多个配置
  - 共享配置项
- 管理员负责配置每个人可使用哪些节点，有什么配置


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
