# OECD_DPI_S100 — MessageSpec is missing MessageRefId

A `<MessageSpec>` block does not contain the required `<MessageRefId>` child element.

## What it means

`S100` is a baseline schematron rule that provides defence-in-depth on top of XSD validation. The full OECD DPI XSD also requires `<MessageRefId>` inside `<MessageSpec>`, but the placeholder XSD shipped with this validator (until you drop in the real OECD schema) is permissive. `S100` ensures that even with the placeholder, missing `MessageRefId` is caught.

`MessageRefId` is a globally unique identifier for the submission. Tax authorities use it as the primary key to detect duplicates and route corrections. It must be unique across all submissions you've ever sent — never reuse a value.

## Example: broken XML

```xml
<MessageSpec>
  <SendingEntityIN>SE1234567890</SendingEntityIN>
  <TransmittingCountry>SE</TransmittingCountry>
  <ReceivingCountry>SE</ReceivingCountry>
  <MessageType>DPI</MessageType>
  <MessageTypeIndic>DPI401</MessageTypeIndic>
  <ReportingPeriod>2025-12-31</ReportingPeriod>
  <Timestamp>2026-01-15T09:00:00Z</Timestamp>
</MessageSpec>
```

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

- **Builder forgot to set the field.** The most common case — `MessageRefId` is generated at submission time, and a code path that built a document for testing/diff didn't populate it.
- **Reusing a previous submission's ID.** Strictly speaking that's a different problem (uniqueness, not presence), but teams often "fix" it by clearing the field, which then triggers `S100`.
- **Optional in your internal type system.** If your DTO marks `messageRefId?: string` as optional, you need an assertion before serializing.

## Related codes

- [OECD_DPI_E002](./OECD_DPI_E002.md) — Required child element missing (XSD layer)

## Further reading

- OECD DPI User Guide — `MessageSpec` section
