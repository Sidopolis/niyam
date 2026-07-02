# Test-Driven Development — Niyam Rules

## Philosophy

Write the test first. Let the test drive the design. TDD is not about testing — it's about design feedback.
Based on Kent Beck's principles: tests are a thinking tool, not a verification afterthought.
Red -> Green -> Refactor. No step is optional.

## Core Rules

### The Three Laws of TDD

1. Do not write production code until you have a failing test.
2. Write only enough test code to produce a failure (compilation failure counts).
3. Write only enough production code to make the failing test pass.

### Red-Green-Refactor Cycle

4. RED: Write one small, focused test that fails. Run it. Confirm it fails for the RIGHT reason.
5. GREEN: Write the simplest code that makes the test pass. Hardcode if needed. No cleverness.
6. REFACTOR: Remove duplication, improve names, extract methods. Tests must stay green throughout.
7. Cycle time: 1-5 minutes per iteration. If longer, the step is too big.

### Test Naming

8. Test names describe behavior, not implementation: `should_reject_expired_token` not `test_validate_method`.
9. Pattern: `[unit]_[scenario]_[expected_result]` or `should_[outcome]_when_[condition]`.
10. Test names form living documentation. Reading test names should explain the module.

### One Assertion Per Test

11. Each test verifies ONE logical concept. Multiple assertions are acceptable if they verify one concept.
12. If a test has `// and also...` — split it.
13. Arrange-Act-Assert (AAA) structure. One blank line between each section.
14. No conditional logic in tests. No if/else, no loops, no try/catch (unless testing exceptions).

### Test Structure

15. Tests are FIRST: Fast, Independent, Repeatable, Self-validating, Timely.
16. No test depends on another test's execution or state.
17. No test depends on external systems (network, filesystem, database) — mock boundaries.
18. Tests run in any order and produce the same result.
19. A test that passes sometimes is worse than no test. Fix or delete immediately.

### Mocking Strategy

20. Mock at boundaries only: external services, databases, filesystem, clock, randomness.
21. Never mock the system under test. Never mock value objects.
22. Prefer fakes and stubs over mocks. Mocks verify interaction; stubs provide data.
23. If you need more than 3 mocks in a test, the design has too many dependencies — refactor.
24. Mock behaviors, not implementations. `when(repo.findById(id)).thenReturn(user)` — not internal calls.

### Coverage Philosophy

25. Coverage measures what tests EXECUTE, not what they VERIFY. 100% coverage with no assertions is worthless.
26. Aim for high coverage on business logic (90%+). Accept lower on glue code and infrastructure.
27. Never write tests to hit a coverage number. Write tests that document behavior.
28. Uncovered code is a signal, not a target. Investigate why it's uncovered.
29. Mutation testing reveals weak tests better than coverage metrics.

### When to Skip TDD

30. Spike/prototype code: explore first, write tests after you understand the solution.
31. Generated code, configuration, and pure wiring code.
32. UI layout (test behavior, not pixels).
33. Never skip TDD for business logic, algorithms, state machines, or data transformations.
34. If you skip TDD, write tests immediately after — before committing.

## Implementation Guidelines

- Start every feature with a test file. If you can't write a test, you don't understand the requirement.
- Use the test as a design conversation: "What's the simplest interface for this behavior?"
- When stuck, write the assertion first, then work backward to the arrange step.
- Keep test setup under 5 lines. If longer, extract a builder or factory.
- Use test data builders for complex objects: `UserBuilder.aUser().withExpiredToken().build()`.
- Run the full test suite before committing. No broken tests in version control.
- Test edge cases: null, empty, boundary values, overflow, concurrency.

## Anti-Patterns

- **Test After**: Writing code first then "adding tests." Produces tests that verify implementation, not behavior.
- **The Giant Test**: 50-line tests verifying everything. Split into focused scenarios.
- **Testing Implementation**: asserting that private methods were called. Test observable behavior.
- **Fragile Tests**: tests that break when refactoring internals. Couple to public API only.
- **Slow Tests**: tests touching network/DB without reason. Mock boundaries.
- **Test Interdependence**: test B fails when test A doesn't run first. Eliminate shared state.
- **The Liar**: test that always passes regardless of code correctness. Verify the test can fail.
- **Mock Everything**: mocking value objects, data structures, or the SUT. Mock only boundaries.
- **Ignoring Red**: making a test pass without understanding why it failed.

## Verification

- [ ] Every piece of business logic has a test written BEFORE the implementation
- [ ] Tests run in under 10 seconds (unit tests) or under 2 minutes (full suite)
- [ ] No test depends on execution order or shared mutable state
- [ ] Test names form readable documentation of system behavior
- [ ] Mocks exist only at system boundaries (I/O, external services)
- [ ] Each test verifies one logical concept
- [ ] All tests pass before every commit
- [ ] Mutation testing score exceeds 80% on core logic
- [ ] No flaky tests exist in the suite
- [ ] Coverage on business logic exceeds 90%
