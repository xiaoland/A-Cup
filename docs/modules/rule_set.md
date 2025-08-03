---
description: The documentation of module rule set.
control-codes: [server/rule-set.ts, db/schema.ts#RuleSets]
---

# Doc of Module Rule Set

## Data

Stores in relational database's table `rule_sets`.

### Schema

| name  | type   | constraints  | default | description               |
| ----- | ------ | ------------ | ------- | ------------------------- |
| id    | serial | PK,U         |         |                           |
| owner | int    | FK`users.id` |         |                           |
| share | bool   |              | false   | other user can see it     |
| type  | text   |              | remote  |                           |
| name  | text   |              |         | friendly_name             |
| rules | json   | N            |         | an array of headless rule |
| url   | text   | N            |         | remote file url           |

#### Type

Type of Rule Set, can be following values:

- `inline`
- `remote`: a remote file over http(s)

## API

Basic path: `/rule_sets`.

### Create

- User must has role `authenticated`.
- `owner` is the current user.

### Edit

- User must be `owner`.
- `id`, `owner` is not editable.

### Get By ID

- method `GET`, path `/:id`
- User must has role `authenticated`.
- Query a row in rule_sets table by id.

### Get all

- method `GET`, path ``
- Get all rule sets that current user can access
  - shared rule sets
  - rule sets owned by current user

## Private Method

### Export

- Export to the format that proxy client can understand.
- Takes a parameters `type`, can be
  - `sing-box`

#### Sing-Box

```json
{
  "type": "<type>",
  "tag": "rule_set.<type>.<name>",
  "url": "<url>",
  "rules": <rules>
}
```

## Interface

### Editor

- Create and edit rule set.
- Request to API.Create, API.Edit.

### List

- List all rule sets current user can access in a list.
  - Request to API.GetAll
- Click list item to edit the rule set.

## References

- [Sing-Box Configuration - RuleSet](https://sing-box.sagernet.org/configuration/rule-set/)
