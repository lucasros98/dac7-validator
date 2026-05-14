import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { validateDPI } from '../src/index.js';

const FIXTURES = join(import.meta.dirname, 'fixtures');

async function fixture(rel: string): Promise<string> {
  return readFile(join(FIXTURES, rel), 'utf-8');
}

describe('validateDPI', () => {
  it('rejects malformed XML with OECD_DPI_E000', async () => {
    const xml = await fixture('invalid/not-well-formed.xml');
    const result = await validateDPI(xml);
    expect(result.valid).toBe(false);
    expect(result.errors[0]?.code).toBe('OECD_DPI_E000');
  });

  it('returns a stable result shape', async () => {
    const xml = await fixture('invalid/not-well-formed.xml');
    const result = await validateDPI(xml);
    expect(result).toMatchObject({
      valid: expect.any(Boolean),
      errors: expect.any(Array),
      warnings: expect.any(Array),
      schemaVersion: '1.0',
    });
  });

  it('accepts the minimal fixture against the placeholder XSD', async () => {
    const xml = await fixture('golden/minimal.xml');
    const result = await validateDPI(xml);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it.todo('reports OECD_DPI_E003 on invalid date format (needs real OECD XSD)');
  it.todo('reports OECD_DPI_E004 on invalid country code (needs real OECD XSD)');
  it.todo('reports OECD_DPI_E005 on missing required attribute (needs real OECD XSD)');
});
