---
description: Simplified doc of how to use cloudflare in this project, only part related to this project.
---

# Cloudflare Use Doc

## Worker

### Binding

See [Cloudflare Worker Bindings](https://developers.cloudflare.com/workers/wrangler/configuration/#bindings) for how to configure bindings in `wrangler.jsonc`.

After configured, run `pnpm cf-typegen`.

### Runtime API

#### Response

- Create a json body response using `Response.json(body)` instead of `new Response(JSON.stringify(body))`
