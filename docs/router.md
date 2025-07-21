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
- Can configure a path prefix, which will be prefixed to path when adding a route.
- Can merge other router's route, to be merged routes' path will be prefixed too.

## Handler

See this section for how handlers use router.

- Get current user id by
  1. unpack `token_payload` from func param
  2. `token_payload.sub`

## Module API

See this section for how business module's API module register an API.

Create a module level router:

```typescript
// file: server/apis/<module_name>.ts

import { Router } from '../fund/router';

export const <MODULE_NAME>_ROUTER = new Router('/<module_name>');
```

Merge module level router into application router:

```typescript
// file: server/index.ts

import { api_router } from './fund/router';
import { <MODULE_NAME>_ROUTER } from `./apis/<module_name>.ts`;

api_router.merge(<MODULE_NAME>_ROUTER);
```

Add route:

```typescript
// file: server/apis/<module_name>.ts

<MODULE_NAME>_ROUTER.add(method, path, handler, advanced_config);
```
