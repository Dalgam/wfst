# Warframe Mastery Tracker

Track your Warframe mastery progress across all masterable items.

**Live app:** https://dalgam.github.io/wfst/

> This project was a vibe coding learning experience created by an experienced developer trying new tools.

## Features

- Browse all masterable Warframe items (759 items) organized by category
- Mark items as mastered; track individual crafting parts
- Filter by mastered status or Prime items
- Full-text search with autocomplete and keyboard navigation
- Keyboard shortcuts: `Cmd/Ctrl+K` focus search, `Cmd/Ctrl+Space` toggle mastered, `Cmd/Ctrl+1–4` toggle parts, `,`/`.` cycle categories
- Search and filter state synced to URL query params
- Export / import progress as JSON
- Wiki links on every card (header click or `Cmd/Ctrl+click` image)
- Virtualized grid for smooth scrolling across hundreds of items

## Stack

- React 19 + TypeScript
- MUI v9 (Material UI)
- Vite
- `@tanstack/react-virtual` — window virtualizer for grid rows
- `warframe-items` — item data (pre-generated at build time via `scripts/generate-items.mjs`)

## Development

```bash
yarn install
yarn dev
```

Build pre-generates `src/items-data.json` from the `warframe-items` package before bundling.
