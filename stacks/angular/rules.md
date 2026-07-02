# Angular 18+ — Niyam Rules

## Core Principles

1. **Signals are the future.** Use signals for state management. Migrate away from manual subscriptions.
2. **Standalone components.** No NgModules for new code. Every component is standalone.
3. **Inject, don't construct.** Use `inject()` function over constructor injection.
4. **New control flow.** Use `@if`, `@for`, `@switch` — not `*ngIf`, `*ngFor`, `*ngSwitch`.
5. **Type safety.** Strict TypeScript. Strongly typed forms, HTTP responses, and templates.

## File Structure & Organization

```
src/app/
  app.config.ts          # Application configuration (providers)
  app.routes.ts          # Route definitions
  app.component.ts       # Root component
  core/
    interceptors/
      auth.interceptor.ts
    guards/
      auth.guard.ts
    services/
      auth.service.ts
  features/
    users/
      user-list.component.ts
      user-detail.component.ts
      user.service.ts
      user.model.ts
  shared/
    components/
      button.component.ts
    pipes/
      date-format.pipe.ts
    directives/
      click-outside.directive.ts
```

- Single-file components when template is small (inline template).
- Separate `.html` template files when template exceeds ~20 lines.
- Feature folders group related components, services, and models.
- `core/` for singleton services, guards, interceptors.
- `shared/` for reusable components, pipes, directives.

## Patterns & Best Practices

### Signals
- Use `signal()` for component state. Replaces simple class properties.
- Use `computed()` for derived state. Replaces getters with caching.
- Use `effect()` for side effects when signal values change.
- Use `input()` and `output()` signal-based component APIs.
- Use `toSignal()` to convert Observables to signals. Use `toObservable()` for reverse.

```typescript
@Component({
  selector: 'app-counter',
  standalone: true,
  template: `
    <p>Count: {{ count() }}</p>
    <p>Doubled: {{ doubled() }}</p>
    <button (click)="increment()">+</button>
  `,
})
export class CounterComponent {
  count = signal(0);
  doubled = computed(() => this.count() * 2);

  increment() {
    this.count.update(c => c + 1);
  }
}
```

### Standalone Components
- Set `standalone: true` on every component, directive, and pipe.
- Import dependencies directly in the component's `imports` array.
- Use `provideRouter()`, `provideHttpClient()` in `app.config.ts`.
- Lazy-load feature routes with `loadComponent` and `loadChildren`.

### inject() Function
- Use `inject()` in the constructor body or field initializer.
- Prefer over constructor parameter injection — cleaner, works with inheritance.
- Use `inject(TOKEN, { optional: true })` for optional dependencies.

### New Control Flow
```html
@if (user()) {
  <h1>{{ user().name }}</h1>
} @else {
  <p>Loading...</p>
}

@for (item of items(); track item.id) {
  <app-item [data]="item" />
} @empty {
  <p>No items found.</p>
}

@defer (on viewport) {
  <app-heavy-component />
} @loading {
  <app-spinner />
}
```

### Defer Blocks
- Use `@defer` for lazy-loading heavy components.
- Triggers: `on viewport`, `on interaction`, `on idle`, `on timer(ms)`, `when condition`.
- Use `@loading`, `@placeholder`, `@error` for loading states.
- Prefetch with `prefetch on idle` for perceived performance.

### RxJS Best Practices
- Use signals where possible. Reserve RxJS for complex async streams.
- Always unsubscribe: use `takeUntilDestroyed()`, `DestroyRef`, or `async` pipe.
- Prefer higher-order operators (`switchMap`, `mergeMap`, `concatMap`) over nested subscribes.
- Use `shareReplay({ bufferSize: 1, refCount: true })` for shared observables.
- Never subscribe in services without cleanup strategy.

### NgRx (when needed)
- Use NgRx only for complex state shared across unrelated components.
- Use `createActionGroup` for related actions.
- Use `createFeature` for reducer + selectors boilerplate reduction.
- Use `signalStore` (NgRx Signals) for signal-based state management.
- Keep effects focused — one effect per side-effect concern.

## Anti-Patterns (Never Do)

- Never use NgModules for new code. Everything is standalone.
- Never use `*ngIf` or `*ngFor` — use `@if` and `@for`.
- Never subscribe in components without unsubscription strategy.
- Never use `any` in HTTP responses — type all API calls.
- Never mutate signal values directly — use `set()`, `update()`, or `mutate()`.
- Never put logic in templates — use computed signals or methods.
- Never import `CommonModule` — import specific directives/pipes if needed.

## Performance

- Use `@defer` blocks for below-the-fold or heavy components.
- Use `ChangeDetectionStrategy.OnPush` on all components (signals make this trivial).
- Use `track` in `@for` loops — equivalent to trackBy.
- Lazy-load routes with `loadComponent` / `loadChildren`.
- Use `NgOptimizedImage` for image optimization.
- Avoid excessive `effect()` calls — prefer `computed()` for derived state.
- Use `provideHttpClient(withInterceptorsFromDi())` for tree-shakeable HTTP.

## Testing

- Use `TestBed.configureTestingModule` with minimal imports for standalone components.
- Use `ComponentFixture` for component tests.
- Use `HttpClientTestingModule` / `provideHttpClientTesting()` for HTTP mocking.
- Test signals by reading their values after triggering changes.
- Use `fakeAsync` + `tick()` for time-dependent tests.
- Use Cypress or Playwright for E2E.

```typescript
it('increments counter on button click', () => {
  const fixture = TestBed.createComponent(CounterComponent);
  fixture.detectChanges();
  const button = fixture.nativeElement.querySelector('button');
  button.click();
  fixture.detectChanges();
  expect(fixture.nativeElement.textContent).toContain('Count: 1');
});
```

## Security

- Use `HttpInterceptor` for attaching auth tokens — never manually per-request.
- Sanitize dynamic HTML with Angular's built-in DomSanitizer.
- Never bypass security with `bypassSecurityTrustHtml` without sanitization.
- Use route guards for authorization. Never rely on UI hiding alone.
- Enable strict CSP. Angular supports nonce-based CSP.
- Validate all form inputs server-side, regardless of client validation.
