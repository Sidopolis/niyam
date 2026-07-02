# Common Anti-Patterns — Niyam Rules

## Purpose

This ruleset defines universal code anti-patterns that should be detected, flagged, and corrected. These patterns appear across all languages and frameworks. When you encounter them in code you're writing or reviewing, refactor immediately. When you find them in existing code you're not touching, mention them but don't fix drive-by.

---

## Over-Engineering

### The Problem
Building flexibility, abstraction, and infrastructure for requirements that don't exist yet. The cost is paid now; the benefit may never arrive.

### Symptoms
- Interfaces with a single implementation and no plans for a second
- Factory patterns wrapping a single constructor
- Configuration systems for values that never change
- Generic type parameters used in only one place
- "Plugin architectures" for applications with no plugins
- Abstract base classes with one subclass
- Dependency injection containers for 5-class applications

### The Fix
- Write the concrete implementation first. Extract abstractions only when duplication or testing demands it.
- "You Aren't Gonna Need It" (YAGNI) — delete speculative code.
- Ask: "If I remove this abstraction, does the code get simpler and still work?" If yes, remove it.
- Three strikes rule: abstract on the third use, not the first.

---

## Premature Optimization

### The Problem
Optimizing code before measuring where the actual bottleneck is. Produces complex, hard-to-maintain code that often optimizes the wrong thing.

### Symptoms
- Custom data structures when built-in ones suffice at current scale
- Caching layers without evidence of repeated expensive computation
- Bitwise operations for "performance" in code that runs once per request
- Pre-computed lookup tables for datasets under 1000 items
- Avoiding allocations in code that's not in a hot path
- Complex concurrency for tasks that complete in milliseconds
- Denormalized schemas before measuring query performance

### The Fix
- Profile first. Identify the actual bottleneck with real data at real scale.
- Optimize the algorithm before the implementation (O(n²) → O(n log n) beats micro-optimizations).
- Set performance budgets. Optimize only when a budget is exceeded.
- Benchmark before AND after. Prove the optimization actually helps.
- Comment WHY an optimization exists and what performance target it serves.

---

## God Objects

### The Problem
A class or module that knows too much and does too much. It becomes the nexus of all changes, making the codebase fragile and untestable.

### Symptoms
- Classes with 20+ methods spanning unrelated behaviors
- Modules imported by 80% of the codebase
- Files over 500 lines that keep growing
- Objects passed into every function as a "context" or "manager"
- Classes named `Utils`, `Helper`, `Manager`, `Service` (without a specific domain noun)
- Single objects handling validation, persistence, notification, AND business logic

### The Fix
- Split by responsibility. Each class has one reason to change.
- Extract behaviors into focused collaborators: `OrderValidator`, `OrderRepository`, `OrderNotifier`.
- Use composition: the god object becomes a coordinator that delegates to specialists.
- If splitting feels artificial, the domain model may need rethinking.

---

## Callback Hell

### The Problem
Deeply nested asynchronous callbacks that make control flow unreadable, error handling inconsistent, and debugging nightmarish.

### Symptoms
- Indentation depth > 4 levels from nested callbacks
- Error handling duplicated or missing at inner levels
- Variables hoisted to outer scopes to share between callbacks
- Logic split across multiple disconnected callback functions
- No clear way to cancel or timeout the operation chain

### The Fix
- Use async/await (JavaScript/Python/C#) or equivalent structured concurrency.
- Named functions instead of anonymous callbacks when logic exceeds 3 lines.
- Promise chains with proper `.catch()` at the end for intermediate-stage refactoring.
- For event-driven code: use reactive streams (RxJS, Reactor) when the pattern genuinely fits.
- Error handling at one level, not scattered through every callback.

---

## Magic Numbers and Strings

### The Problem
Literal values embedded in logic without explanation. The reader can't determine what the value means, why it was chosen, or how to change it safely.

### Symptoms
- `if (status === 3)` — what is status 3?
- `setTimeout(fn, 86400000)` — what's this timeout?
- `array.slice(0, 50)` — why 50?
- `color: '#3b82f6'` scattered through 20 files
- `if (role === 'admin_v2')` — stringly-typed logic
- `padding: 16` without explanation of the design system spacing

### The Fix
- Extract to named constants: `const MAX_RETRY_ATTEMPTS = 3`
- Use enums or union types for status codes and categories
- Configuration objects for values that might change between environments
- Design tokens for UI values (spacing, colors, breakpoints)
- The name should explain the MEANING, not just the VALUE: `PAYMENT_TIMEOUT_MS` not `THIRTY_THOUSAND`

---

## Stringly-Typed Code

### The Problem
Using strings to represent structured data, categories, states, or identifiers. Strings have no compile-time validation, no autocomplete, and fail silently on typos.

### Symptoms
- `type: 'user'` instead of an enum or union type
- Event names as freeform strings: `emit('usr_loggedIn')` — typo passes silently
- Configuration keys without schema validation
- String parsing to extract structured data: `id.split('_')[2]`
- Comparing strings for state transitions instead of using a state machine
- URLs built by concatenation instead of URL builder with typed parameters

### The Fix
- Enums or union types for finite sets of values
- Typed event systems with payload schemas
- Configuration validated at startup against a schema (Zod, JSON Schema, pydantic)
- Structured types instead of encoding data in string formats
- Template literal types (TypeScript) for string patterns that must conform to a shape
- Parse, don't validate: convert strings to typed structures at the boundary, use types internally

---

## Additional Anti-Patterns to Flag

### Primitive Obsession
Using primitives where a domain type would add safety: `userId: string` vs `userId: UserId`. Create value objects for identifiers, money, email, coordinates.

### Feature Envy
A method that accesses another object's data more than its own. Move the method to where the data lives.

### Shotgun Surgery
A single change requires touching 10+ files. Indicates scattered responsibility that should be co-located.

### Temporal Coupling
Functions that must be called in a specific order with no compile-time enforcement. Use builder patterns or state machines to make invalid sequences unrepresentable.

### Boolean Blindness
`process(data, true, false, true)` — three booleans with no indication of meaning. Use options objects with named fields or separate methods.

### Divergent Change
One module changes for multiple unrelated reasons. Split along the axes of change.

---

## Detection Heuristics

When reviewing code, actively scan for:
- Files over 300 lines → potential god object
- Functions over 30 lines → potential mixed concerns
- Indentation > 4 levels → potential callback hell or complex branching
- Repeated literal values → potential magic numbers
- String comparisons for branching → potential stringly-typed code
- Parameter lists > 4 items → potential missing domain object
- Comments explaining WHAT (not WHY) → potential unclear code that needs refactoring
