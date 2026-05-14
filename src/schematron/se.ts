import type { Element } from 'libxmljs2';
import type { ValidationError } from '../types.js';
import { luhn } from './luhn.js';

const DOCS_BASE = 'https://github.com/lucasros98/dac7-validator/blob/main/docs/errors';

/**
 * Validate a Swedish TIN string.
 *
 * Accepts:
 *   - organisationsnummer: 10 digits, Luhn check
 *   - personnummer (short): 10 digits, Luhn check
 *   - personnummer (long):  12 digits, Luhn on the last 10
 *
 * Hyphens and spaces are tolerated and stripped before checking.
 */
export function isValidSwedishTIN(raw: string): boolean {
  const cleaned = raw.replace(/[\s-]/g, '');
  if (cleaned.length === 10) return luhn(cleaned);
  if (cleaned.length === 12) return luhn(cleaned.slice(2));
  return false;
}

const NS = { dpi: 'urn:oecd:ties:dpi:v1' };

/**
 * S001 — every <TIN issuedBy="SE"> must be a valid Swedish TIN.
 *
 * libxmljs2 XPath queries are namespace-aware. The DPI namespace must
 * be bound to a prefix in the query.
 */
export function runSwedishRules(doc: import('libxmljs2').Document): ValidationError[] {
  const errors: ValidationError[] = [];
  const tinNodes = doc.find('//dpi:TIN[@issuedBy="SE"]', NS) as Element[];

  for (const node of tinNodes) {
    const value = (node.text() ?? '').trim();
    if (!isValidSwedishTIN(value)) {
      errors.push({
        code: 'OECD_DPI_S001',
        severity: 'error',
        path: node.path(),
        message: `Swedish TIN "${value}" is not a valid organisationsnummer or personnummer (length or Luhn check failed)`,
        line: node.line(),
        hint: 'Swedish TINs are 10 digits (org-nr or short personnummer) or 12 digits (long personnummer). Strip formatting and verify the Luhn checksum.',
        docs: `${DOCS_BASE}/OECD_DPI_S001.md`,
      });
    }
  }

  return errors;
}
