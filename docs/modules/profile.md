---
description: The documentation of module proxy profile.
control-codes: [server/profiles.ts, server/db/schema.ts#Profiles]
---

# Doc of Module Profile

Export proxy profile to object storage or direct download.

## Data

Stores in relational database's table `profiles`

### Schema

| name       | type   | constraints  | default | description            |
| ---------- | ------ | ------------ | ------- | ---------------------- |
| id         | serial | PK,U         |         |                        |
| created_by | int    | FK`users.id` |         |                        |
| name       | text   |              |         |                        |
| tags       | text[] |              |         | for what system,device |
| inbounds   | int[]  |              |         | FK`inbounds.id`        |
| outbounds  | int[]  |              |         | FK`outbounds.id`       |
| wg-endpoints  | int[]  |              |         | FK`endpoint-wireguards.id`       |
| rules      | int[]  |              |         | FK`rules.id`           |
| dns_rules  | int[]  |              |         | FK`dns_rules.id`       |
| dns        | int[]  |              |         | FK`dns.id`, DNS Servers             |

## API

Root path is `profile`.

### Create

- method `POST`, path ``

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
    - First outbound will be the fallback.
