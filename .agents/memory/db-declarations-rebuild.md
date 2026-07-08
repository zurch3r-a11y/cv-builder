---
name: DB declarations rebuild
description: After adding new Drizzle schema files, api-server typecheck fails until lib/db declarations are rebuilt
---

**Why:** `lib/db` is a TypeScript composite project that emits declaration files to `dist/`. When new schema files are added (e.g. `resumes.ts`), the old `dist/index.d.ts` doesn't know about them. The api-server's tsconfig uses project references to `lib/db`, so it reads the stale declarations.

**How to apply:** After adding any new file to `lib/db/src/schema/` and exporting it from `lib/db/src/schema/index.ts`, run:
```
pnpm -w exec tsc --build lib/db
```
This regenerates `lib/db/dist/` and lets api-server typecheck pass. Note: `pnpm --filter @workspace/db run tsc` won't work because the db package has no `tsc` script — use `pnpm -w exec` to invoke tsc directly.
