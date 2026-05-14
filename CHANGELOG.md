# Changelog

## 0.1.0 — unreleased

First public version. Scope is intentionally narrow.

### Included
- `validateDPI(xml, options)` — XSD validation against OECD DPI XML Schema v1.0.
- Typed `ValidationResult` and `ValidationError` with stable error codes (`OECD_DPI_E000`–`E999`).
- Schematron infrastructure layered on top of XSD validation (hand-rolled XPath via libxmljs2).
- First baseline schematron rule: `OECD_DPI_S100` — `MessageSpec` must contain `MessageRefId`.
- First jurisdiction-specific rule: `OECD_DPI_S001` — Swedish TIN must be valid 10/12-digit org-nr or personnummer with Luhn check (opt-in via `jurisdiction: 'SE'`).
- Per-error documentation under `docs/errors/<CODE>.md`, linked from every error's `docs` field.
- Human-readable `hint` per error and a `docs` URL per code.
- `dac7-validator validate <file>` CLI with text and `--json` output.
- Dual ESM / CJS build via tsup.
- Public helpers `isValidSwedishTIN()` and `luhn()` exported for downstream reuse.

### Real OECD XSD now bundled

Real OECD DPI XML Schema v1.0 files (2023-04-17) are now shipped under `schemas/oecd/`. All 19 tests pass against the real schema, including the three previously-todo tests for E003 (invalid date), E004 (invalid country code), and E005 (missing required attribute).

The validator now resolves `xs:import` paths correctly using `baseUrl`, so the three OECD XSDs (main + iso + dpistf types) load as a unit.

### Not yet included (planned)
- More jurisdictions: DE, FR, NL, BE (note: FR uses a different namespace, needs a separate XSD bundle).
- Full schematron compatibility via Saxon-JS compiling official `.sch` files.
- Threshold-rule checks (e.g. < 30 sales AND < €2000 for goods).
- Correction-report (`CorrDocRefId`) flow validation.
- XML builder (`buildDPIReport`).
- Hosted browser playground.
