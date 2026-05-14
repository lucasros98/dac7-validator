# DAC7 Validator — Error Code Reference

Every validation error from `dac7-validator` carries a stable error code so you can grep, document, and route them. This index links to one page per code.

Codes use the prefix `OECD_DPI_E` (XSD / structural errors) and `OECD_DPI_S` (schematron / business rules). Numbers are stable across versions — we never reuse a retired code.

## XSD / structural errors

| Code | Title |
| --- | --- |
| [OECD_DPI_E000](./OECD_DPI_E000.md) | XML is not well-formed |
| [OECD_DPI_E001](./OECD_DPI_E001.md) | Element appears in the wrong position |
| [OECD_DPI_E002](./OECD_DPI_E002.md) | Required child element missing |
| [OECD_DPI_E003](./OECD_DPI_E003.md) | Value does not match required type |
| [OECD_DPI_E004](./OECD_DPI_E004.md) | Value not in allowed code list |
| [OECD_DPI_E005](./OECD_DPI_E005.md) | Required attribute missing |
| [OECD_DPI_E006](./OECD_DPI_E006.md) | Unknown element |
| [OECD_DPI_E007](./OECD_DPI_E007.md) | Element or attribute not declared in schema |
| [OECD_DPI_E999](./OECD_DPI_E999.md) | Unmapped schema error |

## Schematron / business-rule errors

| Code | Title |
| --- | --- |
| [OECD_DPI_S001](./OECD_DPI_S001.md) | Invalid Swedish TIN (Luhn / length) |
| [OECD_DPI_S100](./OECD_DPI_S100.md) | MessageSpec is missing MessageRefId |

## How to use these pages

1. Run the validator. Each error returned has a `code` and a `docs` URL.
2. Open the page for that code.
3. The page tells you what the error means, shows broken-then-fixed XML, and lists the real-world causes that produce it.

If a page is missing, file an issue at https://github.com/lucasros98/dac7-validator/issues.

## Further reading

- OECD DPI Model Rules and XML Schema User Guide: https://www.oecd.org/tax/exchange-of-tax-information/
- EU DAC7 directive: https://taxation-customs.ec.europa.eu/taxation/tax-transparency-cooperation/administrative-co-operation-and-mutual-assistance/dac7_en
- W3C XML Schema 1.0 spec: https://www.w3.org/TR/xmlschema-0/
