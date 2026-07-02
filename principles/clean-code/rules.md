# Clean Code — Niyam Rules

## Philosophy

Code is read 10x more than it is written. Optimize for the reader.
Clean code does one thing well, reads like well-written prose, and makes the developer's intent obvious.
Based on Robert C. Martin's principles — adapted as actionable directives for AI agents.

## Core Rules

### Naming

1. Names reveal intent. If a name requires a comment, it fails.
2. Use pronounceable, searchable names. Never single-letter variables outside loop indices.
3. Class names are nouns (`Invoice`, `UserRepository`). Method names are verbs (`calculateTotal`, `fetchUser`).
4. Avoid encodings, prefixes, and type-in-name (`strName`, `IInterface`, `m_member`).
5. One word per concept. If `fetch`, `retrieve`, and `get` coexist — pick one and use it everywhere.
6. Use domain vocabulary. A `Policy` in insurance code means something — don't call it `Rule`.
7. Length proportional to scope. Loop variable `i` is fine. Class-level field `i` is not.

### Functions

8. Functions do ONE thing. If you can extract another function with a non-trivial name, it does too much.
9. Maximum 20 lines. If longer, extract.
10. Maximum 3 parameters. More than 3 — introduce a parameter object.
11. No boolean flag parameters. Split into two functions instead.
12. No side effects. A function named `checkPassword` must not initialize a session.
13. Command-Query Separation: functions either DO something or ANSWER something, never both.
14. Functions should operate at one level of abstraction. Don't mix `getHtml()` with `String.append("\n")`.
15. Prefer exceptions over error codes. Error codes force nested conditionals.

### Comments

16. Comments compensate for failure to express intent in code. Minimize them.
17. Legal comments, TODO with ticket numbers, and "why" explanations are acceptable.
18. Never comment out code. Version control exists.
19. Don't comment WHAT code does — make the code say it. Comment only WHY.
20. Delete misleading or outdated comments immediately.

### Formatting

21. Files under 200 lines preferred, 500 max.
22. Vertical density: related code stays together. Separate concepts with blank lines.
23. Dependent functions: caller above callee (top-down readability).
24. Horizontal: max 120 characters. Never scroll horizontally.
25. Team formatting rules override personal preference. Use automated formatters.

### Objects and Data Structures

26. Objects hide data, expose behavior. Data structures expose data, have no behavior.
27. Don't create hybrids (half object, half data structure).
28. Law of Demeter: a method should only call methods on its own fields, parameters, or locally created objects.
29. DTOs are data structures — no business logic. Keep them pure.
30. Tell, Don't Ask. Tell objects what to do; don't ask for their state and decide for them.

### Error Handling

31. Use exceptions for exceptional conditions. Never use them for flow control.
32. Provide context with exceptions: what failed, what was attempted, what inputs caused it.
33. Define exception classes by how they are caught, not how they are thrown.
34. Never return null. Return empty collections, Optional types, or throw.
35. Never pass null. Validate at boundaries, then trust internally.
36. Wrap third-party exceptions in your own types at boundaries.

### Classes

37. Single Responsibility: a class has one reason to change.
38. Classes should be small — measured by responsibilities, not lines.
39. High cohesion: methods use most instance variables.
40. Open/Closed: open for extension, closed for modification.
41. Depend on abstractions, not concretions.

### Emergence (Simple Design Rules)

42. Passes all tests.
43. Contains no duplication.
44. Expresses the programmer's intent.
45. Minimizes the number of classes and methods.

## Implementation Guidelines

- Before writing any function, state its single responsibility in one sentence.
- Before naming anything, ask: "Would a new team member understand this in 5 seconds?"
- Extract until each function fits on one screen without scrolling.
- When touching existing code, leave it cleaner than you found it (Boy Scout Rule).
- Use automated tools: linters enforce formatting, static analysis catches smells.
- Treat warnings as errors in CI. Zero tolerance for ignored warnings.

## Anti-Patterns

- **God Class**: class with 10+ responsibilities. Split by cohesion.
- **Primitive Obsession**: using strings/ints where a domain type belongs.
- **Feature Envy**: method uses another class's data more than its own.
- **Shotgun Surgery**: one change requires editing 10 files. Consolidate.
- **Data Clumps**: same 3 parameters always travel together. Make a class.
- **Long Parameter Lists**: more than 3 params. Introduce parameter object.
- **Dead Code**: unreachable code, unused variables. Delete immediately.
- **Speculative Generality**: abstractions for future use. YAGNI.
- **Magic Numbers**: unexplained literals. Extract named constants.
- **Inconsistent Naming**: `getUser` here, `fetchUser` there. Pick one convention.

## Verification

- [ ] Every name reveals intent without needing a comment
- [ ] Every function does exactly one thing at one level of abstraction
- [ ] No function exceeds 20 lines or 3 parameters
- [ ] No commented-out code exists
- [ ] Error handling uses exceptions with context, never returns null
- [ ] Classes have single responsibility and high cohesion
- [ ] No Law of Demeter violations (train wrecks like `a.getB().getC().doThing()`)
- [ ] Formatter and linter pass with zero warnings
- [ ] No duplication — DRY verified across the changeset
- [ ] Code reads top-to-bottom without jumping around
