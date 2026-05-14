# OECD DPI XML Schema

This directory must contain the official **OECD Digital Platform Information (DPI) XML Schema v1.0** files.

They are **not redistributed in this repo** until license compatibility is confirmed. Download them yourself from the OECD:

- https://www.oecd.org/tax/exchange-of-tax-information/model-rules-for-reporting-by-digital-platform-operators-xml-schema-user-guide-for-tax-administrations.htm

Drop the files here:

```
schemas/oecd/
├── DPIXML_v1.0.xsd            <- main schema
├── isodpitypes_v1.0.xsd       <- ISO 3166-1 / 4217 types
├── oecddpitypes_v1.0.xsd      <- OECD shared types
└── README.md
```

Once the XSD is in place, the test suite's `it.todo` cases can be promoted to real assertions.

## License note

OECD generally permits redistribution of XML schemas with attribution, but always verify the
current terms at https://www.oecd.org/termsandconditions/ before publishing a bundle.
