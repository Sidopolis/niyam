# Prisma ORM — Niyam Rules

## Core Principles

1. **Schema is the source of truth.** All database structure lives in `schema.prisma`. Never modify the DB directly.
2. **Type safety end-to-end.** Use generated types from `@prisma/client` — never cast or use `any`.
3. **Explicit over implicit.** Select only the fields you need. Include relations explicitly.
4. **Migrations are immutable.** Never edit a migration after it's been applied. Create a new one.
5. **Single PrismaClient instance.** One global client per process. Never instantiate per-request.

## File Structure & Organization

```
prisma/
  schema.prisma         # Data model, datasource, generators
  migrations/           # Generated migration SQL files
  seed.ts               # Database seeding script
src/
  lib/
    db.ts               # Singleton PrismaClient export
  services/             # Business logic using Prisma
```

- Use `prismaSchemaFolder` preview feature for large schemas split across files.
- Keep seed data realistic and idempotent — seeds should be re-runnable safely.
- Store the singleton client in a dedicated file with hot-reload guard for dev.

```typescript
// src/lib/db.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

## Schema Design

- Use `@id` with `@default(cuid())` or `@default(uuid())`. Avoid auto-increment for distributed systems.
- Name models in PascalCase singular: `User`, `Post`, `Comment`.
- Name fields in camelCase. Use `@map` for snake_case column names if needed.
- Always add `createdAt` and `updatedAt` to every model.
- Use enums for finite state fields. Define them in the schema, not as strings.
- Add `@@index` for fields frequently used in `where` or `orderBy` clauses.

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  role      Role     @default(USER)
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@index([email])
  @@map("users")
}

enum Role {
  USER
  ADMIN
}
```

## Relations

- Define both sides of a relation explicitly.
- Use `@relation(fields: [...], references: [...])` on the side that holds the foreign key.
- Name ambiguous relations: `@relation("AuthoredPosts")`, `@relation("LikedPosts")`.
- Prefer `onDelete: Cascade` for parent-owned children. Use `SetNull` for optional refs.
- For many-to-many, use implicit relations unless you need extra fields on the join.

## Queries

- Use `select` to pick specific fields. Avoid fetching entire objects when you need two fields.
- Use `include` for related data. Nest `include` for deep relations but be mindful of N+1.
- Use `findUniqueOrThrow` / `findFirstOrThrow` when the record must exist.
- Paginate with cursor-based pagination (`cursor` + `take` + `skip: 1`) for large datasets.

```typescript
const posts = await prisma.post.findMany({
  where: { authorId: userId, published: true },
  select: { id: true, title: true, createdAt: true },
  orderBy: { createdAt: 'desc' },
  take: 20,
  cursor: lastId ? { id: lastId } : undefined,
  skip: lastId ? 1 : 0,
});
```

## Transactions

- Use `prisma.$transaction([...])` for sequential operations that must all succeed.
- Use interactive transactions `prisma.$transaction(async (tx) => {...})` when logic depends on prior results.
- Set `timeout` and `maxWait` for interactive transactions to avoid long-running locks.
- Keep transactions short. Never put external API calls inside a transaction.

## Raw Queries

- Use `prisma.$queryRaw` for complex queries Prisma can't express (window functions, CTEs).
- Always use tagged template literals for parameterized queries — never string interpolation.
- Type raw query results explicitly with `prisma.$queryRaw<MyType[]>`.

```typescript
const results = await prisma.$queryRaw<{ id: string; rank: number }[]>`
  SELECT id, ts_rank(search_vector, to_tsquery(${query})) as rank
  FROM posts WHERE search_vector @@ to_tsquery(${query})
  ORDER BY rank DESC LIMIT ${limit}
`;
```

## Migrations

- Run `prisma migrate dev` locally to generate and apply migrations.
- Run `prisma migrate deploy` in CI/production — never `dev` in prod.
- Name migrations descriptively: `npx prisma migrate dev --name add_user_role_column`.
- Review generated SQL before committing. Prisma's choices aren't always optimal.
- For data migrations, create a separate script — don't mix DDL and DML in Prisma migrations.

## Seeding

- Define seeds in `prisma/seed.ts`. Register in `package.json` under `prisma.seed`.
- Make seeds idempotent with `upsert` or `createMany` with `skipDuplicates`.
- Use realistic data (faker/seed libraries). Never seed with `test1`, `test2`.

## Anti-Patterns (Never Do)

- Never instantiate `new PrismaClient()` per request — connection pool exhaustion.
- Never edit migration files after they've been applied.
- Never use `prisma db push` in production — it's for prototyping only.
- Never use `findFirst` without `orderBy` when you expect a specific record.
- Never use `@default(autoincrement())` for IDs exposed in URLs (enumeration attacks).
- Never store derived/computed data when a query-time computation suffices.
- Never skip `@updatedAt` — it costs nothing and aids debugging.

## Performance

- Add `@@index` for foreign keys and frequently filtered/sorted columns.
- Use `createMany` / `updateMany` for bulk operations instead of looping with `create`.
- Use `select` to reduce payload size — especially on list endpoints.
- Enable query logging in dev: `new PrismaClient({ log: ['query'] })`.
- Use connection pooling (PgBouncer, Prisma Accelerate) for serverless environments.

## Security

- Never expose raw Prisma errors to clients — they contain schema details.
- Validate and sanitize all inputs before passing to queries.
- Use row-level filtering in queries for multi-tenancy.
- Never trust client-provided IDs without authorization checks.
- Use `omit` (Prisma 5.13+) to exclude sensitive fields like password hashes.
