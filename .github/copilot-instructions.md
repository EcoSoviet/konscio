# Copilot Instructions for The Red Soil (Konscio)

## Project Overview

Astro-powered static site publishing eco-socialist analysis and decolonial thought from Africa and the Global South. TypeScript codebase with strict content validation, dual licensing (MIT for code, CC0 for content), and performance-first architecture.

## Architecture Essentials

### Content System (Astro Content Collections)

Two collections in `src/content/config.ts`:
- **dispatches**: Long-form articles with `dispatchesSchema` (Zod validation in `src/schemas/dispatches.ts`)
  - Required: `title`, `datePublished`, `excerpt`, `category`, `tags`
  - Optional: `description`, `author`, `image`, `draft`, `dateModified`
  - Auto-calculated: `minutesRead` via `plugins/remark-reading-time.ts` (200 wpm default)
- **compendium**: Glossary entries with simpler `compendiumSchema` (title, description, draft flag)

Access via `getCollection("dispatches")` or `getCollection("compendium")` - see `src/pages/dispatches.astro` for pattern.

### Routing & Pages

- **Static generation**: `src/pages/[...slug].astro` pattern for dynamic routes
- **dispatches**: `src/pages/dispatches/[...slug].astro` renders from collection
- **Categories**: Auto-generated at `/categories/[category]` from frontmatter
- **RSS**: `src/pages/rss.xml.js` uses `import.meta.glob` (not `getCollection`) to filter drafts and sort by date
- **Search**: `src/pages/search.json.js` generates JSON index from both collections

### Component Architecture

**Layout hierarchy**: `Layout.astro` (master) → `Header.astro` + `Sidebar.astro` (conditional) + `Footer.astro`

- Every component exports TypeScript `Props` interface (see `Layout.astro` lines 8-20)
- Sidebar modes: `"dispatches"` or `"compendium"` - controls which content appears
- Scoped CSS using CSS variables from `src/styles/variables.css`
- Font imports at top: `@fontsource-variable/oswald`, `work-sans`, `jetbrains-mono`

### Configuration Layers

1. **Site config**: `src/config.ts` - centralized site metadata, author, social links
2. **Astro config**: `astro.config.mjs` - build settings, plugins, markdown processing
   - Fontaine plugin prevents layout shift
   - Asset inlining threshold: 4KB
   - Remark plugins: `remarkReadingTime`, `remarkGfm`, `remarkSmartypants`
3. **ESLint**: `eslint.config.mjs` - multi-language linting (JS, TS, Astro, CSS, JSON, YAML, Markdown) with SonarJS, Unicorn, Oxlint

## Critical Developer Workflows

### Pre-commit/PR Checks

```bash
npm run lint   # ESLint + Oxlint auto-fix (dual linter setup)
npm run check  # TypeScript type checking (astro check)
npm run test   # Vitest tests in tests/utils/
```

Always run all three before PRs. Build will fail on type errors or missing frontmatter.

### Development Commands

```bash
npm run dev          # localhost:4321 (Astro dev server)
npm run build        # Production build to dist/
npm run preview      # Preview production build locally
npm run link-check   # Custom script (scripts/link-check.ts) validates external URLs
```

### Testing Strategy

Tests in `tests/utils/` for pure functions only:
- `slugify.test.ts`: URL slug generation
- `table-of-contents.test.ts`: TOC extraction
- `remark-reading-time.test.ts`: Reading time calculation
- `rss.test.ts`, `search.test.ts`, `link-check.test.ts`

No component tests. Use `vitest --run` (jsdom environment from `vitest.config.ts`).

## Content Creation Workflow

### Adding Dispatches

1. Create `.md` or `.mdx` in `src/content/dispatches/`
2. Frontmatter must match `dispatchesSchema` exactly - missing required fields = build failure
3. Images: `public/images/` → reference as `/images/filename.webp`
4. Slug: Derived from filename via `slugifyPath()` in `src/utils/slugify.ts`
5. Categories: Single string (not array) - used for URL generation
6. Reading time: Calculated automatically, stored in `frontmatter.minutesRead`

**Editorial standards** (see `EDITORIAL_GUIDELINES.md`):
- UK English spelling ("organised", "labour")
- Bold for first mention of "The Red Soil" and key actors
- Italics for emphasis/calls to action
- Blockquotes for citations
- Section dividers: `---` in Markdown

### Content Submission Paths

Two methods documented in `.github/CONTRIBUTING.md`:
1. Fork + PR (developers)
2. Email to contact@theredsoil.co.za (writers)

Both require editorial review. Attribution always preserved.

## Project-Specific Conventions

### File Organization

```
src/
├── config.ts              # Single source of truth for site metadata
├── content/
│   ├── config.ts          # Collection definitions
│   ├── dispatches/        # Article MDX files
│   └── compendium/        # Glossary MD files
├── schemas/               # Zod validation schemas
├── components/            # Astro components (.astro)
├── pages/                 # Routes (includes [...slug].astro patterns)
├── styles/                # Modular CSS (variables, typography, utilities)
└── utils/                 # Pure functions (slugify, url, table-of-contents)
```

### Commit Message Format

Prefix required:
- `Add:` new features/content
- `Fix:` bug fixes
- `Update:` changes to existing features
- `Remove:` deletions
- `Docs:` documentation only

### Licensing

**Dual license** (`LICENCE` file):
- Code (src/, scripts/, etc.): MIT
- Content (text, images, docs): CC0 1.0 Universal

Contributions automatically accepted under these terms.

### Performance Patterns

- Self-hosted fonts (no external requests)
- Fontaine plugin prevents CLS
- PurgeCSS removes unused CSS
- Compression: gzip, brotli, zstd
- Prefetch strategy: hover-based for internal links
- Asset inlining: <4KB files

## Integration Points

### RSS Feed Generation

`src/pages/rss.xml.js` uses `import.meta.glob` (not `getCollection`) to:
1. Filter drafts (`frontmatter.draft !== true`)
2. Filter future-dated posts (`datePublished <= Date.now()`)
3. Sort by `datePublished` descending
4. Generate slug from filename

**Important**: RSS uses different loading pattern than other pages - don't refactor to `getCollection` without updating filter logic.

### Search Index

`src/pages/search.json.js` merges both collections into single JSON endpoint. Frontend search not included in repository.

### Custom Link Validation

`scripts/link-check.ts` crawls `src/` for external links (http/https) and validates with `link-check` package. Run via `npm run link-check`. Used in CI/CD.

## Common Pitfalls

- **Frontmatter schema**: Missing any required field breaks build - no defaults for `title`, `datePublished`, `excerpt`, `category`, `tags`
- **Category vs categories**: Schema uses singular `category` (string), not plural
- **Slug generation**: Derived from filename, not frontmatter - rename file to change URL
- **RSS date filtering**: Uses `import.meta.glob` not `getCollection` - maintains own draft/date logic
- **Layout sidebar**: Defaults to showing `dispatches` - must explicitly set `sidebarMode="compendium"` for glossary
- **Node version**: Requires >=24.0.0 (see `package.json` engines field)

## Editorial Focus

This is a political platform with specific mission: eco-socialist analysis, decolonial perspectives, Global South focus. When contributing content or suggesting features, maintain alignment with anti-capitalist, anti-imperialist, and ecological justice themes.
