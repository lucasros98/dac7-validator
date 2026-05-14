import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { mapLibxmlError } from './errors.js';
import type { ValidateOptions, ValidationError, ValidationResult } from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Schemas live next to the package (copied via tsup/postbuild).
// In dev they live one level up at the repo root.
const SCHEMA_CANDIDATES = [
  join(__dirname, '..', 'schemas', 'oecd', 'DPIXML_v1.0.xsd'),
  join(__dirname, '..', '..', 'schemas', 'oecd', 'DPIXML_v1.0.xsd'),
];

let cachedSchema: unknown | null = null;

async function loadSchema(): Promise<unknown> {
  if (cachedSchema) return cachedSchema;

  // Dynamic import keeps libxmljs2 (native dep) lazy so consumers
  // without it installed get a clearer error.
  let libxmljs: typeof import('libxmljs2');
  try {
    libxmljs = await import('libxmljs2');
  } catch (err) {
    throw new Error(
      'libxmljs2 is required for XSD validation. Install it as a peer dependency.',
      { cause: err },
    );
  }

  let lastErr: unknown;
  for (const candidate of SCHEMA_CANDIDATES) {
    try {
      const xsd = await readFile(candidate, 'utf-8');
      cachedSchema = libxmljs.parseXml(xsd);
      return cachedSchema;
    } catch (err) {
      lastErr = err;
    }
  }
  throw new Error(
    `DPI XSD not found. Expected at one of: ${SCHEMA_CANDIDATES.join(', ')}`,
    { cause: lastErr },
  );
}

export async function validateDPI(
  xml: string,
  options: ValidateOptions = {},
): Promise<ValidationResult> {
  const schemaVersion = options.schemaVersion ?? '1.0';

  const libxmljs = await import('libxmljs2');
  const schema = (await loadSchema()) as ReturnType<typeof libxmljs.parseXml>;

  let doc: ReturnType<typeof libxmljs.parseXml>;
  try {
    doc = libxmljs.parseXml(xml);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      valid: false,
      errors: [
        {
          code: 'OECD_DPI_E000',
          severity: 'error',
          path: '',
          message: `XML is not well-formed: ${message}`,
          hint: 'The input is not valid XML. Check encoding, unclosed tags, or invalid characters.',
          docs: 'https://github.com/lucasrosvall/dac7-validator/blob/main/docs/errors/OECD_DPI_E000.md',
        },
      ],
      warnings: [],
      schemaVersion,
    };
  }

  const valid = doc.validate(schema);
  const errors: ValidationError[] = valid
    ? []
    : (doc.validationErrors ?? []).map((e) =>
        mapLibxmlError({
          message: e.message ?? String(e),
          line: typeof e.line === 'number' ? e.line : undefined,
          column: typeof e.column === 'number' ? e.column : undefined,
        }),
      );

  return {
    valid,
    errors,
    warnings: [],
    schemaVersion,
  };
}
