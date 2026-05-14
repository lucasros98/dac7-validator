# OECD_DPI_E003 — Value does not match required type

An element's text content does not match the data type declared in the schema.

## What it means

XSD types are strict. `xs:date` means `YYYY-MM-DD` and nothing else — not `DD/MM/YYYY`, not `2025-1-1`, not `2025-12-31T00:00:00`. `xs:decimal` means a decimal number with `.` as separator, not `,`. `xs:dateTime` requires a `T` between the date and time and a timezone designator.

Type-mismatch errors are the most common XSD failure in practice because most internal data systems use locale-specific or simplified formats. The fix is almost always at the serialization boundary: format every value to ISO 8601 / XSD canonical form before emitting XML.

## Example: broken XML

```xml
<ReportingPeriod>31/12/2025</ReportingPeriod>
<Timestamp>2026-01-15 09:00:00</Timestamp>
<MonAmnt currCode="SEK">1.250,00</MonAmnt>
```

- `ReportingPeriod` uses Swedish/UK day-first format instead of ISO.
- `Timestamp` is missing the `T` separator and the timezone.
- `MonAmnt` uses comma as decimal separator and `.` as thousands separator.

## Example: fix

```xml
<ReportingPeriod>2025-12-31</ReportingPeriod>
<Timestamp>2026-01-15T09:00:00Z</Timestamp>
<MonAmnt currCode="SEK">1250.00</MonAmnt>
```

## Common causes

- **Locale-formatted dates.** `Date.toLocaleString()` in JavaScript or `strftime("%x")` in Python produce locale-specific output. Always use `toISOString()` / `isoformat()` for XSD.
- **Decimal comma.** Most of continental Europe uses comma as decimal separator. XSD requires period. Convert before serializing.
- **Thousands separators.** `1,250.00`, `1.250,00`, `1 250,00` all fail. Strip them.
- **Truncated dateTime.** Missing the `Z` (UTC) or `+02:00` timezone designator. XSD `xs:dateTime` with timezone is required by OECD DPI for `Timestamp`.
- **Non-numeric in numeric field.** Empty string or `"N/A"` in an `xs:integer` field. Use `0` or omit the (optional) element.
- **Wrong currency precision.** Some currencies (JPY, KRW, ISK) have zero decimals. The OECD User Guide specifies the precision per field — for `MonAmnt`, two decimals is the safe default.
- **Boolean as string.** `xs:boolean` accepts `true` / `false` / `1` / `0`, not `True` / `Yes` / `No`.

## Related codes

- [OECD_DPI_E004](./OECD_DPI_E004.md) — Value not in allowed code list
- [OECD_DPI_S001](./OECD_DPI_S001.md) — Jurisdiction-specific TIN format (schematron)

## Further reading

- W3C — [XSD built-in datatypes](https://www.w3.org/TR/xmlschema11-2/#built-in-datatypes)
- ISO 8601 — date and time format
- ISO 4217 — currency codes
