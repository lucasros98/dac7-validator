# OECD_DPI_E006 — Unknown element

The XML contains an element the schema does not recognize.

## What it means

XSD validation is closed by default: only elements explicitly declared in the schema (or its imports) are allowed. If you emit `<Comments>` or `<InternalNote>` inside a `<ReportableSeller>` and those aren't part of OECD DPI, you'll get this error.

The cause is usually a typo, a wrong namespace, or contamination from a different XML format. OECD DPI overlaps conceptually with CRS, FATCA, and CbC reporting, and people occasionally copy element names from those without checking they exist in DPI.

## Example: broken XML

```xml
<ReportableSeller>
  <Identity>...</Identity>
  <Comments>Test seller, ignore</Comments>
  <DocSpec>...</DocSpec>
</ReportableSeller>
```

`<Comments>` does not exist in OECD DPI.

## Example: fix

Remove the unknown element entirely. If you need to keep internal notes, store them outside the XML payload (e.g. in your database).

```xml
<ReportableSeller>
  <Identity>...</Identity>
  <DocSpec>...</DocSpec>
</ReportableSeller>
```

## Common causes

- **Typos in element names.** `<ReportablleSeller>` (double l). XML is case-sensitive too — `<reportableSeller>` is a different element than `<ReportableSeller>`.
- **Wrong namespace.** `<MessageRefId>` exists in DPI, CRS, and FATCA — but each in its own namespace. If you mix namespaces, the parser sees the wrong-namespace one as undeclared.
- **Pasted from CRS or CbC.** Elements like `<AccountNumber>`, `<DueDiligence>`, `<ConstEntity>` exist in cousin schemas but not in DPI.
- **Custom extensions.** Some implementers add private elements for internal tracking. OECD DPI does not allow extensions in the report body — keep that data out of the XML.
- **Wrong nesting.** `<Address>` exists, but only inside specific parents. Putting it directly inside `<MessageSpec>` produces an unknown-element error.
- **Schema version drift.** Elements added or removed between schema versions. If you're targeting v1.0 but using a v0.x example, some elements may not yet exist (or may have been renamed).

## Related codes

- [OECD_DPI_E001](./OECD_DPI_E001.md) — Element in wrong position
- [OECD_DPI_E007](./OECD_DPI_E007.md) — Element not declared in schema

## Further reading

- W3C — [XML namespaces](https://www.w3.org/TR/xml-names/)
- OECD DPI User Guide, full element index
