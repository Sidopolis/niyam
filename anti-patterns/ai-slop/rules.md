# AI-Generated Code Anti-Patterns — Niyam Rules

## Purpose

This ruleset identifies anti-patterns specific to AI-generated code (LLM slop). These patterns emerge when AI assistants generate code without full project context, hallucinate APIs, or apply generic patterns that don't fit the specific codebase. Detect these in your own output and in code reviews of AI-assisted work.

---

## Zombie Comments

### The Problem
Comments that describe exactly what the code does, adding zero information. AI models generate these reflexively because they were trained on commented code.

### Symptoms
```
// Initialize the counter
let counter = 0;

// Loop through the array
for (const item of items) {
  // Increment the counter
  counter++;
}

// Return the result
return counter;
```

### The Fix
- Delete comments that restate the code. If the code needs explanation, refactor the code.
- Keep only comments that explain WHY: business rules, non-obvious constraints, workarounds.
- `// Offset by 1 because the API uses 1-based pagination` — useful.
- `// Add one to the page number` — useless. Delete it.

---

## Swallowed Exceptions

### The Problem
AI-generated code wraps everything in try/catch but does nothing meaningful with errors. It looks "safe" but hides failures, making debugging impossible.

### Symptoms
```javascript
try {
  const data = await fetchUser(id);
  return data;
} catch (error) {
  console.log(error);
  return null;
}
```
```python
try:
    result = process_payment(order)
except Exception:
    pass
```

### The Fix
- Catch specific exceptions, not all exceptions.
- Handle errors meaningfully: retry, fallback, throw with context, or inform the user.
- If you truly can't handle it, re-throw with added context: `throw new PaymentError('Failed to charge card', { cause: error })`.
- `console.log` is not error handling. Use structured logging with severity levels.
- Empty `catch` blocks are bugs. If the error genuinely doesn't matter, comment WHY.
- Ask: "If this fails at 3 AM, will anyone notice?" If not, you've swallowed a critical error.

---

## `as any` / Type Assertion Abuse

### The Problem
AI code that can't resolve TypeScript types resorts to `as any`, `as unknown as T`, or `@ts-ignore`. This defeats the entire purpose of using TypeScript.

### Symptoms
```typescript
const data = response.data as any;
const user = JSON.parse(body) as User;  // No runtime validation
(event.target as any).value;
// @ts-ignore — TODO: fix types later
```

### The Fix
- Fix the actual type issue. If the type is wrong, correct the type definition.
- Use runtime validation at boundaries: Zod, io-ts, class-validator.
- Type guards for narrowing: `if ('email' in data)` or custom type predicates.
- Generic constraints instead of type assertions.
- If an assertion is genuinely necessary (rare), add a comment explaining why the types can't express this.
- Treat every `as any` as tech debt. Track it. Fix it in the same PR if possible.

---

## Dead Imports and Unused Variables

### The Problem
AI generates imports for APIs it hallucinated or used in an earlier iteration, then leaves them when the approach changes. Unused code suggests incomplete thinking.

### Symptoms
```javascript
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
// Only useState is actually used

import axios from 'axios';
// fetch() is used instead

const { data, error, loading, refetch, networkStatus } = useQuery(GET_USERS);
// Only data is used
```

### The Fix
- Run the linter. `no-unused-vars` and `no-unused-imports` catch these instantly.
- Import only what you use. Destructure only what you reference.
- If you see dead imports in AI output, question whether the approach is coherent.
- Configure auto-removal in your editor/IDE (organize imports on save).
- Dead imports often indicate the AI switched approaches mid-generation without cleanup.

---

## Over-Abstraction

### The Problem
AI models love abstractions because training data contains library code, framework code, and enterprise patterns. They apply factory-repository-service-controller patterns to 20-line scripts.

### Symptoms
```typescript
// For a single database table with CRUD operations:
interface IUserRepository { ... }
class UserRepository implements IUserRepository { ... }
interface IUserService { ... }
class UserService implements IUserService { ... }
class UserController { ... }
class UserFactory { ... }
class UserValidator { ... }
class UserMapper { ... }
// 8 files for what should be 1 module with 4 functions
```

