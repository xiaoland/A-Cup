---
description: The documentation of module inbound.
control-codes: [server/inbounds.ts, db/schema.ts#Inbounds]
---

# Doc of Module Inbound

## Data

Stores in relational database's table `inbounds`.

### Schema

| name    | type   | constraints  | default | description           |
| ------- | ------ | ------------ | ------- | --------------------- |
| id      | serial | PK,U         |         |                       |
| owner   | int    | FK`users.id` |         |                       |
| share   | bool   |              | false   | other user can see it |
| type    | text   |              |         |                       |
| address | text   | N            |         |                       |
| port    | int    | N            |         |                       |
| stack   | text   | N            | mixed   | for tun only          |
| mtu     | int    | N            | 9000    | for tun only          |

#### Type

Type of inbound, can be following values:

- `mixed`: start a server on the port to proxy socks5, http(s) traffic
- `tun`: set up a virtual NIC to proxy traffic, useful for transport proxy
  - Process traffic from L3 (mainly TCP, UDP packets)

#### Stack

Network stack use to create a tunnel, can be following values:

- `system`: create TCP connection use kernelsapce, best performance, less compatiability
- `gvisor`: implement IwIP in userspace, best compatiability, less performace
- `mixed`: use system for TCP, gVisor for UDP

## API

Basic path: `/inbounds`.

### Create

- User must has role `authenticated`.
- `owner` is the current user.

### Edit

- User must be `owner`.
- `id`, `owner` is not editable.

### Get By ID

- method `GET`, path `/:id`
- User must has role `authenticated`.
- Query a row in inbounds table by id.

### Get all

- method `GET`, path ``
- Get all inbounds that current user can access
  - shared inbounds
  - inbounds owned by current user

## Private Method

### Export

- Export to the format that proxy client can understand.
- Takes a parameters `type`, can be
  - `sing-box`

#### Sing-Box

```json
{
  "type": "<type>",
  "tag": "in.<type>",
  "listen": "<address>",
  "listen_port": "<port>",
  "stack": "<stack>",  
  "mtu": "<mtu>",
  "address": <addresses>,
  "auto_route": true,
  "auto_redirect": true,
  "strict_route": true
}
```

## Interface

### Editor

- Create and edit inbound.
- Request to API.Create, API.Edit.

### List

- List all inbounds current user can access in a list.
- Click list item to edit the inbound.
- Request to API.GetAll

## References

- [Sing-Box Configuration - Inbound](https://sing-box.sagernet.org/configuration/inbound/)
