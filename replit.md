# CVCraft — CV Builder

A full-stack CV/resume builder app. Users can create, edit, and manage professional CVs with multiple templates and colour themes.

## Run & Operate

- `pnpm --filter @workspace/cv-generator run dev` — run the frontend (Vite dev server)
- `pnpm --filter @workspace/api-server run dev` — run the API server (Express)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — auto-provided by Replit's built-in PostgreSQL

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, shadcn/ui, TanStack Query, Wouter
- API: Express 5
- DB: PostgreSQL (Replit built-in) + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec in `lib/api-spec/openapi.yaml`)
- Build: esbuild (CJS bundle for API server)

## Where things live

- `artifacts/cv-generator/` — React + Vite frontend
- `artifacts/api-server/` — Express API server
- `lib/db/src/schema/resumes.ts` — DB schema (source of truth)
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for API contracts)
- `lib/api-client-react/` — generated React Query hooks
- `lib/api-zod/` — generated Zod schemas

## Architecture decisions

- OpenAPI-first: all API contracts defined in `lib/api-spec/openapi.yaml`; frontend hooks and Zod schemas are generated via Orval.
- Body parser limit set to `10mb` to support photo uploads in resume data.
- `DATABASE_URL` is runtime-managed by Replit — do not set it manually.
- After adding new Drizzle schema files, run `pnpm -w exec tsc --build lib/db` so api-server picks up new exports.

## Product

- Dashboard: list and manage all CVs
- Template picker: choose a resume template and accent colour
- Editor: fill in personal info, work experience, education, skills, and languages

## User preferences

- Wants to push to GitHub after the app is working on Replit.

## Gotchas

- After editing `lib/db` schema, rebuild with `pnpm -w exec tsc --build lib/db` before restarting the API server.
- `DATABASE_URL` is a runtime-managed key — Replit injects it automatically; do not set it via `setEnvVars`.
- The `attached_assets/CV-Builder/` directory contains a stale copy of the project from the original ZIP import — it can be deleted.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
