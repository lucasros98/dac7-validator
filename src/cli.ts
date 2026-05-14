#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { defineCommand, runMain } from 'citty';
import { validateDPI } from './validator.js';
import { JURISDICTIONS, type Jurisdiction } from './types.js';

const main = defineCommand({
  meta: {
    name: 'dac7-validator',
    version: '0.1.2',
    description: 'Validate OECD DPI / EU DAC7 XML reports',
  },
  subCommands: {
    validate: defineCommand({
      meta: { description: 'Validate a DPI XML file against the OECD XSD' },
      args: {
        file: {
          type: 'positional',
          description: 'Path to the XML file',
          required: true,
        },
        jurisdiction: {
          type: 'string',
          description: 'Optional jurisdiction code (e.g. SE, DE, FR)',
        },
        json: {
          type: 'boolean',
          description: 'Output result as JSON',
          default: false,
        },
      },
      async run({ args }) {
        const file = String(args.file);
        let jurisdiction: Jurisdiction | undefined;
        if (args.jurisdiction) {
          const raw = String(args.jurisdiction);
          if (!JURISDICTIONS.has(raw as Jurisdiction)) {
            process.stderr.write(
              `Error: unknown jurisdiction "${raw}". Expected one of: ${[...JURISDICTIONS].join(', ')}.\n`,
            );
            process.exit(2);
          }
          jurisdiction = raw as Jurisdiction;
        }
        const asJson = Boolean(args.json);

        const xml = await readFile(file, 'utf-8');
        const result = await validateDPI(xml, { jurisdiction });

        if (asJson) {
          process.stdout.write(JSON.stringify(result, null, 2) + '\n');
          process.exit(result.valid ? 0 : 1);
        }

        if (result.valid) {
          process.stdout.write(`OK  ${file}  (schema ${result.schemaVersion})\n`);
          process.exit(0);
        }

        process.stdout.write(`FAIL  ${file}  (schema ${result.schemaVersion})\n`);
        for (const err of result.errors) {
          const loc = err.line ? `:${err.line}` : '';
          process.stdout.write(`  [${err.code}] line${loc}  ${err.message}\n`);
          if (err.hint) process.stdout.write(`    hint: ${err.hint}\n`);
          if (err.docs) process.stdout.write(`    docs: ${err.docs}\n`);
        }
        process.exit(1);
      },
    }),
  },
});

// Only auto-run when invoked as a script. Importing this module (e.g. for
// testing) must not trigger argv parsing or process.exit.
const entry = process.argv[1];
if (entry !== undefined && import.meta.url === pathToFileURL(entry).href) {
  runMain(main);
}
