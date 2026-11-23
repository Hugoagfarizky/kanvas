# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
aims to follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Device image upload via file dialog, global canvas drag-and-drop, and clipboard paste (Ctrl+V).
- Image fit toggle (contain/cover) and quick replace/clear controls on image hover.
- WCAG 2.1 relative luminance color contrast utilities in `src/lib/color.ts` ensuring text readability in both light and dark modes.
- Unified floating dock toolbar with Lucide icons, tooltips, and keyboard shortcuts.
- Secondary drawing options toolbar for pen ink colors, highlighter palettes, and stroke sizes.
- Keyboard shortcuts modal dialog (`?` / header button).
- Visual alignment and distribution toolbar with graphic icons for multi-selection.
- Theme-aware PNG board export.
- Quick preset color swatches with automatic text contrast in the node style inspector.

### Changed

- Repositioned the node style inspector away from the MiniMap.
- Fixed dark mode text readability across Text, Frame, and Task nodes.
- Enhanced React Flow connector labels and edge styling for light and dark themes.

### Fixed

- Autosave no longer re-runs on every render; idle boards stop writing to IndexedDB.
- Undo/redo now includes pen strokes and eraser gestures.
- Connector curve type persists across reloads and imports.
- Duplicate empty states collapsed into a single one.
- Template IDs (`dei`, `cardiology`, `uxflow`) survive board import.
- Per-board IndexedDB storage with automatic migration from the legacy single-array format.
- Mobile layout no longer overlaps docks, panels, and empty states.
- Image uploads are downscaled before being stored as base64.
- Imported task nodes without `items` no longer crash the canvas.
- Removed non-functional "Dei" chrome (fake profile, nav tabs, bell badge) and hardcoded titles.
