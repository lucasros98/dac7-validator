# OECD_DPI_S001 — Invalid Swedish TIN

A `<TIN issuedBy="SE">` value is not a structurally valid Swedish organisationsnummer or personnummer.

## What it means

`S001` is a **schematron** rule (business logic), not an XSD rule. The XSD only checks that `<TIN>` is a string with the required `issuedBy` attribute. The schematron rule adds the jurisdiction-specific check: when `issuedBy="SE"`, the value must look like a Swedish tax identifier.

The validator accepts three formats:

| Length | Format | Description |
| --- | --- | --- |
| 10 digits | `NNNNNNNNNN` | Organisationsnummer (e.g. `5560000001`) or short-form personnummer (`YYMMDDNNNN`) |
| 12 digits | `YYYYMMDDNNNN` | Long-form personnummer |

Hyphens and spaces are tolerated and stripped before checking. The check runs the Luhn (mod-10) algorithm against the 10 significant digits.

This rule only fires when you call the validator with `{ jurisdiction: 'SE' }`. Without that option, foreign TINs are accepted as-is.

## Example: broken XML

```xml
<TIN issuedBy="SE">5560000002</TIN>
```

`5560000002` is 10 digits but fails the Luhn checksum.

## Example: fix

```xml
<TIN issuedBy="SE">5560000001</TIN>
```

## Common causes

- **Off-by-one in the checksum.** Manually typed test data often gets the last digit wrong. Use a real value or generate one with the Luhn algorithm.
- **Stored without leading zero.** Org-nrs starting with `0` get truncated to 9 digits in spreadsheets and JSON-as-number storage. Always store as string.
- **Personnummer century missing.** A 12-digit personnummer `198001011009` becomes invalid if you accidentally drop the `19` prefix and pad with another digit. Always preserve the full century.
- **Sample data from documentation.** Many OECD examples use synthetic TINs that don't pass real-country Luhn. Replace before going to production.
- **Mixing in formatting characters.** `556000-0001` is accepted (we strip the hyphen) but `556 000 / 0001` is not — only spaces and `-` are tolerated.

## Related codes

- [OECD_DPI_E005](./OECD_DPI_E005.md) — Required attribute missing (`issuedBy`)
- [OECD_DPI_E003](./OECD_DPI_E003.md) — Value does not match required type

## Further reading

- Wikipedia — [Organisationsnummer (svenska)](https://sv.wikipedia.org/wiki/Organisationsnummer)
- Wikipedia — [Personnummer i Sverige](https://sv.wikipedia.org/wiki/Personnummer_i_Sverige)
- Wikipedia — [Luhn algorithm](https://en.wikipedia.org/wiki/Luhn_algorithm)
- Skatteverket — search "DAC7" on skatteverket.se
