# SQL — Niyam Rules

## Purpose

Language-specific rules for SQL across PostgreSQL, MySQL, and SQLite. These cover query optimization, indexing strategy, join behavior, CTEs, window functions, transactions, and migration safety. Apply these when writing queries, designing schemas, or reviewing database code.

---

## Query Optimization

### Fundamentals
- `EXPLAIN ANALYZE` every query that runs in production. Reading the plan is non-negotiable before optimizing.
- Optimize for the common case. A query that runs 10,000 times/day matters more than one that runs monthly.
- `SELECT *` is forbidden in application code. Select only the columns you need — it affects index-only scans, memory, and network.
- Filter early. Push `WHERE` conditions as close to the data source as possible in complex queries.
- `LIMIT` doesn't prevent full scans if there's an `ORDER BY` without a supporting index.
- Avoid functions on indexed columns in `WHERE`: `WHERE YEAR(created_at) = 2024` can't use an index on `created_at`. Use range: `WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01'`.

### Common Query Anti-Patterns
- `SELECT DISTINCT` as a bandaid for bad joins — fix the join, don't deduplicate after.
- `OR` conditions that prevent index usage — rewrite as `UNION ALL` when each branch can use different indexes.
- Correlated subqueries that execute per row — rewrite as `JOIN` or `LATERAL JOIN`.
- `NOT IN (subquery)` with nullable columns — use `NOT EXISTS` instead (handles NULL correctly).
- `LIKE '%prefix'` — leading wildcard prevents index usage. Consider full-text search or trigram indexes.
- `COUNT(*)` on large tables without a filter — extremely expensive. Cache if needed frequently.

### Performance Patterns
```sql
-- Pagination: cursor-based instead of OFFSET (O(1) vs O(n))
SELECT * FROM orders
WHERE id > :last_seen_id
ORDER BY id ASC
LIMIT 20;

-- Existence check: EXISTS is faster than COUNT for "does it exist?"
SELECT EXISTS(SELECT 1 FROM users WHERE email = :email);

-- Batch operations: IN with reasonable batch size
SELECT * FROM products WHERE id = ANY(:ids);  -- PostgreSQL array parameter
```

---

## Indexing

### When to Index
- Columns in `WHERE`, `JOIN ON`, `ORDER BY`, and `GROUP BY` clauses of frequent queries.
- Foreign keys — always index them. Without an index, `DELETE` on the parent table locks and scans.
- Partial indexes for queries that filter on a specific condition: `CREATE INDEX idx ON orders(status) WHERE status = 'pending'`.
- Composite indexes: order columns by selectivity (most selective first) and include columns for covering indexes.

### When NOT to Index
- Tables under 1000 rows — sequential scan is likely faster than index lookup.
- Columns with very low cardinality (boolean, status with 3 values) — unless combined in a composite index.
- Write-heavy tables with rare reads — indexes slow down every INSERT/UPDATE/DELETE.
- Columns never used in query predicates or ordering.

### Index Maintenance
- Monitor unused indexes: `pg_stat_user_indexes.idx_scan = 0` means the index isn't helping.
- Monitor index bloat (PostgreSQL): `REINDEX` or `pg_repack` for heavily updated tables.
- Composite index `(a, b, c)` serves queries on `(a)`, `(a, b)`, and `(a, b, c)` — but NOT `(b)` or `(c)` alone.
- `INCLUDE` columns (PostgreSQL 11+) in indexes for covering index-only scans without affecting the B-tree structure.

---

## Joins

### Rules
- Explicit `JOIN` syntax always. Never comma-separated tables in `FROM`: `FROM a, b WHERE a.id = b.a_id`.
- `INNER JOIN` when both sides must exist. `LEFT JOIN` when the right side is optional.
- Join on indexed columns. A join on non-indexed columns triggers nested loop scans on large tables.
- Understand join algorithms: Nested Loop (small table + indexed), Hash Join (medium equality), Merge Join (large sorted).
- Don't join more than 5-6 tables in a single query. If needed, break into CTEs or subqueries for readability.
- `CROSS JOIN` must be intentional and commented. Accidental cross joins produce billions of rows.

### Patterns
```sql
-- LATERAL JOIN: per-row subquery execution (like a correlated subquery but optimizable)
SELECT u.id, u.name, recent.title
FROM users u
CROSS JOIN LATERAL (
  SELECT title FROM posts WHERE user_id = u.id ORDER BY created_at DESC LIMIT 3
) recent;

-- Self-join for comparisons within a table
SELECT a.id, b.id
FROM events a
JOIN events b ON a.user_id = b.user_id AND b.created_at > a.created_at
WHERE a.type = 'signup' AND b.type = 'purchase';
```

---

## CTEs (Common Table Expressions)

### When to Use
- Breaking complex queries into readable named steps.
- Recursive queries for hierarchical data (org charts, threaded comments, category trees).
- Referencing the same subquery multiple times (avoids repeated computation in some engines).

### Rules
- CTEs are optimization fences in PostgreSQL < 12. In PostgreSQL 12+, the planner can inline non-recursive CTEs.
- In MySQL 8.0+, CTEs are generally inlined by the optimizer.
- Use `MATERIALIZED` / `NOT MATERIALIZED` hints (PostgreSQL 12+) when you need to control CTE behavior.
- Recursive CTEs need a termination condition. Always include `LIMIT` or a `WHERE` clause that guarantees convergence.

```sql
-- Recursive: org chart traversal
WITH RECURSIVE org_tree AS (
  SELECT id, name, manager_id, 1 AS depth
  FROM employees
  WHERE manager_id IS NULL

  UNION ALL

  SELECT e.id, e.name, e.manager_id, t.depth + 1
  FROM employees e
  JOIN org_tree t ON e.manager_id = t.id
  WHERE t.depth < 10  -- Safety limit
)
SELECT * FROM org_tree ORDER BY depth, name;

