---
name: CV Builder migration
description: Lessons from migrating the CV Builder app ZIP into the workspace monorepo
---

**Why:** These were non-obvious blockers encountered during the migration and worth remembering for similar future migrations.

**How to apply:** If modifying this CV Builder project or doing similar full-stack migrations.

1. **BASE_PATH default**: Replit's managed workflow injects `BASE_PATH` but if the workflow ever starts before the artifact is fully registered, it won't be set. Making `BASE_PATH` default to `"/"` (`process.env.BASE_PATH ?? "/"`) prevents the dev server from crashing on startup.

2. **Express body-parser 413**: Base64 photo data from `<canvas>` crop can be 1-3MB. Express defaults to 100kb. Always set `express.json({ limit: "10mb" })` when the app handles image uploads as base64 in JSON bodies.

3. **OpenAPI body schema naming**: Use entity-shaped names (`ResumeInput`, `ResumeUpdate`) NOT operation-shaped names (`CreateResumeBody`, `UpdateResumeBody`) in `components/schemas`. Orval auto-generates `<OperationIdPascal>Body` Zod names — if your component name matches, TS2308 collision breaks the build.

4. **Codegen artifact**: The generated files live at `lib/api-client-react/src/generated/api.ts` and `lib/api-zod/src/generated/api.ts`. Run `pnpm --filter @workspace/api-spec run codegen` after every spec change.
