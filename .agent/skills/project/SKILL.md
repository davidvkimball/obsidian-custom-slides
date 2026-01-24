---
name: project
description: Project-specific architecture, maintenance tasks, and unique conventions for Custom Slides.
---

# Custom Slides Project Skill

Customizes the Slides core plugin navigation, styles, and behavior. This plugin extends the built-in Obsidian Slides functionality, providing finer control over presentation aesthetics and transitions.

## Core Architecture

- **Extension Layer**: Primary logic interfaces with and modifies the behavior of the built-in Slides plugin.
- **CSS Customization**: Uses `styles.css` (3KB) to provide specialized presentation themes and transition overrides.
- **Navigation Logic**: Includes logic to modify or extend the standard slide navigation controls.

## Project-Specific Conventions

- **Desktop Only**: Optimization and scope are limited to the Desktop Slides implementation.
- **Core Plugin Dependency**: Development requires deep understanding of the internal Slides plugin DOM and event structure.
- **Presentation Focus**: Prioritizes "Presentation Mode" UX over standard editor settings.

## Key Files

- `src/main.ts`: Main entry point for slides customization and navigation logic.
- `manifest.json`: Plugin identification and Desktop-only constraint (`custom-slides`).
- `styles.css`: Slide deck themes and transition styles.
- `esbuild.config.mjs`: Standard build configuration.

## Maintenance Tasks

- **Core Sync**: Slides is a core plugin; audits are required after major Obsidian releases to ensure selectors haven't changed.
- **Style Overrides**: Verify that custom styles are correctly prioritized over default Slides CSS.
- **Navigation Testing**: Ensure custom navigation controls remain functional in full-screen presentation mode.
