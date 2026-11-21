<div align="center">

# Kanvas

**Plans, scribbles & ideas on one infinite canvas.**

A free, open-source workspace to map a plan, sketch rough notes, and brainstorm out loud.
No account. No cloud. Everything stays in your browser.

[Live demo](https://hugoagfarizky.github.io/kanvas/) · [Roadmap](ROADMAP.md) · [Contributing](CONTRIBUTING.md)

[![CI](https://github.com/Hugoagfarizky/kanvas/actions/workflows/ci.yml/badge.svg)](https://github.com/Hugoagfarizky/kanvas/actions/workflows/ci.yml)
[![Deploy](https://github.com/Hugoagfarizky/kanvas/actions/workflows/deploy.yml/badge.svg)](https://github.com/Hugoagfarizky/kanvas/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-2b2f3f.svg)](LICENSE)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-e9b44c.svg)](CONTRIBUTING.md)

</div>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/screenshot-dark.png">
  <img alt="Kanvas dashboard with a hero section, board list and templates" src="docs/screenshot-light.png">
</picture>

![Kanvas demo](docs/demo.gif)

## Canvas Features & Tools

Kanvas provides an infinite creative surface for brainstorming, sketching, planning, and organizing work. Everything is accessible via the top-center floating dock, context menus, and keyboard shortcuts.

### 1. Navigation & Viewport
- **Select Tool (`V`)**: Click or drag to select, move, resize, and rotate nodes.
- **Pan / Hand Tool (`H`)**: Pan and glide across the infinite canvas without inadvertently selecting or moving elements.
- **Marquee Selection (`Shift + Drag`)**: Drag a selection rectangle over multiple objects to group-select them.
- **Zoom Controls (`+`, `-`, `0`)**: Zoom in, zoom out, or press `0` to automatically fit all board content on screen.
- **MiniMap**: Live overview in the bottom-right corner for spatial orientation and fast jumps across large boards.

### 2. Creation Primitives & Nodes
- **Sticky Notes (`N`)**: Classic colored sticky notes for brainstorming, ideas, and quick thoughts. Text color automatically calculates optimal WCAG contrast against note fills.
- **Text Blocks (`T`)**: Borderless text for diagram headers, floating callouts, flowchart labels, or captions. Text colors dynamically adapt to light and dark modes.
- **Task Checklists**: Interactive task cards with toggleable checkmarks, easy item additions on `Enter`, and delete actions. Text contrast adjusts dynamically to prevent washed-out labels.
- **Geometric Shapes**: Rectangles, rounded rectangles, circles/ellipses, and diamonds with centered labels for flowcharts, system diagrams, and architectural mapping.
- **Grouping Frames**: Dashed organizational containers with editable title headers to divide work into stages (e.g., _Now / Next / Later_ or _Monday / Wednesday / Friday_).
- **Images (Device Upload, Drag & Drop, Paste)**:
  - **Upload from Device**: Click the upload icon or button to open your native file picker.
  - **Drag & Drop**: Drag image files directly from your computer file manager and drop them anywhere onto the canvas.
  - **Clipboard Paste (`Ctrl + V`)**: Copy screenshots or images from other apps and paste them straight onto the board.
  - **Fit Modes & Controls**: Hover toolbar to toggle between `contain` (entire image visible) and `cover` (fills the node frame), replace from device, or remove.

### 3. Freehand Drawing & Connectors
- **Pen Tool (`P`)**: Smooth, pressure-sensitive freehand sketching powered by `perfect-freehand`. Automatically adopts contrast-safe ink in dark mode, with a secondary palette of ink colors (Slate, Blue, Emerald, Amber, Rose, Purple) and stroke sizes (Fine, Normal, Broad).
- **Highlighter Tool**: Semi-transparent highlighter for emphasizing key text, drawings, and nodes with vivid neon colors (Yellow, Green, Cyan, Pink, Orange).
- **Geometry Eraser (`E`)**: Intelligent stroke eraser that deletes touched stroke segments without altering nodes or images.
- **Smart Connectors**: Drag from connector handles on node sides to link nodes together. Double-click any connector edge to add or edit descriptive labels.

### 4. Inspector & Multi-Selection Alignment
- **Style Inspector Panel**: Docked neatly on the top-right (never obscuring the MiniMap). Offers 1-click WCAG-compliant color presets, custom fill/stroke/text pickers, font size steps, shape switcher, image fit toggles, and rotation sliders.
- **Align & Distribute Toolbar**: Appears when 2 or more nodes are selected. Align left, center, right, top, middle, bottom, or distribute spacing evenly horizontally and vertically.

### 5. Keyboard Shortcuts & Local-First Persistence
- **History (`Ctrl + Z` / `Ctrl + Y`)**: 50-step undo/redo buffer for nodes and ink.
- **Clipboard (`Ctrl + C`, `Ctrl + V`, `Ctrl + D`)**: Copy, paste, duplicate, and delete elements easily.
- **Keyboard Shortcuts Cheatsheet (`?` / Header icon)**: Quick reference modal showing all platform keybindings.
- **Local-First & Offline**: Saved automatically to browser IndexedDB with zero latency, zero cloud tracking, and full offline PWA support.
- **Export Options**: High-resolution PNG export (with theme-matching background) and full board JSON backup for import/export.

## Status

Kanvas is in early development. **M0 is live**, and the local workspace already supports a few pieces that
used to be on later milestones: board search, duplicate, JSON import/export with undoable delete, a toast
system, an error boundary, and offline use as a PWA. **M4 connectors and ink are live too**: labeled connectors by dragging between node handles (double-click to
label), plus pen, highlighter and eraser with perfect-freehand strokes and a geometry-based eraser. The
canvas now supports the full M1-M4 loop — see [ROADMAP.md](ROADMAP.md) for M5+ (persistence polish and
templates).

![Empty board in dark mode](docs/screenshot-board.png)

## Tech stack

| Layer        | Choice                                                                                                      |
| ------------ | ----------------------------------------------------------------------------------------------------------- |
| UI           | React 19, TypeScript, Tailwind CSS v4, shadcn/ui conventions                                                |
| Build        | Vite                                                                                                        |
| Canvas (M1+) | [React Flow](https://reactflow.dev) and [perfect-freehand](https://github.com/steveruizok/perfect-freehand) |
| State (M1+)  | Zustand                                                                                                     |
| Storage      | IndexedDB via `idb-keyval`                                                                                  |
| Tests        | Vitest, Testing Library, Playwright                                                                         |
| Hosting      | GitHub Pages (static, free)                                                                                 |

## Getting started

Requirements: Node.js 22 or newer (24 recommended) and npm 10+.

```bash
git clone https://github.com/Hugoagfarizky/kanvas.git
cd kanvas
npm install
npm run dev
```

Open <http://localhost:5173>. The app is a hash-routed SPA, so no server is required.

### Scripts

| Command             | Description                       |
| ------------------- | --------------------------------- |
| `npm run dev`       | Start the dev server              |
| `npm run build`     | Typecheck and build to `dist/`    |
| `npm run preview`   | Preview the production build      |
| `npm run lint`      | Run ESLint                        |
| `npm run typecheck` | Run TypeScript project references |
| `npm test`          | Run the unit tests once           |
| `npm run test:e2e`  | Run the Playwright smoke tests    |
| `npm run format`    | Format with Prettier              |

## Project structure

```text
src/
├─ components/      # UI primitives, header, hero, cards
├─ pages/           # Dashboard, board, 404
├─ lib/             # storage, ids, dates, templates, theme
├─ types/           # board schema (nodes, edges, strokes)
└─ test/            # Vitest setup
.github/workflows/  # CI + GitHub Pages deployment
docs/               # Screenshots
```

The board schema lives in [`src/types/board.ts`](src/types/board.ts). Coordinates are stored in
canvas space, not screen space, so future pan/zoom work will not misplace objects. Every board
carries a `schemaVersion` for migrations.

## Privacy

Kanvas does not have a backend and does not upload your boards. Data lives in your browser's
IndexedDB under the `kanvas` database. Clearing site data removes your boards, so export a JSON backup
from the board header when you want to keep one. Boards can be imported again from the dashboard.

## Contributing

Contributions of all sizes are welcome — code, docs, translations, bug reports and template ideas.
Start with [CONTRIBUTING.md](CONTRIBUTING.md) and look for issues labeled `good first issue`.

## License

[MIT](LICENSE) © 2026 Hugo Agfarizky