### The Fix
- Count the implementations. Interface with 1 implementation = unnecessary indirection.
- Start concrete. Extract abstractions only when you have 2+ implementations or need test doubles.
- A function that calls a function that calls a function that does the thing → just do the thing.
- Ask: "If I inline this abstraction, is the code simpler?" If yes, inline it.
- Layers earn their existence through independent testability or deployment. Otherwise, they're just folders.

---

## Hallucinated APIs

### The Problem
AI models confidently use functions, methods, options, and parameters that don't exist. They blend APIs across versions, mix similar libraries, or invent plausible-sounding methods.

### Symptoms
```javascript
// Non-existent options
fetch(url, { timeout: 5000 });  // fetch doesn't have timeout option

// Wrong API version
const router = express.Router({ strict: true, caseSensitive: true, mergeParams: true });
router.handleError(fn);  // This method doesn't exist

// Mixing libraries
import { useQuery } from '@tanstack/react-query';
const { data } = useQuery('users', fetchUsers);  // v4 syntax, v5 uses object
```

### The Fix
- Verify every API call against current documentation or type definitions.
- Run the code. Hallucinated APIs fail immediately at runtime.
- Type-checking catches most hallucinated methods in TypeScript.
- Be especially suspicious of: optional parameters, configuration objects, and method chaining.
- Check the library version in package.json. AI often uses outdated API signatures.
- When an AI suggests an API you haven't seen before, verify it exists before using it.

---

## Copy-Paste Patterns

### The Problem
AI generates code by pattern-matching against similar examples in training data. This produces repeated blocks that should be abstracted, and inconsistent naming that reveals stitched-together generation.

### Symptoms
```javascript
// Same structure repeated 5 times with minor variations:
const handleNameChange = (e) => { setName(e.target.value); setNameError(''); };
const handleEmailChange = (e) => { setEmail(e.target.value); setEmailError(''); };
const handlePhoneChange = (e) => { setPhone(e.target.value); setPhoneError(''); };
const handleAddressChange = (e) => { setAddress(e.target.value); setAddressError(''); };
const handleCityChange = (e) => { setCity(e.target.value); setCityError(''); };
```

### The Fix
- Extract repeated patterns into reusable functions or components.
- Use data-driven approaches: define fields as configuration, render/handle dynamically.
- If you see 3+ blocks that differ only by a name, that's a loop or a map, not copy-paste.
- Inconsistent naming within a file (camelCase mixed with snake_case) suggests stitched generation — normalize it.

---

## Additional AI Slop Patterns

### Unnecessary `async`
Marking functions `async` that never `await` anything. Returns a Promise wrapper for no reason.

### Overly Defensive Null Checks
```typescript
if (user && user.name && user.name.length && user.name.length > 0)
// When user is guaranteed non-null by the caller
```
AI adds defensive checks for impossible states because it doesn't know the invariants.

### Framework Boilerplate Cargo-Culting
Generating full Redux/Vuex stores for state that a single `useState` handles. Using ORMs for a single-table query. Adding middleware layers for pass-through logic.

### Inconsistent Error Messages
Error messages that describe a different function or scenario — copied from training data. `"Failed to fetch user"` in a function that processes payments.

### Placeholder Logic
```javascript
// TODO: implement actual validation
function validate(input) {
  return true;
}
```
AI acknowledges it can't complete something but leaves non-functional code that LOOKS functional.

---

## Detection Checklist

When reviewing AI-generated code, check for:
- [ ] Are all imports actually used?
- [ ] Do all called APIs/methods exist in the installed version?
- [ ] Are there `as any` or `@ts-ignore` casts?
- [ ] Are exceptions handled or just logged/swallowed?
- [ ] Do comments add information beyond what the code says?
- [ ] Is there copy-paste duplication that should be a loop or function?
- [ ] Are there abstractions with only one implementation?
- [ ] Does the error handling match the failure modes of this specific code?
- [ ] Are there defensive null checks for values that can't be null?
- [ ] Does it compile and pass the type checker without `any`?
