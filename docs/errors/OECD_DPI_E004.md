# OECD_DPI_E004 — Value not in allowed code list

The value is well-formed and the right type, but it isn't in the schema's enumeration of allowed values.

## What it means

OECD DPI uses code lists for many fields: country codes (ISO 3166-1 alpha-2), currency codes (ISO 4217), TIN-issuing country, document type indicators (`OECD0` – `OECD3`), message type indicators, nexus codes, activity types, and so on. An XSD enumeration is strict — only the listed values are accepted.

This error tells you the value is *almost* right but uses a code that doesn't exist in the relevant list. Common offenders: `UK` instead of `GB`, `EL` vs `GR` for Greece (OECD uses `GR`, EU often uses `EL`), `EUR` vs `EURO`, and homegrown internal codes that never got mapped to the standard.

## Example: broken XML

```xml
<ResCountryCode>UK</ResCountryCode>
<MonAmnt currCode="EURO">1250.00</MonAmnt>
<DocTypeIndic>NEW</DocTypeIndic>
```

- `UK` is not ISO 3166-1; the code is `GB`.
- `EURO` is not ISO 4217; the code is `EUR`.
- `NEW` is not a DPI doc-type indicator; valid values are `OECD0`–`OECD3`.

## Example: fix

```xml
<ResCountryCode>GB</ResCountryCode>
<MonAmnt currCode="EUR">1250.00</MonAmnt>
<DocTypeIndic>OECD1</DocTypeIndic>
```

## Common causes

- **`UK` vs `GB`.** United Kingdom is `GB` in ISO 3166-1. Many UK-based systems hard-code `UK`. Replace at the boundary.
- **`EL` vs `GR`.** EU statistics use `EL` for Greece; OECD and ISO use `GR`. Convert before emitting.
- **`EU` is not a country code.** It exists in some EU-internal lists but isn't ISO 3166-1. Use the actual member state.
- **Made-up currency codes.** `EURO`, `POUND`, `USDOLLAR`. Always use ISO 4217 three-letter codes.
- **Locale-shifted country names.** `SE` is Sweden, but `S` (one letter, old code) is not valid. Some legacy systems still emit one-letter codes.
- **DocTypeIndic confusion.** `OECD0` = resent (not used in DPI), `OECD1` = new, `OECD2` = correction, `OECD3` = deletion. Verify your business logic matches the codes.
- **Custom internal codes.** Your CRM stores `country_id = 47` for Sweden. Map to ISO 3166-1 alpha-2 before serializing.

## Related codes

- [OECD_DPI_E003](./OECD_DPI_E003.md) — Value does not match required type
- [OECD_DPI_E006](./OECD_DPI_E006.md) — Unknown element

## Further reading

- [ISO 3166-1 alpha-2 country codes](https://www.iso.org/iso-3166-country-codes.html)
- [ISO 4217 currency codes](https://www.iso.org/iso-4217-currency-codes.html)
- OECD DPI User Guide, appendix of code lists
