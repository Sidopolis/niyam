# Svelte 5+ — Niyam Rules

## Core Principles

1. **Runes are the model.** Use `$state`, `$derived`, `$effect` for all reactivity. No legacy `let` reactivity.
2. **Less boilerplate.** Svelte compiles away the framework. Write minimal, direct code.
3. **Progressive enhancement.** Forms work without JavaScript via SvelteKit form actions.
4. **Colocation.** Keep logic, markup, and styles in the same `.svelte` file.
5. **Server-first.** Load data on the server. Use SvelteKit's `load` functions.

## File Structure & Organization

```
src/
  lib/
    components/
      Button.svelte
      Modal.svelte
    server/             # Server-only code
      db.ts
    utils.ts
    types.ts
  routes/
    +layout.svelte
    +layout.server.ts
    +page.svelte
    +page.server.ts     # Server load function
    +error.svelte
    dashboard/
      +page.svelte
      +page.ts          # Universal load function
  app.html
  hooks.server.ts       # Server hooks
  hooks.client.ts       # Client hooks
svelte.config.js
```

- `$lib/` alias for `src/lib/`. Use it for imports.
- `+page.svelte` for route pages. `+layout.svelte` for shared layouts.
- `+page.server.ts` for server-only data loading and form actions.
- `+page.ts` for universal (server + client) load functions.
- Components in `$lib/components/`. Reusable across routes.

## Patterns & Best Practices

### Runes ($state, $derived, $effect)
- Use `$state()` for reactive declarations. Replaces `let x = value` reactivity.
- Use `$derived()` for computed values. Replaces `$: x = ...` reactive statements.
- Use `$effect()` for side effects. Replaces `$: { ... }` reactive blocks.
- Use `$props()` to declare component props. Replaces `export let`.
- Use `$bindable()` for two-way bindable props.

```svelte
<script lang="ts">
  let { name, count = $bindable(0) }: { name: string; count: number } = $props();

  let doubled = $derived(count * 2);

  $effect(() => {
    console.log(`Count changed to ${count}`);
    return () => { /* cleanup */ };
  });
</script>
```

### SvelteKit Load Functions
- Use `+page.server.ts` for data that requires server secrets (DB, API keys).
- Use `+page.ts` when data can be fetched client-side during navigation.
- Return plain objects from load functions. They're serialized automatically.
- Use `depends()` for custom invalidation keys.
- Use `error()` and `redirect()` helpers for control flow.

### Form Actions
- Define actions in `+page.server.ts` with the `actions` export.
- Use `<form method="POST">` for progressive enhancement.
- Use `use:enhance` for client-side enhancement without full reload.
- Validate form data on the server. Return errors via `fail()`.
- Use named actions: `<form action="?/login" method="POST">`.

### Hooks
- `hooks.server.ts`: `handle` for middleware (auth, logging, redirects).
- Use `sequence()` to compose multiple handle functions.
- `handleError` for custom error handling and reporting.
- Use `locals` to pass data from hooks to load functions.

### Transitions & Animations
- Use `transition:` directive for enter/exit animations.
- Use `in:` and `out:` for separate enter/exit transitions.
- Use `animate:flip` for list reordering animations.
- Keep transitions short (150-300ms) for perceived performance.

## Anti-Patterns (Never Do)

- Never use legacy `$:` reactive statements — use runes.
- Never use `export let` for props — use `$props()`.
- Never use Svelte stores (`writable`, `readable`) — use `$state` in `.svelte.ts` files.
- Never mutate `$page.data` directly.
- Never put secrets in universal load functions (`+page.ts`).
- Never use `onMount` for data fetching — use load functions.
- Never bypass SvelteKit's router with manual `fetch` for navigation.
- Never use `$effect` for derived state — use `$derived`.

## Performance

- Use `{#key}` blocks to force re-creation of components when identity changes.
- Use `{#await}` blocks for inline async rendering.
- Avoid unnecessary `$effect` calls — prefer `$derived` when possible.
- Use `loading="lazy"` on images below the fold.
- Use SvelteKit's preloading: `data-sveltekit-preload-data="hover"`.
- Split routes with dynamic imports via SvelteKit's code-splitting (automatic).
- Use `$state.frozen()` for large state objects that change infrequently.

## Testing

- Use `@testing-library/svelte` for component tests.
- Use Playwright for E2E tests with SvelteKit.
- Test load functions as plain async functions.
- Test form actions by calling them with mock `RequestEvent`.
- Use `vitest` as the test runner (integrates with SvelteKit).

```typescript
import { render, screen } from '@testing-library/svelte';
import Counter from './Counter.svelte';

test('increments count on click', async () => {
  render(Counter, { props: { initial: 0 } });
  const button = screen.getByRole('button');
  await button.click();
  expect(screen.getByText('1')).toBeInTheDocument();
});
```

## Security

- Validate all form action inputs on the server.
- Use `hooks.server.ts` for authentication checks.
- Set security headers in the `handle` hook.
- Never expose server-only data through universal load functions.
- Use CSRF protection (built-in for form actions with SvelteKit).
- Sanitize HTML before rendering with `{@html}` — use DOMPurify.
