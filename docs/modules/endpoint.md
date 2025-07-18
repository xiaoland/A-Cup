---
description: The documentation of module endpoint.
control-codes: [server/endpoints.ts, db/schema.ts#EndpointWireguards]
---

# Doc of Module Endpoint

## Data

Different type of endpoint has a big difference on their configuration,
so give every type of wireguard a table.

### Wireguard Schema

Stores in relational database's table `endpoint-wireguards`.

| name          | type   | constraints  | default | description                            |
| ------------- | ------ | ------------ | ------- | -------------------------------------- |
| id            | serial | PK,U         |         |                                        |
| owner         | int    | FK`users.id` |         |                                        |
| share         | bool   |              | false   | can other user see it                  |
| name          | text   | N            |         | custom system interface name           |
| system        | bool   |              | false   | use system interface                   |
| addresses     | text[] |              |         | Ipv4(6) addr assigned to the interface |
| private_key   | text   |              |         |                                        |
| public_key    | text   |              |         |                                        |
| preshared_key | text   | N            |         |                                        |
| peers         | json   |              | []      |                                        |
| mtu           | int    | N            | 1408    |                                        |

#### Peers

An array of Peer object. Peer object has following properties:

- id: ref to another wireguard type endpoint
- address: IP or domain of the peer
- port: the port peer listening to
- allowed_ips: an array of ip should route to this peer

## API

### Create

- User must has role `authenticated`.
- `owner` is the current user.

### Edit

- User must be `owner`.
- `id`, `owner` is not editable.

### Export

- Export to proxy profile.
- User must has role `authenticated`.
- User must be `owner` or this endpoint is shared.

#### Sing-Box

```json
{
  "type": "wireguard",
  "tag": "wg.<name>",
  "system": "<system>",
  "name": "<name>",
  "mtu": <mtu>,
  "address": <addresses>,
  "peers": <peers joined (select public_key, pre_shared_key from endpoint-wireguards where id=id)>,
  "private_key": "<private_key>"
}
```

## References

- [Sing-Box Configuration - Endpoint](https://sing-box.sagernet.org/configuration/endpoint/)
