# OECD_DPI_E001 — Element appears in the wrong position

An element is well-formed but appears where the schema does not allow it.

## What it means

XSD schemas enforce element **order** as well as presence. The OECD DPI schema uses `<xs:sequence>` for most complex types, which means children must appear in a specific order. If you put `<DocSpec>` before `<Address>` inside a `<PlatformOperator>`, the parser will reject it even though both elements are otherwise valid.

This error often surfaces when XML is built by string concatenation or by serializing an unordered data structure (like a JavaScript object whose key order isn't guaranteed). Use an XML builder that respects schema order, or write your serializer to emit elements in the order defined by the OECD User Guide.

## Example: broken XML

```xml
<PlatformOperator>
  <Name>Example Marketplace AB</Name>
  <ResCountryCode>SE</ResCountryCode>
  <TIN issuedBy="SE">5560000000</TIN>
</PlatformOperator>
```

`<Name>` appears before `<ResCountryCode>` and `<TIN>`, but the schema requires `ResCountryCode` and `TIN` first.

## Example: fix

```xml
<PlatformOperator>
  <ResCountryCode>SE</ResCountryCode>
  <TIN issuedBy="SE">5560000000</TIN>
  <Name>Example Marketplace AB</Name>
</PlatformOperator>
```

## Common causes

- **Object key order in JavaScript.** `{ Name: ..., ResCountryCode: ... }` serialized to XML produces elements in insertion order, not schema order. Wrap your data in a typed builder, or serialize from an array of `[tagName, value]` pairs.
- **Refactor moved a field.** Adding a new element in the middle of an existing builder can shift order if you forget to insert at the correct position.
- **Copy-pasting from a different schema.** OECD DPI and CRS share concepts but differ in child order. Don't reuse CRS examples verbatim.
- **Optional elements in the wrong slot.** Optional elements (`minOccurs="0"`) must still appear in the right position when present. They don't get a free slot at the end.

## Related codes

- [OECD_DPI_E002](./OECD_DPI_E002.md) — Required child element missing
- [OECD_DPI_E006](./OECD_DPI_E006.md) — Unknown element

## Further reading

- W3C — [`xs:sequence`](https://www.w3.org/TR/xmlschema11-1/#element-sequence)
- OECD DPI User Guide, element-by-element reference for the relevant parent type
