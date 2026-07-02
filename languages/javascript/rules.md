# JavaScript — Niyam Rules

## Purpose

Language-specific rules for JavaScript beyond framework conventions. These cover runtime behavior, language gotchas, and patterns that trip up even experienced developers. Apply these whenever writing vanilla JS or working in any JS-based framework.

---

## Closures

### Correct Usage
- Closures capture variables by reference, not by value. In loops, this means all iterations share the final value.
- Use `let` in `for` loops (block-scoped per iteration) instead of `var` (function-scoped, shared).
- Factory functions leverage closures for encapsulation without class overhead.
- Be intentional about what a closure captures. Large captured scopes prevent garbage collection.

### Patterns
```javascript
// Private state via closure — lightweight encapsulation
function createCounter(initial = 0) {
  let count = initial;
  return {
    increment: () => ++count,
    decrement: () => --count,
    value: () => count,
  };
}

// Partial application
function multiply(a) {
  return (b) => a * b;
}
const double = multiply(2);
```

### Pitfalls
- Closures in event listeners can leak memory if the listener is never removed and captures DOM references.
- Closures over mutable variables in async code: the variable may change before the callback executes.
- Over-capturing: if your closure references a large object but only needs one property, destructure first.

---

## Prototypes & Inheritance

### Rules
- Prefer classes (syntactic sugar over prototypes) for clarity. Use prototypes directly only for metaprogramming.
- Understand the prototype chain: property lookup walks `__proto__` until `null`. This affects performance for deeply nested chains.
- `Object.create(null)` for dictionary objects — no prototype pollution risk.
- Never modify `Object.prototype`, `Array.prototype`, or other built-in prototypes.
- Use `hasOwnProperty` or `Object.hasOwn()` when iterating object keys from untrusted data.

### When to Use What
- **Classes:** domain models, stateful services, anything with methods that operate on internal data.
- **Plain objects + functions:** data transfer, configuration, stateless operations.
- **Composition over inheritance:** prefer `Object.assign` or spread for mixing behaviors rather than multi-level class hierarchies.

---

## Event Loop & Concurrency

### Mental Model
- JavaScript is single-threaded. The event loop processes: call stack → microtasks → macrotasks.
- Microtasks (Promise callbacks, queueMicrotask) execute BEFORE the next macrotask (setTimeout, I/O).
- A long synchronous operation blocks everything: rendering, I/O callbacks, timers.

### Rules
- Never block the event loop with synchronous computation. For CPU-heavy work: Web Workers (browser) or worker_threads (Node.js).
- `setTimeout(fn, 0)` doesn't execute immediately — it queues a macrotask after current microtasks.
- `Promise.resolve().then(fn)` executes sooner than `setTimeout(fn, 0)` — microtask vs macrotask.
- In Node.js, `process.nextTick` fires before other microtasks. Use sparingly; it can starve I/O.
- `setInterval` drift: intervals aren't precise. For accurate timing, use `setTimeout` chains with drift correction.
- Batch DOM updates within a single frame. Multiple synchronous DOM reads/writes cause layout thrashing.

### Async Patterns
```javascript
// Parallel execution — when tasks are independent
const [users, orders] = await Promise.all([fetchUsers(), fetchOrders()]);

// Sequential with early exit
const results = [];
for (const url of urls) {
  const res = await fetch(url); // Intentionally sequential
  if (!res.ok) break;
  results.push(await res.json());
}

// Concurrency limit — prevent overwhelming the server
async function mapWithConcurrency(items, fn, concurrency = 5) {
  const results = [];
  const executing = new Set();
  for (const item of items) {
    const p = fn(item).then(r => { executing.delete(p); return r; });
    executing.add(p);
    results.push(p);
    if (executing.size >= concurrency) await Promise.race(executing);
  }
  return Promise.all(results);
}
```

---

## WeakRef & FinalizationRegistry

### When to Use
- Caches where entries can be garbage-collected when memory pressure increases.
- Tracking DOM elements or objects without preventing their cleanup.
- Never for control flow or correctness — GC timing is non-deterministic.

