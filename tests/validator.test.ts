import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { validateDPI } from '../src/index.js';
import { isValidSwedishTIN } from '../src/schematron/se.js';
import { luhn } from '../src/schematron/luhn.js';

const FIXTURES = join(import.meta.dirname, 'fixtures');

async function fixture(rel: string): Promise<string> {
  return readFile(join(FIXTURES, rel), 'utf-8');
}

describe('validateDPI — XSD layer', () => {
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

describe('validateDPI — schematron layer', () => {
  it('accepts a Swedish TIN with valid Luhn when jurisdiction=SE', async () => {
    const xml = await fixture('golden/minimal-se.xml');
    const result = await validateDPI(xml, { jurisdiction: 'SE' });
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('rejects a Swedish TIN with invalid Luhn and reports OECD_DPI_S001', async () => {
    const xml = await fixture('invalid/invalid-se-tin-luhn.xml');
    const result = await validateDPI(xml, { jurisdiction: 'SE' });
    expect(result.valid).toBe(false);
    const codes = result.errors.map((e) => e.code);
    expect(codes).toContain('OECD_DPI_S001');
  });

  it('does NOT run Swedish rules when jurisdiction is omitted', async () => {
    const xml = await fixture('invalid/invalid-se-tin-luhn.xml');
    const result = await validateDPI(xml);
    const codes = result.errors.map((e) => e.code);
    expect(codes).not.toContain('OECD_DPI_S001');
  });

  it('does NOT run Swedish rules when jurisdiction is DE', async () => {
    const xml = await fixture('invalid/invalid-se-tin-luhn.xml');
    const result = await validateDPI(xml, { jurisdiction: 'DE' });
    const codes = result.errors.map((e) => e.code);
    expect(codes).not.toContain('OECD_DPI_S001');
  });
});

describe('Luhn algorithm', () => {
  it('accepts known valid sequences', () => {
    expect(luhn('5560000001')).toBe(true);
    expect(luhn('8001011009')).toBe(true);
  });

  it('rejects mutations', () => {
    expect(luhn('5560000002')).toBe(false);
    expect(luhn('5560000000')).toBe(false);
  });

  it('rejects non-digit input', () => {
    expect(luhn('556000000A')).toBe(false);
    expect(luhn('')).toBe(false);
  });
});

describe('isValidSwedishTIN', () => {
  it('accepts 10-digit org-nr with valid Luhn', () => {
    expect(isValidSwedishTIN('5560000001')).toBe(true);
  });

  it('accepts 10-digit personnummer with valid Luhn', () => {
    expect(isValidSwedishTIN('8001011009')).toBe(true);
  });

  it('accepts 12-digit personnummer with valid Luhn on last 10', () => {
    expect(isValidSwedishTIN('198001011009')).toBe(true);
  });

  it('tolerates hyphens and spaces', () => {
    expect(isValidSwedishTIN('556000-0001')).toBe(true);
    expect(isValidSwedishTIN('800101 1009')).toBe(true);
  });

  it('rejects wrong length', () => {
    expect(isValidSwedishTIN('12345')).toBe(false);
    expect(isValidSwedishTIN('12345678901')).toBe(false);
  });

  it('rejects bad Luhn', () => {
    expect(isValidSwedishTIN('5560000002')).toBe(false);
  });
});
