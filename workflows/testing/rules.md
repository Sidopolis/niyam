# Testing Strategy — Niyam Rules

## Purpose

Tests exist to enable confident change. A test suite that doesn't catch bugs or that breaks
on every refactor serves neither purpose. Balance coverage with maintenance cost.
The test pyramid guides investment: many unit tests, fewer integration, fewest e2e.

## Standards

### Test Pyramid

1. Unit tests (70%): fast, isolated, test one function/class. Hundreds to thousands.
2. Integration tests (20%): test component interactions, real DB/services. Tens to hundreds.
3. E2E tests (10%): test critical user flows through the full stack. Fewer than 50.
4. Invert the pyramid only when the layer below is impractical (e.g., heavy UI apps).
5. Each layer catches different bugs. Don't duplicate coverage across layers.

### What to Test

6. Business logic: every rule, calculation, state transition. This is the core.
7. Edge cases: empty inputs, boundaries, overflow, null, concurrent access.
8. Error paths: invalid input rejected, failures handled gracefully.
9. Integration points: API contracts, database queries return expected shapes.
10. Security: unauthorized access denied, input validation works.

### What NOT to Test

11. Framework internals: don't test that React renders a div or Express routes.
12. Third-party libraries: don't test that `lodash.sortBy` sorts correctly.
13. Trivial code: simple getters, configuration constants, type definitions.
14. Implementation details: private methods, internal state, execution order.
15. One-to-one code mirrors: tests that duplicate the implementation logic.

### Test Isolation

16. Each test sets up its own state and tears it down. No shared mutable state.
17. Tests run in any order, in parallel, and produce the same result.
18. Database tests: use transactions that roll back, or isolated test databases.
19. Time-dependent tests: mock the clock. Never depend on real time.
20. Network-dependent tests: mock external APIs. Use contract tests for verification.

### Fixtures and Factories

21. Use factories (builders) over fixtures for test data. Factories compose; fixtures don't.
22. Factory pattern: `createUser({ email: 'test@example.com' })` — override only what matters.
23. Keep test data minimal. Only set properties relevant to the test.
24. Shared fixtures are acceptable for read-only reference data (countries, currencies).
25. Never use production data in tests. Generate synthetic data.

### Flaky Test Prevention

26. No network calls in unit tests. Mock all I/O.
27. No sleep/wait in tests. Use deterministic waits (polling, events, callbacks).
28. No dependency on system state: environment variables, file system, clock.
29. No test ordering dependencies. If test B fails without test A, B is broken.
30. Quarantine flaky tests immediately. Fix within 48 hours or delete.
31. Track flaky test rate as a team metric. Target: zero known flaky tests.

### Test Naming and Structure

32. Name tests by behavior: `rejects_order_when_stock_insufficient`.
33. Arrange-Act-Assert structure. One blank line separating each section.
34. One logical assertion per test. Multiple asserts OK if they verify one concept.
35. Group tests by feature/behavior, not by method name.

## Process

1. Write test before implementation (TDD) for business logic.
2. Run full unit suite locally before pushing (< 2 minutes).
3. CI runs all layers: unit, integration, e2e on every PR.
4. Review tests in code review — test quality matters as much as production code.
5. Monitor test metrics: execution time, flaky rate, coverage trends.

## Automation

- Unit tests run on every file save in watch mode during development.
- Integration tests run in CI with containerized dependencies (testcontainers).
- E2E tests run against staging after deployment.
- Coverage reports generated in CI, tracked over time, never used as a sole quality gate.
- Mutation testing scheduled weekly on core business logic modules.
- Auto-skip unchanged test modules in CI (where tooling supports safely).

## Anti-Patterns

- **Ice Cream Cone**: many e2e, few unit tests. Inverted pyramid is slow and fragile.
- **Testing Implementation**: asserting internal method calls instead of observable behavior.
- **Assertion-Free Tests**: tests that run code without verifying outcomes.
- **Shared Mutable State**: tests polluting each other through global state.
- **Sleeping in Tests**: `sleep(2000)` waiting for async. Use proper async utilities.
- **Copy-Paste Tests**: duplicated test code. Extract helpers and factories.
- **Testing the Mock**: complex mock setup that tests the mock, not the code.
- **Ignoring Failures**: commenting out failing tests. Fix them or delete them.
- **Brittle Selectors**: E2E tests using CSS classes or DOM structure. Use data-testid.
