# Next.js 15+ — Niyam Rules

## Core Principles

1. **Server Components by default.** Only add `'use client'` when you need interactivity, browser APIs, or hooks.
2. **App Router only.** No Pages Router for new code. Use the `app/` directory.
3. **Colocation.** Place components, styles, and utilities next to the routes that use them.
4. **Progressive enhancement.** Forms work without JavaScript via Server Actions.
5. **Minimize client bundles.** Push logic to the server. Fetch data where it's rendered.

## File Structure & Organization

```
app/
  layout.tsx          # Root layout (required)
  page.tsx            # Home route
  loading.tsx         # Instant loading UI (Suspense boundary)
  error.tsx           # Error boundary
  not-found.tsx       # 404 page
  (auth)/             # Route group (no URL segment)
    login/page.tsx
  dashboard/
    layout.tsx        # Nested layout
    page.tsx
    @sidebar/         # Parallel route (named slot)
      page.tsx
    (.)modal/         # Intercepting route
      page.tsx
```

- `layout.tsx` — Shared UI that persists across navigations. Never re-renders on navigation.
- `loading.tsx` — Auto-wrapped in `<Suspense>`. Show skeleton/spinner.
- `error.tsx` — Must be a Client Component. Catches rendering errors.
- Route groups `(name)` organize without affecting URLs.
- Private folders `_components` excluded from routing.

## Patterns & Best Practices

### Data Fetching
- Fetch data in Server Components using `async/await` directly.
- Use `fetch()` with Next.js extended options for caching control.
- Deduplicate requests: Next.js memoizes `fetch` calls with the same URL and options per render.
- For mutations, use Server Actions (`'use server'` functions).

### Caching & Revalidation
- `fetch(url, { cache: 'force-cache' })` — static (default in production).
- `fetch(url, { next: { revalidate: 60 } })` — ISR, revalidate every 60s.
- `fetch(url, { cache: 'no-store' })` — dynamic, no caching.
- Use `revalidatePath('/path')` or `revalidateTag('tag')` in Server Actions for on-demand revalidation.
- Tag fetches: `fetch(url, { next: { tags: ['posts'] } })`.

### Server Actions
- Define with `'use server'` at the top of the function or file.
- Use in `<form action={serverAction}>` for progressive enhancement.
- Validate all inputs with Zod or similar. Never trust client data.
- Use `useActionState` hook for pending states and form validation.

### Middleware
- Single `middleware.ts` at the project root.
- Use for auth checks, redirects, headers, geo-routing.
- Keep middleware fast — no heavy computation or database calls.
- Match routes with `config.matcher` array.

### Metadata API
- Export `metadata` object or `generateMetadata()` function from `page.tsx`/`layout.tsx`.
- Use `generateMetadata` when metadata depends on dynamic params.

### Route Handlers
- `app/api/[...]/route.ts` — export named HTTP methods (`GET`, `POST`, `PUT`, `DELETE`).
- Route handlers are Server-only. Use for webhooks, external API integration.
- Prefer Server Actions over Route Handlers for form submissions.

### Parallel & Intercepting Routes
- Named slots with `@folder` convention for parallel routes.
- Each slot renders independently — great for dashboards.
- Use `default.tsx` as fallback when a slot has no matching route.
- Intercepting routes: `(.)folder` same level, `(..)folder` one level up, `(...)folder` from root.

## Anti-Patterns (Never Do)

- Never use `getServerSideProps`, `getStaticProps` — Pages Router only.
- Never fetch data in Client Components when a Server Component parent can pass it as props.
- Never use `useEffect` for data fetching in App Router — use Server Components or React Query.
- Never put secrets in Client Components or expose them via client-side fetch.
- Never make middleware a bottleneck — avoid DB queries in it.
- Never use `router.push` for form submissions — use Server Actions.
- Never cache user-specific data with shared cache keys.

## Performance

- Use `<Image>` component for automatic optimization, lazy loading, and responsive images.
- Use `<Link>` for client-side navigation with prefetching.
- Implement `loading.tsx` for instant perceived performance.
- Use `dynamic()` import for heavy client components.
- Stream responses with Suspense boundaries for progressive rendering.
- Use `generateStaticParams` for static generation of dynamic routes.
- Minimize `'use client'` boundaries — push them as deep as possible.

## Testing

- Use `@testing-library/react` with `next/jest` configuration.
- Test Server Components by importing and rendering them directly.
- Test Server Actions by calling them as functions with mocked dependencies.
- Use Playwright or Cypress for E2E covering navigation, forms, and auth.
- Mock `next/navigation` (`useRouter`, `usePathname`) in unit tests.

## Security

- Validate all Server Action inputs — they are public API endpoints.
- Use `headers()` and `cookies()` for auth verification in Server Components.
- Set security headers in `next.config.js` or middleware (CSP, HSTS, X-Frame-Options).
- Never expose database credentials or API keys in client bundles.
- Use `NEXT_PUBLIC_` prefix only for truly public environment variables.
- Implement rate limiting on Route Handlers and Server Actions.
