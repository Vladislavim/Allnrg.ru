# repo-map-first

Use this skill in this repository whenever the task can benefit from low-context project navigation.

## Purpose

Use the project map before analyzing code, then read only relevant files.

## Workflow

1. Read `docs/PROJECT_MAP.md` from the repository root.
2. Decide the likely task area: static page HTML, shared CSS, page CSS, shared JS, SEO tools, assets, QA reports, or WordPress reference extraction.
3. Use exact `rg` searches to find candidate files.
4. Open only candidate files, preferably around search matches.
5. Avoid broad scans, full-file dumps, and generated/reference directories unless needed.
6. For complex tasks, write a short search plan before reading more.
7. For simple tasks, avoid architecture analysis and patch the relevant file directly.
8. After changes, briefly report files changed and why.

## Repository-Specific Boundaries

- Main editable site: `clean/`.
- Project map: `docs/PROJECT_MAP.md`.
- Reference extraction: `source-extract/`; avoid unless requested.
- Large backup/archive and screenshots: avoid unless requested.
- Generated QA/report output: avoid unless the task is about QA/report analysis.

## Defaults

- Reasoning: low for narrow changes, medium for multi-file bugs, high only for architecture/migration/debugging.
- Verbosity: concise.
- Verification: choose the lightest check that proves the change.
