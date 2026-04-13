# DevFest Website

Conference website built with Astro.

## Tech Stack

- **Framework:** Astro 6
- **Language:** TypeScript (strict mode)
- **Node:** >= 22.12.0

## Commands

| Command         | Action                    |
| --------------- | ------------------------- |
| `npm run dev`   | Start dev server          |
| `npm run build` | Build for production      |
| `npm run preview` | Preview production build |

## Project Structure

```
src/
  pages/       # File-based routing (.astro pages)
public/        # Static assets (favicon, images, etc.)
astro.config.mjs  # Astro configuration
tsconfig.json     # TypeScript configuration
```

## Conventions

- Pages go in `src/pages/`
- Components go in `src/components/`
- Layouts go in `src/layouts/`
- Static assets go in `public/`