### Rules
- `WeakRef.deref()` can return `undefined` at any time. Always check.
- `FinalizationRegistry` callbacks are not guaranteed to run (process exit, for example).
- Use `WeakMap` and `WeakSet` for associating metadata with objects without preventing GC — these are more reliable than `WeakRef` for most use cases.
- Don't use WeakRef as a substitute for proper resource management (closing connections, releasing handles).

```javascript
// Cache that doesn't prevent GC
class WeakCache {
  #cache = new Map();

  get(key) {
    const ref = this.#cache.get(key);
    if (!ref) return undefined;
    const value = ref.deref();
    if (!value) this.#cache.delete(key); // Clean up dead ref
    return value;
  }

  set(key, value) {
    this.#cache.set(key, new WeakRef(value));
  }
}
```

---

## Async Patterns

### Error Handling
- Always handle rejected promises. Unhandled rejections crash Node.js (since v15) and are bugs in browsers.
- Use `try/catch` with `await`. Don't mix `.then().catch()` and `async/await` in the same function.
- For `Promise.all`, one rejection rejects all. Use `Promise.allSettled` when you need partial results.
- Wrap callback-based APIs with `util.promisify` (Node.js) or manual Promise constructors.

### Cancellation
- `AbortController` + `AbortSignal` for cancellable fetch, streams, and custom async operations.
- Pass signals through the entire async chain. A cancelled parent should cancel children.
- Check `signal.aborted` before starting expensive work in long-running loops.

### Gotchas
- `async` functions always return a Promise. Even `return 42` becomes `Promise.resolve(42)`.
- `forEach` doesn't await. Use `for...of` for sequential async iteration.
- Returning a Promise from `async` function: `return promise` and `return await promise` differ in stack traces. Use `return await` in try/catch blocks.
- `Promise.race` doesn't cancel the losers. They continue executing, just ignored.

---

## Module Systems

### ESM (ES Modules) — Default Choice
- `import/export` for all new code. Tree-shakeable, statically analyzable, strict mode by default.
- Named exports over default exports: better refactoring support, clearer imports.
- Use `.js` extensions in import paths for ESM compatibility (even for TypeScript with `--moduleResolution node16`).
- Top-level `await` is available in ESM. Use for initialization that must complete before module is usable.

### CommonJS (CJS) — Legacy
- `require/module.exports`. Synchronous, dynamic, not tree-shakeable.
- Still needed for: Node.js scripts without `"type": "module"`, some tooling configs.
- Don't mix `require()` and `import` in the same file. Pick one system per module.

### Interop
- ESM can `import` CJS modules (Node.js handles the wrapping).
- CJS cannot `require()` ESM modules synchronously. Use dynamic `import()` if needed.
- Libraries should ship both formats via `exports` field in `package.json` (`"import"` and `"require"` conditions).

### Dynamic Imports
- `import('module')` returns a Promise. Use for code splitting and conditional loading.
- Don't use dynamic imports for static dependencies — it prevents tree-shaking and bundle analysis.
- Preload critical dynamic imports: `<link rel="modulepreload">` in browsers.

---

## Runtime Gotchas

### Equality & Coercion
- Always use `===` and `!==`. Never rely on type coercion in comparisons.
- `typeof null === 'object'` — historical bug, won't be fixed. Check with `value === null`.
- `NaN !== NaN` — use `Number.isNaN()` not global `isNaN()` (which coerces).
- `0.1 + 0.2 !== 0.3` — use epsilon comparison for floats or integer math (cents, not dollars).

### Numbers
- All numbers are 64-bit floats. Integers are safe up to `Number.MAX_SAFE_INTEGER` (2^53 - 1).
- Use `BigInt` for larger integers (IDs from databases, cryptographic values).
- `parseInt('08')` works correctly in modern engines, but always pass the radix: `parseInt(str, 10)`.

### `this` Binding
- Arrow functions inherit `this` from enclosing scope. Regular functions get `this` from call site.
- Class methods: use arrow functions in constructors or class fields for callbacks.
- `bind()` creates a new function — don't call it in render loops (creates garbage).

### Iteration
- `for...in` iterates enumerable properties (including inherited). Use for objects with `hasOwn` check.
- `for...of` iterates iterables (arrays, maps, sets, generators). Use for collections.
- `Array.from()` for converting iterables/array-likes. Spread `[...iterable]` works too but is less clear for non-arrays.
