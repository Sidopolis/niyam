# Vue 3+ — Niyam Rules

## Core Principles

1. **Composition API only.** Use `<script setup>` for all components. No Options API in new code.
2. **Reactivity is explicit.** Use `ref()` for primitives, `reactive()` for objects. Understand unwrapping.
3. **Single File Components.** Keep template, script, and styles colocated in `.vue` files.
4. **Composables for reuse.** Extract reusable logic into `use*` composable functions.
5. **Type safety.** Use TypeScript with Vue. Define prop types explicitly.

## File Structure & Organization

```
src/
  app.vue
  main.ts
  components/
    AppButton.vue
    AppModal.vue
  composables/
    useAuth.ts
    useFetch.ts
  stores/
    auth.ts
    user.ts
  pages/              # Nuxt auto-routing or vue-router views
    index.vue
    dashboard.vue
  layouts/
    default.vue
  types/
    index.ts
```

- Components are PascalCase: `AppButton.vue`, `UserCard.vue`.
- Composables are camelCase with `use` prefix: `useAuth.ts`.
- Stores are camelCase: `auth.ts`, `user.ts`.
- Multi-word component names always (avoid collision with HTML elements).

## Patterns & Best Practices

### Script Setup
- Always use `<script setup lang="ts">`. No `defineComponent()` boilerplate.
- Use `defineProps<T>()` with TypeScript interface for typed props.
- Use `defineEmits<T>()` for typed events.
- Use `defineModel()` for v-model bindings.
- Use `defineExpose()` only when parent needs imperative access.

```vue
<script setup lang="ts">
interface Props {
  title: string;
  count?: number;
}

const props = withDefaults(defineProps<Props>(), {
  count: 0,
});

const emit = defineEmits<{
  update: [value: number];
  close: [];
}>();
</script>
```

### Reactivity
- Use `ref()` for primitives and values you need to reassign.
- Use `reactive()` for objects/arrays you mutate in place.
- Use `computed()` for derived values — they are cached.
- Use `watch()` for side effects on reactive changes.
- Use `watchEffect()` when you want automatic dependency tracking.
- Never destructure `reactive()` objects — loses reactivity. Use `toRefs()`.

### Pinia Stores
- One store per domain concept. Keep stores focused.
- Use `defineStore` with setup syntax (composition API style).
- Expose state as `ref`, getters as `computed`, actions as functions.
- Use `storeToRefs()` when destructuring store state in components.

```typescript
export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const isAuthenticated = computed(() => user.value !== null);

  async function login(credentials: Credentials) {
    user.value = await authApi.login(credentials);
  }

  function logout() {
    user.value = null;
  }

  return { user, isAuthenticated, login, logout };
});
```

### Composables
- Name with `use` prefix: `useAuth`, `useFetch`, `useDebounce`.
- Return reactive values (refs/computeds) and methods.
- Accept refs as parameters for reactive inputs.
- Handle cleanup with `onUnmounted` or return a cleanup function.

### Provide/Inject
- Use for deeply nested component communication (avoid prop drilling).
- Always provide with `InjectionKey<T>` for type safety.
- Provide from the highest appropriate ancestor, not the root by default.

### Nuxt 3
- Use `useFetch()` and `useAsyncData()` for data fetching with SSR support.
- Use `server/api/` for API routes.
- Use `definePageMeta()` for page-level configuration.
- Auto-imports: components, composables, and utils are auto-imported.

## Anti-Patterns (Never Do)

- Never use Options API (`data()`, `methods`, `computed` object syntax).
- Never mutate props. Emit events to request parent changes.
- Never use `this` in `<script setup>` — it doesn't exist.
- Never use `v-html` with unsanitized user input.
- Never use `$forceUpdate` — fix the reactivity instead.
- Never use mixins — use composables.
- Never register components globally unless truly used everywhere.
- Never use `reactive()` for primitives — use `ref()`.

## Performance

- Use `v-once` for static content that never changes.
- Use `v-memo` for expensive list items with rare changes.
- Use `<KeepAlive>` for caching component instances during route changes.
- Use `defineAsyncComponent()` for code-splitting heavy components.
- Use `shallowRef()` / `shallowReactive()` for large objects where deep reactivity is unnecessary.
- Use `<Teleport>` for modals/tooltips to avoid layout recalculations.
- Avoid `v-if` + `v-for` on the same element — `v-if` has higher priority in Vue 3.

## Testing

- Use Vitest + `@vue/test-utils` for component testing.
- Use `mount()` for full component rendering, `shallowMount()` for isolation.
- Test composables by calling them inside a `withSetup` helper or directly.
- Use `flushPromises()` for async operations.
- Test Pinia stores as plain functions (with `createTestingPinia`).

```typescript
import { mount } from '@vue/test-utils';
import LoginForm from './LoginForm.vue';

test('emits submit with credentials', async () => {
  const wrapper = mount(LoginForm);
  await wrapper.find('[data-test="email"]').setValue('user@test.com');
  await wrapper.find('[data-test="password"]').setValue('pass123');
  await wrapper.find('form').trigger('submit');
  expect(wrapper.emitted('submit')![0]).toEqual([{ email: 'user@test.com', password: 'pass123' }]);
});
```

## Security

- Never use `v-html` with user-provided content without DOMPurify.
- Validate all props that accept URLs (prevent `javascript:` protocol).
- Use CSP headers compatible with Vue's rendering.
- Sanitize route params before using in templates or API calls.
- Never expose API keys in client-side code.
