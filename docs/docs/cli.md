---
sidebar_position: 20
---

# CLI

Compile all schemas in the `src` directory:

```ts
npx therefore -f src
```

## --files, -f [array] [required]

Globs to scan for schemas, can be both files and directories.

## --ignore-pattern, -i [array]

Globs to exclude from scanning, defaults to ["**/*.d.ts","node_modules"].

## --compile [boolean]

Toggles whether we want AJV standalone validation code or raw JSON Schemas, defaults to `true`.

## --ext [string]

The input extension to scan for Therefore schemas, defaults to `.schema.ts`.

## --out-ext [string]

The output extension for compiled Therefore types, defaults to `.type.ts`.

## --clean [boolean]

When `true` the `schemas` folders that are used for the compiled schemas will be deleted before generating the new schemas, cleaning up any schemas that might nog be relevant anymore. Defaults to `false`.