-- Writeable CTE: insert and return in one statement
WITH new_order AS (
  INSERT INTO orders (user_id, total) VALUES (:user_id, :total)
  RETURNING id, created_at
)
INSERT INTO order_events (order_id, event, created_at)
SELECT id, 'created', created_at FROM new_order;
```

---

## Window Functions

### When to Use
- Rankings, running totals, moving averages, lead/lag comparisons.
- Any calculation that needs access to other rows without collapsing the result set (unlike `GROUP BY`).

### Rules
- `PARTITION BY` defines the "group" for the window. `ORDER BY` defines row ordering within the partition.
- Window functions execute AFTER `WHERE`, `GROUP BY`, and `HAVING`. You cannot filter on window function results in the same query level — wrap in a subquery.
- `ROW_NUMBER()` vs `RANK()` vs `DENSE_RANK()`: ROW_NUMBER is always unique; RANK has gaps on ties; DENSE_RANK has no gaps.
- Default frame: `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`. Be explicit about frames when using `SUM`, `AVG`, `COUNT` over windows.

```sql
-- Running total with explicit frame
SELECT
  date,
  amount,
  SUM(amount) OVER (ORDER BY date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total
FROM transactions;

-- Top N per group (common pattern)
SELECT * FROM (
  SELECT
    *,
    ROW_NUMBER() OVER (PARTITION BY department_id ORDER BY salary DESC) AS rn
  FROM employees
) ranked
WHERE rn <= 3;

-- Moving average
SELECT
  date,
  value,
  AVG(value) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS moving_avg_7d
FROM metrics;
```

---

## Transactions

### Rules
- Keep transactions short. Long transactions hold locks, increase contention, and risk deadlocks.
- Read-heavy operations: use `READ COMMITTED` (default in PostgreSQL) or explicit `REPEATABLE READ` when snapshot consistency matters.
- Wrap related writes in a single transaction. Partial writes are data corruption.
- Don't do network calls or external API calls inside a transaction. If the external call is slow, you're holding locks.
- Use `SELECT ... FOR UPDATE` when you read a row and need to update it based on the read value (prevents lost updates).
- Handle deadlocks: implement retry with backoff. Deadlocks are expected in concurrent systems.
- Use advisory locks for application-level coordination that doesn't map to row locks.

### Isolation Levels
- `READ COMMITTED` — default, see committed data as of each statement. Good enough for most cases.
- `REPEATABLE READ` — snapshot at transaction start. Use for reports, financial calculations.
- `SERIALIZABLE` — full isolation. Use for critical correctness (account balances, inventory). Has performance cost.

### Patterns
```sql
-- Upsert (INSERT or UPDATE) — atomic in PostgreSQL
INSERT INTO user_settings (user_id, key, value)
VALUES (:user_id, :key, :value)
ON CONFLICT (user_id, key)
DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Advisory lock for job processing
SELECT pg_try_advisory_lock(:job_id);
-- ... process job ...
SELECT pg_advisory_unlock(:job_id);
```

---

## Migrations

### Safety Rules
- Every migration must be reversible. Write both `up` and `down` (or document why down is impossible).
- Never rename a column directly in production. Add new → copy data → update code → drop old (multi-deploy).
- Never drop a column that running code references. Deploy code removal first, then migrate.
- Adding a `NOT NULL` column to a large table locks it. Add nullable first, backfill, then add constraint.
- Adding an index: use `CONCURRENTLY` (PostgreSQL) to avoid table locks. `CREATE INDEX CONCURRENTLY`.
- Test migrations against a copy of production data. Empty test databases hide problems.
- Migrations run in sequence. Never reorder or edit applied migrations. Only append.

### Patterns
```sql
-- Safe column addition (multi-step)
-- Step 1: Add nullable column
ALTER TABLE users ADD COLUMN display_name TEXT;

-- Step 2: Backfill (in batches to avoid long locks)
UPDATE users SET display_name = name WHERE display_name IS NULL AND id BETWEEN :start AND :end;

-- Step 3: Add NOT NULL constraint (after backfill complete)
ALTER TABLE users ALTER COLUMN display_name SET NOT NULL;

-- Step 4: (optional) Add default for future inserts
ALTER TABLE users ALTER COLUMN display_name SET DEFAULT '';
```

### Migration Anti-Patterns
- Migrations that take > 30 seconds on production data — break into batches.
- Data migrations mixed with schema migrations — separate them. Schema is fast and lockable; data is slow.
- Migrations that depend on application code (model classes, constants) — use raw SQL.
- Missing index migrations after adding foreign keys.
- Dropping tables/columns without verifying they're unused in all deployed code versions.

---

## Naming Conventions

- Tables: plural, snake_case (`users`, `order_items`, `payment_methods`).
- Columns: snake_case, descriptive (`created_at`, `is_active`, `total_amount_cents`).
- Indexes: `idx_{table}_{columns}` (`idx_users_email`, `idx_orders_user_id_status`).
- Constraints: `{table}_{type}_{columns}` (`users_pk_id`, `orders_fk_user_id`, `users_uq_email`).
- Store monetary values as integers (cents) to avoid floating point issues.
- Use `timestamptz` (timestamp with time zone) not `timestamp` for all time values.
