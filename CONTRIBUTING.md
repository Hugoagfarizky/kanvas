# Contributing to Kanvas

Thanks for wanting to help. Kanvas is a small, local-first project, so thoughtful patches and clear
bug reports go a long way.

## Code of conduct

By participating you agree to the [Code of Conduct](CODE_OF_CONDUCT.md). Be kind, assume good
intent, and keep feedback about the work.

## Ways to contribute

- **Code** — pick an issue labeled `good first issue` or `help wanted`.
- **Bugs** — use the bug report template. Include browser, OS and reproduction steps.
- **Design** — share mockups or improvements for the canvas, toolbar and panels.
- **Docs** — fix typos, improve setup notes, or translate the README.
- **Templates** — propose a board layout for planning, brainstorming or retros.

If you are planning a large change, open an issue first so we can agree on the approach before you
spend time on it.

## Development setup

```bash
git clone https://github.com/Hugoagfarizky/kanvas.git
cd kanvas
npm install
npm run dev
```

Requirements: Node.js 22+ (24 recommended) and npm 10+.

## Before you open a pull request

Run the same checks as CI:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

All four must pass. Add or update tests when you change behaviour in `src/lib`.

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```text
feat: add sticky note node
fix: stop eraser from deleting adjacent strokes
docs: explain the board schema
refactor: split selection store
test: cover viewport persistence
chore: bump react flow
```

Keep the subject in the imperative mood and under 72 characters. One logical change per commit.

## Branches

Branch from `main` and use a short descriptive name:

```text
feat/canvas-grid
fix/title-autosave
docs/roadmap-m4
```

## Pull requests

A good PR is small, focused and easy to review. The template asks for:

- what changed and why
- the linked issue (`Closes #123`)
- how you tested it
- screenshots or a recording for UI changes
- the checklist (lint, typecheck, tests, docs)

Draft PRs are welcome for early feedback.

## Architecture notes

- **Board schema** lives in [`src/types/board.ts`](src/types/board.ts). Bump `schemaVersion` and add
  a migration in `src/lib` when you change it.
- **Coordinates** for nodes and strokes are stored in canvas space, never screen space. Convert at
  the edge, not in the store.
- **Persistence** goes through `src/lib/db.ts`. Do not read IndexedDB directly from components.
- **Dependencies** should be MIT or Apache-2.0. Open an issue before adding a large one.
- **UI text** is English. Keep it short, specific and free of jargon.
- **Accessibility** matters: every icon-only button needs an `aria-label`, and focus states must
  remain visible.

## Translations

The interface stays English for now so the codebase has one source of truth. Documentation
translations (starting with `README.id.md`) are welcome; keep them in sync with the English version.

## Questions

Open a discussion or an issue with the `question` label. There is no such thing as a silly question
about how the canvas works.
