---
description: The documentation of module route rule.
control-codes: [server/route_rules.ts, db/schema.ts#RouteRules]
---

# Doc of Module Route Rule

## Data

Stores in relational database's `route-rules` table.

### Schema

| name           | type   | constraints              | default | description                    |
| -------------- | ------ | ------------------------ | ------- | ------------------------------ |
| id             | serial | PK,U                     |         |                                |
| owner          | int    | FK`users.id`             |         |                                |
| share          | bool   |                          | false   | can other user see it          |
| name           | text   |                          |         | friendly name                  |
| action         | text   | N                        |         |                                |
| outbound       | int    | FK`outbounds.id`,N       |         |                                |
| domain         | text   | N                        |         | match this full domain         |
| domain_suffix  | text   | N                        |         | match domain suffix            |
| domain_keyword | text   | N                        |         | match domain using keyword     |
| domain_regex   | text   | N                        |         | match domain using regular exp |
| rule_set       | int    | N,FK`route-rule_sets.id` |         | match rule-set                 |

#### Action

Action execute on the traffic if match this rule, can be following values:

- `route`: need to specify outbound
- `reject`

## API

### Create

- User must has role `authenticated`.
- `owner` is the current user.

### Edit

- User must be `owner`.
- `id`, `owner` is not editable.

### Export

- Export to proxy profile.
- User must be `owner` or this endpoint is shared.

#### Sing-Box

```json
{
  "domain": "<domain>",
  "domain_suffix": "<domain_suffix>",
  "domain_keyword": "<domain_keyword>",
  "domain_regex": "<domain_regex>",
  "rule_set": "<rule_set>",
  "action": "<action || 'route'>",
  "outbound": "<outbound>",
}
```

## References

- [Sing-Box Configuration - Route Rule](https://sing-box.sagernet.org/configuration/route/rule)
