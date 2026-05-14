# OECD_DPI_E005 — Required attribute missing

An XML attribute marked as required in the schema is absent.

## What it means

OECD DPI uses attributes for metadata that qualifies an element's content. The most common required attributes:

- `<TIN issuedBy="...">` — the country that issued the tax identification number
- `<MonAmnt currCode="...">` — the currency of a monetary amount
- `<DPI_OECD version="...">` — the schema version of the message

Attributes are syntactically different from child elements. They cannot be omitted with `null` and they cannot have child content. If your data model treats `TIN` as a string-only field with no country qualifier, you need to add the qualifier at the boundary.

## Example: broken XML

```xml
<TIN>5560000000</TIN>
<MonAmnt>1250.00</MonAmnt>
```

Both elements lack their required attributes.

## Example: fix

```xml
<TIN issuedBy="SE">5560000000</TIN>
<MonAmnt currCode="SEK">1250.00</MonAmnt>
```

## Common causes

- **TIN without `issuedBy`.** The most common missing-attribute error. Every `<TIN>` element in OECD DPI requires `issuedBy` to identify the jurisdiction that issued the identifier. If the seller is tax-resident in Sweden, `issuedBy="SE"`.
- **MonAmnt without `currCode`.** Every monetary amount needs an ISO 4217 currency code as an attribute. There is no default — the schema doesn't infer.
- **Missing schema `version`.** `<DPI_OECD>` requires `version` and the OECD namespace. Most builders set this automatically; hand-written XML often omits it.
- **JSON-to-XML converters.** Tools that map JSON to XML sometimes serialize what should be attributes as child elements (e.g. `<TIN><issuedBy>SE</issuedBy>5560000000</TIN>`). Configure the converter to emit specific fields as attributes.
- **Attribute on the wrong element.** Putting `issuedBy` on `<EntSeller>` instead of on the inner `<TIN>`. Attributes don't bubble up.

## Related codes

- [OECD_DPI_E002](./OECD_DPI_E002.md) — Required child element missing
- [OECD_DPI_E007](./OECD_DPI_E007.md) — Element or attribute not declared

## Further reading

- W3C — [XML attributes](https://www.w3.org/TR/xml/#attdecls)
- OECD DPI User Guide — attribute reference for `TIN`, `MonAmnt`, and other common elements
