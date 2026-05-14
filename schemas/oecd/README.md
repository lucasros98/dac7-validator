# OECD DPI XML Schema files (v1.0)

This directory contains the official **OECD Digital Platform Information (DPI) XML Schema v1.0** files, downloaded from the OECD on 2023-04-17.

```
schemas/oecd/
├── DPIXML_v1.0.xsd          — main schema (target ns: urn:oecd:ties:dpi:v1)
├── isodpitypes_v1.0.xsd     — ISO 3166-1 / 4217 types
├── oecddpitypes_v1.0.xsd    — OECD shared types (dpistf ns)
└── README.md                — this file
```

## Source

Downloaded from OECD's "Model Rules for Reporting by Digital Platform Operators — XML Schema and User Guide" package. Search the OECD site for the latest version.

## License

OECD's standard terms permit redistribution of XML schemas with attribution for non-commercial use. The schemas are bundled here for developer convenience. If you reuse them downstream, retain attribution to the OECD.

## Member-state variants

Most EU member states publish national mirrors with country-specific schematron extensions. Each tax authority's website hosts the relevant downloads — search for "DAC7" or "DPI XML" on:

- Germany: bzst.de
- Sweden: skatteverket.se
- Belgium: finance.belgium.be
- Ireland: revenue.ie

Note: France's "DPI v1.1-fr1" variant uses a different namespace (`urn:oecd:ties:dpi` without the `:v1` suffix). XML produced for the French portal will NOT validate against this OECD v1.0 schema. If you need French support, add the FR XSD as a sibling directory.
