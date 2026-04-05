# Frontend Architecture

This document outlines the architectural layers and design principles of the Pinoy Dev Quotes API frontend.

## Layer Structure

The project is organized into clear, functional layers to ensure separation of concerns and maintainability.

### 1. Design Layer (`src/styles/`)
- `tokens.css`: The single source of truth for all design values (colors, spacing, font sizes, etc.).
- `base.css`: Global resets, base element styles, and shared utility classes. Uses tokens exclusively.

### 2. Logic Layer (`src/lib/`)
- `constants.ts`: Centralizes all magic strings, numbers, and configuration values (e.g., API URLs, storage keys).
- `theme.ts`: Manages theme initialization, toggling, and persistence via `ThemeManager`.
- `api.ts`: A centralized API client (`ApiClient`) that handles all `fetch` calls, error handling, and data formatting.

### 3. Component Layer (`src/components/`)
- Purely responsible for markup and scoped styles.
- Imports all business logic and API calls from the Logic Layer.
- Uses reusable components for shared UI patterns (e.g., `ThemeToggle.astro`).

### 4. Layout Layer (`src/layouts/`)
- `BaseLayout.astro`: Coordinates global head tags, style imports, and theme initialization to prevent FOUC (Flash of Unstyled Content).

### 5. Page Layer (`src/pages/`)
- Astro pages that assemble components to form routes.

---

## Developer Guidelines

### Adding New Styles
- **NEVER** use hardcoded values (hex colors, pixel spacing).
- **ALWAYS** use a CSS variable from `tokens.css` (e.g., `var(--color-brand-primary)`).
- If a new token is needed, add it to `tokens.css` with a semantic name.

### Themes
- Themes are applied via the `data-theme` attribute on the `<html>` element.
- The `ThemeManager` handles state. Do not re-implement theme logic in components.

### API Calls
- **NEVER** use raw `fetch()` calls in components.
- **ALWAYS** add a new method to `ApiClient` in `api.ts` or use existing ones.
- All endpoints must point to the `BASE_URL` defined in constants.

### File Header Comments
Every new or modified file should include a header comment for clarity:
```javascript
// OWNS: [What this file is responsible for]
// DO: [What contributors should add here]
// DON'T: [What should never go in this file]
```
