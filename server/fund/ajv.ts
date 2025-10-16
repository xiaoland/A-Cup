import Ajv, { ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';

// Lazy-compiled validator for the official Sing-Box JSON Schema
let validatorPromise: Promise<ValidateFunction> | null = null;

const SCHEMA_URL =
  'https://raw.githubusercontent.com/BlackDuty/sing-box-schema/main/schema.json';

async function loadValidator(): Promise<ValidateFunction> {
  if (!validatorPromise) {
    validatorPromise = (async () => {
      const ajv = new Ajv({ allErrors: true, strict: false });
      addFormats(ajv);
      const res = await fetch(SCHEMA_URL, { cf: { cacheTtl: 3600 } } as any);
      if (!res.ok) {
        throw new Error(`Failed to fetch Sing-Box schema: ${res.status}`);
      }
      const schema = await res.json();
      const meta_schemas = await Promise.all([
        'https://json-schema.org/draft/2020-12/schema',
        'https://json-schema.org/draft/2020-12/meta/core',
        'https://json-schema.org/draft/2020-12/meta/applicator',
        'https://json-schema.org/draft/2020-12/meta/unevaluated',
        'https://json-schema.org/draft/2020-12/meta/validation',
        'https://json-schema.org/draft/2020-12/meta/meta-data',
        'https://json-schema.org/draft/2020-12/meta/format-annotation',
        'https://json-schema.org/draft/2020-12/meta/content',
      ].map(url => fetch(url).then(res => res.json())));
      ajv.addMetaSchema(meta_schemas as any);
      return ajv.compile(schema);
    })();
  }
  return validatorPromise;
}

export async function validateSingBoxConfig(config: unknown): Promise<void> {
  const validate = await loadValidator();
  const ok = validate(config);
  if (!ok) {
    const errors = (validate.errors || []).map((e) =>
      `${e.instancePath || '/'} ${e.message || ''}`.trim(),
    );
    const err = new Error(
      `Sing-Box config validation failed: ${errors.join('; ')}`,
    );
    (err as any).errors = validate.errors;
    throw err;
  }
}
