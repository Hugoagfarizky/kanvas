# Roadmap

Kanvas ships in small, reviewable milestones. Every milestone is an issue and a pull request, so
progress stays visible in the repository.

## Principles

1. **Local-first.** No account, no server, no tracking. A board should open with the network off.
2. **One canvas, three modes.** Planning, sketching and brainstorming share the same surface.
3. **Small dependencies, permissive licenses.** MIT or Apache-2.0 only.
4. **Boring data.** Plain JSON, versioned with `schemaVersion`, easy to export and migrate.
5. **Keyboard-first.** Every core action has a shortcut, but the mouse is never second class.

## Milestones

### M0 — Repository and deploy ✅

- [x] Vite + React + TypeScript + Tailwind v4 scaffold
- [x] shadcn/ui conventions, theme tokens, dark/light mode
- [x] Dashboard with local board list, create and delete
- [x] Four template starting points
- [x] Board page shell with editable title and autosave
- [x] CI (lint, typecheck, test, build) and GitHub Pages deploy
- [x] README, roadmap, contributing guide, issue and PR templates
- [x] Toast system, error boundary and load/save error states
- [x] Board search, duplicate, JSON import/export and undoable delete
- [x] PWA manifest, self-hosted fonts and offline service worker
- [x] Playwright smoke tests in CI

### M1 — Canvas core

- [x] React Flow viewport with dot grid, pan, zoom and minimap
- [x] Zoom controls, fit-to-screen, keyboard zoom shortcuts
- [x] Empty-board onboarding hints
- [x] Persist viewport per board
- **Done when:** a board can be panned and zoomed smoothly with the viewport restored on reload. ✅

### M2 — Nodes

- [x] Sticky note, text, task card (checklist), shape, frame and image nodes
- [x] Inline text editing, resize and rotate
- [x] Style panel: fill, stroke, text colour, font size
- [x] Context menu per node type
- **Done when:** every node type can be created, edited and styled. ✅

### M3 — Selection and history

- [x] Click, shift-click, marquee and select-all
- [x] Move as a group, align and distribute
- [x] Copy, paste, duplicate and delete
- [x] Undo/redo with a 50-step history
- **Done when:** 50 consecutive operations undo and redo consistently. ✅

### M4 — Connectors and ink

- [x] Labeled connectors between nodes
- [x] Pen, highlighter and eraser with `perfect-freehand`
- [x] Layer ordering between ink and nodes
- [x] Geometry-based eraser hit testing
- **Done when:** drawing feels natural and erasing removes exactly the touched stroke segment. ✅

### M5 — Persistence and boards

- [x] IndexedDB autosave for nodes, edges, strokes and viewport
- [x] Dashboard thumbnails and sorting
- [x] Rename, duplicate and delete from the dashboard
- [x] JSON import/export with schema migration
- **Done when:** a reload never loses work and a board round-trips through export/import.

### M6 — Templates, export and polish

- [x] Seed content for the four templates
- [x] PNG export
- [x] Mobile and touch support
- [x] Empty states, toasts and onboarding
- [x] Playwright smoke tests in CI
- **Done when:** every template opens useful content on desktop and mobile.

### M7 — v0.1.0 release

- [x] Demo GIF in the README
- [x] Documentation pass and architecture notes
- [x] `v0.1.0` tag and release notes
- [x] Verify the Pages deployment from a clean clone
- **Done when:** a stranger can open the demo, create a board and understand the project in five
  minutes. ✅

## Later

- **v0.2** — realtime collaboration with Yjs, read-only share links, comments
- **v0.3** — sticky-note voting, timers, AI-assisted mind maps
- **v0.4** — plugin API, themes, self-hosting guide
- **v1.0** — stable schema and API, full documentation

## Out of scope for now

Native mobile apps, server-side accounts, paid tiers, and anything that requires uploading a board.

## Suggesting a change

Open an issue using the feature request template. If it changes this roadmap, say which milestone it
belongs to and why.
