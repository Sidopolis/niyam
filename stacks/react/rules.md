# React 19+ — Niyam Rules

## Core Principles

1. **Function components only.** No class components. No `React.FC` — use plain function declarations with typed props.
2. **Composition over inheritance.** Build complex UI from small, focused components.
3. **Unidirectional data flow.** Props down, events up. Never mutate props.
4. **Server Components by default.** Only add `'use client'` when the component needs interactivity, browser APIs, or hooks.
5. **Colocation.** Keep related files (component, styles, tests, types) together.

## File Structure & Organization

- One component per file. File name matches component name in PascalCase.
- Colocate tests: `Button.tsx` → `Button.test.tsx` in the same directory.
- Extract hooks into `hooks/` when reused across components.
- Extract types into a `types.ts` file only when shared; otherwise inline.
- Group by feature, not by type. Avoid `components/`, `hooks/`, `utils/` at root level for large apps.

```
features/
  auth/
    LoginForm.tsx
    LoginForm.test.tsx
    useAuth.ts
    types.ts
```

## Patterns & Best Practices

### Components
- Declare props as an inline type or a named `Props` type. Never use `any`.
- Destructure props in the parameter list.
- Use `children: React.ReactNode` for slot-based composition.
- Prefer controlled components. Uncontrolled only for performance-critical forms.

### Hooks
- Custom hooks start with `use`. They encapsulate logic, not UI.
- Never call hooks conditionally or inside loops.
- Use `useCallback` and `useMemo` only when passing to memoized children or expensive computations — not by default.
- Prefer `useReducer` over `useState` when state transitions are complex or interdependent.
- Use `use()` hook for reading promises and context in React 19+.

### State Management
- Local state first. Lift only when siblings need it.
- Context for low-frequency global state (theme, auth, locale).
- External stores (Zustand, Jotai) for high-frequency or complex shared state.
- Never store derived data in state. Compute it during render.

### Patterns
- **Compound Components:** Use Context to share implicit state between parent/children.
- **Render Props:** Use when children need dynamic rendering logic.
- **Custom Hooks:** Extract reusable stateful logic.
- **Forwarding Refs:** Use `ref` prop directly (React 19+ supports ref as a prop on function components).

### Accessibility
- All interactive elements must be keyboard accessible.
- Use semantic HTML (`button`, `nav`, `main`, `article`) before `div` with ARIA.
- Images require `alt`. Decorative images use `alt=""`.
- Form inputs must have associated `<label>` elements.
- Announce dynamic content with `aria-live` regions.
- Test with screen readers and axe-core.

## Anti-Patterns (Never Do)

- Never use `index` as `key` for dynamic lists.
- Never mutate state directly. Always return new references.
- Never use `useEffect` for derived state — compute inline.
- Never suppress ESLint exhaustive-deps warnings without documenting why.
- Never use `any` or `as unknown as T` to silence type errors.
- Never nest component definitions inside other components.
- Never use `dangerouslySetInnerHTML` without sanitization (DOMPurify).
- Never call `setState` during render without a condition guard.
- Never store JSX in state.

## Performance

- Use `React.memo()` only for components that re-render with the same props frequently.
- Use `React.lazy()` + `<Suspense>` for code-splitting at route boundaries.
- Use `startTransition` for non-urgent state updates.
- Use `useDeferredValue` for expensive re-renders triggered by user input.
- Virtualize long lists (react-window or @tanstack/virtual).
- Avoid creating objects/arrays inline in JSX props — hoist or memoize them.
- Profile with React DevTools Profiler before optimizing.

## Testing

- Use React Testing Library (`@testing-library/react`). No Enzyme.
- Test behavior, not implementation. Query by role, label, text — never by class or test-id unless necessary.
- Use `userEvent` over `fireEvent` for realistic interactions.
- Test accessibility with `jest-axe`.
- Mock API calls with MSW (Mock Service Worker), not by mocking fetch directly.
- Wrap state updates in `act()` only when RTL doesn't handle it automatically.
- Test custom hooks with `renderHook`.

```tsx
test('submits form with valid data', async () => {
  const user = userEvent.setup();
  render(<LoginForm onSubmit={mockSubmit} />);
  await user.type(screen.getByLabelText(/email/i), 'test@example.com');
  await user.type(screen.getByLabelText(/password/i), 'secure123');
  await user.click(screen.getByRole('button', { name: /sign in/i }));
  expect(mockSubmit).toHaveBeenCalledWith({ email: 'test@example.com', password: 'secure123' });
});
```

## Security

- Sanitize all user-generated HTML before rendering with `dangerouslySetInnerHTML`.
- Never interpolate user input into `href` without validating the protocol (prevent `javascript:` URLs).
- Use CSP headers to mitigate XSS.
- Avoid storing sensitive data in component state or localStorage.
- Validate all data from external sources at the boundary.
