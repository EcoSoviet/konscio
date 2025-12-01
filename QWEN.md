# Qwen Instructions for The Red Soil (Konscio)

## Project Overview

This is an Astro-powered blog focused on eco-socialist analysis and decolonial thought from Africa and the Global South. Built with TypeScript, MDX support, and a mobile-first responsive design.

## Architecture & Key Patterns

### Content System

- **Posts**: MDX files in `src/content/dispatches/` with strict schema validation via Zod (`src/schemas/dispatches.ts`)
- **Required frontmatter**: `title`, `datePublished`, `excerpt`, `categories`, `tags` - see `dispatchSchema` for complete structure
- **Reading time**: Auto-calculated via custom remark plugin (`plugins/remark-reading-time.ts`)
- **Content collections**: Defined in `src/content/config.ts` using Astro's content API

### Configuration

- **Site config**: Centralized in `src/config.ts` - modify this for site-wide settings, social links, author info
- **Astro config**: `astro.config.mjs` includes custom plugins for reading time, font optimization (Fontaine), and build optimizations

### Component Patterns

- **Layout hierarchy**: `Layout.astro` → `Header.astro` + `Sidebar.astro` + `Footer.astro`
- **Props interfaces**: Every component exports TypeScript interfaces (see `Layout.astro` Props pattern)
- **Scoped CSS**: Components use Astro's scoped styling with CSS variables from `src/styles/variables.css`
- **Self-hosted fonts**: Via fontsource-variable packages, no external font requests

### Development Workflows

#### Essential Commands

```bash
npm run dev          # Start dev server (localhost:4321)
npm run build        # Production build
npm run check        # TypeScript checking
npm run lint         # ESLint with auto-fix
npm run test         # Vitest test suite
npm run link-check   # Custom link validation
```

#### Before Pull Requests

Always run: `npm run lint && npm run check && npm run test`

#### Testing Strategy

- **Utility tests**: `tests/utils/` for helper functions like `slugify.ts`

### Content Creation Workflow

#### New Posts

1. Create `.md` or `.mdx` file in `src/content/dispatches/`
2. Use complete frontmatter schema - missing required fields will fail build
3. Categories become URL paths (`/categories/[category]`)
4. Images go in `public/images/` and reference as `/images/filename.webp`
5. Reading time calculated automatically

#### Editorial Guidelines

- Clear, accessible language (see `CONTRIBUTING.md` for full standards)
- Focus: eco-socialist analysis, decolonial thought, Global South perspectives
- Original content in any language welcome (no translations)
- Proper attribution for external authors

### Project-Specific Conventions

#### File Organization

- **Styles**: Modular CSS in `src/styles/` with variables, typography, utilities pattern
- **Utils**: Pure functions in `src/utils/` (e.g., `slugify.ts` for URL generation)
- **Plugins**: Custom Astro/Remark plugins in `plugins/` directory
- **Types**: TypeScript definitions in `src/types/` and `types/`

#### Code Style

- **Dual licensing**: Code (MIT) vs Content (CC0) - see `LICENCE` file
- **Commit format**: Prefix with `Add:`, `Fix:`, `Update:`, `Remove:`, `Docs:`
- **Import order**: External packages, then relative imports, then CSS/assets

#### Performance Optimizations

- **Font loading**: Fontaine plugin prevents layout shift
- **Asset inlining**: 4KB threshold for small assets
- **Build optimizations**: PurgeCSS, compression, and inlining enabled
- **Prefetch strategy**: Hover-based prefetching for internal links

## Common Tasks

### Adding New Categories

1. Add to post frontmatter `categories` array
2. Category pages auto-generated at `/categories/[slug]`
3. Update navigation if needed in `HeaderNavigation.astro`

### Modifying Site Metadata

- Edit `src/config.ts` for author info, social links, site description
- SEO handled by `SEO.astro` component with structured data

### Custom Components

- Follow `Layout.astro` pattern: TypeScript interface, scoped styles, semantic HTML
- Import in pages or other components as needed

Remember: This is a political platform with specific editorial focus - maintain the eco-socialist, decolonial perspective in all content contributions.
