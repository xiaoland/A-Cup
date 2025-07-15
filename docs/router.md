---
control-codes: [server/fund/router.ts]
---

# Router Doc

Router binds (method, path) to a handler and resolves body, path_params for handlers.
It also controls access to some apis by checking roles in access token payload.

## Features

- Bind handlers to (method, path) with `add` method.
- Resolve body, path parameters from request for handlers.
  - Handler can provide zod schema for parsing request body.
  - Handler can provide zod schemas for validating path parameters.
  - Handler can provide zod schema for parsing query parameters.
- Route request to a handler.
- If authoirzation header provided, the token will be verified and decoded.
  Decoded result will also pass to handler.
- Role-Based Access Control.
  - handler tells what roles can access it, defaults to anyone.
  - roles are read from authorization header token's payload claim `roles`.
- Provide handler with DrizzleORM instance connect to Cloudflare D1.
