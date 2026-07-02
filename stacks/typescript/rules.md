# TypeScript 5+ — Niyam Rules

## Core Principles

1. **Strict mode always.** Enable all strict flags. No `any` in production code.
2. **Types as documentation.** The type system should make invalid states unrepresentable.
3. **Infer when obvious, annotate when not.** Let TypeScript infer return types for simple functions; annotate complex or public APIs.
4. **Narrow, don't cast.** Use type guards and control flow analysis instead of `as` assertions.
5. **Prefer immutability.** Use `readonly`, `as const`, and `Readonly<T>` by default.

## File Structure & Organization

- Type definitions colocated with the code that uses them.
- Shared types in a `types/` or `types.ts` file at the feature level.
- Barrel exports (`index.ts`) only at package boundaries — not within features.
- Use `.ts` for logic, `.tsx` only for files containing JSX.
- No `I` prefix for interfaces. No `T` prefix for types.
- Name types after what they represent: `User`, `CreateUserInput`, `AuthState`.

## Patterns & Best Practices

### Strict Mode Configuration
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Discriminated Unions
- Use a literal `type` or `kind` field as the discriminant.
- Exhaustive checking with `never` in switch default or `satisfies`.
- Prefer unions over optional properties when states are mutually exclusive.

```typescript
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };
```

### Branded Types
- Use for type-safe identifiers that are structurally the same (e.g., `UserId` vs `PostId`).
- Define with intersection: `type UserId = string & { readonly __brand: 'UserId' }`.
- Create constructor functions that validate and brand.

### Generics
- Use meaningful constraint names: `<TItem>`, `<TInput, TOutput>`.
- Constrain generics: `<T extends Record<string, unknown>>`.
- Don't over-genericize — if there's only one concrete type, use it directly.
- Use `satisfies` operator for type-safe object literals with inference preserved.

### Type Guards
- Prefer `is` return type annotations for custom guards.
- Use `in` operator for discriminating object shapes.
- Use `Array.isArray()` for array checks.
- Never use `as` to force a type — narrow with runtime checks instead.

### Utility Types
- `Partial<T>`, `Required<T>`, `Pick<T, K>`, `Omit<T, K>` for transformations.
- `Record<K, V>` for dictionaries with known key types.
- `Extract<T, U>` and `Exclude<T, U>` for union manipulation.
- `NonNullable<T>` to strip null/undefined.
- `ReturnType<T>`, `Parameters<T>` for inferring from functions.
- Create project-specific utility types for repeated patterns.

### Module Augmentation & Declaration Merging
- Use module augmentation to extend third-party types safely.
- Use declaration merging for extending interfaces (e.g., Express Request).
- Keep augmentations in dedicated `.d.ts` files with clear documentation.

## Anti-Patterns (Never Do)

- Never use `any`. Use `unknown` for truly unknown values, then narrow.
- Never use `as` assertions to silence errors — fix the underlying type issue.
- Never use `!` (non-null assertion) without proving the value exists.
- Never use `@ts-ignore` or `@ts-expect-error` without a linked issue/explanation.
- Never use `Function` type. Use specific signatures: `(arg: string) => void`.
- Never use `object` or `{}` as a type — they're almost meaningless.
- Never export mutable variables. Export functions that return or modify state.
- Never use `enum` — use `as const` objects or union types instead.

## Performance

- Use `const` assertions for literal types and better tree-shaking.
- Prefer interfaces over type aliases for object shapes (faster type-checking).
- Avoid deeply nested conditional types in hot paths (slow compilation).
- Use project references for large monorepos (incremental compilation).
- Use `isolatedModules: true` for compatibility with esbuild/swc.

## Testing

- Type-test your public API types with `expectTypeOf` (vitest) or `tsd`.
- Test type guards return correct narrowing.
- Use `satisfies` in tests to verify object shapes without casting.
- Generic functions should have tests with multiple concrete type instantiations.

```typescript
// Type-level testing
import { expectTypeOf } from 'vitest';

test('createUser returns User type', () => {
  const user = createUser({ name: 'Test', email: 'test@test.com' });
  expectTypeOf(user).toEqualTypeOf<User>();
});
```

## Security

- Validate external data at runtime — types are erased. Use Zod or similar.
- Never trust `as` casts on API responses. Parse and validate.
- Use branded types for sensitive values (passwords, tokens) to prevent accidental exposure.
- Enable `noPropertyAccessFromIndexSignature` to catch potential undefined access.
- Use `readonly` on function parameters that should not be mutated.
