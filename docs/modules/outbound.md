---
description: The documentation of module outbound.
control-codes: [server/outbounds.ts, db/schema.ts#Outbounds]
---

# Doc of Module Outbound

## Data

Stores in relational database's table `outbounds`.

### Schema

| name            | type   | constraints    | default | description         |
| --------------- | ------ | -------------- | ------- | ------------------- |
| id              | serial | PK,U           |         |                     |
| owner           | int    | FK`users.id`   |         |                     |
| share           | bool   |                | false   | can other user see  |
| type            | text   |                |         |                     |
| outbounds       | int[]  | N              |         | FK`outbounds.id`    |
| region          | text   | N              |         |                     |
| address         | text   | N              |         | server address      |
| port            | int    | N              |         | server port         |
| network         | text   | `udp` or `tcp` |         |                     |
| encryption      | text   | N              |         | encryption method   |
| packet_encoding | text   | N              |         | UDP packet encoding |
| uuid            | text   | N              |         |                     |
| password        | text   | N              |         | raw password        |
| alter_id        | int    | N              |         |                     |
| flow            | text   | N              |         | VLESS sub-protocol  |
| transport       | json   | N              |         |                     |
| tls             | json   | N              |         |                     |

#### Region

The region the computer serves this outbound at, can be following values:

- `gd`: Guangdong, China
- `hk`: HongKong, China
- `sgp`: Singapore
- `osk`: Osaka, Japan
- `tky`: Tokyo, Japan
- `la`: Los Angles, Califorina, USA
- `lv`: Las Vegas, USA

#### Type

Type of outbound, can be following values:

- `direct`
- `urltest`
- `selector`
- `vmess`
- `vless`
- `ss`
- `hysteria2`

## API

Module root path: `/outbounds`

### Get By ID

- method `GET`, path `/:id`
- User must has role `authenticated`.
- Query a row in outbounds table by id.

### Get all

- method `GET`, path `/all`
- Get all outbounds that current user can access
  - shared outbounds
  - outbounds owned by current user

### Create

- method `POST`, path ``
- User must has role `authenticated`.
- `owner` is the current user.

### Edit

- method `PUT`, path `/:id`
- User must has role `authenticated`.
- Only `owner` can edit.
- `id`, `owner` is not editable.

### Export

- method `GET`, path `/:id/export`
- Export to proxy profile.
- User must has role `authenticated`.
- User must be `owner` or this outbound is shared.
- Set export type use query parameter `type`, can be following values
  - `sing-box`

#### Sing-Box

```json
{
  "type": "<type>",
  "tag": "<type>.<region>",
  "server": "<address>",
  "server_port": <port>,
  "uuid": "<uuid>",
  "password": "<password>",
  "alter_id": <alter_id>,
  "method": "<encryption>",
  "security": "<encryption>",
  "network": "<network>",
  "flow": "<flow>",
  "transport": <transport>,
  "tls": <tls>,
}
```

## Interface

### Editor

- Create and edit an outbound
- Request API.Create, API.Edit

## References

- [Sing-Box Configuration - Outbound](https://sing-box.sagernet.org/configuration/outbound/)
