# Node.js 22+ — Niyam Rules

## Core Principles

1. **ESM only.** Use ES modules exclusively. No CommonJS in new code.
2. **Async by default.** Use `async/await` for all I/O. Never block the event loop.
3. **Fail loudly.** Handle errors explicitly. Unhandled rejections crash the process — that's correct behavior.
4. **Streams for scale.** Process large data with streams, not loading everything into memory.
5. **Security at boundaries.** Validate all inputs. Trust nothing from the network.

## File Structure & Organization

```
project/
  package.json          # "type": "module"
  src/
    index.ts            # Entry point
    server.ts           # HTTP server setup
    routes/
      users.ts
    services/
      user-service.ts
    middleware/
      auth.ts
      validation.ts
    lib/
      database.ts
      logger.ts
  tests/
    users.test.ts
```

- Set `"type": "module"` in `package.json` for ESM.
- Use `.js` extensions in imports (required for ESM): `import { x } from './utils.js'`.
- Separate server creation from listening (testability).
- Keep `index.ts` thin — just bootstrap and wiring.
- Use `node:` prefix for built-in modules: `import { readFile } from 'node:fs/promises'`.

## Patterns & Best Practices

### ESM Modules
- Use named exports over default exports for better tree-shaking and refactoring.
- Use `import type` for type-only imports (TypeScript).
- No dynamic `require()`. Use `import()` for dynamic loading.
- Use `node:` prefix for all built-in imports.

### Streams
- Use `pipeline()` from `node:stream/promises` for composing streams safely.
- Use `Readable.from()` to create readable streams from iterables.
- Transform streams with `Transform` class or async generators.
- Always handle `'error'` events on streams or use pipeline.
- Use `stream.compose()` for reusable stream pipelines.

### Worker Threads
- Use for CPU-bound operations (parsing, compression, crypto).
- Share data via `SharedArrayBuffer` or structured clone.
- Use `worker_threads.isMainThread` to guard worker-only code.
- Pool workers for repeated tasks — don't spawn per-request.

### Clustering
- Use `node:cluster` for multi-process HTTP servers.
- Let the load balancer or cluster module handle distribution.
- Workers should be stateless — use external stores for shared state.

### Native Test Runner
- Use `node:test` with `describe`, `it`, `test` for built-in testing.
- Use `--experimental-test-coverage` for coverage reports.
- Use `mock` from `node:test` for mocking.
- Use `t.after()` for cleanup.

```typescript
import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';

describe('UserService', () => {
  it('creates a user with valid data', async () => {
    const repo = { save: mock.fn(async (user) => ({ ...user, id: '1' })) };
    const service = new UserService(repo);
    const user = await service.create({ name: 'Test', email: 'test@test.com' });
    assert.equal(user.id, '1');
    assert.equal(repo.save.mock.calls.length, 1);
  });
});
```

### Error Handling
- Use custom error classes extending `Error` with `cause` property.
- Set `process.on('unhandledRejection')` to log and crash — never silently continue.
- Use `AbortController` for cancellable operations.
- Always clean up resources in `finally` blocks.

## Anti-Patterns (Never Do)

- Never use `require()` in ESM projects.
- Never block the event loop with synchronous I/O in server code.
- Never use `eval()` or `new Function()` with external input.
- Never ignore stream errors — always attach error handlers or use pipeline.
- Never buffer entire request bodies without size limits.
- Never use `process.env` without validation at startup.
- Never catch errors and continue without handling them properly.
- Never use callbacks when Promise/async APIs exist.

## Performance

- Use `node --inspect` and Chrome DevTools for profiling.
- Use `UV_THREADPOOL_SIZE` for I/O-heavy workloads.
- Use `Buffer.allocUnsafe()` only when immediately filling the buffer.
- Use `setImmediate()` to break up CPU-intensive synchronous work.
- Use HTTP keep-alive and connection pooling for outbound requests.
- Monitor event loop lag with `perf_hooks.monitorEventLoopDelay()`.

## Testing

- Use `node:test` (native) or Vitest for testing.
- Test HTTP endpoints with actual server instances (supertest or native fetch).
- Use dependency injection for testable services.
- Mock external services at the HTTP level (MSW or nock).
- Test error paths explicitly.
- Use `--test-only` flag for focused test runs during development.

## Security

- Validate all inputs with a schema library (Zod, AJK). Reject unknown properties.
- Set request body size limits. Use streaming parsers for large payloads.
- Prevent SSRF: validate URLs, block internal IP ranges (127.0.0.0/8, 10.0.0.0/8, 169.254.0.0/16).
- Use `helmet` or equivalent for security headers.
- Rate limit APIs. Use exponential backoff for retries.
- Never construct shell commands from user input. Use `execFile` with argument arrays.
- Pin dependencies. Run `npm audit` in CI.
- Use `crypto.timingSafeEqual()` for constant-time comparisons (tokens, signatures).
