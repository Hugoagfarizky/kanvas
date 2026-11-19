# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
aims to follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Vite + React 19 + TypeScript + Tailwind CSS v4 foundation.
- Light and dark theme with a persisted preference and no flash on load.
- Dashboard with local board list, create, open and two-step delete.
- Board search, duplicate, JSON import/export and undoable delete.
- Toast system, error boundary and load/save error states for local storage.
- Four starting templates: Brainstorm, Project plan, Weekly plan, Retrospective.
- Board page shell with inline title editing and debounced autosave to IndexedDB.
- M3 selection: shift-click, marquee (Shift+drag), select-all, group move.
- Align and distribute toolbar for multi-selection.
- Copy, paste, duplicate and delete with keyboard shortcuts.
- Undo/redo with a 50-step history.
- Board schema (`schemaVersion: 1`) for nodes, edges, strokes and viewport.
- PWA manifest, self-hosted fonts and an offline service worker.
- Playwright smoke tests in CI (persist, theme, undo, export/import, offline).
- English UI with hash routing for static hosting.
- CI workflow: lint, typecheck, unit tests, end-to-end tests and production build.
- GitHub Pages deployment workflow.
- README, Indonesian README, roadmap, contributing guide, code of conduct, security policy,
  issue forms, pull request template and Dependabot configuration.

### Notes

- The canvas engine is not wired up yet; see [ROADMAP.md](ROADMAP.md).
