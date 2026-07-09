---
name: artifact-registration-after-import
description: Imported projects can have artifacts/<slug>/.replit-artifact/artifact.toml on disk that listArtifacts() doesn't see and no workflow exists for.
---

When a project is imported (e.g. from GitHub) with pre-existing `artifacts/<slug>/.replit-artifact/artifact.toml` files, the platform's artifact registry and managed workflows may not know about them yet — `listArtifacts()` returns `{ artifacts: [] }` and `WorkflowsRestart` says the workflow doesn't exist, even though the TOML and code are present and valid.

**Fix:** force re-registration by round-tripping each artifact's `artifact.toml` through `verifyAndReplaceArtifactToml()` (read the real file, write it unchanged to a sibling `artifact.edit.toml`, then call `verifyAndReplaceArtifactToml({ tempFilePath, artifactTomlPath })`). This triggers the platform to (re)register the artifact and create its managed workflow(s), after which `listArtifacts()` and `WorkflowsRestart` work normally.

**Why:** artifact/workflow registration is apparently driven by writes through the validated `verifyAndReplaceArtifactToml` path, not just by the file existing on disk — a raw git import doesn't go through that path.

**How to apply:** if `listArtifacts()` is empty but `artifacts/*/.replit-artifact/artifact.toml` files exist, do the no-op replace on each one before trying to start their workflows.
