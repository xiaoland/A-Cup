---
description: The documentation of module inbound.
control-codes: [server/dns.ts, server/dns-rule.ts db/schema.ts#DNSServers, db/schema.ts#DNSRules]
---

# Doc of Module DNS

## Data

### DNS Server Schema

Stores in relational database's table `dns_servers`.

| name               | type   | constraints                  | default | description   |
| ------------------ | ------ | ---------------------------- | ------- | ------------- |
| id                 | serial | PK,U                         |         |               |
| owner              | int    | FK`users.id`                 |         |               |
| share              | bool   |                              | false   |               |
| name               | text   |                              |         |               |
| type               | text   |                              |         |               |
| address            | text   |                              |         |               |
| port               | int    | N                            |         |               |
| outbound_detour    | int    | N,FK`outbounds.id`           |         |               |
| wg_endpoint_detour | int    | N,FK`wireguard_endpoints.id` |         |               |
| tls                | json   | N                            |         | tls options   |
| https              | json   | N                            |         | https options |

#### Type

Type of DNS Server, could be following values:

- `udp`
- `https`
- `http3`
- `quic`
- `tls`
- `tls`

#### Port

A default value is automatically assigned by type:

- `udp`: 53
- `https`: 443
- `tls`: 853

#### HTTPS

Extra options for `https`, `http3` type DNS Server, has following fields:

- `path`
- `headers`: an object

#### TLS

Extra options for `https`, `http3`, `tls`, `quic`

### DNS Rule Schema

Stores in relational database's table `dns_rules`.

| name            | type   | constraints        | default | description           |
| --------------- | ------ | ------------------ | ------- | --------------------- |
| id              | serial | PK,U               |         |                       |
| owner           | int    | FK`users.id`       |         |                       |
| share           | bool   |                    | false   | other user can see it |
| name            | text   |                    |         |                       |
| action          | text   | N                  |         |                       |
| server          | int    | FK`dns_servers.id` |         |                       |
| domains         | text[] | N                  |         |                       |
| domain_suffixes | text[] | N                  |         |                       |
| domain_keywords | text[] | N                  |         |                       |
| rule_sets       | int[]  | FK`rule_set.id`    |         |                       |

#### Action

The action field determines what to do when a DNS rule matches:

- `route`: Route the DNS query to the specified server
- `reject`: Reject the DNS query
- `NULL` (default): Uses default behavior (typically routing to the specified server)

## API

Basic path:

- for DNS Server: `/dns_servers`
- for DNS Rule: `/dns_rules`

### Create

- User must has role `authenticated`.
- `owner` is the current user.

### Edit

- method `PUT`, path `/:id`
- User must be `owner`.
- `id`, `owner` is not editable.

### Get By ID

- method `GET`, path `/:id`
- User must has role `authenticated`.
- Query a row in dns_servers table by id.

### Get all

- method `GET`, path ``
- Get all DNS Servers that current user can access
  - shared DNS Servers
  - DNS Servers owned by current user

## Private Method

### Export DNS Server

- Export to the format that proxy client can understand.
- Takes a parameters `type`, can be
  - `sing-box`

#### DNS Server in Sing-Box

```json
{
  "type": "<type>",
  "tag": "dns.<type>.<name>",
  "server": "<address>",
  "server_port": <port>,
  "detour": "<(outbound_detour || wg_endpoint_detour).export(type='sing-box').tag>"
}
```

### Export DNS Rule

- Export to the format that proxy client can understand.
- Takes a parameters `type`, can be
  - `sing-box`

#### DNS Rule in Sing-Box

```json
{
  "domain": <domains>,
  "domain_suffix": <domain_suffixes>,
  "domain_keyword": <domain_keywords>,
  "rule_set": <rule_sets>,
  "action": "<action || 'route'>",
  "server": "<dns_server.export(type='sing-box').tag>"
}
```

## Interface

### Editor

- Create and edit DNS Server / DNS Rule.
- Request to API.Create, API.Edit.

### List

- List all DNS Servers / DNS Rules current user can access in a list.
  - Request to API.GetAll
- Click list item to edit the DNS Server / DNS Rule.

## References

- [Sing-Box Configuration - DNS Server](https://sing-box.sagernet.org/configuration/dns/server)
- [Sing-Box Configuration - DNS Rule](https://sing-box.sagernet.org/configuration/dns/rule)
