# Domain-Driven Design — Niyam Rules

## Philosophy

Software should model the business domain, not the database schema or UI layout.
The domain model is the heart of the system — everything else is infrastructure.
Based on Eric Evans: invest design effort where business complexity lives.

## Core Rules

### Ubiquitous Language

1. Use the same vocabulary in code, conversations, documentation, and UI. No translation layers.
2. If the domain expert says "Policy" — the class is `Policy`, not `Rule` or `Config`.
3. Reject technical jargon in the domain layer. No `Handler`, `Manager`, `Processor` in domain code.
4. When language evolves, rename in code immediately. Stale names are bugs.
5. Build a glossary per bounded context. Terms may mean different things in different contexts.

### Bounded Contexts

6. A bounded context is a semantic boundary where a term has one unambiguous meaning.
7. Each bounded context has its own model, its own codebase (or module), its own database.
8. Never share domain models across contexts. Duplication across contexts is acceptable.
9. Map relationships explicitly: Shared Kernel, Customer-Supplier, Conformist, Anti-Corruption Layer.
10. Keep contexts small. A context with 50+ entities is likely multiple contexts merged.

### Entities vs Value Objects

11. Entity: defined by identity, mutable over time. Two entities with same attributes but different IDs are different.
12. Value Object: defined by attributes, immutable. Two VOs with same attributes are interchangeable.
13. Default to Value Object. Only use Entity when identity matters across time.
14. Value Objects are always immutable. Operations return new instances.
15. Entities protect their invariants — no public setters. Mutation through domain methods.

### Aggregates

16. An aggregate is a consistency boundary. One transaction = one aggregate.
17. Access aggregates only through the aggregate root. Never reference internal entities directly.
18. Keep aggregates small. Prefer one entity per aggregate unless invariants demand grouping.
19. Reference other aggregates by ID only — never by object reference.
20. Eventual consistency between aggregates. Immediate consistency within.
21. If an operation spans multiple aggregates, use domain events or a saga.

### Domain Events

22. Domain events capture something that happened: `OrderPlaced`, `PaymentReceived`.
23. Name events in past tense. They are facts that already occurred.
24. Events are immutable. They carry the data needed to understand what happened.
25. Events enable decoupling between aggregates and between bounded contexts.
26. Publish events after the aggregate state change is committed — not before.

### Repositories

27. Repositories provide collection-like access to aggregates. One repository per aggregate root.
28. Repository interface lives in the domain layer. Implementation lives in infrastructure.
29. Repositories return whole aggregates — never partial entities or raw database rows.
30. Query methods use domain language: `findOverdueInvoices()`, not `findByStatusAndDateLessThan()`.
31. No business logic in repositories. They persist and retrieve — nothing more.

### Domain Services

32. Use domain services for operations that don't belong to a single entity or value object.
33. Domain services are stateless. They orchestrate domain objects.
34. Name domain services after the operation: `TransferService`, `PricingEngine`.

### Anti-Corruption Layer (ACL)

35. When integrating with legacy or external systems, never let their model leak into your domain.
36. Build a translation layer (ACL) that converts external concepts to your domain's language.
37. The ACL is an adapter: external DTO in, domain object out.
38. Place ACLs at bounded context boundaries and third-party integrations.

### Application Layer

39. Application services orchestrate use cases. They call domain objects but contain no business logic.
40. Application layer handles transactions, authorization, and infrastructure coordination.
41. One use case per application service method. Keep methods short.

## Implementation Guidelines

- Start with event storming: identify domain events, commands, aggregates before writing code.
- Layer structure: `domain/` (pure), `application/` (use cases), `infrastructure/` (adapters).
- Domain layer has ZERO framework dependencies. No ORM annotations, no HTTP concerns.
- Use factories for complex aggregate creation. Constructors for simple cases.
- Make invalid states unrepresentable through types: `EmailAddress` not `String`.
- Test domain logic without any infrastructure — it's pure business rules.

## Anti-Patterns

- **Anemic Domain Model**: entities with only getters/setters, logic in services. Put behavior on entities.
- **Big Ball of Mud**: no boundaries, everything references everything. Define contexts.
- **Smart UI**: business logic in controllers or UI components. Push to domain.
- **Leaking Abstractions**: ORM entities used as domain models. Separate persistence from domain.
- **Shared Kernel Sprawl**: too much shared between contexts. Minimize shared surface.
- **God Aggregate**: aggregate with 20 entities. Split by invariant boundary.
- **Repository as Query Engine**: complex queries in repositories. Use separate read models (CQRS).
- **Database-Driven Design**: starting with schema, then fitting domain to it. Start with behavior.

## Verification

- [ ] Domain layer has zero infrastructure dependencies (no ORM, no HTTP, no framework)
- [ ] Every entity protects its invariants — no public setters
- [ ] Aggregates are accessed only through their root
- [ ] Bounded context boundaries are explicitly defined and documented
- [ ] Ubiquitous language is consistent between code and domain expert conversations
- [ ] Value objects are immutable and compared by value
- [ ] Domain events are named in past tense and carry sufficient data
- [ ] Anti-corruption layers exist at every external integration
- [ ] Cross-aggregate references use IDs, not object references
- [ ] Domain logic is testable without infrastructure setup
