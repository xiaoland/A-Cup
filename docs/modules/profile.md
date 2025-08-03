---
description: The documentation of module proxy profile.
control-codes: [server/profiles.ts, server/db/schema.ts#Profiles]
---

# Doc of Module Profile

Export proxy profile to object storage or direct download.

## Data

Stores in relational database's table `profiles`

### Schema

| name         | type   | constraints      | default | description                 |
| ------------ | ------ | ---------------- | ------- | --------------------------- |
| id           | serial | PK,U             |         |                             |
| owner        | int    | FK`users.id`     |         |                             |
| name         | text   |                  |         |                             |
| tags         | text[] |                  |         | for what system,device,etc. |
| inbounds     | int[]  |                  |         | FK`inbounds.id`             |
| outbounds    | int[]  |                  |         | FK`outbounds.id`            |
| route_final  | int    | FK`outbounds.id` |         |                             |
| wg_endpoints | int[]  |                  |         | FK`endpoint_wireguards.id`  |
| rules        | int[]  |                  |         | FK`route_rules.id`          |
| rule_sets    | int[]  |                  |         | FK`rule_sets.id`            |
| dns_rules    | int[]  |                  |         | FK`dns_rules.id`            |
| dns          | int[]  |                  |         | FK`dns_servers.id`          |

## API

Basic path is `/profiles`.

### Create

- method `POST`, path ``

### Get By ID

- method `GET`, path `/:id`
- User must has role `authenticated`.
- Query a row in profiles table by id.

### Get all

- method `GET`, path ``
- Get all profiles that owned by current user

### Export

- method `GET`, path `/:profile_id/export`
- Control where to export profile from query parameter `method`, can be following values:
  - `oss`: Object Storage, returns url of the exported object
  - `direct`: Returns exported profile dire
- Control what to export from query parameter `type`, can be following values:
  - `sing-box`: sing-box profile (json format), see [sing-box doc](https://sing-box.sagernet.org/configuration/)
- A profile has these parts and each has a module to cover.
  - DNS
    - [DNS Servers](./dns-servers.md)
    - [DNS Rules](./dns-rules.md)
  - Route
    - [Rules](./route-rule.md)
  - [Endpoint](./endpoint.md)
  - [Inbound](./inbound.md)
  - [Outbound](./outbound.md)

#### Sing-Box

```json
{
  "log": {
    "level": "info",
    "timestamp": true
  },
  "experimental": {
    "cache_file": {
      "enabled": true,
      "store_fakeip": true,
      "store_rdrc": false
    }
  },
  "inbounds": [
    inbound.export(type='sing-box')
    for inbound in inbounds
  ],
  "outbounds": [
    outbound.export(type='sing-box')
    for outbound in outbounds
  ],
  "endpoints": [
    wg_endpoint.export(type='sing-box')
    for wg_endpoint in wg_endpoints
  ],
  "route": {
    "rule_set": [
      rule_set.export(type='sing-box')
      for rule_set in rule_sets
    ],
    "rules": [
      rule.export(type='sing-box')
      for rule in rules
    ],
    "final": "route_final.export(type='sing-box').tag",
    "auto_detect_interface": true
  },
  "dns": {
    "disable_cache": false,
    "disable_expire": false,
    "independent_cache": false,
    "servers": [
      dns_server.export(type='sing-box')
      for dns_server in dns_servers
    ],
    "rules": [
      dns_rule.export(type='sing-box')
      for dns_rule in dns_rules
    ]
  }
}
```

## Interface

### Editor

- Edit basic information of the profile, eg. name, tags...
- Select profile inbounds, outbounds, endpoints, route rules and DNS.
- Edit or create a profile.

### List

- List all profiles owned by current user.
- Click item to edit the profile.
- Export button next to create new button (request to API.Export)
  - Click will activate export mode, can set `type` and `method`, then selecting an item to perform export.
  - Show result in a dialog.
