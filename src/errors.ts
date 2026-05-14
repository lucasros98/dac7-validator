import type { ValidationError } from './types.js';

const DOCS_BASE = 'https://github.com/lucasros98/dac7-validator/blob/main/docs/errors';

interface ErrorPattern {
  pattern: RegExp;
  code: string;
  hint: string;
}

const PATTERNS: ErrorPattern[] = [
  {
    pattern: /element is not expected/i,
    code: 'OECD_DPI_E001',
    hint: 'An element appears in the wrong position or is not allowed here. Check the order of children against the OECD DPI XML Schema User Guide.',
  },
  {
    pattern: /missing child element/i,
    code: 'OECD_DPI_E002',
    hint: 'A required child element is missing. Compare against the canonical example structure.',
  },
  {
    pattern: /\[facet 'enumeration'\]|is not an element of the set|not (a valid )?value for .* enumeration/i,
    code: 'OECD_DPI_E004',
    hint: 'The value is not in the allowed code list. Check OECD code lists (country codes ISO 3166-1, currency ISO 4217, etc.).',
  },
  {
    pattern: /is not a valid value of (the )?(atomic |union )?type|is not a valid value of the local atomic type/i,
    code: 'OECD_DPI_E003',
    hint: 'The element value does not match the required data type (e.g. wrong date format, non-numeric where number expected).',
  },
  {
    pattern: /attribute .* is required/i,
    code: 'OECD_DPI_E005',
    hint: 'A required XML attribute is missing (e.g. issuedBy on TIN element).',
  },
  {
    pattern: /element .* is not declared/i,
    code: 'OECD_DPI_E006',
    hint: 'Unknown element. Either misspelled, in wrong namespace, or not part of the DPI schema.',
  },
  {
    pattern: /no declaration found for/i,
    code: 'OECD_DPI_E007',
    hint: 'Element or attribute is not declared in the schema. Check namespace and element name.',
  },
];

const GENERIC_CODE = 'OECD_DPI_E999';

export function mapLibxmlError(raw: {
  message: string;
  line?: number;
  column?: number;
  path?: string;
}): ValidationError {
  const message = (raw.message ?? '').trim();

  for (const p of PATTERNS) {
    if (p.pattern.test(message)) {
      return {
        code: p.code,
        severity: 'error',
        path: raw.path ?? '',
        message,
        line: raw.line,
        column: raw.column,
        hint: p.hint,
        docs: `${DOCS_BASE}/${p.code}.md`,
      };
    }
  }

  return {
    code: GENERIC_CODE,
    severity: 'error',
    path: raw.path ?? '',
    message,
    line: raw.line,
    column: raw.column,
    hint: 'Unmapped schema error. See the raw message for details.',
    docs: `${DOCS_BASE}/${GENERIC_CODE}.md`,
  };
}
