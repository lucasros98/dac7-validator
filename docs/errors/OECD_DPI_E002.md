# OECD_DPI_E002 — Required child element missing

A child element marked as required in the OECD DPI schema is absent from the parent.

## What it means

In XSD, an element is required when its `minOccurs` is `1` (the default) or higher. The OECD DPI schema marks many fields as required — `MessageRefId`, `TransmittingCountry`, `ReportingPeriod`, the various `DocSpec`/`DocRefId` pairs, and most identifying fields on `PlatformOperator` and `ReportableSeller`.

Missing-required errors are usually conceptual: the field exists in your data model but you forgot to map it, or the upstream source returned `null` and your serializer skipped the element entirely. Empty strings are also rejected for many fields — the OECD User Guide specifies which.

## Example: broken XML

```xml
<MessageSpec>
  <SendingEntityIN>SE1234567890</SendingEntityIN>
  <TransmittingCountry>SE</TransmittingCountry>
  <ReceivingCountry>SE</ReceivingCountry>
  <MessageType>DPI</MessageType>
  <!-- MessageRefId is missing -->
  <MessageTypeIndic>DPI401</MessageTypeIndic>
  <ReportingPeriod>2025-12-31</ReportingPeriod>
  <Timestamp>2026-01-15T09:00:00Z</Timestamp>
</MessageSpec>
```

`MessageRefId` is required and must be globally unique per submission.

## Example: fix

```xml
<MessageSpec>
  <SendingEntityIN>SE1234567890</SendingEntityIN>
  <TransmittingCountry>SE</TransmittingCountry>
  <ReceivingCountry>SE</ReceivingCountry>
  <MessageType>DPI</MessageType>
  <MessageRefId>SE-2025-0001</MessageRefId>
  <MessageTypeIndic>DPI401</MessageTypeIndic>
  <ReportingPeriod>2025-12-31</ReportingPeriod>
  <Timestamp>2026-01-15T09:00:00Z</Timestamp>
</MessageSpec>
```

## Common causes

- **Null in source data.** Your DB returns `null` for `tin`, your serializer omits the element entirely. Either supply a placeholder TIN handling per OECD rules or fail loudly before generating XML.
- **Empty string omitted by serializer.** Some XML libraries skip elements when the value is `""`. The schema requires the element to be present even when its content has length 0 in certain cases — check the OECD User Guide for which fields permit zero-length values.
- **Conditional logic that didn't fire.** "Include `<DocRefId>` only if this is a top-level doc" but the check evaluated wrong.
- **Forgotten `DocSpec` block.** Both `<PlatformOperator>` and each `<ReportableSeller>` need their own `<DocSpec>` with `DocTypeIndic` and `DocRefId`.
- **Missing `Address` or `Name` on a seller.** Required identification fields are easy to skip when porting from internal data that uses different field names.

## Related codes

- [OECD_DPI_E001](./OECD_DPI_E001.md) — Element in wrong position
- [OECD_DPI_E005](./OECD_DPI_E005.md) — Required attribute missing

## Further reading

- W3C — [`minOccurs`](https://www.w3.org/TR/xmlschema11-1/#element-element)
- OECD DPI User Guide, "Mandatory fields" section
