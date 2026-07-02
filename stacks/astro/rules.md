# Astro 5+ — Niyam Rules

## Core Principles

1. **Zero JS by default.** Ship HTML and CSS. JavaScript only loads for interactive islands.
2. **Islands architecture.** Interactive components hydrate independently. The page is static; islands are dynamic.
3. **Content-first.** Astro excels at content sites. Use content collections for structured data.
4. **Framework agnostic.** Use React, Svelte, Vue, or Solid for islands — pick per component, not per project.
5. **Server-first rendering.** Default to SSG. Use SSR only for routes that need request-time data.

## File Structure & Organization

```
src/
  pages/                  # File-based routing
    index.astro
    blog/
      [slug].astro
      [...page].astro
  layouts/                # Page layouts
    Base.astro
    Blog.astro
  components/             # UI components (.astro + framework)
    Header.astro
    SearchBar.tsx         # React island
  content/                # Content collections
    config.ts             # Collection schemas
    blog/
      first-post.md
      second-post.mdx
  styles/                 # Global styles
    global.css
  lib/                    # Utilities, API clients
astro.config.mjs          # Astro configuration
```

- `.astro` components for static UI. Framework components for interactivity.
- Pages in `src/pages/` map directly to routes. Use `[param]` for dynamic routes.
- Content in `src/content/` with schemas defined in `config.ts`.

## Content Collections

- Define schemas with Zod in `src/content/config.ts`. Every collection gets a typed schema.
- Use `getCollection()` and `getEntry()` for type-safe content querying.
- Use MDX for content that needs interactive components.
- Frontmatter must match the schema exactly — Astro validates at build time.
- Use `reference()` for relations between collections (e.g., author references).

```typescript
import { defineCollection, z, reference } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    author: reference('authors'),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
```

## Islands Architecture

- Use `client:*` directives to hydrate framework components.
- `client:load` — hydrate immediately on page load. Use for above-fold interactive content.
- `client:idle` — hydrate when browser is idle. Use for below-fold but soon-needed components.
- `client:visible` — hydrate when scrolled into view. Use for far-down-page components.
- `client:media` — hydrate at a breakpoint. Use for mobile-only interactivity.
- `client:only="react"` — skip SSR, render only on client. Use for browser-dependent components.
- No directive = no JS shipped. Static HTML only.

```astro
---
import SearchBar from '../components/SearchBar.tsx';
import Newsletter from '../components/Newsletter.svelte';
import Analytics from '../components/Analytics.tsx';
---
<SearchBar client:load />
<Newsletter client:visible />
<Analytics client:only="react" />
```

## View Transitions

- Use `<ViewTransitions />` in the `<head>` for SPA-like page transitions.
- Use `transition:name` for elements that morph between pages.
- Use `transition:animate` for built-in animations: `slide`, `fade`, `none`.
- Persistent elements across pages use the same `transition:name`.
- Handle lifecycle events: `astro:page-load`, `astro:after-swap` for re-initializing scripts.
- Test with `prefers-reduced-motion` — provide `transition:animate="none"` fallback.

## SSR vs SSG

- Default to SSG (`output: 'static'`). Pre-render everything possible at build time.
- Use `output: 'server'` or `output: 'hybrid'` only when routes need request-time data.
- In hybrid mode, pages are static by default. Add `export const prerender = false` for SSR routes.
- Use SSR for: user-specific content, real-time data, auth-gated pages.
- Use SSG for: blog posts, docs, marketing pages, any content that doesn't change per-request.
- Deploy SSR to: Node adapter, Vercel, Netlify, Cloudflare Workers, Deno.

## Integrations

- Add integrations via `npx astro add react` (or svelte, vue, tailwind, mdx, etc.).
- Configure in `astro.config.mjs` under `integrations: [...]`.
- Use `@astrojs/mdx` for MDX support in content collections.
- Use `@astrojs/sitemap` for automatic sitemap generation.
- Use `@astrojs/image` or the built-in `<Image />` component for optimized images.
- Prefer official `@astrojs/*` integrations over community packages when available.

## Anti-Patterns (Never Do)

- Never add `client:load` to every component — that defeats the purpose of Astro.
- Never use a framework component when an `.astro` component suffices (no interactivity needed).
- Never bypass content collection schemas with raw file imports.
- Never use `getStaticPaths` without pagination for large collections.
- Never put mutable state in `.astro` components — they render once on the server.
- Never import heavy client-side libraries in `.astro` frontmatter — it bloats the server build.
- Never use `client:only` unless the component truly cannot render on the server.

## Performance

- Measure with Lighthouse. Astro sites should score 95+ on performance.
- Use `<Image />` component for automatic format conversion (WebP/AVIF) and sizing.
- Use `loading="lazy"` on below-fold images. `loading="eager"` only for LCP image.
- Use `client:visible` and `client:idle` over `client:load` where possible.
- Minimize JavaScript sent to the client — audit with `astro build` output.
- Use `prefetch` for likely-next-page links to improve perceived performance.
- Inline critical CSS. Astro does this automatically for scoped styles.

## Security

- Sanitize all user-generated content in MDX and dynamic pages.
- Use environment variables for secrets: `import.meta.env.SECRET_KEY` (server-only by default).
- Client-exposed env vars must be prefixed with `PUBLIC_`.
- Set security headers in middleware or adapter configuration.
- Validate all dynamic route params — never trust `Astro.params` raw.
- Use CSP headers for sites that render user content.
