---
name: TipTap v3 StarterKit quirks
description: Key configuration issues with @tiptap/starter-kit v3 in a pnpm monorepo with Vite.
---

## TipTap v3 StarterKit includes Underline and Link by default

Unlike v2, `@tiptap/starter-kit` v3 bundles `@tiptap/extension-underline` and `@tiptap/extension-link`. If you also add them explicitly, TipTap warns "Duplicate extension names found".

**Fix:** Disable them in StarterKit config before adding your own instances:
```ts
StarterKit.configure({
  underline: false,
  link: false,
  // other disables...
})
```

**Why:** StarterKit v3 changed its bundled extension set. The `if (this.options.underline !== false)` guard in StarterKit's source confirms `false` disables inclusion.

## React deduplication in pnpm + Vite

`vite.config.ts` already has `resolve: { dedupe: ['react', 'react-dom'] }` — this prevents TipTap from using a different React instance than the app.

**Why it matters:** Without this, TipTap's `useEditor` hook fails with "Cannot read properties of null (reading 'useRef')" (React dispatcher is null).

## pnpm monorepo: delete `.vite` cache after adding TipTap

After installing TipTap, delete `node_modules/.vite` in the artifact's dir to force Vite to re-optimize the deps with the deduplication config applied. Otherwise stale cache can cause hook errors.
```bash
rm -rf artifacts/cv-generator/node_modules/.vite
```
