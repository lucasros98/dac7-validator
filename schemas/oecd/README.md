# OECD DPI XML Schema files

This directory must contain the official **OECD Digital Platform Information (DPI) XML Schema v1.0** files. They are **not redistributed in this repo** — OECD's site is behind Cloudflare and the schema's license terms must be reviewed by each user before redistribution.

## Manual download (5 minutes)

1. **Open in a browser** (curl is blocked by Cloudflare):
   https://www.oecd.org/en/topics/sub-issues/tax-transparency-and-international-co-operation/digital-platform-reporting.html

2. Look for the **"DPI XML Schema and User Guide"** package. As of writing it ships as a ZIP file.

3. Extract the ZIP. You should get at minimum:
   - `DPIXML_v1.0.xsd` — main schema
   - `isodpitypes_v1.0.xsd` — ISO 3166-1 / 4217 types
   - `oecddpitypes_v1.0.xsd` — OECD shared types
   - User guide PDF (keep separately, you'll want to read it)

4. **Copy the three `.xsd` files into this directory**, replacing the placeholder:

   ```
   schemas/oecd/
   ├── DPIXML_v1.0.xsd
   ├── isodpitypes_v1.0.xsd
   └── oecddpitypes_v1.0.xsd
   ```

5. Run the test suite:

   ```bash
   npx vitest run
   ```

   The three `it.todo` tests in `tests/validator.test.ts` can now be promoted to real `it()` cases. If you'd like the validator to validate against the full schema by default, no code changes are needed — `src/validator.ts` already loads the file at this path.

## License note

OECD's standard terms (https://www.oecd.org/termsandconditions/) generally permit redistribution of XML schemas with attribution, but **always re-check the specific terms in the schema package** before bundling the XSD into a public npm release. If unsure, leave the schema un-bundled and ask users to download it themselves (current setup).

## Alternative sources

Some EU member states' tax authorities mirror the OECD DPI schema with national extensions. These are useful for jurisdiction-specific testing:

- **Germany (BZSt):** https://www.bzst.de/EN/Businesses/DPI_DAC7/dpi_dac7_node.html
- **Sweden (Skatteverket):** https://www.skatteverket.se/foretag/internationellt/dac7.4.html
- **Belgium (FPS Finance):** https://finance.belgium.be/en/enterprises/dac7
- **Ireland (Revenue):** https://www.revenue.ie/en/online-services/services/digital-services/dac7-reporting.aspx

These mirrors are typically not behind Cloudflare and can be downloaded directly. The core OECD schema is identical; only the country-specific schematron differs.
