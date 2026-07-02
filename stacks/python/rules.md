# Python 3.12+ — Niyam Rules

## Core Principles

1. **Explicit over implicit.** Clear, readable code. No magic.
2. **Type everything.** All function signatures have type annotations. Use `mypy --strict` or `pyright`.
3. **Fail fast.** Raise exceptions early. Don't return `None` to signal errors.
4. **Modern Python.** Use 3.12+ features: type parameter syntax, `match` statements, f-strings, walrus operator where clear.
5. **One obvious way.** Follow PEP 8 and established idioms. Use `ruff` for formatting and linting.

## File Structure & Organization

```
project/
  pyproject.toml        # Single source of truth for metadata, deps, tools
  src/
    package_name/
      __init__.py
      models.py
      services.py
      exceptions.py
  tests/
    conftest.py
    test_models.py
    test_services.py
  .python-version       # Pin Python version
```

- Use `src/` layout to prevent accidental imports of uninstalled code.
- One class per file for large classes. Group small related classes.
- `__init__.py` exports the public API — keep it minimal.
- Keep `pyproject.toml` as the single config file for all tools (ruff, pytest, mypy).

## Patterns & Best Practices

### Type Hints
- Use built-in generics: `list[str]`, `dict[str, int]`, `tuple[int, ...]`.
- Use `|` for unions: `str | None` instead of `Optional[str]`.
- Use `TypeAlias` or the `type` statement (3.12+) for complex types.
- Use `Protocol` for structural typing instead of ABCs when possible.
- Use `@overload` for functions with multiple return types based on input.

### Dataclasses & Models
- Use `@dataclass(frozen=True, slots=True)` for immutable value objects.
- Use `__post_init__` for validation.
- Use `field(default_factory=list)` for mutable defaults — never `= []`.
- Prefer dataclasses over NamedTuple for complex data.

### Async/Await
- Use `asyncio` for I/O-bound concurrency.
- Never mix sync and async in the same call path without `asyncio.to_thread()`.
- Use `async with` for resource management (connections, sessions).
- Use `TaskGroup` (3.11+) instead of `asyncio.gather()` for structured concurrency.
- Cancel tasks cleanly — handle `CancelledError`.

### Match Statements
- Use for complex branching on data shapes.
- Always include a wildcard `case _` with clear handling (raise or log).
- Prefer match over if/elif chains when checking type or structure.

### Error Handling
- Define domain-specific exceptions inheriting from a base project exception.
- Catch specific exceptions. Never bare `except:` or `except Exception:` without re-raise.
- Use `from` in `raise NewError(...) from original` to preserve context.
- Return early on error conditions. Keep the happy path unindented.

### Virtual Environments & Packaging
- Use `uv` or `pip` with `pyproject.toml`. No `setup.py` or `requirements.txt` as primary.
- Pin dependencies in a lockfile (`uv.lock` or `pip-compile` output).
- Separate dev dependencies: `[project.optional-dependencies] dev = [...]`.

## Anti-Patterns (Never Do)

- Never use mutable default arguments (`def f(items=[])`).
- Never use `import *` — always explicit imports.
- Never catch and silence exceptions without logging.
- Never use `type: ignore` without a specific error code and comment.
- Never use global mutable state.
- Never use `eval()` or `exec()` with user input.
- Never return `None` to indicate failure — raise an exception.
- Never use bare string literals for structured data — use enums or literals.

## Performance

- Use generators and `itertools` for large data processing.
- Use `__slots__` on classes instantiated many times.
- Profile with `cProfile` or `py-spy` before optimizing.
- Use `functools.lru_cache` or `@cache` for pure function memoization.
- Use list/dict/set comprehensions over manual loops.
- Use `collections.deque` for O(1) append/pop from both ends.
- Consider `numpy`/`polars` for numerical work — avoid manual loops over arrays.

## Testing

- Use `pytest` exclusively. No `unittest.TestCase` subclassing.
- Use fixtures (`@pytest.fixture`) for setup/teardown. Prefer factory fixtures.
- Use `parametrize` for table-driven tests.
- Use `tmp_path` fixture for file system tests.
- Use `monkeypatch` for environment variables and patching.
- Use `pytest-asyncio` for async tests with `@pytest.mark.asyncio`.

```python
@pytest.mark.parametrize("input_val,expected", [
    ("valid@email.com", True),
    ("not-an-email", False),
    ("", False),
])
def test_validate_email(input_val: str, expected: bool) -> None:
    assert validate_email(input_val) is expected
```

## Security

- Never use `pickle` with untrusted data.
- Use `secrets` module for tokens, not `random`.
- Parameterize all SQL queries — never f-string interpolation.
- Validate and sanitize all external input at boundaries.
- Use `hashlib` with `pbkdf2_hmac` or `bcrypt` for password hashing.
- Set `httponly`, `secure`, `samesite` on cookies.
- Run `bandit` or `ruff` security rules in CI.
