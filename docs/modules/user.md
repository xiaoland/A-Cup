---
description: The documentation of module user.
control-codes: [server/users.ts, server/schema.ts#Users]
---

# Doc of Module User

## Data

Stores in relational database's table `users`.

### Schema

| name     | type            | constraints | default       | description |
| -------- | --------------- | ----------- | ------------- | ----------- |
| id       | serial          | PK,U        |               |             |
| username | text            |             |               |             |
| password | text            |             |               | md5 hashed  |
| roles    | array of string |             | authenticated |             |

## API

Root path is `/users`.

### Login

- method `PUT` path `/:username`
- Login a user with username and password.
  - Password should be raw input from user.
- If user not found using username, returns 404 Not Found.
- If password match, authenticate the request and sign a JWT, returns user object logged in in body.
  - JWT will be set on response header `authorization` as bearer token.
  - JWT Payload:
    - `iss`: project name
    - `iat`: timestamp of now
    - `exp`: after `iat` 1h
    - `roles`: user.roles
  - Requests to other APIs requires this token and `payload.exp` will be the current user.
- If not, returns 401 Forbidden.

### Create

- method `POST`, path ``
- Only user with `admin` role can use.
- Insert a row in user table.
  - Username, password and roles can be configured through body.
