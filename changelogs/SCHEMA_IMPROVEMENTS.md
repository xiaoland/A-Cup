# Schema-Based Improvements to Vue Components

This document outlines the comprehensive improvements made to Vue components to leverage Zod schemas for better type safety, validation, and maintainability.

## Overview

The A-Cup project uses Zod schemas as the single source of truth for data models. This refactoring ensures all Vue components properly utilize these schemas through:

1. **Schema defaults** (`.parse({})`) for initialization
2. **Schema validation** (`.parse()`) before saving/emitting data
3. **Schema-based type switching** for discriminated unions
4. **Proper error handling** for validation failures

## Key Improvements

### 1. Credential Forms

All credential forms now use schema parsing with proper defaults:

#### Files Updated:
- `src/components/outbounds/outboundEditor/vlessForm.vue`
- `src/components/outbounds/outboundEditor/vmessForm.vue`
- `src/components/outbounds/outboundEditor/shadowsocksForm.vue`
- `src/components/outbounds/outboundEditor/hysteria2Form.vue`

**Benefits:**
- Consistent initialization with schema-defined defaults
- Type-safe credential handling
- Better user experience with placeholder values

### 2. Outbound Editor

**File:** `src/components/outbounds/outboundEditor/outboundEditor.vue`

**Key Changes:**
```typescript
// Before: Manual credential initialization
newOutbound.credential = { uuid: '', flow: '' };

// After: Schema-based with defaults and auto-generated UUIDs
newOutbound.credential = VlessCredentialSchema.parse({
    uuid: crypto.randomUUID(),
});
```

**Improvements:**
- Auto-generates UUIDs for VLESS/VMess credentials
- Validates entire outbound before saving with `OutboundSchema.parse()`
- Proper error handling with console logging
- Uses schema defaults for all credential types

### 3. Inbound Editor

**File:** `src/components/inbounds/inboundEditor.vue`

**Key Changes:**
```typescript
// Uses InboundSchema.parse() for type changes
inbound.value = InboundSchema.parse({
    tag,
    type: "mixed",
    listen: "0.0.0.0",
    listen_port: 1080,
});
```

**Improvements:**
- Schema validation on type changes (mixed ↔ tun)
- Proper default values for each inbound type
- Catches and logs parsing errors

### 4. DNS Server Editor

**File:** `src/components/dns/dnsServerEditor.vue`

**Key Changes:**
```typescript
// Uses DNSServerSchema and TLSClientFieldsSchema for type changes
server.value = DNSServerSchema.parse({
    tag,
    type: "tls",
    address: "tls://8.8.8.8",
    tls: TLSClientFieldsSchema.parse({ enabled: true }),
});
```

**Improvements:**
- Proper initialization with example addresses
- TLS fields automatically configured when needed
- Schema-validated configuration

### 5. DNS Rule Editor

**File:** `src/components/dns/dnsRuleEditor.vue`

**Improvements:**
- Maintains rule conditions when changing actions
- Type-safe action handling
- Proper formatting and structure

### 6. Rule Set Editor

**File:** `src/components/rule-sets/RuleSetEditor.vue`

**Key Changes:**
```typescript
// Validate before saving
const validated = RuleSetSchema.parse(localRuleSet.value);
emit("save", validated);

// Parse imported rulesets
localRuleSet.value = RuleSetSchema.parse({
    ...localRuleSet.value,
    ...parsedRuleSet,
});
```

**Improvements:**
- Validation before save operations
- Validation on import operations
- Graceful error handling with fallback

### 7. Special Outbound Editor

**File:** `src/components/outbounds/specialOutboundEditor/specialOutboundEditor.vue`

**Key Changes:**
```typescript
// Use schema.parse() for initialization
localOutbound.value = SelectorOutboundSchema.parse({
    tag: "new-special-outbound",
});

// Type changes with proper defaults
localOutbound.value = UrlTestOutboundSchema.parse({
    tag: currentTag,
});
```

**Improvements:**
- Schema-based defaults for selector, urltest, and direct outbounds
- Proper handling of default values (e.g., `url`, `interval`, `outbounds: []`)
- Type-safe outbound configuration

### 8. Profile Editor

**File:** `src/components/profiles/profileEditor.vue`

**Key Changes:**
```typescript
// Validate before saving
const validated = CreateProfileSchema.parse(props.modelValue);
await profileStore.createProfile(validated);
```

**Improvements:**
- Complete profile validation before creation/update
- Proper error handling with console logging
- Type-safe profile operations

### 9. Edit Profile View

**File:** `src/views/editProfile.vue`

**Key Changes:**
```typescript
// Use schema parsing for nested objects
route: RouteSchema.parse({}),
dns: DnsSchema.parse({ servers: [], rules: [] }),
```

**Improvements:**
- Schema-based initialization for route and DNS
- Consistent defaults on draft clearing
- Proper type safety

### 10. Edit Outbound View

**File:** `src/views/editOutbound.vue`

**Key Changes:**
```typescript
// Use BaseOutboundSchema for defaults
const baseDefaults = BaseOutboundSchema.parse({});
outbound.value = {
    ...baseDefaults,
    type: "vless",
    credential: VlessCredentialSchema.parse({
        uuid: crypto.randomUUID(),
    }),
} as Outbound;
```

