# Go 1.22+ — Niyam Rules

## Core Principles

1. **Simplicity wins.** Write boring, obvious code. Go's strength is readability.
2. **Errors are values.** Handle them explicitly at every call site. Never ignore returned errors.
3. **Composition over inheritance.** Use interfaces and struct embedding.
4. **Concurrency is not parallelism.** Use goroutines for concurrent work, not as a default.
5. **Accept interfaces, return structs.** Keep APIs flexible for callers, concrete for implementations.

## File Structure & Organization

```
project/
  go.mod
  go.sum
  cmd/
    server/main.go       # Entry points
    cli/main.go
  internal/              # Private to this module
    auth/
      handler.go
      handler_test.go
      service.go
      repository.go
    domain/
      user.go
  pkg/                   # Public reusable packages (use sparingly)
  api/                   # OpenAPI specs, proto files
```

- Package names are short, lowercase, singular: `auth`, `user`, `http`.
- File names are lowercase with underscores: `user_repository.go`.
- Test files are colocated: `handler_test.go` next to `handler.go`.
- `internal/` prevents external imports — use liberally.
- `cmd/` for each binary. Keep `main()` thin — just wiring.

## Patterns & Best Practices

### Error Handling
- Check errors immediately after the call. Never `_ = SomeFunc()`.
- Wrap errors with context: `fmt.Errorf("fetching user %d: %w", id, err)`.
- Use `errors.Is()` for sentinel errors, `errors.As()` for typed errors.
- Define sentinel errors as package-level `var ErrNotFound = errors.New("not found")`.
- Return early on errors. Keep the happy path left-aligned.

### Interfaces
- Define interfaces where they are consumed, not where they are implemented.
- Keep interfaces small — 1-3 methods. Prefer single-method interfaces.
- Use standard library interfaces: `io.Reader`, `io.Writer`, `fmt.Stringer`.
- Never export interfaces solely for mocking — accept interfaces in function parameters.

### Goroutines & Channels
- Always ensure goroutines can exit. Use `context.Context` for cancellation.
- Use `errgroup.Group` for coordinating concurrent work with error propagation.
- Prefer channels for communication, mutexes for protecting shared state.
- Never start goroutines in library code without a way to stop them.
- Close channels from the sender side only.

### Context Propagation
- Pass `context.Context` as the first parameter to every function that does I/O.
- Never store context in a struct. Pass it explicitly.
- Use `context.WithTimeout` or `context.WithCancel` for deadline management.
- Check `ctx.Err()` before expensive operations.

### Generics (1.18+)
- Use generics for type-safe containers, algorithms, and utility functions.
- Prefer concrete types when generics add complexity without reuse.
- Use type constraints (`comparable`, `any`, custom constraints).

### Struct Embedding
- Embed for composition, not for inheritance simulation.
- Embed interfaces in structs for partial implementation.
- Be careful with exported embedded types — they expose all methods.

## Anti-Patterns (Never Do)

- Never use `panic` for expected errors. Reserve for truly unrecoverable states.
- Never ignore errors with `_`. If you intentionally discard, comment why.
- Never use `init()` for complex logic. Keep it for simple registration.
- Never use package-level mutable variables (global state).
- Never use `interface{}` / `any` without a compelling reason — prefer generics.
- Never use naked goroutines without lifecycle management.

## Performance

- Use `sync.Pool` for frequently allocated/freed objects.
- Pre-allocate slices with `make([]T, 0, capacity)` when size is known.
- Use `strings.Builder` for string concatenation in loops.
- Profile with `pprof` before optimizing. Benchmark with `testing.B`.
- Avoid allocations in hot paths — check with escape analysis (`go build -gcflags='-m'`).

## Testing

- Use table-driven tests as the default pattern.
- Use `t.Helper()` in test helper functions for correct line reporting.
- Use `t.Parallel()` for independent tests.
- Use `httptest.NewServer` for HTTP integration tests.
- Use build tags for integration tests: `//go:build integration`.
- Use `t.Cleanup()` for teardown instead of `defer` when possible.

```go
func TestParseEmail(t *testing.T) {
    tests := []struct {
        name    string
        input   string
        want    string
        wantErr bool
    }{
        {name: "valid", input: "user@example.com", want: "user@example.com"},
        {name: "empty", input: "", wantErr: true},
    }
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            got, err := ParseEmail(tt.input)
            if (err != nil) != tt.wantErr {
                t.Errorf("error = %v, wantErr %v", err, tt.wantErr)
                return
            }
            if got != tt.want {
                t.Errorf("got %q, want %q", got, tt.want)
            }
        })
    }
}
```

## Security

- Validate all inputs at API boundaries.
- Use `crypto/rand` for random values, never `math/rand` for security-sensitive contexts.
- Use `html/template` (auto-escaping) for HTML output, not `text/template`.
- Set timeouts on all `http.Server` and `http.Client` instances.
- Use `context.WithTimeout` for database and external service calls.
- Never log sensitive data (tokens, passwords, PII).
- Run `govulncheck` in CI for vulnerability scanning.
