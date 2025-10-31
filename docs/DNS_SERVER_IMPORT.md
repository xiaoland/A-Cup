# DNS Server Import Feature

## Overview

The DNS Server Editor now supports importing DNS server configurations from Sing-Box JSON format. This allows users to quickly configure DNS servers by pasting existing Sing-Box configurations.

## Usage

### Accessing the Import Feature

1. Navigate to the Profile Editor
2. Go to the DNS configuration section
3. Add or edit a DNS server
4. Click the "Import" button at the top of the DNS Server Editor

### Import Dialog

The import dialog accepts Sing-Box DNS server JSON in the following formats:

#### UDP DNS Server

```json
{
  "tag": "google-dns",
  "type": "udp",
  "address": "8.8.8.8"
}
```

#### TLS DNS Server

```json
{
  "tag": "cloudflare-tls",
  "type": "tls",
  "address": "tls://1.1.1.1",
  "tls": {
    "enabled": true,
    "server_name": "cloudflare-dns.com"
  }
}
```

#### HTTPS DNS Server

```json
{
  "tag": "google-https",
  "type": "https",
  "address": "https://dns.google/dns-query",
  "tls": {
    "enabled": true
  }
}
```

### Optional Fields

DNS servers can include additional dial fields:

```json
{
  "tag": "custom-dns",
  "type": "udp",
  "address": "8.8.8.8",
  "detour": "proxy-outbound",
  "bind_interface": "eth0",
  "routing_mark": 100,
  "reuse_addr": true,
  "connect_timeout": "5s",
  "tcp_fast_open": true,
  "tcp_multi_path": false,
  "udp_fragment": false,
  "domain_strategy": "prefer_ipv4",
  "fallback_delay": "300ms"
}
```

## Implementation Details

### Components

- **`importDnsServer.vue`**: Dialog component for importing DNS server configurations
- **`dnsServerEditor.vue`**: Updated to include import button and integration

### Validation

The import feature validates input using the `DNSServerSchema` from `schemas/dns.ts`. This ensures:

- Valid JSON format
- Correct DNS server type (udp, tls, or https)
- Required fields are present
- Type-specific fields are validated (e.g., TLS configuration for TLS/HTTPS servers)

### Error Handling

The import dialog displays error messages for:

- Invalid JSON syntax
- Missing required fields
- Invalid server types
- Schema validation failures

## Testing

Comprehensive tests are available in `src/components/dns/importDnsServer.spec.ts`:

- Valid DNS server imports (UDP, TLS, HTTPS)
- Invalid JSON handling
- Schema validation errors
- Dialog visibility and state management

Run tests with:

```bash
pnpm exec vitest --config ./vitest.config.frontend.ts run src/components/dns/importDnsServer.spec.ts
```

## Related Files

- `src/components/dns/importDnsServer.vue` - Import dialog component
- `src/components/dns/dnsServerEditor.vue` - DNS server editor with import button
- `src/components/dns/importDnsServer.spec.ts` - Unit tests
- `schemas/dns.ts` - DNS server schema definitions

## See Also

- [Outbound Import Feature](../src/components/outbounds/importOutbound.vue) - Similar import functionality for outbounds
- [Rule Set Import Feature](../src/components/rule-sets/importRuleSet.vue) - Similar import functionality for rule sets