# Schema Usage Guide for Vue Components

A practical guide for developers working with Zod schemas in A-Cup Vue components.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Common Patterns](#common-patterns)
3. [Schema Methods](#schema-methods)
4. [Real-World Examples](#real-world-examples)
5. [Troubleshooting](#troubleshooting)

## Quick Start

### Basic Import

```typescript
// Import the schema and type
import { OutboundSchema, type Outbound } from '../../../schemas/outbound';
```

### Initialize with Defaults

```typescript
// Use .parse({}) to get schema defaults
const newOutbound = OutboundSchema.parse({});

// For discriminated unions, specify the type
const vlessOutbound = OutboundSchema.parse({
  type: 'vless',
  credential: { uuid: crypto.randomUUID() }
});
```

### Validate Before Save

```typescript
function save() {
  try {
    const validated = OutboundSchema.parse(localData.value);
    emit('save', validated);
  } catch (error) {
    console.error('Validation error:', error);
    // Show user-friendly error message
  }
}
```

## Common Patterns

### Pattern 1: Form Initialization

```typescript
const profile = ref<CreateProfile>({
  name: "",
  tags: [],
  referencedOutbounds: [],
  referencedRuleSets: [],
  outbounds: [],
  route: RouteSchema.parse({}),        // ✅ Use schema for nested objects
  dns: DnsSchema.parse({ 
    servers: [], 
    rules: [] 
  }),
  inbounds: [],
});
```

### Pattern 2: Type Switching (Discriminated Unions)

```typescript
const onTypeChange = (newType: 'mixed' | 'tun') => {
  const tag = inbound.value.tag;
  
  try {
    if (newType === 'mixed') {
      inbound.value = InboundSchema.parse({
        tag,
        type: 'mixed',
        listen: '0.0.0.0',
        listen_port: 1080,
      });
    } else {
      inbound.value = InboundSchema.parse({
        tag,
        type: 'tun',
        address: ['172.19.0.1/30'],
      });
    }
  } catch (error) {
    console.error('Failed to parse inbound:', error);
  }
};
```

### Pattern 3: Partial Updates

```typescript
// Merge existing data with changes
const updated = OutboundSchema.parse({
  ...existingOutbound,
  ...changes,
});
```

### Pattern 4: Nested Object Initialization

```typescript
// For objects with nested schemas
const dnsServer = DNSServerSchema.parse({
  tag: 'google',
  type: 'tls',
  address: 'tls://8.8.8.8',
  tls: TLSClientFieldsSchema.parse({ enabled: true }),
});
```

## Schema Methods

### `.parse(data)`

**Purpose:** Validate and return typed data. Throws error on failure.

```typescript
// ✅ Use for: Save operations, type changes, initialization
try {
  const valid = OutboundSchema.parse(data);
  await api.save(valid);
} catch (error) {
  // Handle validation error
}
```

### `.safeParse(data)`

**Purpose:** Validate without throwing. Returns `{ success, data, error }`.

```typescript
// ✅ Use for: Optional validation, graceful error handling
const result = OutboundSchema.safeParse(data);
if (result.success) {
  emit('save', result.data);
} else {
  showErrors(result.error.issues);
}
```

### `.partial()`

**Purpose:** Make all fields optional.

```typescript
// ✅ Use for: Patch/update operations
const PartialOutboundSchema = OutboundSchema.partial();
const updates = PartialOutboundSchema.parse({ name: 'New Name' });
```

### `.extend()`

**Purpose:** Add or override fields.

```typescript
// ✅ Use for: Form-specific schemas
const FormOutboundSchema = OutboundSchema.extend({
  _isDirty: z.boolean().default(false),
});
```

### `.pick()` / `.omit()`

**Purpose:** Select or exclude fields.

```typescript
// ✅ Use for: Creating subset schemas
const OutboundSummarySchema = OutboundSchema.pick({
  id: true,
  name: true,
  type: true,
});
```

## Real-World Examples

### Example 1: New Outbound Form

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { 
  BaseOutboundSchema, 
  VlessCredentialSchema,
  type Outbound 
} from '../../schemas/outbound';

const outbound = ref<Outbound | null>(null);

onMounted(() => {
  // Initialize with schema defaults
  const baseDefaults = BaseOutboundSchema.parse({});
  outbound.value = {
    ...baseDefaults,
    type: 'vless',
    credential: VlessCredentialSchema.parse({
      uuid: crypto.randomUUID(),
    }),
  } as Outbound;
});

async function save() {
  try {
    // Validate before API call
    const validated = OutboundSchema.parse(outbound.value);
    await outboundStore.create(validated);
    router.push('/outbounds');
  } catch (error) {
    console.error('Validation failed:', error);
    toast.error('Please check all required fields');
  }
}
</script>
```

### Example 2: Type Switcher Component

```vue
<script setup lang="ts">
import { computed } from 'vue';
import { 
  DNSServerSchema, 
  type DNSServer 
} from '../../../schemas/dns';
import { TLSClientFieldsSchema } from '../../../schemas/shared';

const props = defineProps<{ modelValue: DNSServer }>();
const emit = defineEmits(['update:modelValue']);

const server = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const onTypeChange = (newType: 'udp' | 'tls' | 'https') => {
  const tag = server.value.tag;
  
  try {
    const configs = {
      udp: { tag, type: 'udp', address: '8.8.8.8' },
      tls: { 
        tag, 
        type: 'tls', 
        address: 'tls://8.8.8.8',
        tls: TLSClientFieldsSchema.parse({ enabled: true }),
      },
      https: {
        tag,
        type: 'https',
        address: 'https://dns.google/dns-query',
        tls: TLSClientFieldsSchema.parse({ enabled: true }),
      },
    };
    
    server.value = DNSServerSchema.parse(configs[newType]);
  } catch (error) {
    console.error('Type change failed:', error);
  }
};
</script>
```

### Example 3: Import with Validation

```typescript
function onImport(data: unknown) {
  try {
    // Validate imported data
    const parsed = RuleSetSchema.parse(data);
    
    // Merge with existing
    localRuleSet.value = {
      ...localRuleSet.value,
      ...parsed,
    };
    
    toast.success('Imported successfully');
  } catch (error) {
    console.error('Import validation failed:', error);
    toast.error('Invalid ruleset format');
  }
}
```

### Example 4: Conditional Schema Validation

```typescript
const save = async () => {
  // Different validation based on mode
  const schema = isAdvancedMode.value 
    ? FullOutboundSchema 
    : BasicOutboundSchema;
    
  try {
    const validated = schema.parse(formData.value);
    await api.save(validated);
  } catch (error) {
    handleValidationError(error);
  }
};
```

## Troubleshooting

### Issue: "Cannot read property of undefined"

**Cause:** Trying to access nested properties before parsing.

```typescript
// ❌ Bad
const port = inbound.listen_port; // May not exist yet

// ✅ Good
const inbound = InboundSchema.parse(data);
const port = inbound.type === 'mixed' ? inbound.listen_port : undefined;
```

### Issue: "Expected object, received string"

**Cause:** Schema expects object but got primitive.

```typescript
// ❌ Bad
dns: { servers: 'google', rules: [] }

// ✅ Good
dns: DnsSchema.parse({ 
  servers: [{ type: 'udp', tag: 'google', address: '8.8.8.8' }], 
  rules: [] 
})
```

### Issue: "Discriminator property 'type' not found"

**Cause:** Missing discriminator in union type.

```typescript
// ❌ Bad
const outbound = OutboundSchema.parse({ name: 'test' });

// ✅ Good
const outbound = OutboundSchema.parse({ 
  type: 'vless',  // Required discriminator
  name: 'test',
  credential: { uuid: crypto.randomUUID() }
});
```

### Issue: "Invalid UUID"

**Cause:** UUID validation failed.

```typescript
// ❌ Bad
credential: { uuid: '' }

// ✅ Good
credential: VlessCredentialSchema.parse({ 
  uuid: crypto.randomUUID() 
})
```

### Issue: Schema defaults not applied

**Cause:** Not using `.parse()` or `.default()`.

```typescript
// ❌ Bad - No defaults
const credential = { uuid: 'some-uuid' };

// ✅ Good - Gets schema defaults
const credential = VlessCredentialSchema.parse({ 
  uuid: 'some-uuid' 
}); // flow: '' applied automatically
```

## Performance Tips

### 1. Parse Once, Use Many Times

```typescript
// ❌ Avoid: Parsing in computed
const computed = computed(() => {
  return OutboundSchema.parse(data.value); // Runs on every access
});

// ✅ Better: Parse in watch
watch(data, (newData) => {
  parsed.value = OutboundSchema.parse(newData);
}, { deep: true });
```

### 2. Use .safeParse() for Optional Validation

```typescript
// ✅ Validate user input without blocking
const result = InputSchema.safeParse(userInput);
if (result.success) {
  // Proceed
} else {
  // Show warning, but don't block
}
```

### 3. Lazy Schema Creation

```typescript
// ✅ Create schema only when needed
const getSchema = (mode: 'basic' | 'advanced') => {
  return mode === 'basic' ? BasicSchema : AdvancedSchema;
};
```

## Best Practices Checklist

- [ ] Always parse imported/external data
- [ ] Validate before API calls
- [ ] Use schema defaults for initialization
- [ ] Handle validation errors gracefully
- [ ] Log errors for debugging
- [ ] Show user-friendly error messages
- [ ] Use discriminated unions correctly
- [ ] Parse nested objects with their schemas
- [ ] Prefer `.parse()` for critical paths
- [ ] Use `.safeParse()` for user input
- [ ] Keep schema logic in setup, not template
- [ ] Document complex schema usage

## Schema Composition

### Combining Schemas

```typescript
// Merge multiple schemas
const ExtendedOutbound = BaseOutboundSchema
  .merge(MetadataSchema)
  .merge(TimestampSchema);

// Intersection for stricter validation
const StrictOutbound = z.intersection(
  OutboundSchema,
  z.object({ _metadata: MetadataSchema })
);
```

### Conditional Schemas

```typescript
// Schema based on condition
const getCredentialSchema = (type: OutboundType) => {
  switch (type) {
    case 'vless': return VlessCredentialSchema;
    case 'vmess': return VmessCredentialSchema;
    case 'shadowsocks': return ShadowsocksCredentialSchema;
    case 'hysteria2': return Hysteria2CredentialSchema;
  }
};
```

## Additional Resources

- [Zod Documentation](https://zod.dev)
- Project schemas: `schemas/` directory
- Schema improvements: `docs/SCHEMA_IMPROVEMENTS.md`
- Type definitions: Generated from schemas with `z.infer<>`

## Quick Reference Card

```typescript
// Initialize
const data = Schema.parse({});

// Validate
const valid = Schema.parse(userInput);

// Safe validate
const result = Schema.safeParse(userInput);

// Type change
const newData = Schema.parse({ type: 'new', ...existing });

// Nested
const nested = ParentSchema.parse({
  child: ChildSchema.parse({})
});

// Defaults
const withDefaults = Schema.parse({});

// Auto UUID
crypto.randomUUID()
```

---

**Remember:** Schemas are your friends! They prevent bugs, ensure data integrity, and make your code more maintainable. When in doubt, parse it out! 🎉