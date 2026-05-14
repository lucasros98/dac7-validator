# dac7-validator

TypeScript validator for **OECD DPI / EU DAC7** XML reports. Validates against the official XSD with typed, human-readable errors.

> **Status:** v0.1.0, pre-release. XSD wiring is in place; schematron and jurisdiction-specific rules are on the roadmap.

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

The OECD XSD is **not bundled** in this repo. Download it yourself and drop it in `schemas/oecd/`. See [schemas/oecd/README.md](./schemas/oecd/README.md).

## Roadmap

- [x] XSD validation
- [x] Typed errors with hints
- [x] CLI
- [x] Schematron infrastructure (hand-rolled XPath via libxmljs2)
- [x] First jurisdiction-specific rule: Swedish TIN Luhn check
- [ ] More jurisdictions (DE, FR, NL, BE first)
- [ ] Full schematron compatibility (Saxon-JS, compile official .sch files)
- [ ] Threshold-rule checks (<30 sales AND <€2000 for goods)
- [ ] Correction-report flow
- [ ] Builder API (`buildDPIReport`)
- [ ] Browser playground at dac7-validator.dev

## License

MIT
