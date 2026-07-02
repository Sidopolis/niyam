# Drizzle ORM — Niyam Rules

## Core Principles

1. **SQL-first, type-safe.** Drizzle generates types from your schema — queries feel like SQL but with full TypeScript safety.
2. **Zero overhead.** No runtime abstraction layer. Drizzle compiles to raw SQL with no hidden magic.
3. **Schema is code.** Define tables, relations, and indexes in TypeScript. The schema IS the source of truth.
4. **Explicit over magic.** Every join, select, and where clause is visible. No lazy loading, no implicit behavior.
5. **Migrations from schema.** Generate SQL migrations from schema diffs. Review before applying.

## File Structure & Organization

```
src/
  db/
    index.ts              # Database connection + drizzle instance
    schema/
      index.ts            # Re-export all tables and relations
      users.ts            # User table + relations
      posts.ts            # Post table + relations
    migrate.ts            # Migration runner script
drizzle/
  migrations/             # Generated SQL migration files
drizzle.config.ts         # Drizzle Kit configuration
```

- One file per table in `schema/`. Export all from `schema/index.ts`.
- Keep the drizzle instance in a single file with connection pooling.

## Schema Definition

- Use `pgTable`, `mysqlTable`, or `sqliteTable` per your database.
- Name tables in snake_case plural: `users`, `blog_posts`, `order_items`.
- Use `$type<>()` for custom TypeScript types on columns when needed.
- Always define `createdAt` and `updatedAt` columns.
- Add indexes explicitly with `.index()` or composite indexes in the table definition.
- Use `.$defaultFn()` for generated defaults (cuid, uuid, timestamps).

```typescript
import { pgTable, text, timestamp, varchar, index } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  role: text('role', { enum: ['user', 'admin'] }).default('user').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [index('users_email_idx').on(table.email)]);
```

## Relations

- Define relations separately from tables using `relations()`.
- Relations are for the query API only — they don't create foreign keys in SQL.
- Use `references` on columns for actual foreign key constraints.
- Name relation fields clearly: `author`, `posts`, `comments` — not `user1`, `rel2`.

```typescript
import { relations } from 'drizzle-orm';

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, { fields: [posts.authorId], references: [users.id] }),
}));
```

## Queries

- Use the relational query API (`db.query.*`) for reads with relations.
- Use the SQL-like API (`db.select().from()`) for complex queries, aggregations, and joins.
- Always specify `columns` in relational queries to select only what you need.
- Use `where`, `orderBy`, `limit`, `offset` — they map directly to SQL.

```typescript
// Relational query
const user = await db.query.users.findFirst({
  where: eq(users.id, userId),
  columns: { id: true, name: true, email: true },
  with: { posts: { columns: { id: true, title: true }, limit: 10 } },
});

// SQL-like query
const results = await db.select({ id: posts.id, title: posts.title })
  .from(posts)
  .leftJoin(users, eq(posts.authorId, users.id))
  .where(eq(posts.published, true))
  .orderBy(desc(posts.createdAt))
  .limit(20);
```

## Migrations

- Generate migrations: `npx drizzle-kit generate`.
- Apply migrations: `npx drizzle-kit migrate` or programmatic `migrate()` in production.
- Always review generated SQL before committing.
- Never edit migration files after they've been applied to shared databases.
- Use `drizzle-kit push` only for prototyping — never in production.

## Type Safety

- Drizzle infers types from schema — use `typeof users.$inferSelect` and `typeof users.$inferInsert`.
- Export inferred types for use in services and API layers.
- Never use `any` or cast Drizzle results — if types don't match, fix the query.

```typescript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

## Transactions

- Use `db.transaction(async (tx) => {...})` for operations that must be atomic.
- Pass `tx` to all queries within the transaction — never use `db` inside a transaction block.
- Keep transactions short. No external API calls inside transactions.
- Use `tx.rollback()` explicitly when business logic requires abort.

```typescript
await db.transaction(async (tx) => {
  const [order] = await tx.insert(orders).values({ userId, total }).returning();
  await tx.insert(orderItems).values(items.map(i => ({ ...i, orderId: order.id })));
});
```

## Anti-Patterns (Never Do)

- Never mix `db` and `tx` in the same transaction — always use the transaction client.
- Never use `drizzle-kit push` in production or CI. Never edit applied migration files.
- Never use `any` to silence Drizzle type errors — fix the schema or query.
- Never fetch all columns when you need a subset — use `columns` or explicit `select`.
- Never use raw string concatenation for dynamic queries — use Drizzle's `sql` template.

## Performance

- Add indexes for all foreign keys and frequently filtered/sorted columns.
- Use `prepare()` for queries executed repeatedly — they skip the query builder overhead.
- Use `db.insert().values([...])` for bulk inserts — not loops.
- Use `.returning()` to avoid a separate SELECT after INSERT/UPDATE.
- Limit result sets. Never fetch unbounded data in production.

## Security

- Never interpolate user input into raw SQL — use `sql.placeholder()` or parameterized values.
- Validate all inputs before passing to queries.
- Use row-level filtering in queries for multi-tenancy.
- Never expose raw database errors to clients — wrap and sanitize.
