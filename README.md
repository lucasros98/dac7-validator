# dac7-validator

TypeScript validator for **OECD DPI / EU DAC7** XML reports. Validates against the official XSD with typed, human-readable errors.

[![CI](https://github.com/lucasros98/dac7-validator/actions/workflows/ci.yml/badge.svg)](https://github.com/lucasros98/dac7-validator/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/dac7-validator.svg)](https://www.npmjs.com/package/dac7-validator)
[![license](https://img.shields.io/npm/l/dac7-validator.svg)](./LICENSE)

> **Early pre-release (v0.1).** API will change before 1.0. Today it covers XSD validation, typed errors, a CLI, and one jurisdiction-specific schematron rule (Swedish TIN). See the [roadmap](#roadmap) for what's coming.

## Why

EU directive [DAC7](https://taxation-customs.ec.europa.eu/taxation/tax-transparency-cooperation/administrative-co-operation-and-mutual-assistance/dac7_en) forces digital platforms (marketplaces, rental, ride-share, gig) to report seller income to tax authorities annually. The required format is OECD's [DPI XML Schema](https://www.oecd.org/tax/exchange-of-tax-information/model-rules-for-reporting-by-digital-platform-operators-xml-schema-user-guide-for-tax-administrations.htm) — and getting it wrong means fines up to €900k per filing.

Java and Python have decent tooling for this. Node/TypeScript did not. `dac7-validator` is the start of fixing that.

## Install

```bash
npm install dac7-validator
# or
pnpm add dac7-validator
```

> Requires Node 18+. Uses `libxmljs2` (native dependency) for XSD validation.

## Quick start

### Library

```ts
import { validateDPI } from 'dac7-validator';
import { readFile } from 'node:fs/promises';

const xml = await readFile('./my-report.xml', 'utf-8');
const result = await validateDPI(xml, { jurisdiction: 'SE' });

if (!result.valid) {
  for (const err of result.errors) {
    console.error(`[${err.code}] ${err.path}: ${err.message}`);
    if (err.hint) console.error(`  hint: ${err.hint}`);
  }
}
```

### CLI

```bash
npx dac7-validator validate ./my-report.xml
npx dac7-validator validate ./my-report.xml --jurisdiction SE --json
```

Exit code `0` if valid, `1` if not. Suitable for CI.

## Error codes

Every error has a stable code and a documentation page:

| Code | Meaning |
| --- | --- |
| `OECD_DPI_E000` | XML is not well-formed |
| `OECD_DPI_E001` | Element appears in wrong position |
| `OECD_DPI_E002` | Required child element missing |
| `OECD_DPI_E003` | Value does not match required type |
| `OECD_DPI_E004` | Value not in allowed code list |
| `OECD_DPI_E005` | Required attribute missing |
| `OECD_DPI_E006` | Unknown element |
| `OECD_DPI_E007` | Element not declared in schema |
| `OECD_DPI_E999` | Unmapped schema error |
| `OECD_DPI_S001` | Invalid Swedish TIN (schematron, jurisdiction=SE) |
| `OECD_DPI_S100` | MessageSpec missing MessageRefId (schematron) |

Codes prefixed `E` come from XSD validation; codes prefixed `S` come from schematron business rules.

Full catalog under [docs/errors/](./docs/errors/).

## Schema files

The official OECD DPI XML Schema v1.0 is **bundled** under `schemas/oecd/`. See [schemas/oecd/README.md](./schemas/oecd/README.md) for source and attribution.

## What's in v0.1

- XSD validation against the official OECD DPI XML Schema v1.0 (bundled)
- Typed `ValidationResult` and `ValidationError` with stable error codes
- Per-error documentation pages with hints and broken-then-fixed examples
- `dac7-validator` CLI (`validate` subcommand with `--json` and `--jurisdiction`)
- Schematron infrastructure layered on top of XSD validation
- First jurisdiction rule: Swedish TIN — `OECD_DPI_S001` (Luhn check on org-nr / personnummer)
- Public helpers `isValidSwedishTIN()` and `luhn()`

## Roadmap

Planned for later releases. **Not implemented yet** — don't rely on these in v0.1:

- More jurisdictions: DE, FR, NL, BE (note: FR uses a different schema namespace)
- Full schematron compatibility — compile official OECD `.sch` files with Saxon-JS
- Threshold-rule checks (<30 sales AND <€2000 for goods)
- Correction-report (`CorrDocRefId`) flow validation
- Builder API: `buildDPIReport(data)` → XML
- TIN validation for more jurisdictions
- Hosted browser playground

Track progress in the [CHANGELOG](./CHANGELOG.md) and on the [issue tracker](https://github.com/lucasros98/dac7-validator/issues).

## Contributing

Issues and PRs welcome. If you hit `OECD_DPI_E999` (unmapped schema error), please open an issue with the raw libxml message — we'll add a mapping. If you have access to country-specific schematron rules and example XML, that's especially valuable.

## License

MIT — see [LICENSE](./LICENSE). The bundled OECD XSDs are © OECD; see [schemas/oecd/README.md](./schemas/oecd/README.md) for terms.

---

Built by [Fiive](https://fiive.se).