**Improvements:**
- Leverages schema defaults for all base fields
- Auto-generates UUIDs for new outbounds
- Type-safe initialization

## Schema Defaults Reference

### Outbound Schemas

```typescript
// BaseOutboundSchema defaults
readableBy: []        // default([])
writeableBy: []       // default([])
name: ''             // default('')
region: ''           // default('')
provider: ''         // default('')
server: ''           // default('')
server_port: 0       // default(0)
tls: {}              // default({})
mux: {}              // default({})
other: {}            // default({})

// VlessCredentialSchema defaults
flow: ''             // default('')

// VmessCredentialSchema defaults
security: 'auto'     // default('auto')
alter_id: 0         // default(0)

// ShadowsocksCredentialSchema defaults
method: ''          // default('')
password: ''        // default('')

// Hysteria2CredentialSchema defaults
password: ''        // default('')

// SelectorOutboundSchema defaults
outbounds: []       // default([])

// UrlTestOutboundSchema defaults
outbounds: []                                    // default([])
url: 'https://www.gstatic.com/generate_204'    // default
interval: '5m'                                   // default
```

## Benefits of Schema-First Approach

### 1. **Maintainability**
- Single source of truth for data structures
- Changes to schemas automatically propagate
- Consistent defaults across the application

### 2. **Type Safety**
- Compile-time type checking with TypeScript
- Runtime validation with Zod
- Discriminated unions work correctly

### 3. **Developer Experience**
- Auto-completion in IDEs
- Clear error messages from Zod
- Less boilerplate code

### 4. **Data Integrity**
- Validation before API calls
- Consistent data structure
- Prevents invalid state

### 5. **Error Handling**
- Predictable error patterns
- Easy to add user-facing error messages
- Graceful degradation

## Best Practices Established

### 1. **Initialization**
```typescript
// ✅ Good: Use schema.parse()
const outbound = BaseOutboundSchema.parse({});

// ❌ Bad: Manual initialization
const outbound = {
    id: undefined,
    name: '',
    readableBy: [],
    // ... many more fields
};
```

### 2. **Type Changes**
```typescript
// ✅ Good: Schema-based with validation
inbound.value = InboundSchema.parse({
    tag,
    type: 'mixed',
    listen: '0.0.0.0',
    listen_port: 1080,
});

// ❌ Bad: Manual object construction
inbound.value = {
    tag,
    type: 'mixed',
    listen: '0.0.0.0',
    listen_port: 1080,
};
```

### 3. **Validation Before Save**
```typescript
// ✅ Good: Validate before saving
try {
    const validated = OutboundSchema.parse(localOutbound.value);
    emit('save', validated);
} catch (error) {
    console.error('Validation error:', error);
    throw error;
}

// ❌ Bad: Save without validation
emit('save', localOutbound.value);
```

### 4. **Error Handling**
```typescript
// ✅ Good: Catch and log errors
try {
    server.value = DNSServerSchema.parse({...});
} catch (error) {
    console.error('Failed to parse DNS server:', error);
    // Optionally show user-facing error
}

// ❌ Bad: Silent failures
server.value = {...};  // Might have invalid data
```

## Future Improvements

### 1. **User-Facing Error Messages**
Currently, validation errors are logged to console. Future work should:
- Display toast notifications for validation errors
- Show field-level validation messages
- Provide actionable error descriptions

### 2. **Form-Level Validation**
Add pre-save validation that:
- Highlights invalid fields
- Prevents save until valid
- Shows validation summary

### 3. **Schema Documentation**
- Generate documentation from schemas
- Create interactive schema explorer
- Provide examples for all schema types

### 4. **Optimistic Parsing**
Use `.safeParse()` in some contexts:
```typescript
const result = OutboundSchema.safeParse(data);
if (result.success) {
    emit('save', result.data);
} else {
    // Handle errors gracefully
    showValidationErrors(result.error);
}
```

### 5. **Schema Extensions**
Consider using `.extend()` for form-specific schemas:
```typescript
const EditOutboundSchema = OutboundSchema.extend({
    // Add UI-specific fields
    _isDirty: z.boolean().optional(),
    _validationErrors: z.array(z.string()).optional(),
});
```

## Testing Recommendations

### 1. **Schema Validation Tests**
```typescript
describe('OutboundEditor', () => {
    it('should validate outbound before saving', () => {
        const invalidOutbound = { /* missing required fields */ };
        expect(() => OutboundSchema.parse(invalidOutbound)).toThrow();
    });
});
```

### 2. **Type Change Tests**
```typescript
it('should initialize correct defaults when changing type', () => {
    const outbound = VlessCredentialSchema.parse({ uuid: 'test' });
    expect(outbound.flow).toBe('');  // default value
});
```

### 3. **Integration Tests**
- Test save operations with invalid data
- Verify error handling
- Check default value propagation

## Conclusion

These schema-based improvements significantly enhance the maintainability and reliability of the A-Cup application. By leveraging Zod schemas as the single source of truth, we ensure:

- **Consistency** across all components
- **Type safety** at compile and runtime
- **Validation** before data operations
- **Better DX** with auto-completion and clear types
- **Reduced bugs** from invalid data states

All Vue components now follow a consistent pattern of schema usage, making the codebase more predictable and easier to maintain.