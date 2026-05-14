# OECD_DPI_E000 — XML is not well-formed

The input is not valid XML, so no further validation can run.

## What it means

XML has two layers of correctness: **well-formed** and **valid**. Well-formedness is the lower bar — tags must be balanced, attribute quotes must match, special characters must be escaped, and the declared encoding must match the actual bytes. Validity is the higher bar — once the document is well-formed, it has to match the rules in a schema (XSD).

`OECD_DPI_E000` is the well-formedness layer failing. If you see this, the XML parser stopped before it could even start checking against the OECD DPI schema. Fix the structural problem first, then re-run the validator.

The underlying error message from the parser is included in the `message` field — usually a one-line description with the line and column where parsing broke.

## Example: broken XML

```xml
<?xml version="1.0" encoding="UTF-8"?>
<DPI_OECD version="1.0" xmlns="urn:oecd:ties:dpi:v1">
  <MessageSpec>
    <SendingEntityIN>SE1234567890</SendingEntityIN>
  <!-- missing </MessageSpec> -->
</DPI_OECD>
```

Parser error: `Premature end of data in tag MessageSpec`.

## Example: fix

```xml
<?xml version="1.0" encoding="UTF-8"?>
<DPI_OECD version="1.0" xmlns="urn:oecd:ties:dpi:v1">
  <MessageSpec>
    <SendingEntityIN>SE1234567890</SendingEntityIN>
  </MessageSpec>
</DPI_OECD>
```

## Common causes

- **Unclosed tags.** Every `<Tag>` needs `</Tag>`. The parser usually reports the *outermost* unclosed tag, which can be confusing — the actual mistake may be in a deeply nested child.
- **Mismatched encoding.** The XML declaration says `encoding="UTF-8"` but the file is saved as Latin-1 or Windows-1252. Save the file as UTF-8 without BOM, or change the declaration.
- **Unescaped special characters in text or attributes.** Seller names like `Müller & Söhne` need `&amp;` for the ampersand. The five XML predefined entities are `&lt; &gt; &amp; &apos; &quot;`. Use a proper XML builder instead of string concatenation.
- **Stray characters before `<?xml`.** A UTF-8 BOM (`0xEF 0xBB 0xBF`) or whitespace before the XML declaration breaks strict parsers. Strip them.
- **Mixed quote types in attributes.** `<TIN issuedBy="SE'>` is not well-formed. Open and close quotes must match.
- **Control characters in text.** ASCII control characters (most of `0x00–0x1F` except tab, newline, carriage return) are illegal in XML 1.0. Sanitize seller-supplied free-text fields.

## Related codes

- [OECD_DPI_E001](./OECD_DPI_E001.md) — Element in wrong position (well-formed but invalid order)
- [OECD_DPI_E007](./OECD_DPI_E007.md) — Element not declared in schema

## Further reading

- W3C — [Well-formed XML documents](https://www.w3.org/TR/xml/#sec-well-formed)
- OECD DPI User Guide, "XML basics" section
