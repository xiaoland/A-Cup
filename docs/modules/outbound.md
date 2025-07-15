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

### Create

- User must has role `authenticated`.
- `owner` is the current user.

### Edit

- User must has role `authenticated`.
- Only `owner` can edit.
- `id`, `owner` is not editable.

### Export

- Export to proxy profile.
- User must has role `authenticated`.
- - User must be `owner` or this outbound is shared.

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

## References

- [Sing-Box Configuration - Outbound](https://sing-box.sagernet.org/configuration/outbound/)
