import type { Element } from 'libxmljs2';
import type { ValidationError } from '../types.js';

const DOCS_BASE = 'https://github.com/lucasros98/dac7-validator/blob/main/docs/errors';
const NS = { dpi: 'urn:oecd:ties:dpi:v1' };

/**
 * OECD baseline schematron rules. Hand-rolled XPath for v0.1 — we'll
 * swap to the official .sch ruleset (compiled via Saxon-JS or similar)
 * once support is in place.
 *
 * For now, one placeholder rule that proves the wiring works:
 * S100 — <MessageRefId> must exist inside <MessageSpec>.
 *
 * This is also covered by XSD validation when the full OECD schema is
 * in place. The placeholder XSD does not enforce it, so this rule
 * provides defence-in-depth.
 */
export function runOecdRules(doc: import('libxmljs2').Document): ValidationError[] {
  const errors: ValidationError[] = [];

  const messageSpecs = doc.find('//dpi:MessageSpec', NS) as Element[];
  for (const ms of messageSpecs) {
    const ref = ms.get('dpi:MessageRefId', NS);
    if (!ref) {
      errors.push({
        code: 'OECD_DPI_S100',
        severity: 'error',
        path: ms.path(),
        message: 'MessageSpec is missing a MessageRefId child element',
        line: ms.line(),
        hint: 'Every MessageSpec must contain a globally unique MessageRefId.',
        docs: `${DOCS_BASE}/OECD_DPI_S100.md`,
      });
    }
  }

  return errors;
}
