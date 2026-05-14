# Changelog

## 0.1.0 — unreleased

First public version. Scope is intentionally narrow.

### Included
- `validateDPI(xml, options)` — XSD validation against OECD DPI XML Schema v1.0.
- Typed `ValidationResult` and `ValidationError` with stable error codes (`OECD_DPI_E000`–`E999`).
- Human-readable `hint` per error and a `docs` URL per code.
- `dac7-validator validate <file>` CLI with text and `--json` output.
- Dual ESM / CJS build via tsup.

### Not yet included (planned)
- Schematron rules (OECD + jurisdiction-specific).
- TIN validation per jurisdiction.
- Threshold-rule checks (e.g. < 30 sales AND < €2000 for goods).
- Correction-report (`CorrDocRefId`) flow validation.
- XML builder (`buildDPIReport`).
- Hosted browser playground.
