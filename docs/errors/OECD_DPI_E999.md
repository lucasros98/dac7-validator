# OECD_DPI_E999 — Unmapped schema error

A validation error the validator did not recognize and so could not map to a specific code.

## What it means

`dac7-validator` maps the most common libxml2 error messages to stable error codes (`E000`–`E007`). When libxml2 emits a message we haven't mapped yet, we return `E999` so you still get a structured result instead of a silent fallthrough. The raw `message` field tells you what libxml2 actually said.

You should rarely see this in practice. When you do, the underlying issue is real — the validator just didn't have a friendly hint for it. Treat the raw message as authoritative and fix accordingly.

If you hit `E999` and the message looks like a common case, please file an issue at https://github.com/lucasros98/dac7-validator/issues with the raw message. We'll add a mapping in the next release.

## Example: broken XML

Any input that produces a libxml2 schema error not matching one of our patterns.

```xml
<!-- The XML itself isn't shown here because E999 is a catch-all.
     Whatever message libxml2 produced will be in `result.errors[i].message`. -->
```

## Example: fix

1. Read the `message` field on the error — it's the raw libxml2 output.
2. Look up the message in the libxml2 documentation or the OECD DPI User Guide.
3. Fix the underlying issue.
4. Re-run the validator.

## Common causes

- **Locale-specific libxml2 message variants.** Some libxml2 builds localize error messages, so our regex patterns don't match. We try to match against the canonical English messages.
- **Edge-case schema constructs.** `xs:assertion`, `xs:alternative`, or other 1.1 features that libxml2 reports differently from 1.0.
- **Very new schema versions.** OECD occasionally updates the DPI schema with new constructs. If our pattern set hasn't caught up, you'll see E999.
- **Validator misuse.** Passing non-DPI XML through the validator (e.g. a CRS document) can produce error messages we haven't seen because they describe the *wrong-schema* mismatch in unusual ways.

## Related codes

All other `E` codes. The hint on `E999` is intentionally generic.

## Further reading

- [libxml2 error reference](http://xmlsoft.org/html/libxml-xmlerror.html)
- File an issue if you hit this: https://github.com/lucasros98/dac7-validator/issues
