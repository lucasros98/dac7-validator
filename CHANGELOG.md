# Changelog

## 0.1.2 — unreleased

Security and packaging hardening after the v0.1 code audit.

### Security
- **Upgraded `libxmljs2` to `^0.37.0`** to clear critical advisory
  GHSA-78h3-pg4x-j8cv (type confusion when parsing crafted XML).
- **Reject XML containing a `<!DOCTYPE>` declaration** up front with
  `OECD_DPI_E000`. DPI XML has no DTD, and rejecting DOCTYPEs makes the
  validator robust against XXE attacks even if libxml2 defaults change.
- **Explicit safe parse options** (`nonet: true`, `noent: false`,
  `dtdload: false`, `dtdvalid: false`) — defence in depth against
  external-entity expansion and SSRF.
- **CI now runs `npm audit --omit=dev --audit-level=high`** so future
  high/critical advisories block merges.

### Fixed
- **CJS entrypoint was crashing on import** because tsup rewrote
  `fileURLToPath(import.meta.url)` to `fileURLToPath(undefined)`. The
  package is now ESM-only (`"exports"` no longer advertises `require`).
  Node 18+ consumers can still use `await import('dac7-validator')` from
  CommonJS.
- **`runMain` no longer auto-executes when `dist/cli.js` is imported as
  a module** — only when invoked as a script. This makes the CLI safely
  testable.
- **`jurisdiction` is now validated at runtime** in both the library and
  the CLI. Unknown codes throw `TypeError` from the API and exit `2`
  from the CLI instead of silently skipping schematron rules.

### Removed
- Unused `fast-xml-parser` dependency. It was never imported and was
  pulling in a moderate-severity advisory (GHSA-gh4j-gqv2-49f6).

### Added
- Test fixtures and regression tests:
  `invalid/doctype-xxe.xml` (DOCTYPE rejection + no XXE leakage) and
  `golden/minimal-se-default-ns.xml` (default-namespace acceptance).
- `JURISDICTIONS` set exported from `types.ts` as the single source of
  truth for valid jurisdiction codes.

## 0.1.1 — 2026-05-14

Patch release. No code or API changes — README, schema attribution, and error-doc cleanup only.

- Removed deep links to regulator sites that were behind Cloudflare or returned 404 (OECD, Skatteverket, Belgium FPS Finance, BZSt). Replaced with "search the site" hints where needed.
- Added "Built by Fiive" credit and link to fiive.se.
- README: clearer pre-release banner, CI / npm / license badges, and a cleaner separation between what's in v0.1 vs the roadmap.
- `prepublishOnly` script now uses npm (typecheck + build + test) instead of pnpm.

## 0.1.0 — 2026-05-14

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
