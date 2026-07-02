# Rust — Niyam Rules

## Core Principles

1. **Ownership is correctness.** Embrace the borrow checker — it prevents bugs, not productivity.
2. **Make illegal states unrepresentable.** Use enums and the type system to enforce invariants at compile time.
3. **Error handling is explicit.** Use `Result<T, E>` for recoverable errors. Reserve `panic!` for programming bugs.
4. **Zero-cost abstractions.** Use generics and traits to write expressive code without runtime overhead.
5. **Unsafe is auditable.** Minimize `unsafe`. Document invariants. Isolate behind safe APIs.

## File Structure & Organization

```
project/
  Cargo.toml
  Cargo.lock
  src/
    main.rs / lib.rs    # Crate root
    error.rs            # Custom error types
    config.rs
    domain/
      mod.rs
      user.rs
    api/
      mod.rs
      handlers.rs
  tests/                # Integration tests
    api_test.rs
  benches/              # Benchmarks
    performance.rs
```

- One module per file. Use `mod.rs` or `module_name.rs` (prefer the latter for new code).
- Keep `main.rs` thin — just initialization and wiring.
- `lib.rs` exposes the public API. `main.rs` is the binary entrypoint.
- Use workspaces (`[workspace]` in root `Cargo.toml`) for multi-crate projects.
- Integration tests in `tests/` directory test the public API only.

## Patterns & Best Practices

### Ownership & Borrowing
- Pass by reference (`&T`) for read access, `&mut T` for write access.
- Transfer ownership only when the function needs to own the data.
- Use `Clone` sparingly — prefer references. Clone is acceptable for small types.
- Return owned values from constructors and factory functions.
- Use `Cow<'_, str>` when a function might or might not need to allocate.

### Lifetimes
- Elision handles most cases. Only annotate when the compiler requires it.
- Prefer owned types in structs over references with lifetimes for simplicity.
- Use `'static` only for truly static data or when required by trait bounds.

### Error Handling
- Use `thiserror` for library error types (derives `std::error::Error`).
- Use `anyhow` for application-level error propagation with context.
- Use `?` operator for propagation. Never `.unwrap()` in library code.
- `.unwrap()` and `.expect()` only when you can prove the value exists (with a comment).
- Map errors at boundaries: convert library errors to domain errors.

### Traits
- Define small, focused traits. Prefer composition over large trait hierarchies.
- Use trait objects (`dyn Trait`) for runtime polymorphism when needed.
- Prefer generics (`impl Trait` / `<T: Trait>`) for zero-cost static dispatch.
- Implement standard traits: `Debug`, `Display`, `Clone`, `PartialEq` as appropriate.
- Use `From`/`Into` for type conversions. Implement `From`, consumers use `Into`.

### Pattern Matching
- Match exhaustively. Never use `_ =>` to ignore variants you should handle.
- Use `if let` for single-variant checks. Use `match` for multiple branches.
- Destructure in match arms for clarity.
- Use `matches!` macro for boolean pattern checks.

### Async (Tokio)
- Use `tokio::spawn` for concurrent tasks. Always handle `JoinHandle` errors.
- Use `tokio::select!` for racing futures with cancellation.
- Prefer `tokio::sync::mpsc` for channels, `tokio::sync::Mutex` for async mutexes.
- Never hold a `std::sync::Mutex` across an `.await` point.
- Use `#[tokio::main]` only in `main.rs`. Libraries should be runtime-agnostic.

## Anti-Patterns (Never Do)

- Never use `.unwrap()` or `.expect()` in production paths without proof of safety.
- Never use `unsafe` without a `// SAFETY:` comment explaining invariants.
- Never use `String` where `&str` suffices (and vice versa without reason).
- Never clone to satisfy the borrow checker without understanding why ownership conflicts.
- Never use `Rc`/`Arc` as a default — prefer ownership transfer or borrowing.
- Never suppress warnings with `#[allow(...)]` without justification.
- Never use `Box<dyn Any>` for type erasure — use enums or generics.

## Performance

- Avoid unnecessary allocations. Prefer stack allocation and slices.
- Use `Vec::with_capacity` when the size is known ahead of time.
- Use iterators over manual indexing — they enable compiler optimizations.
- Use `&[u8]` over `String` for binary data processing.
- Profile with `flamegraph`, `criterion` for benchmarks.
- Use `#[inline]` sparingly — only for small, hot functions in library code.
- Prefer `SmallVec` or `ArrayVec` for small, bounded collections.

## Testing

- Unit tests in `#[cfg(test)] mod tests` at the bottom of each file.
- Integration tests in `tests/` directory test only the public API.
- Use `#[test]` attribute. Use `#[tokio::test]` for async tests.
- Use `assert_eq!`, `assert_ne!`, `assert!` with descriptive messages.
- Use `proptest` or `quickcheck` for property-based testing.
- Use `mockall` for mocking traits in unit tests.

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parse_valid_email() {
        let result = Email::parse("user@example.com");
        assert!(result.is_ok());
        assert_eq!(result.unwrap().domain(), "example.com");
    }

    #[test]
    fn parse_invalid_email_returns_error() {
        let result = Email::parse("not-an-email");
        assert!(matches!(result, Err(ParseError::InvalidFormat)));
    }
}
```

## Security

- Use `secrecy` crate for sensitive values (prevents accidental logging).
- Validate all inputs at public API boundaries.
- Use `ring` or `rustcrypto` for cryptographic operations.
- Never use `unsafe` to bypass safety checks for performance without benchmarks proving need.
- Use `cargo audit` in CI for dependency vulnerability scanning.
- Use `cargo deny` to enforce license and security policies.
- Sanitize all data before passing to system commands (`Command`).
