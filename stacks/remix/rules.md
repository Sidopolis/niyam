# Remix 2+ — Niyam Rules

## Core Principles

1. **Web standards first.** Use Request, Response, FormData, and URL APIs — not framework abstractions over them.
2. **Progressive enhancement.** Every form and navigation must work without JavaScript. JS enhances, never enables.
3. **Server/client boundary is the route module.** Loaders and actions run on the server. Components render on both.
4. **Nested routes are the architecture.** Layout, data, and error boundaries follow the URL hierarchy.
5. **Colocation over configuration.** Routes are files. Data loading is in the route. No global state for route data.

## File Structure & Organization

```
app/
  root.tsx              # Root layout, global error boundary
  entry.client.tsx      # Client hydration entry
  entry.server.tsx      # Server rendering entry
  routes/
    _index.tsx          # Homepage
    dashboard.tsx       # Layout route for /dashboard/*
    dashboard._index.tsx
    dashboard.settings.tsx
  components/           # Shared UI components
  lib/                  # Server utilities, db, auth
  services/             # Business logic layer
```

- Use flat file routing (v2 default). Dots denote nesting: `routes/dashboard.settings.tsx`.
- Prefix with `_` for pathless layout routes: `routes/_auth.tsx` wraps auth pages without adding a URL segment.
- Prefix with `_index` for index routes.
- Use `($param)` for optional dynamic segments.

## Loaders

- Loaders fetch data on the server for GET requests. Return plain objects — Remix serializes them.
- Always validate and narrow the `params` type. Never trust raw params.
- Use `json()` helper for response headers/status. Use `defer()` for streaming non-critical data.
- Throw `Response` objects for error states — they propagate to error boundaries.
- Never import server-only code (DB, secrets) in a way that leaks to the client bundle.

```typescript
export async function loader({ request, params }: LoaderFunctionArgs) {
  const user = await requireAuth(request);
  const project = await db.project.findUnique({ where: { id: params.id } });
  if (!project) throw new Response("Not Found", { status: 404 });
  return json({ project });
}
```

## Actions

- Actions handle non-GET mutations (POST, PUT, DELETE). One action per route.
- Parse form data with `request.formData()`. Validate all fields server-side.
- Use the `intent` pattern for multiple forms in one route: `<button name="intent" value="delete">`.
- Return validation errors as structured data, not thrown responses.
- Always redirect after successful mutation to prevent resubmission.

```typescript
export async function action({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  const intent = form.get("intent");
  if (intent === "delete") {
    await db.post.delete({ where: { id: form.get("id") as string } });
    return redirect("/posts");
  }
  const result = schema.safeParse(Object.fromEntries(form));
  if (!result.success) return json({ errors: result.error.flatten() }, { status: 400 });
  await db.post.create({ data: result.data });
  return redirect("/posts");
}
```

## Nested Routes & Layouts

- Parent routes render `<Outlet />` for children. Each level owns its data and error boundary.
- Use `useMatches()` to access data from parent routes without prop drilling.
- Use `shouldRevalidate` to prevent unnecessary parent re-fetching on child navigation.
- Keep layouts lean — they re-render on every child navigation.
- Use `handle` export for route-level metadata (breadcrumbs, titles).

## Error Boundaries

- Export `ErrorBoundary` in every route that can fail. Catches loader/action errors and render errors.
- Use `useRouteError()` + `isRouteErrorResponse()` to distinguish expected (4xx) from unexpected errors.
- Error boundaries in parent routes catch child errors — design fallback UI per nesting level.
- Root error boundary must handle the case where no CSS or JS loaded (full HTML page).

## Streaming & Deferred Data

- Use `defer()` + `<Await>` + `<Suspense>` for non-blocking data not needed for initial render.
- Critical data (SEO, above-fold content) should be awaited in the loader — never deferred.
- Handle `<Await errorElement>` to gracefully degrade when deferred data fails.

## Forms & Progressive Enhancement

- Always use `<Form>` over `<form>` for Remix-aware submissions with client-side navigation.
- Use `useNavigation()` to show pending/optimistic UI during form submissions.
- Use `useFetcher()` for non-navigation mutations (like/unlike, inline edits, polling).
- Use `fetcher.Form` when a submission should not trigger a full page navigation.
- Multiple fetchers can run concurrently — each is independent.

## Anti-Patterns (Never Do)

- Never use `useEffect` to fetch data that should be in a loader.
- Never store loader data in React state — use `useLoaderData()` directly.
- Never use client-side global state (Redux, Zustand) for server data.
- Never put secrets or DB imports in files that export React components.
- Never use `window` or browser APIs in loaders/actions.
- Never use `action` for GET requests — that's what loaders are for.
- Never rely on JavaScript for form submission to work.

## Performance

- Use `headers` export to set Cache-Control per route.
- Use `prefetch="intent"` on `<Link>` for hover-based prefetching.
- Use resource routes (`loader` only, no component) for API endpoints and file downloads.
- Use `shouldRevalidate` to skip redundant data fetches on navigation.
- Use HTTP `stale-while-revalidate` caching for data that's fresh enough most of the time.

## Security

- Validate all form inputs on the server. Client validation is UX, not security.
- Use CSRF protection for state-changing actions (built into Remix's cookie-based sessions).
- Set `SameSite`, `HttpOnly`, `Secure` on session cookies.
- Sanitize user content before rendering — never use `dangerouslySetInnerHTML` with raw input.
- Use `Content-Security-Policy` headers in `entry.server.tsx`.
- Rate-limit actions on sensitive endpoints (login, signup, password reset).
