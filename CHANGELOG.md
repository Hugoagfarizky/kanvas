# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
aims to follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Vite + React 19 + TypeScript + Tailwind CSS v4 foundation.
- Light and dark theme with a persisted preference and no flash on load.
- Dashboard with local board list, create, open and two-step delete.
- Four starting templates: Brainstorm, Project plan, Weekly plan, Retrospective.
- Board page shell with inline title editing and debounced autosave to IndexedDB.
- Board schema (`schemaVersion: 1`) for nodes, edges, strokes and viewport.
- English UI with hash routing for static hosting.
- CI workflow: lint, typecheck, unit tests and production build.
- GitHub Pages deployment workflow.
- README, Indonesian README, roadmap, contributing guide, code of conduct, security policy,
  issue forms, pull request template and Dependabot configuration.

### Notes

- The canvas engine is not wired up yet; see [ROADMAP.md](ROADMAP.md).
