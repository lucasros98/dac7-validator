import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { mapLibxmlError } from './errors.js';
import { runOecdRules } from './schematron/oecd.js';
import { runSwedishRules } from './schematron/se.js';
import { JURISDICTIONS } from './types.js';
import type {
  Jurisdiction,
  ValidateOptions,
  ValidationError,
  ValidationResult,
} from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// libxml2 parse options. Defence-in-depth against XXE/SSRF:
//   - noent: false  → do not expand external entities
//   - nonet: true   → never fetch external resources over the network
//   - dtdload/dtdvalid: false → do not load or validate against DTDs
//   - huge: false   → reject pathologically large inputs (default, but explicit)
const SAFE_PARSE_OPTS = {
  noent: false,
  nonet: true,
  dtdload: false,
  dtdvalid: false,
  huge: false,
} as const;

// DPI XML must not declare a DOCTYPE. Reject up front to avoid coupling
// our safety stance to libxml2's default options. Cheap string check
// before parsing — XML lets at most one <!DOCTYPE> in the prolog.
const DOCTYPE_RE = /<!DOCTYPE\b/i;

// Schemas live next to the package (copied via tsup/postbuild).
// In dev they live one level up at the repo root.
const SCHEMA_CANDIDATES = [
  join(__dirname, '..', 'schemas', 'oecd', 'DPIXML_v1.0.xsd'),
  join(__dirname, '..', '..', 'schemas', 'oecd', 'DPIXML_v1.0.xsd'),
];

let cachedSchema: unknown | null = null;

async function loadSchema(): Promise<unknown> {
  if (cachedSchema) return cachedSchema;

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
      // baseUrl lets libxml2 resolve xs:import schemaLocation paths
      // relative to the XSD file (it imports isodpitypes_v1.0.xsd and
      // oecddpitypes_v1.0.xsd as siblings).
      const xsd = await readFile(candidate, 'utf-8');
      cachedSchema = libxmljs.parseXml(xsd, {
        ...SAFE_PARSE_OPTS,
        baseUrl: candidate,
      });
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

/**
 * Run all schematron-style business rules.
 *
 * v0.1 uses hand-rolled XPath via libxmljs2 instead of a real schematron
 * engine. This keeps the dependency surface small. Once the rule set
 * grows, swap in Saxon-JS to run the official OECD .sch files.
 */
function runSchematron(
  doc: import('libxmljs2').Document,
  jurisdiction: Jurisdiction | undefined,
): ValidationError[] {
  const errors: ValidationError[] = [];
  errors.push(...runOecdRules(doc));
  if (jurisdiction === 'SE') errors.push(...runSwedishRules(doc));
  return errors;
}

export async function validateDPI(
  xml: string,
  options: ValidateOptions = {},
): Promise<ValidationResult> {
  const schemaVersion = options.schemaVersion ?? '1.0';

  if (options.jurisdiction !== undefined && !JURISDICTIONS.has(options.jurisdiction)) {
    throw new TypeError(
      `Unknown jurisdiction "${options.jurisdiction}". Expected one of: ${[...JURISDICTIONS].join(', ')}.`,
    );
  }

  const libxmljs = await import('libxmljs2');
  const schema = (await loadSchema()) as ReturnType<typeof libxmljs.parseXml>;

  if (DOCTYPE_RE.test(xml)) {
    return {
      valid: false,
      errors: [
        {
          code: 'OECD_DPI_E000',
          severity: 'error',
          path: '',
          message: 'XML declares a DOCTYPE. DPI XML must not contain a document type declaration.',
          hint: 'Remove the <!DOCTYPE …> declaration. DTDs are not part of the OECD DPI schema and are rejected to prevent XXE attacks.',
          docs: 'https://github.com/lucasros98/dac7-validator/blob/main/docs/errors/OECD_DPI_E000.md',
        },
      ],
      warnings: [],
      schemaVersion,
    };
  }

  let doc: ReturnType<typeof libxmljs.parseXml>;
  try {
    doc = libxmljs.parseXml(xml, SAFE_PARSE_OPTS);
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
          docs: 'https://github.com/lucasros98/dac7-validator/blob/main/docs/errors/OECD_DPI_E000.md',
        },
      ],
      warnings: [],
      schemaVersion,
    };
  }

  const xsdValid = doc.validate(schema);
  const xsdErrors: ValidationError[] = xsdValid
    ? []
    : (doc.validationErrors ?? []).map((e) =>
        mapLibxmlError({
          message: e.message ?? String(e),
          line: typeof e.line === 'number' ? e.line : undefined,
          column: typeof e.column === 'number' ? e.column : undefined,
        }),
      );

  // Skip schematron when XSD has already failed — running business
  // rules on structurally broken XML produces noisy, often duplicate
  // errors.
  const schematronErrors = xsdValid ? runSchematron(doc, options.jurisdiction) : [];

  const errors = [...xsdErrors, ...schematronErrors];
  return {
    valid: errors.length === 0,
    errors,
    warnings: [],
    schemaVersion,
  };
}
