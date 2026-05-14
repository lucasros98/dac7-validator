# OECD_DPI_E007 — Element or attribute not declared in schema

The parser cannot find a declaration for an element or attribute. Usually a namespace problem.

## What it means

`E007` is closely related to [E006](./OECD_DPI_E006.md) but specifically surfaces from `xs:any` lookup failures and missing-import scenarios in libxml. In practice, it almost always means one of three things:

1. The element is in the wrong XML namespace — or in the default namespace when it should be qualified.
2. The schema import that *would* declare this element wasn't loaded (e.g. the supporting `oecddpitypes_v1.0.xsd` or `isodpitypes_v1.0.xsd` was missing).
3. The element is genuinely unknown (a typo or a name from a different schema).

If E006 says "this name is misspelled", E007 says "this name might exist, but I can't find the declaration in the schemas I loaded."

## Example: broken XML

```xml
<?xml version="1.0" encoding="UTF-8"?>
<DPI_OECD version="1.0">
  <MessageSpec>
    <MessageRefId>SE-2025-0001</MessageRefId>
  </MessageSpec>
</DPI_OECD>
```

The root has no `xmlns` declaration, so children fall into the default (empty) namespace and the schema can't find them.

## Example: fix

```xml
<?xml version="1.0" encoding="UTF-8"?>
<DPI_OECD version="1.0" xmlns="urn:oecd:ties:dpi:v1">
  <MessageSpec>
    <MessageRefId>SE-2025-0001</MessageRefId>
  </MessageSpec>
</DPI_OECD>
```

## Common causes

- **Missing default namespace declaration.** Without `xmlns="urn:oecd:ties:dpi:v1"` on the root, every child is in the empty namespace and nothing matches DPI declarations.
- **Wrong namespace URI.** Pasting from CRS examples can carry over `urn:oecd:ties:crs:v2` instead of `urn:oecd:ties:dpi:v1`.
- **Prefixed elements without prefix binding.** `<dpi:MessageSpec>` only works if `xmlns:dpi="..."` is declared somewhere above it.
- **Missing supporting XSD files.** OECD DPI ships as multiple files. If your validator only loads the main schema but not the type schemas it imports, elements declared in the type schemas appear as unknown.
- **Schema location mismatch.** A `schemaLocation` hint that points to a moved or renamed file. Validators that follow hints will fail to load supporting types.
- **Element from a different OECD product.** `<AccountNumber>` is CRS, not DPI. Putting it in a DPI document with no DPI declaration produces E007.

## Related codes

- [OECD_DPI_E006](./OECD_DPI_E006.md) — Unknown element
- [OECD_DPI_E000](./OECD_DPI_E000.md) — XML is not well-formed

## Further reading

- W3C — [XML namespaces](https://www.w3.org/TR/xml-names/)
- W3C — [`xs:import` and `xs:include`](https://www.w3.org/TR/xmlschema11-1/#composition-schemaImport)
- OECD DPI User Guide, "Schema file layout" section
