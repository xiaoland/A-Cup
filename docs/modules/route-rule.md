---
description: The documentation of module route rule.
control-codes: [server/route_rules.ts, db/schema.ts#RouteRules]
---

# Doc of Module Route Rule

## Data

Stores in relational database's `route_rules` table.

### Schema

| name            | type   | constraints        | default | description            |
| --------------- | ------ | ------------------ | ------- | ---------------------- |
| id              | serial | PK,U               |         |                        |
| owner           | int    | FK`users.id`       |         |                        |
| share           | bool   |                    | false   | can other user see it  |
| name            | text   |                    |         | friendly name          |
| action          | text   | N                  |         |                        |
| outbound        | int    | FK`outbounds.id`,N |         |                        |
| domains         | text[] | N                  |         |                        |
| domain_suffixes | text[] | N                  |         |                        |
| domain_keywords | text[] | N                  |         |                        |
| domain_regexes  | text[] | N                  |         |                        |
| rule_sets       | int[]  | N                  |         | FK`route-rule_sets.id` |

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

### Get By ID

- method `GET`, path `/:id`
- User must has role `authenticated`.
- Query a row in route_rules table by id.

### Get all

- method `GET`, path ``
- Get all route rules that current user can access
  - shared route rules
  - route rules owned by current user

## Private Method

### Export

- Export to the format that proxy client can understand.
- Takes a parameters `type`, can be
  - `sing-box`

#### Sing-Box

```json
{
  "domain": <domains>,
  "domain_suffix": <domain_suffixes>,
  "domain_keyword": <domain_keywords>,
  "domain_regex": <domain_regexes>,
  "rule_set": <rule_set.export(type='sing-box').tag for rule_set in rule_sets>,
  "action": "<action || 'route'>",
  "outbound": "<outbound.export(type='sing-box').tag>",
}
```

## Interface

### Editor

- Edit or display a route rule.
- Save will request to API.Edit (API.Create if not created).

### List

- List all route rules current user can access (API.GetAll)
- Item has method `edit`, which active the RouteRuleEditor.
- A create button will insert an item at the top of the list and enable edit mode.

## References

- [Sing-Box Configuration - Route Rule](https://sing-box.sagernet.org/configuration/route/rule)
